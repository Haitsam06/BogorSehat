<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SpesialisasiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id_spesialisasi' => $this->id_spesialisasi, 'nama_spesialisasi' => $this->nama_spesialisasi];
    }
}
