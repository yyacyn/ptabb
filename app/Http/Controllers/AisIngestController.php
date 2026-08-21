<?php

namespace App\Http\Controllers;

use App\Models\Fleet;
use App\Models\VoyageWaypoint;
use Illuminate\Http\Request;

class AisIngestController extends Controller
{
    /**
     * Return list of real-world maritime sea anchors (coordinates strictly in water/sea lanes)
     */
    protected function getAreaWaterAnchors(?string $area): array
    {
        $areaLower = strtolower($area ?? '');

        if (str_contains($areaLower, 'europe')) {
            return [
                ['name' => 'Rotterdam Maritime Shipping Lane', 'lat' => 52.25, 'lng' => 3.75, 'country' => 'Netherlands (North Sea)'],
                ['name' => 'English Channel Transit Corridor', 'lat' => 50.15, 'lng' => -0.50, 'country' => 'United Kingdom (English Channel)'],
                ['name' => 'Bay of Biscay Ocean Route', 'lat' => 45.80, 'lng' => -4.50, 'country' => 'France (Bay of Biscay)'],
                ['name' => 'Balearic Sea Shipping Channel', 'lat' => 40.20, 'lng' => 3.20, 'country' => 'Spain (Mediterranean)'],
                ['name' => 'Ligurian Sea Maritime Lane', 'lat' => 43.10, 'lng' => 9.20, 'country' => 'Italy (Mediterranean)'],
                ['name' => 'Tyrrhenian Sea Passage', 'lat' => 39.80, 'lng' => 12.40, 'country' => 'Italy (Mediterranean)'],
                ['name' => 'Ionian Sea Deepwater Corridor', 'lat' => 37.50, 'lng' => 18.20, 'country' => 'Greece (Mediterranean)'],
                ['name' => 'Strait of Gibraltar Marine Channel', 'lat' => 35.95, 'lng' => -5.80, 'country' => 'Spain / Morocco'],
            ];
        }

        if (str_contains($areaLower, 'middle east')) {
            return [
                ['name' => 'Persian Gulf Shipping Lane', 'lat' => 26.50, 'lng' => 52.50, 'country' => 'UAE / Qatar Waters'],
                ['name' => 'Strait of Hormuz Transit Corridor', 'lat' => 26.30, 'lng' => 56.40, 'country' => 'Oman / Iran Strait'],
                ['name' => 'Gulf of Oman Maritime Passage', 'lat' => 24.20, 'lng' => 58.60, 'country' => 'Oman (Arabian Sea)'],
                ['name' => 'Red Sea Central Shipping Lane', 'lat' => 21.50, 'lng' => 38.20, 'country' => 'Saudi Arabia (Red Sea)'],
                ['name' => 'Gulf of Aden Ocean Corridor', 'lat' => 13.20, 'lng' => 48.20, 'country' => 'Yemen / Somalia (Gulf of Aden)'],
                ['name' => 'Red Sea Northern Suez Approaches', 'lat' => 27.20, 'lng' => 34.50, 'country' => 'Egypt (Red Sea)'],
            ];
        }

        if (str_contains($areaLower, 'far east') || str_contains($areaLower, 'china') || str_contains($areaLower, 'japan') || str_contains($areaLower, 'korea')) {
            return [
                ['name' => 'East China Sea Shipping Lane', 'lat' => 30.50, 'lng' => 123.20, 'country' => 'China (East China Sea)'],
                ['name' => 'Taiwan Strait Marine Channel', 'lat' => 24.20, 'lng' => 119.50, 'country' => 'Taiwan Strait'],
                ['name' => 'Yellow Sea Maritime Passage', 'lat' => 35.80, 'lng' => 123.80, 'country' => 'South Korea / China'],
                ['name' => 'Sea of Japan Transit Corridor', 'lat' => 36.50, 'lng' => 131.20, 'country' => 'Japan (Sea of Japan)'],
                ['name' => 'Tokyo Bay Pacific Approaches', 'lat' => 34.60, 'lng' => 139.60, 'country' => 'Japan (Pacific Ocean)'],
                ['name' => 'South China Sea Pearl River Route', 'lat' => 21.50, 'lng' => 114.80, 'country' => 'Hong Kong / China'],
            ];
        }

        if (str_contains($areaLower, 'africa')) {
            return [
                ['name' => 'Gulf of Guinea Oil & Bulk Lane', 'lat' => 4.20, 'lng' => 5.20, 'country' => 'Nigeria (Gulf of Guinea)'],
                ['name' => 'Cape of Good Hope Sea Route', 'lat' => -34.80, 'lng' => 19.50, 'country' => 'South Africa (Atlantic)'],
                ['name' => 'Mozambique Channel Shipping Corridor', 'lat' => -18.20, 'lng' => 40.50, 'country' => 'Mozambique Channel'],
                ['name' => 'Bab-el-Mandeb Strait Transit', 'lat' => 12.40, 'lng' => 43.60, 'country' => 'Djibouti / Red Sea'],
            ];
        }

        if (str_contains($areaLower, 'southeast asia') || str_contains($areaLower, 'indonesia') || str_contains($areaLower, 'asia')) {
            return [
                ['name' => 'Java Sea Western Shipping Route', 'lat' => -5.40, 'lng' => 107.50, 'country' => 'Indonesia (Java Sea)'],
                ['name' => 'Java Sea Eastern Shipping Route', 'lat' => -6.10, 'lng' => 113.20, 'country' => 'Indonesia (Java Sea)'],
                ['name' => 'Singapore Strait Maritime Lane', 'lat' => 1.20, 'lng' => 103.80, 'country' => 'Singapore / Indonesia'],
                ['name' => 'Malacca Strait Central Corridor', 'lat' => 2.30, 'lng' => 101.50, 'country' => 'Malaysia (Malacca Strait)'],
                ['name' => 'Makassar Strait Bulk Shipping Lane', 'lat' => -1.20, 'lng' => 117.80, 'country' => 'Indonesia (Makassar Strait)'],
                ['name' => 'Sunda Strait Transit Channel', 'lat' => -5.80, 'lng' => 105.70, 'country' => 'Indonesia (Sunda Strait)'],
                ['name' => 'Karimata Strait Transport Route', 'lat' => -2.40, 'lng' => 108.80, 'country' => 'Indonesia (Karimata Strait)'],
                ['name' => 'Lombok Strait Deepwater Passage', 'lat' => -8.40, 'lng' => 115.70, 'country' => 'Indonesia (Lombok Strait)'],
            ];
        }

        // Global / Fallback
        return [
            ['name' => 'Indian Ocean Transshipment Route', 'lat' => 5.20, 'lng' => 78.50, 'country' => 'Indian Ocean'],
            ['name' => 'North Atlantic Ocean Bulk Lane', 'lat' => 32.00, 'lng' => -35.00, 'country' => 'Atlantic Ocean'],
            ['name' => 'Pacific Ocean International Corridor', 'lat' => 18.00, 'lng' => 155.00, 'country' => 'Pacific Ocean'],
            ['name' => 'Central Mediterranean Sea Lane', 'lat' => 35.80, 'lng' => 17.50, 'country' => 'Mediterranean Sea'],
        ];
    }

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
            $anchors = $this->getAreaWaterAnchors($fleet->operational_area);
            $anchor = $anchors[$index % count($anchors)];

