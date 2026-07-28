<?php

namespace App\Http\Controllers;

use App\Models\VoyageWaypoint;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VoyageWaypointsController extends Controller
{
    public function index(Request $request)
    {
        $allWaypointsGrouped = VoyageWaypoint::orderBy('sequence', 'asc')->get()->groupBy('fleet_id');

        $voyage_waypoints = \App\Models\Fleet::all()->map(function ($fleet) use ($allWaypointsGrouped) {
            $waypoints = $allWaypointsGrouped->get($fleet->id, collect());
            
            // Find live position (sequence 1 or first transit)
            $liveWp = $waypoints->firstWhere('sequence', 1) ?? $waypoints->first();

            $speed = '0.0 knots';
            $cog = 0;
            if ($liveWp) {
                if (preg_match('/SOG:\s*([0-9.]+)\s*kts/', $liveWp->notes, $matches)) {
                    $speed = $matches[1] . ' knots';
                }
                if (preg_match('/COG:\s*([0-9.]+)/', $liveWp->notes, $cogMatches)) {
                    $cog = (float) $cogMatches[1];
                }
            }

            $routePoints = $waypoints->map(function ($w) {
                return [
                    'id' => $w->id,
                    'name' => $w->port_name ?: ('Waypoint ' . $w->sequence),
                    'lat' => (float) $w->latitude,
                    'lng' => (float) $w->longitude,
                    'type' => $w->waypoint_type,
                    'sequence' => $w->sequence,
                ];
            })->values()->toArray();

            return [
                'id' => $fleet->id,
                'vessel' => $fleet->ship_name,
                'origin' => $fleet->route_name ?: 'Local Sea',
                'destination' => $liveWp ? ($liveWp->port_name ?: 'Port of Destination') : 'Destination',
                'lat' => $liveWp ? number_format($liveWp->latitude, 4) : '-6.1200',
                'lng' => $liveWp ? number_format($liveWp->longitude, 4) : '106.8400',
                'speed' => $speed,
                'cog' => $cog,
                'status' => ($liveWp && $liveWp->waypoint_type === 'transit') ? 'En Route' : 'In Port',
                'route_points' => $routePoints,
            ];
        });

        if ($request->wantsJson()) {
            return response()->json($voyage_waypoints);
        }

        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = $request->user();
        if ($user->role !== 'super_admin') {
            abort(403, 'Only Super Admin can access Voyage Waypoints management.');
        }

        return Inertia::render('Dashboard/VoyageWaypoints', [
            'voyage_waypoints' => $voyage_waypoints,
        ]);
    }
}