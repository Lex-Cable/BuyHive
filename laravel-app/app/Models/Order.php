<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = ['order_number','user_id','customer_name','customer_phone','customer_email','fulfilment_method','delivery_location_id','delivery_town','delivery_street','collection_hub_name','collection_code','collection_confirmed','delivery_confirmed','order_notes','subtotal','discount_amount','coupon_discount','delivery_fee','tax_amount','total_amount','payment_method','payment_status','status','feedback_submitted'];
    protected function casts(): array { return ['collection_confirmed'=>'boolean','delivery_confirmed'=>'boolean','feedback_submitted'=>'boolean','subtotal'=>'decimal:2','discount_amount'=>'decimal:2','coupon_discount'=>'decimal:2','delivery_fee'=>'decimal:2','tax_amount'=>'decimal:2','total_amount'=>'decimal:2']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function sellerItems(): HasMany { return $this->hasMany(SellerOrderItem::class); }
    public function statusHistories(): HasMany { return $this->hasMany(OrderStatusHistory::class); }
    public function paymentTransactions(): HasMany { return $this->hasMany(PaymentTransaction::class); }
    public function deliveryRecords(): HasMany { return $this->hasMany(DeliveryRecord::class); }
    public function feedback(): HasOne { return $this->hasOne(CustomerFeedback::class); }
    public function isReceiptConfirmed(): bool { return $this->fulfilment_method === 'delivery' ? $this->delivery_confirmed : $this->collection_confirmed; }
}
