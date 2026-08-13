<?php

namespace Database\Seeders;

use App\Services\IndonesianHolidayService;
use Illuminate\Database\Seeder;

class IndonesianCelebrationDaysSeeder extends Seeder
{
    /**
     * Seed Indonesian Celebration Days automatically from official Kemendesa SKB 3 Menteri API.
     */
    public function run(): void
    {
        IndonesianHolidayService::syncHolidays();
    }
}
