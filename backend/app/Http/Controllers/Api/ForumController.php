<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DiskusiResource;
use App\Http\Resources\TanggapanDiskusiResource;
use App\Models\Diskusi;
use App\Models\TanggapanDiskusi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForumController extends Controller
{
    public function index(): mixed
    {
        return DiskusiResource::collection(Diskusi::query()->with('user')->latest()->paginate(15));
    }

    public function show(Diskusi $diskusi): DiskusiResource
    {
        return new DiskusiResource($diskusi->load(['user', 'tanggapan' => fn ($q) => $q->whereNull('id_parent'), 'tanggapan.user', 'tanggapan.replies.user']));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'judul_diskusi' => ['required', 'string', 'max:255'],
            'kategori_diskusi' => ['sometimes', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'image_path' => ['sometimes', 'nullable', 'array'],
        ]);
        $diskusi = Diskusi::query()->create([...$data, 'id_user' => $request->user()->id_user]);

        return response()->json(['data' => new DiskusiResource($diskusi->load('user'))], 201);
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

        return response()->json(['data' => new TanggapanDiskusiResource($reply->load('user'))], 201);
    }

    public function replyToReply(Request $request, TanggapanDiskusi $tanggapan): JsonResponse
    {
        $data = $request->validate(['body' => ['required', 'string'], 'image_path' => ['sometimes', 'nullable', 'array']]);
        $reply = $tanggapan->diskusi()->firstOrFail()->tanggapan()->create([
            ...$data,
            'id_user' => $request->user()->id_user,
            'id_parent' => $tanggapan->id_tanggapan_diskusi,
        ]);

        return response()->json(['data' => new TanggapanDiskusiResource($reply->load('user'))], 201);
    }

    public function updateReply(Request $request, TanggapanDiskusi $tanggapan): TanggapanDiskusiResource
    {
        abort_unless($tanggapan->id_user === $request->user()->id_user || $request->user()->role_user === 'admin', 403);
        $data = $request->validate(['body' => ['required', 'string'], 'image_path' => ['sometimes', 'nullable', 'array']]);
        $tanggapan->update($data);

        return new TanggapanDiskusiResource($tanggapan->fresh()->load('user'));
    }

    public function destroyReply(Request $request, TanggapanDiskusi $tanggapan): JsonResponse
    {
        abort_unless($tanggapan->id_user === $request->user()->id_user || $request->user()->role_user === 'admin', 403);
        $tanggapan->delete();

        return response()->json(['message' => 'Reply deleted.']);
    }

    public function mine(Request $request): mixed
    {
        return DiskusiResource::collection(Diskusi::query()->where('id_user', $request->user()->id_user)->latest()->paginate(15));
    }
}
