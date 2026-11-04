<?php

namespace Tests\Feature;

use App\Models\ApiToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_login_and_read_profile(): void
    {
        $this->seed();

        $this->postJson('/api/auth/register', [
            'nama_user' => 'Pengguna Baru',
            'email_user' => 'user@example.test',
            'password_user' => 'password123',
            'password_user_confirmation' => 'password123',
        ])->assertCreated()->assertJsonPath('data.email_user', 'user@example.test');

        $login = $this->postJson('/api/auth/login', [
            'email_user' => 'user@example.test',
            'password_user' => 'password123',
        ])->assertOk()->assertJsonStructure(['data', 'token']);
        $token = $login->json('token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.nama_user', 'Pengguna Baru');

        $this->assertDatabaseHas('api_tokens', ['id_user' => User::query()->where('email_user', 'user@example.test')->value('id_user')]);
    }

    public function test_invalid_token_is_rejected_and_logout_revokes_token(): void
    {
        $this->seed();
        $login = $this->postJson('/api/auth/login', [
            'email_user' => 'admin@bogorsehat.test',
            'password_user' => 'password',
        ])->assertOk();
        $token = $login->json('token');

        $this->withHeader('Authorization', 'Bearer invalid-token')
            ->getJson('/api/user')
            ->assertUnauthorized();

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/auth/logout')
            ->assertOk();
        $this->assertSame(0, ApiToken::query()->count());
    }

    public function test_public_faskes_endpoints_support_detail_filters_and_nearby(): void
    {
        $this->seed();

        $this->getJson('/api/faskes?search=RSUD')->assertOk()->assertJsonFragment(['nama_faskes' => 'RSUD R. MOH. NOH NUR']);
        $this->getJson('/api/faskes/1')->assertOk()->assertJsonPath('data.kdppk', '0117R007');
        $this->getJson('/api/spesialisasi')->assertOk()->assertJsonStructure(['data', 'meta', 'links']);
        $this->getJson('/api/fasilitas')->assertOk()->assertJsonStructure(['data', 'meta', 'links']);
        $this->getJson('/api/faskes/map')->assertOk()->assertJsonFragment(['id_faskes' => 1, 'nama_faskes' => 'RSUD R. MOH. NOH NUR']);
        $nearby = $this->getJson('/api/faskes/nearby?latitude=-6.57451&longitude=106.628&radius=1')->assertOk()->json('data');
        $target = collect($nearby)->firstWhere('id_faskes', 1);
        $this->assertNotNull($target);
        $this->assertSame(0.0, (float) $target['distance_km']);
    }

    public function test_faskes_filter_supports_province_and_extracted_district(): void
    {
        $this->seed();

        $this->getJson('/api/faskes?provinsi=JAWA%20BARAT')->assertOk()->assertJsonPath('meta.total', 506);
        $this->getJson('/api/faskes?kecamatan=CIJERUK')->assertOk()->assertJsonPath('data.0.kecamatan', 'CIJERUK');
    }

    public function test_maps_link_resolves_place_name_instead_of_bare_coordinates(): void
    {
        $this->seed();

        $link = $this->getJson('/api/faskes/1')->assertOk()->json('data.link_maps');
        $this->assertStringContainsString('destination='.rawurlencode('RSUD R. MOH. NOH NUR'), $link);
        $this->assertStringNotContainsString('destination=-6.', $link);
    }
}
