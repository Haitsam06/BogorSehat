<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenAuthOptional
{
    public function handle(Request $request, Closure $next): Response
    {
        $plainToken = $request->bearerToken();
        if ($plainToken === null) {
            return $next($request);
        }

        $token = ApiToken::query()->with('user')->where('token_hash', hash('sha256', $plainToken))->first();
        if ($token !== null && ($token->expires_at === null || ! $token->expires_at->isPast())) {
            $request->setUserResolver(fn () => $token->user);
        }

        return $next($request);
    }
}
