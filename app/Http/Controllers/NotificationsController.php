<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Notification;

class NotificationsController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::all();

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
}