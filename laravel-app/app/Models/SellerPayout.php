<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
class SellerPayout extends Model {
 protected $fillable=['seller_profile_id','payout_reference','amount','payout_channel','status','settled_at'];
 protected function casts(): array { return ['amount'=>'decimal:2','settled_at'=>'datetime']; }
 public function sellerProfile(): BelongsTo { return $this->belongsTo(SellerProfile::class); }
 public function earnings(): HasMany { return $this->hasMany(SellerEarning::class); }
}