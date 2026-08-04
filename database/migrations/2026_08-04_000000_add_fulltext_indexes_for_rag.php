<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE fleets ADD FULLTEXT INDEX fleets_fulltext (ship_name, description, operational_area, vessel_type)');
        DB::statement('ALTER TABLE careers ADD FULLTEXT INDEX careers_fulltext (position, department, location, description, requirements)');
        DB::statement('ALTER TABLE news ADD FULLTEXT INDEX news_fulltext (title, excerpt, content)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE fleets DROP INDEX fleets_fulltext');
        DB::statement('ALTER TABLE careers DROP INDEX careers_fulltext');
        DB::statement('ALTER TABLE news DROP INDEX news_fulltext');
    }
};
