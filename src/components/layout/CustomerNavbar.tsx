import React, { useState } from 'react';
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { CATEGORIES } from '../../data/categories';
import { BrandMark } from '../common/BrandMark';

export const CustomerNavbar: React.FC<{ isLanding?: boolean }> = ({ isLanding = false }) => {
  const { customerUser, cart, navigate, currentPath } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState('');
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
    setMobileOpen(false);
  };

  // Public Landing Page Navigation (Section 4.1: NO shopping cart icon on public landing page, NO admin links)
  if (isLanding && !customerUser) {
    return (
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur border-b border-stone-200/80">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 lg:gap-8">
          <BrandMark onClick={() => navigate('/')} />

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inspected products, brands, or counties..."
              aria-label="Search BuyHive marketplace"
              className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-stone-200 rounded-lg text-[#141619] placeholder:text-stone-400 focus:outline-none focus:border-amber-700"
            />
          </form>

          {/* Concise nav + Auth + Seller Portal */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-700">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShopOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 hover:text-[#141619] whitespace-nowrap shrink-0 cursor-pointer py-1"
              >
                <span>Shop</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {shopOpen && (
                <div
                  onMouseLeave={() => setShopOpen(false)}
                  className="absolute right-0 mt-2 w-72 bg-white border border-stone-200 rounded-xl shadow-lg p-3 z-50"
                >
                  <div className="grid grid-cols-1 gap-1 text-sm">
                    <button
                      type="button"
                      onClick={() => { setShopOpen(false); navigate('/shop'); }}
                      className="text-left px-3 py-2 rounded-lg hover:bg-stone-50 font-medium text-[#141619]"
                    >
                      All Inspected Products
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShopOpen(false); navigate('/categories'); }}
                      className="text-left px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-700"
                    >
                      17 Product Categories
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShopOpen(false); navigate('/deals'); }}
                      className="text-left px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-700"
                    >
                      Deals and Offers
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShopOpen(false); navigate('/occasions'); }}
                      className="text-left px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-700"
                    >
                      Shop by Occasion
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShopOpen(false); navigate('/locations'); }}
                      className="text-left px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-700"
                    >
                      Shop by Location (47 Counties)
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate('/seller')}
              className="hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Seller Portal
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hover:text-[#141619] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Customer Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#141619] hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign Up
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2.5 rounded-lg border border-stone-200 bg-white text-stone-700"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-10 pl-9 pr-3 text-sm border border-stone-200 rounded-lg"
              />
            </form>
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <button type="button" onClick={() => { navigate('/shop'); setMobileOpen(false); }} className="py-2.5 px-3 text-left rounded-lg hover:bg-stone-50">Shop All</button>
              <button type="button" onClick={() => { navigate('/categories'); setMobileOpen(false); }} className="py-2.5 px-3 text-left rounded-lg hover:bg-stone-50">Categories</button>
              <button type="button" onClick={() => { navigate('/deals'); setMobileOpen(false); }} className="py-2.5 px-3 text-left rounded-lg hover:bg-stone-50">Deals & Offers</button>
              <button type="button" onClick={() => { navigate('/seller'); setMobileOpen(false); }} className="py-2.5 px-3 text-left rounded-lg hover:bg-stone-50 text-amber-800">Seller Portal</button>
              <button type="button" onClick={() => { navigate('/login'); setMobileOpen(false); }} className="py-2.5 px-3 text-center rounded-lg border border-stone-200">Customer Login</button>
              <button type="button" onClick={() => { navigate('/register'); setMobileOpen(false); }} className="py-2.5 px-3 text-center rounded-lg bg-[#141619] text-white">Sign Up</button>
            </div>
          </div>
        )}
      </header>
    );
  }

  // Authenticated Shopping Dashboard & Storefront Navigation (WITH Shopping Cart icon)
  const navLinks = [
    { label: 'Home', path: customerUser ? '/dashboard' : '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Categories', path: '/categories' },
    { label: 'Deals', path: '/deals' },
    { label: 'Orders', path: '/orders' },
    { label: 'Support', path: '/support' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur border-b border-stone-200/80">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 shrink-0">
          <BrandMark onClick={() => navigate(customerUser ? '/dashboard' : '/')} />
          <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-stone-600">
            {navLinks.map((lnk) => {
              const active = currentPath === lnk.path;
              return (
                <button
                  key={lnk.path}
                  type="button"
                  onClick={() => navigate(lnk.path)}
                  className={`whitespace-nowrap shrink-0 py-1 cursor-pointer transition-colors ${
                    active ? 'text-[#141619] font-semibold underline underline-offset-4 decoration-amber-700' : 'hover:text-[#141619]'
                  }`}
                >
                  {lnk.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, brands, or 47 counties..."
            aria-label="Search products"
            className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-stone-200 rounded-lg text-[#141619] placeholder:text-stone-400 focus:outline-none focus:border-amber-700"
          />
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/seller')}
            className="hidden sm:inline-flex text-xs font-medium text-stone-600 hover:text-amber-800 px-2.5 py-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Seller Portal
          </button>

          <button
            type="button"
            onClick={() => navigate('/wishlist')}
            aria-label="Wishlist"
            className="p-2.5 rounded-lg hover:bg-stone-100 text-stone-700 relative cursor-pointer"
          >
            <Heart className="w-5 h-5" />
            {customerUser && customerUser.wishlistIds.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-700" />
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/cart')}
            aria-label="Shopping Cart"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-200 bg-white hover:border-stone-300 text-sm font-semibold text-[#141619] cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="font-mono tabular-nums">{cartCount}</span>
          </button>

          {customerUser ? (
            <button
              type="button"
              onClick={() => navigate('/account')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#141619] text-white text-sm font-medium hover:bg-stone-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline max-w-[110px] truncate">{customerUser.fullName.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg bg-[#141619] text-white text-sm font-semibold hover:bg-stone-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign In
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle menu"
            className="xl:hidden p-2 rounded-lg border border-stone-200 bg-white text-stone-700"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="xl:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full h-10 pl-9 pr-3 text-sm border border-stone-200 rounded-lg"
            />
          </form>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm font-medium">
            {navLinks.map((lnk) => (
              <button
                key={lnk.path}
                type="button"
                onClick={() => { navigate(lnk.path); setMobileOpen(false); }}
                className="py-2 px-3 text-left rounded-lg hover:bg-stone-50"
              >
                {lnk.label}
              </button>
            ))}
            <button type="button" onClick={() => { navigate('/occasions'); setMobileOpen(false); }} className="py-2 px-3 text-left rounded-lg hover:bg-stone-50">Occasions</button>
            <button type="button" onClick={() => { navigate('/locations'); setMobileOpen(false); }} className="py-2 px-3 text-left rounded-lg hover:bg-stone-50">Locations</button>
            <button type="button" onClick={() => { navigate('/coupons-rewards'); setMobileOpen(false); }} className="py-2 px-3 text-left rounded-lg hover:bg-stone-50">Rewards</button>
            <button type="button" onClick={() => { navigate('/feedback'); setMobileOpen(false); }} className="py-2 px-3 text-left rounded-lg hover:bg-stone-50">Feedback</button>
            <button type="button" onClick={() => { navigate('/seller'); setMobileOpen(false); }} className="py-2 px-3 text-left rounded-lg hover:bg-stone-50 text-amber-800">Seller Portal</button>
          </div>
          <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-2">
            {CATEGORIES.slice(0, 6).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { navigate(`/categories/${c.slug}`); setMobileOpen(false); }}
                className="text-xs px-2.5 py-1 rounded border border-stone-200 text-stone-600"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
