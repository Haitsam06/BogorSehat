<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UploadAndRatingTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_upload_an_image(): void
    {
        Storage::fake('public');
        $this->seed();
        $user = User::query()->create(['nama_user' => 'Pengunggah', 'email_user' => 'unggah@example.test', 'password_user' => 'password123', 'role_user' => 'user']);

        $response = $this->withHeaders($this->authHeaders($user))
            ->post('/api/uploads', [
                'file' => UploadedFile::fake()->image('bukti.jpg', 320, 240),
                'context' => 'diskusi',
            ])
            ->assertCreated()
            ->assertJsonPath('data.mime', 'image/webp');

        Storage::disk('public')->assertExists($response->json('data.path'));
        $this->assertStringStartsWith('uploads/diskusi/', $response->json('data.path'));
    }

    public function test_upload_rejects_files_outside_the_allowed_types(): void
    {
        Storage::fake('public');
        $this->seed();
        $user = User::query()->create(['nama_user' => 'Pengunggah', 'email_user' => 'tolak@example.test', 'password_user' => 'password123', 'role_user' => 'user']);

        $this->withHeaders($this->authHeaders($user))
            ->post('/api/uploads', ['file' => UploadedFile::fake()->create('script.php', 8, 'application/x-php')])
            ->assertStatus(422);
    }

    public function test_upload_requires_authentication(): void
    {
        Storage::fake('public');

        $this->post('/api/uploads', ['file' => UploadedFile::fake()->image('x.jpg')])
            ->assertUnauthorized();
    }

    public function test_uploaded_path_can_be_attached_to_a_discussion(): void
    {
        Storage::fake('public');
        $this->seed();
        $user = User::query()->create(['nama_user' => 'Penulis', 'email_user' => 'lampir@example.test', 'password_user' => 'password123', 'role_user' => 'user']);
        $headers = $this->authHeaders($user);

        $path = $this->withHeaders($headers)
            ->post('/api/uploads', ['file' => UploadedFile::fake()->image('lampiran.png'), 'context' => 'diskusi'])
            ->assertCreated()
            ->json('data.url');

        $this->withHeaders($headers)
            ->postJson('/api/diskusi', ['judul_diskusi' => 'Dengan lampiran', 'body' => 'Isi', 'image_path' => [$path], 'id_faskes' => 5])
            ->assertCreated()
            ->assertJsonPath('data.image_path.0', $path);
    }

    public function test_rating_summary_is_returned_with_comment_list_and_after_creating_one(): void
    {
        $this->seed();
        $user = User::query()->create(['nama_user' => 'Penilai', 'email_user' => 'rating@example.test', 'password_user' => 'password123', 'role_user' => 'user']);
        $headers = $this->authHeaders($user);

        $before = $this->getJson('/api/faskes/2/komentar')->assertOk()->json('rating');
        $this->assertSame(0, $before['rating_count']);

        $created = $this->withHeaders($headers)
            ->postJson('/api/faskes/2/komentar', ['body' => 'Pelayanan cepat', 'rating' => 4])
            ->assertCreated()
            ->json('rating');
        $this->assertSame(1, $created['rating_count']);
        $this->assertSame(4.0, (float) $created['rating_avg']);

        $this->withHeaders($headers)->postJson('/api/faskes/2/komentar', ['body' => 'Tanpa rating'])->assertCreated();

        $after = $this->getJson('/api/faskes/2/komentar')->assertOk()->json('rating');
        $this->assertSame(1, $after['rating_count']);
        $this->assertSame(4.0, (float) $after['rating_avg']);

        $detail = $this->getJson('/api/faskes/2')->assertOk()->json('data');
        $this->assertSame(1, $detail['rating_count']);
    }

    /** @return array<string, string> */
    private function authHeaders(User $user): array
    {
        $token = $this->postJson('/api/auth/login', ['email_user' => $user->email_user, 'password_user' => 'password123'])->json('token');

        return ['Authorization' => 'Bearer '.$token];
    }
}
