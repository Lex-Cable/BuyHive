<?php

use App\Http\Controllers\Api\PublicCatalogController;
use App\Http\Controllers\Api\StorefrontController;
use App\Http\Controllers\Integration\ManagementSyncController;
use App\Http\Middleware\VerifyManagementIntegrationSignature;
use App\Services\PaymentGatewayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public React storefront catalogue.
Route::get('/catalog', [PublicCatalogController::class, 'index']);

// Session-authenticated React storefront API. The web middleware provides
// Laravel session cookies and CSRF protection; no Sanctum/Passport tokens.
Route::middleware('web')->prefix('storefront')->group(function () {
    Route::get('/csrf', [StorefrontController::class, 'csrf']);
    Route::get('/session', [StorefrontController::class, 'session']);
    Route::post('/register', [StorefrontController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/login', [StorefrontController::class, 'login'])->middleware('throttle:6,1');
    Route::post('/logout', [StorefrontController::class, 'logout']);

    Route::get('/meta', [StorefrontController::class, 'catalogMeta']);
    Route::middleware(['auth'])->group(function () {
        Route::get('/cart', [StorefrontController::class, 'cart']);
        Route::post('/cart/items', [StorefrontController::class, 'addCartItem']);
        Route::patch('/cart/items/{cartItem}', [StorefrontController::class, 'updateCartItem']);
        Route::delete('/cart/items/{cartItem}', [StorefrontController::class, 'deleteCartItem']);
        Route::post('/checkout', [StorefrontController::class, 'checkout']);
        Route::post('/payments/{transaction}/sandbox-confirm', [StorefrontController::class, 'sandboxConfirmPayment']);
        Route::get('/orders', [StorefrontController::class, 'orders']);
        Route::get('/orders/{order}', [StorefrontController::class, 'showOrder']);
        Route::post('/orders/{order}/confirm-collection', [StorefrontController::class, 'confirmCollection']);
        Route::post('/orders/{order}/feedback', [StorefrontController::class, 'feedback']);
        Route::get('/addresses', [StorefrontController::class, 'addresses']);
        Route::post('/addresses', [StorefrontController::class, 'saveAddress']);
        Route::get('/wishlist', [StorefrontController::class, 'wishlist']);
        Route::post('/wishlist/{product}', [StorefrontController::class, 'toggleWishlist']);
        Route::post('/coupons/validate', [StorefrontController::class, 'validateCoupon']);
        Route::get('/support/tickets', [StorefrontController::class, 'tickets']);
        Route::post('/support/tickets', [StorefrontController::class, 'createTicket']);
        Route::get('/profile', [StorefrontController::class, 'customerProfile'])->middleware('customer');
        Route::patch('/profile', [StorefrontController::class, 'updateCustomerProfile'])->middleware('customer');
        Route::get('/rewards', [StorefrontController::class, 'rewards'])->middleware('customer');
        Route::post('/rewards/redeem', [StorefrontController::class, 'redeemRewards'])->middleware('customer');

        Route::prefix('seller')->middleware('seller')->group(function () {
            Route::get('/dashboard', [StorefrontController::class, 'sellerDashboard']);
            Route::get('/profile', [StorefrontController::class, 'sellerProfile']);
            Route::patch('/profile', [StorefrontController::class, 'updateSellerProfile']);
            Route::post('/payout-account', [StorefrontController::class, 'saveSellerPayoutAccount']);
            Route::get('/messages', [StorefrontController::class, 'sellerMessages']);
            Route::get('/products', [StorefrontController::class, 'sellerProducts']);
            Route::post('/products', [StorefrontController::class, 'createSellerProduct']);
            Route::patch('/products/{product}', [StorefrontController::class, 'updateSellerProduct']);
            Route::post('/products/{product}/resubmit', [StorefrontController::class, 'resubmitSellerProduct']);
            Route::get('/orders', [StorefrontController::class, 'sellerOrders']);
            Route::post('/orders/items/{item}/ready-for-pickup', [StorefrontController::class, 'markSellerItemReady']);
            Route::get('/earnings', [StorefrontController::class, 'sellerEarnings']);
            Route::post('/payouts/request', [StorefrontController::class, 'requestPayout']);
            Route::post('/support/tickets', [StorefrontController::class, 'createSellerSupportTicket']);
            Route::patch('/messages/{message}/read', [StorefrontController::class, 'markSellerMessageRead']);
        });
    });
});

// Provider callback reconciliation. Production adapters must authenticate callbacks
// before they are allowed to reconcile a payment.
Route::post('/webhooks/mpesa', function (Request $request, PaymentGatewayService $payments) {
    $secret = (string) config('services.mpesa.callback_secret');
    $signature = (string) $request->header('X-BuyHive-Signature', '');
    if ($secret === '' || !hash_equals(hash_hmac('sha256', $request->getContent(), $secret), $signature)) {
        return response()->json(['message' => 'Unauthorised callback.'], 401);
    }
    $ref = (string) $request->input('transaction_reference', '');
    $ok = (int) $request->input('Body.stkCallback.ResultCode', 1) === 0;
    $payments->reconcileWebhook($ref, $ok, $request->all());
    return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
});

// Signed machine-to-machine API for the future separate management and field operations website.
Route::prefix('integration/management')->middleware(VerifyManagementIntegrationSignature::class)->group(function () {
    Route::post('/products/{product}/stage-one', [ManagementSyncController::class, 'recordStageOneInspection']);
    Route::post('/order-items/{sellerOrderItem}/stage-two', [ManagementSyncController::class, 'recordStageTwoInspection']);
    Route::post('/orders/{order}/confirm-receipt', [ManagementSyncController::class, 'confirmFulfilmentReceipt']);
});
