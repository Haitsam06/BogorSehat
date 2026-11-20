<?php

namespace Tests\Feature;

use App\Models\Faskes;
use App\Support\KecamatanNormalizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KecamatanFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_normalizer_collapses_spelling_variants(): void
    {
        $this->assertSame('Bojonggede', KecamatanNormalizer::normalize('BOJONG GEDE'));
        $this->assertSame('Bojonggede', KecamatanNormalizer::normalize('bojonggede'));
        $this->assertSame('Bogor Barat', KecamatanNormalizer::normalize('Kota Bogor Barat'));
        $this->assertSame('Cijeruk', KecamatanNormalizer::normalize('  cijeruk '));
        $this->assertNull(KecamatanNormalizer::normalize('   '));
        $this->assertNull(KecamatanNormalizer::normalize(null));
    }

    public function test_filter_matches_regardless_of_letter_case(): void
    {
        $this->makeFaskes('RS Uji A', 'Cibinong');
        $this->makeFaskes('RS Uji B', 'Cibinong');
        $this->makeFaskes('RS Uji C', 'Cileungsi');

        foreach (['Cibinong', 'cibinong', 'CIBINONG', '  cibinong  '] as $term) {
            $this->getJson('/api/faskes?kecamatan='.urlencode($term))
                ->assertOk()
                ->assertJsonPath('meta.total', 2);
        }

        $this->getJson('/api/faskes?kecamatan=Cileungsi')->assertOk()->assertJsonPath('meta.total', 1);
    }

    public function test_filter_is_exact_and_does_not_match_substrings(): void
    {
        $this->makeFaskes('RS Uji A', 'Bogor Barat');
        $this->makeFaskes('RS Uji B', 'Bogor Timur');

        $this->getJson('/api/faskes?kecamatan=Bogor')->assertOk()->assertJsonPath('meta.total', 0);
        $this->getJson('/api/faskes?kecamatan=Bogor%20Barat')->assertOk()->assertJsonPath('meta.total', 1);
    }

    public function test_seeded_facilities_expose_normalized_districts(): void
    {
        $this->seed();

        $values = Faskes::query()->whereNotNull('kecamatan')->where('kecamatan', '!=', '')
            ->distinct()->pluck('kecamatan');

        $this->assertGreaterThan(30, $values->count());

        foreach ($values as $district) {
            $this->assertSame(
                KecamatanNormalizer::normalize($district),
                $district,
                "District [{$district}] is not normalized."
            );
        }

        $this->assertSame(
            0,
            Faskes::query()->where('kecamatan', 'like', '%  %')->count(),
            'District values must not contain repeated spaces.'
        );
    }

    public function test_frontend_district_options_all_return_results(): void
    {
        $this->seed();

        $options = [
            'Bogor Barat', 'Bogor Tengah', 'Bogor Timur', 'Bogor Selatan', 'Bogor Utara',
            'Tanah Sareal', 'Cibinong', 'Ciawi', 'Sukaraja', 'Babakan Madang',
            'Gunung Putri', 'Bojonggede', 'Cijeruk', 'Ciampea', 'Citeureup', 'Parung',
        ];

        foreach ($options as $district) {
            $total = $this->getJson('/api/faskes?kecamatan='.urlencode($district))->assertOk()->json('meta.total');
            $this->assertGreaterThan(0, $total, "District [{$district}] returns no facilities.");
        }
    }

    private function makeFaskes(string $name, string $district): void
    {
        Faskes::query()->create([
            'nama_faskes' => $name,
            'jenis_faskes' => 'Rumah Sakit',
            'alamat_faskes' => 'Jl Uji',
            'kota_kabupaten' => 'KOTA BOGOR',
            'kecamatan' => $district,
            'latitude' => -6.6,
            'longitude' => 106.8,
        ]);
    }
}
