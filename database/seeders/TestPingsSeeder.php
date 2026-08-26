<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VoyageWaypoint;
use DB;

class TestPingsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('voyage_waypoints')->truncate();

        for ($i = 1; $i <= 7; $i++) {
            VoyageWaypoint::create([
                'fleet_id' => 33,
                'sequence' => $i,
                'port_name' => 'Sailink GPS Ping #' . $i,
                'latitude' => 22.068100 + ($i * 0.05),
                'longitude' => 116.030502 + ($i * 0.08),
                'waypoint_type' => 'transit',
                'notes' => 'Live GPS [UP] - SOG: ' . (10 + $i) . ' kts, COG: 84° | Weather: Clear, 29°C',
                'created_at' => now()->subHours(8 - $i),
            ]);
        }
    }
}
