<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FaskesResource;
use App\Models\Faskes;
use App\Models\FaskesImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AdminFaskesController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $faskes = DB::transaction(function () use ($data): Faskes {
            $specializations = $data['id_spesialisasi'] ?? [];
            $facilities = $data['id_fasilitas'] ?? [];
            $images = $data['images'] ?? [];
            unset($data['id_spesialisasi'], $data['id_fasilitas'], $data['images']);
            $faskes = Faskes::query()->create($data);
            $faskes->spesialisasi()->sync($specializations);
            $faskes->fasilitas()->sync($facilities);
            $this->syncImages($faskes, $images);

            return $faskes;
        });

        return response()->json(['data' => new FaskesResource($faskes->load(['spesialisasi', 'fasilitas', 'images']))], 201);
    }

    public function update(Request $request, Faskes $faskes): FaskesResource
    {
        $data = $this->validated($request, $faskes);
        DB::transaction(function () use ($data, $faskes): void {
            $specializations = $data['id_spesialisasi'] ?? null;
            $facilities = $data['id_fasilitas'] ?? null;
            $hasImages = array_key_exists('images', $data);
            $images = $data['images'] ?? [];
            unset($data['id_spesialisasi'], $data['id_fasilitas'], $data['images']);
            $faskes->update($data);
            if ($specializations !== null) {
                $faskes->spesialisasi()->sync($specializations);
            }
            if ($facilities !== null) {
                $faskes->fasilitas()->sync($facilities);
            }
            if ($hasImages) {
                $this->syncImages($faskes, $images);
            }
        });

        return new FaskesResource($faskes->fresh()->load(['spesialisasi', 'fasilitas', 'images']));
    }

    public function destroy(Faskes $faskes): JsonResponse
    {
        $paths = $faskes->images()->pluck('path')->all();
        $faskes->delete();
        $this->deleteFiles($paths);

        return response()->json(['message' => 'Faskes deleted.']);
    }

    /** @param  list<array<string, mixed>>  $images */
    private function syncImages(Faskes $faskes, array $images): void
    {
        $previousPaths = $faskes->images()->pluck('path')->all();
        $normalized = $this->normalizeImages($images);

        $faskes->images()->delete();

        foreach ($normalized as $image) {
            FaskesImage::query()->create([...$image, 'id_faskes' => $faskes->id_faskes]);
        }

        $this->deleteFiles(array_diff($previousPaths, array_column($normalized, 'path')));
    }

    /**
     * @param  list<array<string, mixed>>  $images
     * @return list<array<string, mixed>>
     */
    private function normalizeImages(array $images): array
    {
        $normalized = [];
        foreach (array_values($images) as $index => $image) {
            $normalized[] = [
                'path' => (string) $image['path'],
                'is_banner' => (bool) ($image['is_banner'] ?? false),
                'is_thumbnail' => (bool) ($image['is_thumbnail'] ?? false),
                'sort_order' => (int) ($image['sort_order'] ?? $index),
            ];
        }

        $bannerSeen = false;
        $thumbnailSeen = false;
        foreach ($normalized as $index => $image) {
            if ($image['is_banner']) {
                if ($bannerSeen) {
                    $normalized[$index]['is_banner'] = false;
                }
                $bannerSeen = true;
            }
            if ($image['is_thumbnail']) {
                if ($thumbnailSeen) {
                    $normalized[$index]['is_thumbnail'] = false;
                }
                $thumbnailSeen = true;
            }
        }

        if ($normalized !== [] && ! $bannerSeen) {
            $normalized[0]['is_banner'] = true;
        }
        if ($normalized !== [] && ! $thumbnailSeen) {
            $normalized[0]['is_thumbnail'] = true;
        }

        return $normalized;
    }

    /** @param  array<int, string>  $paths */
    private function deleteFiles(array $paths): void
    {
        $paths = array_values(array_filter($paths, static fn (string $path): bool => str_starts_with($path, 'uploads/')));
        if ($paths !== []) {
            Storage::disk('public')->delete($paths);
        }
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, ?Faskes $faskes = null): array
    {
        $id = $faskes?->getKey();
        $data = $request->validate([
            'kdppk' => ['sometimes', 'nullable', 'string', 'max:32', 'unique:faskes,kdppk,'.$id.',id_faskes'],
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
            'bpjs_status' => ['sometimes', 'string', Rule::in(Faskes::BPJS_STATUSES)],
            'link_maps' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'id_spesialisasi' => ['sometimes', 'array'],
            'id_spesialisasi.*' => ['string', 'exists:spesialisasi,id_spesialisasi'],
            'id_fasilitas' => ['sometimes', 'array'],
            'id_fasilitas.*' => ['integer', 'exists:fasilitas,id_fasilitas'],
            'images' => ['sometimes', 'array', 'max:5'],
            'images.*.path' => ['required', 'string', 'max:255'],
            'images.*.url' => ['sometimes', 'string', 'max:2048'],
            'images.*.is_banner' => ['sometimes', 'boolean'],
            'images.*.is_thumbnail' => ['sometimes', 'boolean'],
            'images.*.sort_order' => ['sometimes', 'integer', 'between:0,4'],
        ]);

        $linkInputs = ['nama_faskes', 'alamat_faskes', 'kota_kabupaten', 'latitude', 'longitude'];
        if (! array_key_exists('link_maps', $data) && array_intersect_key($data, array_flip($linkInputs)) !== []) {
            $data['link_maps'] = Faskes::mapsLink(array_merge(
                $faskes?->only($linkInputs) ?? [],
                $data,
            ));
        }

        return $data;
    }
}
