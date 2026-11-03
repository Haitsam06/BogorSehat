<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LaporanTanggapan extends Model
{
    protected $table = 'laporan_tanggapan';

    protected $primaryKey = 'id_laporan_tanggapan';

    protected $fillable = ['id_tanggapan', 'id_reported_user', 'alasan', 'catatan', 'status'];

    public function tanggapan(): BelongsTo
    {
        return $this->belongsTo(TanggapanDiskusi::class, 'id_tanggapan', 'id_tanggapan_diskusi');
    }

    public function reportedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_reported_user', 'id_user');
    }
}
