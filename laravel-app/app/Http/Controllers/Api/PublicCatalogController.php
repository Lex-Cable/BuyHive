<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class PublicCatalogController extends Controller
{
    /**
     * Return only listings that have passed Stage-1 inspection and belong to
     * approved sellers. Seller identity and private fulfilment data are omitted.
     */
    public function index(): JsonResponse
    {
        $products = Product::query()
            ->publiclyListable()
            ->with([
                'category.subcategories',
                'subcategory',
                'location',
                'images',
                'variations',
                'inventories',
                'occasions',
                'reviews',
            ])
            ->latest()
            ->get()
            ->map(fn (Product $product) => $this->toStorefrontProduct($product))
            ->values();

        return response()->json(['data' => $products]);
    }

    private function toStorefrontProduct(Product $product): array
    {
        $categoryPosition = (int) ($product->category?->sort_order ?? 0);
        $subcategoryPosition = $product->category?->subcategories
            ->sortBy('id')
            ->values()
            ->search(fn ($subcategory) => $subcategory->is($product->subcategory));

        $stockForVariation = fn (?int $variationId): int => max(
            0,
            (int) $product->inventories
                ->where('product_variation_id', $variationId)
                ->sum(fn ($inventory) => $inventory->available_quantity - $inventory->reserved_quantity)
        );

        return [
            'id' => (string) $product->id,
            'sku' => $product->sku,
            // Non-identifying marker; actual seller IDs are never exposed.
            'sellerId' => '__server-approved__',
            'name' => $product->name,
            'slug' => $product->slug,
            'categoryId' => 'cat-' . $categoryPosition,
            'subcategoryId' => 'sub-' . $categoryPosition . '-' . ((int) $subcategoryPosition + 1),
            'brand' => $product->brand ?? '',
            'description' => $product->description,
            'specifications' => $product->specifications ?? [],
            'condition' => $product->condition,
            'images' => $product->images
                ->map(fn ($image) => str_starts_with($image->storage_path, 'http')
                    ? $image->storage_path
                    : Storage::url($image->storage_path))
                ->values()
                ->all(),
            'price' => (float) $product->price,
            'originalPrice' => $product->original_price !== null ? (float) $product->original_price : null,
            'dealExpiresAt' => $product->deal_expires_at?->toISOString(),
            'stock' => $stockForVariation(null),
            'countySlug' => $product->location?->slug ?? '',
            'town' => $product->town,
            'deliveryAvailable' => (bool) $product->delivery_available,
            'collectionAvailable' => (bool) $product->collection_available,
            'warrantyInfo' => $product->warranty_info,
            'variations' => $product->variations->map(fn ($variation) => [
                'id' => (string) $variation->id,
                'label' => $variation->label,
                'size' => $variation->size,
                'colour' => $variation->colour,
                'model' => $variation->model,
                'priceDelta' => (float) $variation->price_delta,
                'stock' => $stockForVariation((int) $variation->id),
            ])->values()->all(),
            'occasionSlugs' => $product->occasions->pluck('slug')->values()->all(),
            'stageOneStatus' => 'approved',
            'isPublished' => true,
            'isPaused' => false,
            'isFeatured' => (bool) $product->is_featured,
            'viewsCount' => (int) $product->views_count,
            'salesCount' => (int) $product->sales_count,
            'ratingAverage' => (float) ($product->reviews->avg('rating') ?? 0),
            'ratingCount' => $product->reviews->count(),
            'createdAt' => $product->created_at?->toISOString() ?? now()->toISOString(),
            // Inspection records are intentionally not exposed in the public catalogue.
            'inspectionHistory' => [],
        ];
    }
}
