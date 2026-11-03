<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LaporanKomentar extends Model
{
    protected $table = 'laporan_komentar';

    protected $primaryKey = 'id_laporan_komentar';

    protected $fillable = ['id_komentar', 'id_faskes', 'id_reported_user', 'alasan', 'catatan', 'status'];

    public function komentar(): BelongsTo
    {
        return $this->belongsTo(Komentar::class, 'id_komentar', 'id_komentar');
    }

    public function faskes(): BelongsTo
    {
        return $this->belongsTo(Faskes::class, 'id_faskes', 'id_faskes');
    }

    public function reportedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_reported_user', 'id_user');
    }
}
