<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Location;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MarketplaceController extends Controller
{
    public function landing(): Response
    {
        $products = Product::query()
            ->publiclyListable()
            ->with(['category', 'location', 'images'])
            ->latest()
            ->get()
            ->map(fn (Product $p) => $this->toCustomerSafeProduct($p));

        return Inertia::render('Landing', [
            'featuredProducts' => $products->where('is_featured', true)->values(),
            'bestSelling' => $products->sortByDesc('sales_count')->take(8)->values(),
            'deals' => $products->filter(fn ($p) => $p['original_price'] && $p['original_price'] > $p['price'])->values(),
            'occasions' => \Illuminate\Support\Facades\DB::table('occasions')->where('is_active', true)->get(),
            'counties' => Location::orderBy('county_code')->take(10)->get(),
            'trending' => $products->sortByDesc(fn ($p) => $p['views_count'] + ($p['sales_count'] * 4))->take(8)->values(),
            'newArrivals' => $products->sortByDesc('created_at')->take(8)->values(),
            'categories' => Category::with('subcategories')->orderBy('sort_order')->get(),
            'stats' => [
                'inspected_listings' => Product::publiclyListable()->count(),
                'categories_count' => Category::where('is_active', true)->count(),
                'counties_count' => Location::count(),
            ],
        ]);
    }

    public function dashboard(Request $request): Response
    {
        $products = Product::query()
            ->publiclyListable()
            ->with(['category', 'location', 'images'])
            ->get()
            ->map(fn (Product $p) => $this->toCustomerSafeProduct($p));

        return Inertia::render('Customer/Dashboard', [
            'categories' => Category::with('subcategories')->orderBy('sort_order')->get(),
            'occasions' => \Illuminate\Support\Facades\DB::table('occasions')->where('is_active', true)->get(),
            'counties' => Location::orderBy('county_code')->take(10)->get(),
            'deals' => $products->filter(fn ($p) => $p['original_price'] && $p['original_price'] > $p['price'])->values(),
            'trending' => $products->sortByDesc(fn ($p) => $p['views_count'] + ($p['sales_count'] * 4))->values(),
            'newArrivals' => $products->sortByDesc('created_at')->values(),
        ]);
    }

    /**
     * Strict Seller Identity Privacy projection:
     * Exposes public manufacturer brand and county fulfilment hub ONLY — never seller name, phone, email, or home address.
     */
    protected function toCustomerSafeProduct(Product $product): array
    {
        return [
            'id' => $product->id,
            'sku' => $product->sku,
            'name' => $product->name,
            'slug' => $product->slug,
            'brand' => $product->brand,
            'price' => (float) $product->price,
            'original_price' => $product->original_price ? (float) $product->original_price : null,
            'condition' => $product->condition,
            'county_name' => $product->location?->county_name,
            'town' => $product->town,
            'inspection_badge' => 'BuyHive Inspected Product',
            'seller_label' => 'BuyHive Verified Seller',
            'is_featured' => $product->is_featured,
            'views_count' => $product->views_count,
            'sales_count' => $product->sales_count,
            'created_at' => $product->created_at?->toDateString(),
            'images' => $product->images->pluck('storage_path')->all(),
        ];
    }
}
