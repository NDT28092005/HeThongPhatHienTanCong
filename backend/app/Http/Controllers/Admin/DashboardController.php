<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\AttackLog;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'users' => User::count(),
            'products' => Product::count(),
            'orders' => Order::count(),
            'attacks' => AttackLog::count(),
        ];

        $recentAttacks = AttackLog::latest()->take(100)->get();

        $modelPreference = config('security.model_preference', 'random_forest');

        return response()->json([
            'status' => true,
            'stats' => $stats,
            'recentAttacks' => $recentAttacks,
            'modelPreference' => $modelPreference,
            'availableModels' => [
                'random_forest' => ['name' => 'Random Forest', 'accuracy' => '92.6%'],
                'knn' => ['name' => 'K-Nearest Neighbors', 'accuracy' => '91.5%'],
                'decision_tree' => ['name' => 'Decision Tree', 'accuracy' => '91.9%'],
                'gradient_boosting' => ['name' => 'Gradient Boosting', 'accuracy' => '92.2%'],
                'mlp' => ['name' => 'Neural Network (MLP)', 'accuracy' => '90.3%'],
                'svc' => ['name' => 'Support Vector (SVC)', 'accuracy' => '78.7%'],
            ],
        ]);
    }
}
