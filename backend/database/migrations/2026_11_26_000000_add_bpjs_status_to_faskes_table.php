<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `is_support_bpjs` hanya boolean, sehingga tidak bisa membedakan faskes
     * yang belum mengajukan kerjasama dari yang sedang dalam proses. Sumber
     * Aplicares memakai tiga keadaan, jadi kolomnya diganti `bpjs_status`.
     *
     * `kdppk` dilebarkan: kode registrasi Aplicares berformat
     * `NONREG_1509250133B001` (21 karakter) sehingga melebihi 20 karakter.
     */
    public function up(): void
    {
        $this->resizeKdppk(32);

        Schema::table('faskes', function (Blueprint $table): void {
            $table->string('bpjs_status', 20)->default('tidak_mendukung')->after('telp_faskes');
        });

        DB::table('faskes')->where('is_support_bpjs', true)->update(['bpjs_status' => 'mendukung']);
        DB::table('faskes')->where('is_support_bpjs', false)->update(['bpjs_status' => 'tidak_mendukung']);
        DB::table('faskes')->whereNull('is_support_bpjs')->update(['bpjs_status' => 'tidak_mendukung']);

        Schema::table('faskes', function (Blueprint $table): void {
            $table->dropColumn('is_support_bpjs');
        });
    }

    public function down(): void
    {
        Schema::table('faskes', function (Blueprint $table): void {
            $table->boolean('is_support_bpjs')->nullable()->after('telp_faskes');
        });

        DB::table('faskes')->where('bpjs_status', 'mendukung')->update(['is_support_bpjs' => true]);
        DB::table('faskes')->where('bpjs_status', '!=', 'mendukung')->update(['is_support_bpjs' => false]);

        Schema::table('faskes', function (Blueprint $table): void {
            $table->dropColumn('bpjs_status');
        });

        $this->resizeKdppk(20);
    }

    /**
     * Ubah panjang kolom tanpa menabrak index unik yang sudah ada:
     * index dilepas dulu, kolom diubah, lalu index dipasang kembali.
     */
    private function resizeKdppk(int $length): void
    {
        Schema::table('faskes', function (Blueprint $table): void {
            $table->dropUnique('faskes_kdppk_unique');
        });

        Schema::table('faskes', function (Blueprint $table) use ($length): void {
            $table->string('kdppk', $length)->nullable()->change();
        });

        Schema::table('faskes', function (Blueprint $table): void {
            $table->unique('kdppk');
        });
    }
};
