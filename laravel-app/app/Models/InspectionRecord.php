<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
class InspectionRecord extends Model {
 protected $fillable=['stage','product_id','seller_profile_id','order_id','inspector_ref','scheduled_at','inspected_at','inspection_photos','checklist','findings','outcome','rejection_reason'];
 protected function casts():array{return ['scheduled_at'=>'datetime','inspected_at'=>'datetime','inspection_photos'=>'array','checklist'=>'array'];}
 public function product():BelongsTo{return $this->belongsTo(Product::class);}
 public function sellerProfile():BelongsTo{return $this->belongsTo(SellerProfile::class);}
 public function statusHistories():HasMany{return $this->hasMany(InspectionStatusHistory::class);}
}