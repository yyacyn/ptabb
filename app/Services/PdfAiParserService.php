<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Smalot\PdfParser\Parser as PdfParser;

class PdfAiParserService
{
    /**
     * Parse vessel PDF specification document using OpenRouter AI Models with fallback chain.
     */
    public function parsePdfDocument(string $filePath): array
    {
        $text = $this->extractTextFromPdf($filePath);

        if (empty(trim($text))) {
            return [
                'success' => false,
                'message' => 'Unable to read text from PDF file.',
            ];
        }

        // 1. Run local deterministic parser tuned for ABB Vessel Particular sheets
        $localData = $this->parseLocalRegex($text);

        // 2. Try OpenRouter AI for advanced machinery & equipment parsing if key exists
        $apiKey = env('OPENROUTER_API_KEY');
        if (!empty($apiKey)) {
            $models = [
                'nvidia/nemotron-3-ultra-550b-a55b:free',
                'google/gemma-2-9b-it:free',
                'meta-llama/llama-3.3-70b-instruct:free',
                'qwen/qwen-2.5-72b-instruct:free',
                'mistralai/mistral-7b-instruct:free',
            ];

            $systemPrompt = <<<PROMPT
You are a maritime specification parser for PT. ABB. Read the vessel specification sheet text and extract all technical details into valid JSON matching this exact structure:

{
  "ship_name": "MV. PRILLY",
  "imo_number": "8816364",
  "vessel_type": "Cement Carrier",
  "loa": "91.00",
  "lbp": "85.00",
  "breadth": "14.50",
  "depth": "7.20",
  "dwt": "4235.00",
  "capacity": "3577.14",
  "gross_tonnage": "2264",
  "net_tonnage": "680",
  "light_ship": "",
  "summer_draft": "5.95",
  "build_year": "1989",
  "flag": "INDONESIA",
  "classification_society": "RINA",
  "port_of_registry": "Jakarta",
  "call_sign": "YBDL2",
  "mmsi": "525012357",
  "hull_no": "323",
  "speed": "10.0",
  "description": "Vessel overview summary"
}

Return ONLY raw valid JSON. Do not include markdown code block backticks.
PROMPT;

            foreach ($models as $model) {
                try {
                    $response = Http::withHeaders([
                        'Authorization' => 'Bearer ' . $apiKey,
                        'HTTP-Referer' => config('app.url', 'http://localhost'),
                        'X-Title' => 'PT. ABB Fleet Spec Parser',
                        'Content-Type' => 'application/json',
                    ])->timeout(90)->post('https://openrouter.ai/api/v1/chat/completions', [
                        'model' => $model,
                        'messages' => [
                            ['role' => 'system', 'content' => $systemPrompt],
                            ['role' => 'user', 'content' => "Extract specifications from text:\n\n" . substr($text, 0, 4000)],
                        ],
                        'temperature' => 0.1,
                    ]);

                    if ($response->successful()) {
                        $rawBody = $response->json();
                        $content = $rawBody['choices'][0]['message']['content'] ?? $rawBody['choices'][0]['text'] ?? '';
                        
                        Log::info("OpenRouter response for model {$model}: " . substr($content, 0, 500));

                        if (!empty($content)) {
                            $cleaned = preg_replace('/^```(?:json)?|```$/m', '', trim($content));

                            if (preg_match('/\{[\s\S]*\}/', $cleaned, $matches)) {
                                $aiData = json_decode($matches[0], true);
                                if (json_last_error() === JSON_ERROR_NONE && is_array($aiData)) {
                                    // AI data takes priority for clean values, filling in local data where missing
                                    $merged = array_merge(array_filter($localData), array_filter($aiData));
                                    return [
                                        'success' => true,
                                        'model_used' => $model,
                                        'data' => $merged,
                                    ];
                                }
                            }
                        }
                    } else {
                        Log::warning("OpenRouter API non-successful for model {$model}: Status " . $response->status() . " - " . $response->body());
                    }
                } catch (\Exception $e) {
                    Log::warning("AI PDF parser failed for model {$model}: " . $e->getMessage());
                }
            }
        }

        // Return local deterministic parsed data if AI is unconfigured or failed
        return [
            'success' => true,
            'model_used' => 'local_parser',
            'data' => $localData,
        ];
    }

