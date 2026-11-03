<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiskusiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_diskusi' => $this->id_diskusi,
            'judul_diskusi' => $this->judul_diskusi,
            'kategori_diskusi' => $this->kategori_diskusi,
            'body' => $this->body,
            'image_path' => $this->image_path,
            'user' => new UserResource($this->whenLoaded('user')),
            'tanggapan' => TanggapanDiskusiResource::collection($this->whenLoaded('tanggapan')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
