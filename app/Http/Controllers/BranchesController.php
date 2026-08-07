<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class BranchesController extends Controller
{
    /**
     * Display a listing of branches.
     */
    public function index(Request $request)
    {
        $branches = Branch::orderBy('sort_order', 'asc')->get();

        if ($request->wantsJson()) {
            return response()->json($branches);
        }

        return Inertia::render('Dashboard/Branches', [
            'branches' => $branches,
        ]);
    }

    /**
     * Helper to clean Google Maps embed URL by stripping <iframe> tags if present.
     */
    private function cleanMapUrl(?string $url): ?string
    {
        if (!$url) return null;
        $url = trim($url);

        if (preg_match('/src=["\']([^"\']+)["\']/i', $url, $matches)) {
            $url = $matches[1];
        }

        return $url;
    }

    /**
     * Store a newly created branch in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'short_desc' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:1000',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'map_url' => 'nullable|string|max:2000',
            'image_url' => 'nullable|string|max:500',
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ], [
            'name.max' => 'The branch name must not be greater than 255 characters.',
            'short_desc.max' => 'The short description must not be greater than 255 characters.',
            'image_file.max' => 'The branch photo image may not be greater than 5MB.',
            'image_file.image' => 'The branch photo must be a valid image file.',
        ]);

        if (!empty($validated['map_url'])) {
            $cleaned = $this->cleanMapUrl($validated['map_url']);
            if (!str_contains($cleaned, 'maps/embed') && !str_contains($cleaned, 'google.com/maps')) {
                return back()->withErrors(['map_url' => 'The Google Maps URL must contain "maps/embed".']);
            }
            $validated['map_url'] = $cleaned;
        }

        if ($request->hasFile('image_file')) {
            $path = \App\Services\ImageOptimizationService::uploadAndOptimize($request->file('image_file'), 'branches');
            $validated['image_url'] = '/storage/' . $path;
        }

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        if (!isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }

        $branch = Branch::create($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Branch office created successfully',
                'data' => $branch,
            ], 201);
        }

        return redirect()->back()->with('success', 'Branch office created successfully.');
    }

    /**
     * Update the specified branch in storage.
     */
    public function update(Request $request, string $id)
    {
        $branch = Branch::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'short_desc' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:1000',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'map_url' => 'nullable|string|max:2000',
            'image_url' => 'nullable|string|max:500',
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ], [
            'name.max' => 'The branch name must not be greater than 255 characters.',
            'short_desc.max' => 'The short description must not be greater than 255 characters.',
            'image_file.max' => 'The branch photo image may not be greater than 5MB.',
            'image_file.image' => 'The branch photo must be a valid image file.',
        ]);

        if (!empty($validated['map_url'])) {
            $cleaned = $this->cleanMapUrl($validated['map_url']);
            if (!str_contains($cleaned, 'maps/embed') && !str_contains($cleaned, 'google.com/maps')) {
                return back()->withErrors(['map_url' => 'The Google Maps URL must contain "maps/embed".']);
            }
            $validated['map_url'] = $cleaned;
        }

        if ($request->hasFile('image_file')) {
            $path = \App\Services\ImageOptimizationService::uploadAndOptimize($request->file('image_file'), 'branches');
            $validated['image_url'] = '/storage/' . $path;
        }

        $branch->update($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Branch office updated successfully',
                'data' => $branch,
            ]);
        }

        return redirect()->back()->with('success', 'Branch office updated successfully.');
    }

    /**
     * Remove the specified branch from storage.
     */
    public function destroy(string $id)
    {
        $branch = Branch::findOrFail($id);
        $branch->delete();

        if (request()->wantsJson()) {
            return response()->json([
                'message' => 'Branch office deleted successfully',
            ]);
        }

        return redirect()->back()->with('success', 'Branch office deleted successfully.');
    }
}
