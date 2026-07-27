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

        if (!auth()->check()) {
            return redirect()->route('login');
        }

        return Inertia::render('Dashboard/Clients', [
            'clients' => $clients,
        ]);
    }
}
