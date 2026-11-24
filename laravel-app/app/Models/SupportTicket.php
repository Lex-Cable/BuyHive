<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class SupportTicket extends Model {
 protected $fillable=['ticket_number','user_id','user_role','category','subject','order_number','message','status'];
 public function user():BelongsTo{return $this->belongsTo(User::class);}
}