<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DiskusiResource;
use App\Http\Resources\TanggapanDiskusiResource;
use App\Models\Diskusi;
use App\Models\DiskusiDilihat;
use App\Models\DiskusiSuka;
use App\Models\TanggapanDiskusi;
use App\Models\TanggapanDiskusiSuka;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForumController extends Controller
{
    private const LIST_RELATIONS = ['user', 'faskes'];

    public function index(): mixed
    {
        return DiskusiResource::collection(
            Diskusi::query()
                ->with(self::LIST_RELATIONS)
                ->withCount(['suka', 'dilihat', 'tanggapan'])
                ->latest()
                ->paginate(15),
        );
    }

    public function show(Request $request, Diskusi $diskusi): DiskusiResource
    {
        $this->recordView($request, $diskusi);
        $diskusi->load([
            'user',
            'faskes',
            'tanggapan' => fn ($query) => $query->whereNull('id_parent')->withCount('suka'),
            'tanggapan.user',
            'tanggapan.replies' => fn ($query) => $query->withCount('suka'),
            'tanggapan.replies.user',
        ])->loadCount(['suka', 'dilihat', 'tanggapan']);

        return new DiskusiResource($diskusi);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'judul_diskusi' => ['required', 'string', 'max:255'],
            'kategori_diskusi' => ['sometimes', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'image_path' => ['sometimes', 'nullable', 'array'],
            'id_faskes' => ['sometimes', 'nullable', 'integer', 'exists:faskes,id_faskes'],
        ]);
        $diskusi = Diskusi::query()->create([...$data, 'id_user' => $request->user()->id_user]);

        return response()->json(['data' => new DiskusiResource($diskusi->load(['user', 'faskes'])->loadCount(['suka', 'dilihat', 'tanggapan']))], 201);
    }

    public function destroy(Request $request, Diskusi $diskusi): JsonResponse
    {
        abort_unless($diskusi->id_user === $request->user()->id_user || $request->user()->role_user === 'admin', 403);
        $diskusi->delete();

        return response()->json(['message' => 'Discussion deleted.']);
    }

    public function storeReply(Request $request, Diskusi $diskusi): JsonResponse
    {
        $data = $request->validate(['body' => ['required', 'string'], 'image_path' => ['sometimes', 'nullable', 'array']]);
        $reply = $diskusi->tanggapan()->create([...$data, 'id_user' => $request->user()->id_user]);

        return response()->json(['data' => new TanggapanDiskusiResource($reply->load('user')->loadCount('suka'))], 201);
    }

    public function replyToReply(Request $request, TanggapanDiskusi $tanggapan): JsonResponse
    {
        $data = $request->validate(['body' => ['required', 'string'], 'image_path' => ['sometimes', 'nullable', 'array']]);
        $reply = $tanggapan->diskusi()->firstOrFail()->tanggapan()->create([
            ...$data,
            'id_user' => $request->user()->id_user,
            'id_parent' => $tanggapan->id_tanggapan_diskusi,
        ]);

        return response()->json(['data' => new TanggapanDiskusiResource($reply->load('user')->loadCount('suka'))], 201);
    }

    public function updateReply(Request $request, TanggapanDiskusi $tanggapan): TanggapanDiskusiResource
    {
        abort_unless($tanggapan->id_user === $request->user()->id_user || $request->user()->role_user === 'admin', 403);
        $data = $request->validate(['body' => ['required', 'string'], 'image_path' => ['sometimes', 'nullable', 'array']]);
        $tanggapan->update($data);

        return new TanggapanDiskusiResource($tanggapan->fresh()->load('user')->loadCount('suka'));
    }

    public function destroyReply(Request $request, TanggapanDiskusi $tanggapan): JsonResponse
    {
        abort_unless($tanggapan->id_user === $request->user()->id_user || $request->user()->role_user === 'admin', 403);
        $tanggapan->delete();

        return response()->json(['message' => 'Reply deleted.']);
    }

    public function mine(Request $request): mixed
    {
        return DiskusiResource::collection(
            Diskusi::query()
                ->with(self::LIST_RELATIONS)
                ->withCount(['suka', 'dilihat', 'tanggapan'])
                ->where('id_user', $request->user()->id_user)
                ->latest()
                ->paginate(15),
        );
    }

    public function like(Request $request, Diskusi $diskusi): JsonResponse
    {
        DiskusiSuka::query()->firstOrCreate([
            'id_diskusi' => $diskusi->id_diskusi,
            'id_user' => $request->user()->id_user,
        ]);

        return response()->json([
            'data' => [
                'id_diskusi' => $diskusi->id_diskusi,
                'disukai' => true,
                'jumlah_suka' => $diskusi->suka()->count(),
            ],
        ]);
    }

    public function unlike(Request $request, Diskusi $diskusi): JsonResponse
    {
        DiskusiSuka::query()
            ->where('id_diskusi', $diskusi->id_diskusi)
            ->where('id_user', $request->user()->id_user)
            ->delete();

        return response()->json([
            'data' => [
                'id_diskusi' => $diskusi->id_diskusi,
                'disukai' => false,
                'jumlah_suka' => $diskusi->suka()->count(),
            ],
        ]);
    }

    public function likeReply(Request $request, TanggapanDiskusi $tanggapan): JsonResponse
    {
        TanggapanDiskusiSuka::query()->firstOrCreate([
            'id_tanggapan' => $tanggapan->id_tanggapan_diskusi,
            'id_user' => $request->user()->id_user,
        ]);

        return response()->json([
            'data' => [
                'id_tanggapan_diskusi' => $tanggapan->id_tanggapan_diskusi,
                'disukai' => true,
                'jumlah_suka' => $tanggapan->suka()->count(),
            ],
        ]);
    }

    public function unlikeReply(Request $request, TanggapanDiskusi $tanggapan): JsonResponse
    {
        TanggapanDiskusiSuka::query()
            ->where('id_tanggapan', $tanggapan->id_tanggapan_diskusi)
            ->where('id_user', $request->user()->id_user)
            ->delete();

        return response()->json([
            'data' => [
                'id_tanggapan_diskusi' => $tanggapan->id_tanggapan_diskusi,
                'disukai' => false,
                'jumlah_suka' => $tanggapan->suka()->count(),
            ],
        ]);
    }

    public function view(Request $request, Diskusi $diskusi): JsonResponse
    {
        $this->recordView($request, $diskusi);

        return response()->json([
            'data' => [
                'id_diskusi' => $diskusi->id_diskusi,
                'jumlah_dilihat' => $diskusi->dilihat()->count(),
            ],
        ]);
    }

    private function recordView(Request $request, Diskusi $diskusi): void
    {
        $idUser = $request->user()?->id_user;
        if ($idUser === null || $idUser === $diskusi->id_user) {
            return;
        }

        DiskusiDilihat::query()->firstOrCreate([
            'id_diskusi' => $diskusi->id_diskusi,
            'id_user' => $idUser,
        ]);
    }
}
