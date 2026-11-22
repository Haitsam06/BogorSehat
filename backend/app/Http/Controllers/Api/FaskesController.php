<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FaskesResource;
use App\Models\Faskes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaskesController extends Controller
{
    private const DEFAULT_ORIGIN_LATITUDE = -6.5950;

    private const DEFAULT_ORIGIN_LONGITUDE = 106.7990;

    public function index(Request $request)
    {
        $coordinates = $this->requestCoordinates($request);
        $query = Faskes::query()->withRating()->with(['spesialisasi', 'fasilitas', 'images']);
        $query->when($request->filled('search'), fn ($q) => $q->where('nama_faskes', 'like', '%'.$request->string('search').'%'));
        $query->when($request->filled('provinsi'), fn ($q) => $q->where('provinsi', $request->string('provinsi')));
        $query->when($request->filled('kecamatan'), fn ($q) => $q->whereRaw('lower(kecamatan) = ?', [mb_strtolower(trim($request->string('kecamatan')->toString()))]));
        $query->when($request->filled('kota_kabupaten'), fn ($q) => $q->where('kota_kabupaten', $request->string('kota_kabupaten')));
        $query->when($request->filled('jenis_faskes'), fn ($q) => $q->where('jenis_faskes', $request->string('jenis_faskes')));
        $query->when($request->has('is_support_bpjs'), fn ($q) => $q->where('is_support_bpjs', $request->boolean('is_support_bpjs')));
        $query->when($request->filled('id_spesialisasi'), fn ($q) => $q->whereHas('spesialisasi', fn ($r) => $r->whereKey($request->string('id_spesialisasi'))));

        $facilityIds = $this->requestedFacilityIds($request);
        $query->when($facilityIds !== [], fn ($q) => $q->whereHas('fasilitas', fn ($r) => $r->whereIn('fasilitas.id_fasilitas', $facilityIds)));

        $faskes = $this->applyTypeOrdering($query)->paginate(min($request->integer('per_page', 15), 100));
        $this->attachDistance($faskes->getCollection(), $coordinates);

        return FaskesResource::collection($faskes);
    }

    public function show(Request $request, Faskes $faskes): FaskesResource
    {
        $faskes->load(['spesialisasi', 'fasilitas', 'images'])->loadAvg(['komentar as rating_avg' => fn ($sub) => $sub->whereNull('id_parent')->whereNotNull('rating')], 'rating')->loadCount(['komentar as rating_count' => fn ($sub) => $sub->whereNull('id_parent')->whereNotNull('rating')]);
        $this->attachDistance(collect([$faskes]), $this->requestCoordinates($request));

        return new FaskesResource($faskes);
    }

    public function map(Request $request): JsonResponse
    {
        $faskes = Faskes::query()
            ->select(['id_faskes', 'nama_faskes', 'jenis_faskes', 'alamat_faskes', 'latitude', 'longitude', 'link_maps'])
            ->withRating()
            ->orderBy('nama_faskes')
            ->get();
        $this->attachDistance($faskes, $this->requestCoordinates($request));

        return response()->json(['data' => $faskes]);
    }

    public function nearby(Request $request): JsonResponse
    {
        $data = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'radius' => ['sometimes', 'numeric', 'min:0.1', 'max:100'],
            'compact' => ['sometimes', 'boolean'],
        ]);
        $radius = (float) ($data['radius'] ?? 10);
        $latitude = (float) $data['latitude'];
        $longitude = (float) $data['longitude'];
        $compact = $request->boolean('compact');
        $latitudeDelta = $radius / 111;
        $longitudeDelta = $radius / max(cos(deg2rad($latitude)) * 111, 0.01);

        $query = Faskes::query()->whereBetween('latitude', [$latitude - $latitudeDelta, $latitude + $latitudeDelta])
            ->whereBetween('longitude', [$longitude - $longitudeDelta, $longitude + $longitudeDelta]);

        if ($compact) {
            $query->with('spesialisasi')
                ->withExists(['fasilitas as has_igd' => fn ($sub) => $sub->whereRaw('lower(nama_fasilitas) like ?', ['%igd%'])]);
        } else {
            $query->withRating()->with(['spesialisasi', 'fasilitas', 'images']);
        }

        $faskes = $query
            ->get()
            ->each(fn (Faskes $item) => $item->distance_km = $item->distanceKmTo($latitude, $longitude))
            ->filter(fn (Faskes $item): bool => $item->distance_km <= $radius)
            ->sortBy('distance_km')
            ->values();

        return response()->json(['data' => FaskesResource::collection($faskes)]);
    }

    /** @return array{0: float, 1: float} */
    private function requestCoordinates(Request $request): array
    {
        $data = $request->validate([
            'latitude' => ['sometimes', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'numeric', 'between:-180,180'],
        ]);

        return [
            (float) ($data['latitude'] ?? self::DEFAULT_ORIGIN_LATITUDE),
            (float) ($data['longitude'] ?? self::DEFAULT_ORIGIN_LONGITUDE),
        ];
    }

    /** @param  iterable<int, Faskes>  $faskes */
    private function attachDistance(iterable $faskes, array $coordinates): void
    {
        foreach ($faskes as $item) {
            $item->distance_km = $item->distanceKmTo($coordinates[0], $coordinates[1]);
        }
    }

    /**
     * Rank facilities by service type, then alphabetically.
     */
    private function applyTypeOrdering($query)
    {
        $type = "lower(coalesce(jenis_faskes, ''))";

        return $query->orderByRaw(
            "case
                when {$type} like '%rumah sakit%' then 1
                when {$type} like '%klinik%' then 2
                when {$type} like '%puskesmas%' then 3
                when {$type} like '%dokter gigi%' then 5
                when {$type} like '%dokter%' then 4
                when {$type} like '%apotek%' then 6
                when {$type} like '%optik%' then 7
                else 8
            end"
        )->orderBy('nama_faskes');
    }

    /** @return list<int> */
    private function requestedFacilityIds(Request $request): array
    {
        $raw = $request->input('id_fasilitas');
        if ($raw === null || $raw === '') {
            return [];
        }

        return collect((array) $raw)
            ->flatMap(static fn ($value): array => explode(',', (string) $value))
            ->map(static fn (string $value): int => (int) trim($value))
            ->filter(static fn (int $value): bool => $value > 0)
            ->unique()
            ->values()
            ->all();
    }
}
