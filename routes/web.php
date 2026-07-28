<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ClientsController;
use App\Http\Controllers\CareersController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\NewsCatController;
use App\Http\Controllers\ContactsController;
use App\Http\Controllers\FleetsController;
use App\Http\Controllers\FleetCatController;
use App\Http\Controllers\ContactInfosController;
use App\Http\Controllers\VoyageWaypointsController;
use App\Http\Controllers\NotificationsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Client;

// Public Visitor & API Routes (Postman & Guest Accessible)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'clients' => Client::all(),
        'fleets' => \App\Models\Fleet::all(),
        'news' => \App\Models\News::all(),
        'notifications' => \App\Models\Notification::where('status', 'active')->get(),
        'careers' => \App\Models\Career::where('status', 'open')->get(),
    ]);
});

// Public GET & POST Endpoints (Support JSON responses for Postman & API testing)
Route::get('/fleets', [FleetsController::class, 'index'])->name('public.fleets');
Route::get('/clients', [ClientsController::class, 'index'])->name('public.clients');
Route::get('/careers', [CareersController::class, 'index'])->name('public.careers');
Route::get('/news', [NewsController::class, 'index'])->name('public.news');
Route::get('/notifications', [NotificationsController::class, 'index'])->name('public.notifications');
Route::get('/news-category', [NewsCatController::class, 'index'])->name('public.news-category');
Route::get('/contact-infos', [ContactInfosController::class, 'index'])->name('public.contact-infos');
Route::get('/voyage-waypoints', [VoyageWaypointsController::class, 'index'])->name('public.voyage-waypoints');

// Public Contact Form Submission (Guests & Postman API testing)
Route::post('/contacts', [ContactsController::class, 'store'])->name('contacts.store');

// AISStream.io Telemetry Ingestion Endpoint
Route::post('/api/ais/ingest', [\App\Http\Controllers\AisIngestController::class, 'ingest'])->name('ais.ingest');

// Protected Admin Dashboard Management Routes
Route::middleware(['auth', 'verified'])->prefix('dashboard')->group(function () {
    // Dashboard Overview
    Route::get('/', function () {
        return Inertia::render('Dashboard/Index', [
            'fleetsCount' => \App\Models\Fleet::count(),
            'newsCount' => \App\Models\News::count(),
            'clientsCount' => \App\Models\Client::count(),
            'careersCount' => \App\Models\Career::count(),
            'notificationsCount' => \App\Models\Notification::count(),
        ]);
    })->name('dashboard');

    // Fleets Management
    Route::get('/fleets', [FleetsController::class, 'index'])->name('fleets.index');
    Route::get('/fleets/create', [FleetsController::class, 'create'])->name('fleets.create');
    Route::post('/fleets', [FleetsController::class, 'store'])->name('fleets.store');
    Route::post('/fleets/categories', [FleetsController::class, 'storeCategory'])->name('fleets.categories.store');
    Route::post('/fleets/parse-pdf', [FleetsController::class, 'parsePdf'])->name('fleets.parse-pdf');
    Route::get('/fleets/{id}/edit', [FleetsController::class, 'edit'])->name('fleets.edit');
    Route::put('/fleets/{id}', [FleetsController::class, 'update'])->name('fleets.update');
    Route::delete('/fleets/{id}', [FleetsController::class, 'destroy'])->name('fleets.destroy');

    // News & Articles Management
    Route::get('/news', [NewsController::class, 'index'])->name('news.index');
    Route::get('/news/create', [NewsController::class, 'create'])->name('news.create');
    Route::post('/news', [NewsController::class, 'store'])->name('news.store');
    Route::get('/news/{id}/edit', [NewsController::class, 'edit'])->name('news.edit');
    Route::put('/news/{id}', [NewsController::class, 'update'])->name('news.update');
    Route::delete('/news/{id}', [NewsController::class, 'destroy'])->name('news.destroy');

    // Careers Management
    Route::get('/careers', [CareersController::class, 'index'])->name('careers.index');
    Route::post('/careers', [CareersController::class, 'store'])->name('careers.store');

    // Clients Management
    Route::get('/clients', [ClientsController::class, 'index'])->name('clients.index');
    Route::post('/clients', [ClientsController::class, 'store'])->name('clients.store');
    Route::put('/clients/{id}', [ClientsController::class, 'update'])->name('clients.update');
    Route::delete('/clients/{id}', [ClientsController::class, 'destroy'])->name('clients.destroy');

    // Notifications Management
    Route::get('/notifications', [NotificationsController::class, 'index'])->name('notifications.index');

    // Contacts Admin Management
    Route::get('/contacts', [ContactsController::class, 'index'])->name('contacts.index');
    Route::put('/contacts/{id}', [ContactsController::class, 'update'])->name('contacts.update');
    Route::delete('/contacts/{id}', [ContactsController::class, 'destroy'])->name('contacts.destroy');

    // Auxiliaries & Telemetry
    Route::get('/news-category', [NewsCatController::class, 'index'])->name('news-category.index');
    Route::get('/fleet-category', [FleetCatController::class, 'index'])->name('fleet-category.index');
    Route::get('/voyage-waypoints', [VoyageWaypointsController::class, 'index'])->name('voyage-waypoints.index');

    // Profile Settings
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
