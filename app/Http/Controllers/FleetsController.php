<?php

namespace App\Http\Controllers;

use App\Models\Fleet;
use App\Models\FleetCategory;
use App\Services\PdfAiParserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
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

    public function dashboardIndex()
    {
        $fleets = Fleet::with('category')->latest()->get();
        $categories = FleetCategory::all();

        return Inertia::render('Dashboard/Fleets', [
            'fleets' => $fleets,
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        $categories = FleetCategory::all();

        return Inertia::render('Dashboard/Fleets/Edit', [
            'fleet' => null,
            'categories' => $categories,
        ]);
    }

    public function edit($id)
    {
        $fleet = Fleet::with('category')->findOrFail($id);
        $categories = FleetCategory::all();

        return Inertia::render('Dashboard/Fleets/Edit', [
            'fleet' => $fleet,
            'categories' => $categories,
        ]);
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:fleet_categories,name',
            'description' => 'nullable|string',
        ]);

        $category = FleetCategory::create($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'category' => $category,
                'categories' => FleetCategory::all(),
            ]);
        }

        return redirect()->back()->with('success', 'Vessel category created successfully.');
    }

    public function destroyCategory($id)
    {
        $category = FleetCategory::findOrFail($id);
        $category->delete();

        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'categories' => FleetCategory::all(),
            ]);
        }

        return redirect()->back()->with('success', 'Vessel category deleted successfully.');
    }

    public function parsePdf(Request $request, PdfAiParserService $parser)
    {
        $request->validate([
            'ship_particular_pdf' => 'required|file|mimes:pdf|max:10240',
        ]);

        $file = $request->file('ship_particular_pdf');
        $result = $parser->parseVesselParticularsPdf($file);

        return response()->json($result);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ship_name' => 'required|string|max:255',
            'imo_number' => ['required', 'string', 'regex:/^(IMO\s*)?\d{7}$/i', Rule::unique('fleets', 'imo_number')->whereNull('deleted_at')],
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
            'imo_number' => ['required', 'string', 'regex:/^(IMO\s*)?\d{7}$/i', Rule::unique('fleets', 'imo_number')->ignore($fleet->id)->whereNull('deleted_at')],
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
            if ($fleet->featured_image && str_contains($fleet->featured_image, '/storage/')) {
                $oldImgPath = ltrim(str_replace('/storage/', '', $fleet->featured_image), '/');
                if (Storage::disk('public')->exists($oldImgPath)) {
                    Storage::disk('public')->delete($oldImgPath);
                }
            }

            $path = \App\Services\ImageOptimizationService::uploadAndOptimize($request->file('featured_image'), 'fleets');
            $validated['featured_image'] = '/storage/' . $path;
        } else {
            unset($validated['featured_image']);
        }

        if ($request->hasFile('ship_particular_pdf')) {
            if ($fleet->ship_particular_pdf && str_contains($fleet->ship_particular_pdf, '/storage/')) {
                $oldPdfPath = ltrim(str_replace('/storage/', '', $fleet->ship_particular_pdf), '/');
                if (Storage::disk('public')->exists($oldPdfPath)) {
                    Storage::disk('public')->delete($oldPdfPath);
                }
            }

            $path = $request->file('ship_particular_pdf')->store('documents/fleets', 'public');
            $validated['ship_particular_pdf'] = '/storage/' . $path;
        } else {
            unset($validated['ship_particular_pdf']);
        }

        $fleet->update($validated);

        return redirect()->route('fleets.index')->with('success', 'Vessel updated successfully.');
    }

    public function destroy($id)
    {
        $fleet = Fleet::withTrashed()->findOrFail($id);

        if ($fleet->ship_particular_pdf && str_contains($fleet->ship_particular_pdf, '/storage/')) {
            $pdfPath = ltrim(str_replace('/storage/', '', $fleet->ship_particular_pdf), '/');
            if (Storage::disk('public')->exists($pdfPath)) {
                Storage::disk('public')->delete($pdfPath);
            }
        }

        if ($fleet->featured_image && str_contains($fleet->featured_image, '/storage/')) {
            $imgPath = ltrim(str_replace('/storage/', '', $fleet->featured_image), '/');
            if (Storage::disk('public')->exists($imgPath)) {
                Storage::disk('public')->delete($imgPath);
            }
        }

        $fleet->forceDelete();

        return redirect()->route('fleets.index')->with('success', 'Vessel deleted successfully.');
    }
}