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
            'description' => 'nullable|string|max:500',
        ], [
            'name.required' => 'The vessel category name is required.',
            'name.max' => 'The category name must not be greater than 255 characters.',
            'name.unique' => 'A vessel category with this name already exists.',
            'description.max' => 'The category description must not be greater than 500 characters.',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $category = FleetCategory::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
        ]);

        if ($request->wantsJson() || $request->ajax() || $request->header('Accept') === 'application/json') {
            return response()->json([
                'status' => 'success',
                'category' => $category,
                'categories' => FleetCategory::all(),
            ], 201);
        }

        return back()->with('success', 'Fleet category created successfully.');
    }

    public function update(Request $request, $id)
    {
        $category = FleetCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:fleet_categories,name,' . $id,
            'description' => 'nullable|string|max:500',
        ], [
            'name.required' => 'The vessel category name is required.',
            'name.max' => 'The category name must not be greater than 255 characters.',
            'name.unique' => 'A vessel category with this name already exists.',
            'description.max' => 'The category description must not be greater than 500 characters.',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $category->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
        ]);

        if ($request->wantsJson() || $request->ajax() || $request->header('Accept') === 'application/json') {
            return response()->json([
                'status' => 'success',
                'category' => $category,
                'categories' => FleetCategory::all(),
            ]);
        }

        return back()->with('success', 'Fleet category updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $category = FleetCategory::findOrFail($id);
        $category->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Fleet category deleted successfully.',
                'categories' => FleetCategory::all(),
            ]);
        }

        return back()->with('success', 'Fleet category deleted successfully.');
    }
}