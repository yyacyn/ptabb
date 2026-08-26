<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Fleet;
use App\Models\VoyageWaypoint;
use App\Services\SailinkApiService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SailinkSyncPositionsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sailink:sync-positions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync real-time vessel telemetry and coordinates from Sailink API for configured fleet IP addresses';

    /**
     * Execute the console command.
     */
    public function handle(SailinkApiService $sailinkService)
    {
        $this->info("Starting Sailink Real-Time Vessel Position Sync...");

        // 1. Delete legacy/stale waypoint data from August 24th and older
        $deletedOld = VoyageWaypoint::where('created_at', '<=', '2026-08-24 23:59:59')->delete();
        if ($deletedOld > 0) {
            $this->info("Cleaned up {$deletedOld} old waypoint log records (24th August and older).");
        }

        $fleets = Fleet::whereNotNull('ip_address')
            ->where('ip_address', '!=', '')
            ->get();

        if ($fleets->isEmpty()) {
            $this->warn("No fleets found with a configured IP address.");
            return Command::SUCCESS;
        }

        $count = 0;
        foreach ($fleets as $fleet) {
            $this->info("Fetching telemetry for vessel [{$fleet->ship_name}] (IP: {$fleet->ip_address})...");

            $position = $sailinkService->getVesselPosition($fleet->ip_address);

            if (!$position || empty($position['latitude']) || empty($position['longitude'])) {
                $reason = $sailinkService->getLastError() ?: 'Unknown error';
                $this->error("Failed to fetch coordinates for vessel [{$fleet->ship_name}] (IP: {$fleet->ip_address}). Reason: {$reason}");
                continue;
            }

            // 1. Cache the live telemetry (lifetime 5 minutes)
            Cache::put('sailink_telemetry_' . $fleet->id, $position, now()->addMinutes(5));

            // 2. Store or update VoyageWaypoint in DB at 1-hour intervals
            $lastWp = VoyageWaypoint::where('fleet_id', $fleet->id)
                ->orderBy('created_at', 'desc')
                ->first();

            $statusLabel = $position['is_down'] ? " [SAILINK DOWN - Fallback via {$position['provider']}]" : " [UP]";
            $notes = "Live GPS{$statusLabel} - SOG: {$position['speed_knots']} kts, COG: {$position['heading']}°";
            if (!empty($position['weather']['weather'])) {
                $notes .= " | Weather: {$position['weather']['weather']}, {$position['weather']['temperature']}";
            }

            // Create a new waypoint if no waypoint exists OR if last waypoint is >= 60 minutes old
            if (!$lastWp || $lastWp->created_at->diffInMinutes(now()) >= 60) {
                $maxSeq = VoyageWaypoint::where('fleet_id', $fleet->id)->max('sequence') ?? 0;
                VoyageWaypoint::create([
                    'fleet_id' => $fleet->id,
                    'sequence' => $maxSeq + 1,
                    'port_name' => 'Sailink GPS Ping #' . ($maxSeq + 1),
                    'latitude' => $position['latitude'],
                    'longitude' => $position['longitude'],
                    'waypoint_type' => 'transit',
                    'notes' => $notes,
                ]);
            } else {
                // Update the current active position ping
                $lastWp->update([
                    'latitude' => $position['latitude'],
                    'longitude' => $position['longitude'],
                    'notes' => $notes,
                ]);
            }

            // 3. Limit logged route to max 480 items per vessel, auto-deleting the oldest if exceeded
            $idsToKeep = VoyageWaypoint::where('fleet_id', $fleet->id)
                ->orderBy('created_at', 'desc')
                ->take(480)
                ->pluck('id');

            $prunedCount = VoyageWaypoint::where('fleet_id', $fleet->id)
                ->whereNotIn('id', $idsToKeep)
                ->delete();

            if ($prunedCount > 0) {
                $this->info("-> Pruned {$prunedCount} old route ping(s) for [{$fleet->ship_name}] (keeping max 480).");
            }

            $count++;
            $statusText = $position['is_down'] ? "<fg=red>SAILINK DOWN (Using {$position['provider']})</>" : "<fg=green>UP ({$position['provider']})</>";
            $this->info("-> Synced [{$fleet->ship_name}] Status: {$statusText} | Lat {$position['latitude']}, Lon {$position['longitude']}, Speed: {$position['speed_knots']} kts, Heading: {$position['heading']}°");
        }

        $this->info("Sailink Position Sync finished successfully. Updated {$count} vessel(s).");
        return Command::SUCCESS;
    }
}
