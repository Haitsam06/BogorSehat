<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\ApiToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nama_user' => ['required', 'string', 'max:255'],
            'email_user' => ['required', 'email', 'max:255', 'unique:users,email_user'],
            'password_user' => ['required', 'string', 'min:8', 'confirmed'],
        ]);
        $data['role_user'] = 'user';
        $user = User::query()->create($data);

        return response()->json(['data' => new UserResource($user)], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email_user' => ['required', 'email'],
            'password_user' => ['required', 'string'],
        ]);
        $user = User::query()->where('email_user', $data['email_user'])->first();

        if ($user === null || ! Hash::check($data['password_user'], $user->password_user)) {
            throw ValidationException::withMessages(['email_user' => ['Email atau password salah.']]);
        }

        $plainToken = Str::random(64);
        ApiToken::query()->create([
            'id_user' => $user->id_user,
            'token_hash' => hash('sha256', $plainToken),
            'expires_at' => now()->addDays(30),
        ]);

        return response()->json(['data' => new UserResource($user), 'token' => $plainToken]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken();
        ApiToken::query()->where('token_hash', hash('sha256', (string) $token))->delete();

        return response()->json(['message' => 'Logged out.']);
    }
}
