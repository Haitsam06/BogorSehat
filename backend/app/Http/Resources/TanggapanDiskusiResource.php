<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TanggapanDiskusiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_tanggapan_diskusi' => $this->id_tanggapan_diskusi,
            'id_diskusi' => $this->id_diskusi,
            'id_user' => $this->id_user,
            'id_parent' => $this->id_parent,
            'body' => $this->body,
            'image_path' => $this->image_path,
            'user' => new UserResource($this->whenLoaded('user')),
            'replies' => $this->relationLoaded('replies') ? self::collection($this->replies) : [],
            'jumlah_suka' => (int) ($this->suka_count ?? 0),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
