<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CustomerProfile;
use App\Models\Location;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductInventory;
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

        $this->actingAs($customer)
            ->get('/seller/dashboard')
            ->assertRedirect('/seller/login');

        $sellerUser = User::factory()->create(['primary_role' => 'seller', 'email_verified_at' => now()]);
        SellerProfile::create([
            'user_id' => $sellerUser->id,
            'seller_type' => 'individual',
            'business_name' => 'Private Studio',
            'town' => 'Westlands',
            'verification_status' => 'approved',
        ]);

        $this->actingAs($sellerUser)
            ->get('/dashboard')
            ->assertForbidden();
    }

    public function test_uninspected_products_never_appear_in_public_catalog(): void
    {
        $sellerUser = User::factory()->create(['primary_role' => 'seller']);
        $seller = SellerProfile::create([
            'user_id' => $sellerUser->id,
            'seller_type' => 'registered_business',
            'business_name' => 'Hidden Seller Name Ltd',
            'town' => 'Westlands',
            'verification_status' => 'approved',
        ]);

        $cat = Category::create(['name' => 'Electronics', 'slug' => 'electronics']);
        $sub = Subcategory::create(['category_id' => $cat->id, 'name' => 'Smartphones', 'slug' => 'smartphones']);
        $loc = Location::create(['county_code' => 47, 'county_name' => 'Nairobi', 'slug' => 'nairobi', 'region' => 'Nairobi', 'major_towns' => json_encode(['Westlands'])]);

        $product = Product::create([
            'seller_profile_id' => $seller->id,
            'category_id' => $cat->id,
            'subcategory_id' => $sub->id,
            'location_id' => $loc->id,
            'sku' => 'BH-TEST-1',
            'name' => 'Pending Inspection Device',
            'slug' => 'pending-inspection-device',
            'description' => 'Test',
            'price' => 10000,
            'town' => 'Westlands',
            'stage_one_status' => 'pending_inspection',
            'is_published' => false,
        ]);

        $this->assertCount(0, Product::publiclyListable()->get());

        app(InspectionWorkflowService::class)->recordStageOneOutcome(
            $product,
            'approved',
            'INSP-01',
            'Physical check passed.'
        );

        $this->assertCount(1, Product::publiclyListable()->get());
    }

    public function test_feedback_is_strictly_blocked_until_delivery_or_collection_confirmed(): void
    {
        $customer = User::factory()->create(['primary_role' => 'customer']);
        $order = Order::create([
            'order_number' => 'BH-ORD-9001',
            'user_id' => $customer->id,
            'customer_name' => 'Amina',
            'customer_phone' => '+254700000000',
            'customer_email' => 'amina@example.com',
            'fulfilment_method' => 'store_collection',
            'collection_code' => 'BH-123456',
            'collection_confirmed' => false,
            'subtotal' => 10000,
            'total_amount' => 10000,
            'payment_method' => 'mpesa',
            'payment_status' => 'paid',
            'status' => 'ready_for_collection',
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
}
