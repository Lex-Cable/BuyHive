<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CommissionRecord;
use App\Models\Coupon;
use App\Models\CouponRedemption;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\ProductInventory;
use App\Models\SellerEarning;
use App\Models\SellerOrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    public function __construct(
        protected CommissionService $commissionService,
    ) {}

    public function placeOrder(User $customer, Cart $cart, array $payload): Order
    {
        return DB::transaction(function () use ($customer, $cart, $payload) {
            $cart->load(['items.product.sellerProfile', 'items.variation']);

            if ($cart->items->isEmpty()) {
                throw ValidationException::withMessages(['cart' => 'Your shopping cart is empty.']);
            }

            $subtotal = 0;
            $preparedLines = [];

            foreach ($cart->items as $item) {
                $product = Product::query()
                    ->publiclyListable()
                    ->whereKey($item->product_id)
                    ->lockForUpdate()
                    ->first();

                if (!$product) {
                    throw ValidationException::withMessages([
                        'cart' => 'One or more products are no longer approved or available.',
                    ]);
                }

                $inventory = ProductInventory::query()
                    ->where('product_id', $product->id)
                    ->when(
                        $item->product_variation_id,
                        fn ($q) => $q->where('product_variation_id', $item->product_variation_id),
                        fn ($q) => $q->whereNull('product_variation_id')
                    )
                    ->lockForUpdate()
                    ->first();

                if (!$inventory || $inventory->available_quantity < $item->quantity) {
                    throw ValidationException::withMessages([
                        'cart' => "Insufficient stock for {$product->name}.",
                    ]);
                }

                $unitPrice = (float) $product->price + (float) ($item->variation?->price_delta ?? 0);
                $lineTotal = round($unitPrice * $item->quantity, 2);
                $subtotal += $lineTotal;

                $inventory->decrement('available_quantity', $item->quantity);
                $inventory->increment('reserved_quantity', $item->quantity);

                $preparedLines[] = compact('product', 'item', 'unitPrice', 'lineTotal');
            }

            $couponDiscount = 0;
            $appliedCoupon = null;
            if (!empty($payload['coupon_code'])) {
                $appliedCoupon = $this->validateCoupon($payload['coupon_code'], $customer, $subtotal, $preparedLines);
                $couponDiscount = $appliedCoupon['discount'];
            }

            $deliveryFee = $payload['fulfilment_method'] === 'delivery'
                ? ((int) ($payload['delivery_location_id'] ?? 47) === 47 ? 350.00 : 650.00)
                : 0.00;

            $totalAmount = max(0, round($subtotal - $couponDiscount + $deliveryFee, 2));

            $order = Order::create([
                'order_number' => 'BH-ORD-' . strtoupper(Str::random(6)),
                'user_id' => $customer->id,
                'customer_name' => $payload['customer_name'],
                'customer_phone' => $payload['customer_phone'],
                'customer_email' => $payload['customer_email'],
                'fulfilment_method' => $payload['fulfilment_method'],
                'delivery_location_id' => $payload['delivery_location_id'] ?? null,
                'delivery_town' => $payload['delivery_town'] ?? null,
                'delivery_street' => $payload['delivery_street'] ?? null,
                'collection_hub_name' => $payload['collection_hub_name'] ?? null,
                'collection_code' => $payload['fulfilment_method'] === 'store_collection'
                    ? 'BH-' . random_int(100000, 999999)
                    : null,
                'order_notes' => $payload['order_notes'] ?? null,
                'subtotal' => $subtotal,
                'coupon_discount' => $couponDiscount,
                'delivery_fee' => $deliveryFee,
                'tax_amount' => 0,
                'total_amount' => $totalAmount,
                'payment_method' => $payload['payment_method'],
                'payment_status' => 'pending',
                'status' => 'order_placed',
            ]);

            foreach ($preparedLines as $line) {
                /** @var Product $product */
                $product = $line['product'];
                $seller = $product->sellerProfile;

                $sellerItem = SellerOrderItem::create([
                    'order_id' => $order->id,
                    'seller_profile_id' => $seller->id,
                    'product_id' => $product->id,
                    'product_variation_id' => $line['item']->product_variation_id,
                    'quantity' => $line['item']->quantity,
                    'unit_price' => $line['unitPrice'],
                    'line_total' => $line['lineTotal'],
                    'preparation_deadline' => now()->addHours(24),
                    'fulfilment_instructions' => "Prepare SKU {$product->sku} for BuyHive Field Agent pickup & Stage-2 inspection.",
                    'collection_status' => 'pending_prep',
                    'stage_two_status' => 'awaiting_seller_prep',
                ]);

                $rate = $this->commissionService->resolveRateForProduct($product, $seller);
                $breakdown = $this->commissionService->calculateBreakdown($line['lineTotal'], $rate);

                CommissionRecord::create([
                    'seller_order_item_id' => $sellerItem->id,
                    'gross_amount' => $breakdown['gross_amount'],
                    'rate_percent' => $breakdown['rate_percent'],
                    'commission_amount' => $breakdown['commission_amount'],
                    'net_seller_amount' => $breakdown['net_seller_proceeds'],
                ]);

                SellerEarning::create([
                    'seller_profile_id' => $seller->id,
                    'seller_order_item_id' => $sellerItem->id,
                    'gross_amount' => $breakdown['gross_amount'],
                    'commission_deduction' => $breakdown['commission_amount'],
                    'net_amount' => $breakdown['net_seller_proceeds'],
                    'status' => 'pending', // Never released until Stage-2 inspection & receipt confirmed!
                ]);
            }

            if ($appliedCoupon) {
                CouponRedemption::create([
                    'coupon_id' => $appliedCoupon['coupon']->id,
                    'user_id' => $customer->id,
                    'order_id' => $order->id,
                    'discount_applied' => $couponDiscount,
                ]);
            }

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => 'order_placed',
                'label' => 'Order Placed',
                'note' => 'Order created and totals validated server-side.',
            ]);

            $cart->items()->delete();

            return $order->load('sellerItems');
        });
    }

    protected function validateCoupon(string $code, User $customer, float $subtotal, array $lines): array
    {
        $coupon = Coupon::query()
            ->where('code', strtoupper(trim($code)))
            ->where('is_active', true)
            ->where('expires_at', '>', now())
            ->first();

        if (!$coupon || $subtotal < (float) $coupon->min_order_amount) {
            throw ValidationException::withMessages(['coupon_code' => 'Coupon is invalid or does not meet minimum order requirements.']);
        }

        $alreadyUsed = CouponRedemption::where('coupon_id', $coupon->id)->where('user_id', $customer->id)->exists();
        if ($alreadyUsed) {
            throw ValidationException::withMessages(['coupon_code' => 'You have already redeemed this coupon.']);
        }

        if ($coupon->max_redemptions !== null && $coupon->redemptions()->count() >= $coupon->max_redemptions) {
            throw ValidationException::withMessages(['coupon_code' => 'This coupon has reached its redemption limit.']);
        }

        $eligibleProducts = collect($lines)->pluck('product');
        if ($coupon->category_id && !$eligibleProducts->contains(fn (Product $product) => (int) $product->category_id === (int) $coupon->category_id)) {
            throw ValidationException::withMessages(['coupon_code' => 'This coupon is restricted to a different product category.']);
        }
        if ($coupon->product_id && !$eligibleProducts->contains(fn (Product $product) => (int) $product->id === (int) $coupon->product_id)) {
            throw ValidationException::withMessages(['coupon_code' => 'This coupon is restricted to a different product.']);
        }

        $discount = $coupon->discount_type === 'percentage'
            ? round(($subtotal * (float) $coupon->discount_value) / 100, 2)
            : min($subtotal, (float) $coupon->discount_value);

        return ['coupon' => $coupon, 'discount' => $discount];
    }
}
