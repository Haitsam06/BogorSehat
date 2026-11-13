<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Diskusi extends Model
{
    protected $table = 'diskusi';

    protected $primaryKey = 'id_diskusi';

    protected $fillable = ['id_user', 'id_faskes', 'judul_diskusi', 'kategori_diskusi', 'body', 'image_path'];

    protected function casts(): array
    {
        return ['image_path' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function tanggapan(): HasMany
    {
        return $this->hasMany(TanggapanDiskusi::class, 'id_diskusi', 'id_diskusi');
    }

    public function faskes(): BelongsTo
    {
        return $this->belongsTo(Faskes::class, 'id_faskes', 'id_faskes');
    }

    public function suka(): HasMany
    {
        return $this->hasMany(DiskusiSuka::class, 'id_diskusi', 'id_diskusi');
    }

    public function dilihat(): HasMany
    {
        return $this->hasMany(DiskusiDilihat::class, 'id_diskusi', 'id_diskusi');
    }

    public function sukaOleh(int $idUser): bool
    {
        return $this->suka()->where('id_user', $idUser)->exists();
    }
}
