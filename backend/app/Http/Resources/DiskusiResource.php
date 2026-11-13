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
            'id_user' => $this->id_user,
            'id_faskes' => $this->id_faskes,
            'judul_diskusi' => $this->judul_diskusi,
            'kategori_diskusi' => $this->kategori_diskusi,
            'body' => $this->body,
            'image_path' => $this->image_path,
            'user' => new UserResource($this->whenLoaded('user')),
            'faskes_terkait' => $this->relationLoaded('faskes') && $this->faskes !== null
                ? [
                    'id_faskes' => $this->faskes->id_faskes,
                    'nama_faskes' => $this->faskes->nama_faskes,
                    'alamat' => $this->faskes->alamat_faskes,
                    'kecamatan' => $this->faskes->kecamatan,
                    'kota_kabupaten' => $this->faskes->kota_kabupaten,
                    'link_maps' => $this->faskes->link_maps,
                ]
                : null,
            'sublokasi_penulis' => $this->relationLoaded('faskes') && $this->faskes !== null
                ? ($this->faskes->kecamatan ?? $this->faskes->kota_kabupaten)
                : null,
            'tanggapan' => TanggapanDiskusiResource::collection($this->whenLoaded('tanggapan')),
            'jumlah_tanggapan' => (int) ($this->tanggapan_count ?? 0),
            'jumlah_suka' => (int) ($this->suka_count ?? 0),
            'jumlah_dilihat' => (int) ($this->dilihat_count ?? 0),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
