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
        Schema::table('fleets', function (Blueprint $table) {
            if (!Schema::hasColumn('fleets', 'light_ship')) {
                $table->decimal('light_ship', 10, 2)->nullable()->after('net_tonnage');
            }
            if (!Schema::hasColumn('fleets', 'summer_draft')) {
                $table->decimal('summer_draft', 8, 2)->nullable()->after('depth');
            }
            if (!Schema::hasColumn('fleets', 'port_of_registry')) {
                $table->string('port_of_registry', 100)->nullable()->after('flag');
            }
            if (!Schema::hasColumn('fleets', 'call_sign')) {
                $table->string('call_sign', 50)->nullable()->after('port_of_registry');
            }
            if (!Schema::hasColumn('fleets', 'mmsi')) {
                $table->string('mmsi', 50)->nullable()->after('call_sign');
            }
            if (!Schema::hasColumn('fleets', 'hull_no')) {
                $table->string('hull_no', 50)->nullable()->after('mmsi');
            }
            if (!Schema::hasColumn('fleets', 'particulars_data')) {
                $table->json('particulars_data')->nullable()->after('description');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fleets', function (Blueprint $table) {
            $table->dropColumn([
                'light_ship',
                'summer_draft',
                'port_of_registry',
                'call_sign',
                'mmsi',
                'hull_no',
                'particulars_data',
            ]);
        });
    }
};
