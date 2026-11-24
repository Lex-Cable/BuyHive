<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class PaymentTransaction extends Model {
 protected $fillable=['order_id','provider','transaction_reference','external_checkout_id','amount','currency','is_sandbox','status','raw_webhook_payload'];
 protected function casts(): array { return ['amount'=>'decimal:2','is_sandbox'=>'boolean','raw_webhook_payload'=>'array']; }
 public function order(): BelongsTo { return $this->belongsTo(Order::class); }
}