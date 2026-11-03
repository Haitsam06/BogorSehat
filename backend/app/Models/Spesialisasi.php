<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Spesialisasi extends Model
{
    protected $table = 'spesialisasi';

    protected $primaryKey = 'id_spesialisasi';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id_spesialisasi', 'nama_spesialisasi'];

    public function faskes(): BelongsToMany
    {
        return $this->belongsToMany(Faskes::class, 'spesialisasi_faskes', 'id_spesialisasi', 'id_faskes', 'id_spesialisasi', 'id_faskes');
    }
}
