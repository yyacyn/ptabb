<?php

namespace App\Http\Controllers;

use App\Models\Milestone;
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
            'year' => 'required|string|max:20',
            'milestones' => 'nullable|string|max:255',
            'milestone' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:10240',
        ]);

        $title = $request->input('milestone') ?? $request->input('milestones') ?? '';
        $validated['milestone'] = $title;
        $validated['milestones'] = $title;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('milestones', 'public');
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

        $validated = $request->validate([
            'year' => 'required|string|max:20',
            'milestones' => 'nullable|string|max:255',
            'milestone' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable',
        ]);

        $title = $request->input('milestone') ?? $request->input('milestones') ?? '';
        $validated['milestone'] = $title;
        $validated['milestones'] = $title;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('milestones', 'public');
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
