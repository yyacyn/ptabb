<?php

namespace App\Http\Controllers;

use App\Models\VoyageWaypoint;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VoyageWaypointsController extends Controller
{
    public function index(Request $request)
    {
        $voyage_waypoints = VoyageWaypoint::all();

        if ($request->wantsJson()) {
            return response()->json($voyage_waypoints);
        }

        if (!auth()->check()) {
            return redirect()->route('login');
        }

        return Inertia::render('Dashboard/VoyageWaypoints', [
            'voyage_waypoints' => $voyage_waypoints,
        ]);
    }

}