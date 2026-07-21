<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $news = News::all();

        if ($request->wantsJson()) {
            return response()->json($news);
        }

        return Inertia::render('News', [
            'news' => $news,
        ]);
    }

}