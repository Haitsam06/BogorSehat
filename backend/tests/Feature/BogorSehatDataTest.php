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

        $this->assertSame(506, Faskes::count());
        $this->assertSame(51, Spesialisasi::count());
        $this->assertSame(818, Fasilitas::count());
        $this->assertSame(1052, DB::table('spesialisasi_faskes')->count());
        $this->assertSame(4566, DB::table('fasilitas_faskes')->count());

        $faskes = Faskes::query()->where('kdppk', '0117R007')->firstOrFail();

        $this->assertSame('RSUD R. MOH. NOH NUR', $faskes->nama_faskes);
        $this->assertTrue($faskes->is_support_bpjs);
        $this->assertGreaterThan(0, $faskes->spesialisasi()->count());
        $this->assertGreaterThan(0, $faskes->fasilitas()->count());
    }
}
