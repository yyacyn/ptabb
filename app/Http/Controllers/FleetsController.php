<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Fleet;
use App\Models\FleetCategory;

class FleetsController extends Controller
{
    public function index(Request $request)
    {
        $fleets = Fleet::with('category')->get();

        if ($request->wantsJson()) {
            return response()->json($fleets);
        }

        if (!auth()->check()) {
            return redirect()->route('login');
        }

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
            'flag' => 'nullable|string|max:100',
            'classification_society' => 'nullable|string|max:100',
            'loa' => 'nullable|numeric',
            'lbp' => 'nullable|numeric',
            'breadth' => 'nullable|numeric',
            'depth' => 'nullable|numeric',
            'speed' => 'nullable|numeric',
            'description' => 'nullable|string',
            'voyage_description' => 'nullable|string',
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
            'flag' => 'nullable|string|max:100',
            'classification_society' => 'nullable|string|max:100',
            'loa' => 'nullable|numeric',
            'lbp' => 'nullable|numeric',
            'breadth' => 'nullable|numeric',
            'depth' => 'nullable|numeric',
            'speed' => 'nullable|numeric',
            'description' => 'nullable|string',
            'voyage_description' => 'nullable|string',
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