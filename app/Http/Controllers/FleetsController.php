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

    public function show(Request $request, $id)
    {
        $fleet = Fleet::with(['category', 'waypoints'])->find($id);

        if (!$fleet) {
            $fleet = Fleet::with(['category', 'waypoints'])->first();
        }

        $waypoints = $fleet ? $fleet->waypoints : collect();
        $liveWp = $waypoints->firstWhere('sequence', 1) ?? $waypoints->first();

        $speed = '11.4 knots';
        $cog = 45;
        if ($liveWp && $liveWp->notes) {
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

        $voyageWaypoint = [
            'id' => $fleet ? $fleet->id : 1,
            'vessel' => $fleet ? $fleet->ship_name : 'MV. IRIANA',
            'lat' => $liveWp ? (float) $liveWp->latitude : -6.1,
            'lng' => $liveWp ? (float) $liveWp->longitude : 106.8,
            'speed' => $speed,
            'cog' => $cog,
            'status' => $fleet ? ($fleet->status ?? 'Active - In Service') : 'Active - In Service',
            'route_points' => $routePoints,
        ];

        if ($request->wantsJson()) {
            return response()->json([
                'fleet' => $fleet,
                'voyage_waypoint' => $voyageWaypoint,
            ]);
        }

        return Inertia::render('Fleets/Show', [
            'fleet' => $fleet,
            'voyage_waypoint' => $voyageWaypoint,
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

        return response()->json([
            'success' => true,
            'category' => $category,
            'categories' => FleetCategory::all(),
        ]);
    }

    public function parsePdf(Request $request, PdfAiParserService $parserService)
    {
        $request->validate([
            'ship_particular_pdf' => 'required|file|mimes:pdf|max:10240',
        ], [
            'ship_particular_pdf.mimes' => 'The specification document must be a file of type: pdf.',
            'ship_particular_pdf.max' => 'The specification document may not be greater than 10MB.',
        ]);

        $file = $request->file('ship_particular_pdf');
        $tempPath = $file->getRealPath();

        $result = $parserService->parsePdfDocument($tempPath);

        $extractedData = $result['data'] ?? [];
        $filledCount = 0;
        if (is_array($extractedData)) {
            foreach ($extractedData as $val) {
                if ($val !== null && $val !== '' && $val !== 'N/A') {
                    $filledCount++;
                }
            }
        }

        if ($filledCount < 5) {
            return response()->json([
                'success' => false,
                'message' => 'The uploaded PDF does not appear to be a valid vessel specification document. Please upload the proper vessel spec and try again.',
                'data' => null,
                'filled_count' => $filledCount,
            ], 422);
        }

        return response()->json($result);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ship_name' => 'required|string|max:255',
            'imo_number' => ['required', 'string', 'regex:/^(IMO\s*)?\d{7}$/i', 'unique:fleets,imo_number'],
            'category_id' => 'nullable|exists:fleet_categories,id',
            'vessel_type' => 'required|string|max:100',
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
            'featured_image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'ship_particular_pdf' => 'nullable|file|mimes:pdf|max:10240',
        ], [
            'imo_number.regex' => 'The IMO number must consist of 7 digits (e.g. 9123456 or IMO 9123456).',
            'featured_image.max' => 'The featured image may not be greater than 5MB.',
            'ship_particular_pdf.max' => 'The specification document may not be greater than 10MB.',
        ]);

        if ($request->hasFile('featured_image')) {
            $path = \App\Services\ImageOptimizationService::uploadAndOptimize($request->file('featured_image'), 'fleets');
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
            'imo_number' => ['required', 'string', 'regex:/^(IMO\s*)?\d{7}$/i', 'unique:fleets,imo_number,' . $fleet->id],
            'category_id' => 'nullable|exists:fleet_categories,id',
            'vessel_type' => 'required|string|max:100',
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
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'ship_particular_pdf' => 'nullable|file|mimes:pdf|max:10240',
        ], [
            'imo_number.regex' => 'The IMO number must consist of 7 digits (e.g. 9123456 or IMO 9123456).',
            'featured_image.max' => 'The featured image may not be greater than 5MB.',
            'ship_particular_pdf.max' => 'The specification document may not be greater than 10MB.',
        ]);

        if ($request->hasFile('featured_image')) {
            $path = \App\Services\ImageOptimizationService::uploadAndOptimize($request->file('featured_image'), 'fleets');
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