<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttackLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SecurityController extends Controller
{
    private string $mlApiUrl = 'http://localhost:8000/api/v1/security/predict';
    private string $defaultModel = 'random_forest';

    public function getModelPreference()
    {
        return response()->json([
            'model' => config('security.model_preference', $this->defaultModel),
            'available_models' => ['random_forest', 'knn', 'decision_tree', 'gradient_boosting', 'mlp', 'svc'],
        ]);
    }

    public function setModelPreference(Request $request)
    {
        $allowed = ['random_forest', 'knn', 'decision_tree', 'gradient_boosting', 'mlp', 'svc'];

        $request->validate([
            'model' => 'required|string|in:' . implode(',', $allowed),
        ]);

        $model = $request->input('model');

        config(['security.model_preference' => $model]);

        return response()->json([
            'success' => true,
            'model' => $model,
        ]);
    }

    public function getLogs(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $logs = AttackLog::orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($logs);
    }

    public function checkUrl(Request $request)
    {
        $request->validate([
            'url' => 'required|string|max:2048',
            'method' => 'sometimes|string|in:GET,POST,PUT,DELETE,PATCH',
        ]);

        $url = $request->input('url');
        $method = $request->input('method', 'GET');

        try {
            $response = Http::timeout(0.5)
                ->post($this->mlApiUrl, [
                    'url' => $url,
                    'model_preference' => config('security.model_preference', $this->defaultModel),
                ]);

            if ($response->successful()) {
                $result = $response->json();
                return response()->json($result);
            }

            return response()->json([
                'error' => 'ML API returned error',
                'status' => 'unknown',
            ], 502);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'ML API unreachable: ' . $e->getMessage(),
                'status' => 'unknown',
            ], 503);
        }
    }
}
