<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
class Occasion extends Model {
 protected $fillable=['name','slug','description','image_path','is_active'];
 protected function casts():array{return ['is_active'=>'boolean'];}
 public function products():BelongsToMany{return $this->belongsToMany(Product::class);}
}
