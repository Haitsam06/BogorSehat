<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FasilitasResource;
use App\Http\Resources\SpesialisasiResource;
use App\Models\Fasilitas;
use App\Models\Spesialisasi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

class MasterDataController extends Controller
{
    public function spesialisasi(Request $request): JsonResponse|AnonymousResourceCollection
    {
        if ($request->boolean('all')) {
            $items = Cache::remember('master_spesialisasi_all_array', 3600, fn () => Spesialisasi::query()
                ->orderBy('nama_spesialisasi')
                ->get(['id_spesialisasi', 'nama_spesialisasi'])
                ->toArray());

            return response()->json(['data' => $items]);
        }

        $perPage = min($request->integer('per_page', 50), 1000);

        return SpesialisasiResource::collection(Spesialisasi::query()->orderBy('nama_spesialisasi')->paginate($perPage));
    }

    public function fasilitas(Request $request): JsonResponse|AnonymousResourceCollection
    {
        if ($request->boolean('all')) {
            $items = Cache::remember('master_fasilitas_all_array', 3600, fn () => Fasilitas::query()
                ->orderBy('nama_fasilitas')
                ->get(['id_fasilitas', 'nama_fasilitas'])
                ->toArray());

            return response()->json(['data' => $items]);
        }

        $perPage = min($request->integer('per_page', 50), 1000);

        return FasilitasResource::collection(Fasilitas::query()->orderBy('nama_fasilitas')->paginate($perPage));
    }
}
