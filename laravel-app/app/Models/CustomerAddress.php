<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class CustomerAddress extends Model {
 protected $fillable=['user_id','location_id','label','town','street_address','is_default'];
 protected function casts():array{return ['is_default'=>'boolean'];}
 public function user():BelongsTo{return $this->belongsTo(User::class);}
 public function location():BelongsTo{return $this->belongsTo(Location::class);}
}