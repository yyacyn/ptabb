<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SailinkApiService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.sailink.base_url', 'https://navigatorplus.sailink.id/api/v22/remote');
        $this->apiKey = config('services.sailink.key', '');
    }

    /**
     * Fetch real-time position & weather data for a given vessel IP address.
     *
     * @param string $ipAddress
     * @return array|null Parsed data or null on failure
     */
    public function getVesselPosition(string $ipAddress): ?array
    {
        if (empty($ipAddress) || empty($this->apiKey)) {
            return null;
        }

        try {
            $url = rtrim($this->baseUrl, '/') . '/' . $this->apiKey . '/' . trim($ipAddress);
            $response = Http::timeout(5)->get($url);

            if (!$response->successful()) {
                Log::warning("Sailink API request failed for IP {$ipAddress}", [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return null;
            }

            $json = $response->json();
            $data = $json['data'] ?? [];

            $sailink = $data['sailink'] ?? null;
            $thuraya = $data['thuraya'] ?? null;

            $activeSource = ($sailink && !empty($sailink['lat'])) ? $sailink : $thuraya;

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

            return [
                'provider' => ($activeSource === $sailink) ? 'sailink' : 'thuraya',
                'status' => $sailink['status'] ?? 'UP',
                'latitude' => $lat,
                'longitude' => $lon,
                'heading' => $heading,
                'speed_knots' => $speed,
                'dms' => $activeSource['dms'] ?? null,
                'date_time' => $activeSource['dateTime'] ?? null,
                'weather' => $sailink['weather'] ?? null,
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            Log::error("Sailink API exception for IP {$ipAddress}: " . $e->getMessage());
            return null;
        }
    }
}
