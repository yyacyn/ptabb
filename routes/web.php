<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ClientsController;
use App\Http\Controllers\CareersController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\NewsCatController;
use App\Http\Controllers\ContactsController;
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
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/clients', [ClientsController::class, 'index'])->name('clients.index');
Route::get('/careers', [CareersController::class, 'index'])->name('careers.index');
Route::get('/news', [NewsController::class, 'index'])->name('news.index');
Route::get('/news-category', [NewsCatController::class, 'index'])->name('news-category.index');
Route::get('/contacts', [ContactsController::class, 'index'])->name('contacts.index');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

