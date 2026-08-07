<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE contacts MODIFY COLUMN department ENUM('commercial', 'operation', 'hrd', 'crew', 'general') NOT NULL DEFAULT 'general'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE contacts MODIFY COLUMN department ENUM('commercial', 'operation', 'hrd', 'general') NOT NULL DEFAULT 'general'");
    }
};
