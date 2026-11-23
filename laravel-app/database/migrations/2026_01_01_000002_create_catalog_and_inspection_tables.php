<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('subcategories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->boolean('is_restricted')->default(false);
            $table->string('restriction_requirements')->nullable();
            $table->timestamps();
            $table->unique(['category_id', 'slug']);
        });

        Schema::create('occasions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained();
            $table->foreignId('subcategory_id')->constrained();
            $table->foreignId('location_id')->constrained('locations');
            $table->string('sku', 64)->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('brand')->nullable()->index();
            $table->text('description');
            $table->json('specifications')->nullable();
            $table->enum('condition', ['New', 'Refurbished (Certified)', 'Handcrafted'])->default('New');
            $table->decimal('price', 12, 2);
            $table->decimal('original_price', 12, 2)->nullable();
            $table->timestamp('deal_expires_at')->nullable();
            $table->string('town', 100);
            $table->boolean('delivery_available')->default(true);
            $table->boolean('collection_available')->default(true);
            $table->string('warranty_info')->nullable();
            $table->enum('stage_one_status', [
                'draft',
                'pending_inspection',
                'inspection_scheduled',
                'under_inspection',
                'approved',
                'rejected',
                'correction_required',
            ])->default('draft')->index();
            $table->boolean('is_published')->default(false)->index();
            $table->boolean('is_paused')->default(false);
            $table->boolean('is_featured')->default(false)->index();
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedBigInteger('sales_count')->default(0);
            $table->timestamps();
            $table->index(['stage_one_status', 'is_published', 'is_paused']);
        });

        Schema::create('occasion_product', function (Blueprint $table) {
            $table->foreignId('occasion_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->primary(['occasion_id', 'product_id']);
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('storage_path');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('product_variations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->string('size', 64)->nullable();
            $table->string('colour', 64)->nullable();
            $table->string('model', 64)->nullable();
            $table->decimal('price_delta', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('product_inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variation_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('available_quantity')->default(0);
            $table->unsignedInteger('reserved_quantity')->default(0);
            $table->timestamps();
        });

        Schema::create('inspection_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('stage'); // 1 = Pre-listing, 2 = Pre-dispatch
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('seller_profile_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('order_id')->nullable()->index();
            $table->string('inspector_ref', 64);
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('inspected_at')->nullable();
            $table->json('inspection_photos')->nullable();
            $table->json('checklist')->nullable();
            $table->text('findings')->nullable();
            $table->enum('outcome', ['pending', 'approved', 'rejected', 'correction_required', 'passed', 'failed'])->default('pending')->index();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });

        Schema::create('inspection_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_record_id')->constrained()->cascadeOnDelete();
            $table->string('from_status', 64)->nullable();
            $table->string('to_status', 64);
            $table->string('actor_ref', 64);
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inspection_status_histories');
        Schema::dropIfExists('inspection_records');
        Schema::dropIfExists('product_inventories');
        Schema::dropIfExists('product_variations');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('occasion_product');
        Schema::dropIfExists('products');
        Schema::dropIfExists('occasions');
        Schema::dropIfExists('subcategories');
        Schema::dropIfExists('categories');
    }
};
