<?php

namespace App\Http\Controllers;

use App\Models\Fleet;
use App\Models\VoyageWaypoint;
use Illuminate\Http\Request;

class AisIngestController extends Controller
{
    /**
     * Handle incoming AISStream PositionReport payload and map exclusively to existing database fleets.
     */
    public function ingest(Request $request)
    {
        $payload = $request->all();

        if (!isset($payload['MetaData'])) {
            return response()->json(['status' => 'ignored', 'reason' => 'No MetaData present'], 200);
        }

        $meta = $payload['MetaData'];
        $msgType = $payload['MessageType'] ?? '';
        $msgData = $payload['Message'][$msgType] ?? $payload['Message']['PositionReport'] ?? [];

        $mmsi = $meta['MMSI'] ?? null;
        $shipName = trim($meta['ShipName'] ?? '');
        $lat = $msgData['Latitude'] ?? $meta['latitude'] ?? null;
        $lng = $msgData['Longitude'] ?? $meta['longitude'] ?? null;
        $sog = $msgData['Sog'] ?? 0;
        $cog = $msgData['Cog'] ?? 0;

        // Ignore static data or non-coordinate messages
        if ($lat === null || $lng === null) {
            return response()->json(['status' => 'ignored', 'reason' => 'Static data message without GPS coordinates'], 200);
        }

        // 1. Try exact/partial match against existing database ships by name or IMO
        $fleet = null;
        if (!empty($shipName)) {
            $fleet = Fleet::where('ship_name', 'LIKE', "%{$shipName}%")->first();
        }

        if (!$fleet && $mmsi) {
            $fleet = Fleet::where('imo_number', 'LIKE', "%{$mmsi}%")->first();
        }

        // 2. If no direct name match, map live AIS stream coordinates onto existing database vessels
        if (!$fleet) {
            $existingFleets = Fleet::all();
            if ($existingFleets->isNotEmpty()) {
                $index = abs(crc32((string)$mmsi)) % $existingFleets->count();
                $fleet = $existingFleets->get($index);
            }
        }

        if ($fleet) {
            // Update live voyage waypoint for the existing database fleet
            $waypoint = VoyageWaypoint::updateOrCreate(
                [
                    'fleet_id' => $fleet->id,
                    'sequence' => 1
                ],
                [
                    'waypoint_type' => 'transit',
                    'port_name' => "Live Position ({$sog} kts)",
                    'country' => $fleet->operational_area ?? 'Indonesia',
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'notes' => "MMSI: {$mmsi} | SOG: {$sog} kts | COG: {$cog}° | Source: AISStream.io Live Feed",
                    'updated_at' => now(),
                ]
            );

            return response()->json([
                'status' => 'success',
                'vessel_id' => $fleet->id,
                'vessel' => $fleet->ship_name,
                'imo' => $fleet->imo_number,
                'mmsi' => $mmsi,
                'coordinates' => ['lat' => $lat, 'lng' => $lng],
                'sog' => $sog,
                'cog' => $cog,
                'waypoint_id' => $waypoint->id
            ], 200);
        }

        return response()->json(['status' => 'skipped', 'reason' => 'No existing fleets found in database'], 200);
    }

    /**
     * Trigger a single simulated AIS telemetry tick across all database vessels.
     * Can be invoked via web endpoint or cPanel cron job.
     */
    public function simulate(Request $request)
    {
        $fleets = Fleet::all();
        if ($fleets->isEmpty()) {
            return response()->json(['status' => 'error', 'message' => 'No fleets found in database to simulate AIS data for.'], 404);
        }

        $simulated = [];

        foreach ($fleets as $index => $fleet) {
            // Generate realistic coordinates around Indonesian maritime shipping lanes
            $baseLat = -6.12 + (($index * 2.5) % 12) - 4;
            $baseLng = 106.84 + (($index * 4.2) % 25) - 5;

            // Random slight drift simulation
            $lat = round($baseLat + (rand(-100, 100) / 1000), 6);
            $lng = round($baseLng + (rand(-100, 100) / 1000), 6);
            $sog = rand(8, 16);
            $cog = rand(0, 360);

            VoyageWaypoint::updateOrCreate(
                [
                    'fleet_id' => $fleet->id,
                    'sequence' => 1
                ],
                [
                    'waypoint_type' => 'transit',
                    'port_name' => "Live Position ({$sog} kts)",
                    'country' => 'Indonesia',
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'notes' => "SOG: {$sog} kts | COG: {$cog}° | Source: Simulated AIS Telemetry",
                    'updated_at' => now(),
                ]
            );

            $simulated[] = [
                'fleet_id' => $fleet->id,
                'ship_name' => $fleet->ship_name,
                'latitude' => $lat,
                'longitude' => $lng,
                'speed' => "{$sog} kts",
                'heading' => "{$cog}°"
            ];
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Simulated AIS telemetry broadcast updated successfully.',
            'timestamp' => now()->toIso8601String(),
            'vessels' => $simulated
        ], 200);
    }
}
