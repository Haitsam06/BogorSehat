<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\KomentarResource;
use App\Models\Faskes;
use App\Models\Komentar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KomentarController extends Controller
{
    public function index(Faskes $faskes): mixed
    {
        return KomentarResource::collection(
            $faskes->komentar()->whereNull('id_parent')->with(['user', 'replies.user', 'replies.replies.user'])->latest()->paginate(15),
        );
    }

    public function store(Request $request, Faskes $faskes): JsonResponse
    {
        $data = $request->validate([
            'body' => ['required', 'string'],
            'rating' => ['sometimes', 'nullable', 'integer', 'between:1,5'],
            'image_path' => ['sometimes', 'nullable', 'array'],
        ]);
        $comment = $faskes->komentar()->create([...$data, 'id_user' => $request->user()->id_user]);

        return response()->json(['data' => new KomentarResource($comment->load('user'))], 201);
    }

    public function reply(Request $request, Komentar $komentar): JsonResponse
    {
        $data = $request->validate(['body' => ['required', 'string'], 'image_path' => ['sometimes', 'nullable', 'array']]);
        $reply = $komentar->faskes()->firstOrFail()->komentar()->create([
            ...$data,
            'id_user' => $request->user()->id_user,
            'id_parent' => $komentar->id_komentar,
        ]);

        return response()->json(['data' => new KomentarResource($reply->load('user'))], 201);
    }

    public function destroy(Request $request, Komentar $komentar): JsonResponse
    {
        abort_unless($komentar->id_user === $request->user()->id_user || $request->user()->role_user === 'admin', 403);
        $komentar->delete();

        return response()->json(['message' => 'Comment deleted.']);
    }

    public function mine(Request $request): mixed
    {
        return KomentarResource::collection(
            $request->user()->komentar()->with(['faskes', 'replies.user'])->latest()->paginate(15),
        );
    }
}
