<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Fasilitas;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminFasilitasController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Fasilitas::query()
            ->withCount('faskes')
            ->when($request->filled('search'), function ($builder) use ($request): void {
                $term = '%'.$request->string('search').'%';
                $builder->where(fn ($inner) => $inner->where('nama_fasilitas', 'like', $term)->orWhere('id_fasilitas', 'like', $term));
            })
            ->orderBy('nama_fasilitas');

        $page = $query->paginate(min($request->integer('per_page', 25), 100));

        return response()->json([
            'data' => $page->getCollection()->map(fn (Fasilitas $item): array => [
                'id_fasilitas' => $item->id_fasilitas,
                'nama_fasilitas' => $item->nama_fasilitas,
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
            'id_fasilitas' => ['sometimes', 'integer', 'min:1', 'unique:fasilitas,id_fasilitas'],
            'nama_fasilitas' => ['required', 'string', 'max:255'],
        ]);
        $data['id_fasilitas'] ??= (int) Fasilitas::query()->max('id_fasilitas') + 1;

        $fasilitas = Fasilitas::query()->create($data);

        return response()->json([
            'data' => [
                'id_fasilitas' => $fasilitas->id_fasilitas,
                'nama_fasilitas' => $fasilitas->nama_fasilitas,
                'faskes_count' => 0,
            ],
        ], 201);
    }

    public function update(Request $request, int $fasilitas): JsonResponse
    {
        $model = Fasilitas::query()->findOrFail($fasilitas);
        $data = $request->validate([
            'nama_fasilitas' => ['required', 'string', 'max:255'],
        ]);
        $model->update($data);

        return response()->json([
            'data' => [
                'id_fasilitas' => $model->id_fasilitas,
                'nama_fasilitas' => $model->nama_fasilitas,
                'faskes_count' => $model->faskes()->count(),
            ],
        ]);
    }

    public function destroy(Request $request, int $fasilitas): JsonResponse
    {
        $model = Fasilitas::query()->findOrFail($fasilitas);
        $usage = $model->faskes()->count();

        if ($usage > 0 && ! $request->boolean('force')) {
            return response()->json([
                'message' => 'Fasilitas masih dipakai oleh '.$usage.' faskes. Kirim force=1 untuk menghapus beserta relasinya.',
                'faskes_count' => $usage,
            ], 409);
        }

        $model->delete();

        return response()->json(['message' => 'Fasilitas deleted.']);
    }
}
