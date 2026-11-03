<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function update(Request $request): UserResource
    {
        $data = $request->validate([
            'nama_user' => ['sometimes', 'string', 'max:255'],
            'email_user' => ['sometimes', 'email', 'max:255', 'unique:users,email_user,'.$request->user()->id_user.',id_user'],
            'password_user' => ['sometimes', 'string', 'min:8', 'confirmed'],
            'foto_profil' => ['sometimes', 'nullable', 'string', 'max:2048'],
        ]);
        if (isset($data['password_user'])) {
            $data['password_user'] = Hash::make($data['password_user']);
        }
        $request->user()->update($data);

        return new UserResource($request->user()->fresh());
    }

    public function current(Request $request): JsonResponse
    {
        return response()->json(['data' => new UserResource($request->user())]);
    }
}
