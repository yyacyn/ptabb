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
        Schema::create('fleets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('fleet_categories')->nullOnDelete()->cascadeOnUpdate();
            $table->string('ship_name', 255);
            $table->string('imo_number', 20)->unique();
            $table->text('description')->nullable();
            $table->integer('build_year')->nullable();
            $table->decimal('dwt', 10, 2)->nullable();
            $table->decimal('capacity', 10, 2)->nullable();
            $table->enum('status', ['in_service', 'available', 'in_docking', 'maintenance', 'chartered'])->default('in_service');
            $table->string('operational_area', 255)->nullable();
            $table->string('voyage_route_image', 255)->nullable();
            $table->string('ship_particular_pdf', 255)->nullable();
            $table->text('voyage_description')->nullable();
            $table->string('featured_image', 255)->nullable();
            $table->string('flag', 100)->nullable();
            $table->decimal('deadweight', 10, 2)->nullable();
            $table->string('classification_society', 100)->nullable();
            $table->decimal('gross_tonnage', 10, 2)->nullable();
            $table->decimal('net_tonnage', 10, 2)->nullable();
            $table->string('vessel_type', 100)->nullable();
            $table->decimal('loa', 8, 2)->nullable();
            $table->decimal('lbp', 8, 2)->nullable();
            $table->decimal('breadth', 8, 2)->nullable();
            $table->decimal('depth', 8, 2)->nullable();
            $table->decimal('speed', 5, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fleets');
    }
};
