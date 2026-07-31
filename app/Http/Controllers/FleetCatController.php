<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\FleetCategory;
use Illuminate\Support\Str;

class FleetCatController extends Controller
{
    public function index(Request $request)
    {
        $fleet_cats = FleetCategory::withCount('fleets')->get();

        if ($request->wantsJson()) {
            return response()->json($fleet_cats);
        }

        return Inertia::render('FleetCat', [
            'fleet_cats' => $fleet_cats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:fleet_categories,name',
            'description' => 'nullable|string',
        ]);

        $category = FleetCategory::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        if ($request->wantsJson()) {
            return response()->json($category, 201);
        }

        return back()->with('success', 'Fleet category created successfully.');
    }

    public function update(Request $request, $id)
    {
        $category = FleetCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:fleet_categories,name,' . $id,
            'description' => 'nullable|string',
        ]);

        $category->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        if ($request->wantsJson()) {
            return response()->json($category);
        }

        return back()->with('success', 'Fleet category updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $category = FleetCategory::findOrFail($id);
        $category->delete();

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Fleet category deleted successfully.']);
        }

        return back()->with('success', 'Fleet category deleted successfully.');
    }
}