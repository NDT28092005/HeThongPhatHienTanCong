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
    public function index(){
        $stats = [
            'users' => User::count(),
            'products' => Product::count(),
            'orders' => Order::count(),
            'attacks' => AttackLog::count(),
        ];
        
        $recentAttacks = AttackLog::latest()->take(10)->get();
        
        return response()->json([
            'status' => true,
            'stats' => $stats,
            'recentAttacks' => $recentAttacks
        ]);
    }
}
