<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class CommissionConfig extends Model {
 protected $fillable=['category_id','rate_percent','is_active'];
 protected function casts(): array { return ['rate_percent'=>'decimal:2','is_active'=>'boolean']; }
 public function category(): BelongsTo { return $this->belongsTo(Category::class); }
}