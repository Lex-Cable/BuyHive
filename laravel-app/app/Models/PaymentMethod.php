<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PaymentMethod extends Model {
 protected $fillable=['code','name','is_enabled','config'];
 protected function casts(): array { return ['is_enabled'=>'boolean','config'=>'array']; }
}