<?php

namespace App\Http\Controllers;

use App\Models\Fleet;
use App\Models\FleetCategory;
use App\Services\PdfAiParserService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FleetsController extends Controller
{
    public function index()
    {
        $fleets = Fleet::with('category')->latest()->get();

        return Inertia::render('Dashboard/Fleets', [
            'fleets' => $fleets,
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