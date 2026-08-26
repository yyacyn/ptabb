<?php

namespace App\Http\Controllers;

use App\Models\VoyageWaypoint;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VoyageWaypointsController extends Controller
{
    public function index(Request $request, \App\Services\SailinkApiService $sailinkService)
    {
        $allWaypointsGrouped = VoyageWaypoint::orderBy('sequence', 'asc')->get()->groupBy('fleet_id');

        $voyage_waypoints = \App\Models\Fleet::all()->map(function ($fleet) use ($allWaypointsGrouped, $sailinkService) {
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

            $isSailinkWp = $liveWp && (
                (isset($liveWp->notes) && str_contains($liveWp->notes, 'Live GPS')) ||
                (isset($liveWp->port_name) && str_contains($liveWp->port_name, 'Sailink'))
            );

            $lat = $isSailinkWp ? (float) $liveWp->latitude : null;
            $lng = $isSailinkWp ? (float) $liveWp->longitude : null;
            $weather = null;
            $telemetryStatus = 'UP';
            $isDown = false;
            $provider = 'sailink';

            if ($fleet->ip_address) {
                $telemetry = \Illuminate\Support\Facades\Cache::remember('sailink_telemetry_' . $fleet->id, 60, function () use ($sailinkService, $fleet) {
                    return $sailinkService->getVesselPosition($fleet->ip_address);
                });

                if ($telemetry && isset($telemetry['latitude'], $telemetry['longitude'])) {
                    $lat = $telemetry['latitude'];
                    $lng = $telemetry['longitude'];
                    $speed = $telemetry['speed_knots'] . ' knots';
                    $cog = $telemetry['heading'];
                    $weather = $telemetry['weather'] ?? null;
                    $telemetryStatus = $telemetry['status'] ?? 'UP';
                    $isDown = $telemetry['is_down'] ?? false;
                    $provider = $telemetry['provider'] ?? 'sailink';
                }
            }

            $routePoints = $waypoints->map(function ($w) {
                $cog = 0;
                $speed = '0 kts';
                if ($w->notes) {
                    if (preg_match('/COG:\s*([0-9.]+)/', $w->notes, $m)) $cog = (float)$m[1];
                    if (preg_match('/SOG:\s*([0-9.]+)\s*kts/', $w->notes, $s)) $speed = $s[1] . ' kts';
                }
                return [
                    'id' => $w->id,
                    'name' => $w->port_name ?: ('Waypoint ' . $w->sequence),
                    'lat' => (float) $w->latitude,
                    'lng' => (float) $w->longitude,
                    'type' => $w->waypoint_type,
                    'sequence' => $w->sequence,
                    'cog' => $cog,
                    'speed' => $speed,
                    'notes' => $w->notes,
                    'created_at' => $w->created_at ? $w->created_at->format('d M Y H:i') : null,
                ];
            })->values()->toArray();

            return [
                'id' => $fleet->id,
                'vessel' => $fleet->ship_name,
                'origin' => $fleet->route_name ?: 'Local Sea',
                'destination' => $liveWp ? ($liveWp->port_name ?: 'Port of Destination') : 'Destination',
                'lat' => $lat,
                'lng' => $lng,
                'speed' => $speed,
                'cog' => $cog,
                'weather' => $weather,
                'telemetry_status' => $telemetryStatus,
                'is_down' => $isDown,
                'provider' => $provider,
                'status' => $isDown ? "Offline (Sailink Down - via {$provider})" : (($liveWp && $liveWp->waypoint_type === 'transit') ? 'En Route' : 'In Port'),
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