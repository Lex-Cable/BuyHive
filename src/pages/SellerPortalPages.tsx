import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BadgePercent,
  BarChart3,
  Box,
  ClipboardList,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquare,
  PlusCircle,
  Settings,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import { formatKSh, useMarketplace } from '../context/MarketplaceContext';
import { CATEGORIES, IMG_ELECTRONICS, IMG_HERO } from '../data/categories';
import { KENYAN_COUNTIES } from '../data/kenyaLocations';
import { Product, SellerType, SupportTicket } from '../types/buyhive';
import { BrandMark } from '../components/common/BrandMark';
import { SafeImage } from '../components/common/SafeImage';

export const SellerLandingAndAuthPage: React.FC<{ mode: 'welcome' | 'login' | 'register' }> = ({ mode }) => {
  const { sellerUser, loginSeller, registerSeller, navigate } = useMarketplace();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sellerType, setSellerType] = useState<SellerType>('registered_business');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [countySlug, setCountySlug] = useState('nairobi');
  const [town, setTown] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [kraOrIdRef, setKraOrIdRef] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'mpesa_till' | 'mpesa_phone' | 'bank_transfer'>('mpesa_till');
  const [payoutAccountLabel, setPayoutAccountLabel] = useState('');
  const [error, setError] = useState('');

  if (mode === 'welcome') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#141619] flex flex-col">
        <header className="bg-white border-b border-stone-200">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandMark onClick={() => navigate('/')} />
              <span className="text-xs font-semibold text-stone-400">·</span>
              <span className="text-sm font-semibold text-amber-800">Seller Portal</span>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate('/')} className="text-xs font-medium text-stone-600 hover:text-[#141619] cursor-pointer">
                Customer Storefront
              </button>
              {sellerUser ? (
                <button type="button" onClick={() => navigate('/seller/dashboard')} className="px-4 py-2 rounded-lg bg-[#141619] text-white text-xs font-semibold cursor-pointer">
                  Go to Seller Dashboard
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => navigate('/seller/login')} className="px-3.5 py-2 rounded-lg border border-stone-200 text-xs font-semibold cursor-pointer">
                    Seller Login
                  </button>
                  <button type="button" onClick={() => navigate('/seller/register')} className="px-4 py-2 rounded-lg bg-amber-700 text-white text-xs font-semibold cursor-pointer">
                    Register as Seller
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-14 space-y-12">
          <div className="bg-white border border-stone-200 rounded-2xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <p className="text-xs font-semibold text-amber-800">BuyHive Seller Ecosystem</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
                Reach verified buyers across 47 Kenyan counties without shipping stock to a warehouse upfront.
              </h1>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Keep full custody of your approved inventory until a customer places an order. BuyHive handles M-Pesa/card collection, field-agent pickup, Stage-2 quality verification, delivery, and customer support.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button type="button" onClick={() => navigate('/seller/register')} className="px-6 py-3 rounded-lg bg-[#141619] text-white text-sm font-semibold cursor-pointer">
                  Open Seller Account
                </button>
                <button type="button" onClick={() => navigate('/seller/login')} className="px-6 py-3 rounded-lg border border-stone-300 text-sm font-semibold cursor-pointer">
                  Seller Sign In
                </button>
              </div>
            </div>
            <div className="lg:col-span-5 aspect-[4/3] rounded-xl overflow-hidden bg-stone-100">
              <SafeImage src={IMG_HERO} alt="BuyHive Seller Portal Showcase" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-2">
              <h2 className="font-display text-base font-bold">1. Verify & Submit Listings</h2>
              <p className="text-sm text-stone-600">Register as an individual entrepreneur or registered business and schedule Stage-1 physical inspection.</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-2">
              <h2 className="font-display text-base font-bold">2. Hand Over on Order</h2>
              <p className="text-sm text-stone-600">Receive anonymized order references with clear prep deadlines. Hand over exclusively to BuyHive field agents.</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-2">
              <h2 className="font-display text-base font-bold">3. Transparent Net Payouts</h2>
              <p className="text-sm text-stone-600">Set your selling price, preview configurable commission upfront, and track settled earnings separately from gross sales.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'login') {
      const res = loginSeller(email, password);
      if (!res.ok) {
        setError(res.error || 'Seller login failed.');
        return;
      }
      navigate('/seller/dashboard');
    } else {
      const res = registerSeller({
        fullName,
        businessName,
        sellerType,
        email,
        phone,
        countySlug,
        town,
        businessDescription,
        kraOrIdRef,
        payoutMethod,
        payoutAccountLabel,
        password,
      });
      if (!res.ok) {
        setError(res.error || 'Registration failed.');
        return;
      }
      navigate('/seller/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10 px-4 sm:px-6 flex flex-col justify-center">
      <div className={`${mode === 'register' ? 'max-w-2xl' : 'max-w-md'} w-full mx-auto space-y-6`}>
        <div className="flex items-center justify-between">
          <BrandMark onClick={() => navigate('/seller')} />
          <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-[#141619] cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" />
            Marketplace Home
          </button>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-7 sm:p-8 space-y-6">
          <div>
            <p className="text-xs font-semibold text-amber-800">BuyHive Seller Authentication (Separate from Customer Accounts)</p>
            <h1 className="font-display text-2xl font-bold mt-1">
              {mode === 'login' ? 'Sign in to Seller Portal' : 'Register as a BuyHive Seller'}
            </h1>
          </div>

          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}

          <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSellerType('registered_business')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold cursor-pointer ${
                      sellerType === 'registered_business' ? 'bg-[#141619] text-white border-[#141619]' : 'border-stone-200'
                    }`}
                  >
                    Registered Business
                  </button>
                  <button
                    type="button"
                    onClick={() => setSellerType('individual')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold cursor-pointer ${
                      sellerType === 'individual' ? 'bg-[#141619] text-white border-[#141619]' : 'border-stone-200'
                    }`}
                  >
                    Individual Seller
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                    <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Daniel Mwangi" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                  </div>
                  {sellerType === 'registered_business' && (
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Registered Business Name</label>
                      <input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Savanna Tech Ltd" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
                    <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 712 340 890" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">National ID / Business Reg / KRA PIN</label>
                    <input required value={kraOrIdRef} onChange={(e) => setKraOrIdRef(e.target.value)} placeholder="P051849203K" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Business County</label>
                    <select value={countySlug} onChange={(e) => setCountySlug(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg bg-white">
                      {KENYAN_COUNTIES.map((c) => <option key={c.code} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Town / Area</label>
                    <input required value={town} onChange={(e) => setTown(e.target.value)} placeholder="Westlands" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Payout Method</label>
                    <select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value as 'mpesa_till' | 'mpesa_phone' | 'bank_transfer')} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg bg-white">
                      <option value="mpesa_till">M-Pesa Till / Paybill</option>
                      <option value="mpesa_phone">M-Pesa Registered Number</option>
                      <option value="bank_transfer">Kenyan Bank Account</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Payout Account Reference</label>
                    <input required value={payoutAccountLabel} onChange={(e) => setPayoutAccountLabel(e.target.value)} placeholder="M-Pesa Till 5892014" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Business Description</label>
                  <textarea rows={2} required value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} placeholder="Products you supply and inspection readiness..." className="w-full p-3 text-sm border border-stone-200 rounded-lg" />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Seller Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seller@buyhive.co.ke" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
            </div>

            <button type="submit" className="w-full py-2.5 rounded-lg bg-[#141619] hover:bg-stone-800 text-white text-sm font-semibold cursor-pointer">
              {mode === 'login' ? 'Sign In to Seller Dashboard' : 'Submit Seller Application'}
            </button>

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setEmail('seller@buyhive.co.ke');
                  setPassword('SellerHive2026!');
                }}
                className="w-full py-2 rounded-lg border border-stone-200 text-xs font-medium text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Use Sample Approved Seller (seller@buyhive.co.ke)
              </button>
            )}
          </form>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            {mode === 'login' ? (
              <button type="button" onClick={() => navigate('/seller/register')} className="hover:text-[#141619] cursor-pointer">
                New seller? <span className="font-semibold underline">Register business or individual account</span>
              </button>
            ) : (
              <button type="button" onClick={() => navigate('/seller/login')} className="hover:text-[#141619] cursor-pointer">
                Already registered? <span className="font-semibold underline">Seller Sign In</span>
              </button>
            )}
            <button type="button" onClick={() => navigate('/login')} className="text-stone-500 hover:text-[#141619] cursor-pointer">
              Customer Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export type SellerTab =
  | 'overview'
  | 'create-product'
  | 'products'
  | 'orders'
  | 'sales'
  | 'earnings'
  | 'payments'
  | 'messages'
  | 'reviews'
  | 'promotions'
  | 'settings'
  | 'support';

