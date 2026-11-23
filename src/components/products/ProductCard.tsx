import React from 'react';
import { Heart, ShieldCheck, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../../types/buyhive';
import { formatKSh, useMarketplace } from '../../context/MarketplaceContext';
import { KENYAN_COUNTIES } from '../../data/kenyaLocations';
import { SafeImage } from '../common/SafeImage';

interface ProductCardProps {
  product: Product;
  hideQuickCart?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, hideQuickCart = false }) => {
  const { customerUser, toggleWishlist, addToCart, navigate } = useMarketplace();
  const isWishlisted = customerUser?.wishlistIds.includes(product.id) ?? false;
  const county = KENYAN_COUNTIES.find((c) => c.slug === product.countySlug);
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <article className="group bg-white border border-stone-200/90 rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        onClick={() => navigate(`/products/${product.id}`)}
        className="relative aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer"
      >
        <SafeImage
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full border transition-colors cursor-pointer ${
            isWishlisted
              ? 'bg-[#141619] border-[#141619] text-white'
              : 'bg-white/95 border-stone-200 text-stone-600 hover:text-[#141619]'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          {/* Clean unboxed metadata (Zero-Pill discipline) */}
          <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-xs text-stone-500">
            <span className="font-medium text-stone-700">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{county ? county.name : product.town}</span>
            {discountPercent > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-amber-800">{discountPercent}% off</span>
              </>
            )}
          </div>

          <h3
            onClick={() => navigate(`/products/${product.id}`)}
            className="font-display text-[15px] font-semibold text-[#141619] leading-snug line-clamp-2 cursor-pointer hover:text-amber-800 transition-colors"
          >
            {product.name}
          </h3>

          <div className="flex items-center gap-2 text-xs text-stone-500 pt-0.5">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              BuyHive Inspected
            </span>
            {product.ratingCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-stone-700 tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {product.ratingAverage.toFixed(1)} ({product.ratingCount})
                </span>
              </>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <div className="font-mono text-base font-semibold text-[#141619] tabular-nums">
              {formatKSh(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="font-mono text-xs text-stone-400 line-through tabular-nums">
                {formatKSh(product.originalPrice)}
              </div>
            )}
          </div>

          {!hideQuickCart ? (
            <button
              type="button"
              disabled={product.stock < 1}
              onClick={() => addToCart(product.id, product.variations[0]?.id, 1)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#141619] text-white hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-500 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {product.stock > 0 ? 'Add' : 'Out'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/products/${product.id}`)}
              className="px-3 py-2 rounded-lg text-xs font-semibold border border-stone-200 text-[#141619] hover:bg-stone-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              View
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
