<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class CommissionRecord extends Model {
 protected $fillable=['seller_order_item_id','gross_amount','rate_percent','commission_amount','net_seller_amount'];
 protected function casts(): array { return ['gross_amount'=>'decimal:2','rate_percent'=>'decimal:2','commission_amount'=>'decimal:2','net_seller_amount'=>'decimal:2']; }
 public function sellerOrderItem(): BelongsTo { return $this->belongsTo(SellerOrderItem::class); }
}