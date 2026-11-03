<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedbackFaskes extends Model
{
    protected $table = 'feedback_faskes';

    protected $primaryKey = 'id_feedback_faskes';

    protected $fillable = ['id_faskes', 'id_user', 'alasan', 'saran_perbaikan', 'status', 'catatan_admin'];

    public function faskes(): BelongsTo
    {
        return $this->belongsTo(Faskes::class, 'id_faskes', 'id_faskes');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
}
