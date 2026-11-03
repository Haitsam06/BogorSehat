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
            'telp_faskes' => $this->telp_faskes,
            'is_support_bpjs' => $this->is_support_bpjs,
            'link_maps' => $this->link_maps,
            'distance_km' => $this->when(isset($this->distance_km), $this->distance_km),
            'spesialisasi' => SpesialisasiResource::collection($this->whenLoaded('spesialisasi')),
            'fasilitas' => FasilitasResource::collection($this->whenLoaded('fasilitas')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
