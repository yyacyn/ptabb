<?php

namespace App\Http\Controllers;

use App\Models\Milestone;
use App\Services\ImageOptimizationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MilestonesController extends Controller
{
    public function index(Request $request)
    {
        if ($request->wantsJson()) {
            return response()->json(Milestone::orderBy('year', 'desc')->get());
        }

        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $milestones = Milestone::orderBy('year', 'desc')->get();

        return Inertia::render('Dashboard/Milestones', [
            'milestones' => $milestones,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|integer|min:1900|max:2099',
            'milestone' => 'required|string|max:255',
            'description' => 'nullable|string|max:200',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:10240',
        ], [
            'image.required' => 'Milestone image is required.',
            'image.image' => 'The file must be a valid image.',
            'image.mimes' => 'The image must be a file of type: jpeg, png, jpg, webp.',
            'image.max' => 'The image size must not exceed 10MB.',
        ]);

        if ($request->hasFile('image')) {
            $path = ImageOptimizationService::uploadAndOptimize($request->file('image'), 'milestones');
            $validated['image'] = '/storage/' . $path;
        }

        $milestone = Milestone::create($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Milestone created successfully.',
                'milestone' => $milestone,
            ], 201);
        }

        return redirect()->route('milestones.index')->with('success', 'Milestone created successfully.');
    }

    public function update(Request $request, $id)
    {
        $milestone = Milestone::findOrFail($id);

        $imageRule = $milestone->image ? 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240' : 'required|image|mimes:jpeg,png,jpg,webp|max:10240';

        $validated = $request->validate([
            'year' => 'required|integer|min:1900|max:2099',
            'milestone' => 'required|string|max:255',
            'description' => 'nullable|string|max:200',
            'image' => $imageRule,
        ], [
            'image.required' => 'Milestone image is required.',
            'image.image' => 'The file must be a valid image.',
            'image.mimes' => 'The image must be a file of type: jpeg, png, jpg, webp.',
            'image.max' => 'The image size must not exceed 10MB.',
        ]);

        if ($request->hasFile('image')) {
            $path = ImageOptimizationService::uploadAndOptimize($request->file('image'), 'milestones');
            $validated['image'] = '/storage/' . $path;
        } else {
            unset($validated['image']);
        }

        $milestone->update($validated);

        return redirect()->route('milestones.index')->with('success', 'Milestone updated successfully.');
    }

    public function destroy($id)
    {
        $milestone = Milestone::findOrFail($id);
        $milestone->delete();

        return redirect()->route('milestones.index')->with('success', 'Milestone deleted successfully.');
    }
}
