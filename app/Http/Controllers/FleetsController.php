<?php

namespace App\Http\Controllers;

use App\Models\Fleet;
use App\Models\FleetCategory;
use App\Services\PdfAiParserService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FleetsController extends Controller
{
    public function index(Request $request)
    {
        $fleets = Fleet::with('category')->latest()->get();

        $allWaypointsGrouped = \App\Models\VoyageWaypoint::orderBy('sequence', 'asc')->get()->groupBy('fleet_id');
        $voyageWaypoints = \App\Models\Fleet::all()->map(function ($fleet) use ($allWaypointsGrouped) {
            $waypoints = $allWaypointsGrouped->get($fleet->id, collect());
            $liveWp = $waypoints->firstWhere('sequence', 1) ?? $waypoints->first();

            $speed = '11.4 knots';
            $cog = 45;
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
            })->values();

            return [
                'id' => $fleet->id,
                'vessel' => $fleet->ship_name,
                'lat' => $liveWp ? (float) $liveWp->latitude : 15.2,
                'lng' => $liveWp ? (float) $liveWp->longitude : 73.8,
                'speed' => $speed,
                'cog' => $cog,
                'status' => $fleet->status ?? 'Active - In Service',
                'route_points' => $routePoints,
            ];
        });

        if ($request->wantsJson()) {
            return response()->json([
                'fleets' => $fleets,
                'voyage_waypoints' => $voyageWaypoints,
            ]);
        }

        if ($request->is('dashboard*')) {
            return Inertia::render('Dashboard/Fleets', [
                'fleets' => $fleets,
            ]);
        }

        return Inertia::render('Fleets', [
            'fleets' => $fleets,
            'voyage_waypoints' => $voyageWaypoints,
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/Fleets/Edit', [
            'fleet' => null,
            'categories' => FleetCategory::all(),
        ]);
    }

    public function edit($id)
    {
        $fleet = Fleet::with('category')->findOrFail($id);

        return Inertia::render('Dashboard/Fleets/Edit', [
            'fleet' => $fleet,
            'categories' => FleetCategory::all(),
        ]);
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:fleet_categories,name',
            'description' => 'nullable|string',
        ]);

        $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);

        $category = FleetCategory::create($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'category' => $category,
                'categories' => FleetCategory::all(),
            ]);
        }

        return redirect()->back()->with('success', 'Category added successfully.');
    }

    public function parsePdf(Request $request, PdfAiParserService $parserService)
    {
        $request->validate([
            'ship_particular_pdf' => 'required|file|mimes:pdf|max:10240',
        ]);

        $file = $request->file('ship_particular_pdf');
        $tempPath = $file->getRealPath();

        $result = $parserService->parsePdfDocument($tempPath);

        return response()->json($result);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ship_name' => 'required|string|max:255',
            'imo_number' => 'required|string|max:20|unique:fleets,imo_number',
            'category_id' => 'nullable|exists:fleet_categories,id',
            'vessel_type' => 'nullable|string|max:100',
            'status' => 'required|string',
            'operational_area' => 'nullable|string|max:255',
            'build_year' => 'nullable|integer',
            'dwt' => 'nullable|numeric',
            'capacity' => 'nullable|numeric',
            'gross_tonnage' => 'nullable|numeric',
            'net_tonnage' => 'nullable|numeric',
            'light_ship' => 'nullable|numeric',
            'summer_draft' => 'nullable|numeric',
            'port_of_registry' => 'nullable|string|max:100',
            'call_sign' => 'nullable|string|max:50',
            'mmsi' => 'nullable|string|max:50',
            'hull_no' => 'nullable|string|max:50',
            'flag' => 'nullable|string|max:100',
            'classification_society' => 'nullable|string|max:100',
            'loa' => 'nullable|numeric',
            'lbp' => 'nullable|numeric',
            'breadth' => 'nullable|numeric',
            'depth' => 'nullable|numeric',
            'speed' => 'nullable|numeric',
            'description' => 'nullable|string|max:200',
            'voyage_description' => 'nullable|string',
            'particulars_data' => 'nullable|array',
        ]);

        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('fleets', 'public');
            $validated['featured_image'] = '/storage/' . $path;
        }

        if ($request->hasFile('ship_particular_pdf')) {
            $path = $request->file('ship_particular_pdf')->store('documents/fleets', 'public');
            $validated['ship_particular_pdf'] = '/storage/' . $path;
        }

        Fleet::create($validated);

        return redirect()->route('fleets.index')->with('success', 'Vessel created successfully.');
    }

    public function update(Request $request, $id)
    {
        $fleet = Fleet::findOrFail($id);

        $validated = $request->validate([
            'ship_name' => 'required|string|max:255',
            'imo_number' => 'required|string|max:20|unique:fleets,imo_number,' . $fleet->id,
            'category_id' => 'nullable|exists:fleet_categories,id',
            'vessel_type' => 'nullable|string|max:100',
            'status' => 'required|string',
            'operational_area' => 'nullable|string|max:255',
            'build_year' => 'nullable|integer',
            'dwt' => 'nullable|numeric',
            'capacity' => 'nullable|numeric',
            'gross_tonnage' => 'nullable|numeric',
            'net_tonnage' => 'nullable|numeric',
            'light_ship' => 'nullable|numeric',
            'summer_draft' => 'nullable|numeric',
            'port_of_registry' => 'nullable|string|max:100',
            'call_sign' => 'nullable|string|max:50',
            'mmsi' => 'nullable|string|max:50',
            'hull_no' => 'nullable|string|max:50',
            'flag' => 'nullable|string|max:100',
            'classification_society' => 'nullable|string|max:100',
            'loa' => 'nullable|numeric',
            'lbp' => 'nullable|numeric',
            'breadth' => 'nullable|numeric',
            'depth' => 'nullable|numeric',
            'speed' => 'nullable|numeric',
            'description' => 'nullable|string|max:200',
            'voyage_description' => 'nullable|string',
            'particulars_data' => 'nullable|array',
        ]);

        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('fleets', 'public');
            $validated['featured_image'] = '/storage/' . $path;
        }

        if ($request->hasFile('ship_particular_pdf')) {
            $path = $request->file('ship_particular_pdf')->store('documents/fleets', 'public');
            $validated['ship_particular_pdf'] = '/storage/' . $path;
        }

        $fleet->update($validated);

        return redirect()->route('fleets.index')->with('success', 'Vessel updated successfully.');
    }

    public function destroy($id)
    {
        $fleet = Fleet::findOrFail($id);
        $fleet->delete();

        return redirect()->route('fleets.index')->with('success', 'Vessel deleted successfully.');
    }
}