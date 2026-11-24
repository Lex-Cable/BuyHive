<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class CustomerFeedback extends Model {
 protected $fillable=['order_id','user_id','overall_rating','would_shop_again','question_ratings','comments','complaints','improvement_suggestions','photo_paths'];
 protected function casts(): array { return ['would_shop_again'=>'boolean','question_ratings'=>'array','photo_paths'=>'array']; }
 public function order(): BelongsTo { return $this->belongsTo(Order::class); }
 public function user(): BelongsTo { return $this->belongsTo(User::class); }
}