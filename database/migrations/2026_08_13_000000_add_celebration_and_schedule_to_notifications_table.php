<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify existing enum columns to support 'celebration' type and 'scheduled' status
        DB::statement("ALTER TABLE notifications MODIFY COLUMN type ENUM('home', 'career', 'celebration') DEFAULT 'home'");
        DB::statement("ALTER TABLE notifications MODIFY COLUMN content TEXT NULL");
        DB::statement("ALTER TABLE notifications MODIFY COLUMN status ENUM('active', 'inactive', 'scheduled') DEFAULT 'inactive'");

        Schema::table('notifications', function (Blueprint $table) {
            if (!Schema::hasColumn('notifications', 'start_date')) {
                $table->date('start_date')->nullable()->after('image');
            }
            if (!Schema::hasColumn('notifications', 'end_date')) {
                $table->date('end_date')->nullable()->after('start_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            if (Schema::hasColumn('notifications', 'start_date')) {
                $table->dropColumn('start_date');
            }
            if (Schema::hasColumn('notifications', 'end_date')) {
                $table->dropColumn('end_date');
            }
        });

        DB::statement("ALTER TABLE notifications MODIFY COLUMN type ENUM('home', 'career') DEFAULT 'home'");
        DB::statement("ALTER TABLE notifications MODIFY COLUMN content TEXT NOT NULL");
        DB::statement("ALTER TABLE notifications MODIFY COLUMN status ENUM('active', 'inactive') DEFAULT 'inactive'");
    }
};
