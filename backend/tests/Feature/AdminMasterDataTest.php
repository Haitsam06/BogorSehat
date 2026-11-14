<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AdminMasterDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_search_and_paginate_spesialisasi(): void
    {
        $this->seed();
        $headers = $this->adminHeaders();

        $page = $this->withHeaders($headers)->getJson('/api/admin/spesialisasi?per_page=5')->assertOk()->json();
        $this->assertSame(51, $page['meta']['total']);
        $this->assertCount(5, $page['data']);
        $this->assertArrayHasKey('faskes_count', $page['data'][0]);

        $search = $this->withHeaders($headers)->getJson('/api/admin/spesialisasi?search=anak')->assertOk()->json();
        $this->assertSame(2, $search['meta']['total']);
        foreach ($search['data'] as $row) {
            $this->assertStringContainsStringIgnoringCase('anak', $row['nama_spesialisasi']);
        }
    }

    public function test_admin_can_create_update_and_delete_spesialisasi(): void
    {
        $this->seed();
        $headers = $this->adminHeaders();

        $created = $this->withHeaders($headers)
            ->postJson('/api/admin/spesialisasi', ['id_spesialisasi' => 'ZZT', 'nama_spesialisasi' => 'Uji Spesialisasi'])
            ->assertCreated()
            ->json('data');
        $this->assertSame('ZZT', $created['id_spesialisasi']);
        $this->assertSame(0, $created['faskes_count']);

        $updated = $this->withHeaders($headers)
            ->putJson('/api/admin/spesialisasi/ZZT', ['nama_spesialisasi' => 'Uji Revisi'])
            ->assertOk()
            ->json('data');
        $this->assertSame('Uji Revisi', $updated['nama_spesialisasi']);

        $this->withHeaders($headers)->deleteJson('/api/admin/spesialisasi/ZZT')->assertOk();
        $this->assertDatabaseMissing('spesialisasi', ['id_spesialisasi' => 'ZZT']);
    }

    public function test_spesialisasi_validation_rejects_duplicate_and_missing_fields(): void
    {
        $this->seed();
        $headers = $this->adminHeaders();

        $this->withHeaders($headers)
            ->postJson('/api/admin/spesialisasi', ['id_spesialisasi' => 'ANA', 'nama_spesialisasi' => 'Duplikat'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('id_spesialisasi');

        $this->withHeaders($headers)
            ->postJson('/api/admin/spesialisasi', ['nama_spesialisasi' => 'Tanpa Kode'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('id_spesialisasi');
    }

    public function test_deleting_a_used_spesialisasi_requires_force(): void
    {
        $this->seed();
        $headers = $this->adminHeaders();

        $used = DB::table('spesialisasi_faskes')->value('id_spesialisasi');
        $this->assertNotNull($used);

        $this->withHeaders($headers)->deleteJson('/api/admin/spesialisasi/'.$used)->assertStatus(409);
        $this->assertDatabaseHas('spesialisasi', ['id_spesialisasi' => $used]);

        $this->withHeaders($headers)->deleteJson('/api/admin/spesialisasi/'.$used.'?force=1')->assertOk();
        $this->assertDatabaseMissing('spesialisasi', ['id_spesialisasi' => $used]);
        $this->assertSame(0, DB::table('spesialisasi_faskes')->where('id_spesialisasi', $used)->count());
    }

    public function test_admin_can_create_update_and_delete_fasilitas(): void
    {
        $this->seed();
        $headers = $this->adminHeaders();

        $created = $this->withHeaders($headers)
            ->postJson('/api/admin/fasilitas', ['nama_fasilitas' => 'Uji Fasilitas'])
            ->assertCreated()
            ->json('data');
        $this->assertGreaterThan(818, $created['id_fasilitas']);

        $explicit = $this->withHeaders($headers)
            ->postJson('/api/admin/fasilitas', ['id_fasilitas' => 5001, 'nama_fasilitas' => 'Uji Eksplisit'])
            ->assertCreated()
            ->json('data.id_fasilitas');
        $this->assertSame(5001, $explicit);

        $this->withHeaders($headers)
            ->putJson('/api/admin/fasilitas/'.$created['id_fasilitas'], ['nama_fasilitas' => 'Uji Revisi'])
            ->assertOk()
            ->assertJsonPath('data.nama_fasilitas', 'Uji Revisi');

        $this->withHeaders($headers)->deleteJson('/api/admin/fasilitas/'.$created['id_fasilitas'])->assertOk();
        $this->withHeaders($headers)->deleteJson('/api/admin/fasilitas/5001')->assertOk();
        $this->assertDatabaseMissing('fasilitas', ['id_fasilitas' => $created['id_fasilitas']]);
    }

    public function test_fasilitas_validation_and_usage_guard(): void
    {
        $this->seed();
        $headers = $this->adminHeaders();

        $this->withHeaders($headers)
            ->postJson('/api/admin/fasilitas', ['id_fasilitas' => 205, 'nama_fasilitas' => 'Duplikat'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('id_fasilitas');

        $this->withHeaders($headers)
            ->postJson('/api/admin/fasilitas', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors('nama_fasilitas');

        $used = DB::table('fasilitas_faskes')->value('id_fasilitas');
        $this->withHeaders($headers)->deleteJson('/api/admin/fasilitas/'.$used)->assertStatus(409);
        $this->assertDatabaseHas('fasilitas', ['id_fasilitas' => $used]);
    }

    public function test_master_data_endpoints_reject_non_admin_tokens(): void
    {
        $this->seed();

        $this->getJson('/api/admin/spesialisasi')->assertUnauthorized();
        $this->getJson('/api/admin/fasilitas')->assertUnauthorized();

        $user = User::query()->create(['nama_user' => 'Warga', 'email_user' => 'warga@example.test', 'password_user' => 'password123', 'role_user' => 'user']);
        $token = $this->postJson('/api/auth/login', ['email_user' => $user->email_user, 'password_user' => 'password123'])->json('token');
        $headers = ['Authorization' => 'Bearer '.$token];

        $this->withHeaders($headers)->getJson('/api/admin/spesialisasi')->assertForbidden();
        $this->withHeaders($headers)->getJson('/api/admin/fasilitas')->assertForbidden();
        $this->withHeaders($headers)->postJson('/api/admin/spesialisasi', ['id_spesialisasi' => 'X', 'nama_spesialisasi' => 'X'])->assertForbidden();
    }

    public function test_public_master_data_still_reads_the_same_tables(): void
    {
        $this->seed();
        $headers = $this->adminHeaders();

        $this->withHeaders($headers)->postJson('/api/admin/spesialisasi', ['id_spesialisasi' => 'ZPUB', 'nama_spesialisasi' => 'Publik Uji'])->assertCreated();
        $public = $this->getJson('/api/spesialisasi')->assertOk()->json('data');
        $this->assertContains('ZPUB', array_column($public, 'id_spesialisasi'));
    }

    /** @return array<string, string> */
    private function adminHeaders(): array
    {
        $token = $this->postJson('/api/auth/login', ['email_user' => 'admin@bogorsehat.test', 'password_user' => 'password'])->json('token');

        return ['Authorization' => 'Bearer '.$token];
    }
}
