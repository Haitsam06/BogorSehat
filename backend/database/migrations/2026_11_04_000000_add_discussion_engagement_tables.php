<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('diskusi', function (Blueprint $table): void {
            $table->foreignId('id_faskes')->nullable()->after('id_user')->constrained('faskes', 'id_faskes')->nullOnDelete();
        });

        Schema::create('diskusi_suka', function (Blueprint $table): void {
            $table->id('id_diskusi_suka');
            $table->foreignId('id_diskusi')->constrained('diskusi', 'id_diskusi')->cascadeOnDelete();
            $table->foreignId('id_user')->constrained('users', 'id_user')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['id_diskusi', 'id_user']);
        });

        Schema::create('tanggapan_diskusi_suka', function (Blueprint $table): void {
            $table->id('id_tanggapan_diskusi_suka');
            $table->foreignId('id_tanggapan')->constrained('tanggapan_diskusi', 'id_tanggapan_diskusi')->cascadeOnDelete();
            $table->foreignId('id_user')->constrained('users', 'id_user')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['id_tanggapan', 'id_user'], 'tanggapan_suka_unique');
        });

        Schema::create('diskusi_dilihat', function (Blueprint $table): void {
            $table->id('id_diskusi_dilihat');
            $table->foreignId('id_diskusi')->constrained('diskusi', 'id_diskusi')->cascadeOnDelete();
            $table->foreignId('id_user')->constrained('users', 'id_user')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['id_diskusi', 'id_user']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diskusi_dilihat');
        Schema::dropIfExists('tanggapan_diskusi_suka');
        Schema::dropIfExists('diskusi_suka');

        Schema::table('diskusi', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('id_faskes');
        });
    }
};
