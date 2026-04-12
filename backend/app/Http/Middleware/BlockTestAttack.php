<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class BlockTestAttack
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Chặn nếu URL có chứa chuỗi "test_attack"
        if (str_contains($request->fullUrl(), 'test_attack')) {
            \App\Models\AttackLog::create([
                'ip_address' => $request->ip(),
                'url' => $request->fullUrl(),
                'user_agent' => $request->userAgent()
            ]);
            return response()->json(['message' => 'Truy cập bị chặn (URL chứa ký tự không hợp lệ).'], 403);
        }

        return $next($request);
    }
}
