<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Location extends Model {
 protected $fillable=['country','county_code','county_name','slug','region','major_towns','has_collection_hub','collection_hub_name'];
 protected function casts(): array { return ['major_towns'=>'array','has_collection_hub'=>'boolean','county_code'=>'integer']; }
 public function products(): HasMany { return $this->hasMany(Product::class); }
 public function customerAddresses(): HasMany { return $this->hasMany(CustomerAddress::class); }
}