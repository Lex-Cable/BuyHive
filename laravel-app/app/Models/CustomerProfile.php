<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class CustomerProfile extends Model {
 protected $fillable=['user_id','loyalty_points','birth_date','shopping_interests'];
 protected function casts():array{return ['birth_date'=>'date','shopping_interests'=>'array','loyalty_points'=>'integer'];}
 public function user():BelongsTo{return $this->belongsTo(User::class);}
}