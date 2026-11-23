import React from 'react';
import { Award, MapPin, ShieldCheck, Tag } from 'lucide-react';
import { formatKSh, useMarketplace } from '../context/MarketplaceContext';
import { CATEGORIES } from '../data/categories';
import { KENYAN_COUNTIES } from '../data/kenyaLocations';
import { OCCASIONS } from '../data/seedCatalog';
import { CustomerNavbar } from '../components/layout/CustomerNavbar';
import { Footer } from '../components/layout/Footer';
import { HorizontalCarousel } from '../components/common/HorizontalCarousel';
import { ProductCard } from '../components/products/ProductCard';
import { SafeImage } from '../components/common/SafeImage';

export const CustomerDashboard: React.FC = () => {
  const { customerUser, publicProducts, coupons, orders, navigate } = useMarketplace();

  const deals = publicProducts.filter((p) => p.originalPrice && p.originalPrice > p.price);
  const trending = [...publicProducts].sort((a, b) => b.viewsCount + b.salesCount * 4 - (a.viewsCount + a.salesCount * 4));
  const newArrivals = [...publicProducts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const bestSelling = [...publicProducts].sort((a, b) => b.salesCount - a.salesCount);
  const featured = publicProducts.filter((p) => p.isFeatured);

  const recentlyViewed = (customerUser?.recentlyViewedIds ?? [])
    .map((id) => publicProducts.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  // Personalized recommendations derived from viewed categories + purchase history
  const preferredCategories = new Set(recentlyViewed.map((p) => p.categoryId));
  const personalized = publicProducts.filter(
    (p) => preferredCategories.size === 0 || preferredCategories.has(p.categoryId)
  );

  const activeCoupons = coupons.filter((c) => c.status === 'active');
  const pendingFeedbackOrder = orders.find(
    (o) =>
      o.customerId === customerUser?.id &&
      !o.feedbackSubmitted &&
      ((o.fulfilmentMethod === 'delivery' && o.deliveryConfirmed) ||
        (o.fulfilmentMethod === 'store_collection' && o.collectionConfirmed))
  );

  const featuredCounties = KENYAN_COUNTIES.filter((c) =>
    ['nairobi', 'mombasa', 'kisumu', 'nakuru', 'kiambu', 'uasin-gishu', 'machakos', 'nyeri', 'kajiado', 'kilifi'].includes(c.slug)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
      <CustomerNavbar />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* Welcome Header & Rewards Strip */}
        <section className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticated Shopping Dashboard · Every Listing Stage-1 Inspected</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#141619]">
              Welcome back, {customerUser?.fullName ?? 'Shopper'}
            </h1>
            <p className="text-sm text-stone-600">
              Explore inspected products across 17 categories and 47 Kenyan counties. Private seller details are protected on every order.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/coupons-rewards')}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-200 bg-[#FAF9F6] hover:border-amber-700 transition-colors text-left cursor-pointer"
            >
              <Award className="w-5 h-5 text-amber-800 shrink-0" />
              <div>
                <div className="font-mono text-sm font-semibold text-[#141619] tabular-nums">
                  {customerUser?.loyaltyPoints ?? 0} pts
                </div>
                <div className="text-xs text-stone-500">{activeCoupons.length} active coupons</div>
              </div>
            </button>

            {pendingFeedbackOrder && (
              <button
                type="button"
                onClick={() => navigate('/feedback')}
                className="px-4 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold cursor-pointer"
              >
                Leave Feedback for {pendingFeedbackOrder.orderNumber}
              </button>
            )}
          </div>
        </section>

        {/* 6 PROMINENT HORIZONTAL CAROUSELS NEAR THE TOP */}
        {/* 1. Shop by Category */}
        <HorizontalCarousel
          title="1. Shop by Category"
          subtitle="All 17 verified marketplace categories."
          viewAllLabel="All 17 Categories"
          onViewAll={() => navigate('/categories')}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => navigate(`/categories/${cat.slug}`)}
              className="snap-start shrink-0 w-52 bg-white border border-stone-200 rounded-xl overflow-hidden text-left hover:border-amber-700 transition-all cursor-pointer"
            >
              <div className="aspect-[4/3] bg-stone-100">
                <SafeImage src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <div className="font-display text-sm font-semibold text-[#141619] line-clamp-1">{cat.name}</div>
                <div className="text-xs text-stone-500 mt-0.5 tabular-nums">{cat.subcategories.length} subcategories</div>
              </div>
            </button>
          ))}
        </HorizontalCarousel>

        {/* 2. Deals and Offers */}
        <HorizontalCarousel
          title="2. Deals and Offers"
          subtitle="Backend-validated promotional markdowns and limited-time offers."
          viewAllLabel="All Deals"
          onViewAll={() => navigate('/deals')}
        >
          {deals.map((product) => (
            <div key={product.id} className="snap-start shrink-0 w-64 sm:w-72">
              <ProductCard product={product} />
            </div>
          ))}
        </HorizontalCarousel>

        {/* 3. Shop by Occasion */}
        <HorizontalCarousel
          title="3. Shop by Occasion"
          subtitle="Birthdays, weddings, graduations, housewarming, and corporate gifting."
          viewAllLabel="All Occasions"
          onViewAll={() => navigate('/occasions')}
        >
          {OCCASIONS.map((occ) => (
            <button
              key={occ.id}
              type="button"
              onClick={() => navigate(`/occasions?occasion=${occ.slug}`)}
              className="snap-start shrink-0 w-52 bg-white border border-stone-200 rounded-xl overflow-hidden text-left hover:border-amber-700 transition-all cursor-pointer"
            >
              <div className="aspect-[4/3] bg-stone-100">
                <SafeImage src={occ.image} alt={occ.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <div className="font-display text-sm font-semibold text-[#141619]">{occ.name}</div>
                <div className="text-xs text-stone-500 mt-0.5 line-clamp-1">{occ.description}</div>
              </div>
            </button>
          ))}
        </HorizontalCarousel>

        {/* 4. Shop by Location */}
        <HorizontalCarousel
          title="4. Shop by Location"
          subtitle="Discover inspected stock across all 47 Kenyan counties and collection hubs."
          viewAllLabel="All 47 Counties"
          onViewAll={() => navigate('/locations')}
        >
          {featuredCounties.map((county) => {
            const count = publicProducts.filter((p) => p.countySlug === county.slug).length;
            return (
              <button
                key={county.code}
                type="button"
                onClick={() => navigate(`/locations?county=${county.slug}`)}
                className="snap-start shrink-0 w-56 bg-white border border-stone-200 rounded-xl p-4 text-left hover:border-amber-700 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <MapPin className="w-4 h-4 text-amber-800" />
                  <span className="font-mono text-xs text-stone-400">#{String(county.code).padStart(2, '0')}</span>
                </div>
                <div className="font-display text-base font-bold text-[#141619]">{county.name}</div>
                <div className="text-xs text-stone-500 line-clamp-1">{county.majorTowns.join(', ')}</div>
                <div className="text-xs font-medium text-emerald-700 pt-1">
                  {county.hasCollectionHub ? 'BuyHive Hub Available' : 'County Delivery Ready'} · {count} items
                </div>
              </button>
            );
          })}
        </HorizontalCarousel>

        {/* 5. Trending */}
        <HorizontalCarousel
          title="5. Trending"
          subtitle="Products receiving strong buyer views and verified orders."
          viewAllLabel="Trending Page"
          onViewAll={() => navigate('/trending')}
        >
          {trending.map((product) => (
            <div key={product.id} className="snap-start shrink-0 w-64 sm:w-72">
              <ProductCard product={product} />
            </div>
          ))}
        </HorizontalCarousel>

        {/* 6. New Arrivals */}
        <HorizontalCarousel
          title="6. New Arrivals"
          subtitle="Recently Stage-1 inspected and newly published listings."
          viewAllLabel="New Arrivals"
          onViewAll={() => navigate('/new-arrivals')}
        >
          {newArrivals.map((product) => (
            <div key={product.id} className="snap-start shrink-0 w-64 sm:w-72">
              <ProductCard product={product} />
            </div>
          ))}
        </HorizontalCarousel>

        {/* Additional Dashboard Sections Below Main Carousels */}
        {recentlyViewed.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-stone-200">
            <h2 className="font-display text-xl font-bold text-[#141619]">Recently Viewed Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentlyViewed.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4 pt-4 border-t border-stone-200">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-[#141619]">Recommended & Personalized For You</h2>
              <p className="text-sm text-stone-600">Curated from your browsing categories and verified marketplace performance.</p>
            </div>
            <button type="button" onClick={() => navigate('/shop')} className="text-xs font-semibold text-amber-800 cursor-pointer">
              Explore all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {personalized.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-stone-200">
          <div className="lg:col-span-8 space-y-4">
            <h2 className="font-display text-xl font-bold text-[#141619]">Best-Selling & Featured Selections</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {(featured.length > 0 ? featured : bestSelling).slice(0, 2).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-6 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                <Tag className="w-4 h-4" />
                <span>Customer Rewards Preview</span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#141619]">Available Coupons & Loyalty</h3>
              <div className="space-y-2.5">
                {activeCoupons.slice(0, 3).map((c) => (
                  <div key={c.code} className="p-3 rounded-lg bg-[#FAF9F6] border border-stone-200 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-mono text-xs font-semibold text-[#141619]">{c.code}</div>
                      <div className="text-xs text-stone-500 line-clamp-1">{c.title}</div>
                    </div>
                    <span className="font-mono text-xs font-semibold text-amber-800 shrink-0">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : formatKSh(c.discountValue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/coupons-rewards')}
              className="w-full py-2.5 rounded-lg bg-[#141619] text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer"
            >
              Manage Coupons & Redeem Points
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
