<?php

namespace App\Services;

use App\Models\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IndonesianHolidayService
{
    /**
     * Fetch and store Indonesian celebration day popups from official Kemendesa SKB 3 Menteri API.
     *
     * @param int|null $year
     * @return int Number of celebration popups synced
     */
    public static function syncHolidays(?int $year = null): int
    {
        $currentYear = $year ?? (int) date('Y');
        $url = "https://api.kemendesa.link/libur-nasional/api/holidays/latest";

        $holidaysGrouped = [];

        try {
            $response = Http::timeout(10)->get($url);

            if ($response->successful()) {
                $json = $response->json();
                $items = $json['data'] ?? [];

                foreach ($items as $item) {
                    $name = trim($item['name']);
                    $date = $item['date'];

                    // Normalize name to group cuti bersama and main holiday together
                    $cleanName = preg_replace('/^(Cuti Bersama|Hari Libur)\s*/i', '', $name);

                    if (!isset($holidaysGrouped[$cleanName])) {
                        $holidaysGrouped[$cleanName] = [
                            'title' => 'Selamat ' . $cleanName,
                            'start_date' => $date,
                            'end_date' => $date,
                        ];
                    } else {
                        // Expand date range for multi-day holidays
                        if ($date < $holidaysGrouped[$cleanName]['start_date']) {
                            $holidaysGrouped[$cleanName]['start_date'] = $date;
                        }
                        if ($date > $holidaysGrouped[$cleanName]['end_date']) {
                            $holidaysGrouped[$cleanName]['end_date'] = $date;
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Could not fetch Kemendesa holidays API: ' . $e->getMessage());
        }

        // Fallback array if API is offline or returns empty
        if (empty($holidaysGrouped)) {
            $holidaysGrouped = [
                'Tahun Baru Masehi' => [
                    'title' => 'Selamat Tahun Baru Masehi',
                    'start_date' => "{$currentYear}-01-01",
                    'end_date' => "{$currentYear}-01-01",
                ],
                'Tahun Baru Imlek' => [
                    'title' => 'Selamat Tahun Baru Imlek',
                    'start_date' => "{$currentYear}-02-16",
                    'end_date' => "{$currentYear}-02-17",
                ],
                'Hari Suci Nyepi' => [
                    'title' => 'Selamat Hari Suci Nyepi (Tahun Baru Saka)',
                    'start_date' => "{$currentYear}-03-18",
                    'end_date' => "{$currentYear}-03-19",
                ],
                'Idul Fitri' => [
                    'title' => 'Selamat Hari Raya Idul Fitri',
                    'start_date' => "{$currentYear}-03-20",
                    'end_date' => "{$currentYear}-03-24",
                ],
                'Wafat Yesus Kristus & Paskah' => [
                    'title' => 'Selamat Paskah & Wafat Yesus Kristus',
                    'start_date' => "{$currentYear}-04-03",
                    'end_date' => "{$currentYear}-04-05",
                ],
                'Hari Buruh Internasional' => [
                    'title' => 'Selamat Hari Buruh Internasional',
                    'start_date' => "{$currentYear}-05-01",
                    'end_date' => "{$currentYear}-05-01",
                ],
                'Kenaikan Yesus Kristus' => [
                    'title' => 'Selamat Hari Kenaikan Yesus Kristus',
                    'start_date' => "{$currentYear}-05-14",
                    'end_date' => "{$currentYear}-05-15",
                ],
                'Idul Adha' => [
                    'title' => 'Selamat Hari Raya Idul Adha',
                    'start_date' => "{$currentYear}-05-27",
                    'end_date' => "{$currentYear}-05-28",
                ],
                'Hari Raya Waisak' => [
                    'title' => 'Selamat Hari Raya Waisak',
                    'start_date' => "{$currentYear}-05-31",
                    'end_date' => "{$currentYear}-05-31",
                ],
                'Hari Lahir Pancasila' => [
                    'title' => 'Selamat Hari Lahir Pancasila',
                    'start_date' => "{$currentYear}-06-01",
                    'end_date' => "{$currentYear}-06-01",
                ],
                'Tahun Baru Islam' => [
                    'title' => 'Selamat Tahun Baru Islam',
                    'start_date' => "{$currentYear}-06-16",
                    'end_date' => "{$currentYear}-06-16",
                ],
                'Proklamasi Kemerdekaan RI' => [
                    'title' => 'Selamat Hari Kemerdekaan Republik Indonesia',
                    'start_date' => "{$currentYear}-08-17",
                    'end_date' => "{$currentYear}-08-17",
                ],
                'Maulid Nabi Muhammad S.A.W.' => [
                    'title' => 'Selamat Maulid Nabi Muhammad S.A.W.',
                    'start_date' => "{$currentYear}-08-25",
                    'end_date' => "{$currentYear}-08-25",
                ],
                'Hari Pahlawan' => [
                    'title' => 'Selamat Hari Pahlawan',
                    'start_date' => "{$currentYear}-11-10",
                    'end_date' => "{$currentYear}-11-10",
                ],
                'Hari Raya Natal' => [
                    'title' => 'Selamat Hari Raya Natal & Tahun Baru',
                    'start_date' => "{$currentYear}-12-24",
                    'end_date' => "{$currentYear}-12-25",
                ],
            ];
        }

        $count = 0;
        foreach ($holidaysGrouped as $key => $data) {
            $existing = Notification::where('title', $data['title'])->where('type', 'celebration')->first();

            Notification::updateOrCreate(
                [
                    'title' => $data['title'],
                    'type' => 'celebration',
                ],
                [
                    'content' => null,
                    'image' => $existing ? $existing->image : null,
                    'status' => 'scheduled',
                    'start_date' => $data['start_date'],
                    'end_date' => $data['end_date'],
                ]
            );
            $count++;
        }

        return $count;
    }

    /**
     * Auto sync holidays if no celebration popups exist for the current year yet.
     */
    public static function autoSyncIfNeeded(): void
    {
        $currentYear = date('Y');
        $hasCelebrationsThisYear = Notification::where('type', 'celebration')
            ->where(function ($q) use ($currentYear) {
                $q->whereYear('start_date', $currentYear)
                  ->orWhereYear('end_date', $currentYear);
            })
            ->exists();

        if (!$hasCelebrationsThisYear) {
            self::syncHolidays((int) $currentYear);
        }
    }
}
