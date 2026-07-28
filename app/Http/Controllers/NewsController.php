<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\NewsCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $news = News::all();

        if ($request->wantsJson()) {
            return response()->json($news);
        }

        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = $request->user();
        if (!in_array($user->role, ['super_admin', 'pr_admin'])) {
            abort(403, 'Only Super Admin and PR Admin can access News management.');
        }

        return Inertia::render('Dashboard/News', [
            'news' => $news,
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        if (!in_array($user->role, ['super_admin', 'pr_admin'])) {
            abort(403, 'Unauthorized access to News creation.');
        }

        return Inertia::render('Dashboard/News/Edit', [
            'article' => null,
            'categories' => NewsCategory::all(),
        ]);
    }

    public function edit($id)
    {
        $user = auth()->user();
        if (!in_array($user->role, ['super_admin', 'pr_admin'])) {
            abort(403, 'Unauthorized access to News editing.');
        }

        $article = News::findOrFail($id);

        return Inertia::render('Dashboard/News/Edit', [
            'article' => $article,
            'categories' => NewsCategory::all(),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if ($user && !in_array($user->role, ['super_admin', 'pr_admin'])) {
            abort(403, 'Unauthorized access to News creation.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_name' => 'nullable|string|max:100',
            'category_id' => 'nullable',
            'published_at' => 'nullable|date',
            'status' => 'nullable|in:published,draft',
            'author' => 'nullable|string|max:100',
            'excerpt' => 'nullable|string',
            'featured_image' => 'nullable',
            'content' => 'required|string',
        ]);

        $dataToSave = [
            'title' => $validated['title'],
            'content' => $validated['content'],
            'category_id' => $validated['category_id'] ?? 3,
            'excerpt' => $validated['excerpt'] ?? null,
            'author' => $validated['author'] ?? ($user->name ?? 'ABB Media Team'),
            'status' => $validated['status'] ?? 'published',
            'publish_date' => $validated['published_at'] ?? now()->toDateString(),
            'slug' => Str::slug($validated['title']) . '-' . time(),
        ];

        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('news', 'public');
            $dataToSave['featured_image'] = '/storage/' . $path;
        }

        $news = News::create($dataToSave);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Article created successfully.',
                'news' => $news,
            ], 201);
        }

        return redirect()->route('news.index')->with('success', 'Article created successfully.');
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if ($user && !in_array($user->role, ['super_admin', 'pr_admin'])) {
            abort(403, 'Unauthorized access to News modification.');
        }

        $news = News::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_name' => 'nullable|string|max:100',
            'category_id' => 'nullable',
            'published_at' => 'nullable|date',
            'status' => 'nullable|in:published,draft',
            'author' => 'nullable|string|max:100',
            'excerpt' => 'nullable|string',
            'featured_image' => 'nullable',
            'content' => 'required|string',
        ]);

        $dataToSave = [
            'title' => $validated['title'],
            'content' => $validated['content'],
            'category_id' => $validated['category_id'] ?? $news->category_id ?? 3,
            'excerpt' => $validated['excerpt'] ?? null,
            'author' => $validated['author'] ?? ($user->name ?? 'ABB Media Team'),
            'status' => $validated['status'] ?? 'published',
            'publish_date' => $validated['published_at'] ?? $news->publish_date ?? now()->toDateString(),
        ];

        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('news', 'public');
            $dataToSave['featured_image'] = '/storage/' . $path;
        }

        $news->update($dataToSave);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Article updated successfully.',
                'news' => $news,
            ]);
        }

        return redirect()->route('news.index')->with('success', 'Article updated successfully.');
    }

    public function destroy($id)
    {
        $user = auth()->user();
        if ($user && !in_array($user->role, ['super_admin', 'pr_admin'])) {
            abort(403, 'Unauthorized.');
        }

        $news = News::findOrFail($id);
        $news->delete();

        return redirect()->route('news.index')->with('success', 'Article deleted successfully.');
    }
}