<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone', 32)->nullable()->index();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('primary_role', ['customer', 'seller'])->default('customer')->index();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('role_user', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->primary(['user_id', 'role_id']);
        });

        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('country', 64)->default('Kenya');
            $table->unsignedSmallInteger('county_code')->unique();
            $table->string('county_name', 100)->index();
            $table->string('slug', 100)->unique();
            $table->string('region', 64);
            $table->json('major_towns');
            $table->boolean('has_collection_hub')->default(false);
            $table->string('collection_hub_name')->nullable();
            $table->timestamps();
        });

        Schema::create('customer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('loyalty_points')->default(0);
            $table->date('birth_date')->nullable();
            $table->json('shopping_interests')->nullable();
            $table->timestamps();
        });

        Schema::create('customer_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('label', 64);
            $table->string('town', 100);
            $table->string('street_address');
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('seller_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('seller_type', ['individual', 'registered_business']);
            $table->string('business_name');
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('town', 100);
            $table->text('business_description')->nullable();
            $table->enum('verification_status', [
                'pending_verification',
                'under_review',
                'approved',
                'additional_info_required',
                'rejected',
                'suspended',
            ])->default('pending_verification')->index();
            $table->decimal('custom_commission_rate', 5, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('seller_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_profile_id')->constrained()->cascadeOnDelete();
            $table->string('id_or_registration_ref', 100);
            $table->string('document_storage_path'); // Stored on private disk
            $table->string('reviewed_by_management_ref')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('seller_payout_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_profile_id')->constrained()->cascadeOnDelete();
            $table->enum('payout_method', ['mpesa_till', 'mpesa_phone', 'bank_transfer']);
            $table->string('account_label');
            $table->text('encrypted_account_details');
            $table->boolean('is_verified')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_payout_accounts');
        Schema::dropIfExists('seller_verifications');
        Schema::dropIfExists('seller_profiles');
        Schema::dropIfExists('customer_addresses');
        Schema::dropIfExists('customer_profiles');
        Schema::dropIfExists('locations');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('users');
    }
};
