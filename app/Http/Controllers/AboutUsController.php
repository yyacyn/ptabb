<?php

namespace App\Http\Controllers;

use App\Models\Milestone;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AboutUsController extends Controller
{
    public function index(Request $request)
    {
        $milestones = Milestone::orderBy('year', 'asc')->get();

        if ($request->wantsJson()) {
            return response()->json($milestones);
        }

        return Inertia::render('AboutUs', [
            'milestones' => $milestones,
        ]);
    }
}
