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
        Schema::create('page_views', function (Blueprint $table) {
            $table->id();
            $table->string('page_url', 500);
            $table->string('route_name', 100)->nullable();
            $table->date('view_date');
            $table->integer('view_count')->default(1);
            $table->integer('unique_visitors')->default(1);
            $table->unique(['page_url', 'view_date'], 'unique_page_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_views');
    }
};
