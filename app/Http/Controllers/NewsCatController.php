<?php

namespace App\Http\Controllers;

use App\Models\NewsCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NewsCatController extends Controller
{
    /**
     * Display a listing of the news categories.
     *
     * Supports Inertia rendering for frontend and JSON responses for API testing.
     */
    public function index(Request $request)
    {
        $newsCategories = NewsCategory::all();

        if ($request->wantsJson()) {
            return response()->json($newsCategories);
        }

        return Inertia::render('NewsCategory/Index', [
            'newsCategories' => $newsCategories,
        ]);
    }
}