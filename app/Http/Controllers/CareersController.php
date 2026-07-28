<?php

namespace App\Http\Controllers;

use App\Models\Career;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CareersController extends Controller
{
    public function index(Request $request)
    {
        if ($request->wantsJson()) {
            return response()->json(Career::all());
        }

        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = $request->user();

        // RBAC Enforcement (rule.md & BR-01)
        if ($user->role === 'pr_admin') {
            abort(403, 'PR Admin is not authorized to access Careers module.');
        }

        if ($user->role === 'hr_admin') {
            $careers = Career::where('category', 'corporate')->get();
        } elseif ($user->role === 'crew_admin') {
            $careers = Career::where('category', 'crew')->get();
        } else {
            $careers = Career::all();
        }

        return Inertia::render('Dashboard/Careers', [
            'careers' => $careers,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if ($user && $user->role === 'pr_admin') {
            abort(403, 'PR Admin is not authorized to modify Careers.');
        }

        $validated = $request->validate([
            'position' => 'required|string|max:255',
            'department' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:50',
            'location' => 'nullable|string|max:100',
            'employment_type' => 'nullable|in:fulltime,contract,internship',
            'description' => 'nullable|string',
            'requirements' => 'nullable|string',
            'responsibilities' => 'nullable|string',
            'status' => 'nullable|in:open,closed',
            'application_deadline' => 'nullable|date',
        ]);

        if (auth()->check()) {
            $validated['author_id'] = auth()->id();
        }

        $career = Career::create($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Career created successfully.',
                'career' => $career,
            ], 201);
        }

        return redirect()->route('careers.index')->with('success', 'Career position created successfully.');
    }
}
