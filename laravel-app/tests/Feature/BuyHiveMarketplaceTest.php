<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CustomerProfile;
use App\Models\Location;
use App\Models\Order;
use App\Models\Product;
use App\Models\SellerOrderItem;
use App\Models\SellerProfile;
use App\Models\Subcategory;
use App\Models\User;
use App\Services\CommissionService;
use App\Services\FeedbackEligibilityService;
use App\Services\InspectionWorkflowService;
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
