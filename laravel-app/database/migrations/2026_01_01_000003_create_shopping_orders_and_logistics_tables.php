<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('session_id', 100)->nullable()->index();
            $table->timestamps();
        });

        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variation_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('quantity');
            $table->timestamps();
        });

        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('wishlist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wishlist_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['wishlist_id', 'product_id']);
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 32)->unique();
            $table->foreignId('user_id')->constrained();
            $table->string('customer_name');
            $table->string('customer_phone', 32);
            $table->string('customer_email');
            $table->enum('fulfilment_method', ['delivery', 'store_collection']);
            $table->foreignId('delivery_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('delivery_town')->nullable();
            $table->string('delivery_street')->nullable();
            $table->string('collection_hub_name')->nullable();
            $table->string('collection_code', 16)->nullable();
            $table->boolean('collection_confirmed')->default(false);
            $table->boolean('delivery_confirmed')->default(false);
            $table->text('order_notes')->nullable();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('coupon_discount', 12, 2)->default(0);
            $table->decimal('delivery_fee', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            $table->string('payment_method', 32);
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refund_processing', 'refunded'])->default('pending')->index();
            $table->string('status', 48)->default('order_placed')->index();
            $table->boolean('feedback_submitted')->default(false);
            $table->timestamps();
        });

        // Seller-specific anonymized fulfilment items (supports multi-seller carts)
        Schema::create('seller_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('seller_profile_id')->constrained();
            $table->foreignId('product_id')->constrained();
            $table->foreignId('product_variation_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('line_total', 12, 2);
            $table->timestamp('preparation_deadline')->nullable();
            $table->text('fulfilment_instructions')->nullable();
            $table->enum('collection_status', ['pending_prep', 'ready_for_pickup', 'collected_by_agent'])->default('pending_prep');
            $table->enum('stage_two_status', [
                'awaiting_seller_prep',
                'collection_scheduled',
                'collected_by_agent',
                'under_pre_dispatch_inspection',
                'passed',
                'failed_held',
            ])->default('awaiting_seller_prep')->index();
            $table->timestamps();
        });

        Schema::create('order_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('status', 48);
            $table->string('label');
            $table->text('note')->nullable();
            $table->timestamps();
        });

        // Field operations integration tables (no public staff tracking UI exposed)
        Schema::create('collection_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_order_item_id')->constrained()->cascadeOnDelete();
            $table->string('field_agent_ref', 64)->nullable()->index();
            $table->string('inspection_location_ref')->nullable();
            $table->string('status', 48)->default('assigned');
            $table->string('proof_of_collection_path')->nullable();
            $table->timestamp('collected_at')->nullable();
            $table->timestamps();
        });

        Schema::create('delivery_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('delivery_ref', 64)->unique();
            $table->string('field_agent_ref', 64)->nullable();
            $table->string('status', 48)->default('pending');
            $table->string('proof_of_delivery_path')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_records');
        Schema::dropIfExists('collection_records');
        Schema::dropIfExists('order_status_histories');
        Schema::dropIfExists('seller_order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('wishlist_items');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
    }
};
