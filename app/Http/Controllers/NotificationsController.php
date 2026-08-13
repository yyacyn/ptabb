<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Services\IndonesianHolidayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class NotificationsController extends Controller
{
    public function index(Request $request)
    {
        // Auto-sync celebration popups for current year if none exist yet
        IndonesianHolidayService::autoSyncIfNeeded();

        $notifications = Notification::latest()->get();

        if ($request->wantsJson()) {
            return response()->json($notifications);
        }

        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = $request->user();
        if (!in_array($user->role, ['super_admin', 'hr_admin'])) {
            abort(403, 'Only Super Admin and HR Admin can access Notifications management.');
        }

        return Inertia::render('Dashboard/Notifications', [
            'notifications' => $notifications,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['super_admin', 'hr_admin'])) {
            abort(403, 'Only Super Admin and HR Admin can create notifications.');
        }

        $isCelebration = $request->input('type') === 'celebration';

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:home,career,celebration',
            'content' => $isCelebration ? 'nullable|string|max:255' : 'required|string|max:255',
            'status' => 'required|string|in:active,inactive,scheduled',
            'start_date' => $isCelebration ? 'required|date' : 'nullable|date',
            'end_date' => $isCelebration ? 'required|date|after_or_equal:start_date' : 'nullable|date|after_or_equal:start_date',
            'image' => $isCelebration ? 'required|image|mimes:jpeg,jpg,png,webp,svg|max:5120' : 'nullable|image|mimes:jpeg,jpg,png,webp,svg|max:5120',
        ]);

        // Enforce BR-06: Max 1 active popup banner per type (home, career, celebration)
        if ($validated['status'] === 'active') {
            Notification::where('type', $validated['type'])
                ->where('status', 'active')
                ->update(['status' => 'inactive']);
        }

        if ($request->hasFile('image')) {
            $path = \App\Services\ImageOptimizationService::uploadAndOptimize($request->file('image'), 'notifications');
            $validated['image'] = '/storage/' . $path;
        }

        Notification::create($validated);

        return redirect()->back()->with('success', 'Notification popup created successfully.');
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!in_array($user->role, ['super_admin', 'hr_admin'])) {
            abort(403, 'Only Super Admin and HR Admin can update notifications.');
        }

        $notification = Notification::findOrFail($id);
        $isCelebration = $request->input('type') === 'celebration';

        $rules = [
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:home,career,celebration',
            'content' => $isCelebration ? 'nullable|string|max:255' : 'required|string|max:255',
            'status' => 'required|string|in:active,inactive,scheduled',
            'start_date' => $isCelebration ? 'required|date' : 'nullable|date',
            'end_date' => $isCelebration ? 'required|date|after_or_equal:start_date' : 'nullable|date|after_or_equal:start_date',
            'image' => 'nullable',
        ];

        if ($isCelebration && !$request->hasFile('image') && empty($notification->image)) {
            $rules['image'] = 'required|image|mimes:jpeg,jpg,png,webp,svg|max:5120';
        } elseif ($request->hasFile('image')) {
            $rules['image'] = 'image|mimes:jpeg,jpg,png,webp,svg|max:5120';
        }

        $validated = $request->validate($rules);

        // Enforce BR-06: Max 1 active popup banner per type (home, career, celebration)
        if ($validated['status'] === 'active') {
            Notification::where('type', $validated['type'])
                ->where('id', '!=', $notification->id)
                ->where('status', 'active')
                ->update(['status' => 'inactive']);
        }

        if ($request->hasFile('image')) {
            if ($notification->image && str_contains($notification->image, '/storage/')) {
                $oldImg = ltrim(str_replace('/storage/', '', $notification->image), '/');
                if (Storage::disk('public')->exists($oldImg)) {
                    Storage::disk('public')->delete($oldImg);
                }
            }

            $path = \App\Services\ImageOptimizationService::uploadAndOptimize($request->file('image'), 'notifications');
            $validated['image'] = '/storage/' . $path;
        } elseif (!empty($validated['image']) && is_string($validated['image'])) {
            // Retain existing image path
            unset($validated['image']);
        }

        $notification->update($validated);

        return redirect()->back()->with('success', 'Notification popup updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!in_array($user->role, ['super_admin', 'hr_admin'])) {
            abort(403, 'Only Super Admin and HR Admin can delete notifications.');
        }

        $notification = Notification::findOrFail($id);

        if ($notification->image && str_contains($notification->image, '/storage/')) {
            $img = ltrim(str_replace('/storage/', '', $notification->image), '/');
            if (Storage::disk('public')->exists($img)) {
                Storage::disk('public')->delete($img);
            }
        }

        $notification->delete();

        return redirect()->back()->with('success', 'Notification popup deleted successfully.');
    }

    /**
     * Synchronize Indonesian Celebration Day popups from official Kemendesa SKB 3 Menteri API.
     */
    public function syncHolidays(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['super_admin', 'hr_admin'])) {
            abort(403, 'Only Super Admin and HR Admin can sync holiday popups.');
        }

        $count = IndonesianHolidayService::syncHolidays();

        return redirect()->back()->with('success', "Indonesian holiday celebration popups ({$count}) updated successfully.");
    }

    /**
     * Generate announcement popup content message using AI (Groq / OpenRouter API with local fallback).
     */
    public function generateAiContent(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['super_admin', 'hr_admin'])) {
            abort(403, 'Only Super Admin and HR Admin can generate AI content.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:home,career,celebration',
            'start_date' => 'nullable|string',
            'end_date' => 'nullable|string',
        ]);

        $title = trim($validated['title']);
        $type = $validated['type'];
        $startDate = $validated['start_date'] ?? null;
        $endDate = $validated['end_date'] ?? null;

        $prompt = "Create a professional, warm, and inspiring website pop-up announcement message (in English) for PT. Pelayaran Andalas Bahtera Baruna (PT. ABB), a leading Indonesian maritime shipping & logistics company.\n\n";
        $prompt .= "Topic / Title: {$title}\n";
        $prompt .= "Pop-up Category: {$type}\n";
        if (!empty($startDate)) {
            $prompt .= "Event Schedule: {$startDate}" . (!empty($endDate) && $endDate !== $startDate ? " to {$endDate}" : "") . "\n";
        }

        $prompt .= "\nInstructions:\n";
        if ($type === 'celebration') {
            $prompt .= "- Write a warm, respectful holiday greeting from PT. Pelayaran Andalas Bahtera Baruna to employees, maritime partners, and visitors.\n";
            $prompt .= "- Keep it inspiring and concise (strictly under 250 characters, 1 to 2 sentences max).\n";
            $prompt .= "- Do NOT include markdown formatting or quotes. Return raw message text only.\n";
        } elseif ($type === 'career') {
            $prompt .= "- Write an engaging recruitment / career announcement for seafarers and corporate job seekers.\n";
            $prompt .= "- Highlight PT. ABB's commitment to safety, crew well-being, and maritime excellence.\n";
            $prompt .= "- Keep it concise (strictly under 250 characters, 1 to 2 sentences max). Do NOT include markdown code blocks.\n";
        } else {
            $prompt .= "- Write a clear, professional sitewide announcement for PT. ABB clients and visitors.\n";
            $prompt .= "- Keep it concise (strictly under 250 characters, 1 to 2 sentences max). Do NOT include markdown code blocks.\n";
        }

        $generatedText = null;

        // 1. Try Groq API
        $groqKey = config('services.groq.key', env('GROQ_API_KEY'));
        if (!empty($groqKey)) {
            $generatedText = $this->callLlmGroq($groqKey, 'llama-3.3-70b-versatile', $prompt);
            if (!$generatedText) {
                $generatedText = $this->callLlmGroq($groqKey, 'openai/gpt-oss-20b', $prompt);
            }
        }

        // 2. Try OpenRouter API
        if (empty($generatedText)) {
            $openRouterKey = config('services.openrouter.api_key', config('services.openrouter.key', env('OPENROUTER_API_KEY')));
            if (!empty($openRouterKey)) {
                $generatedText = $this->callLlmOpenRouter($openRouterKey, 'google/gemma-2-9b-it:free', $prompt);
                if (!$generatedText) {
                    $generatedText = $this->callLlmOpenRouter($openRouterKey, 'nvidia/nemotron-3-ultra-550b-a55b:free', $prompt);
                }
            }
        }

        // 3. Fallback Local Generator if AI keys are unconfigured or APIs timed out
        if (empty($generatedText)) {
            if ($type === 'celebration') {
                $generatedText = "PT. Pelayaran Andalas Bahtera Baruna mengucapkan {$title}. Semoga momen bermakna ini membawa kedamaian, keberkahan, serta semangat kebersamaan bagi seluruh insan maritim dan keluarga.";
            } elseif ($type === 'career') {
                $generatedText = "Bergabunglah bersama PT. Pelayaran Andalas Bahtera Baruna dalam memperkuat armada logistik maritim Indonesia. Kami mengundang para profesional dan pelaut handal untuk membangun karir cemerlang di industri pelayaran nasional.";
            } else {
                $generatedText = "PT. Pelayaran Andalas Bahtera Baruna senantiasa berkomitmen memberikan layanan pengangkutan barang curah dan armada kapal berkualitas tinggi. Temukan informasi terbaru mengenai operasional dan kemitraan maritim kami.";
            }
        }

        $cleanText = mb_substr(trim($generatedText), 0, 255);

        return response()->json([
            'success' => true,
            'content' => $cleanText,
        ]);
    }

    private function callLlmGroq(string $apiKey, string $model, string $prompt): ?string
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(10)->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ],
                'temperature' => 0.9,
                'max_tokens' => 300,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['message']['content'] ?? null;
            }
        } catch (\Throwable $e) {
            Log::warning("Groq AI popup generator failed [{$model}]: " . $e->getMessage());
        }

        return null;
    }

    private function callLlmOpenRouter(string $apiKey, string $model, string $prompt): ?string
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'HTTP-Referer' => config('app.url', 'http://localhost'),
                'X-Title' => 'PT. ABB Notifications Generator',
                'Content-Type' => 'application/json',
            ])->timeout(12)->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ],
                'temperature' => 0.6,
                'max_tokens' => 300,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['message']['content'] ?? null;
            }
        } catch (\Throwable $e) {
            Log::warning("OpenRouter AI popup generator failed [{$model}]: " . $e->getMessage());
        }

        return null;
    }
}