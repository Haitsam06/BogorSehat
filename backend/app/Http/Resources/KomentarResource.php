<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KomentarResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_komentar' => $this->id_komentar,
            'id_faskes' => $this->id_faskes,
            'id_parent' => $this->id_parent,
            'body' => $this->body,
            'rating' => $this->rating,
            'image_path' => $this->image_path,
            'user' => new UserResource($this->whenLoaded('user')),
            'faskes' => new FaskesResource($this->whenLoaded('faskes')),
            'replies' => $this->relationLoaded('replies') ? self::collection($this->replies) : [],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
