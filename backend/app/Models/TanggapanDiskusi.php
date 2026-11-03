<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TanggapanDiskusi extends Model
{
    protected $table = 'tanggapan_diskusi';

    protected $primaryKey = 'id_tanggapan_diskusi';

    protected $fillable = ['id_user', 'id_diskusi', 'id_parent', 'body', 'image_path'];

    protected function casts(): array
    {
        return ['image_path' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function diskusi(): BelongsTo
    {
        return $this->belongsTo(Diskusi::class, 'id_diskusi', 'id_diskusi');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'id_parent', 'id_tanggapan_diskusi');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'id_parent', 'id_tanggapan_diskusi');
    }
}
