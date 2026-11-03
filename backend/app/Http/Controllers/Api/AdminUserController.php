<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    public function index(Request $request): mixed
    {
        $users = User::query()->when($request->filled('role_user'), fn ($q) => $q->where('role_user', $request->string('role_user')))->latest()->paginate(15);

        return UserResource::collection($users);
    }

    public function show(User $user): UserResource
    {
        return new UserResource($user);
    }

    public function update(Request $request, User $user): UserResource
    {
        $data = $request->validate([
            'nama_user' => ['sometimes', 'string', 'max:255'],
            'email_user' => ['sometimes', 'email', 'max:255', 'unique:users,email_user,'.$user->id_user.',id_user'],
            'password_user' => ['sometimes', 'string', 'min:8', 'confirmed'],
            'role_user' => ['sometimes', 'in:user,admin'],
            'foto_profil' => ['sometimes', 'nullable', 'string', 'max:2048'],
        ]);
        if (isset($data['password_user'])) {
            $data['password_user'] = Hash::make($data['password_user']);
        }
        $user->update($data);

        return new UserResource($user->fresh());
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        abort_if($request->user()->is($user), 422, 'Admin cannot delete the current account.');
        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }
}
