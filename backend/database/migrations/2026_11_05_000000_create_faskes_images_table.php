<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faskes_images', function (Blueprint $table): void {
            $table->id('id_faskes_image');
            $table->foreignId('id_faskes')->constrained('faskes', 'id_faskes')->cascadeOnDelete();
            $table->string('path');
            $table->string('url');
            $table->boolean('is_banner')->default(false);
            $table->boolean('is_thumbnail')->default(false);
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('id_faskes');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faskes_images');
    }
};
