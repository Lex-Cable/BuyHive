<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class RewardTransaction extends Model {
 protected $fillable=['user_id','points_delta','description','order_id'];
 public function user(): BelongsTo { return $this->belongsTo(User::class); }
 public function order(): BelongsTo { return $this->belongsTo(Order::class); }
}