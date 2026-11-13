<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TanggapanDiskusiSuka extends Model
{
    protected $table = 'tanggapan_diskusi_suka';

    protected $primaryKey = 'id_tanggapan_diskusi_suka';

    protected $fillable = ['id_tanggapan', 'id_user'];

    public function tanggapan(): BelongsTo
    {
        return $this->belongsTo(TanggapanDiskusi::class, 'id_tanggapan', 'id_tanggapan_diskusi');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
}
