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
                $order->update(['payment_status' => 'failed']);
            }

            return $tx;
        });
    }
}
