<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiDomainTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_use_comments_forum_feedback_and_reports(): void
    {
        $this->seed();
        $user = User::query()->create(['nama_user' => 'User Test', 'email_user' => 'domain@example.test', 'password_user' => 'password123', 'role_user' => 'user']);
        $token = $this->postJson('/api/auth/login', ['email_user' => $user->email_user, 'password_user' => 'password123'])->json('token');
        $headers = ['Authorization' => 'Bearer '.$token];

        $comment = $this->withHeaders($headers)->postJson('/api/faskes/1/komentar', ['body' => 'Pelayanan baik', 'rating' => 5])->assertCreated()->json('data.id_komentar');
        $this->withHeaders($headers)->postJson('/api/komentar/'.$comment.'/replies', ['body' => 'Setuju'])->assertCreated();
        $this->withHeaders($headers)->postJson('/api/komentar/'.$comment.'/report', ['alasan' => 'Tidak relevan'])->assertCreated();
        $this->withHeaders($headers)->postJson('/api/faskes/1/feedback', ['alasan' => 'Alamat berubah', 'saran_perbaikan' => 'Perbarui alamat'])->assertCreated();
        $this->withHeaders($headers)->getJson('/api/me/komentar')
            ->assertOk()
            ->assertJsonPath('data.0.id_komentar', $comment)
            ->assertJsonPath('data.0.faskes.id_faskes', 1);

        $discussion = $this->withHeaders($headers)->postJson('/api/diskusi', ['judul_diskusi' => 'Tanya faskes', 'body' => 'Ada rekomendasi?'])->assertCreated()->json('data.id_diskusi');
        $reply = $this->withHeaders($headers)->postJson('/api/diskusi/'.$discussion.'/tanggapan', ['body' => 'Ada'])->assertCreated()->json('data.id_tanggapan_diskusi');
        $this->withHeaders($headers)->postJson('/api/tanggapan-diskusi/'.$reply.'/replies', ['body' => 'Terima kasih'])->assertCreated();
        $this->withHeaders($headers)->getJson('/api/diskusi/'.$discussion)->assertOk()->assertJsonPath('data.id_diskusi', $discussion);
    }

    public function test_admin_can_manage_faskes_reports_feedback_and_users(): void
    {
        $this->seed();
        $token = $this->postJson('/api/auth/login', ['email_user' => 'admin@bogorsehat.test', 'password_user' => 'password'])->json('token');
        $headers = ['Authorization' => 'Bearer '.$token];

        $faskes = $this->withHeaders($headers)->postJson('/api/admin/faskes', [
            'kdppk' => 'TEST001', 'nama_faskes' => 'Faskes Test', 'alamat_faskes' => 'Jalan Test', 'kota_kabupaten' => 'KAB. BOGOR',
            'longitude' => 106.8, 'latitude' => -6.5, 'is_support_bpjs' => true,
        ])->assertCreated()->json('data.id_faskes');
        $this->withHeaders($headers)->putJson('/api/admin/faskes/'.$faskes, ['nama_faskes' => 'Faskes Updated'])->assertOk();
        $this->withHeaders($headers)->deleteJson('/api/admin/faskes/'.$faskes)->assertOk();

        $this->withHeaders($headers)->getJson('/api/admin/laporan')->assertOk();
        $this->withHeaders($headers)->getJson('/api/admin/feedback-faskes')->assertOk();
        $user = User::query()->create(['nama_user' => 'Managed User', 'email_user' => 'managed@example.test', 'password_user' => 'password123', 'role_user' => 'user']);
        $this->withHeaders($headers)->putJson('/api/admin/users/'.$user->id_user, ['role_user' => 'admin'])->assertOk();
    }
}
