<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class SellerMessage extends Model {
 protected $fillable=['seller_profile_id','type','title','body','is_read'];
 protected function casts():array{return ['is_read'=>'boolean'];}
 public function sellerProfile():BelongsTo{return $this->belongsTo(SellerProfile::class);}
}