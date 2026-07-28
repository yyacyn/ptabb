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

            // Initialize base positions around Indonesia (Jakarta, Surabaya, Makassar, Balikpapan)
            $positions = [];
            foreach ($fleets as $fleet) {
                $positions[$fleet->id] = [
                    'lat' => -6.12 + (rand(-40, 40) / 10), // Base latitude
                    'lng' => 106.84 + (rand(-100, 100) / 10), // Base longitude (wider spread across Indonesia)
                    'sog' => rand(8, 16),
                    'cog' => rand(0, 360)
                ];
            }

            while (true) {
                foreach ($fleets as $fleet) {
                    $pos = &$positions[$fleet->id];
                    
                    // Slightly modify position to simulate movement (roughly based on speed/heading)
                    // Very crude approximation: 1 knot = ~0.0003 degrees per hour, we'll do random drift for visual effect
                    $pos['lat'] += (rand(-10, 10) / 1000); 
                    $pos['lng'] += (rand(-10, 10) / 1000);
                    $pos['sog'] = max(0, min(25, $pos['sog'] + rand(-1, 1))); // Speed drifts slightly
                    $pos['cog'] = ($pos['cog'] + rand(-5, 5)) % 360; // Heading drifts slightly
                    if ($pos['cog'] < 0) $pos['cog'] += 360;

                    VoyageWaypoint::updateOrCreate(
                        [
                            'fleet_id' => $fleet->id,
                            'sequence' => 1
                        ],
                        [
                            'waypoint_type' => 'transit',
                            'port_name' => "Live Position ({$pos['sog']} kts)",
                            'country' => 'Indonesia',
                            'latitude' => $pos['lat'],
                            'longitude' => $pos['lng'],
                            'notes' => "SOG: {$pos['sog']} kts | COG: {$pos['cog']}° | Source: Simulated AISStream",
                            'updated_at' => now(),
                        ]
                    );

                    $this->line("✔ [Simulated Broadcast] {$fleet->ship_name} -> Lat: {$pos['lat']}, Lng: {$pos['lng']} | Speed: {$pos['sog']} kts");
                }

                // Wait 4 seconds before the next "broadcast" tick
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
