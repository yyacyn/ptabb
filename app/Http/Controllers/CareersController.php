<?php

namespace App\Http\Controllers;

use App\Models\Career;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CareersController extends Controller
{
    public function index(Request $request)
    {
        // Auto-expire vacancies past application deadline
        Career::where('status', 'open')
            ->whereNotNull('application_deadline')
            ->whereDate('application_deadline', '<', now()->toDateString())
            ->update(['status' => 'expired']);

        if ($request->wantsJson()) {
            return response()->json(Career::all());
        }

        if ($request->is('dashboard*')) {
            if (!auth()->check()) {
                return redirect()->route('login');
            }

            $user = $request->user();

            // RBAC Enforcement (rule.md & BR-01)
            if ($user->role === 'pr_admin') {
                abort(403, 'PR Admin is not authorized to access Careers module.');
            }

            if ($user->role === 'hr_admin') {
                $careers = Career::where('category', 'corporate')->latest()->get();
            } elseif ($user->role === 'crew_admin') {
                $careers = Career::where('category', 'crew')->latest()->get();
            } else {
                $careers = Career::latest()->get();
            }

            return Inertia::render('Dashboard/Careers', [
                'careers' => $careers,
            ]);
        }

        $careers = Career::where('status', 'open')->latest()->get();

        return Inertia::render('Careers', [
            'careers' => $careers,
            'notifications' => Notification::where('status', 'active')->get(),
        ]);
    }

    public function show($id)
    {
        $career = Career::where('status', 'open')->findOrFail($id);

        return Inertia::render('Careers/Show', [
            'career' => $career,
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
            'status' => 'nullable|in:open,closed,expired',
            'application_deadline' => 'required|date|after_or_equal:today',
        ], [
            'position.max' => 'The job position title must not be greater than 255 characters.',
            'application_deadline.required' => 'The application deadline is required.',
            'application_deadline.date' => 'The application deadline must be a valid date format.',
            'application_deadline.after_or_equal' => 'The application deadline cannot be a date in the past.',
        ]);

        if (!empty($validated['application_deadline'])) {
            $deadlineTime = strtotime($validated['application_deadline'] . ' 23:59:59');
            if ($deadlineTime >= time()) {
                $validated['status'] = 'open';
            } else {
                $validated['status'] = 'expired';
            }
        }

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

    public function update(Request $request, $id)
    {
        $user = $request->user();

        if ($user && $user->role === 'pr_admin') {
            abort(403, 'PR Admin is not authorized to modify Careers.');
        }

        $career = Career::findOrFail($id);

        if ($user->role === 'hr_admin' && $career->category !== 'corporate') {
            abort(403, 'Unauthorized.');
        }
        if ($user->role === 'crew_admin' && $career->category !== 'crew') {
            abort(403, 'Unauthorized.');
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
            'status' => 'nullable|in:open,closed,expired',
            'application_deadline' => 'required|date|after_or_equal:today',
        ], [
            'position.max' => 'The job position title must not be greater than 255 characters.',
            'application_deadline.required' => 'The application deadline is required.',
            'application_deadline.date' => 'The application deadline must be a valid date format.',
            'application_deadline.after_or_equal' => 'The application deadline cannot be a date in the past.',
        ]);

        if (!empty($validated['application_deadline'])) {
            $deadlineTime = strtotime($validated['application_deadline'] . ' 23:59:59');
            if ($deadlineTime >= time()) {
                $validated['status'] = 'open';
            } else {
                $validated['status'] = 'expired';
            }
        }

        $career->update($validated);

        return redirect()->route('careers.index')->with('success', 'Career position updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if ($user && $user->role === 'pr_admin') {
            abort(403, 'PR Admin is not authorized to modify Careers.');
        }

        $career = Career::withTrashed()->findOrFail($id);

        if ($user->role === 'hr_admin' && $career->category !== 'corporate') {
            abort(403, 'Unauthorized.');
        }
        if ($user->role === 'crew_admin' && $career->category !== 'crew') {
            abort(403, 'Unauthorized.');
        }

        $career->forceDelete();

        return redirect()->route('careers.index')->with('success', 'Career vacancy deleted successfully.');
    }
}