export const SellerDashboardPage: React.FC<{ activeTab: SellerTab }> = ({ activeTab }) => {
  const {
    sellerUser,
    products,
    orders,
    reviews,
    sellerMessages,
    sellerPayouts,
    tickets,
    commissionConfigPercent,
    navigate,
    logoutSeller,
    createSellerProduct,
    updateSellerProductStock,
    toggleSellerProductPause,
    resubmitSellerProduct,
    markSellerItemReadyForPickup,
    markSellerMessageRead,
    updateSellerSettings,
    requestSellerPayout,
    createSupportTicket,
  } = useMarketplace();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // List New Product Form State
  const [prodName, setProdName] = useState('');
  const [catId, setCatId] = useState(CATEGORIES[0].id);
  const [subId, setSubId] = useState(CATEGORIES[0].subcategories[0].id);
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<Product['condition']>('New');
  const [priceStr, setPriceStr] = useState('10000');
  const [stockStr, setStockStr] = useState('10');
  const [prodCounty, setProdCounty] = useState(sellerUser?.countySlug ?? 'nairobi');
  const [prodTown, setProdTown] = useState(sellerUser?.town ?? 'Westlands');
  const [warranty, setWarranty] = useState('12-Month Warranty');
  const [variationLabel, setVariationLabel] = useState('Standard');
  const [specKey, setSpecKey] = useState('Material / Model');
  const [specVal, setSpecVal] = useState('');
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([IMG_ELECTRONICS]);
  const [prodStatusFilter, setProdStatusFilter] = useState<string>('all');

  // Seller Settings State
  const [setBizName, setSetBizName] = useState(sellerUser?.businessName ?? '');
  const [setPhone, setSetPhone] = useState(sellerUser?.phone ?? '');
  const [setTown, setSetTown] = useState(sellerUser?.town ?? '');
  const [setDesc, setSetDesc] = useState(sellerUser?.businessDescription ?? '');
  const [setPayMethod, setSetPayMethod] = useState(sellerUser?.payoutMethod ?? 'mpesa_till');
  const [setPayAccount, setSetPayAccount] = useState(sellerUser?.payoutAccountLabel ?? '');

  // Support Ticket State
  const [suppSubject, setSuppSubject] = useState('');
  const [suppMsg, setSuppMsg] = useState('');

  if (!sellerUser) {
    return <SellerLandingAndAuthPage mode="login" />;
  }

  const sellerProducts = products.filter((p) => p.sellerId === sellerUser.id);
  const sellerOrderItems = useMemo(
    () =>
      orders.flatMap((o) =>
        o.sellerItems
          .filter((si) => si.sellerId === sellerUser.id)
          .map((si) => ({
            ...si,
            orderCreatedAt: o.createdAt,
            paymentStatus: o.paymentStatus,
            orderStatus: o.status,
            // CRITICAL PRIVACY RULE: Notice we NEVER attach o.customerName, o.customerPhone, o.customerEmail, or o.deliveryAddress!
          }))
      ),
    [orders, sellerUser.id]
  );

  const activeProductsCount = sellerProducts.filter((p) => p.stageOneStatus === 'approved' && p.isPublished && !p.isPaused).length;
  const pendingProductsCount = sellerProducts.filter((p) =>
    ['pending_inspection', 'inspection_scheduled', 'under_inspection', 'correction_required'].includes(p.stageOneStatus)
  ).length;

  const grossSales = sellerOrderItems
    .filter((i) => i.orderStatus !== 'cancelled' && i.orderStatus !== 'refunded')
    .reduce((acc, i) => acc + i.lineTotal, 0);
  const totalCommission = sellerOrderItems
    .filter((i) => i.orderStatus !== 'cancelled' && i.orderStatus !== 'refunded')
    .reduce((acc, i) => acc + i.commissionAmount, 0);
  const netEarnings = sellerOrderItems
    .filter((i) => i.orderStatus !== 'cancelled' && i.orderStatus !== 'refunded')
    .reduce((acc, i) => acc + i.netSellerProceeds, 0);
  const pendingEarnings = sellerOrderItems
    .filter((i) => i.earningsStatus === 'pending')
    .reduce((acc, i) => acc + i.netSellerProceeds, 0);
  const availableEarnings = sellerOrderItems
    .filter((i) => i.earningsStatus === 'available')
    .reduce((acc, i) => acc + i.netSellerProceeds, 0);
  const paidEarnings = sellerOrderItems
    .filter((i) => i.earningsStatus === 'paid')
    .reduce((acc, i) => acc + i.netSellerProceeds, 0);

  const myMessages = sellerMessages.filter((m) => m.sellerId === sellerUser.id);
  const myPayouts = sellerPayouts.filter((p) => p.sellerId === sellerUser.id);
  const myTickets = tickets.filter((t) => t.userRole === 'seller' && t.userId === sellerUser.id);
  const sellerProductIds = new Set(sellerProducts.map((p) => p.id));
  const myProductReviews = reviews.filter((r) => sellerProductIds.has(r.productId));

  const commissionRate = sellerUser.commissionRatePercent || commissionConfigPercent;
  const parsedPrice = Math.max(0, Number(priceStr) || 0);
  const estimatedCommission = Math.round((parsedPrice * commissionRate) / 100);
  const estimatedProceeds = parsedPrice - estimatedCommission;

  const selectedCategoryObj = CATEGORIES.find((c) => c.id === catId) ?? CATEGORIES[0];
  const selectedSubObj = selectedCategoryObj.subcategories.find((s) => s.id === subId);

  const navItems: { id: SellerTab; path: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', path: '/seller/dashboard', label: '1. Overview', icon: LayoutDashboard },
    { id: 'create-product', path: '/seller/products/create', label: '2. List New Product', icon: PlusCircle },
    { id: 'products', path: '/seller/products', label: '3. My Products', icon: Box },
    { id: 'orders', path: '/seller/orders', label: '4. Orders', icon: ClipboardList },
    { id: 'sales', path: '/seller/sales', label: '5. Sales', icon: BarChart3 },
    { id: 'earnings', path: '/seller/earnings', label: '6. Earnings', icon: DollarSign },
    { id: 'payments', path: '/seller/payments', label: '7. Payments & Payouts', icon: CreditCard },
    { id: 'messages', path: '/seller/messages', label: '8. Messages', icon: MessageSquare },
    { id: 'reviews', path: '/seller/reviews', label: '9. Reviews & Ratings', icon: Star },
    { id: 'promotions', path: '/seller/promotions', label: '10. Promotions', icon: BadgePercent },
    { id: 'settings', path: '/seller/settings', label: '11. Account Settings', icon: Settings },
    { id: 'support', path: '/seller/support', label: '12. Seller Support', icon: LifeBuoy },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoPreviews((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCreateProduct = (saveAsDraft: boolean) => {
    const res = createSellerProduct({
      name: prodName,
      categoryId: catId,
      subcategoryId: subId,
      brand: brand || sellerUser.businessName,
      description,
      specifications: specVal ? { [specKey]: specVal } : { Condition: condition },
      condition,
      images: photoPreviews,
      price: parsedPrice,
      stock: Math.max(0, Number(stockStr) || 0),
      countySlug: prodCounty,
      town: prodTown,
      deliveryAvailable: true,
      collectionAvailable: true,
      warrantyInfo: warranty,
      variations: [{ label: variationLabel || 'Standard', priceDelta: 0, stock: Math.max(0, Number(stockStr) || 0) }],
      saveAsDraft,
    });
    if (res.ok) {
      setProdName('');
      setDescription('');
      navigate('/seller/products');
    }
  };

  const filteredSellerProducts =
    prodStatusFilter === 'all'
      ? sellerProducts
      : sellerProducts.filter((p) => p.stageOneStatus === prodStatusFilter);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#141619] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className={`lg:w-64 bg-[#141619] text-stone-300 shrink-0 ${mobileMenuOpen ? 'block' : 'hidden lg:flex'} flex-col justify-between`}>
        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between">
            <BrandMark variant="light" onClick={() => navigate('/seller/dashboard')} />
            <button type="button" onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-stone-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
            <div className="text-xs font-semibold text-white truncate">{sellerUser.businessName}</div>
            <div className="text-[11px] text-amber-400 capitalize">
              Status: {sellerUser.verificationStatus.replace(/_/g, ' ')}
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                    active ? 'bg-amber-700 text-white font-semibold' : 'hover:bg-stone-800/80 text-stone-300'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-5 border-t border-stone-800 space-y-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full text-left px-3 py-2 rounded-lg text-xs text-stone-400 hover:text-white cursor-pointer"
          >
            View Public Marketplace
          </button>
          <button
            type="button"
            onClick={logoutSeller}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-stone-800 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Seller</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-stone-200 px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded-lg border border-stone-200">
              <Menu className="w-4 h-4" />
            </button>
            <div className="text-xs text-stone-500">
              Seller Portal / <span className="font-semibold text-[#141619] capitalize">{activeTab.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/seller/products/create')}
              className="px-4 py-2 rounded-lg bg-[#141619] text-white text-xs font-semibold hover:bg-stone-800 whitespace-nowrap cursor-pointer"
            >
              + List New Product
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-[1200px] w-full space-y-8">
          {sellerUser.verificationStatus !== 'approved' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              Your seller account is currently <strong className="capitalize">{sellerUser.verificationStatus.replace(/_/g, ' ')}</strong>. You can prepare and draft product listings, but listings cannot become publicly visible until BuyHive completes account verification and Stage-1 physical inspection.
            </div>
          )}

          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h1 className="font-display text-2xl font-bold">Seller Workspace Overview</h1>
                <p className="text-sm text-stone-600 mt-0.5">Live inventory, anonymized fulfilment orders, and financial metrics.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Products', val: sellerProducts.length },
                  { label: 'Active Published', val: activeProductsCount },
                  { label: 'Pending Inspection', val: pendingProductsCount },
                  { label: 'Seller Orders', val: sellerOrderItems.length },
                  { label: 'Gross Sales', val: formatKSh(grossSales) },
                  { label: 'Net Earnings', val: formatKSh(netEarnings) },
                  { label: 'Pending Settlement', val: formatKSh(pendingEarnings) },
                  { label: 'Available Payout', val: formatKSh(availableEarnings) },
                ].map((k) => (
                  <div key={k.label} className="bg-white border border-stone-200 rounded-xl p-4 space-y-1">
                    <div className="text-xs text-stone-500">{k.label}</div>
                    <div className="font-mono text-xl font-bold text-[#141619] tabular-nums">{k.val}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-base font-bold">Recent Anonymized Orders</h2>
                    <button type="button" onClick={() => navigate('/seller/orders')} className="text-xs font-semibold text-amber-800 cursor-pointer">View all</button>
                  </div>
                  {sellerOrderItems.slice(0, 4).map((si) => (
                    <div key={si.id} className="py-2.5 border-t border-stone-100 first:border-0 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono font-semibold">{si.orderNumber}</div>
                        <div className="text-stone-600">{si.productName} (x{si.quantity})</div>
                      </div>
                      <span className="font-mono font-semibold tabular-nums">{formatKSh(si.netSellerProceeds)} net</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
                  <h2 className="font-display text-base font-bold">Seller Performance</h2>
                  <dl className="divide-y divide-stone-100 text-xs">
                    <div className="py-2 flex justify-between"><dt className="text-stone-500">Stage-1 Product Approval Rate</dt><dd className="font-mono font-semibold">100%</dd></div>
                    <div className="py-2 flex justify-between"><dt className="text-stone-500">Order Completion & Handover SLA</dt><dd className="font-mono font-semibold">98%</dd></div>
                    <div className="py-2 flex justify-between"><dt className="text-stone-500">Configured Commission Rate</dt><dd className="font-mono font-semibold">{commissionRate}%</dd></div>
                    <div className="py-2 flex justify-between"><dt className="text-stone-500">Policy Compliance Standing</dt><dd className="font-semibold text-emerald-700">Good Standing</dd></div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* 2. LIST NEW PRODUCT + LIVE COMMISSION CALCULATOR */}
          {activeTab === 'create-product' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold">List New Product for Stage-1 Inspection</h1>
                <p className="text-sm text-stone-600 mt-1">
                  Your advertised price is what customers pay. BuyHive deducts its configurable commission from successful sales — never added unexpectedly on top.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Product Name</label>
                      <input value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="e.g. Hybrid 3kVA Solar Inverter" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Main Category (17 Approved)</label>
                      <select
                        value={catId}
                        onChange={(e) => {
                          const nextCat = CATEGORIES.find((c) => c.id === e.target.value) ?? CATEGORIES[0];
                          setCatId(nextCat.id);
                          setSubId(nextCat.subcategories[0]?.id ?? '');
                        }}
                        className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg bg-white"
                      >
                        {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Subcategory (Dynamic)</label>
                      <select value={subId} onChange={(e) => setSubId(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg bg-white">
                        {selectedCategoryObj.subcategories.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}{s.restricted ? ' (Regulated)' : ''}</option>
                        ))}
                      </select>
                    </div>
                    {selectedSubObj?.restricted && (
                      <div className="sm:col-span-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                        Regulated Subcategory Rule: {selectedSubObj.restrictionNote}
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Public Brand / Manufacturer</label>
                      <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Samsung, VoltStream, Artisanal" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Condition</label>
                      <select value={condition} onChange={(e) => setCondition(e.target.value as Product['condition'])} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg bg-white">
                        <option value="New">New</option>
                        <option value="Handcrafted">Handcrafted</option>
                        <option value="Refurbished (Certified)">Refurbished (Certified)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Advertised Selling Price (KSh)</label>
                      <input type="number" min={100} value={priceStr} onChange={(e) => setPriceStr(e.target.value)} className="w-full h-10 px-3 text-sm font-mono border border-stone-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Available Quantity</label>
                      <input type="number" min={1} value={stockStr} onChange={(e) => setStockStr(e.target.value)} className="w-full h-10 px-3 text-sm font-mono border border-stone-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Product County Location</label>
                      <select value={prodCounty} onChange={(e) => setProdCounty(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg bg-white">
                        {KENYAN_COUNTIES.map((c) => <option key={c.code} value={c.slug}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Town / Pickup Area (Not shown privately)</label>
                      <input value={prodTown} onChange={(e) => setProdTown(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Variation (Size / Colour / Model)</label>
                      <input value={variationLabel} onChange={(e) => setVariationLabel(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Warranty Information</label>
                      <input value={warranty} onChange={(e) => setWarranty(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Key Specification (Optional)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input value={specKey} onChange={(e) => setSpecKey(e.target.value)} placeholder="Spec Name" className="h-9 px-3 text-xs border border-stone-200 rounded-lg" />
                        <input value={specVal} onChange={(e) => setSpecVal(e.target.value)} placeholder="Spec Value" className="h-9 px-3 text-xs border border-stone-200 rounded-lg" />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
                      <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed product description for inspection and buyers..." className="w-full p-3 text-sm border border-stone-200 rounded-lg" />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-xs font-semibold text-stone-700">Product Photos (Multiple Upload Preview)</label>
                      <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="text-xs text-stone-600" />
                      <div className="flex flex-wrap gap-2 pt-1">
                        {photoPreviews.map((src, i) => (
                          <img key={i} src={src} alt="Preview" className="w-16 h-12 rounded object-cover border border-stone-200" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button type="button" onClick={() => handleCreateProduct(false)} className="px-5 py-2.5 rounded-lg bg-[#141619] text-white text-xs font-semibold cursor-pointer">
                      Submit for Stage-1 Inspection
                    </button>
                    <button type="button" onClick={() => handleCreateProduct(true)} className="px-5 py-2.5 rounded-lg border border-stone-300 text-xs font-semibold cursor-pointer">
                      Save as Draft
                    </button>
                  </div>
                </div>

                {/* Live Commission & Proceeds Breakdown */}
                <aside className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Pricing & Commission Breakdown</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Commission rates are configured per marketplace agreement (indicative 10–15% range, currently {commissionRate}% for your account).
                  </p>
                  <div className="space-y-2.5 text-sm border-t border-stone-100 pt-3">
                    <div className="flex justify-between">
                      <span className="text-stone-600">Selling Price (Advertised)</span>
                      <span className="font-mono font-semibold tabular-nums">{formatKSh(parsedPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">Applicable BuyHive Rate</span>
                      <span className="font-mono tabular-nums">{commissionRate}%</span>
                    </div>
                    <div className="flex justify-between text-amber-800">
                      <span>Estimated Commission</span>
                      <span className="font-mono tabular-nums">-{formatKSh(estimatedCommission)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2.5 border-t border-stone-200 text-emerald-700">
                      <span>Estimated Seller Proceeds</span>
                      <span className="font-mono tabular-nums">{formatKSh(estimatedProceeds)}</span>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {/* 3. MY PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-bold">My Products & Stage-1 Inspection Status</h1>
                  <p className="text-sm text-stone-600">Only Stage-1 Approved products from Approved sellers are visible to customers.</p>
                </div>
                <select value={prodStatusFilter} onChange={(e) => setProdStatusFilter(e.target.value)} className="h-9 px-3 text-xs border border-stone-200 rounded-lg bg-white">
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved & Live</option>
                  <option value="pending_inspection">Pending Inspection</option>
                  <option value="inspection_scheduled">Inspection Scheduled</option>
                  <option value="correction_required">Correction Required</option>
                  <option value="rejected">Rejected</option>
                  <option value="draft">Drafts</option>
                </select>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9F6] border-b border-stone-200 text-stone-600">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Product</th>
                        <th className="py-3 px-4 font-semibold">Price</th>
                        <th className="py-3 px-4 font-semibold">Stock</th>
                        <th className="py-3 px-4 font-semibold">Stage-1 Inspection</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredSellerProducts.map((p) => (
                        <tr key={p.id}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img src={p.images[0]} alt={p.name} className="w-11 h-9 rounded object-cover bg-stone-100" />
                              <div>
                                <div className="font-semibold text-[#141619]">{p.name}</div>
                                <div className="font-mono text-[11px] text-stone-400">{p.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums">{formatKSh(p.price)}</td>
                          <td className="py-3 px-4 font-mono tabular-nums">
                            <input
                              type="number"
                              min={0}
                              value={p.stock}
                              onChange={(e) => updateSellerProductStock(p.id, Number(e.target.value))}
                              className="w-16 h-7 px-2 border border-stone-200 rounded text-xs"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-semibold capitalize ${p.stageOneStatus === 'approved' ? 'text-emerald-700' : 'text-amber-800'}`}>
                              {p.stageOneStatus.replace(/_/g, ' ')}
                            </span>
                            {p.isPaused && <span className="ml-1 text-stone-400">(Paused)</span>}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            {p.stageOneStatus === 'approved' ? (
                              <button type="button" onClick={() => toggleSellerProductPause(p.id)} className="px-2.5 py-1 rounded border border-stone-200 hover:bg-stone-50 cursor-pointer">
                                {p.isPaused ? 'Resume' : 'Pause'}
                              </button>
                            ) : (
                              <button type="button" onClick={() => resubmitSellerProduct(p.id)} className="px-2.5 py-1 rounded border border-amber-300 text-amber-800 cursor-pointer">
                                Resubmit
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. SELLER ORDERS (STRICT ANONYMITY ENFORCED) */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-2xl font-bold">Seller Fulfilment Orders</h1>
                <p className="text-sm text-stone-600 mt-1">
                  Customer Privacy Active: Only anonymized order references and BuyHive field-agent handover instructions are shown. Customer names, phones, emails, and delivery addresses are strictly concealed.
                </p>
              </div>

              <div className="space-y-3">
                {sellerOrderItems.map((si) => (
                  <div key={si.id} className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <img src={si.productImage} alt={si.productName} className="w-16 h-12 rounded-lg object-cover bg-stone-100 shrink-0" />
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#141619]">{si.orderNumber}</span>
                          <span className="text-stone-400">·</span>
                          <span>{si.orderCreatedAt}</span>
                          <span className="text-stone-400">·</span>
                          <span className="text-emerald-700 font-semibold">Payment Verified</span>
                        </div>
                        <div className="font-semibold text-sm text-[#141619]">{si.productName} × {si.quantity}</div>
                        <div className="text-stone-600">{si.fulfilmentInstructions}</div>
                        <div className="text-stone-500">
                          Prep Deadline: <span className="font-mono">{si.preparationDeadline}</span> · Stage-2 Inspection:{' '}
                          <span className="font-semibold capitalize text-amber-800">{si.stageTwoStatus.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="font-mono text-sm font-bold tabular-nums">{formatKSh(si.lineTotal)}</div>
                      {si.collectionStatus === 'pending_prep' ? (
                        <button
                          type="button"
                          onClick={() => markSellerItemReadyForPickup(si.id)}
                          className="px-3.5 py-2 rounded-lg bg-[#141619] text-white text-xs font-semibold cursor-pointer"
                        >
                          Mark Ready for Field Agent
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-700 capitalize">
                          {si.collectionStatus.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. SALES (SEPARATE FROM EARNINGS) */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold">Sales Performance</h1>
                <p className="text-sm text-stone-600 mt-1">Gross product sales volume, completed order counts, and product performance (distinct from net earnings).</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-stone-200 rounded-xl p-5">
                  <div className="text-xs text-stone-500">Gross Product Sales</div>
                  <div className="font-mono text-2xl font-bold mt-1 tabular-nums">{formatKSh(grossSales)}</div>
                </div>
                <div className="bg-white border border-stone-200 rounded-xl p-5">
                  <div className="text-xs text-stone-500">Completed Sales Items</div>
                  <div className="font-mono text-2xl font-bold mt-1 tabular-nums">{sellerOrderItems.length}</div>
                </div>
                <div className="bg-white border border-stone-200 rounded-xl p-5">
                  <div className="text-xs text-stone-500">Cancelled / Refunded</div>
                  <div className="font-mono text-2xl font-bold mt-1 tabular-nums">
                    {sellerOrderItems.filter((i) => i.orderStatus === 'cancelled' || i.orderStatus === 'refunded').length}
                  </div>
                </div>
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F6] border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Order Ref</th>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Units</th>
                      <th className="py-3 px-4 text-right">Gross Sale Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {sellerOrderItems.map((si) => (
                      <tr key={si.id}>
                        <td className="py-3 px-4 font-mono font-semibold">{si.orderNumber}</td>
                        <td className="py-3 px-4">{si.productName}</td>
                        <td className="py-3 px-4 font-mono tabular-nums">{si.quantity}</td>
                        <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">{formatKSh(si.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. EARNINGS (SEPARATE FROM SALES) */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold">Seller Earnings & Commission Deductions</h1>
                <p className="text-sm text-stone-600 mt-1">Net earnings after BuyHive configurable commission deductions, pending vs available vs paid balances.</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-stone-200 rounded-xl p-4">
                  <div className="text-xs text-stone-500">Gross Sales</div>
                  <div className="font-mono text-lg font-bold mt-1 tabular-nums">{formatKSh(grossSales)}</div>
                </div>
                <div className="bg-white border border-stone-200 rounded-xl p-4">
                  <div className="text-xs text-stone-500">BuyHive Commission</div>
                  <div className="font-mono text-lg font-bold text-amber-800 mt-1 tabular-nums">-{formatKSh(totalCommission)}</div>
                </div>
                <div className="bg-white border border-stone-200 rounded-xl p-4">
                  <div className="text-xs text-stone-500">Pending (In Transit/Hold)</div>
                  <div className="font-mono text-lg font-bold mt-1 tabular-nums">{formatKSh(pendingEarnings)}</div>
                </div>
                <div className="bg-white border border-stone-200 rounded-xl p-4">
                  <div className="text-xs text-stone-500">Available + Paid Net</div>
                  <div className="font-mono text-lg font-bold text-emerald-700 mt-1 tabular-nums">{formatKSh(availableEarnings + paidEarnings)}</div>
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F6] border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Order Ref</th>
                      <th className="py-3 px-4">Gross</th>
                      <th className="py-3 px-4">Rate</th>
                      <th className="py-3 px-4">Commission</th>
                      <th className="py-3 px-4">Net Proceeds</th>
                      <th className="py-3 px-4">Settlement State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {sellerOrderItems.map((si) => (
                      <tr key={si.id}>
                        <td className="py-3 px-4 font-mono font-semibold">{si.orderNumber}</td>
                        <td className="py-3 px-4 font-mono tabular-nums">{formatKSh(si.lineTotal)}</td>
                        <td className="py-3 px-4 font-mono tabular-nums">{si.commissionRatePercent}%</td>
                        <td className="py-3 px-4 font-mono text-amber-800 tabular-nums">-{formatKSh(si.commissionAmount)}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700 tabular-nums">{formatKSh(si.netSellerProceeds)}</td>
                        <td className="py-3 px-4 capitalize font-medium">{si.earningsStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. PAYMENTS & PAYOUTS */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold">Payments & Payouts</h1>
                  <p className="text-sm text-stone-600 mt-1">
                    Payouts unlock only after Stage-2 inspection passes and customer receipt is confirmed.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={availableEarnings <= 0}
                  onClick={requestSellerPayout}
                  className="px-5 py-2.5 rounded-lg bg-[#141619] hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs font-semibold cursor-pointer"
                >
                  Request Payout ({formatKSh(availableEarnings)})
                </button>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center justify-between text-sm">
                <div>
                  <div className="font-semibold">Configured Settlement Destination</div>
                  <div className="text-xs text-stone-500">{sellerUser.payoutAccountLabel}</div>
                </div>
                <button type="button" onClick={() => navigate('/seller/settings')} className="text-xs font-semibold text-amber-800 cursor-pointer">
                  Update Payout Details
                </button>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F6] border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {myPayouts.map((pay) => (
                      <tr key={pay.id}>
                        <td className="py-3 px-4 font-mono font-semibold">{pay.reference}</td>
                        <td className="py-3 px-4">{pay.periodLabel}</td>
                        <td className="py-3 px-4">{pay.methodLabel}</td>
                        <td className="py-3 px-4 font-mono font-bold tabular-nums">{formatKSh(pay.amount)}</td>
                        <td className="py-3 px-4 capitalize font-semibold text-emerald-700">{pay.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. MESSAGES (STRICTLY WITH BUYHIVE — NO CUSTOMER MESSAGING) */}
          {activeTab === 'messages' && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-2xl font-bold">BuyHive Operational Messages</h1>
                <p className="text-sm text-stone-600 mt-1">Inspection notices, announcements, and payout alerts from BuyHive. Direct seller-to-customer messaging is disabled by policy.</p>
              </div>
              <div className="space-y-3">
                {myMessages.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => markSellerMessageRead(m.id)}
                    className={`bg-white border rounded-xl p-5 space-y-1.5 cursor-pointer ${
                      m.isRead ? 'border-stone-200' : 'border-amber-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-800 uppercase">{m.type.replace('_', ' ')}</span>
                      <span className="font-mono text-stone-400">{m.createdAt}</span>
                    </div>
                    <h3 className="font-display text-sm font-bold">{m.title}</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">{m.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. REVIEWS & RATINGS (ANONYMIZED) */}
          {activeTab === 'reviews' && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-2xl font-bold">Product Reviews & Ratings</h1>
                <p className="text-sm text-stone-600 mt-1">Customer identities are anonymized to preserve marketplace privacy.</p>
              </div>
              <div className="space-y-3">
                {myProductReviews.map((r) => (
                  <div key={r.id} className="bg-white border border-stone-200 rounded-xl p-5 space-y-1.5 text-sm">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#141619]">Verified Buyer · {r.rating}/5 Stars</span>
                      <span className="text-stone-400">{r.createdAt}</span>
                    </div>
                    <p className="text-stone-700">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. PROMOTIONS */}
          {activeTab === 'promotions' && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
              <h1 className="font-display text-2xl font-bold">Promotions & Approved Discounts</h1>
              <p className="text-sm text-stone-600">
                Promotional discounts on your approved listings are validated on the BuyHive backend before appearing on the Deals & Offers page.
              </p>
              <div className="divide-y divide-stone-100 text-sm">
                {sellerProducts.filter((p) => p.originalPrice).map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-stone-500">Original {formatKSh(p.originalPrice!)} → Promo {formatKSh(p.price)}</div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700">Active Deal</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 11. SETTINGS */}
          {activeTab === 'settings' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSellerSettings({
                  businessName: setBizName,
                  phone: setPhone,
                  town: setTown,
                  businessDescription: setDesc,
                  payoutMethod: setPayMethod,
                  payoutAccountLabel: setPayAccount,
                });
              }}
              className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 max-w-2xl"
            >
              <h1 className="font-display text-2xl font-bold">Seller Account & Payout Settings</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Business Name</label>
                  <input value={setBizName} onChange={(e) => setSetBizName(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone</label>
                  <input value={setPhone} onChange={(e) => setSetPhone(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Town / Area</label>
                  <input value={setTown} onChange={(e) => setSetTown(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Payout Account Label</label>
                  <input value={setPayAccount} onChange={(e) => setSetPayAccount(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Payout Channel</label>
                  <select value={setPayMethod} onChange={(e) => setSetPayMethod(e.target.value as 'mpesa_till' | 'mpesa_phone' | 'bank_transfer')} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg bg-white">
                    <option value="mpesa_till">M-Pesa Till / Paybill</option>
                    <option value="mpesa_phone">M-Pesa Phone</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Business Description</label>
                <textarea rows={3} value={setDesc} onChange={(e) => setSetDesc(e.target.value)} className="w-full p-3 text-sm border border-stone-200 rounded-lg" />
              </div>
              <button type="submit" className="px-5 py-2.5 rounded-lg bg-[#141619] text-white text-xs font-semibold cursor-pointer">
                Save Seller Settings
              </button>
            </form>
          )}

          {/* 12. SELLER SUPPORT */}
          {activeTab === 'support' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!suppSubject || !suppMsg) return;
                  createSupportTicket({
                    userRole: 'seller',
                    category: 'General Enquiry' as SupportTicket['category'],
                    subject: suppSubject,
                    message: suppMsg,
                  });
                  setSuppSubject('');
                  setSuppMsg('');
                }}
                className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4"
              >
                <h1 className="font-display text-xl font-bold">Contact BuyHive Seller Support</h1>
                <input required value={suppSubject} onChange={(e) => setSuppSubject(e.target.value)} placeholder="Subject (e.g. Inspection schedule or payout query)" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                <textarea required rows={4} value={suppMsg} onChange={(e) => setSuppMsg(e.target.value)} placeholder="Describe your request..." className="w-full p-3 text-sm border border-stone-200 rounded-lg" />
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-[#141619] text-white text-xs font-semibold cursor-pointer">
                  Submit Seller Ticket
                </button>
              </form>
              <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
                <h2 className="font-display text-base font-bold">Seller Support Tickets ({myTickets.length})</h2>
                {myTickets.length === 0 ? (
                  <p className="text-xs text-stone-500">No support tickets opened yet.</p>
                ) : (
                  myTickets.map((t) => (
                    <div key={t.id} className="p-3 rounded-lg bg-[#FAF9F6] border border-stone-200 text-xs">
                      <div className="font-mono font-bold">{t.ticketNumber} · {t.status}</div>
                      <div className="font-semibold mt-0.5">{t.subject}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
