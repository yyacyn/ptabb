<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            abort(403, 'Only Super Admin can manage system users.');
        }

        $users = User::latest()->get();

        if ($request->wantsJson()) {
            return response()->json($users);
        }

        return Inertia::render('Dashboard/Users', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            abort(403, 'Only Super Admin can create system users.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['super_admin', 'hr_admin', 'crew_admin', 'pr_admin'])],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->back()->with('success', 'System user created successfully.');
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            abort(403, 'Only Super Admin can update system users.');
        }

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'username' => ['required', 'string', 'max:50', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => ['required', Rule::in(['super_admin', 'hr_admin', 'crew_admin', 'pr_admin'])],
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->back()->with('success', 'System user updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            abort(403, 'Only Super Admin can delete system users.');
        }

        if ((int)$request->user()->id === (int)$id) {
            return redirect()->back()->withErrors(['user' => 'You cannot delete your own active account.']);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->back()->with('success', 'System user deleted successfully.');
    }
}
