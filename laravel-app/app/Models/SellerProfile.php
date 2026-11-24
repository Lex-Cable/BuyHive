<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SellerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'seller_type',
        'business_name',
        'location_id',
        'town',
        'business_description',
        'verification_status',
        'custom_commission_rate',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(SellerOrderItem::class);
    }

    public function earnings(): HasMany
    {
        return $this->hasMany(SellerEarning::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(SellerPayout::class);
    }
}

class SellerOrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'seller_profile_id',
        'product_id',
        'product_variation_id',
        'quantity',
        'unit_price',
        'line_total',
        'preparation_deadline',
        'fulfilment_instructions',
        'collection_status',
        'stage_two_status',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
