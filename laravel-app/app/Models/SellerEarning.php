<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class SellerEarning extends Model {
 protected $fillable=['seller_profile_id','seller_order_item_id','seller_payout_id','gross_amount','commission_deduction','refund_adjustment','net_amount','status'];
 protected function casts(): array { return ['gross_amount'=>'decimal:2','commission_deduction'=>'decimal:2','refund_adjustment'=>'decimal:2','net_amount'=>'decimal:2']; }
 public function sellerProfile(): BelongsTo { return $this->belongsTo(SellerProfile::class); }
 public function sellerOrderItem(): BelongsTo { return $this->belongsTo(SellerOrderItem::class); }
 public function payout(): BelongsTo { return $this->belongsTo(SellerPayout::class,'seller_payout_id'); }
}