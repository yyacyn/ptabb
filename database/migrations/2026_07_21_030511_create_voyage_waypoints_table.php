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
        Schema::create('voyage_waypoints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fleet_id')->constrained('fleets')->cascadeOnDelete()->cascadeOnUpdate();
            $table->integer('sequence')->default(1);
            $table->enum('waypoint_type', ['departure', 'transit', 'destination'])->default('transit');
            $table->string('port_name', 100);
            $table->string('country', 50)->nullable();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->dateTime('eta')->nullable();
            $table->dateTime('etd')->nullable();
            $table->text('notes')->nullable();
            $table->text('maritime_route_coordinates')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voyage_waypoints');
    }
};
