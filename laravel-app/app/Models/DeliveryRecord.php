<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class DeliveryRecord extends Model {
 protected $fillable=['order_id','delivery_ref','field_agent_ref','status','proof_of_delivery_path','delivered_at'];
 protected function casts(): array { return ['delivered_at'=>'datetime']; }
 public function order(): BelongsTo { return $this->belongsTo(Order::class); }
}