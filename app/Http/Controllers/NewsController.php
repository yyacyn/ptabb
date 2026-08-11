<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\NewsCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $news = News::with('category')->latest()->get();
        $categories = NewsCategory::all();

        if ($request->wantsJson()) {
            return response()->json($news);
        }

        if ($request->is('dashboard*')) {
            $user = $request->user();
            if (!$user || !in_array($user->role, ['super_admin', 'pr_admin'])) {
                abort(403, 'Only Super Admin and PR Admin can access News management.');
            }

            return Inertia::render('Dashboard/News', [
                'news' => $news,
                'categories' => $categories,
            ]);
        }

        return Inertia::render('News', [
            'news' => $news,
            'categories' => $categories,
        ]);
    }

    public function show(Request $request, $slugOrId)
    {
        $article = News::with('category')
            ->where('slug', $slugOrId)
            ->orWhere('id', $slugOrId)
            ->firstOrFail();

        // Increment view count
        $article->increment('view_count');

        if ($request->wantsJson()) {
            return response()->json($article);
        }

        $relatedNews = News::with('category')
            ->where('id', '!=', $article->id)
            ->when($article->category_id, function ($query, $categoryId) {
                return $query->where('category_id', $categoryId);
            })
            ->latest()
            ->take(3)
            ->get();

        return Inertia::render('News/Show', [
            'article' => $article,
            'relatedNews' => $relatedNews,
        ]);
    }

    public function incrementView(Request $request, $id)
    {
        $article = News::where('id', $id)->orWhere('slug', $id)->first();

        if (!$article) {
            return response()->json(['message' => 'Article not found'], 404);
        }

        $article->increment('view_count');

        return response()->json([
            'success' => true,
            'id' => $article->id,
            'view_count' => $article->view_count,
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
            'authors' => News::select('author')->whereNotNull('author')->distinct()->orderBy('author')->pluck('author'),
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
            'authors' => News::select('author')->whereNotNull('author')->distinct()->orderBy('author')->pluck('author'),
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
            'publish_date' => 'nullable|date',
            'status' => 'nullable|in:published,draft',
            'author' => 'nullable|string|max:100',
            'excerpt' => 'nullable|string|max:500',
            'featured_image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'content' => 'required|string|max:10000',
        ], [
            'title.max' => 'The article title must not be greater than 255 characters.',
            'content.max' => 'The article content must not exceed 10000 characters.',
            'featured_image.required' => 'The header featured image is required.',
            'featured_image.image' => 'The featured image must be a valid image file.',
            'featured_image.max' => 'The featured image may not be greater than 5MB.',
        ]);

        $dataToSave = [
            'title' => $validated['title'],
            'meta_title' => $validated['title'],
            'content' => $validated['content'],
            'category_id' => $validated['category_id'] ?? 3,
            'excerpt' => $validated['excerpt'] ?? null,
            'author' => $validated['author'] ?? ($user->name ?? 'ABB Media Team'),
            'status' => $validated['status'] ?? 'published',
            'publish_date' => $validated['publish_date'] ?? now()->toDateString(),
            'slug' => Str::slug($validated['title']) . '-' . time(),
        ];

        if ($request->hasFile('featured_image')) {
            $path = \App\Services\ImageOptimizationService::uploadAndOptimize($request->file('featured_image'), 'news');
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
            'publish_date' => 'nullable|date',
            'status' => 'nullable|in:published,draft',
            'author' => 'nullable|string|max:100',
            'excerpt' => 'nullable|string|max:500',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'content' => 'required|string|max:10000',
        ], [
            'title.max' => 'The article title must not be greater than 255 characters.',
            'content.max' => 'The article content must not exceed 10000 characters.',
            'featured_image.image' => 'The featured image must be a valid image file.',
            'featured_image.max' => 'The featured image may not be greater than 5MB.',
        ]);

        $dataToSave = [
            'title' => $validated['title'],
            'meta_title' => $validated['title'],
            'content' => $validated['content'],
            'category_id' => $validated['category_id'] ?? $news->category_id ?? 3,
            'excerpt' => $validated['excerpt'] ?? null,
            'author' => $validated['author'] ?? ($user->name ?? 'ABB Media Team'),
            'status' => $validated['status'] ?? 'published',
            'publish_date' => $validated['publish_date'] ?? $news->publish_date ?? now()->toDateString(),
        ];

        if ($request->hasFile('featured_image')) {
            if ($news->featured_image && str_contains($news->featured_image, '/storage/')) {
                $oldImg = ltrim(str_replace('/storage/', '', $news->featured_image), '/');
                if (Storage::disk('public')->exists($oldImg)) {
                    Storage::disk('public')->delete($oldImg);
                }
            }

            $path = \App\Services\ImageOptimizationService::uploadAndOptimize($request->file('featured_image'), 'news');
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

        $news = News::withTrashed()->findOrFail($id);

        if ($news->featured_image && str_contains($news->featured_image, '/storage/')) {
            $img = ltrim(str_replace('/storage/', '', $news->featured_image), '/');
            if (Storage::disk('public')->exists($img)) {
                Storage::disk('public')->delete($img);
            }
        }

        $news->forceDelete();

        return redirect()->route('news.index')->with('success', 'Article deleted successfully.');
    }
}