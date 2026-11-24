<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class ProductInventory extends Model {
 protected $fillable=['product_id','product_variation_id','available_quantity','reserved_quantity'];
 protected function casts(): array { return ['available_quantity'=>'integer','reserved_quantity'=>'integer']; }
 public function product(): BelongsTo { return $this->belongsTo(Product::class); }
 public function variation(): BelongsTo { return $this->belongsTo(ProductVariation::class,'product_variation_id'); }
}