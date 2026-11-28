<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\CustomerAddress;
use App\Models\Location;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\Product;
use App\Models\ProductInventory;
use App\Models\ProductVariation;
use App\Models\RewardTransaction;
use App\Models\SellerEarning;
use App\Models\SellerMessage;
use App\Models\SellerOrderItem;
use App\Models\SupportTicket;
use App\Models\User;
use App\Models\Wishlist;
use App\Models\WishlistItem;
use App\Services\CheckoutService;
use App\Services\FeedbackEligibilityService;
use App\Services\InspectionWorkflowService;
use App\Services\PaymentGatewayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class StorefrontController extends Controller
{
    public function csrf(): JsonResponse
    {
        return response()->json(['csrf_token' => csrf_token()]);
    }

    public function session(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json(['authenticated' => (bool) $user, 'user' => $user ? $this->userPayload($user) : null]);
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['required','email','max:255','unique:users,email'],
            'phone' => ['required','string','max:32'],
            'password' => ['required','string','min:8','confirmed'],
            'role' => ['required','in:customer,seller'],
            'seller_type' => ['required_if:role,seller','in:individual,registered_business'],
            'business_name' => ['required_if:role,seller','nullable','string','max:255'],
            'location_id' => ['required_if:role,seller','nullable','exists:locations,id'],
            'town' => ['required_if:role,seller','nullable','string','max:100'],
            'business_description' => ['nullable','string','max:3000'],
        ]);

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => strtolower($data['email']),
                'phone' => $data['phone'],
                'password' => Hash::make($data['password']),
                'primary_role' => $data['role'],
            ]);

            if ($data['role'] === 'seller') {
                $user->sellerProfile()->create([
                    'seller_type' => $data['seller_type'],
                    'business_name' => $data['business_name'] ?: $data['name'],
                    'location_id' => $data['location_id'],
                    'town' => $data['town'],
                    'business_description' => $data['business_description'] ?? null,
                    'verification_status' => 'pending_verification',
                ]);
            } else {
                $user->customerProfile()->create(['loyalty_points' => 150]);
                RewardTransaction::create([
                    'user_id' => $user->id,
                    'points_delta' => 150,
                    'description' => 'Welcome loyalty bonus',
                ]);
            }

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['user' => $this->userPayload($user->fresh(['customerProfile','sellerProfile']))], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email_or_phone' => ['required','string','max:255'],
            'password' => ['required','string'],
            'role' => ['required','in:customer,seller'],
        ]);

        $identity = User::query()
            ->where(function ($query) use ($data) {
                $query->where('email', strtolower($data['email_or_phone']))
                    ->orWhere('phone', $data['email_or_phone']);
            })
            ->where('primary_role', $data['role'])
            ->first();

        if (!$identity || !Auth::attempt([
            'email' => $identity->email,
            'password' => $data['password'],
            'primary_role' => $data['role'],
        ], (bool) ($data['remember'] ?? false))) {
            throw ValidationException::withMessages(['email' => 'The supplied credentials do not match this account type.']);
        }

        $request->session()->regenerate();
        return response()->json(['user' => $this->userPayload($request->user()->load(['customerProfile','sellerProfile']))]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['logged_out' => true]);
    }

    public function catalogMeta(): JsonResponse
    {
        return response()->json([
            'categories' => Category::query()->where('is_active',true)->with('subcategories')->orderBy('sort_order')->get(['id','name','slug','sort_order']),
            'locations' => Location::query()->orderBy('county_code')->get(['id','county_name','slug','major_towns','has_collection_hub','collection_hub_name']),
        ]);
    }

    public function cart(Request $request): JsonResponse
    {
        $cart = $this->cartFor($request->user())->load(['items.product.images','items.variation']);
        return response()->json(['items' => $cart->items->map(fn (CartItem $item) => [
            'id' => (string) $item->id,
            'productId' => (string) $item->product_id,
            'variationId' => $item->product_variation_id ? (string) $item->product_variation_id : null,
            'quantity' => $item->quantity,
            'product' => $item->product ? [
                'name' => $item->product->name,
                'price' => (float) $item->product->price,
                'image' => $item->product->images->first()?->storage_path,
            ] : null,
            'variation' => $item->variation?->label,
        ])->values()]);
    }

    public function addCartItem(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required','integer','exists:products,id'],
            'variation_id' => ['nullable','integer','exists:product_variations,id'],
            'quantity' => ['required','integer','min:1','max:50'],
        ]);
        $product = Product::query()->publiclyListable()->findOrFail($data['product_id']);
        $variation = null;
        if (!empty($data['variation_id'])) {
            $variation = ProductVariation::where('product_id',$product->id)->findOrFail($data['variation_id']);
        }
        $inventory = ProductInventory::query()->where('product_id',$product->id)
            ->when($variation,fn($q)=>$q->where('product_variation_id',$variation->id),fn($q)=>$q->whereNull('product_variation_id'))->first();
        if (!$inventory || $inventory->available_quantity < $data['quantity']) {
            throw ValidationException::withMessages(['quantity' => 'The requested quantity is not currently available.']);
        }
        $cart = $this->cartFor($request->user());
        $item = CartItem::firstOrNew([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'product_variation_id' => $variation?->id,
        ]);
        $next = (int) $item->quantity + $data['quantity'];
        if ($next > $inventory->available_quantity) {
            throw ValidationException::withMessages(['quantity' => 'The cart quantity exceeds available stock.']);
        }
        $item->quantity = $next;
        $item->save();
        return $this->cart($request);
    }

    public function updateCartItem(Request $request, CartItem $cartItem): JsonResponse
    {
        $data = $request->validate(['quantity' => ['required','integer','min:1','max:50']]);
        abort_unless($cartItem->cart_id === $this->cartFor($request->user())->id,404);
        $inventory = ProductInventory::query()->where('product_id',$cartItem->product_id)
            ->when($cartItem->product_variation_id,fn($q)=>$q->where('product_variation_id',$cartItem->product_variation_id),fn($q)=>$q->whereNull('product_variation_id'))->first();
        if (!$inventory || $data['quantity'] > $inventory->available_quantity) {
            throw ValidationException::withMessages(['quantity' => 'The requested quantity is not currently available.']);
        }
        $cartItem->update(['quantity'=>$data['quantity']]);
        return $this->cart($request);
    }

    public function deleteCartItem(Request $request, CartItem $cartItem): JsonResponse
    {
        abort_unless($cartItem->cart_id === $this->cartFor($request->user())->id,404);
        $cartItem->delete();
        return $this->cart($request);
    }

    public function checkout(Request $request, CheckoutService $checkout, PaymentGatewayService $payments): JsonResponse
    {
        $data = $request->validate([
            'customer_name' => ['required','string','max:255'],
            'customer_phone' => ['required','string','max:32'],
            'customer_email' => ['required','email','max:255'],
            'fulfilment_method' => ['required','in:delivery,store_collection'],
            'delivery_location_id' => ['required_if:fulfilment_method,delivery','nullable','exists:locations,id'],
            'delivery_town' => ['required_if:fulfilment_method,delivery','nullable','string','max:100'],
            'delivery_street' => ['required_if:fulfilment_method,delivery','nullable','string','max:255'],
            'collection_hub_name' => ['required_if:fulfilment_method,store_collection','nullable','string','max:255'],
            'order_notes' => ['nullable','string','max:1000'],
            'coupon_code' => ['nullable','string','max:40'],
            'payment_method' => ['required','in:mpesa,card,paypal,bank'],
        ]);
        if (!config('buyhive.sandbox_payments',true)) {
            return response()->json(['message'=>'Live payment provider credentials and gateway adapters are not configured. No payment was taken.'],503);
        }

        $order = $checkout->placeOrder($request->user(),$this->cartFor($request->user()),$data);
        $transaction = $payments->initiate($order,$data['payment_method']);
        return response()->json([
            'order' => $this->orderPayload($order->fresh(['sellerItems.product.images','statusHistories'])),
            'payment' => [
                'id' => $transaction->id,
                'reference' => $transaction->transaction_reference,
                'status' => $transaction->status,
                'sandbox' => true,
                'message' => 'Sandbox payment initiated. It is not marked paid until a sandbox confirmation is submitted.',
            ],
        ],201);
    }

    public function sandboxConfirmPayment(Request $request, PaymentTransaction $transaction, PaymentGatewayService $payments): JsonResponse
    {
        abort_unless(app()->environment(['local','testing']) && config('buyhive.sandbox_payments',true),404);
        abort_unless($transaction->order->user_id === $request->user()->id,404);
        $data = $request->validate(['succeeded'=>['required','boolean']]);
        $payments->reconcileWebhook($transaction->transaction_reference,(bool)$data['succeeded'],['source'=>'local_sandbox_confirmation']);
        return response()->json(['order'=>$this->orderPayload($transaction->order->fresh(['sellerItems.product.images','statusHistories'])),'payment_status'=>$transaction->fresh()->status]);
    }

    public function orders(Request $request): JsonResponse
    {
        $orders = $request->user()->orders()->with(['sellerItems.product.images','statusHistories','paymentTransactions'])->latest()->get();
        return response()->json(['data'=>$orders->map(fn(Order $order)=>$this->orderPayload($order))->values()]);
    }

    public function showOrder(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id,404);
        return response()->json(['data'=>$this->orderPayload($order->load(['sellerItems.product.images','statusHistories','paymentTransactions']))]);
    }

    public function confirmCollection(Request $request, Order $order, InspectionWorkflowService $inspection): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id,404);
        $data=$request->validate(['collection_code'=>['required','string','max:16']]);
        $order->load('sellerItems');
        if ($order->fulfilment_method !== 'store_collection' || $order->status !== 'ready_for_collection' || $order->payment_status !== 'paid') {
            throw ValidationException::withMessages(['order'=>'This order is not ready for verified collection.']);
        }
        if (!$order->sellerItems->every(fn($item)=>$item->stage_two_status==='passed') || !hash_equals((string)$order->collection_code,$data['collection_code'])) {
            throw ValidationException::withMessages(['collection_code'=>'The collection code is invalid or the order is not cleared for collection.']);
        }
        DB::transaction(function() use($order,$inspection) {
            $order->update(['collection_confirmed'=>true,'status'=>'completed']);
            $order->statusHistories()->create(['status'=>'completed','label'=>'Collection Receipt Confirmed','note'=>'Customer collection code verified.']);
            $inspection->releaseSellerEarningsOnReceipt($order->fresh());
        });
        return response()->json(['data'=>$this->orderPayload($order->fresh(['sellerItems.product.images','statusHistories','paymentTransactions']))]);
    }

    public function feedback(Request $request, Order $order, FeedbackEligibilityService $feedback): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id,404);
        $data=$request->validate([
            'overall_rating'=>['required','integer','min:1','max:5'],
            'would_shop_again'=>['required','boolean'],
            'question_ratings'=>['required','array'],
            'question_ratings.*'=>['integer','min:1','max:5'],
            'comments'=>['nullable','string','max:3000'],
            'complaints'=>['nullable','string','max:3000'],
            'improvement_suggestions'=>['nullable','string','max:3000'],
        ]);
        $created=$feedback->submitFeedback($order->load('sellerItems'),$data);
        return response()->json(['feedback_id'=>$created->id,'loyalty_points_awarded'=>config('buyhive.feedback_policy.points_awarded',50)],201);
    }

    public function addresses(Request $request): JsonResponse
    {
        return response()->json(['data'=>$request->user()->addresses()->with('location')->latest()->get()->map(fn(CustomerAddress $a)=>[
            'id'=>$a->id,'label'=>$a->label,'location_id'=>$a->location_id,'county_slug'=>$a->location?->slug,'county_name'=>$a->location?->county_name,'town'=>$a->town,'street_address'=>$a->street_address,'is_default'=>$a->is_default,
        ])]);
    }

    public function saveAddress(Request $request): JsonResponse
    {
        $data=$request->validate(['label'=>['required','string','max:64'],'location_id'=>['required','exists:locations,id'],'town'=>['required','string','max:100'],'street_address'=>['required','string','max:255'],'is_default'=>['sometimes','boolean']]);
        $address=DB::transaction(function()use($request,$data){
            $isFirst = !$request->user()->addresses()->exists();
            $makeDefault = (bool)($data['is_default'] ?? false) || $isFirst;
            if ($makeDefault) $request->user()->addresses()->update(['is_default'=>false]);
            return $request->user()->addresses()->create($data+['is_default'=>$makeDefault]);
        });
        return response()->json(['data'=>$address->load('location')],201);
    }

    public function wishlist(Request $request): JsonResponse
    {
        $wishlist=Wishlist::firstOrCreate(['user_id'=>$request->user()->id]);
        return response()->json(['product_ids'=>$wishlist->items()->whereHas('product',fn($q)=>$q->publiclyListable())->pluck('product_id')->map(fn($id)=>(string)$id)]);
    }

    public function toggleWishlist(Request $request, Product $product): JsonResponse
    {
        abort_unless($product->publiclyListable()->exists(),404);
        $wishlist=Wishlist::firstOrCreate(['user_id'=>$request->user()->id]);
        $item=$wishlist->items()->where('product_id',$product->id)->first();
        if($item){$item->delete();$saved=false;}else{$wishlist->items()->create(['product_id'=>$product->id]);$saved=true;}
        return response()->json(['saved'=>$saved]);
    }

    public function validateCoupon(Request $request): JsonResponse
    {
        $data=$request->validate(['code'=>['required','string','max:40']]);
        $coupon=Coupon::query()->where('code',strtoupper(trim($data['code'])))->where('is_active',true)->where('expires_at','>',now())->first();
        if(!$coupon) return response()->json(['valid'=>false,'message'=>'Coupon is invalid or expired.'],422);
        $cart=$this->cartFor($request->user())->load('items');
        $subtotal=0;
        foreach($cart->items as $item){
            $product=Product::query()->publiclyListable()->find($item->product_id);
            if(!$product) continue;
            $variation=$item->product_variation_id?ProductVariation::find($item->product_variation_id):null;
            $subtotal+=((float)$product->price+(float)($variation?->price_delta??0))*$item->quantity;
        }
        if($subtotal<(float)$coupon->min_order_amount || $coupon->redemptions()->where('user_id',$request->user()->id)->exists() || ($coupon->max_redemptions && $coupon->redemptions()->count()>=$coupon->max_redemptions)){
            return response()->json(['valid'=>false,'message'=>'Coupon conditions are not met.'],422);
        }
        $discount=$coupon->discount_type==='percentage'?round($subtotal*(float)$coupon->discount_value/100,2):min($subtotal,(float)$coupon->discount_value);
        return response()->json(['valid'=>true,'code'=>$coupon->code,'discount'=>$discount,'title'=>$coupon->title]);
    }

    public function tickets(Request $request): JsonResponse
    {
        return response()->json(['data'=>$request->user()->supportTickets()->latest()->get()]);
    }

    public function createTicket(Request $request): JsonResponse
    {
        $data=$request->validate(['category'=>['required','string','max:64'],'subject'=>['required','string','max:255'],'order_number'=>['nullable','string','max:32'],'message'=>['required','string','max:5000']]);
        if(!empty($data['order_number'])) abort_unless($request->user()->orders()->where('order_number',$data['order_number'])->exists(),404);
        $ticket=SupportTicket::create(['ticket_number'=>'BH-TKT-'.strtoupper(Str::random(7)),'user_id'=>$request->user()->id,'user_role'=>$request->user()->primary_role,...$data,'status'=>'Open']);
        return response()->json(['data'=>$ticket],201);
    }

    public function customerProfile(Request $request): JsonResponse
    {
        $user=$request->user()->load(['customerProfile','addresses.location']);
        return response()->json(['data'=>$this->userPayload($user),'addresses'=>$user->addresses]);
    }

    public function updateCustomerProfile(Request $request): JsonResponse
    {
        $data=$request->validate(['name'=>['required','string','max:255'],'phone'=>['required','string','max:32']]);
        $request->user()->update($data);
        return response()->json(['data'=>$this->userPayload($request->user()->fresh('customerProfile'))]);
    }

    public function rewards(Request $request): JsonResponse
    {
        return response()->json(['points'=>$request->user()->customerProfile?->loyalty_points??0,'transactions'=>$request->user()->rewardTransactions()->latest()->get()]);
    }

    public function redeemRewards(Request $request): JsonResponse
    {
        $data=$request->validate(['points'=>['required','integer','min:50']]);
        $profile=$request->user()->customerProfile;
        if(!$profile || $profile->loyalty_points<$data['points']) throw ValidationException::withMessages(['points'=>'Insufficient loyalty points.']);
        $value=(int)floor($data['points']*2);
        $code='HIVE'.strtoupper(Str::random(8));
        DB::transaction(function()use($request,$profile,$data,$value,$code){
            $profile->decrement('loyalty_points',$data['points']);
            Coupon::create(['code'=>$code,'title'=>'Loyalty reward voucher','discount_type'=>'fixed','discount_value'=>$value,'min_order_amount'=>$value*2,'expires_at'=>now()->addMonths(3),'is_active'=>true]);
            RewardTransaction::create(['user_id'=>$request->user()->id,'points_delta'=>-$data['points'],'description'=>"Redeemed {$data['points']} points for {$code}"]);
        });
        return response()->json(['coupon_code'=>$code,'discount_value'=>$value]);
    }

    public function sellerDashboard(Request $request): JsonResponse
    {
        $seller=$request->user()->sellerProfile;
        abort_unless($seller,403);
        $earnings=$seller->earnings;
        return response()->json([
            'seller'=>['business_name'=>$seller->business_name,'verification_status'=>$seller->verification_status,'town'=>$seller->town],
            'metrics'=>[
                'total_products'=>$seller->products()->count(),
                'active_products'=>$seller->products()->where('stage_one_status','approved')->where('is_published',true)->count(),
                'pending_inspections'=>$seller->products()->whereIn('stage_one_status',['pending_inspection','inspection_scheduled','under_inspection'])->count(),
                'gross_sales'=>(float)$earnings->sum('gross_amount'),
                'net_earnings'=>(float)$earnings->sum('net_amount'),
                'pending_earnings'=>(float)$earnings->where('status','pending')->sum('net_amount'),
                'available_balance'=>(float)$earnings->where('status','available')->sum('net_amount'),
            ],
        ]);
    }

    public function sellerProducts(Request $request): JsonResponse
    {
        $seller=$request->user()->sellerProfile;
        abort_unless($seller,403);
        return response()->json(['data'=>$seller->products()->with(['category','subcategory','location','images','variations','inventories'])->latest()->get()->map(fn(Product $p)=>$this->sellerProductPayload($p))]);
    }

    public function createSellerProduct(Request $request): JsonResponse
    {
        $seller=$request->user()->sellerProfile;
        abort_unless($seller,403);
        $data=$request->validate([
            'name'=>['required','string','max:255'],'category_id'=>['required','exists:categories,id'],'subcategory_id'=>['required','exists:subcategories,id'],
            'location_id'=>['required','exists:locations,id'],'brand'=>['nullable','string','max:120'],'description'=>['required','string','max:10000'],
            'specifications'=>['nullable','array'],'condition'=>['required','in:New,Refurbished (Certified),Handcrafted'],
            'price'=>['required','numeric','min:50'],'original_price'=>['nullable','numeric','gt:price'],'town'=>['required','string','max:100'],
            'delivery_available'=>['required','boolean'],'collection_available'=>['required','boolean'],'warranty_info'=>['nullable','string','max:255'],
            'stock'=>['required','integer','min:0','max:100000'],'images'=>['nullable','array','max:4'],'images.*'=>['string'],
            'variations'=>['nullable','array','max:50'],'save_as_draft'=>['sometimes','boolean'],
        ]);
        abort_unless((int)DB::table('subcategories')->where('id',$data['subcategory_id'])->value('category_id')===(int)$data['category_id'],422);
        $product=DB::transaction(function()use($seller,$data){
            $product=Product::create([
                'seller_profile_id'=>$seller->id,'category_id'=>$data['category_id'],'subcategory_id'=>$data['subcategory_id'],'location_id'=>$data['location_id'],
                'sku'=>'BH-'.strtoupper(Str::random(8)),'name'=>$data['name'],'slug'=>Str::slug($data['name']).'-'.Str::lower(Str::random(5)),
                'brand'=>$data['brand']??null,'description'=>$data['description'],'specifications'=>$data['specifications']??[],
                'condition'=>$data['condition'],'price'=>$data['price'],'original_price'=>$data['original_price']??null,'town'=>$data['town'],
                'delivery_available'=>$data['delivery_available'],'collection_available'=>$data['collection_available'],'warranty_info'=>$data['warranty_info']??null,
                'stage_one_status'=>($data['save_as_draft']??false)?'draft':'pending_inspection','is_published'=>false,
            ]);
            $totalImageBytes = array_sum(array_map('strlen', $data['images'] ?? []));
            if ($totalImageBytes > 7 * 1024 * 1024) throw ValidationException::withMessages(['images' => 'Please upload product images with a combined size below 7 MB.']);
            foreach(($data['images']??[]) as $i=>$imageData) {
                if (!preg_match('/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+\/]+=*)$/', $imageData, $matches)) {
                    throw ValidationException::withMessages(['images' => 'Product images must be valid JPEG, PNG or WebP uploads.']);
                }
                $bytes = base64_decode($matches[2], true);
                if ($bytes === false || strlen($bytes) > 2 * 1024 * 1024) {
                    throw ValidationException::withMessages(['images' => 'Each product image must be smaller than 5 MB.']);
                }
                $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($bytes);
                $extension = match ($mime) { 'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', default => null };
                if (!$extension) throw ValidationException::withMessages(['images' => 'Unsupported product image format.']);
                $path = 'products/' . $seller->id . '/' . Str::uuid() . '.' . $extension;
                Storage::disk('public')->put($path, $bytes);
                $product->images()->create(['storage_path'=>$path,'sort_order'=>$i]);
            }
            $product->inventories()->create(['available_quantity'=>$data['stock'],'reserved_quantity'=>0]);
            foreach(($data['variations']??[]) as $v){
                $variation=$product->variations()->create(['label'=>$v['label'],'size'=>$v['size']??null,'colour'=>$v['colour']??null,'model'=>$v['model']??null,'price_delta'=>$v['price_delta']??0]);
                $product->inventories()->create(['product_variation_id'=>$variation->id,'available_quantity'=>$v['stock']??0,'reserved_quantity'=>0]);
            }
            return $product;
        });
        return response()->json(['data'=>$this->sellerProductPayload($product->load(['category','subcategory','location','images','variations','inventories']))],201);
    }

    public function updateSellerProduct(Request $request, Product $product): JsonResponse
    {
        abort_unless($product->seller_profile_id===$request->user()->sellerProfile?->id,404);
        $data=$request->validate(['is_paused'=>['sometimes','boolean'],'stock'=>['sometimes','integer','min:0','max:100000']]);
        if(array_key_exists('is_paused',$data)) $product->update(['is_paused'=>$data['is_paused']]);
        if(array_key_exists('stock',$data)) {
            $inventory=$product->inventories()->whereNull('product_variation_id')->first();
            if(!$inventory) $product->inventories()->create(['available_quantity'=>$data['stock'],'reserved_quantity'=>0]);
            else $inventory->update(['available_quantity'=>$data['stock']]);
        }
        return response()->json(['data'=>$this->sellerProductPayload($product->fresh(['category','subcategory','location','images','variations','inventories']))]);
    }

    public function resubmitSellerProduct(Request $request, Product $product): JsonResponse
    {
        abort_unless($product->seller_profile_id===$request->user()->sellerProfile?->id,404);
        abort_unless(in_array($product->stage_one_status,['rejected','correction_required'],true),409);
        $product->update(['stage_one_status'=>'pending_inspection','is_published'=>false]);
        return response()->json(['submitted'=>true]);
    }

    public function sellerOrders(Request $request): JsonResponse
    {
        $seller=$request->user()->sellerProfile;
        abort_unless($seller,403);
        $items=SellerOrderItem::where('seller_profile_id',$seller->id)->with(['order:id,order_number,payment_status,status,created_at','product:id,name,sku'])->latest()->get();
        return response()->json(['data'=>$items->map(fn($item)=>[
            'id'=>$item->id,'order_reference'=>$item->order->order_number,'payment_status'=>$item->order->payment_status,'order_status'=>$item->order->status,
            'order_date'=>$item->order->created_at?->toDateString(),'product_name'=>$item->product->name,'quantity'=>$item->quantity,
            'unit_price'=>(float)$item->unit_price,'line_total'=>(float)$item->line_total,'preparation_deadline'=>$item->preparation_deadline,
            'collection_status'=>$item->collection_status,'stage_two_status'=>$item->stage_two_status,
        ])]);
    }

    public function markSellerItemReady(Request $request, SellerOrderItem $item): JsonResponse
    {
        abort_unless($item->seller_profile_id===$request->user()->sellerProfile?->id,404);
        abort_unless($item->order->payment_status==='paid' && $item->stage_two_status==='awaiting_seller_prep',409);
        $item->update(['collection_status'=>'ready_for_pickup','stage_two_status'=>'collection_scheduled']);
        return response()->json(['updated'=>true]);
    }

    public function sellerEarnings(Request $request): JsonResponse
    {
        $seller=$request->user()->sellerProfile;
        abort_unless($seller,403);
        return response()->json(['data'=>$seller->earnings()->with('sellerOrderItem.order:id,order_number')->latest()->get()->map(fn($e)=>[
            'id'=>$e->id,'order_reference'=>$e->sellerOrderItem?->order?->order_number,'gross_amount'=>(float)$e->gross_amount,
            'commission_deduction'=>(float)$e->commission_deduction,'net_amount'=>(float)$e->net_amount,'status'=>$e->status,
        ])]);
    }

    public function requestPayout(Request $request): JsonResponse
    {
        $seller=$request->user()->sellerProfile;
        abort_unless($seller,403);
        $amount=(float)$seller->earnings()->where('status','available')->sum('net_amount');
        if($amount<=0) throw ValidationException::withMessages(['payout'=>'There is no cleared seller balance available.']);
        $account=DB::table('seller_payout_accounts')->where('seller_profile_id',$seller->id)->where('is_verified',true)->first();
        if(!$account) throw ValidationException::withMessages(['payout'=>'Add and verify a payout account before requesting a payout.']);
        return response()->json(['message'=>'Payout request requires finance-side processing. No funds have been transferred.','available_amount'=>$amount],202);
    }

    public function createSellerSupportTicket(Request $request): JsonResponse
    {
        return $this->createTicket($request);
    }

    public function markSellerMessageRead(Request $request, SellerMessage $message): JsonResponse
    {
        abort_unless($message->seller_profile_id===$request->user()->sellerProfile?->id,404);
        $message->update(['is_read'=>true]);
        return response()->json(['updated'=>true]);
    }

    private function cartFor(User $user): Cart
    {
        return Cart::firstOrCreate(['user_id'=>$user->id]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id'=>(string)$user->id,'name'=>$user->name,'email'=>$user->email,'phone'=>$user->phone,
            'role'=>$user->primary_role,'email_verified'=>(bool)$user->email_verified_at,
            'loyalty_points'=>(int)($user->customerProfile?->loyalty_points??0),
            'seller'=>$user->sellerProfile?[
                'business_name'=>$user->sellerProfile->business_name,'seller_type'=>$user->sellerProfile->seller_type,
                'verification_status'=>$user->sellerProfile->verification_status,'town'=>$user->sellerProfile->town,
                'location_id'=>$user->sellerProfile->location_id,
            ]:null,
        ];
    }

    private function orderPayload(Order $order): array
    {
        return [
            'id'=>(string)$order->id,'order_number'=>$order->order_number,'customer_id'=>(string)$order->user_id,
            'fulfilment_method'=>$order->fulfilment_method,'delivery_town'=>$order->delivery_town,
            'delivery_street'=>$order->delivery_street,'collection_hub_name'=>$order->collection_hub_name,
            // Collection codes are delivered through the configured customer notification channel, never returned by the API.
            'collection_code'=>null,'collection_confirmed'=>$order->collection_confirmed,'delivery_confirmed'=>$order->delivery_confirmed,
            'payment_method'=>$order->payment_method,'payment_status'=>$order->payment_status,'payment_reference'=>$order->paymentTransactions->first()?->transaction_reference,
            'subtotal'=>(float)$order->subtotal,'coupon_discount'=>(float)$order->coupon_discount,'delivery_fee'=>(float)$order->delivery_fee,'total_amount'=>(float)$order->total_amount,
            'status'=>$order->status,'feedback_submitted'=>$order->feedback_submitted,'created_at'=>$order->created_at?->toISOString(),
            'status_history'=>$order->statusHistories->map(fn($h)=>['status'=>$h->status,'label'=>$h->label,'note'=>$h->note,'timestamp'=>$h->created_at?->toISOString()]),
            'items'=>$order->sellerItems->map(fn($item)=>[
                'id'=>(string)$item->id,'product_id'=>(string)$item->product_id,'product_name'=>$item->product?->name,
                'product_image'=>$item->product?->images->first()?->storage_path,'quantity'=>$item->quantity,
                'unit_price'=>(float)$item->unit_price,'line_total'=>(float)$item->line_total,'stage_two_status'=>$item->stage_two_status,
            ]),
        ];
    }

    private function sellerProductPayload(Product $product): array
    {
        return [
            'id'=>(string)$product->id,'sku'=>$product->sku,'name'=>$product->name,'slug'=>$product->slug,
            'category_id'=>$product->category_id,'subcategory_id'=>$product->subcategory_id,'category'=>$product->category?->name,
            'brand'=>$product->brand,'description'=>$product->description,'specifications'=>$product->specifications ?? [],
            'condition'=>$product->condition,'town'=>$product->town,'location_id'=>$product->location_id,
            'delivery_available'=>$product->delivery_available,'collection_available'=>$product->collection_available,
            'warranty_info'=>$product->warranty_info,'price'=>(float)$product->price,
            'stock'=>(int)$product->inventories->whereNull('product_variation_id')->sum('available_quantity'),
            'stage_one_status'=>$product->stage_one_status,'is_published'=>$product->is_published,'is_paused'=>$product->is_paused,
            'images'=>$product->images->pluck('storage_path'),
        ];
    }
}
