<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiskusiSuka extends Model
{
    protected $table = 'diskusi_suka';

    protected $primaryKey = 'id_diskusi_suka';

    protected $fillable = ['id_diskusi', 'id_user'];

    public function diskusi(): BelongsTo
    {
        return $this->belongsTo(Diskusi::class, 'id_diskusi', 'id_diskusi');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
}
