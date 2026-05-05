<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if ($user && ($user->role === 'admin' || $user->hasRole('admin'))) {
            return $next($request);
        }

        return response()->json(['message' => 'Không có quyền truy cập'], 403);
    }
}
