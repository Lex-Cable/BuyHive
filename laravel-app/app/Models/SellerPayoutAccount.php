<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SellerPayoutAccount extends Model
{
    protected $fillable = ['seller_profile_id', 'payout_method', 'account_label', 'encrypted_account_details', 'is_verified'];

    protected function casts(): array
    {
        return ['encrypted_account_details' => 'encrypted', 'is_verified' => 'boolean'];
    }

    public function sellerProfile(): BelongsTo
    {
        return $this->belongsTo(SellerProfile::class);
    }
}
