<?php

namespace App\Http\Controllers\Integration;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\SellerOrderItem;
use App\Services\InspectionWorkflowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Headless Integration API reserved strictly for the future separate
 * BuyHive Management System & Field Operations websites.
 * Protected via HMAC signature middleware — zero admin UI routes exist in this app.
 */
class ManagementSyncController extends Controller
{
    public function __construct(
        protected InspectionWorkflowService $inspectionService,
    ) {}

    public function recordStageOneInspection(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'outcome' => ['required', 'in:approved,rejected,correction_required'],
            'inspector_ref' => ['required', 'string'],
            'findings' => ['required', 'string'],
            'checklist' => ['array'],
            'rejection_reason' => ['nullable', 'string'],
        ]);

        $record = $this->inspectionService->recordStageOneOutcome(
            $product,
            $data['outcome'],
            $data['inspector_ref'],
            $data['findings'],
            $data['checklist'] ?? [],
            $data['rejection_reason'] ?? null
        );

        return response()->json(['inspection_record_id' => $record->id, 'product_published' => $product->fresh()->is_published]);
    }

    public function recordStageTwoInspection(Request $request, SellerOrderItem $sellerOrderItem): JsonResponse
    {
        $data = $request->validate([
            'outcome' => ['required', 'in:passed,failed'],
            'inspector_ref' => ['required', 'string'],
            'findings' => ['required', 'string'],
            'rejection_reason' => ['nullable', 'string'],
        ]);

        $record = $this->inspectionService->recordStageTwoOutcome(
            $sellerOrderItem,
            $data['outcome'],
            $data['inspector_ref'],
            $data['findings'],
            $data['rejection_reason'] ?? null
        );

        return response()->json(['inspection_record_id' => $record->id, 'stage_two_status' => $sellerOrderItem->fresh()->stage_two_status]);
    }

    public function confirmFulfilmentReceipt(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', 'in:delivery,store_collection'],
            'collection_code' => ['nullable', 'string'],
        ]);

        if ($data['type'] === 'store_collection') {
            abort_unless($order->collection_code === ($data['collection_code'] ?? ''), 422, 'Invalid collection code.');
            $order->update(['collection_confirmed' => true, 'status' => 'collected']);
        } else {
            $order->update(['delivery_confirmed' => true, 'status' => 'delivered']);
        }

        $this->inspectionService->releaseSellerEarningsOnReceipt($order->fresh());

        return response()->json(['order_status' => $order->status, 'feedback_eligible' => true]);
    }
}
