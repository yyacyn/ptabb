<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientsController extends Controller
{
    /**
     * Display a listing of the clients.
     *
     * Supports Inertia rendering for frontend and JSON responses for API testing.
     */
    public function index(Request $request)
    {
        $clients = Client::all();

        if ($request->wantsJson()) {
            return response()->json($clients);
        }

        if ($request->routeIs('public.clients')) {
            return Inertia::render('Clients', [
                'clients' => $clients,
            ]);
        }

        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = $request->user();
        if (!in_array($user->role, ['super_admin', 'pr_admin'])) {
            abort(403, 'Only Super Admin and PR Admin can access Clients management.');
        }

        return Inertia::render('Dashboard/Clients', [
            'clients' => $clients,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if ($user && !in_array($user->role, ['super_admin', 'pr_admin'])) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:50',
            'logo' => 'nullable|file|mimes:jpeg,png,jpg,webp,svg|max:5120',
        ], [
            'name.required' => 'The client name is required.',
            'name.max' => 'The client name must not be greater than 255 characters.',
            'logo.file' => 'The logo must be a valid file.',
            'logo.mimes' => 'The logo must be a file of type: jpeg, png, jpg, webp, svg.',
            'logo.max' => 'The logo file may not be greater than 5MB.',
        ]);

        if ($request->hasFile('logo')) {
            $path = \App\Services\ImageOptimizationService::uploadAndOptimize($request->file('logo'), 'clients');
            $validated['logo'] = '/storage/' . $path;
        }

        $client = Client::create($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Partner added successfully.',
                'client' => $client,
            ], 201);
        }

        return redirect()->route('clients.index')->with('success', 'Partner added successfully.');
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if ($user && !in_array($user->role, ['super_admin', 'pr_admin'])) {
            abort(403, 'Unauthorized.');
        }

        $client = Client::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:50',
            'logo' => 'nullable|file|mimes:jpeg,png,jpg,webp,svg|max:5120',
        ], [
            'name.required' => 'The client name is required.',
            'name.max' => 'The client name must not be greater than 255 characters.',
            'logo.file' => 'The logo must be a valid file.',
            'logo.mimes' => 'The logo must be a file of type: jpeg, png, jpg, webp, svg.',
            'logo.max' => 'The logo file may not be greater than 5MB.',
        ]);

        if ($request->hasFile('logo')) {
            $path = \App\Services\ImageOptimizationService::uploadAndOptimize($request->file('logo'), 'clients');
            $validated['logo'] = '/storage/' . $path;
        } else {
            // Retain existing logo untouched when no new image file is uploaded
            unset($validated['logo']);
        }

        $client->update($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Partner updated successfully.',
                'client' => $client,
            ]);
        }

        return redirect()->route('clients.index')->with('success', 'Partner updated successfully.');
    }

    public function destroy($id)
    {
        $user = auth()->user();
        if ($user && !in_array($user->role, ['super_admin', 'pr_admin'])) {
            abort(403, 'Unauthorized.');
        }

        $client = Client::findOrFail($id);
        $client->delete();

        if (request()->wantsJson()) {
            return response()->json([
                'message' => 'Partner removed successfully.',
            ]);
        }

        return redirect()->route('clients.index')->with('success', 'Partner removed successfully.');
    }
}
