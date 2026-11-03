<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FasilitasResource;
use App\Http\Resources\SpesialisasiResource;
use App\Models\Fasilitas;
use App\Models\Spesialisasi;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MasterDataController extends Controller
{
    public function spesialisasi(): AnonymousResourceCollection
    {
        return SpesialisasiResource::collection(Spesialisasi::query()->orderBy('nama_spesialisasi')->paginate(50));
    }

    public function fasilitas(): AnonymousResourceCollection
    {
        return FasilitasResource::collection(Fasilitas::query()->orderBy('nama_fasilitas')->paginate(50));
    }
}
