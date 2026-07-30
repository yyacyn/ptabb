<?php

namespace App\Http\Controllers;

use App\Models\Fleet;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServicesController extends Controller
{
    public function index(Request $request)
    {
        $fleets = Fleet::where('status', 'active')->orWhere('status', 'available')->take(6)->get();
        if ($fleets->isEmpty()) {
            $fleets = Fleet::take(6)->get();
        }

        $clients = Client::take(10)->get();

        if ($request->wantsJson()) {
            return response()->json([
                'fleets' => $fleets,
                'clients' => $clients,
            ]);
        }

        return Inertia::render('Services', [
            'fleets' => $fleets,
            'clients' => $clients,
        ]);
    }
}
