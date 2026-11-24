<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Coupon extends Model {
 protected $fillable=['code','title','discount_type','discount_value','min_order_amount','category_id','product_id','max_redemptions','expires_at','is_active'];
 protected function casts():array{return ['discount_value'=>'decimal:2','min_order_amount'=>'decimal:2','expires_at'=>'datetime','is_active'=>'boolean'];}
 public function category():BelongsTo{return $this->belongsTo(Category::class);}
 public function product():BelongsTo{return $this->belongsTo(Product::class);}
 public function redemptions():HasMany{return $this->hasMany(CouponRedemption::class);}
}