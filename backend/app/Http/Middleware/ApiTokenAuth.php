<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $plainToken = $request->bearerToken();
        $token = $plainToken === null
            ? null
            : ApiToken::query()->with('user')->where('token_hash', hash('sha256', $plainToken))->first();

        if ($token === null || ($token->expires_at !== null && $token->expires_at->isPast())) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $request->setUserResolver(fn () => $token->user);
        Auth::setUser($token->user);

        return $next($request);
    }
}
