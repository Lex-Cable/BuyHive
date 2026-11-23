<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\SellerEarning;
use App\Models\SellerOrderItem;
use App\Services\CommissionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SellerPortalController extends Controller
{
    public function __construct(
        protected CommissionService $commissionService,
    ) {}

    public function dashboard(Request $request): Response
    {
        $seller = $request->user()->sellerProfile;
        $earnings = SellerEarning::where('seller_profile_id', $seller->id)->get();

        return Inertia::render('Seller/Dashboard', [
            'seller' => [
                'business_name' => $seller->business_name,
                'verification_status' => $seller->verification_status,
            ],
            'metrics' => [
                'total_products' => $seller->products()->count(),
                'active_products' => $seller->products()->where('stage_one_status', 'approved')->where('is_published', true)->count(),
                'pending_inspections' => $seller->products()->whereIn('stage_one_status', ['pending_inspection', 'inspection_scheduled'])->count(),
                'gross_sales' => (float) $earnings->sum('gross_amount'),
                'net_earnings' => (float) $earnings->sum('net_amount'),
                'pending_earnings' => (float) $earnings->where('status', 'pending')->sum('net_amount'),
                'available_balance' => (float) $earnings->where('status', 'available')->sum('net_amount'),
            ],
        ]);
    }

    public function createProduct(Request $request): Response
    {
        $seller = $request->user()->sellerProfile;
        return Inertia::render('Seller/CreateProduct', [
            'categories' => Category::with('subcategories')->orderBy('sort_order')->get(),
            'commissionRate' => (float) ($seller->custom_commission_rate ?? config('buyhive.default_commission_rate')),
        ]);
    }

    public function storeProduct(Request $request): RedirectResponse
    {
        $seller = $request->user()->sellerProfile;
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'subcategory_id' => ['required', 'exists:subcategories,id'],
            'location_id' => ['required', 'exists:locations,id'],
            'brand' => ['nullable', 'string', 'max:120'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:50'],
            'town' => ['required', 'string', 'max:100'],
            'save_as_draft' => ['boolean'],
        ]);

        Product::create([
            ...$validated,
            'seller_profile_id' => $seller->id,
            'sku' => 'BH-' . strtoupper(Str::random(7)),
            'slug' => Str::slug($validated['name']) . '-' . strtolower(Str::random(4)),
            // NEVER allow bypassing Stage-1 Inspection & Seller Approval
            'stage_one_status' => !empty($validated['save_as_draft']) ? 'draft' : 'pending_inspection',
            'is_published' => false,
        ]);

        return redirect()->route('seller.products.index')->with('success', 'Product submitted for Stage-1 physical inspection.');
    }

    /**
     * Anonymized Seller Order view: NEVER includes customer name, email, phone, or delivery address.
     */
    public function orders(Request $request): Response
    {
        $seller = $request->user()->sellerProfile;
        $items = SellerOrderItem::query()
            ->where('seller_profile_id', $seller->id)
            ->with(['order:id,order_number,payment_status,created_at', 'product:id,name,sku'])
            ->latest()
            ->get()
            ->map(fn (SellerOrderItem $item) => [
                'id' => $item->id,
                'order_reference' => $item->order->order_number,
                'payment_status' => $item->order->payment_status,
                'order_date' => $item->order->created_at?->toDateString(),
                'product_name' => $item->product->name,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'preparation_deadline' => $item->preparation_deadline?->toDateTimeString(),
                'fulfilment_instructions' => $item->fulfilment_instructions,
                'collection_status' => $item->collection_status,
                'stage_two_status' => $item->stage_two_status,
            ]);

        return Inertia::render('Seller/Orders', ['orders' => $items]);
    }

    /**
     * Separate Sales Page (Gross volume & units).
     */
    public function sales(Request $request): Response
    {
        $seller = $request->user()->sellerProfile;
        $items = SellerOrderItem::where('seller_profile_id', $seller->id)->with(['order:id,order_number,status,created_at', 'product:id,name'])->get();
        return Inertia::render('Seller/Sales', ['salesItems' => $items]);
    }

    /**
     * Separate Earnings Page (Gross minus configurable BuyHive commission & adjustments).
     */
    public function earnings(Request $request): Response
    {
        $seller = $request->user()->sellerProfile;
        $ledger = SellerEarning::where('seller_profile_id', $seller->id)
            ->with('sellerOrderItem.order:id,order_number')
            ->latest()
            ->get();
        return Inertia::render('Seller/Earnings', ['earningsLedger' => $ledger]);
    }
}
