<?php

namespace App\Services;

use App\Models\CustomerFeedback;
use App\Models\Order;
use App\Models\ProductReview;
use App\Models\RewardTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FeedbackEligibilityService
{
    /**
     * Strictly gates feedback behind confirmed Delivery or confirmed Store Collection.
     * Payment or checkout alone NEVER unlocks feedback.
     */
    public function isOrderEligible(Order $order): bool
    {
        if ($order->feedback_submitted && !config('buyhive.feedback_policy.allow_duplicate_per_order')) {
            return false;
        }

        return $order->payment_status === 'paid' && $order->isReceiptConfirmed();
    }

    public function submitFeedback(Order $order, array $payload): CustomerFeedback
    {
        if (!$this->isOrderEligible($order)) {
            throw ValidationException::withMessages([
                'order_id' => 'Feedback is only unlocked after confirmed delivery or verified store collection receipt.',
            ]);
        }

        return DB::transaction(function () use ($order, $payload) {
            $feedback = CustomerFeedback::create([
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'overall_rating' => $payload['overall_rating'],
                'would_shop_again' => (bool) $payload['would_shop_again'],
                'question_ratings' => $payload['question_ratings'],
                'comments' => $payload['comments'] ?? null,
                'complaints' => $payload['complaints'] ?? null,
                'improvement_suggestions' => $payload['improvement_suggestions'] ?? null,
            ]);

            foreach ($order->sellerItems as $item) {
                ProductReview::firstOrCreate(
                    [
                        'product_id' => $item->product_id,
                        'order_id' => $order->id,
                        'user_id' => $order->user_id,
                    ],
                    [
                        'rating' => $payload['overall_rating'],
                        'comment' => $payload['comments'] ?? 'Verified BuyHive purchase.',
                        'is_verified_purchase' => true,
                    ]
                );
            }

            $order->update([
                'feedback_submitted' => true,
                'status' => 'completed',
            ]);

            $points = (int) config('buyhive.feedback_policy.points_awarded', 50);
            $order->user->customerProfile?->increment('loyalty_points', $points);
            RewardTransaction::create([
                'user_id' => $order->user_id,
                'points_delta' => $points,
                'description' => "Verified feedback bonus for {$order->order_number}",
                'order_id' => $order->id,
            ]);

            return $feedback;
        });
    }
}
