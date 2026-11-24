<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class Testimonial extends Model {
 protected $fillable=['customer_feedback_id','display_alias','has_customer_permission','is_published'];
 protected function casts():array{return ['has_customer_permission'=>'boolean','is_published'=>'boolean'];}
 public function customerFeedback():BelongsTo{return $this->belongsTo(CustomerFeedback::class);}
}