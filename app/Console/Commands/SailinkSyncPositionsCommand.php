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
                $this->error("Failed to fetch coordinates for vessel [{$fleet->ship_name}] (IP: {$fleet->ip_address}).");
                continue;
            }

            // 1. Cache the live telemetry (lifetime 5 minutes)
            Cache::put('sailink_telemetry_' . $fleet->id, $position, now()->addMinutes(5));

            // 2. Update sequence 1 VoyageWaypoint in DB
            $waypoint = VoyageWaypoint::where('fleet_id', $fleet->id)
                ->where('sequence', 1)
                ->first();

            $notes = "Live GPS (Sailink Provider: {$position['provider']}) - SOG: {$position['speed_knots']} kts, COG: {$position['heading']}°";
            if (!empty($position['weather']['weather'])) {
                $notes .= " | Weather: {$position['weather']['weather']}, {$position['weather']['temperature']}";
            }

            if ($waypoint) {
                $waypoint->update([
                    'latitude' => $position['latitude'],
                    'longitude' => $position['longitude'],
                    'notes' => $notes,
                ]);
            } else {
                VoyageWaypoint::create([
                    'fleet_id' => $fleet->id,
                    'sequence' => 1,
                    'port_name' => 'Current Live Position',
                    'latitude' => $position['latitude'],
                    'longitude' => $position['longitude'],
                    'waypoint_type' => 'transit',
                    'notes' => $notes,
                ]);
            }

            $count++;
            $this->info("-> Synced [{$fleet->ship_name}]: Lat {$position['latitude']}, Lon {$position['longitude']}, Speed: {$position['speed_knots']} kts, Heading: {$position['heading']}°");
        }

        $this->info("Sailink Position Sync finished successfully. Updated {$count} vessel(s).");
        return Command::SUCCESS;
    }
}
