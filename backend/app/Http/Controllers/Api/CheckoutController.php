<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\CartItem;

class CheckoutController extends Controller
{
    private const FREE_SHIPPING_THRESHOLD = 500000;
    private const SHIPPING_FEE = 30000;
    private const BANK_PAYMENT_EXPIRY_MINUTES = 3;

    public function checkout(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(["error" => "Unauthorized"], 401);
        }

        $cart = Cart::with('items')->where("user_id", $user->id)
            ->where("status", 0)
            ->first();

        if (!$cart || $cart->items->count() == 0) {
            return response()->json(["error" => "Giỏ hàng trống"], 400);
        }

        $request->validate([
            "customer_name" => "required|string|max:255",
            "customer_phone" => "required|string|max:20",
            "customer_address" => "required|string|max:500"
        ]);

        DB::beginTransaction();
        try {
            $subtotal = $cart->items->sum(fn($item) => $item->quantity * $item->price_at_time);

            $shipping = $subtotal >= self::FREE_SHIPPING_THRESHOLD ? 0 : self::SHIPPING_FEE;

            $order = Order::create([
                "order_code" => "ORDER-" . strtoupper(Str::random(8)),
                "user_id" => $user->id,
                "customer_name" => strip_tags($request->customer_name),
                "customer_phone" => strip_tags($request->customer_phone),
                "customer_address" => strip_tags($request->customer_address),
                "payment_method" => $request->payment_method,
                "total_price" => $subtotal + $shipping,
                "status" => "pending",
                'expires_at' => $request->payment_method === "bank" ? now()->addMinutes(self::BANK_PAYMENT_EXPIRY_MINUTES) : null,
            ]);

            foreach ($cart->items as $item) {
                OrderItem::create([
                    "order_id" => $order->id,
                    "product_id" => $item->product_id,
                    "quantity" => $item->quantity,
                    "price" => $item->price_at_time,
                ]);
            }

            DB::commit();

            if ($order->payment_method === "bank") {
                $qrUrl = "https://img.vietqr.io/image/970416-22751921-compact2.png?amount={$order->total_price}&addInfo=" . urlencode("Thanh toán đơn hàng $order->order_code");
            } else {
                $qrUrl = null;
            }

            return response()->json([
                "message" => "Tạo đơn hàng thành công",
                "order_id" => $order->id,
                "order_code" => $order->order_code,
                "amount" => $order->total_price,
                "qr_url" => $qrUrl,
                "payment_method" => $order->payment_method
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(["error" => $e->getMessage()], 500);
        }
    }
    public function paymentSuccess(Request $request)
    {
        $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json(["error" => "Unauthorized"], 401);
        }

        $order = Order::where("id", $request->order_id)
            ->where("user_id", $user->id)
            ->where("status", "pending")
            ->first();

        if (!$order) {
            return response()->json(["error" => "Đơn hàng không hợp lệ"], 400);
        }

        $order->update(["status" => "paid"]);

        return response()->json(["message" => "Cập nhật thanh toán thành công"]);
    }
    public function clearCart()
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(["error" => "Unauthorized"], 401);
        }

        $cart = Cart::where("user_id", $user->id)->where("status", 0)->first();

        if (!$cart) {
            return response()->json(["message" => "Giỏ hàng trống rồi"]);
        }

        CartItem::where("cart_id", $cart->id)->delete();
        $cart->delete();

        return response()->json(["message" => "Xóa giỏ hàng thành công"]);
    }
}
