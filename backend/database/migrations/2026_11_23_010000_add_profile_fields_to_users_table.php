<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('nomor_telepon', 30)->nullable()->after('foto_profil');
            $table->string('jenis_kelamin', 20)->nullable()->after('nomor_telepon');
            $table->date('tanggal_lahir')->nullable()->after('jenis_kelamin');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['nomor_telepon', 'jenis_kelamin', 'tanggal_lahir']);
        });
    }
};