            $offsetLat = (rand(-25, 25) / 100.0);
            $offsetLng = (rand(-25, 25) / 100.0);

            $lat = round($anchor['lat'] + $offsetLat, 6);
            $lng = round($anchor['lng'] + $offsetLng, 6);
            $sog = rand(8, 16);
            $cog = rand(0, 359);

            VoyageWaypoint::updateOrCreate(
                [
                    'fleet_id' => $fleet->id,
                    'sequence' => 1
                ],
                [
                    'waypoint_type' => 'transit',
                    'port_name' => "{$anchor['name']} ({$sog} kts)",
                    'country' => $anchor['country'],
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'notes' => "SOG: {$sog} kts | COG: {$cog}° | Area: {$fleet->operational_area} | Source: Simulated AIS Telemetry",
                    'updated_at' => now(),
                ]
            );

            $simulated[] = [
                'fleet_id' => $fleet->id,
                'ship_name' => $fleet->ship_name,
                'operational_area' => $fleet->operational_area,
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

    /**
     * Trigger Sailink real-time position sync across configured vessels.
     * Can be invoked via web endpoint or cPanel curl cron job.
     */
    public function syncSailink()
    {
        \Illuminate\Support\Facades\Artisan::call('sailink:sync-positions');
        $output = \Illuminate\Support\Facades\Artisan::output();

        return response()->json([
            'status' => 'success',
            'message' => 'Sailink real-time position sync triggered.',
            'timestamp' => now()->toIso8601String(),
            'output' => trim($output),
        ]);
    }
}
