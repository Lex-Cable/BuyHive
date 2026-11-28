<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CustomerProfile;
use App\Models\Location;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\ProductInventory;
use App\Models\Product;
use App\Models\SellerOrderItem;
use App\Models\SellerProfile;
use App\Models\Subcategory;
use App\Models\User;
use App\Services\CommissionService;
use App\Services\FeedbackEligibilityService;
use App\Services\InspectionWorkflowService;
use App\Services\PaymentGatewayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BuyHiveMarketplaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_access_seller_portal_and_vice_versa(): void
    {
        $customer = User::factory()->create(['primary_role' => 'customer', 'email_verified_at' => now()]);
        CustomerProfile::create(['user_id' => $customer->id]);

        $this->actingAs($customer)->get('/seller/dashboard')->assertRedirect('/seller/login');

        $sellerUser = User::factory()->create(['primary_role' => 'seller', 'email_verified_at' => now()]);
        SellerProfile::create([
            'user_id' => $sellerUser->id, 'seller_type' => 'individual',
            'business_name' => 'Private Studio', 'town' => 'Westlands',
            'verification_status' => 'approved',
        ]);

        $this->actingAs($sellerUser)->get('/dashboard')->assertForbidden();
    }

    public function test_uninspected_products_never_appear_in_public_catalog(): void
    {
        $sellerUser = User::factory()->create(['primary_role' => 'seller']);
        $seller = SellerProfile::create([
            'user_id' => $sellerUser->id, 'seller_type' => 'registered_business',
            'business_name' => 'Hidden Seller Name Ltd', 'town' => 'Westlands',
            'verification_status' => 'approved',
        ]);

        [$category, $subcategory, $location] = $this->catalogFixtures();
        $product = Product::create([
            'seller_profile_id' => $seller->id, 'category_id' => $category->id,
            'subcategory_id' => $subcategory->id, 'location_id' => $location->id,
            'sku' => 'BH-TEST-1', 'name' => 'Pending Inspection Device',
            'slug' => 'pending-inspection-device', 'description' => 'Test',
            'price' => 10000, 'town' => 'Westlands',
            'stage_one_status' => 'pending_inspection', 'is_published' => false,
        ]);

        $this->assertCount(0, Product::publiclyListable()->get());
        app(InspectionWorkflowService::class)->recordStageOneOutcome($product, 'approved', 'INSP-01', 'Physical check passed.');
        $this->assertCount(1, Product::publiclyListable()->get());
    }

    public function test_stage_one_approval_does_not_publish_products_from_unapproved_sellers(): void
    {
        $sellerUser = User::factory()->seller()->create();
        $seller = SellerProfile::create([
            'user_id' => $sellerUser->id, 'seller_type' => 'individual',
            'business_name' => 'Pending Seller', 'town' => 'Eldoret',
            'verification_status' => 'pending_verification',
        ]);
        [$category, $subcategory, $location] = $this->catalogFixtures();

        Product::create([
            'seller_profile_id' => $seller->id, 'category_id' => $category->id,
            'subcategory_id' => $subcategory->id, 'location_id' => $location->id,
            'sku' => 'BH-TEST-2', 'name' => 'Approved But Hidden',
            'slug' => 'approved-but-hidden', 'description' => 'Test',
            'price' => 5000, 'town' => 'Eldoret',
            'stage_one_status' => 'approved', 'is_published' => true,
        ]);

        $this->assertCount(0, Product::publiclyListable()->get());
    }

    public function test_stage_two_must_pass_for_every_item_before_collection_is_released(): void
    {
        $customer = User::factory()->create();
        $sellerUser = User::factory()->seller()->create();
        $seller = SellerProfile::create([
            'user_id' => $sellerUser->id, 'seller_type' => 'individual',
            'business_name' => 'Verified Seller', 'town' => 'Nairobi',
            'verification_status' => 'approved',
        ]);
        [$category, $subcategory, $location] = $this->catalogFixtures();
        $product = Product::create([
            'seller_profile_id' => $seller->id, 'category_id' => $category->id,
            'subcategory_id' => $subcategory->id, 'location_id' => $location->id,
            'sku' => 'BH-STAGE2-1', 'name' => 'Inspected Item',
            'slug' => 'inspected-item', 'description' => 'Test',
            'price' => 1000, 'town' => 'Nairobi',
            'stage_one_status' => 'approved', 'is_published' => true,
        ]);
        $order = Order::create([
            'order_number' => 'BH-ORD-STAGE2', 'user_id' => $customer->id,
            'customer_name' => 'Customer', 'customer_phone' => '+254700000001',
            'customer_email' => 'customer@example.com', 'fulfilment_method' => 'store_collection',
            'collection_code' => 'BH-123456', 'subtotal' => 2000, 'total_amount' => 2000,
            'payment_method' => 'mpesa', 'payment_status' => 'paid', 'status' => 'seller_notified',
        ]);
        $first = SellerOrderItem::create([
            'order_id' => $order->id, 'seller_profile_id' => $seller->id, 'product_id' => $product->id,
            'quantity' => 1, 'unit_price' => 1000, 'line_total' => 1000,
        ]);
        $second = SellerOrderItem::create([
            'order_id' => $order->id, 'seller_profile_id' => $seller->id, 'product_id' => $product->id,
            'quantity' => 1, 'unit_price' => 1000, 'line_total' => 1000,
        ]);

        $service = app(InspectionWorkflowService::class);
        $service->recordStageTwoOutcome($first, 'passed', 'INSP-02', 'First item passed.');
        $this->assertSame('seller_notified', $order->fresh()->status);

        $service->recordStageTwoOutcome($second, 'passed', 'INSP-03', 'Second item passed.');
        $this->assertSame('ready_for_collection', $order->fresh()->status);
    }

    public function test_feedback_is_strictly_blocked_until_delivery_or_collection_confirmed(): void
    {
        $customer = User::factory()->create(['primary_role' => 'customer']);
        $order = Order::create([
            'order_number' => 'BH-ORD-9001', 'user_id' => $customer->id,
            'customer_name' => 'Amina', 'customer_phone' => '+254700000000',
            'customer_email' => 'amina@example.com', 'fulfilment_method' => 'store_collection',
            'collection_code' => 'BH-123456', 'collection_confirmed' => false,
            'subtotal' => 10000, 'total_amount' => 10000, 'payment_method' => 'mpesa',
            'payment_status' => 'paid', 'status' => 'ready_for_collection',
        ]);

        $service = app(FeedbackEligibilityService::class);
        $this->assertFalse($service->isOrderEligible($order));
        $order->update(['collection_confirmed' => true, 'status' => 'collected']);
        $this->assertTrue($service->isOrderEligible($order->fresh()));
    }

    public function test_commission_is_deducted_from_selling_price_not_added_on_top(): void
    {
        $calc = app(CommissionService::class)->calculateBreakdown(10000, 10.0);
        $this->assertEquals(1000.00, $calc['commission_amount']);
        $this->assertEquals(9000.00, $calc['net_seller_proceeds']);
    }

    public function test_react_storefront_catalog_api_returns_only_approved_products_without_seller_identity(): void
    {
        $sellerUser = User::factory()->seller()->create();
        $seller = SellerProfile::create([
            'user_id' => $sellerUser->id,
            'seller_type' => 'registered_business',
            'business_name' => 'Private Seller Company',
            'town' => 'Westlands',
            'verification_status' => 'approved',
        ]);
        [$category, $subcategory, $location] = $this->catalogFixtures();

        Product::create([
            'seller_profile_id' => $seller->id,
            'category_id' => $category->id,
            'subcategory_id' => $subcategory->id,
            'location_id' => $location->id,
            'sku' => 'BH-API-APPROVED',
            'name' => 'Approved Public Product',
            'slug' => 'approved-public-product',
            'description' => 'Visible in the React storefront.',
            'price' => 2500,
            'town' => 'Westlands',
            'stage_one_status' => 'approved',
            'is_published' => true,
        ]);

        Product::create([
            'seller_profile_id' => $seller->id,
            'category_id' => $category->id,
            'subcategory_id' => $subcategory->id,
            'location_id' => $location->id,
            'sku' => 'BH-API-PENDING',
            'name' => 'Pending Product Must Stay Hidden',
            'slug' => 'pending-product-must-stay-hidden',
            'description' => 'Not approved for listing.',
            'price' => 1200,
            'town' => 'Westlands',
            'stage_one_status' => 'pending_inspection',
            'is_published' => false,
        ]);

        $response = $this->getJson('/api/catalog');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Approved Public Product')
            ->assertJsonPath('data.0.sellerId', '__server-approved__')
            ->assertJsonMissingPath('data.0.seller_name')
            ->assertJsonMissingPath('data.0.seller_email')
            ->assertJsonMissingPath('data.0.seller_phone')
            ->assertJsonMissing(['name' => 'Pending Product Must Stay Hidden']);

        $this->assertStringNotContainsString('Private Seller Company', $response->getContent());
    }

    public function test_storefront_customer_registration_creates_a_real_session_and_profile(): void
    {
        $response = $this->postJson('/api/storefront/register', [
            'name' => 'Test Customer',
            'email' => 'buyer@example.test',
            'phone' => '+254700111222',
            'password' => 'SecurePass2026!',
            'password_confirmation' => 'SecurePass2026!',
            'role' => 'customer',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.role', 'customer')
            ->assertJsonPath('user.name', 'Test Customer');

        $this->assertDatabaseHas('users', ['email' => 'buyer@example.test', 'primary_role' => 'customer']);
        $this->assertDatabaseHas('customer_profiles', ['loyalty_points' => 150]);
        $this->getJson('/api/storefront/session')
            ->assertOk()
            ->assertJsonPath('authenticated', true)
            ->assertJsonPath('user.email', 'buyer@example.test');
    }

    public function test_storefront_login_rejects_wrong_portal_role_and_accepts_phone_identity(): void
    {
        $customer = User::factory()->create([
            'name' => 'Phone Buyer',
            'email' => 'phonebuyer@example.test',
            'phone' => '+254700123456',
            'password' => bcrypt('SecurePass2026!'),
            'primary_role' => 'customer',
        ]);

        $this->postJson('/api/storefront/login', [
            'email_or_phone' => '+254700123456',
            'password' => 'SecurePass2026!',
            'role' => 'seller',
        ])->assertUnprocessable();

        $this->postJson('/api/storefront/login', [
            'email_or_phone' => '+254700123456',
            'password' => 'SecurePass2026!',
            'role' => 'customer',
        ])->assertOk()->assertJsonPath('user.id', (string) $customer->id);
    }

    public function test_storefront_cart_and_orders_require_an_authenticated_session(): void
    {
        $this->getJson('/api/storefront/cart')->assertUnauthorized();
        $this->getJson('/api/storefront/orders')->assertUnauthorized();
    }

    public function test_failed_payment_releases_reserved_inventory_once(): void
    {
        $customer = User::factory()->create();
        $sellerUser = User::factory()->seller()->create();
        $seller = SellerProfile::create([
            'user_id' => $sellerUser->id,
            'seller_type' => 'individual',
            'business_name' => 'Stock Release Seller',
            'town' => 'Nairobi',
            'verification_status' => 'approved',
        ]);
        [$category, $subcategory, $location] = $this->catalogFixtures();
        $product = Product::create([
            'seller_profile_id' => $seller->id,
            'category_id' => $category->id,
            'subcategory_id' => $subcategory->id,
            'location_id' => $location->id,
            'sku' => 'BH-PAYFAIL-1',
            'name' => 'Reserved Test Item',
            'slug' => 'reserved-test-item',
            'description' => 'Test inventory release',
            'price' => 1500,
            'town' => 'Nairobi',
            'stage_one_status' => 'approved',
            'is_published' => true,
        ]);
        $order = Order::create([
            'order_number' => 'BH-ORD-PAYFAIL',
            'user_id' => $customer->id,
            'customer_name' => 'Test Customer',
            'customer_phone' => '+254700000111',
            'customer_email' => 'payfail@example.test',
            'fulfilment_method' => 'delivery',
            'subtotal' => 3000,
            'total_amount' => 3000,
            'payment_method' => 'mpesa',
            'payment_status' => 'pending',
            'status' => 'order_placed',
        ]);
        $item = SellerOrderItem::create([
            'order_id' => $order->id,
            'seller_profile_id' => $seller->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 1500,
            'line_total' => 3000,
        ]);
        ProductInventory::create([
            'product_id' => $product->id,
            'available_quantity' => 0,
            'reserved_quantity' => 2,
        ]);
        $transaction = PaymentTransaction::create([
            'order_id' => $order->id,
            'provider' => 'mpesa',
            'transaction_reference' => 'MPESA-FAIL-TEST',
            'amount' => 3000,
            'currency' => 'KES',
            'is_sandbox' => true,
            'status' => 'initiated',
        ]);

        $service = app(PaymentGatewayService::class);
        $service->reconcileWebhook($transaction->transaction_reference, false, ['result' => 'failed']);
        $this->assertDatabaseHas('product_inventories', ['product_id' => $product->id, 'available_quantity' => 2, 'reserved_quantity' => 0]);
        $this->assertSame('failed', $order->fresh()->payment_status);

        $service->reconcileWebhook($transaction->transaction_reference, false, ['result' => 'duplicate']);
        $this->assertDatabaseHas('product_inventories', ['product_id' => $product->id, 'available_quantity' => 2, 'reserved_quantity' => 0]);
    }

    private function catalogFixtures(): array
    {
        $category = Category::create(['name' => 'Electronics', 'slug' => 'electronics']);
        $subcategory = Subcategory::create(['category_id' => $category->id, 'name' => 'Smartphones', 'slug' => 'smartphones']);
        $location = Location::create([
            'county_code' => 47, 'county_name' => 'Nairobi', 'slug' => 'nairobi',
            'region' => 'Nairobi', 'major_towns' => ['Westlands'],
        ]);

        return [$category, $subcategory, $location];
    }
}
