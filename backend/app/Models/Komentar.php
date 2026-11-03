<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Komentar extends Model
{
    protected $table = 'komentar';

    protected $primaryKey = 'id_komentar';

    protected $fillable = ['id_user', 'id_faskes', 'id_parent', 'body', 'rating', 'image_path'];

    protected function casts(): array
    {
        return ['image_path' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function faskes(): BelongsTo
    {
        return $this->belongsTo(Faskes::class, 'id_faskes', 'id_faskes');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'id_parent', 'id_komentar');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'id_parent', 'id_komentar');
    }
}
