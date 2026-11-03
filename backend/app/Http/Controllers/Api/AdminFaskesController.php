<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FaskesResource;
use App\Models\Faskes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminFaskesController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $faskes = DB::transaction(function () use ($data): Faskes {
            $specializations = $data['id_spesialisasi'] ?? [];
            $facilities = $data['id_fasilitas'] ?? [];
            unset($data['id_spesialisasi'], $data['id_fasilitas']);
            $faskes = Faskes::query()->create($data);
            $faskes->spesialisasi()->sync($specializations);
            $faskes->fasilitas()->sync($facilities);

            return $faskes;
        });

        return response()->json(['data' => new FaskesResource($faskes->load(['spesialisasi', 'fasilitas']))], 201);
    }

    public function update(Request $request, Faskes $faskes): FaskesResource
    {
        $data = $this->validated($request, $faskes);
        DB::transaction(function () use ($data, $faskes): void {
            $specializations = $data['id_spesialisasi'] ?? null;
            $facilities = $data['id_fasilitas'] ?? null;
            unset($data['id_spesialisasi'], $data['id_fasilitas']);
            $faskes->update($data);
            if ($specializations !== null) {
                $faskes->spesialisasi()->sync($specializations);
            }
            if ($facilities !== null) {
                $faskes->fasilitas()->sync($facilities);
            }
        });

        return new FaskesResource($faskes->fresh()->load(['spesialisasi', 'fasilitas']));
    }

    public function destroy(Faskes $faskes): JsonResponse
    {
        $faskes->delete();

        return response()->json(['message' => 'Faskes deleted.']);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, ?Faskes $faskes = null): array
    {
        $id = $faskes?->getKey();
        $data = $request->validate([
            'kdppk' => ['sometimes', 'nullable', 'string', 'max:20', 'unique:faskes,kdppk,'.$id.',id_faskes'],
            'nama_faskes' => [$faskes === null ? 'required' : 'sometimes', 'string', 'max:255'],
            'jenis_faskes' => ['sometimes', 'nullable', 'string', 'max:100'],
            'kelas_faskes' => ['sometimes', 'nullable', 'string', 'max:20'],
            'alamat_faskes' => [$faskes === null ? 'required' : 'sometimes', 'string'],
            'provinsi' => ['sometimes', 'string', 'max:100'],
            'kecamatan' => ['sometimes', 'nullable', 'string', 'max:100'],
            'kota_kabupaten' => [$faskes === null ? 'required' : 'sometimes', 'string', 'max:20'],
            'longitude' => [$faskes === null ? 'required' : 'sometimes', 'numeric', 'between:-180,180'],
            'latitude' => [$faskes === null ? 'required' : 'sometimes', 'numeric', 'between:-90,90'],
            'telp_faskes' => ['sometimes', 'nullable', 'string', 'max:50'],
            'is_support_bpjs' => ['sometimes', 'nullable', 'boolean'],
            'link_maps' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'id_spesialisasi' => ['sometimes', 'array'],
            'id_spesialisasi.*' => ['string', 'exists:spesialisasi,id_spesialisasi'],
            'id_fasilitas' => ['sometimes', 'array'],
            'id_fasilitas.*' => ['integer', 'exists:fasilitas,id_fasilitas'],
        ]);

        if (array_key_exists('latitude', $data) && array_key_exists('longitude', $data) && ! array_key_exists('link_maps', $data)) {
            $data['link_maps'] = 'https://www.google.com/maps/dir/?api=1&destination='.$data['latitude'].','.$data['longitude'];
        }

        return $data;
    }
}
