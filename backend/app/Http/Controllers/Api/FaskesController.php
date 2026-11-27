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
        // `fasilitas` menyumbang ~70% payload daftar padahal klien hanya
        // memakainya untuk menyimpulkan boolean IGD. Kirim boolean itu saja.
        $query = Faskes::query()
            ->withRating()
            ->with(['spesialisasi', 'images'])
            ->withExists(['fasilitas as has_igd' => fn ($sub) => $sub->whereRaw('lower(nama_fasilitas) like ?', ['%igd%'])]);
        $query->when($request->filled('search'), fn ($q) => $q->where('nama_faskes', 'like', '%'.$request->string('search').'%'));
        $query->when($request->filled('provinsi'), fn ($q) => $q->where('provinsi', $request->string('provinsi')));
        $query->when($request->filled('kecamatan'), fn ($q) => $q->whereRaw('lower(kecamatan) = ?', [mb_strtolower(trim($request->string('kecamatan')->toString()))]));
        $query->when($request->filled('kota_kabupaten'), fn ($q) => $q->where('kota_kabupaten', $request->string('kota_kabupaten')));
        $query->when($request->filled('jenis_faskes'), fn ($q) => $q->where('jenis_faskes', 'like', '%'.$request->string('jenis_faskes').'%'));
        $bpjsStatuses = $this->requestedBpjsStatuses($request);
        $query->when($bpjsStatuses !== [], fn ($q) => $q->whereIn('bpjs_status', $bpjsStatuses));
        $query->when($request->filled('id_spesialisasi'), fn ($q) => $q->whereHas('spesialisasi', fn ($r) => $r->whereKey($request->string('id_spesialisasi'))));

        $facilityIds = $this->requestedFacilityIds($request);
        $query->when($facilityIds !== [], fn ($q) => $q->whereHas('fasilitas', fn ($r) => $r->whereIn('fasilitas.id_fasilitas', $facilityIds)));

        if ($request->has(['latitude', 'longitude'])) {
            $lat = $coordinates[0];
            $lng = $coordinates[1];
            $query->orderByRaw('((latitude - ?) * (latitude - ?) + (longitude - ?) * (longitude - ?))', [$lat, $lat, $lng, $lng]);
        } else {
            $query = $this->applyTypeOrdering($query);
        }

        $faskes = $query->paginate(min($request->integer('per_page', 15), 100));
        $this->attachDistance($faskes->getCollection(), $coordinates, dropLinkMaps: true);

        return FaskesResource::collection($faskes);
    }

    public function show(Request $request, Faskes $faskes): FaskesResource
    {
        $faskes->load(['spesialisasi', 'fasilitas', 'images'])->loadAvg(['komentar as rating_avg' => fn ($sub) => $sub->whereNull('id_parent')->whereNotNull('rating')], 'rating')->loadCount(['komentar as rating_count' => fn ($sub) => $sub->whereNull('id_parent')->whereNotNull('rating')]);
        $this->attachDistance(collect([$faskes]), $this->requestCoordinates($request));

        return new FaskesResource($faskes);
    }

    /**
     * Data dropdown peta/pemilih faskes.
     *
     * Satu-satunya konsumen (`/diskusi/buat`) hanya membaca id, nama, jenis,
     * kecamatan, kota, dan rating. `link_maps` (36,7% payload) dan
     * `alamat_faskes` (7,7%) tidak pernah dipakai, jadi tidak dikirim.
     * `kecamatan` dan `kota_kabupaten` justru sebelumnya tidak ikut padahal
     * dipakai untuk pencarian di dropdown.
     */
    public function map(Request $request): JsonResponse
    {
        $faskes = Faskes::query()
            ->select(['id_faskes', 'nama_faskes', 'jenis_faskes', 'kecamatan', 'kota_kabupaten', 'latitude', 'longitude'])
            ->withRating()
            ->orderBy('nama_faskes')
            ->get();
        $this->attachDistance($faskes, $this->requestCoordinates($request));

        return response()->json(['data' => $this->mapPayload($faskes)]);
    }

    /**
     * @param  iterable<int, Faskes>  $faskes
     * @return list<array<string, mixed>>
     */
    private function mapPayload(iterable $faskes): array
    {
        $rows = [];
        foreach ($faskes as $item) {
            $rows[] = [
                'id_faskes' => $item->id_faskes,
                'nama_faskes' => $item->nama_faskes,
                'jenis_faskes' => $item->jenis_faskes,
                'kecamatan' => $item->kecamatan,
                'kota_kabupaten' => $item->kota_kabupaten,
                'latitude' => $item->latitude,
                'longitude' => $item->longitude,
                'rating_avg' => $item->rating_count === null ? null : round((float) ($item->rating_avg ?? 0), 2),
                'rating_count' => $item->rating_count === null ? null : (int) $item->rating_count,
                'distance_km' => $item->distance_km ?? null,
            ];
        }

        return $rows;
    }

    public function nearby(Request $request): JsonResponse
    {
        $data = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'radius' => ['sometimes', 'numeric', 'min:0.1', 'max:100'],
            'compact' => ['sometimes', 'boolean'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:500'],
        ]);
        $radius = (float) ($data['radius'] ?? 10);
        $latitude = (float) $data['latitude'];
        $longitude = (float) $data['longitude'];
        $compact = $request->boolean('compact');
        $latitudeDelta = $radius / 111;
        $longitudeDelta = $radius / max(cos(deg2rad($latitude)) * 111, 0.01);

        $query = Faskes::query()
            ->whereBetween('latitude', [$latitude - $latitudeDelta, $latitude + $latitudeDelta])
            ->whereBetween('longitude', [$longitude - $longitudeDelta, $longitude + $longitudeDelta]);

        if ($compact) {
            // Beranda memakai `compact` dan merender kartu berating, jadi
            // rating harus ikut. Biayanya nol: `withAvg`/`withCount` menjadi
            // subquery di query utama, bukan query tambahan.
            $query->withRating()
                ->with('spesialisasi')
                ->withExists(['fasilitas as has_igd' => fn ($sub) => $sub->whereRaw('lower(nama_fasilitas) like ?', ['%igd%'])]);
        } else {
            $query->withRating()->with(['spesialisasi', 'fasilitas', 'images']);
        }

        $faskes = $query
            ->get()
            ->each(function (Faskes $item) use ($latitude, $longitude): void {
                $item->distance_km = $item->distanceKmTo($latitude, $longitude);
                $item->setAttribute('tanpa_link_maps', true);
            })
            ->filter(fn (Faskes $item): bool => $item->distance_km <= $radius)
            ->sortBy('distance_km')
            ->values();

        if ($request->filled('limit')) {
            $faskes = $faskes->take($request->integer('limit'))->values();
        }

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

    /**
     * Hitung jarak dan — untuk endpoint daftar/peta — tandai agar
     * `link_maps` tidak ikut diserialisasi. Field itu ~19% payload dan
     * hanya dipakai tombol rute di halaman detail.
     *
     * @param  iterable<int, Faskes>  $faskes
     */
    private function attachDistance(iterable $faskes, array $coordinates, bool $dropLinkMaps = false): void
    {
        foreach ($faskes as $item) {
            $item->distance_km = $item->distanceKmTo($coordinates[0], $coordinates[1]);
            if ($dropLinkMaps) {
                $item->setAttribute('tanpa_link_maps', true);
            }
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

    /**
     * Terima satu nilai, daftar berkoma, atau parameter berulang.
     *
     * @return list<string>
     */
    private function requestedBpjsStatuses(Request $request): array
    {
        $raw = $request->input('bpjs_status');
        if ($raw === null || $raw === '') {
            return [];
        }

        return collect((array) $raw)
            ->flatMap(static fn ($value): array => explode(',', (string) $value))
            ->map(static fn (string $value): string => strtolower(trim($value)))
            ->filter(static fn (string $value): bool => in_array($value, Faskes::BPJS_STATUSES, true))
            ->unique()
            ->values()
            ->all();
    }
}
