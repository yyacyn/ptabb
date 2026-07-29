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
            'year' => 'required|integer|min:1900',
            'milestone' => 'required|string|max:255',
            'description' => 'nullable|string|max:200',
            'image' => 'nullable|image|max:10240',
        ]);

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
            'year' => 'required|integer|min:1900|max:2099',
            'milestone' => 'required|string|max:255',
            'description' => 'nullable|string|max:200',
            'image' => 'nullable',
        ]);

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