    /**
     * Local Deterministic Parser tuned for PT. ABB Vessel Particular Sheets.
     */
    private function parseLocalRegex(string $fullText): array
    {
        $extracted = [];

        // Ship Name
        if (preg_match('/(?:MV\.|M\/V)\s*([A-Z0-9\s\-]{3,30})/i', $fullText, $m) || preg_match('/\b(PRILLY|MUMBAI|IRIANA|BARUNA|KANYO|RYUOH)\b/i', $fullText, $m)) {
            $extracted['ship_name'] = trim($m[0]);
        }

        // IMO Number
        if (preg_match('/IMO\s*(?:No\.?|Number)?\s*:?\s*(\d{7})/i', $fullText, $m) || preg_match('/\b9\d{6}\b/', $fullText, $m) || preg_match('/\b8\d{6}\b/', $fullText, $m)) {
            $extracted['imo_number'] = $m[1] ?? $m[0];
        }

        // Vessel Type
        if (preg_match('/(Cement Carrier|Bulk Carrier|Tugboat|Deck Cargo Barge|Pneumatic)/i', $fullText, $m)) {
            $extracted['vessel_type'] = $m[1];
        }

        // LOA & LBP
        if (preg_match('/LOA\s*\/\s*LBP\s*:?\s*([\d\.]+)\s*m?\s*\/\s*([\d\.]+)/i', $fullText, $m)) {
            $extracted['loa'] = $m[1];
            $extracted['lbp'] = $m[2];
        } else {
            if (preg_match('/LOA\s*:?\s*([\d\.]+)/i', $fullText, $m)) $extracted['loa'] = $m[1];
            if (preg_match('/LBP\s*:?\s*([\d\.]+)/i', $fullText, $m)) $extracted['lbp'] = $m[1];
        }

        // Breadth & Depth
        if (preg_match('/Breadth\s*(?:\(MLD\))?\s*:?\s*([\d\.]+)/i', $fullText, $m)) $extracted['breadth'] = $m[1];
        if (preg_match('/Depth\s*(?:\(MLD\))?\s*:?\s*([\d\.]+)/i', $fullText, $m)) $extracted['depth'] = $m[1];

        // Summer Draft
        if (preg_match('/Summer\s*Draft\s*:?\s*([\d\.]+)/i', $fullText, $m)) $extracted['summer_draft'] = $m[1];

        // Deadweight DWT
        if (preg_match('/(?:Summer\s*)?DWT\s*:?\s*([\d\.,]+)/i', $fullText, $m)) $extracted['dwt'] = str_replace(',', '', $m[1]);

        // Cargo / Hold Capacity
        if (preg_match('/(?:Hold\s*Capacity|Cargo\s*Capacity)\s*:?\s*([\d\.,]+)/i', $fullText, $m)) $extracted['capacity'] = str_replace(',', '', $m[1]);

        // GT & NT
        if (preg_match('/GT\s*\/\s*NT\s*:?\s*([\d\.,]+)\s*t?\s*\/\s*([\d\.,]+)/i', $fullText, $m)) {
            $extracted['gross_tonnage'] = str_replace(',', '', $m[1]);
            $extracted['net_tonnage'] = str_replace(',', '', $m[2]);
        } else {
            if (preg_match('/GT\s*:?\s*([\d\.,]+)/i', $fullText, $m)) $extracted['gross_tonnage'] = str_replace(',', '', $m[1]);
            if (preg_match('/NT\s*:?\s*([\d\.,]+)/i', $fullText, $m) && !str_contains(strtolower($m[1]), 'tba')) {
                $extracted['net_tonnage'] = str_replace(',', '', $m[1]);
            }
        }

        // Light Ship
        if (preg_match('/Light\s*Ship\s*:?\s*([\d\.,]+)/i', $fullText, $m)) $extracted['light_ship'] = str_replace(',', '', $m[1]);

        // Speed
        if (preg_match('/(?:Av\.\s*Speed|Avg?\s*(?:Ship\s*)?Speed|Speed)\s*:?\s*(?:abt\.?\s*)?([\d\.]+)/i', $fullText, $m)) {
            $extracted['speed'] = $m[1];
        }

        // Build Year
        if (preg_match('/Built\s*Year\s*:?\s*(\d{4})/i', $fullText, $m)) $extracted['build_year'] = $m[1];

        // Flag / Nationality
        if (preg_match('/Nationality\s*:?\s*([A-Za-z]+)/i', $fullText, $m)) $extracted['flag'] = strtoupper($m[1]);

        // Port of Registry (Strict boundary: max 2 words, stops at next label)
        if (preg_match('/Port\s*of\s*Registry\s*:?\s*([A-Za-z]+(?:\s+[A-Za-z]+)?)/i', $fullText, $m)) {
            $extracted['port_of_registry'] = trim($m[1]);
        }

        // Classification Society (Strict boundary: max 2 tokens, e.g. RINA / BKI / NK CLASS)
        if (preg_match('/Class(?:ification)?\s*(?:Society)?\s*:?\s*([A-Za-z0-9\/]+(?:\s+[A-Za-z0-9\/]+)?)/i', $fullText, $m)) {
            $extracted['classification_society'] = trim($m[1]);
        }

        // Call Sign
        if (preg_match('/Call\s*Sign\s*:?\s*([A-Z0-9]+)/i', $fullText, $m)) $extracted['call_sign'] = $m[1];

        // MMSI
        if (preg_match('/MMSI\s*:?\s*([\d\s]+)/i', $fullText, $m)) $extracted['mmsi'] = trim($m[1]);

        // Hull No
        if (preg_match('/Hull\s*No\.?\s*:?\s*([A-Z0-9\-]+)/i', $fullText, $m)) $extracted['hull_no'] = $m[1];

        // Overview description
        $extracted['description'] = "Vessel Particulars: " . ($extracted['ship_name'] ?? 'Ship') . " (IMO " . ($extracted['imo_number'] ?? '-') . ") - DWT: " . ($extracted['dwt'] ?? '-') . "t, LOA: " . ($extracted['loa'] ?? '-') . "m, Speed: " . ($extracted['speed'] ?? '-') . " Knots.";

        return $extracted;
    }

    /**
     * Extract raw text from PDF using Smalot PDF Parser.
     */
    private function extractTextFromPdf(string $filePath): string
    {
        try {
            $parser = new PdfParser();
            $pdf = $parser->parseFile($filePath);
            return $pdf->getText();
        } catch (\Exception $e) {
            Log::error("PDF Text Extraction failed: " . $e->getMessage());
            return '';
        }
    }
}
