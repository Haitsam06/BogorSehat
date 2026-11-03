<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faskes', function (Blueprint $table): void {
            $table->id('id_faskes');
            $table->string('kdppk', 20)->nullable()->unique();
            $table->string('nama_faskes');
            $table->string('jenis_faskes', 100)->nullable();
            $table->string('kelas_faskes', 20)->nullable();
            $table->string('alamat_faskes');
            $table->string('kota_kabupaten', 20);
            $table->decimal('longitude', 10, 8);
            $table->decimal('latitude', 10, 8);
            $table->string('telp_faskes', 50)->nullable();
            $table->boolean('is_support_bpjs')->nullable();
            $table->string('link_maps')->nullable();
            $table->timestamps();

            $table->index(['kota_kabupaten', 'jenis_faskes']);
            $table->index(['latitude', 'longitude']);
        });

        Schema::create('spesialisasi', function (Blueprint $table): void {
            $table->string('id_spesialisasi', 10)->primary();
            $table->string('nama_spesialisasi');
            $table->timestamps();
        });

        Schema::create('fasilitas', function (Blueprint $table): void {
            $table->unsignedBigInteger('id_fasilitas')->primary();
            $table->string('nama_fasilitas');
            $table->timestamps();
        });

        Schema::create('spesialisasi_faskes', function (Blueprint $table): void {
            $table->id('id_spesialisasi_faskes');
            $table->foreignId('id_faskes')->constrained('faskes', 'id_faskes')->cascadeOnDelete();
            $table->string('id_spesialisasi', 10);
            $table->foreign('id_spesialisasi')->references('id_spesialisasi')->on('spesialisasi')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['id_faskes', 'id_spesialisasi']);
        });

        Schema::create('fasilitas_faskes', function (Blueprint $table): void {
            $table->id('id_fasilitas_faskes');
            $table->foreignId('id_faskes')->constrained('faskes', 'id_faskes')->cascadeOnDelete();
            $table->unsignedBigInteger('id_fasilitas');
            $table->foreign('id_fasilitas')->references('id_fasilitas')->on('fasilitas')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['id_faskes', 'id_fasilitas']);
        });

        Schema::create('komentar', function (Blueprint $table): void {
            $table->id('id_komentar');
            $table->foreignId('id_user')->constrained('users', 'id_user')->cascadeOnDelete();
            $table->foreignId('id_faskes')->constrained('faskes', 'id_faskes')->cascadeOnDelete();
            $table->foreignId('id_parent')->nullable()->constrained('komentar', 'id_komentar')->nullOnDelete();
            $table->text('body')->nullable();
            $table->unsignedTinyInteger('rating')->nullable();
            $table->json('image_path')->nullable();
            $table->timestamps();

            $table->index(['id_faskes', 'id_parent']);
        });

        Schema::create('diskusi', function (Blueprint $table): void {
            $table->id('id_diskusi');
            $table->foreignId('id_user')->constrained('users', 'id_user')->cascadeOnDelete();
            $table->string('judul_diskusi');
            $table->string('kategori_diskusi')->default('lainnya');
            $table->text('body');
            $table->json('image_path')->nullable();
            $table->timestamps();
        });

        Schema::create('tanggapan_diskusi', function (Blueprint $table): void {
            $table->id('id_tanggapan_diskusi');
            $table->foreignId('id_user')->constrained('users', 'id_user')->cascadeOnDelete();
            $table->foreignId('id_diskusi')->constrained('diskusi', 'id_diskusi')->cascadeOnDelete();
            $table->foreignId('id_parent')->nullable()->constrained('tanggapan_diskusi', 'id_tanggapan_diskusi')->nullOnDelete();
            $table->text('body');
            $table->json('image_path')->nullable();
            $table->timestamps();
        });

        Schema::create('laporan_komentar', function (Blueprint $table): void {
            $table->id('id_laporan_komentar');
            $table->foreignId('id_komentar')->constrained('komentar', 'id_komentar')->cascadeOnDelete();
            $table->foreignId('id_faskes')->constrained('faskes', 'id_faskes')->cascadeOnDelete();
            $table->foreignId('id_reported_user')->constrained('users', 'id_user')->cascadeOnDelete();
            $table->string('alasan');
            $table->text('catatan')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->index('status');
        });

        Schema::create('laporan_diskusi', function (Blueprint $table): void {
            $table->id('id_laporan_diskusi');
            $table->foreignId('id_diskusi')->constrained('diskusi', 'id_diskusi')->cascadeOnDelete();
            $table->foreignId('id_reported_user')->constrained('users', 'id_user')->cascadeOnDelete();
            $table->string('alasan');
            $table->text('catatan')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->index('status');
        });

        Schema::create('laporan_tanggapan', function (Blueprint $table): void {
            $table->id('id_laporan_tanggapan');
            $table->foreignId('id_tanggapan')->constrained('tanggapan_diskusi', 'id_tanggapan_diskusi')->cascadeOnDelete();
            $table->foreignId('id_reported_user')->constrained('users', 'id_user')->cascadeOnDelete();
            $table->string('alasan');
            $table->text('catatan')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->index('status');
        });

        Schema::create('feedback_faskes', function (Blueprint $table): void {
            $table->id('id_feedback_faskes');
            $table->foreignId('id_faskes')->constrained('faskes', 'id_faskes')->cascadeOnDelete();
            $table->foreignId('id_user')->constrained('users', 'id_user')->cascadeOnDelete();
            $table->string('alasan');
            $table->text('saran_perbaikan');
            $table->string('status')->default('pending');
            $table->text('catatan_admin')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback_faskes');
        Schema::dropIfExists('laporan_tanggapan');
        Schema::dropIfExists('laporan_diskusi');
        Schema::dropIfExists('laporan_komentar');
        Schema::dropIfExists('tanggapan_diskusi');
        Schema::dropIfExists('diskusi');
        Schema::dropIfExists('komentar');
        Schema::dropIfExists('fasilitas_faskes');
        Schema::dropIfExists('spesialisasi_faskes');
        Schema::dropIfExists('fasilitas');
        Schema::dropIfExists('spesialisasi');
        Schema::dropIfExists('faskes');
    }
};
