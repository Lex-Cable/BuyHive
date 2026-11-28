<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\PaymentTransaction;
use App\Models\ProductInventory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentGatewayService
{
    /**
     * Initiate payment with provider configured for customer's market (M-Pesa prioritized).
     * Never marks an order paid from frontend state alone.
     */
    public function initiate(Order $order, string $provider, array $meta = []): PaymentTransaction
    {
        $isSandbox = (bool) config('buyhive.sandbox_payments', true);
        $prefix = strtoupper($provider) . ($isSandbox ? '-SBX' : '');

        return PaymentTransaction::create([
            'order_id' => $order->id,
            'provider' => $provider,
            'transaction_reference' => $prefix . '-' . strtoupper(Str::random(8)),
            'external_checkout_id' => 'CHK-' . Str::uuid(),
            'amount' => $order->total_amount,
            'currency' => 'KES',
            'is_sandbox' => $isSandbox,
            'status' => 'initiated',
        ]);
    }

    /**
     * Idempotent webhook reconciliation for M-Pesa Daraja / Card / PayPal callbacks.
     */
    public function reconcileWebhook(string $transactionReference, bool $succeeded, array $payload): ?PaymentTransaction
    {
        return DB::transaction(function () use ($transactionReference, $succeeded, $payload) {
            $tx = PaymentTransaction::query()
                ->where('transaction_reference', $transactionReference)
                ->lockForUpdate()
                ->first();

            if (!$tx) {
                return null;
            }

            // Duplicate webhook protection
            if ($tx->status === 'verified' || $tx->status === 'failed') {
                return $tx;
            }

            $tx->update([
                'status' => $succeeded ? 'verified' : 'failed',
                'raw_webhook_payload' => $payload,
            ]);

            $order = $tx->order;
            if ($succeeded) {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'seller_notified',
                ]);
                OrderStatusHistory::create([
                    'order_id' => $order->id,
                    'status' => 'payment_confirmed',
                    'label' => 'Payment Confirmed',
                    'note' => "Verified via {$tx->provider} webhook ({$tx->transaction_reference}).",
                ]);
            } else {
                $order->update(['payment_status' => 'failed', 'status' => 'cancelled']);

                // A failed payment releases stock reservations atomically.
                foreach ($order->sellerItems as $item) {
                    $inventory = ProductInventory::query()
                        ->where('product_id', $item->product_id)
                        ->when(
                            $item->product_variation_id,
                            fn ($query) => $query->where('product_variation_id', $item->product_variation_id),
                            fn ($query) => $query->whereNull('product_variation_id')
                        )
                        ->lockForUpdate()
                        ->first();

                    if ($inventory) {
                        $releaseQuantity = min($inventory->reserved_quantity, $item->quantity);
                        if ($releaseQuantity > 0) {
                            $inventory->decrement('reserved_quantity', $releaseQuantity);
                            $inventory->increment('available_quantity', $releaseQuantity);
                        }
                    }
                }

                OrderStatusHistory::create([
                    'order_id' => $order->id,
                    'status' => 'payment_failed',
                    'label' => 'Payment Failed · Stock Released',
                    'note' => 'Payment was not verified. Reserved stock has been returned to available inventory.',
                ]);
            }

            return $tx;
        });
    }
}
