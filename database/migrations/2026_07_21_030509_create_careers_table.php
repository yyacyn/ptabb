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
        Schema::create('careers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete()->cascadeOnUpdate();
            $table->string('author_name', 100)->nullable();
            $table->string('author_role', 50)->nullable();
            $table->string('position', 255);
            $table->string('department', 100)->nullable();
            $table->string('category', 50)->default('corporate');
            $table->string('location', 100)->nullable();
            $table->enum('employment_type', ['fulltime', 'contract', 'internship'])->default('fulltime');
            $table->text('description')->nullable();
            $table->text('requirements')->nullable();
            $table->text('responsibilities')->nullable();
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->date('application_deadline')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('careers');
    }
};
