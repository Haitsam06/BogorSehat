<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FasilitasResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id_fasilitas' => $this->id_fasilitas, 'nama_fasilitas' => $this->nama_fasilitas];
    }
}
