<?php

use App\Http\Controllers\AboutUsController;
use App\Http\Controllers\AisIngestController;
use App\Http\Controllers\CareersController;
use App\Http\Controllers\ClientsController;
use App\Http\Controllers\ContactsController;
use App\Http\Controllers\ContactInfosController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FleetCatController;
use App\Http\Controllers\FleetsController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MilestonesController;
use App\Http\Controllers\NewsCatController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ServicesController;
use App\Http\Controllers\VoyageWaypointsController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

// Public Visitor & API Routes (Postman & Guest Accessible)
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about-us', [AboutUsController::class, 'index'])->name('public.about');
Route::get('/about', function () {
    return redirect()->route('public.about');
});
Route::get('/services', [ServicesController::class, 'index'])->name('public.services');

// Public GET & POST Endpoints (Support JSON responses for Postman & API testing)
Route::get('/fleets', [FleetsController::class, 'index'])->name('public.fleets');
Route::get('/fleets/{id}', [FleetsController::class, 'show'])->name('public.fleets.show');
Route::get('/clients', [ClientsController::class, 'index'])->name('public.clients');
Route::get('/careers', [CareersController::class, 'index'])->name('public.careers');
Route::get('/news', [NewsController::class, 'index'])->name('public.news');
Route::get('/notifications', [NotificationsController::class, 'index'])->name('public.notifications');
Route::get('/news-category', [NewsCatController::class, 'index'])->name('public.news-category');
Route::get('/fleet-category', [FleetCatController::class, 'index'])->name('public.fleet-category');
Route::get('/voyage-waypoints', [VoyageWaypointsController::class, 'index'])->name('public.voyage-waypoints');
Route::get('/milestones', [MilestonesController::class, 'index'])->name('public.milestones');

// Public Contact Form Submission (Guests & Postman API testing)
Route::post('/contacts', [ContactsController::class, 'store'])->name('contacts.store');

// AISStream.io Telemetry Ingestion Endpoint & Simulator Trigger
Route::post('/api/ais/ingest', [AisIngestController::class, 'ingest'])->name('ais.ingest');
Route::get('/api/ais/simulate', [AisIngestController::class, 'simulate'])->name('ais.simulate');

// Utility Helper Routes
Route::get('/setup-storage-link', function () {
    Artisan::call('storage:link', ['--force' => true]);
    return 'Storage link complete!';
});

Route::get('/run-migrate', function () {
    Artisan::call('migrate', ['--force' => true]);
    return 'Migration complete!';
});

Route::get('/run-seed', function () {
    Artisan::call('db:seed', ['--force' => true]);
    return 'Seeding complete!';
});

Route::get('/run-optimize', function () {
    Artisan::call('config:cache');
    Artisan::call('route:cache');
    Artisan::call('view:cache');
    return 'Optimization complete!';
});

Route::get('/clear-cache', function () {
    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    return 'Cache cleared!';
});

// Protected Admin Dashboard Management Routes
Route::middleware(['auth', 'verified'])->prefix('dashboard')->group(function () {
    // Dashboard Overview
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

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
    Route::put('/careers/{id}', [CareersController::class, 'update'])->name('careers.update');
    Route::delete('/careers/{id}', [CareersController::class, 'destroy'])->name('careers.destroy');

    // Clients Management
    Route::get('/clients', [ClientsController::class, 'index'])->name('clients.index');
    Route::post('/clients', [ClientsController::class, 'store'])->name('clients.store');
    Route::put('/clients/{id}', [ClientsController::class, 'update'])->name('clients.update');
    Route::delete('/clients/{id}', [ClientsController::class, 'destroy'])->name('clients.destroy');

    // Milestones Management
    Route::get('/milestones', [MilestonesController::class, 'index'])->name('milestones.index');
    Route::post('/milestones', [MilestonesController::class, 'store'])->name('milestones.store');
    Route::put('/milestones/{id}', [MilestonesController::class, 'update'])->name('milestones.update');
    Route::delete('/milestones/{id}', [MilestonesController::class, 'destroy'])->name('milestones.destroy');

    // Notifications Management
    Route::get('/notifications', [NotificationsController::class, 'index'])->name('notifications.index');
    Route::post('/notifications', [NotificationsController::class, 'store'])->name('notifications.store');
    Route::put('/notifications/{id}', [NotificationsController::class, 'update'])->name('notifications.update');
    Route::delete('/notifications/{id}', [NotificationsController::class, 'destroy'])->name('notifications.destroy');

    // Contacts Admin Management
    Route::get('/contacts', [ContactsController::class, 'index'])->name('contacts.index');
    Route::put('/contacts/{id}', [ContactsController::class, 'update'])->name('contacts.update');
    Route::delete('/contacts/{id}', [ContactsController::class, 'destroy'])->name('contacts.destroy');

    // Auxiliaries & Telemetry
    Route::get('/news-category', [NewsCatController::class, 'index'])->name('news-category.index');
    Route::get('/fleet-category', [FleetCatController::class, 'index'])->name('fleet-category.index');
    Route::post('/fleet-category', [FleetCatController::class, 'store'])->name('fleet-category.store');
    Route::put('/fleet-category/{id}', [FleetCatController::class, 'update'])->name('fleet-category.update');
    Route::delete('/fleet-category/{id}', [FleetCatController::class, 'destroy'])->name('fleet-category.destroy');
    Route::get('/voyage-waypoints', [VoyageWaypointsController::class, 'index'])->name('voyage-waypoints.index');

    // User Management (Super Admin Only)
    Route::get('/users', [UsersController::class, 'index'])->name('users.index');
    Route::post('/users', [UsersController::class, 'store'])->name('users.store');
    Route::put('/users/{id}', [UsersController::class, 'update'])->name('users.update');
    Route::delete('/users/{id}', [UsersController::class, 'destroy'])->name('users.destroy');

    // HQ Contact Info Management (Super Admin Only)
    Route::get('/contact-info', [ContactInfosController::class, 'index'])->name('contact-info.index');
    Route::post('/contact-info', [ContactInfosController::class, 'store'])->name('contact-info.store');
    Route::put('/contact-info/{id}', [ContactInfosController::class, 'update'])->name('contact-info.update');
    Route::delete('/contact-info/{id}', [ContactInfosController::class, 'destroy'])->name('contact-info.destroy');

    // Profile Settings
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
