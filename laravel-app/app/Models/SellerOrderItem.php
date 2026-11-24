<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
class SellerOrderItem extends Model {
 protected $fillable=['order_id','seller_profile_id','product_id','product_variation_id','quantity','unit_price','line_total','preparation_deadline','fulfilment_instructions','collection_status','stage_two_status'];
 protected function casts():array{return ['preparation_deadline'=>'datetime','unit_price'=>'decimal:2','line_total'=>'decimal:2'];}
 public function order():BelongsTo{return $this->belongsTo(Order::class);}
 public function sellerProfile():BelongsTo{return $this->belongsTo(SellerProfile::class);}
 public function product():BelongsTo{return $this->belongsTo(Product::class);}
 public function commissionRecord():HasOne{return $this->hasOne(CommissionRecord::class);}
 public function earning():HasOne{return $this->hasOne(SellerEarning::class);}
 public function collectionRecords():HasMany{return $this->hasMany(CollectionRecord::class);}
}