<?php

namespace App\Http\Middleware;

use App\Models\AttackLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MLSecurityMiddleware
{
    private string $mlApiUrl;

    public function __construct()
    {
        $this->mlApiUrl = config('security.ml_api_url', env('ML_API_URL', 'http://localhost:8000/api/v1/security/predict'));
    }

    private array $skipPaths = [
        '/css',
        '/js',
        '/images',
        '/fonts',
        '/favicon',
        '/storage',
        '/hot',
    ];

    private array $whitelistPaths = [
        '/api/login',
        '/api/register',
        '/api/admin/login',
        '/api/auth/google/callback',
        '/api/homepage',
        '/api/categories',
        '/api/products',
        '/api/gifts',
        '/api/sliders',
        '/api/testimonials',
        '/api/forgot-password',
    ];

    public function handle(Request $request, Closure $next)
    {
        // Skip preflight OPTIONS requests - let CORS handle them
        if ($request->isMethod('OPTIONS')) {
            return $next($request);
        }

        $fullPath = '/' . ltrim($request->path(), '/');
        $requestUri = $request->getRequestUri();
        $method = $request->method();

        foreach ($this->skipPaths as $skip) {
            if (str_starts_with($fullPath, $skip)) {
                return $next($request);
            }
        }

        // Check whitelist - skip ML check for public routes
        foreach ($this->whitelistPaths as $whitelist) {
            if (str_starts_with($fullPath, $whitelist)) {
                return $next($request);
            }
        }

        $modelPreference = config('security.model_preference', 'random_forest');

        try {
            $response = Http::timeout(3)
                ->post($this->mlApiUrl, [
                    'url' => $requestUri,
                    'model_preference' => $modelPreference,
                ]);

            if ($response->successful()) {
                $result = $response->json();
                $status = $result['status'] ?? 'unknown';

                if ($status === 'attack') {
                    AttackLog::create([
                        'ip_address' => $request->ip(),
                        'url' => $requestUri,
                        'method' => $method,
                        'model_used' => $result['model_used'] ?? $modelPreference,
                        'confidence' => $result['confidence'] ?? null,
                        'user_agent' => $request->userAgent(),
                    ]);

                    Log::warning('ML Security: Attack detected', [
                        'ip' => $request->ip(),
                        'url' => $requestUri,
                        'model' => $result['model_used'] ?? $modelPreference,
                        'confidence' => $result['confidence'] ?? null,
                    ]);

                    return response()->json([
                        'error' => 'Phát hiện hành vi đáng ngờ',
                        'message' => 'Yêu cầu của bạn đã bị chặn vì chứa nội dung nguy hiểm.',
                        'status' => 'attack',
                        'model' => $result['model_used'] ?? $modelPreference,
                        'confidence' => $result['confidence'] ?? null,
                    ], 403);
                }
            }
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('ML Security: FastAPI unreachable - ' . $e->getMessage());
        } catch (\Exception $e) {
            Log::error('ML Security: Unexpected error - ' . $e->getMessage());
        }

        return $next($request);
    }
}
