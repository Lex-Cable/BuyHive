<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class InspectionStatusHistory extends Model {
 protected $fillable=['inspection_record_id','from_status','to_status','actor_ref','note'];
 public function inspectionRecord(): BelongsTo { return $this->belongsTo(InspectionRecord::class); }
}