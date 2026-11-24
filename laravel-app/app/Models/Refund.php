<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class Refund extends Model {
 protected $fillable=['payment_transaction_id','order_id','amount','reason','status'];
 protected function casts():array{return ['amount'=>'decimal:2'];}
 public function paymentTransaction():BelongsTo{return $this->belongsTo(PaymentTransaction::class);}
 public function order():BelongsTo{return $this->belongsTo(Order::class);}
}