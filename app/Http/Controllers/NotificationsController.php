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

        return Inertia::render('Dashboard/Notifications', [
            'notifications' => $notifications,
        ]);
    }
}