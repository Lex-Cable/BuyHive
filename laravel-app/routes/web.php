<?php

use App\Http\Controllers\Customer\MarketplaceController;
use App\Http\Controllers\Seller\SellerPortalController;
use App\Http\Middleware\EnsureCustomerRole;
use App\Http\Middleware\EnsureSellerRole;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public & Customer Routes (Fortify handles /login, /register, /forgot-password, /email/verify via sessions)
Route::get('/', [MarketplaceController::class, 'landing'])->name('home');
Route::get('/shop', [MarketplaceController::class, 'landing'])->name('shop');
Route::get('/categories', fn () => Inertia::render('Customer/Categories'))->name('categories.index');
Route::get('/categories/{category}', fn (string $category) => Inertia::render('Customer/CategoryShow', ['slug' => $category]))->name('categories.show');
Route::get('/deals', fn () => Inertia::render('Customer/Deals'))->name('deals');
Route::get('/occasions', fn () => Inertia::render('Customer/Occasions'))->name('occasions');
Route::get('/locations', fn () => Inertia::render('Customer/Locations'))->name('locations');
Route::get('/trending', fn () => Inertia::render('Customer/Trending'))->name('trending');
Route::get('/new-arrivals', fn () => Inertia::render('Customer/NewArrivals'))->name('new-arrivals');
Route::get('/products/{product}', fn (string $product) => Inertia::render('Customer/ProductDetail', ['id' => $product]))->name('products.show');
Route::get('/support', fn () => Inertia::render('Support'))->name('support');
Route::get('/contact', fn () => Inertia::render('Contact'))->name('contact');
Route::get('/about', fn () => Inertia::render('About'))->name('about');

Route::middleware(['auth', 'verified', EnsureCustomerRole::class])->group(function () {
    Route::get('/dashboard', [MarketplaceController::class, 'dashboard'])->name('customer.dashboard');
    Route::get('/cart', fn () => Inertia::render('Customer/Cart'))->name('cart');
    Route::get('/checkout', fn () => Inertia::render('Customer/Checkout'))->name('checkout');
    Route::get('/order-confirmation/{order}', fn (string $order) => Inertia::render('Customer/OrderConfirmation', ['order' => $order]))->name('order.confirmation');
    Route::get('/account', fn () => Inertia::render('Customer/Account'))->name('account');
    Route::get('/orders', fn () => Inertia::render('Customer/Orders'))->name('orders.index');
    Route::get('/orders/{order}', fn (string $order) => Inertia::render('Customer/OrderShow', ['order' => $order]))->name('orders.show');
    Route::get('/track-order/{order}', fn (string $order) => Inertia::render('Customer/TrackOrder', ['order' => $order]))->name('orders.track');
    Route::get('/wishlist', fn () => Inertia::render('Customer/Wishlist'))->name('wishlist');
    Route::get('/feedback', fn () => Inertia::render('Customer/Feedback'))->name('feedback');
    Route::get('/coupons-rewards', fn () => Inertia::render('Customer/CouponsRewards'))->name('coupons-rewards');
});

// Separate Seller Portal Routes (NO admin/management routes exist in this application)
Route::prefix('seller')->name('seller.')->group(function () {
    Route::get('/', fn () => Inertia::render('Seller/Welcome'))->name('welcome');
    Route::get('/login', fn () => Inertia::render('Seller/Login'))->name('login');
    Route::get('/register', fn () => Inertia::render('Seller/Register'))->name('register');

    Route::middleware(['auth', 'verified', EnsureSellerRole::class])->group(function () {
        Route::get('/dashboard', [SellerPortalController::class, 'dashboard'])->name('dashboard');
        Route::get('/products', fn () => Inertia::render('Seller/Products'))->name('products.index');
        Route::get('/products/create', [SellerPortalController::class, 'createProduct'])->name('products.create');
        Route::post('/products', [SellerPortalController::class, 'storeProduct'])->name('products.store');
        Route::get('/orders', [SellerPortalController::class, 'orders'])->name('orders');
        Route::get('/sales', [SellerPortalController::class, 'sales'])->name('sales');
        Route::get('/earnings', [SellerPortalController::class, 'earnings'])->name('earnings');
        Route::get('/payments', fn () => Inertia::render('Seller/Payments'))->name('payments');
        Route::get('/messages', fn () => Inertia::render('Seller/Messages'))->name('messages');
        Route::get('/reviews', fn () => Inertia::render('Seller/Reviews'))->name('reviews');
        Route::get('/promotions', fn () => Inertia::render('Seller/Promotions'))->name('promotions');
        Route::get('/settings', fn () => Inertia::render('Seller/Settings'))->name('settings');
        Route::get('/support', fn () => Inertia::render('Seller/Support'))->name('support');
    });
});
