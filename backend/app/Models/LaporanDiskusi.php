<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LaporanDiskusi extends Model
{
    protected $table = 'laporan_diskusi';

    protected $primaryKey = 'id_laporan_diskusi';

    protected $fillable = ['id_diskusi', 'id_reported_user', 'alasan', 'catatan', 'status'];

    public function diskusi(): BelongsTo
    {
        return $this->belongsTo(Diskusi::class, 'id_diskusi', 'id_diskusi');
    }

    public function reportedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_reported_user', 'id_user');
    }
}
