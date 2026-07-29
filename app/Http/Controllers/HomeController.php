<?php

namespace App\Http\Controllers;

use App\Models\Career;
use App\Models\Client;
use App\Models\Fleet;
use App\Models\News;
use App\Models\Notification;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Welcome', [
            // 'canLogin' => Route::has('login'),
            // 'canRegister' => Route::has('register'),
            // 'laravelVersion' => Application::VERSION,
            // 'phpVersion' => PHP_VERSION,
            'clients' => Client::all(),
            'fleets' => Fleet::latest()->take(3)->get(),
            'news' => News::where('status', 'published')->latest()->take(6)->get(),
            'notifications' => Notification::where('status', 'active')->get(),
            'careers' => Career::where('status', 'open')->get(),
        ]);
    }
}
