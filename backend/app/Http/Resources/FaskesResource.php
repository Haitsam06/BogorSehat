<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FaskesResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_faskes' => $this->id_faskes,
            'kdppk' => $this->kdppk,
            'nama_faskes' => $this->nama_faskes,
            'jenis_faskes' => $this->jenis_faskes,
            'kelas_faskes' => $this->kelas_faskes,
            'alamat_faskes' => $this->alamat_faskes,
            'provinsi' => $this->provinsi,
            'kecamatan' => $this->kecamatan,
            'kota_kabupaten' => $this->kota_kabupaten,
            'longitude' => $this->longitude,
            'latitude' => $this->latitude,
            'rating_avg' => $this->when($this->rating_count !== null, fn (): float => round((float) ($this->rating_avg ?? 0), 2)),
            'rating_count' => $this->when($this->rating_count !== null, fn (): int => (int) $this->rating_count),
            'link_maps' => $this->link_maps,
            'has_igd' => $this->when($this->has_igd !== null, fn (): bool => (bool) $this->has_igd),
            'distance_km' => $this->when(isset($this->distance_km), $this->distance_km),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($image): array => [
                'id_faskes_image' => $image->id_faskes_image,
                'path' => $image->path,
                'url' => $image->url,
                'is_banner' => $image->is_banner,
                'is_thumbnail' => $image->is_thumbnail,
                'sort_order' => $image->sort_order,
            ])->values()),
            'banner_url' => $this->whenLoaded('images', fn () => $this->images->firstWhere('is_banner', true)?->url),
            'thumbnail_url' => $this->whenLoaded('images', fn () => $this->images->firstWhere('is_thumbnail', true)?->url),
            'spesialisasi' => SpesialisasiResource::collection($this->whenLoaded('spesialisasi')),
            'fasilitas' => FasilitasResource::collection($this->whenLoaded('fasilitas')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
