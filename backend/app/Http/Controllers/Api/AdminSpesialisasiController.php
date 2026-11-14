<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Spesialisasi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSpesialisasiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Spesialisasi::query()
            ->withCount('faskes')
            ->when($request->filled('search'), function ($builder) use ($request): void {
                $term = '%'.$request->string('search').'%';
                $builder->where(fn ($inner) => $inner->where('nama_spesialisasi', 'like', $term)->orWhere('id_spesialisasi', 'like', $term));
            })
            ->orderBy('nama_spesialisasi');

        $page = $query->paginate(min($request->integer('per_page', 25), 100));

        return response()->json([
            'data' => $page->getCollection()->map(fn (Spesialisasi $item): array => [
                'id_spesialisasi' => $item->id_spesialisasi,
                'nama_spesialisasi' => $item->nama_spesialisasi,
                'faskes_count' => $item->faskes_count,
            ]),
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id_spesialisasi' => ['required', 'string', 'max:10', 'unique:spesialisasi,id_spesialisasi'],
            'nama_spesialisasi' => ['required', 'string', 'max:255'],
        ]);

        $spesialisasi = Spesialisasi::query()->create($data);

        return response()->json([
            'data' => [
                'id_spesialisasi' => $spesialisasi->id_spesialisasi,
                'nama_spesialisasi' => $spesialisasi->nama_spesialisasi,
                'faskes_count' => 0,
            ],
        ], 201);
    }

    public function update(Request $request, string $spesialisasi): JsonResponse
    {
        $model = Spesialisasi::query()->findOrFail($spesialisasi);
        $data = $request->validate([
            'nama_spesialisasi' => ['required', 'string', 'max:255'],
        ]);
        $model->update($data);

        return response()->json([
            'data' => [
                'id_spesialisasi' => $model->id_spesialisasi,
                'nama_spesialisasi' => $model->nama_spesialisasi,
                'faskes_count' => $model->faskes()->count(),
            ],
        ]);
    }

    public function destroy(Request $request, string $spesialisasi): JsonResponse
    {
        $model = Spesialisasi::query()->findOrFail($spesialisasi);
        $usage = $model->faskes()->count();

        if ($usage > 0 && ! $request->boolean('force')) {
            return response()->json([
                'message' => 'Spesialisasi masih dipakai oleh '.$usage.' faskes. Kirim force=1 untuk menghapus beserta relasinya.',
                'faskes_count' => $usage,
            ], 409);
        }

        $model->delete();

        return response()->json(['message' => 'Spesialisasi deleted.']);
    }
}
