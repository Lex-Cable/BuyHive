<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class ProductVariation extends Model {
 protected $fillable=['product_id','label','size','colour','model','price_delta'];
 protected function casts():array{return ['price_delta'=>'decimal:2'];}
 public function product():BelongsTo{return $this->belongsTo(Product::class);}
}