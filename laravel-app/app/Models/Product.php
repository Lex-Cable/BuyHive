<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'seller_profile_id',
        'category_id',
        'subcategory_id',
        'location_id',
        'sku',
        'name',
        'slug',
        'brand',
        'description',
        'specifications',
        'condition',
        'price',
        'original_price',
        'deal_expires_at',
        'town',
        'delivery_available',
        'collection_available',
        'warranty_info',
        'stage_one_status',
        'is_published',
        'is_paused',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'specifications' => 'array',
            'price' => 'decimal:2',
            'original_price' => 'decimal:2',
            'deal_expires_at' => 'datetime',
            'delivery_available' => 'boolean',
            'collection_available' => 'boolean',
            'is_published' => 'boolean',
            'is_paused' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    /**
     * Enforce Stage-1 inspection approval and seller approval before exposing to customers.
     */
    public function scopePubliclyListable(Builder $query): Builder
    {
        return $query
            ->where('stage_one_status', 'approved')
            ->where('is_published', true)
            ->where('is_paused', false)
            ->whereHas('sellerProfile', fn (Builder $q) => $q->where('verification_status', 'approved'));
    }

    public function sellerProfile(): BelongsTo
    {
        return $this->belongsTo(SellerProfile::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Subcategory::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function variations(): HasMany
    {
        return $this->hasMany(ProductVariation::class);
    }

    public function inventories(): HasMany
    {
        return $this->hasMany(ProductInventory::class);
    }

    public function inspectionRecords(): HasMany
    {
        return $this->hasMany(InspectionRecord::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }
}
