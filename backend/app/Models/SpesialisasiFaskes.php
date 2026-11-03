<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpesialisasiFaskes extends Model
{
    protected $table = 'spesialisasi_faskes';

    protected $primaryKey = 'id_spesialisasi_faskes';

    protected $fillable = ['id_faskes', 'id_spesialisasi'];

    public function faskes(): BelongsTo
    {
        return $this->belongsTo(Faskes::class, 'id_faskes', 'id_faskes');
    }

    public function spesialisasi(): BelongsTo
    {
        return $this->belongsTo(Spesialisasi::class, 'id_spesialisasi', 'id_spesialisasi');
    }
}
