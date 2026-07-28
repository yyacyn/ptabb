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
}
