<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FaskesImage extends Model
{
    protected $table = 'faskes_images';

    protected $primaryKey = 'id_faskes_image';

    protected $fillable = ['id_faskes', 'path', 'url', 'is_banner', 'is_thumbnail', 'sort_order'];

    protected function casts(): array
    {
        return [
            'is_banner' => 'boolean',
            'is_thumbnail' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function faskes(): BelongsTo
    {
        return $this->belongsTo(Faskes::class, 'id_faskes', 'id_faskes');
    }
}
