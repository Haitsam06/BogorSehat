<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['nama_user', 'email_user', 'password_user', 'role_user', 'foto_profil'])]
#[Hidden(['password_user', 'remember_token'])]
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'users';

    protected $primaryKey = 'id_user';

    protected $authPasswordName = 'password_user';

    public function getAuthPasswordName(): string
    {
        return 'password_user';
    }

    public function getAuthPassword(): string
    {
        return (string) $this->password_user;
    }

    public function komentar(): HasMany
    {
        return $this->hasMany(Komentar::class, 'id_user', 'id_user');
    }

    public function komentarSaya(): HasMany
    {
        return $this->hasMany(Komentar::class, 'id_user', 'id_user');
    }

    public function diskusi(): HasMany
    {
        return $this->hasMany(Diskusi::class, 'id_user', 'id_user');
    }

    public function tanggapanDiskusi(): HasMany
    {
        return $this->hasMany(TanggapanDiskusi::class, 'id_user', 'id_user');
    }

    public function feedbackFaskes(): HasMany
    {
        return $this->hasMany(FeedbackFaskes::class, 'id_user', 'id_user');
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password_user' => 'hashed',
        ];
    }
}
