<?php

namespace Tests\Feature;

use App\Models\Fasilitas;
use App\Models\Faskes;
use App\Models\Spesialisasi;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class BogorSehatDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_bogorsehat_seed_contains_master_data_and_relationships(): void
    {
        $this->seed();

        $this->assertSame(519, Faskes::count());
        $this->assertSame(51, Spesialisasi::count());
        $this->assertSame(818, Fasilitas::count());
        $this->assertSame(1052, DB::table('spesialisasi_faskes')->count());
        $this->assertSame(4566, DB::table('fasilitas_faskes')->count());

        $this->assertSame(506, Faskes::query()->where('bpjs_status', Faskes::BPJS_MENDUKUNG)->count());
        $this->assertSame(12, Faskes::query()->where('bpjs_status', Faskes::BPJS_DALAM_PROSES)->count());
        $this->assertSame(1, Faskes::query()->where('bpjs_status', Faskes::BPJS_TIDAK_MENDUKUNG)->count());

        $faskes = Faskes::query()->where('kdppk', '0117R007')->firstOrFail();

        $this->assertSame('RSUD R. MOH. NOH NUR', $faskes->nama_faskes);
        $this->assertSame(Faskes::BPJS_MENDUKUNG, $faskes->bpjs_status);
        $this->assertGreaterThan(0, $faskes->spesialisasi()->count());
        $this->assertGreaterThan(0, $faskes->fasilitas()->count());
    }

    public function test_faskes_without_bpjs_cooperation_are_seeded(): void
    {
        $this->seed();

        $faskes = Faskes::query()->where('kdppk', 'NONREG_1509250133B001')->firstOrFail();

        $this->assertSame('Klinik Duta Medika Pratama', $faskes->nama_faskes);
        $this->assertSame(Faskes::BPJS_TIDAK_MENDUKUNG, $faskes->bpjs_status);
        $this->assertSame('KOTA BOGOR', $faskes->kota_kabupaten);
        $this->assertSame('KLINIK PRATAMA', $faskes->jenis_faskes);
    }
}
