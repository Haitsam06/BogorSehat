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
        $user = $request->user();
        $data = $request->validate([
            'nama_user' => ['sometimes', 'string', 'max:255'],
            'email_user' => ['sometimes', 'email', 'max:255', 'unique:users,email_user,'.$user->id_user.',id_user'],
            'nomor_telepon' => ['sometimes', 'nullable', 'string', 'max:30'],
            'jenis_kelamin' => ['sometimes', 'nullable', 'string', 'in:Laki-laki,Perempuan'],
            'tanggal_lahir' => ['sometimes', 'nullable', 'date'],
            'foto_profil' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'current_password' => ['sometimes', 'nullable', 'string'],
            'password_user' => ['sometimes', 'nullable', 'string', 'min:8', 'confirmed'],
        ]);

        if (!empty($data['password_user'])) {
            if (empty($data['current_password']) || !Hash::check($data['current_password'], $user->getAuthPassword())) {
                abort(422, 'Kata sandi saat ini tidak cocok.');
            }
            $data['password_user'] = Hash::make($data['password_user']);
        } else {
            unset($data['password_user']);
        }
        unset($data['current_password']);

        $user->update($data);

        return new UserResource($user->fresh());
    }

    public function current(Request $request): JsonResponse
    {
        return response()->json(['data' => new UserResource($request->user())]);
    }
}
