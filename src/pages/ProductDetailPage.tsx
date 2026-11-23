import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { formatKSh, useMarketplace } from '../context/MarketplaceContext';
import { CATEGORIES } from '../data/categories';
import { KENYAN_COUNTIES } from '../data/kenyaLocations';
import { CustomerNavbar } from '../components/layout/CustomerNavbar';
import { Footer } from '../components/layout/Footer';
import { SafeImage } from '../components/common/SafeImage';
import { ProductCard } from '../components/products/ProductCard';

export const ProductDetailPage: React.FC<{ productId: string }> = ({ productId }) => {
  const {
    publicProducts,
    reviews,
    customerUser,
    recordProductView,
    toggleWishlist,
    addToCart,
    navigate,
  } = useMarketplace();

  const product = publicProducts.find((p) => p.id === productId);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVarId, setSelectedVarId] = useState(product?.variations[0]?.id ?? '');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product) {
      recordProductView(product.id);
      setSelectedVarId(product.variations[0]?.id ?? '');
      setSelectedImageIdx(0);
      setQty(1);
    }
  }, [productId]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <CustomerNavbar />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold text-[#141619]">Product Not Found or Pending Inspection</h1>
          <p className="text-sm text-stone-600">
            This listing may have been paused or has not completed BuyHive’s Stage-1 physical inspection.
          </p>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="px-5 py-2.5 rounded-lg bg-[#141619] text-white text-sm font-semibold cursor-pointer"
          >
            Browse Inspected Products
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.id === product.categoryId);
  const subcategory = category?.subcategories.find((s) => s.id === product.subcategoryId);
  const county = KENYAN_COUNTIES.find((c) => c.slug === product.countySlug);
  const selectedVar = product.variations.find((v) => v.id === selectedVarId) ?? product.variations[0];
  const effectivePrice = product.price + (selectedVar?.priceDelta ?? 0);
  const effectiveStock = selectedVar ? selectedVar.stock : product.stock;
  const isWishlisted = customerUser?.wishlistIds.includes(product.id) ?? false;
  const productReviews = reviews.filter((r) => r.productId === product.id);
  const related = publicProducts.filter((p) => p.id !== product.id && p.categoryId === product.categoryId).slice(0, 4);
  const stageOneRecord = product.inspectionHistory.find((i) => i.stage === 1 && i.outcome === 'approved');

  const handleBuyNow = () => {
    addToCart(product.id, selectedVar?.id, qty);
    navigate(customerUser ? '/checkout' : '/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
      <CustomerNavbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
          <button type="button" onClick={() => navigate('/shop')} className="inline-flex items-center gap-1 hover:text-[#141619] cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" />
            Shop
          </button>
          <span>/</span>
          {category && (
            <>
              <button type="button" onClick={() => navigate(`/categories/${category.slug}`)} className="hover:text-[#141619] cursor-pointer">
                {category.name}
              </button>
              <span>/</span>
            </>
          )}
          {subcategory && <span>{subcategory.name}</span>}
        </div>

        {/* Contiguous Purchase Module */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sticky Gallery */}
          <div className="lg:col-span-6 space-y-3 lg:sticky lg:top-24">
            <div className="aspect-[4/3] bg-white border border-stone-200 rounded-2xl overflow-hidden">
              <SafeImage src={product.images[selectedImageIdx] || product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setSelectedImageIdx(i)}
                    className={`w-20 aspect-[4/3] rounded-lg overflow-hidden border cursor-pointer ${
                      selectedImageIdx === i ? 'border-amber-700 ring-1 ring-amber-700' : 'border-stone-200'
                    }`}
                  >
                    <SafeImage src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Purchase Details */}
          <div className="lg:col-span-6 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center flex-wrap gap-2 text-xs text-stone-500">
                <span className="font-semibold text-[#141619]">{product.brand}</span>
                <span aria-hidden="true">·</span>
                <span>SKU {product.sku}</span>
                <span aria-hidden="true">·</span>
                <span>{product.condition}</span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#141619] leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center flex-wrap gap-3 text-xs pt-1">
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                  BuyHive Verified Seller · Stage-1 Inspected
                </span>
                {product.ratingCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-stone-700 tabular-nums">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    {product.ratingAverage.toFixed(1)} ({product.ratingCount} verified reviews)
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-baseline gap-3">
              <span className="font-mono text-3xl font-bold text-[#141619] tabular-nums">
                {formatKSh(effectivePrice)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="font-mono text-sm text-stone-400 line-through tabular-nums">
                  {formatKSh(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-sm text-stone-600 leading-relaxed">{product.description}</p>

            {/* Variations */}
            {product.variations.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">Select Option / Variation</label>
                <div className="flex flex-wrap gap-2">
                  {product.variations.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVarId(v.id)}
                      className={`px-3.5 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                        selectedVar?.id === v.id
                          ? 'bg-[#141619] text-white border-[#141619]'
                          : 'bg-[#FAF9F6] border-stone-200 text-stone-700 hover:border-amber-700'
                      }`}
                    >
                      {v.label} {v.priceDelta !== 0 ? `(${v.priceDelta > 0 ? '+' : ''}${formatKSh(v.priceDelta)})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fulfilment & Privacy-Safe Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FAF9F6] border border-stone-200 rounded-xl p-4">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#141619]">Fulfilment County</div>
                  <div className="text-stone-600">
                    {county?.name ?? product.town} ({product.town})
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#141619] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#141619]">Delivery & Collection</div>
                  <div className="text-stone-600">
                    {product.deliveryAvailable ? 'Doorstep Delivery' : ''}{product.deliveryAvailable && product.collectionAvailable ? ' · ' : ''}{product.collectionAvailable ? 'Hub Collection' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity & CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700">Quantity</span>
                <span className={`font-mono font-medium ${effectiveStock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {effectiveStock > 0 ? `${effectiveStock} units available` : 'Out of stock'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center border border-stone-200 rounded-lg bg-[#FAF9F6]">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-11 text-base font-semibold hover:bg-stone-100 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono text-sm font-semibold tabular-nums">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(Math.max(1, effectiveStock), q + 1))}
                    className="w-10 h-11 text-base font-semibold hover:bg-stone-100 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  disabled={effectiveStock < 1}
                  onClick={() => addToCart(product.id, selectedVar?.id, qty)}
                  className="flex-1 min-w-[150px] h-11 px-5 rounded-lg bg-[#141619] hover:bg-stone-800 disabled:bg-stone-300 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>

                <button
                  type="button"
                  disabled={effectiveStock < 1}
                  onClick={handleBuyNow}
                  className="h-11 px-5 rounded-lg bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white text-sm font-semibold cursor-pointer"
                >
                  Buy Now
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Toggle Wishlist"
                  className={`w-11 h-11 rounded-lg border flex items-center justify-center cursor-pointer ${
                    isWishlisted ? 'bg-[#141619] text-white border-[#141619]' : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {product.warrantyInfo && (
              <div className="text-xs text-stone-600 pt-2 border-t border-stone-100">
                Warranty: <span className="font-semibold text-[#141619]">{product.warrantyInfo}</span>
              </div>
            )}
          </div>
        </section>

        {/* Specifications & Stage-1 Inspection Certificate */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-[#141619]">Product Specifications</h2>
            <dl className="divide-y divide-stone-100 text-sm">
              {Object.entries(product.specifications).map(([k, v]) => (
                <div key={k} className="py-2.5 flex justify-between gap-4">
                  <dt className="text-stone-500">{k}</dt>
                  <dd className="font-medium text-[#141619] text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-6 bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#141619]">BuyHive Inspection Verification</h2>
              <span className="text-xs font-semibold text-emerald-700">Stage-1 Passed</span>
            </div>
            {stageOneRecord ? (
              <div className="space-y-3 text-sm">
                <p className="text-stone-600">{stageOneRecord.findings}</p>
                <div className="text-xs font-mono text-stone-500">
                  Inspector Ref: {stageOneRecord.inspectorRef} · {stageOneRecord.inspectedAt.slice(0, 10)}
                </div>
                <ul className="space-y-2 pt-2">
                  {stageOneRecord.checklist.map((c) => (
                    <li key={c.criterion} className="flex items-center gap-2 text-xs text-stone-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{c.criterion}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-stone-500 pt-2 border-t border-stone-100">
                  Stage-2 pre-dispatch physical inspection will be executed automatically after you place an order and before courier dispatch.
                </p>
              </div>
            ) : (
              <p className="text-sm text-stone-600">Passed Stage-1 pre-listing verification.</p>
            )}
          </div>
        </section>

        {/* Verified Reviews */}
        <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#141619]">
            Verified Buyer Reviews ({productReviews.length})
          </h2>
          {productReviews.length === 0 ? (
            <p className="text-sm text-stone-500">
              No reviews yet. Only customers with confirmed delivery or collection receipt can submit a review.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productReviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#141619]">{rev.reviewerAlias}</span>
                    <span className="font-mono text-amber-800">{rev.rating}/5 Stars</span>
                  </div>
                  <p className="text-sm text-stone-700">{rev.comment}</p>
                  <div className="text-[11px] text-stone-400">{rev.createdAt}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-[#141619]">Related Inspected Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};
