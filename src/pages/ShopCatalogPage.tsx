import React, { useMemo, useState } from 'react';
import { Filter, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { formatKSh, useMarketplace } from '../context/MarketplaceContext';
import { CATEGORIES } from '../data/categories';
import { KENYAN_COUNTIES } from '../data/kenyaLocations';
import { OCCASIONS } from '../data/seedCatalog';
import { CustomerNavbar } from '../components/layout/CustomerNavbar';
import { Footer } from '../components/layout/Footer';
import { ProductCard } from '../components/products/ProductCard';
import { SafeImage } from '../components/common/SafeImage';

export type CatalogViewMode =
  | 'shop'
  | 'categories'
  | 'deals'
  | 'occasions'
  | 'locations'
  | 'trending'
  | 'new-arrivals';

export const ShopCatalogPage: React.FC<{
  mode: CatalogViewMode;
  categorySlugParam?: string;
}> = ({ mode, categorySlugParam }) => {
  const { publicProducts, navigate } = useMarketplace();
  const params = new URLSearchParams(window.location.search);

  const [query, setQuery] = useState(params.get('q') || '');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(categorySlugParam || params.get('category') || '');
  const [selectedSubSlug, setSelectedSubSlug] = useState('');
  const [selectedCountySlug, setSelectedCountySlug] = useState(params.get('county') || '');
  const [selectedOccasionSlug, setSelectedOccasionSlug] = useState(params.get('occasion') || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [onlyDeals, setOnlyDeals] = useState(mode === 'deals');
  const [onlyFeatured, setOnlyFeatured] = useState(params.get('featured') === '1');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyCollection, setOnlyCollection] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>(
    mode === 'trending' ? 'trending' : mode === 'new-arrivals' ? 'newest' : params.get('sort') || 'newest'
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeCategory = CATEGORIES.find((c) => c.slug === selectedCategorySlug);
  const brands = useMemo(() => Array.from(new Set(publicProducts.map((p) => p.brand))), [publicProducts]);

  const filteredProducts = useMemo(() => {
    let list = [...publicProducts];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.town.toLowerCase().includes(q)
      );
    }
    if (selectedCategorySlug) {
      const cat = CATEGORIES.find((c) => c.slug === selectedCategorySlug);
      if (cat) list = list.filter((p) => p.categoryId === cat.id);
    }
    if (selectedSubSlug && activeCategory) {
      const sub = activeCategory.subcategories.find((s) => s.slug === selectedSubSlug);
      if (sub) list = list.filter((p) => p.subcategoryId === sub.id);
    }
    if (selectedCountySlug) {
      list = list.filter((p) => p.countySlug === selectedCountySlug);
    }
    if (selectedOccasionSlug) {
      list = list.filter((p) => p.occasionSlugs.includes(selectedOccasionSlug));
    }
    if (selectedBrand) {
      list = list.filter((p) => p.brand === selectedBrand);
    }
    if (selectedCondition) {
      list = list.filter((p) => p.condition === selectedCondition);
    }
    if (onlyDeals || mode === 'deals') {
      list = list.filter((p) => p.originalPrice && p.originalPrice > p.price);
    }
    if (onlyFeatured) {
      list = list.filter((p) => p.isFeatured);
    }
    if (onlyInStock) {
      list = list.filter((p) => p.stock > 0);
    }
    if (onlyCollection) {
      list = list.filter((p) => p.collectionAvailable);
    }
    if (minRating > 0) {
      list = list.filter((p) => p.ratingAverage >= minRating);
    }
    list = list.filter((p) => p.price <= maxPrice);

    switch (sortBy) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'best_selling':
        list.sort((a, b) => b.salesCount - a.salesCount);
        break;
      case 'rating':
        list.sort((a, b) => b.ratingAverage - a.ratingAverage);
        break;
      case 'trending':
        list.sort((a, b) => b.viewsCount + b.salesCount * 4 - (a.viewsCount + a.salesCount * 4));
        break;
      default:
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return list;
  }, [
    publicProducts,
    query,
    selectedCategorySlug,
    selectedSubSlug,
    activeCategory,
    selectedCountySlug,
    selectedOccasionSlug,
    selectedBrand,
    selectedCondition,
    onlyDeals,
    onlyFeatured,
    mode,
    onlyInStock,
    onlyCollection,
    minRating,
    maxPrice,
    sortBy,
  ]);

  const clearFilters = () => {
    setQuery('');
    setSelectedCategorySlug('');
    setSelectedSubSlug('');
    setSelectedCountySlug('');
    setSelectedOccasionSlug('');
    setSelectedBrand('');
    setSelectedCondition('');
    setMaxPrice(150000);
    setOnlyDeals(mode === 'deals');
    setOnlyFeatured(false);
    setOnlyInStock(false);
    setOnlyCollection(false);
    setMinRating(0);
  };

  const pageHeading: Record<CatalogViewMode, { title: string; subtitle: string }> = {
    shop: {
      title: activeCategory
        ? activeCategory.name
        : onlyFeatured
        ? 'Featured Inspected Products'
        : 'Inspected Marketplace Catalogue',
      subtitle: 'All listings passed Stage-1 physical inspection. Private seller identities are never exposed.',
    },
    categories: {
      title: 'All 17 BuyHive Categories',
      subtitle: 'Database-driven product taxonomy with regulated subcategory verification rules.',
    },
    deals: {
      title: 'Deals & Promotional Offers',
      subtitle: 'Backend-validated discounts and limited-time verified offers.',
    },
    occasions: {
      title: 'Shop by Occasion',
      subtitle: 'Discover inspected products curated for birthdays, weddings, graduations, and seasonal celebrations.',
    },
    locations: {
      title: 'Shop by Location Across All 47 Kenyan Counties',
      subtitle: 'Filter products by county fulfilment availability and BuyHive collection hubs without exposing seller home addresses.',
    },
    trending: {
      title: 'Trending Marketplace Products',
      subtitle: 'Ranked dynamically from actual buyer views and verified completed orders.',
    },
    'new-arrivals': {
      title: 'New Arrivals',
      subtitle: 'Recently approved and published Stage-1 inspected products.',
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
      <CustomerNavbar />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="border-b border-stone-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#141619]">
              {pageHeading[mode].title}
            </h1>
            <p className="text-sm text-stone-600 mt-1">{pageHeading[mode].subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMobileFilters((p) => !p)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-stone-200 bg-white text-xs font-semibold"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
              className="h-9 px-3 text-xs font-medium bg-white border border-stone-200 rounded-lg text-[#141619]"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Sort: Lowest Price</option>
              <option value="price_desc">Sort: Highest Price</option>
              <option value="best_selling">Sort: Best-Selling</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="trending">Sort: Trending</option>
            </select>
          </div>
        </div>

        {/* Dedicated 17 Categories Showcase when on /categories */}
        {mode === 'categories' && !categorySlugParam && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  selectedCategorySlug === cat.slug ? 'border-amber-700 ring-1 ring-amber-700' : 'border-stone-200'
                }`}
              >
                <div
                  onClick={() => {
                    setSelectedCategorySlug(cat.slug);
                    setSelectedSubSlug('');
                  }}
                  className="aspect-[16/9] bg-stone-100 cursor-pointer"
                >
                  <SafeImage src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategorySlug(cat.slug);
                      setSelectedSubSlug('');
                    }}
                    className="font-display text-sm font-bold text-[#141619] hover:text-amber-800 text-left cursor-pointer"
                  >
                    {cat.name}
                  </button>
                  <p className="text-xs text-stone-500 line-clamp-2">{cat.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cat.subcategories.slice(0, 4).map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategorySlug(cat.slug);
                          setSelectedSubSlug(sub.slug);
                        }}
                        className="text-[11px] px-2 py-0.5 rounded border border-stone-200 text-stone-600 hover:border-amber-700 hover:text-amber-800 cursor-pointer"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Occasions Picker */}
        {mode === 'occasions' && (
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {OCCASIONS.map((occ) => (
              <button
                key={occ.id}
                type="button"
                onClick={() => setSelectedOccasionSlug(selectedOccasionSlug === occ.slug ? '' : occ.slug)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedOccasionSlug === occ.slug
                    ? 'bg-[#141619] text-white border-[#141619]'
                    : 'bg-white border-stone-200 hover:border-amber-700'
                }`}
              >
                <div className="font-display text-sm font-semibold">{occ.name}</div>
                <div className={`text-[11px] mt-1 line-clamp-2 ${selectedOccasionSlug === occ.slug ? 'text-stone-300' : 'text-stone-500'}`}>
                  {occ.description}
                </div>
              </button>
            ))}
          </section>
        )}

        {/* All 47 Kenyan Counties Grid */}
        {mode === 'locations' && (
          <section className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-[#141619]">Select Kenyan County (All 47 Counties Supported)</h2>
              {selectedCountySlug && (
                <button type="button" onClick={() => setSelectedCountySlug('')} className="text-xs font-semibold text-amber-800 cursor-pointer">
                  Clear county filter
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {KENYAN_COUNTIES.map((county) => {
                const active = selectedCountySlug === county.slug;
                return (
                  <button
                    key={county.code}
                    type="button"
                    onClick={() => setSelectedCountySlug(active ? '' : county.slug)}
                    className={`px-2.5 py-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#141619] text-white border-[#141619]'
                        : 'bg-[#FAF9F6] border-stone-200 text-stone-700 hover:border-amber-700'
                    }`}
                  >
                    <div className="font-semibold truncate">{county.name}</div>
                    <div className={`text-[10px] truncate ${active ? 'text-amber-300' : 'text-stone-500'}`}>
                      {county.hasCollectionHub ? 'Hub + Delivery' : 'Delivery'}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Main Filter Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside
            className={`lg:col-span-3 bg-white border border-stone-200 rounded-2xl p-5 space-y-5 ${
              showMobileFilters ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-[#141619]">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Refine Results</span>
              </div>
              <button type="button" onClick={clearFilters} className="text-xs font-medium text-amber-800 hover:underline cursor-pointer">
                Reset
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Keyword Search</label>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Product, brand, town..."
                className="w-full h-9 px-3 text-xs border border-stone-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Category</label>
              <select
                value={selectedCategorySlug}
                onChange={(e) => {
                  setSelectedCategorySlug(e.target.value);
                  setSelectedSubSlug('');
                }}
                className="w-full h-9 px-2.5 text-xs border border-stone-200 rounded-lg bg-white"
              >
                <option value="">All 17 Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {activeCategory && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Subcategory</label>
                <select
                  value={selectedSubSlug}
                  onChange={(e) => setSelectedSubSlug(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs border border-stone-200 rounded-lg bg-white"
                >
                  <option value="">All Subcategories</option>
                  {activeCategory.subcategories.map((sub) => (
                    <option key={sub.id} value={sub.slug}>{sub.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">County Location</label>
              <select
                value={selectedCountySlug}
                onChange={(e) => setSelectedCountySlug(e.target.value)}
                className="w-full h-9 px-2.5 text-xs border border-stone-200 rounded-lg bg-white"
              >
                <option value="">All 47 Kenyan Counties</option>
                {KENYAN_COUNTIES.map((c) => (
                  <option key={c.code} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full h-9 px-2.5 text-xs border border-stone-200 rounded-lg bg-white"
              >
                <option value="">All Verified Brands</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full h-9 px-2.5 text-xs border border-stone-200 rounded-lg bg-white"
              >
                <option value="">Any Condition</option>
                <option value="New">New</option>
                <option value="Handcrafted">Handcrafted</option>
                <option value="Refurbished (Certified)">Refurbished (Certified)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                <span>Max Price</span>
                <span className="font-mono tabular-nums">{formatKSh(maxPrice)}</span>
              </div>
              <input
                type="range"
                min={2000}
                max={150000}
                step={1000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Minimum Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full h-9 px-2.5 text-xs border border-stone-200 rounded-lg bg-white"
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4.0+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onlyDeals} onChange={(e) => setOnlyDeals(e.target.checked)} />
                Discounted offers only
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onlyInStock} onChange={(e) => setOnlyInStock(e.target.checked)} />
                In stock now
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onlyCollection} onChange={(e) => setOnlyCollection(e.target.checked)} />
                Hub collection available
              </label>
            </div>
          </aside>

          <div className="lg:col-span-9 space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span className="font-mono tabular-nums">Showing {filteredProducts.length} inspected products</span>
              {selectedCountySlug && (
                <span className="inline-flex items-center gap-1 font-medium text-amber-800">
                  <MapPin className="w-3.5 h-3.5" />
                  {KENYAN_COUNTIES.find((c) => c.slug === selectedCountySlug)?.name} County
                  <button type="button" onClick={() => setSelectedCountySlug('')} className="ml-1 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-3">
                <h3 className="font-display text-lg font-semibold text-[#141619]">No matching inspected products</h3>
                <p className="text-sm text-stone-600 max-w-md mx-auto">
                  Try clearing one or more filters or explore all 17 categories.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg bg-[#141619] text-white text-xs font-semibold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
