import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Lock,
  MapPin,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CATEGORIES, IMG_HERO } from '../data/categories';
import { KENYAN_COUNTIES } from '../data/kenyaLocations';
import { MARKETPLACE_FAQS, OCCASIONS } from '../data/seedCatalog';
import { CustomerNavbar } from '../components/layout/CustomerNavbar';
import { Footer } from '../components/layout/Footer';
import { SafeImage } from '../components/common/SafeImage';
import { ProductCard } from '../components/products/ProductCard';
import { HorizontalCarousel } from '../components/common/HorizontalCarousel';

export const LandingPage: React.FC = () => {
  const { publicProducts, reviews, navigate } = useMarketplace();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const featuredProducts = publicProducts.filter((p) => p.isFeatured);
  const bestSelling = [...publicProducts].sort((a, b) => b.salesCount - a.salesCount).slice(0, 6);
  const deals = publicProducts.filter((p) => p.originalPrice && p.originalPrice > p.price);
  const trending = [...publicProducts].sort((a, b) => b.viewsCount + b.salesCount * 4 - (a.viewsCount + a.salesCount * 4));
  const newArrivals = [...publicProducts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Genuine platform facts computed strictly from database state (no fabricated totals)
  const totalSalesUnits = publicProducts.reduce((acc, p) => acc + p.salesCount, 0);

  const featuredCounties = KENYAN_COUNTIES.filter((c) =>
    ['nairobi', 'mombasa', 'kisumu', 'nakuru', 'kiambu', 'uasin-gishu', 'machakos', 'nyeri', 'kajiado', 'kilifi'].includes(c.slug)
  );

  const steps = [
    { num: '01', title: 'Discover products', text: 'Browse inspected listings across 17 categories and 47 counties.' },
    { num: '02', title: 'Select products', text: 'Choose verified variations, delivery or hub collection.' },
    { num: '03', title: 'Checkout & pay', text: 'Pay securely with M-Pesa, card, PayPal, or bank methods.' },
    { num: '04', title: 'Collection & Stage-2 check', text: 'BuyHive collects from the seller and inspects before dispatch.' },
    { num: '05', title: 'Delivery or hub pickup', text: 'Track progress to your doorstep or verified collection hub.' },
    { num: '06', title: 'Confirm receipt', text: 'Confirm delivery or scan your secure hub collection code.' },
    { num: '07', title: 'Share verified feedback', text: 'Review product condition and BuyHive service after receipt.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
      <CustomerNavbar isLanding />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-8 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white border border-stone-200/90 rounded-2xl overflow-hidden">
            <div className="lg:col-span-6 p-7 sm:p-10 lg:p-12 flex flex-col justify-between gap-8">
              <div className="space-y-5">
                <p className="text-xs font-semibold tracking-wide text-amber-800">
                  Two-Stage Inspected Multi-Vendor Marketplace
                </p>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-[#141619] leading-[1.12] [text-wrap:balance]">
                  Shop verified independent sellers with physical inspection before every dispatch.
                </h1>
                <p className="text-base text-stone-600 leading-relaxed max-w-xl">
                  BuyHive connects you directly to vetted retailers, manufacturers, and artisans across Kenya without risking counterfeit or mismatched deliveries.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/shop')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#141619] text-white text-sm font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/categories')}
                    className="px-6 py-3 rounded-lg border border-stone-300 bg-white text-[#141619] text-sm font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    Explore Categories
                  </button>
                </div>

                <div className="pt-5 border-t border-stone-100 grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="font-mono text-lg font-semibold text-[#141619] tabular-nums">
                      {publicProducts.length}
                    </div>
                    <div className="text-stone-500">Inspected Listings</div>
                  </div>
                  <div>
                    <div className="font-mono text-lg font-semibold text-[#141619] tabular-nums">
                      {CATEGORIES.length}
                    </div>
                    <div className="text-stone-500">Approved Categories</div>
                  </div>
                  <div>
                    <div className="font-mono text-lg font-semibold text-[#141619] tabular-nums">
                      {KENYAN_COUNTIES.length}
                    </div>
                    <div className="text-stone-500">Counties Covered</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 min-h-[280px] lg:min-h-[460px] bg-stone-100">
              <SafeImage
                src={IMG_HERO}
                alt="Curated consumer goods inspected by BuyHive"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Featured Products Carousel */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
          <HorizontalCarousel
            title="Featured Products"
            subtitle="Stage-1 physically verified items across electronics, craft, home, and solar."
            viewAllLabel="View All Featured"
            onViewAll={() => navigate('/shop?featured=1')}
          >
            {featuredProducts.map((product) => (
              <div key={product.id} className="snap-start shrink-0 w-64 sm:w-72">
                <ProductCard product={product} hideQuickCart />
              </div>
            ))}
          </HorizontalCarousel>
        </section>

        {/* Shop by Category */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
          <HorizontalCarousel
            title="Shop by Category"
            subtitle="All 17 BuyHive approved categories with structured subcategories."
            viewAllLabel="All 17 Categories"
            onViewAll={() => navigate('/categories')}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate(`/categories/${cat.slug}`)}
                className="snap-start shrink-0 w-56 bg-white border border-stone-200 rounded-xl overflow-hidden text-left hover:border-amber-700/60 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="aspect-[4/3] bg-stone-100">
                  <SafeImage src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3.5">
                  <div className="font-display text-sm font-semibold text-[#141619] line-clamp-1">{cat.name}</div>
                  <div className="text-xs text-stone-500 mt-0.5 tabular-nums">{cat.subcategories.length} subcategories</div>
                </div>
              </button>
            ))}
          </HorizontalCarousel>
        </section>

        {/* Best-Selling & Deals Preview */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 space-y-12">
          <HorizontalCarousel
            title="Best-Selling Products"
            subtitle="Ranked by genuine verified marketplace units sold — private seller identities remain protected."
            viewAllLabel="Shop Best Sellers"
            onViewAll={() => navigate('/shop?sort=best_selling')}
          >
            {bestSelling.map((p) => (
              <div key={p.id} className="snap-start shrink-0 w-64 sm:w-72">
                <ProductCard product={p} hideQuickCart />
              </div>
            ))}
          </HorizontalCarousel>

          <HorizontalCarousel
            title="Deals and Offers"
            subtitle="Valid, backend-verified promotional prices."
            viewAllLabel="All Deals"
            onViewAll={() => navigate('/deals')}
          >
            {deals.map((p) => (
              <div key={p.id} className="snap-start shrink-0 w-64 sm:w-72">
                <ProductCard product={p} hideQuickCart />
              </div>
            ))}
          </HorizontalCarousel>

          <HorizontalCarousel
            title="Shop by Occasion"
            subtitle="Curated gifts and essentials for milestones and celebrations."
            viewAllLabel="Explore Occasions"
            onViewAll={() => navigate('/occasions')}
          >
            {OCCASIONS.slice(0, 8).map((occ) => (
              <button
                key={occ.id}
                type="button"
                onClick={() => navigate(`/occasions?occasion=${occ.slug}`)}
                className="snap-start shrink-0 w-56 bg-white border border-stone-200 rounded-xl overflow-hidden text-left hover:border-amber-700/60 transition-all cursor-pointer"
              >
                <div className="aspect-[4/3] bg-stone-100">
                  <SafeImage src={occ.image} alt={occ.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3.5">
                  <div className="font-display text-sm font-semibold text-[#141619]">{occ.name}</div>
                  <div className="text-xs text-stone-500 mt-0.5 line-clamp-1">{occ.description}</div>
                </div>
              </button>
            ))}
          </HorizontalCarousel>

          <HorizontalCarousel
            title="Shop by Location"
            subtitle="Discover inspected products available across all 47 Kenyan counties and collection hubs."
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
                  className="snap-start shrink-0 w-56 bg-white border border-stone-200 rounded-xl p-4 text-left hover:border-amber-700/60 transition-all cursor-pointer space-y-2"
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

          <HorizontalCarousel
            title="Trending Products"
            subtitle="Products receiving genuine marketplace views and verified buyer demand."
            viewAllLabel="View All Trending"
            onViewAll={() => navigate('/trending')}
          >
            {trending.map((p) => (
              <div key={p.id} className="snap-start shrink-0 w-64 sm:w-72">
                <ProductCard product={p} hideQuickCart />
              </div>
            ))}
          </HorizontalCarousel>

          <HorizontalCarousel
            title="New Arrivals"
            subtitle="Recently Stage-1 inspected and newly published marketplace products."
            viewAllLabel="View All New Arrivals"
            onViewAll={() => navigate('/new-arrivals')}
          >
            {newArrivals.map((p) => (
              <div key={p.id} className="snap-start shrink-0 w-64 sm:w-72">
                <ProductCard product={p} hideQuickCart />
              </div>
            ))}
          </HorizontalCarousel>
        </section>

        {/* How BuyHive Works + Why Choose BuyHive */}
        <section className="bg-white border-y border-stone-200 py-14">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-12">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#141619]">How BuyHive Works</h2>
              <p className="text-sm text-stone-600 mt-2">
                BuyHive does not warehouse inventory. Sellers hold their approved stock until you order — then our field operations and inspection team safeguard every delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
              {steps.map((s) => (
                <div key={s.num} className="p-4 rounded-xl border border-stone-200 bg-[#FAF9F6] space-y-2">
                  <div className="font-mono text-xs font-semibold text-amber-800">{s.num}</div>
                  <div className="font-display text-sm font-semibold text-[#141619]">{s.title}</div>
                  <p className="text-xs text-stone-600 leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-6 rounded-xl border border-stone-200 space-y-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-display text-base font-semibold">Two-Stage Quality Control</h3>
                <p className="text-sm text-stone-600">Every item passes Stage-1 pre-listing inspection and Stage-2 pre-dispatch verification after you order.</p>
              </div>
              <div className="p-6 rounded-xl border border-stone-200 space-y-2">
                <Lock className="w-5 h-5 text-amber-800" />
                <h3 className="font-display text-base font-semibold">Privacy & Escrow Protection</h3>
                <p className="text-sm text-stone-600">BuyHive manages all payments via M-Pesa, card, and PayPal, shielding both buyer and seller personal details.</p>
              </div>
              <div className="p-6 rounded-xl border border-stone-200 space-y-2">
                <Truck className="w-5 h-5 text-[#141619]" />
                <h3 className="font-display text-base font-semibold">Coordinated Fulfilment</h3>
                <p className="text-sm text-stone-600">Choose doorstep delivery across 47 Kenyan counties or verified BuyHive Hub collection with a secure code.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Authentic Verified Customer Testimonials + Genuine Platform Metrics */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-14 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#141619]">Verified Buyer Experiences</h2>
              <p className="text-sm text-stone-600 mt-1">
                Reviews displayed exclusively from orders with confirmed delivery or hub collection receipt.
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs text-stone-600 font-mono tabular-nums">
              <span>{totalSalesUnits} verified units sold</span>
              <span aria-hidden="true">·</span>
              <span>{reviews.length} verified reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((rev) => (
              <div key={rev.id} className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified Receipt · {rev.rating}/5</span>
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed">“{rev.comment}”</p>
                </div>
                <div className="text-xs text-stone-500 border-t border-stone-100 pt-3">
                  {rev.reviewerAlias} · {rev.createdAt}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs & Seller CTA */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-xl font-bold text-[#141619]">Frequently Asked Questions</h2>
            <div className="divide-y divide-stone-100">
              {MARKETPLACE_FAQS.map((faq, idx) => {
                const open = openFaq === idx;
                return (
                  <div key={faq.q} className="py-3.5">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 text-left text-sm font-semibold text-[#141619] cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && <p className="mt-2 text-sm text-stone-600 leading-relaxed">{faq.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#141619] text-white rounded-2xl p-7 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-amber-400">BuyHive Seller Portal</p>
              <h2 className="font-display text-2xl font-bold leading-snug">
                Sell to customers nationwide while keeping your inventory until an order is placed.
              </h2>
              <p className="text-sm text-stone-300 leading-relaxed">
                Register as an individual entrepreneur or registered business, submit listings for Stage-1 inspection, and let BuyHive coordinate pickup, payment settlement, and support.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/seller/register')}
                className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold cursor-pointer transition-colors"
              >
                Become a Seller
              </button>
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="px-5 py-2.5 rounded-lg border border-stone-700 hover:bg-stone-800 text-white text-sm font-medium cursor-pointer transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
