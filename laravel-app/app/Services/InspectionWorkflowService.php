<?php

namespace App\Services;

use App\Models\AuditRecord;
use App\Models\InspectionRecord;
use App\Models\InspectionStatusHistory;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\SellerEarning;
use App\Models\SellerOrderItem;
use Illuminate\Support\Facades\DB;

class InspectionWorkflowService
{
    public function recordStageOneOutcome(
        Product $product,
        string $outcome,
        string $inspectorRef,
        string $findings,
        array $checklist = [],
        ?string $rejectionReason = null
    ): InspectionRecord {
        return DB::transaction(function () use ($product, $outcome, $inspectorRef, $findings, $checklist, $rejectionReason) {
            $record = InspectionRecord::create([
                'stage' => 1,
                'product_id' => $product->id,
                'seller_profile_id' => $product->seller_profile_id,
                'inspector_ref' => $inspectorRef,
                'inspected_at' => now(),
                'checklist' => $checklist,
                'findings' => $findings,
                'outcome' => $outcome,
                'rejection_reason' => $rejectionReason,
            ]);

            $prevStatus = $product->stage_one_status;
            $isApproved = $outcome === 'approved' && $product->sellerProfile->verification_status === 'approved';

            $product->update([
                'stage_one_status' => $outcome,
                'is_published' => $isApproved,
            ]);

            InspectionStatusHistory::create([
                'inspection_record_id' => $record->id,
                'from_status' => $prevStatus,
                'to_status' => $outcome,
                'actor_ref' => $inspectorRef,
                'note' => $findings,
            ]);

            AuditRecord::create([
                'actor_ref' => $inspectorRef,
                'action' => 'stage_one_inspection_recorded',
                'subject_type' => Product::class,
                'subject_id' => $product->id,
                'metadata' => ['outcome' => $outcome],
            ]);

            return $record;
        });
    }

    public function recordStageTwoOutcome(
        SellerOrderItem $item,
        string $outcome, // 'passed' | 'failed'
        string $inspectorRef,
        string $findings,
        ?string $rejectionReason = null
    ): InspectionRecord {
        return DB::transaction(function () use ($item, $outcome, $inspectorRef, $findings, $rejectionReason) {
            $record = InspectionRecord::create([
                'stage' => 2,
                'product_id' => $item->product_id,
                'seller_profile_id' => $item->seller_profile_id,
                'order_id' => $item->order_id,
                'inspector_ref' => $inspectorRef,
                'inspected_at' => now(),
                'findings' => $findings,
                'outcome' => $outcome,
                'rejection_reason' => $rejectionReason,
            ]);

            $item->update([
                'stage_two_status' => $outcome === 'passed' ? 'passed' : 'failed_held',
            ]);

            /** @var Order $order */
            $order = $item->order;
            if ($outcome === 'failed') {
                $order->update(['status' => 'under_inspection']);
                OrderStatusHistory::create([
                    'order_id' => $order->id,
                    'status' => 'under_inspection',
                    'label' => 'Stage-2 Inspection Held',
                    'note' => 'Item held at inspection bay; replacement or correction requested from seller.',
                ]);
            } elseif ($order->sellerItems()->where('stage_two_status', '!=', 'passed')->doesntExist()) {
                $next = $order->fulfilment_method === 'store_collection' ? 'ready_for_collection' : 'preparing_for_dispatch';
                $order->update(['status' => $next]);
                OrderStatusHistory::create([
                    'order_id' => $order->id,
                    'status' => $next,
                    'label' => 'Stage-2 Pre-Dispatch Inspection Passed',
                    'note' => 'All order items verified and sealed for fulfilment.',
                ]);
            }

            return $record;
        });
    }

    public function releaseSellerEarningsOnReceipt(Order $order): void
    {
        if (!$order->isReceiptConfirmed()) {
            return;
        }

        SellerEarning::query()
            ->whereIn('seller_order_item_id', $order->sellerItems()->where('stage_two_status', 'passed')->pluck('id'))
            ->where('status', 'pending')
            ->update(['status' => 'available']);
    }
}
