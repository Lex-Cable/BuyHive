<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SellerProfile extends Model
{
    protected $fillable = [
        'user_id', 'seller_type', 'business_name', 'location_id', 'town',
        'business_description', 'verification_status', 'custom_commission_rate',
    ];

    protected function casts(): array
    {
        return ['custom_commission_rate' => 'decimal:2'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function location(): BelongsTo { return $this->belongsTo(Location::class); }
    public function products(): HasMany { return $this->hasMany(Product::class); }
    public function orderItems(): HasMany { return $this->hasMany(SellerOrderItem::class); }
    public function earnings(): HasMany { return $this->hasMany(SellerEarning::class); }
    public function payouts(): HasMany { return $this->hasMany(SellerPayout::class); }
    public function inspectionRecords(): HasMany { return $this->hasMany(InspectionRecord::class); }
}
