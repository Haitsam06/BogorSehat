<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('faskes', function (Blueprint $table): void {
            $table->string('provinsi', 100)->default('JAWA BARAT')->after('alamat_faskes');
            $table->string('kecamatan', 100)->nullable()->after('provinsi');
        });
    }

    public function down(): void
    {
        Schema::table('faskes', function (Blueprint $table): void {
            $table->dropColumn(['provinsi', 'kecamatan']);
        });
    }
};
