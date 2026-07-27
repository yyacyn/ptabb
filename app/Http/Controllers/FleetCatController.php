<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\FleetCategory;

class FleetCatController extends Controller
{
    public function index(Request $request)
    {
        $fleet_cats = FleetCategory::all();

        if ($request->wantsJson()) {
            return response()->json($fleet_cats);
        }

        return Inertia::render('FleetCat', [
            'fleet_cats' => $fleet_cats,
        ]);
    }
}