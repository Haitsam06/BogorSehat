<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Fasilitas extends Model
{
    protected $table = 'fasilitas';

    protected $primaryKey = 'id_fasilitas';

    public $incrementing = false;

    protected $fillable = ['id_fasilitas', 'nama_fasilitas'];

    public function faskes(): BelongsToMany
    {
        return $this->belongsToMany(Faskes::class, 'fasilitas_faskes', 'id_fasilitas', 'id_faskes', 'id_fasilitas', 'id_faskes');
    }
}
