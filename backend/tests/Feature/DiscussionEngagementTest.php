<?php

namespace Tests\Feature;

use App\Models\Diskusi;
use App\Models\Faskes;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiscussionEngagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_discussion_list_and_detail_expose_engagement_counts(): void
    {
        $this->seed();

        $list = $this->getJson('/api/diskusi')->assertOk()->json('data.0');
        $this->assertGreaterThan(0, $list['jumlah_suka']);
        $this->assertGreaterThan(0, $list['jumlah_dilihat']);
        $this->assertGreaterThan(0, $list['jumlah_tanggapan']);
        $this->assertNotNull($list['sublokasi_penulis']);
        $this->assertNotNull($list['faskes_terkait']['nama_faskes']);

        $detail = $this->getJson('/api/diskusi/1')->assertOk()->json('data');
        $this->assertGreaterThan(0, $detail['jumlah_suka']);
        $this->assertGreaterThan(0, $detail['tanggapan'][0]['jumlah_suka']);
        $this->assertGreaterThan(0, $detail['tanggapan'][0]['replies'][0]['jumlah_suka']);
    }

    public function test_like_and_unlike_are_idempotent_per_user(): void
    {
        $this->seed();
        $user = User::query()->create(['nama_user' => 'Penyuka', 'email_user' => 'suka@example.test', 'password_user' => 'password123', 'role_user' => 'user']);
        $headers = $this->authHeaders($user);

        $before = $this->getJson('/api/diskusi/2')->assertOk()->json('data.jumlah_suka');

        $first = $this->withHeaders($headers)->postJson('/api/diskusi/2/suka')->assertOk()->json('data');
        $this->assertTrue($first['disukai']);
        $this->assertSame($before + 1, $first['jumlah_suka']);

        $repeat = $this->withHeaders($headers)->postJson('/api/diskusi/2/suka')->assertOk()->json('data');
        $this->assertSame($before + 1, $repeat['jumlah_suka']);

        $unlike = $this->withHeaders($headers)->deleteJson('/api/diskusi/2/suka')->assertOk()->json('data');
        $this->assertFalse($unlike['disukai']);
        $this->assertSame($before, $unlike['jumlah_suka']);
    }

    public function test_view_counter_ignores_author_and_repeats(): void
    {
        $this->seed();
        $viewer = User::query()->create(['nama_user' => 'Pelihat', 'email_user' => 'lihat@example.test', 'password_user' => 'password123', 'role_user' => 'user']);
        $authorHeaders = $this->withHeaders(['Authorization' => 'Bearer '.$this->postJson('/api/auth/login', ['email_user' => 'budi.santoso@bogorsehat.test', 'password_user' => 'password'])->json('token')]);
        $ownDiscussion = $authorHeaders->postJson('/api/diskusi', ['judul_diskusi' => 'Milik penulis', 'body' => 'Isi'])->assertCreated()->json('data');
        $this->assertSame(0, $ownDiscussion['jumlah_dilihat']);

        $authorHeaders->postJson('/api/diskusi/'.$ownDiscussion['id_diskusi'].'/dilihat')->assertOk()->assertJsonPath('data.jumlah_dilihat', 0);

        $viewerHeaders = $this->authHeaders($viewer);
        $this->withHeaders($viewerHeaders)->postJson('/api/diskusi/'.$ownDiscussion['id_diskusi'].'/dilihat')->assertOk()->assertJsonPath('data.jumlah_dilihat', 1);
        $this->withHeaders($viewerHeaders)->postJson('/api/diskusi/'.$ownDiscussion['id_diskusi'].'/dilihat')->assertOk()->assertJsonPath('data.jumlah_dilihat', 1);
    }

    public function test_faskes_rating_aggregates_only_rated_top_level_comments(): void
    {
        $this->seed();
        $user = User::query()->create(['nama_user' => 'Penilai', 'email_user' => 'nilai@example.test', 'password_user' => 'password123', 'role_user' => 'user']);
        $headers = $this->authHeaders($user);

        $before = $this->getJson('/api/faskes/1')->assertOk()->json('data');
        $this->withHeaders($headers)->postJson('/api/faskes/1/komentar', ['body' => 'Bagus', 'rating' => 5])->assertCreated();
        $this->withHeaders($headers)->postJson('/api/faskes/1/komentar', ['body' => 'Tanpa rating'])->assertCreated();

        $after = $this->getJson('/api/faskes/1')->assertOk()->json('data');
        $this->assertSame($before['rating_count'] + 1, $after['rating_count']);
        $this->assertGreaterThan(0, $after['rating_avg']);
    }

    public function test_nearby_discussions_only_include_faskes_within_radius_sorted_by_distance(): void
    {
        $this->seed();
        $user = User::query()->where('email_user', 'budi.santoso@bogorsehat.test')->firstOrFail();
        $origin = ['lat' => -6.595038, 'lng' => 106.799012];

        $dekat = $this->buatFaskes('Faskes Dekat', $origin['lat'], $origin['lng']);
        // ~1,8 km ke utara.
        $sedang = $this->buatFaskes('Faskes Sedang', $origin['lat'] + 0.016, $origin['lng']);
        // ~8,9 km ke utara — di luar radius 3 km.
        $jauh = $this->buatFaskes('Faskes Jauh', $origin['lat'] + 0.08, $origin['lng']);

        $dekatDiskusi = Diskusi::query()->create(['id_user' => $user->id_user, 'id_faskes' => $dekat->id_faskes, 'judul_diskusi' => 'Dekat', 'body' => 'Isi']);
        $sedangDiskusi = Diskusi::query()->create(['id_user' => $user->id_user, 'id_faskes' => $sedang->id_faskes, 'judul_diskusi' => 'Sedang', 'body' => 'Isi']);
        Diskusi::query()->create(['id_user' => $user->id_user, 'id_faskes' => $jauh->id_faskes, 'judul_diskusi' => 'Jauh', 'body' => 'Isi']);
        Diskusi::query()->create(['id_user' => $user->id_user, 'judul_diskusi' => 'Tanpa faskes', 'body' => 'Isi']);

        $data = $this->getJson('/api/diskusi/nearby?latitude='.$origin['lat'].'&longitude='.$origin['lng'])->assertOk()->json('data');

        $namaTerkait = array_column(array_column($data, 'faskes_terkait'), 'nama_faskes');
        $this->assertContains('Faskes Dekat', $namaTerkait);
        $this->assertContains('Faskes Sedang', $namaTerkait);
        $this->assertNotContains('Faskes Jauh', $namaTerkait);
        $this->assertNotContains('Tanpa faskes', array_column($data, 'judul_diskusi'));
        $jarak = array_column($data, 'jarak_faskes_km');
        $this->assertSame($jarak, collect($jarak)->sort()->values()->all());
        $this->assertSame($dekatDiskusi->id_diskusi, $data[0]['id_diskusi']);
        $this->assertLessThanOrEqual(3.0, max($jarak));
    }

    public function test_nearby_discussions_validate_coordinates_and_accept_custom_radius(): void
    {
        $this->seed();
        $user = User::query()->where('email_user', 'budi.santoso@bogorsehat.test')->firstOrFail();
        $origin = ['lat' => -6.595038, 'lng' => 106.799012];
        $jauh = $this->buatFaskes('Faskes Jauh', $origin['lat'] + 0.08, $origin['lng']);
        Diskusi::query()->create(['id_user' => $user->id_user, 'id_faskes' => $jauh->id_faskes, 'judul_diskusi' => 'Jauh', 'body' => 'Isi']);

        $this->getJson('/api/diskusi/nearby')->assertStatus(422);
        $this->getJson('/api/diskusi/nearby?latitude=200&longitude='.$origin['lng'])->assertStatus(422);

        $data = $this->getJson('/api/diskusi/nearby?latitude='.$origin['lat'].'&longitude='.$origin['lng'].'&radius=10')->assertOk()->json('data');
        $this->assertContains('Faskes Jauh', array_column(array_column($data, 'faskes_terkait'), 'nama_faskes'));
    }

    private function buatFaskes(string $nama, float $latitude, float $longitude): Faskes
    {
        return Faskes::query()->create([
            'nama_faskes' => $nama,
            'alamat_faskes' => 'Jalan Test',
            'kota_kabupaten' => 'KOTA BOGOR',
            'latitude' => $latitude,
            'longitude' => $longitude,
        ]);
    }

    /** @return array<string, string> */
    private function authHeaders(User $user): array
    {
        $token = $this->postJson('/api/auth/login', ['email_user' => $user->email_user, 'password_user' => 'password123'])->json('token');

        return ['Authorization' => 'Bearer '.$token];
    }
}
