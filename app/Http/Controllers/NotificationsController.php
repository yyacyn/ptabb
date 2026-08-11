<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class NotificationsController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::latest()->get();

        if ($request->wantsJson()) {
            return response()->json($notifications);
        }

        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = $request->user();
        if (!in_array($user->role, ['super_admin', 'hr_admin'])) {
            abort(403, 'Only Super Admin and HR Admin can access Notifications management.');
        }

        return Inertia::render('Dashboard/Notifications', [
            'notifications' => $notifications,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['super_admin', 'hr_admin'])) {
            abort(403, 'Only Super Admin and HR Admin can create notifications.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:home,career',
            'content' => 'required|string',
            'status' => 'required|string|in:active,inactive',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        // Enforce BR-06: Max 1 active popup banner per type (home or career)
        if ($validated['status'] === 'active') {
            Notification::where('type', $validated['type'])
                ->where('status', 'active')
                ->update(['status' => 'inactive']);
        }

        if ($request->hasFile('image')) {
            $path = \App\Services\ImageOptimizationService::uploadAndOptimize($request->file('image'), 'notifications');
            $validated['image'] = '/storage/' . $path;
        }

        Notification::create($validated);

        return redirect()->back()->with('success', 'Notification banner created successfully.');
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!in_array($user->role, ['super_admin', 'hr_admin'])) {
            abort(403, 'Only Super Admin and HR Admin can update notifications.');
        }

        $notification = Notification::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:home,career',
            'content' => 'required|string',
            'status' => 'required|string|in:active,inactive',
            'image' => 'nullable',
        ]);

        // Enforce BR-06: Max 1 active popup banner per type (home or career)
        if ($validated['status'] === 'active') {
            Notification::where('type', $validated['type'])
                ->where('id', '!=', $notification->id)
                ->where('status', 'active')
                ->update(['status' => 'inactive']);
        }

        if ($request->hasFile('image')) {
            if ($notification->image && str_contains($notification->image, '/storage/')) {
                $oldImg = ltrim(str_replace('/storage/', '', $notification->image), '/');
                if (Storage::disk('public')->exists($oldImg)) {
                    Storage::disk('public')->delete($oldImg);
                }
            }

            $path = \App\Services\ImageOptimizationService::uploadAndOptimize($request->file('image'), 'notifications');
            $validated['image'] = '/storage/' . $path;
        } elseif (!empty($validated['image']) && is_string($validated['image'])) {
            // Keep existing image if string URL passed
            unset($validated['image']);
        }

        $notification->update($validated);

        return redirect()->back()->with('success', 'Notification banner updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!in_array($user->role, ['super_admin', 'hr_admin'])) {
            abort(403, 'Only Super Admin and HR Admin can delete notifications.');
        }

        $notification = Notification::findOrFail($id);

        if ($notification->image && str_contains($notification->image, '/storage/')) {
            $img = ltrim(str_replace('/storage/', '', $notification->image), '/');
            if (Storage::disk('public')->exists($img)) {
                Storage::disk('public')->delete($img);
            }
        }

        $notification->delete();

        return redirect()->back()->with('success', 'Notification banner deleted successfully.');
    }
}