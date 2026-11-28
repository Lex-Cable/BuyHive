<?php

use App\Http\Controllers\Integration\ManagementSyncController;
use App\Http\Middleware\VerifyManagementIntegrationSignature;
use App\Services\PaymentGatewayService;
use App\Http\Controllers\Api\PublicCatalogController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public React storefront catalogue. The controller applies the inspection and seller approval gate.
Route::get('/catalog', [PublicCatalogController::class, 'index']);

// Payment Provider Webhooks (M-Pesa Daraja, Stripe/Card, PayPal)
Route::post('/webhooks/mpesa', function (Request $request, PaymentGatewayService $payments) {
    $ref = (string) $request->input('transaction_reference', '');
    $ok = (int) $request->input('Body.stkCallback.ResultCode', 1) === 0;
    $payments->reconcileWebhook($ref, $ok, $request->all());
    return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
});

// Signed Machine-to-Machine API for Future Separate Management & Field Ops Website
Route::prefix('integration/management')
    ->middleware(VerifyManagementIntegrationSignature::class)
    ->group(function () {
        Route::post('/products/{product}/stage-one', [ManagementSyncController::class, 'recordStageOneInspection']);
        Route::post('/order-items/{sellerOrderItem}/stage-two', [ManagementSyncController::class, 'recordStageTwoInspection']);
        Route::post('/orders/{order}/confirm-receipt', [ManagementSyncController::class, 'confirmFulfilmentReceipt']);
    });
