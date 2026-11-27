<?php

namespace Tests\Feature;

use App\Models\Fasilitas;
use App\Models\Faskes;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FaskesGalleryAndOrderingTest extends TestCase
{
    use RefreshDatabase;

    public function test_faskes_list_ranks_service_types_from_hospital_to_optics(): void
    {
        foreach ([
            'APOTEK UJI' => 'Apotek',
            'OPTIK UJI' => 'Optik',
            'DOKTER GIGI UJI' => 'Dokter Gigi',
            'DOKTER UMUM UJI' => 'Dokter Praktik Perorangan',
            'PUSKESMAS UJI' => 'Puskesmas',
            'KLINIK UJI' => 'Klinik',
            'RS UJI' => 'Rumah Sakit',
        ] as $nama => $jenis) {
            Faskes::query()->create([
                'nama_faskes' => $nama,
                'jenis_faskes' => $jenis,
                'alamat_faskes' => 'Jl Uji',
                'kota_kabupaten' => 'KOTA BOGOR',
                'latitude' => -6.6,
                'longitude' => 106.8,
            ]);
        }

        $urutan = array_column($this->getJson('/api/faskes?per_page=50')->assertOk()->json('data'), 'nama_faskes');

        $this->assertSame([
            'RS UJI',
            'KLINIK UJI',
            'PUSKESMAS UJI',
            'DOKTER UMUM UJI',
            'DOKTER GIGI UJI',
            'APOTEK UJI',
            'OPTIK UJI',
        ], $urutan);
    }

    public function test_faskes_filter_supports_district_and_multiple_supporting_facilities(): void
    {
        $this->seed();

        $facilityIds = Fasilitas::query()->whereHas('faskes')->orderBy('id_fasilitas')->take(2)->pluck('id_fasilitas')->all();
        $expected = DB::table('fasilitas_faskes')->where('id_fasilitas', $facilityIds[0])->count();

        $single = $this->getJson('/api/faskes?id_fasilitas='.$facilityIds[0].'&per_page=100')->assertOk()->json('meta.total');
        $this->assertSame($expected, $single);

        $comma = $this->getJson('/api/faskes?id_fasilitas='.$facilityIds[0].','.$facilityIds[1].'&per_page=100')->assertOk()->json('meta.total');
        $this->assertGreaterThan($single, $comma);

        $array = $this->getJson('/api/faskes?id_fasilitas[]='.$facilityIds[0].'&id_fasilitas[]='.$facilityIds[1].'&per_page=100')->assertOk()->json('meta.total');
        $this->assertSame($comma, $array);

        $district = $this->getJson('/api/faskes?kecamatan=CIJERUK&per_page=50')->assertOk()->json();
        $this->assertGreaterThan(0, $district['meta']['total']);
        foreach ($district['data'] as $row) {
            $this->assertSame('Cijeruk', $row['kecamatan']);
        }
    }

    public function test_admin_can_attach_images_and_flags_default_to_the_first_image(): void
    {
        Storage::fake('public');
        $headers = $this->adminHeaders();

        $response = $this->withHeaders($headers)->postJson('/api/admin/faskes', [
            'nama_faskes' => 'Klinik Galeri',
            'alamat_faskes' => 'Jl Galeri',
            'kota_kabupaten' => 'KOTA BOGOR',
            'latitude' => -6.6,
            'longitude' => 106.8,
            'images' => [
                ['path' => 'uploads/faskes/a.webp', 'url' => 'http://x/a.webp'],
                ['path' => 'uploads/faskes/b.webp', 'url' => 'http://x/b.webp'],
            ],
        ])->assertCreated()->json('data');

        $this->assertCount(2, $response['images']);
        $this->assertTrue($response['images'][0]['is_banner']);
        $this->assertTrue($response['images'][0]['is_thumbnail']);
        $this->assertFalse($response['images'][1]['is_banner']);
        $this->assertStringEndsWith('/storage/uploads/faskes/a.webp', $response['banner_url']);
        $this->assertStringEndsWith('/storage/uploads/faskes/a.webp', $response['thumbnail_url']);

        $detail = $this->getJson('/api/faskes/'.$response['id_faskes'])->assertOk()->json('data');
        $this->assertCount(2, $detail['images']);
        $this->assertSame('uploads/faskes/a.webp', $detail['images'][0]['path']);
    }

    public function test_banner_and_thumbnail_flags_can_be_assigned_to_a_specific_image(): void
    {
        Storage::fake('public');
        $headers = $this->adminHeaders();
        $id = $this->createFaskes($headers);

        $updated = $this->withHeaders($headers)->putJson('/api/admin/faskes/'.$id, [
            'images' => [
                ['path' => 'uploads/faskes/a.webp', 'url' => 'http://x/a.webp'],
                ['path' => 'uploads/faskes/b.webp', 'url' => 'http://x/b.webp', 'is_banner' => true, 'is_thumbnail' => true],
            ],
        ])->assertOk()->json('data');

        $this->assertFalse($updated['images'][0]['is_banner']);
        $this->assertTrue($updated['images'][1]['is_banner']);
        $this->assertStringEndsWith('/storage/uploads/faskes/b.webp', $updated['banner_url']);
        $this->assertStringEndsWith('/storage/uploads/faskes/b.webp', $updated['thumbnail_url']);

        $bothFlagged = $this->withHeaders($headers)->putJson('/api/admin/faskes/'.$id, [
            'images' => [
                ['path' => 'uploads/faskes/a.webp', 'url' => 'http://x/a.webp', 'is_banner' => true],
                ['path' => 'uploads/faskes/b.webp', 'url' => 'http://x/b.webp', 'is_banner' => true],
            ],
        ])->assertOk()->json('data.images');

        $this->assertTrue($bothFlagged[0]['is_banner']);
        $this->assertFalse($bothFlagged[1]['is_banner']);
    }

    public function test_updating_without_images_keeps_them_and_empty_array_removes_files(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('uploads/faskes/a.webp', 'x');
        $headers = $this->adminHeaders();
        $id = $this->createFaskes($headers, [
            ['path' => 'uploads/faskes/a.webp', 'url' => 'http://x/a.webp'],
        ]);

        $kept = $this->withHeaders($headers)->putJson('/api/admin/faskes/'.$id, ['nama_faskes' => 'Nama Baru'])->assertOk()->json('data');
        $this->assertCount(1, $kept['images']);
        Storage::disk('public')->assertExists('uploads/faskes/a.webp');

        $cleared = $this->withHeaders($headers)->putJson('/api/admin/faskes/'.$id, ['images' => []])->assertOk()->json('data');
        $this->assertSame([], $cleared['images']);
        $this->assertNull($cleared['banner_url']);
        Storage::disk('public')->assertMissing('uploads/faskes/a.webp');
    }

    public function test_deleting_a_faskes_removes_its_image_files(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('uploads/faskes/a.webp', 'x');
        $headers = $this->adminHeaders();
        $id = $this->createFaskes($headers, [
            ['path' => 'uploads/faskes/a.webp', 'url' => 'http://x/a.webp'],
        ]);

        $this->withHeaders($headers)->deleteJson('/api/admin/faskes/'.$id)->assertOk();
        Storage::disk('public')->assertMissing('uploads/faskes/a.webp');
    }

    public function test_image_payload_is_validated(): void
    {
        $headers = $this->adminHeaders();
        $id = $this->createFaskes($headers);

        $six = array_map(static fn (int $i): array => ['path' => "uploads/faskes/$i.webp", 'url' => "http://x/$i.webp"], range(1, 6));
        $this->withHeaders($headers)->putJson('/api/admin/faskes/'.$id, ['images' => $six])->assertStatus(422)->assertJsonValidationErrors('images');

        $this->withHeaders($headers)->putJson('/api/admin/faskes/'.$id, ['images' => [['url' => 'http://x/a.webp']]])->assertStatus(422)->assertJsonValidationErrors('images.0.path');
    }

    public function test_uploaded_images_are_converted_to_webp(): void
    {
        Storage::fake('public');
        $headers = $this->adminHeaders();

        $response = $this->withHeaders($headers)->post('/api/uploads', [
            'file' => UploadedFile::fake()->image('foto.png', 200, 120),
            'context' => 'faskes',
        ])->assertCreated()->json('data');

        $this->assertSame('image/webp', $response['mime']);
        $this->assertStringEndsWith('.webp', $response['path']);
        Storage::disk('public')->assertExists($response['path']);
        $this->assertSame('image/webp', mime_content_type(Storage::disk('public')->path($response['path'])));
    }

    public function test_faskes_upload_context_is_admin_only_and_rejects_pdf(): void
    {
        Storage::fake('public');
        $admin = $this->adminHeaders();

        $this->withHeaders($admin)->post('/api/uploads', [
            'file' => UploadedFile::fake()->create('dokumen.pdf', 40, 'application/pdf'),
            'context' => 'faskes',
        ])->assertStatus(422);

        $user = User::query()->create(['nama_user' => 'Warga', 'email_user' => 'galeri@example.test', 'password_user' => 'password123', 'role_user' => 'user']);
        $token = $this->postJson('/api/auth/login', ['email_user' => $user->email_user, 'password_user' => 'password123'])->json('token');

        $this->withHeaders(['Authorization' => 'Bearer '.$token])->post('/api/uploads', [
            'file' => UploadedFile::fake()->image('foto.png'),
            'context' => 'faskes',
        ])->assertForbidden();

        $this->withHeaders($admin)->post('/api/uploads', [
            'file' => UploadedFile::fake()->create('dokumen.pdf', 40, 'application/pdf'),
            'context' => 'diskusi',
        ])->assertCreated();
    }

    public function test_compact_nearby_skips_heavy_fields_and_reports_igd(): void
    {
        $this->seed();
        $igd = Fasilitas::query()->create(['id_fasilitas' => 9001, 'nama_fasilitas' => 'Instalasi Gawat Darurat (IGD)']);

        $target = Faskes::query()->where('kdppk', '0117R007')->firstOrFail();
        $target->fasilitas()->attach($igd->id_fasilitas);
        $target->images()->create(['path' => 'uploads/faskes/x.webp', 'is_banner' => true, 'is_thumbnail' => true]);

        $compact = collect($this->getJson('/api/faskes/nearby?latitude=-6.57451&longitude=106.628&radius=1&compact=1')->assertOk()->json('data'))
            ->firstWhere('id_faskes', $target->id_faskes);

        $this->assertNotNull($compact);
        $this->assertTrue($compact['has_igd']);
        $this->assertArrayNotHasKey('images', $compact);
        $this->assertArrayNotHasKey('rating_avg', $compact);
        $this->assertArrayNotHasKey('fasilitas', $compact);
        $this->assertArrayHasKey('spesialisasi', $compact);

        $full = collect($this->getJson('/api/faskes/nearby?latitude=-6.57451&longitude=106.628&radius=1')->assertOk()->json('data'))
            ->firstWhere('id_faskes', $target->id_faskes);

        $this->assertArrayHasKey('images', $full);
        $this->assertArrayHasKey('rating_avg', $full);
        $this->assertArrayHasKey('fasilitas', $full);
    }

    public function test_admin_master_data_detail_endpoints(): void
    {
        $this->seed();
        $headers = $this->adminHeaders();

        $spesialisasi = $this->withHeaders($headers)->getJson('/api/admin/spesialisasi/ANA')->assertOk()->json('data');
        $this->assertSame('ANA', $spesialisasi['id_spesialisasi']);
        $this->assertGreaterThan(0, $spesialisasi['faskes_count']);

        $fasilitas = $this->withHeaders($headers)->getJson('/api/admin/fasilitas/205')->assertOk()->json('data');
        $this->assertSame(205, $fasilitas['id_fasilitas']);
        $this->assertArrayHasKey('faskes_count', $fasilitas);

        $this->withHeaders($headers)->getJson('/api/admin/spesialisasi/ZZZZ')->assertNotFound();
        $this->withHeaders($headers)->getJson('/api/admin/fasilitas/999999')->assertNotFound();
    }

    /** @param  list<array<string, mixed>>  $images */
    private function createFaskes(array $headers, array $images = []): int
    {
        return $this->withHeaders($headers)->postJson('/api/admin/faskes', [
            'nama_faskes' => 'Klinik Galeri',
            'alamat_faskes' => 'Jl Galeri',
            'kota_kabupaten' => 'KOTA BOGOR',
            'latitude' => -6.6,
            'longitude' => 106.8,
            'images' => $images,
        ])->assertCreated()->json('data.id_faskes');
    }

    public function test_index_returns_igd_flag_without_shipping_facility_rows(): void
    {
        $this->seed();
        $igd = Fasilitas::query()->create(['id_fasilitas' => 9002, 'nama_fasilitas' => 'Instalasi Gawat Darurat (IGD)']);

        $target = Faskes::query()->where('kdppk', '0117R007')->firstOrFail();
        $target->fasilitas()->attach($igd->id_fasilitas);

        $rows = collect($this->getJson('/api/faskes?per_page=100')->assertOk()->json('data'));
        $row = $rows->firstWhere('id_faskes', $target->id_faskes);

        $this->assertNotNull($row);
        // Boolean IGD tetap tersedia untuk kartu...
        $this->assertTrue($row['has_igd']);
        // ...tanpa mengirim ribuan baris fasilitas yang tidak dirender.
        $this->assertArrayNotHasKey('fasilitas', $row);
    }

    /** @return array<string, string> */
    private function adminHeaders(): array
    {
        User::query()->firstOrCreate(
            ['email_user' => 'admin@bogorsehat.test'],
            ['nama_user' => 'Administrator', 'password_user' => 'password', 'role_user' => 'admin'],
        );

        $token = $this->postJson('/api/auth/login', ['email_user' => 'admin@bogorsehat.test', 'password_user' => 'password'])->json('token');

        return ['Authorization' => 'Bearer '.$token];
    }
}
