<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Fleet;
use App\Models\VoyageWaypoint;

class AisStreamListenCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ais:listen {--dummy : Run in dummy simulation mode with generated AIS telemetry}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Connects to AISStream.io WebSocket or runs dummy simulation to update live vessel coordinates';

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
     * Execute the console command.
     */
    public function handle()
    {
        $isDummy = $this->option('dummy');

        if ($isDummy) {
            $this->info("Starting Continuous AIS Simulation Mode for PT. ABB Fleets...");

            $fleets = Fleet::all();
            if ($fleets->isEmpty()) {
                $this->error("No fleets found in database to simulate AIS data for.");
                return 1;
            }

            // Initialize water-anchored positions for each fleet
            $positions = [];
            foreach ($fleets as $index => $fleet) {
                $anchors = $this->getAreaWaterAnchors($fleet->operational_area);
                $anchor = $anchors[$index % count($anchors)];

                // Small random offset strictly inside water (approx +- 0.15 to 0.35 degrees)
                $offsetLat = (rand(-25, 25) / 100.0);
                $offsetLng = (rand(-25, 25) / 100.0);

                $positions[$fleet->id] = [
                    'anchor_lat' => $anchor['lat'],
                    'anchor_lng' => $anchor['lng'],
                    'lat' => round($anchor['lat'] + $offsetLat, 6),
                    'lng' => round($anchor['lng'] + $offsetLng, 6),
                    'sog' => rand(8, 16),
                    'cog' => rand(0, 359),
                    'port_name' => $anchor['name'],
                    'country' => $anchor['country']
                ];
            }

            while (true) {
                foreach ($fleets as $fleet) {
                    $pos = &$positions[$fleet->id];

                    // Simulate realistic marine heading & drift
                    $rad = deg2rad($pos['cog']);
                    $step = ($pos['sog'] / 10.0) * 0.0003;
                    $latDelta = (cos($rad) * $step) + (rand(-5, 5) / 10000.0);
                    $lngDelta = (sin($rad) * $step) + (rand(-5, 5) / 10000.0);

                    $newLat = $pos['lat'] + $latDelta;
                    $newLng = $pos['lng'] + $lngDelta;

                    // Keep ship within ~0.65 degrees (~70km) radius of its sea anchor so it stays strictly in water
                    $distFromAnchor = sqrt(pow($newLat - $pos['anchor_lat'], 2) + pow($newLng - $pos['anchor_lng'], 2));
                    if ($distFromAnchor > 0.65) {
                        $targetAngle = rad2deg(atan2($pos['anchor_lng'] - $newLng, $pos['anchor_lat'] - $newLat));
                        $pos['cog'] = (int) (($targetAngle + 360) % 360);
                        $newLat = $pos['lat'] + (cos(deg2rad($pos['cog'])) * $step);
                        $newLng = $pos['lng'] + (sin(deg2rad($pos['cog'])) * $step);
                    }

                    $pos['lat'] = round($newLat, 6);
                    $pos['lng'] = round($newLng, 6);
                    $pos['sog'] = max(4, min(22, $pos['sog'] + rand(-1, 1)));
                    $pos['cog'] = ($pos['cog'] + rand(-4, 4)) % 360;
                    if ($pos['cog'] < 0) $pos['cog'] += 360;

                    VoyageWaypoint::updateOrCreate(
                        [
                            'fleet_id' => $fleet->id,
                            'sequence' => 1
                        ],
                        [
                            'waypoint_type' => 'transit',
                            'port_name' => "{$pos['port_name']} ({$pos['sog']} kts)",
                            'country' => $pos['country'],
                            'latitude' => $pos['lat'],
                            'longitude' => $pos['lng'],
                            'notes' => "SOG: {$pos['sog']} kts | COG: {$pos['cog']}° | Area: {$fleet->operational_area} | Source: Simulated AISStream",
                            'updated_at' => now(),
                        ]
                    );

                    $this->line("✔ [Simulated Broadcast] {$fleet->ship_name} [{$fleet->operational_area}] -> Lat: {$pos['lat']}, Lng: {$pos['lng']} | Speed: {$pos['sog']} kts");
                }

                sleep(4);
            }
            return 0;
        }

        $this->info("Launching AISStream.io WebSocket background listener...");
        $scriptPath = base_path('scripts/ais_listener.js');

        if (!file_exists($scriptPath)) {
            $this->error("Script not found at {$scriptPath}");
            return 1;
        }

        passthru("node {$scriptPath}");
        return 0;
    }
}
