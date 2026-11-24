<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class CollectionRecord extends Model {
 protected $fillable=['seller_order_item_id','field_agent_ref','inspection_location_ref','status','proof_of_collection_path','collected_at'];
 protected function casts(): array { return ['collected_at'=>'datetime']; }
 public function sellerOrderItem(): BelongsTo { return $this->belongsTo(SellerOrderItem::class); }
}