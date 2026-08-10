<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('clients') && !Schema::hasColumn('clients', 'country')) {
            Schema::table('clients', function (Blueprint $table) {
                $table->string('country', 100)->nullable()->after('category');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('clients') && Schema::hasColumn('clients', 'country')) {
            Schema::table('clients', function (Blueprint $table) {
                $table->dropColumn('country');
            });
        }
    }
};
