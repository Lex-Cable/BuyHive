<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class AuditRecord extends Model {
 protected $fillable=['actor_user_id','actor_ref','action','subject_type','subject_id','metadata','ip_address'];
 protected function casts():array{return ['metadata'=>'array'];}
 public function actor():BelongsTo{return $this->belongsTo(User::class,'actor_user_id');}
}