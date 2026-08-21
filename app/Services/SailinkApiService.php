<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SailinkApiService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected ?string $lastError = null;

    public function __construct()
    {
        $this->baseUrl = config('services.sailink.base_url', 'https://navigatorplus.sailink.id/api/v22/remote');
        $this->apiKey = config('services.sailink.key') ?: 'aa9eff47ff6c15793ae4752993975933';
    }

    public function getLastError(): ?string
    {
        return $this->lastError;
    }

    /**
     * Fetch real-time position & weather data for a given vessel IP address.
     *
     * @param string $ipAddress
     * @return array|null Parsed data or null on failure
     */
    public function getVesselPosition(string $ipAddress): ?array
    {
        $this->lastError = null;

        if (empty($ipAddress)) {
            $this->lastError = 'Vessel IP address is empty';
            return null;
        }

        if (empty($this->apiKey)) {
            $this->lastError = 'Sailink API key is unconfigured';
            return null;
        }

        try {
            $url = rtrim($this->baseUrl, '/') . '/' . $this->apiKey . '/' . trim($ipAddress);
            $json = null;
            $rawBody = null;

            try {
                $response = Http::timeout(15)
                    ->withoutVerifying()
                    ->withHeaders([
                        'Accept' => 'application/json, text/plain, */*',
                        'Accept-Language' => 'en-US,en;q=0.9',
                    ])
                    ->withUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
                    ->get($url);

                $rawBody = $response->body();
                if ($response->successful()) {
                    $json = $response->json();
                } else {
                    $this->lastError = "HTTP error {$response->status()}: " . substr(strip_tags($rawBody), 0, 150);
                }
            } catch (\Throwable $httpEx) {
                $this->lastError = "Http facade error: " . $httpEx->getMessage();
                Log::warning("Laravel Http facade failed for IP {$ipAddress}, attempting raw cURL: " . $httpEx->getMessage());
            }

            // Fallback to raw cURL if Laravel Http failed on cPanel hosting
            if (empty($json) && function_exists('curl_init')) {
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 15);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Accept: application/json, text/plain, */*',
                    'Accept-Language: en-US,en;q=0.9',
                ]);
                curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
                $curlBody = curl_exec($ch);
                $curlErr = curl_error($ch);
                curl_close($ch);

                if ($curlBody) {
                    $rawBody = $curlBody;
                    $json = json_decode($curlBody, true);
                } else if ($curlErr) {
                    $this->lastError = "cURL error: {$curlErr}";
                }
            }

            if (empty($json) || empty($json['data'])) {
                $snippet = $rawBody ? substr(trim(preg_replace('/\s+/', ' ', strip_tags($rawBody))), 0, 120) : 'No response';
                $this->lastError = "API returned: [{$snippet}]";
                Log::warning("Sailink API request returned empty or invalid data for IP {$ipAddress}: {$snippet}");
                return null;
            }

            $data = $json['data'] ?? [];

            $sailink = $data['sailink'] ?? null;
            $thuraya = $data['thuraya'] ?? null;
            $iridium = $data['iridium'] ?? null;

            $sailinkIsUp = $sailink && strtoupper($sailink['status'] ?? '') === 'UP' && !empty($sailink['lat']);

            if ($sailinkIsUp) {
                $activeSource = $sailink;
                $provider = 'sailink';
            } elseif ($thuraya && !empty($thuraya['lat'])) {
                $activeSource = $thuraya;
                $provider = 'thuraya (fallback)';
            } elseif ($iridium && !empty($iridium['lat'])) {
                $activeSource = $iridium;
                $provider = 'iridium (fallback)';
            } else {
                $activeSource = $sailink ?: ($thuraya ?: $iridium);
                $provider = $sailink ? 'sailink' : ($thuraya ? 'thuraya' : 'iridium');
            }

            if (!$activeSource || empty($activeSource['lat']) || empty($activeSource['lon'])) {
                return null;
            }

            // Clean numerical values
            $lat = (float) $activeSource['lat'];
            $lon = (float) $activeSource['lon'];
            
            // Extract numeric heading (e.g. "330°" -> 330)
            $headingStr = $activeSource['heading'] ?? '0';
            preg_match('/(\d+(\.\d+)?)/', $headingStr, $headingMatch);
            $heading = isset($headingMatch[1]) ? (float) $headingMatch[1] : 0.0;

            // Extract numeric speed (e.g. "8.64 Knots" -> 8.64)
            $speedStr = $activeSource['speed'] ?? '0';
            preg_match('/(\d+(\.\d+)?)/', $speedStr, $speedMatch);
            $speed = isset($speedMatch[1]) ? (float) $speedMatch[1] : 0.0;

            $rawStatus = $sailink['status'] ?? ($activeSource['status'] ?? 'UNKNOWN');
            $isDown = strtoupper($rawStatus) === 'DOWN';

            return [
                'provider' => $provider,
                'status' => $isDown ? 'DOWN' : 'UP',
                'is_down' => $isDown,
                'latitude' => $lat,
                'longitude' => $lon,
                'heading' => $heading,
                'speed_knots' => $speed,
                'dms' => $activeSource['dms'] ?? null,
                'date_time' => $activeSource['dateTime'] ?? null,
                'weather' => $sailink['weather'] ?? ($activeSource['weather'] ?? null),
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            Log::error("Sailink API exception for IP {$ipAddress}: " . $e->getMessage());
            return null;
        }
    }
}
