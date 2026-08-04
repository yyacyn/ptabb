<?php

namespace App\Http\Controllers;

use App\Models\Career;
use App\Models\Fleet;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class ChatbotController extends Controller
{
    private string $groqPrimaryModel = 'openai/gpt-oss-20b';
    private string $groqFallbackModel = 'llama-3.3-70b-versatile';

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'history' => 'nullable|array',
            'history.*.sender' => 'required|string|in:user,bot',
            'history.*.text' => 'required|string',
        ]);

        $userMessage = trim($request->input('message'));
        $rawHistory = $request->input('history', []);

        // 1. Intent Detection
        $intents = $this->detectIntent($userMessage);

        // 2. FULLTEXT / Dynamic Keyword Retrieval & Context Building
        $retrievedContext = $this->retrieveContext($userMessage, $intents);

        // 3. System Prompt Construction
        $systemPrompt = $this->buildSystemPrompt($retrievedContext);

        // 4. Format History (Last 6 message pairs = max 12 items)
        $formattedHistory = $this->formatHistory(array_slice($rawHistory, -12));

        // Assemble Messages Payload
        $messages = array_merge(
            [['role' => 'system', 'content' => $systemPrompt]],
            $formattedHistory,
            [['role' => 'user', 'content' => $userMessage]]
        );

        $groqApiKey = env('GROQ_API_KEY');
        $openRouterApiKey = config('services.openrouter.api_key', env('OPENROUTER_API_KEY'));

        // 5. & 6. Generation & Fallback Chain
        // Priority 1: Groq API (High Speed & Free Tier)
        if (!empty($groqApiKey)) {
            $reply = $this->callGroq($groqApiKey, $this->groqPrimaryModel, $messages);

            if (!$reply) {
                Log::warning("Groq primary model ({$this->groqPrimaryModel}) failed. Trying Groq fallback.");
                $reply = $this->callGroq($groqApiKey, $this->groqFallbackModel, $messages);
            }

            if ($reply) {
                return response()->json([
                    'status' => 'success',
                    'reply' => $reply,
                    'model' => 'groq',
                    'intents' => $intents,
                    'retrieved_context' => $retrievedContext
                ]);
            }
        }

        // Priority 2: OpenRouter API Fallback
        if (!empty($openRouterApiKey)) {
            $reply = $this->callOpenRouter($openRouterApiKey, 'nvidia/nemotron-3-ultra-550b-a55b:free', $messages);

            if (!$reply) {
                Log::warning("OpenRouter primary model failed. Trying OpenRouter secondary model.");
                $reply = $this->callOpenRouter($openRouterApiKey, 'inclusionai/ling-3.0-flash:free', $messages);
            }

            if ($reply) {
                return response()->json([
                    'status' => 'success',
                    'reply' => $reply,
                    'model' => 'openrouter',
                    'intents' => $intents,
                    'retrieved_context' => $retrievedContext
                ]);
            }
        }

        // Priority 3: Local Fallback Substring Matcher
        $localReply = $this->generateLocalFallback($userMessage, $intents);
        return response()->json([
            'status' => 'success',
            'reply' => $localReply,
            'model' => 'local_fallback',
            'intents' => $intents,
            'retrieved_context' => $retrievedContext
        ]);
    }

    /**
     * Step 1: Keyword-based intent detection
     */
    private function detectIntent(string $message): array
    {
        $msgLower = strtolower($message);
        $intents = [];

        $fleetKeywords = ['ship', 'vessel', 'fleet', 'cargo', 'cement', 'tugboat', 'barge', 'carrier', 'deadweight', 'dwt', 'capacity', 'imo', 'mmsi', 'transport', 'logistics', 'sea', 'maritime', 'kapal', 'armada', 'muatan', 'semen', 'tongkang', 'pelayaran', 'laut'];
        $careerKeywords = ['job', 'career', 'work', 'hire', 'hiring', 'vacancy', 'position', 'apply', 'cv', 'resume', 'recruitment', 'crew', 'salary', 'officer', 'engineer', 'captain', 'pekerjaan', 'karir', 'lowongan', 'kerja', 'lamar', 'kru', 'gaji', 'nakhoda'];
        $newsKeywords = ['news', 'article', 'update', 'press', 'announcement', 'event', 'milestone', 'published', 'berita', 'artikel', 'pengumuman', 'kabar'];
        $contactKeywords = ['contact', 'info', 'branch', 'office', 'location', 'phone', 'email', 'address', 'headquarters', 'hq', 'banyuwangi', 'singapore', 'batam', 'padang', 'tuban', 'jakarta' , 'jawa', 'sumatra', 'kalimantan', 'kontak', 'kantor', 'cabang', 'lokasi', 'telepon', 'alamat', 'pusat'];

        foreach ($fleetKeywords as $kw) {
            if (str_contains($msgLower, $kw)) {
                $intents[] = 'fleet';
                break;
            }
        }

        foreach ($careerKeywords as $kw) {
            if (str_contains($msgLower, $kw)) {
                $intents[] = 'career';
                break;
            }
        }

        foreach ($newsKeywords as $kw) {
            if (str_contains($msgLower, $kw)) {
                $intents[] = 'news';
                break;
            }
        }

        foreach ($contactKeywords as $kw) {
            if (str_contains($msgLower, $kw)) {
                $intents[] = 'contact';
                break;
            }
        }

        // If no specific intent was matched, include all categories for context breadth
        return empty($intents) ? ['fleet', 'career', 'news', 'contact'] : $intents;
    }

    /**
     * Step 2: MySQL MATCH AGAINST / LIKE Retrieval & Context Formatting
     */
    private function retrieveContext(string $userMessage, array $intents): string
    {
        $contextChunks = [];
        $sanitizedQuery = preg_replace('/[^\w\s]/u', ' ', $userMessage);
        $words = array_filter(explode(' ', $sanitizedQuery));
        $booleanSearch = implode(' ', array_map(fn($w) => '+' . $w . '*', $words));

        // Fleet Retrieval
        if (in_array('fleet', $intents)) {
            try {
                $fleets = !empty($booleanSearch)
                    ? Fleet::whereRaw("MATCH(ship_name, description, operational_area, vessel_type) AGAINST(? IN BOOLEAN MODE)", [$booleanSearch])->get()
                    : collect();
            } catch (Throwable $e) {
                $fleets = collect();
            }

            if ($fleets->isEmpty()) {
                $fleets = Fleet::where('ship_name', 'LIKE', "%{$userMessage}%")
                    ->orWhere('vessel_type', 'LIKE', "%{$userMessage}%")
                    ->orWhere('description', 'LIKE', "%{$userMessage}%")
                    ->get();
            }

            if ($fleets->isEmpty()) {
                $fleets = Fleet::latest()->get();
            }

            foreach ($fleets as $f) {
                $contextChunks[] = "Vessel: {$f->ship_name} | Type: {$f->vessel_type} | DWT: {$f->dwt} | Area: {$f->operational_area} | Status: {$f->status} | IMO: {$f->imo_number}";
            }
        }

        // Career Retrieval
        if (in_array('career', $intents)) {
            try {
                $careers = !empty($booleanSearch)
                    ? Career::whereIn('status', ['active', 'open', 'published'])->orWhereNull('status')->whereRaw("MATCH(position, department, location, description, requirements) AGAINST(? IN BOOLEAN MODE)", [$booleanSearch])->get()
                    : collect();
            } catch (Throwable $e) {
                $careers = collect();
            }

            if ($careers->isEmpty()) {
                $careers = Career::whereIn('status', ['active', 'open', 'published'])->orWhereNull('status')
                    ->where(function($q) use ($userMessage) {
                        $q->where('position', 'LIKE', "%{$userMessage}%")
                          ->orWhere('department', 'LIKE', "%{$userMessage}%")
                          ->orWhere('description', 'LIKE', "%{$userMessage}%");
                    })->get();
            }

            if ($careers->isEmpty()) {
                $careers = Career::latest()->get();
            }

            foreach ($careers as $c) {
                $contextChunks[] = "Job Vacancy: {$c->position} ({$c->department}) | Location: {$c->location} | Type: {$c->employment_type} | Status: {$c->status} | Deadline: {$c->application_deadline}";
            }
        }

        // News Retrieval
        if (in_array('news', $intents)) {
            try {
                $news = !empty($booleanSearch)
                    ? News::where('status', 'published')->whereRaw("MATCH(title, excerpt, content) AGAINST(? IN BOOLEAN MODE)", [$booleanSearch])->get()
                    : collect();
            } catch (Throwable $e) {
                $news = collect();
            }

            if ($news->isEmpty()) {
                $news = News::where('status', 'published')->latest()->get();
            }

            foreach ($news as $n) {
                $contextChunks[] = "News Article: {$n->title} | Excerpt: {$n->excerpt} | Published: {$n->published_at}";
            }
        }

        // Contact & Branch Office Info Retrieval
        if (in_array('contact', $intents)) {
            try {
                $contactInfos = \App\Models\ContactInfo::all();
                foreach ($contactInfos as $info) {
                    $contextChunks[] = "Company Contact Detail ({$info->label}): {$info->value}";
                }
            } catch (Throwable $e) {
                // Ignore if empty
            }
            $contextChunks[] = "Branch Offices & Locations: Jakarta (Head Office), Banyuwangi (Branch Office), Batam (Shipyard Facility), Singapore (Regional Representative Office).";
        }

        return implode("\n", $contextChunks);
    }

    /**
     * Step 3: System Prompt Setup
     */
    private function buildSystemPrompt(string $retrievedContext): string
    {
        return <<<EOT
You are Sarah Wijaya, Senior Customer Service & Chartering Specialist at PT Pelayaran Andalas Bahtera Baruna (PT. ABB).
You are professional, polite, helpful, and concise. Never use emojis in your text responses.

Company Background:
PT. ABB is a premier Indonesian maritime shipping company specializing in bulk cement transport, tugboats, industrial cargo logistics, and strategic regional & international maritime shipping.

Knowledge & Retrieved Database Context:
{$retrievedContext}

Strict Instructions:
1. Always respond in the exact language used by the visitor (if the user speaks Bahasa Indonesia, respond in professional Bahasa Indonesia; if English, respond in English).
2. Answer the user's questions clearly based strictly on the provided company database context.
3. CRITICAL: Never invent, guess, or hallucinate unverified contact details, phone numbers, addresses, or operational facts that are not present in the context above.
4. If specific information (e.g. detailed branch address or unlisted spec) is not present in the context, state that you do not have that exact detail in the current system context and direct them to submit an inquiry at /contacts.
5. Keep responses direct, helpful, polite, and professional without using emojis.
EOT;
    }

    /**
     * Step 4: Short-term Memory / History Formatter
     */
    private function formatHistory(array $rawHistory): array
    {
        $formatted = [];
        foreach ($rawHistory as $msg) {
            $role = ($msg['sender'] === 'user') ? 'user' : 'assistant';
            $formatted[] = [
                'role' => $role,
                'content' => $msg['text']
            ];
        }
        return $formatted;
    }

    /**
     * Groq API HTTP Request
     */
    private function callGroq(string $apiKey, string $model, array $messages): ?string
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(10)->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => $model,
                'messages' => $messages,
                'temperature' => 0.4,
                'max_tokens' => 400,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['message']['content'] ?? null;
            } else {
                Log::error("Groq LLM API error [{$model}]: " . $response->body());
            }
        } catch (Throwable $e) {
            Log::error("Exception calling Groq [{$model}]: " . $e->getMessage());
        }

        return null;
    }

    /**
     * OpenRouter HTTP Request
     */
    private function callOpenRouter(string $apiKey, string $model, array $messages): ?string
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'HTTP-Referer' => config('app.url', 'http://ptabb.test'),
                'X-Title' => 'PT. ABB Logistics Portal',
                'Content-Type' => 'application/json',
            ])->timeout(12)->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => $model,
                'messages' => $messages,
                'temperature' => 0.4,
                'max_tokens' => 350,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['message']['content'] ?? null;
            } else {
                Log::error("OpenRouter LLM API error [{$model}]: " . $response->body());
            }
        } catch (Throwable $e) {
            Log::error("Exception calling OpenRouter [{$model}]: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Step 6: Hardcoded Local Fallback Substring Matcher
     */
    private function generateLocalFallback(string $message, array $intents): string
    {
        $msgLower = strtolower($message);

        if (str_contains($msgLower, 'ship') || str_contains($msgLower, 'fleet') || str_contains($msgLower, 'vessel') || str_contains($msgLower, 'cargo')) {
            return "PT. ABB operates a specialized fleet of high-capacity bulk cement carriers and industrial logistics vessels serving domestic Indonesian ports and regional maritime trade corridors. For detailed vessel availability or chartering quotes, please visit our Fleets section or reach out via our Contact form.";
        }

        if (str_contains($msgLower, 'job') || str_contains($msgLower, 'career') || str_contains($msgLower, 'work') || str_contains($msgLower, 'apply') || str_contains($msgLower, 'crew')) {
            return "We are actively recruiting qualified seafarers, marine officers, and land-based logistics professionals. You can view all current vacancies and submit your application online directly through our Careers page.";
        }

        if (str_contains($msgLower, 'contact') || str_contains($msgLower, 'address') || str_contains($msgLower, 'phone') || str_contains($msgLower, 'location') || str_contains($msgLower, 'office')) {
            return "Our main headquarters and regional branch offices are located across key industrial ports in Indonesia. You can send us a message directly via our Contact page at /contacts or email our chartering desk.";
        }

        return "Thank you for reaching out to PT. ABB. I am here to assist you with our fleet operations, shipment inquiries, and career opportunities. For urgent chartering requirements or specific inquiries, please feel free to leave a message on our Contact page.";
    }
}
