<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    private function getAllowedOrigins(): array
    {
        $origins = config('cors.allowed_origins', []);
        if (empty($origins)) {
            $origins = [env('CORS_ALLOWED_ORIGIN', 'http://localhost:5173')];
        }
        return $origins;
    }

    private function isOriginAllowed(string $origin): bool
    {
        $allowed = $this->getAllowedOrigins();
        return in_array($origin, $allowed, true);
    }

    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->headers->get('Origin', '');
        $allowedOrigins = $this->getAllowedOrigins();
        $effectiveOrigin = in_array($origin, $allowedOrigins, true) ? $origin : ($allowedOrigins[0] ?? '*');

        $headers = [
            'Access-Control-Allow-Origin' => $effectiveOrigin,
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-TOKEN',
            'Access-Control-Max-Age' => '86400',
        ];

        if ($request->isMethod('OPTIONS')) {
            return response('', 200)->withHeaders($headers);
        }

        $response = $next($request);

        foreach ($headers as $key => $value) {
            $response->headers->set($key, $value);
        }

        return $response;
    }
}
