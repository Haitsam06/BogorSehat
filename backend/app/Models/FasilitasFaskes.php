<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FasilitasFaskes extends Model
{
    protected $table = 'fasilitas_faskes';

    protected $primaryKey = 'id_fasilitas_faskes';

    protected $fillable = ['id_faskes', 'id_fasilitas'];

    public function faskes(): BelongsTo
    {
        return $this->belongsTo(Faskes::class, 'id_faskes', 'id_faskes');
    }

    public function fasilitas(): BelongsTo
    {
        return $this->belongsTo(Fasilitas::class, 'id_fasilitas', 'id_fasilitas');
    }
}
