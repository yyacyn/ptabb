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

// Public GET endpoints (support JSON responses for Postman & API testing)
Route::get('/fleets', [FleetsController::class, 'index'])->name('fleets.index');
Route::get('/clients', [ClientsController::class, 'index'])->name('clients.index');
Route::get('/careers', [CareersController::class, 'index'])->name('careers.index');
Route::get('/news', [NewsController::class, 'index'])->name('news.index');
Route::get('/news-category', [NewsCatController::class, 'index'])->name('news-category.index');
Route::get('/fleet-category', [FleetCatController::class, 'index'])->name('fleet-category.index');
Route::get('/contact-infos', [ContactInfosController::class, 'index'])->name('contact-infos.index');
Route::get('/voyage-waypoints', [VoyageWaypointsController::class, 'index'])->name('voyage-waypoints.index');
Route::get('/notifications', [NotificationsController::class, 'index'])->name('notifications.index');
Route::get('/contacts', [ContactsController::class, 'index'])->name('contacts.index');

// Protected Admin Mutation & Dashboard routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard/Index', [
            'fleetsCount' => \App\Models\Fleet::count(),
            'newsCount' => \App\Models\News::count(),
            'clientsCount' => \App\Models\Client::count(),
            'careersCount' => \App\Models\Career::count(),
            'notificationsCount' => \App\Models\Notification::count(),
        ]);
    })->name('dashboard');

    Route::get('/fleets/create', [FleetsController::class, 'create'])->name('fleets.create');
    Route::post('/fleets', [FleetsController::class, 'store'])->name('fleets.store');
    Route::get('/fleets/{id}/edit', [FleetsController::class, 'edit'])->name('fleets.edit');
    Route::put('/fleets/{id}', [FleetsController::class, 'update'])->name('fleets.update');
    Route::delete('/fleets/{id}', [FleetsController::class, 'destroy'])->name('fleets.destroy');

    Route::post('/careers', [CareersController::class, 'store'])->name('careers.store');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/contacts', [ContactsController::class, 'index'])->name('contacts.index');

require __DIR__.'/auth.php';

