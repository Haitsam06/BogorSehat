<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FaskesResource;
use App\Models\Faskes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaskesController extends Controller
{
    public function index(Request $request)
    {
        $query = Faskes::query()->with(['spesialisasi', 'fasilitas']);
        $query->when($request->filled('search'), fn ($q) => $q->where('nama_faskes', 'like', '%'.$request->string('search').'%'));
        $query->when($request->filled('provinsi'), fn ($q) => $q->where('provinsi', $request->string('provinsi')));
        $query->when($request->filled('kecamatan'), fn ($q) => $q->where('kecamatan', 'like', '%'.$request->string('kecamatan').'%'));
        $query->when($request->filled('kota_kabupaten'), fn ($q) => $q->where('kota_kabupaten', $request->string('kota_kabupaten')));
        $query->when($request->filled('jenis_faskes'), fn ($q) => $q->where('jenis_faskes', $request->string('jenis_faskes')));
        $query->when($request->has('is_support_bpjs'), fn ($q) => $q->where('is_support_bpjs', $request->boolean('is_support_bpjs')));
        $query->when($request->filled('id_spesialisasi'), fn ($q) => $q->whereHas('spesialisasi', fn ($r) => $r->whereKey($request->string('id_spesialisasi'))));
        $query->when($request->filled('id_fasilitas'), fn ($q) => $q->whereHas('fasilitas', fn ($r) => $r->whereKey($request->integer('id_fasilitas'))));

        return FaskesResource::collection($query->orderBy('nama_faskes')->paginate(min($request->integer('per_page', 15), 100)));
    }

    public function show(Faskes $faskes): FaskesResource
    {
        return new FaskesResource($faskes->load(['spesialisasi', 'fasilitas']));
    }

    public function map(): JsonResponse
    {
        $data = Faskes::query()->select(['id_faskes', 'nama_faskes', 'jenis_faskes', 'alamat_faskes', 'latitude', 'longitude', 'link_maps'])->orderBy('nama_faskes')->get();

        return response()->json(['data' => $data]);
    }

    public function nearby(Request $request): JsonResponse
    {
        $data = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'radius' => ['sometimes', 'numeric', 'min:0.1', 'max:100'],
        ]);
        $radius = (float) ($data['radius'] ?? 10);
        $latitude = (float) $data['latitude'];
        $longitude = (float) $data['longitude'];
        $latDelta = $radius / 111;
        $lonDelta = $radius / max(cos(deg2rad($latitude)) * 111, 0.01);
        $faskes = Faskes::query()
            ->with(['spesialisasi', 'fasilitas'])
            ->whereBetween('latitude', [$latitude - $latDelta, $latitude + $latDelta])
            ->whereBetween('longitude', [$longitude - $lonDelta, $longitude + $lonDelta])
            ->get()
            ->map(function (Faskes $faskes) use ($latitude, $longitude): Faskes {
                $distance = 6371 * 2 * asin(sqrt(
                    sin(deg2rad((float) $faskes->latitude - $latitude) / 2) ** 2
                    + cos(deg2rad($latitude)) * cos(deg2rad((float) $faskes->latitude))
                    * sin(deg2rad((float) $faskes->longitude - $longitude) / 2) ** 2
                ));
                $faskes->distance_km = round($distance, 2);

                return $faskes;
            })
            ->filter(fn (Faskes $faskes): bool => $faskes->distance_km <= $radius)
            ->sortBy('distance_km')
            ->values();

        return response()->json(['data' => FaskesResource::collection($faskes)]);
    }
}
