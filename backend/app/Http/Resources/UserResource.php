<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_user' => $this->id_user,
            'nama_user' => $this->nama_user,
            'email_user' => $this->email_user,
            'role_user' => $this->role_user,
            'foto_profil' => $this->foto_profil,
            'created_at' => $this->created_at,
        ];
    }
}
