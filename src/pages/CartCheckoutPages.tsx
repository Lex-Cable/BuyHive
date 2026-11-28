import React, { useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  Smartphone,
  Store,
  Trash2,
  Truck,
} from 'lucide-react';
import { formatKSh, useMarketplace } from '../context/MarketplaceContext';
import { COLLECTION_HUBS, KENYAN_COUNTIES } from '../data/kenyaLocations';
import { FulfilmentMethod, PaymentMethodId } from '../types/buyhive';
import { CustomerNavbar } from '../components/layout/CustomerNavbar';
import { Footer } from '../components/layout/Footer';
import { SafeImage } from '../components/common/SafeImage';

export const CartPage: React.FC = () => {
  const {
    cart,
    publicProducts,
    customerUser,
    updateCartQuantity,
    removeFromCart,
    validateCouponServerSide,
    navigate,
  } = useMarketplace();

  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<{ valid: boolean; discount: number; msg: string } | null>(null);

  const enrichedItems = cart
    .map((ci) => {
      const product = publicProducts.find((p) => p.id === ci.productId);
      if (!product) return null;
      const variation = product.variations.find((v) => v.id === ci.variationId) ?? product.variations[0];
      const unitPrice = product.price + (variation?.priceDelta ?? 0);
      return { ci, product, variation, unitPrice, lineTotal: unitPrice * ci.quantity };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const subtotal = enrichedItems.reduce((sum, x) => sum + x.lineTotal, 0);
  const distinctSellerBatches = new Set(enrichedItems.map((x) => x.product.sellerId)).size;
  const estDelivery = subtotal > 0 ? 350 : 0;

  const handleApplyCoupon = () => {
    const res = validateCouponServerSide(couponInput, subtotal);
    setCouponStatus({
      valid: res.valid,
      discount: res.discount,
      msg: res.valid ? `Applied ${res.coupon?.code}: -${formatKSh(res.discount)}` : res.reason || 'Invalid coupon.',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
      <CustomerNavbar />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Shopping Cart</h1>
          <p className="text-sm text-stone-600 mt-1">
            Items from multiple verified sellers are coordinated into one seamless checkout while BuyHive creates internal seller fulfilment batches.
          </p>
        </div>

        {enrichedItems.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-4">
            <h2 className="font-display text-xl font-semibold">Your BuyHive cart is empty</h2>
            <p className="text-sm text-stone-600">Explore our 17 inspected categories to add items.</p>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="px-5 py-2.5 rounded-lg bg-[#141619] text-white text-sm font-semibold cursor-pointer"
            >
              Browse Marketplace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              {distinctSellerBatches > 1 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  Multi-Vendor Cart: Your items span {distinctSellerBatches} independent sellers. BuyHive coordinates separate field-agent pickups and Stage-2 inspections under one unified order.
                </div>
              )}

              {enrichedItems.map(({ ci, product, variation, unitPrice, lineTotal }) => (
                <div key={ci.id} className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="w-24 aspect-[4/3] rounded-lg overflow-hidden bg-stone-100 shrink-0 cursor-pointer"
                  >
                    <SafeImage src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-xs text-stone-500">{product.brand} · BuyHive Verified Seller</div>
                    <h3
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="font-display text-sm font-semibold text-[#141619] cursor-pointer hover:text-amber-800"
                    >
                      {product.name}
                    </h3>
                    {variation && <div className="text-xs text-stone-500">Option: {variation.label}</div>}
                    <div className="font-mono text-xs text-stone-600 tabular-nums">{formatKSh(unitPrice)} each</div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="inline-flex items-center border border-stone-200 rounded-lg">
                      <button type="button" onClick={() => updateCartQuantity(ci.id, ci.quantity - 1)} className="w-8 h-8 text-sm cursor-pointer">-</button>
                      <span className="w-8 text-center font-mono text-xs font-semibold tabular-nums">{ci.quantity}</span>
                      <button type="button" onClick={() => updateCartQuantity(ci.id, ci.quantity + 1)} className="w-8 h-8 text-sm cursor-pointer">+</button>
                    </div>
                    <div className="font-mono text-sm font-bold tabular-nums w-24 text-right">{formatKSh(lineTotal)}</div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(ci.id)}
                      aria-label="Remove item"
                      className="p-2 text-stone-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
              <h2 className="font-display text-lg font-bold">Order Summary</h2>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">Apply Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="e.g. HIVEWELCOME10"
                    className="flex-1 h-9 px-3 text-xs font-mono border border-stone-200 rounded-lg uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3.5 h-9 rounded-lg border border-stone-200 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponStatus && (
                  <p className={`text-xs ${couponStatus.valid ? 'text-emerald-700' : 'text-red-600'}`}>
                    {couponStatus.msg}
                  </p>
                )}
              </div>

              <div className="space-y-2.5 text-sm border-t border-stone-100 pt-4">
                <div className="flex justify-between">
                  <span className="text-stone-600">Products Subtotal</span>
                  <span className="font-mono tabular-nums">{formatKSh(subtotal)}</span>
                </div>
                {couponStatus?.valid && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Deduction</span>
                    <span className="font-mono tabular-nums">-{formatKSh(couponStatus.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-600">Estimated Delivery (Nairobi)</span>
                  <span className="font-mono tabular-nums">{formatKSh(estDelivery)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-3 border-t border-stone-200">
                  <span>Estimated Total</span>
                  <span className="font-mono tabular-nums">
                    {formatKSh(Math.max(0, subtotal - (couponStatus?.valid ? couponStatus.discount : 0) + estDelivery))}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    customerUser
                      ? `/checkout${couponStatus?.valid ? `?coupon=${encodeURIComponent(couponInput.trim().toUpperCase())}` : ''}`
                      : '/login'
                  )
                }
                className="w-full py-3 rounded-lg bg-[#141619] hover:bg-stone-800 text-white text-sm font-semibold cursor-pointer"
              >
                {customerUser ? 'Proceed to Secure Checkout' : 'Sign In to Checkout'}
              </button>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export const CheckoutPage: React.FC = () => {
  const {
    customerUser,
    cart,
    publicProducts,
    validateCouponServerSide,
    placeCheckoutOrder,
    navigate,
  } = useMarketplace();

  const params = new URLSearchParams(window.location.search);
  const [customerName, setCustomerName] = useState(customerUser?.fullName ?? '');
  const [customerPhone, setCustomerPhone] = useState(customerUser?.phone ?? '+254 712 000 000');
  const [customerEmail, setCustomerEmail] = useState(customerUser?.email ?? '');
  const [fulfilmentMethod, setFulfilmentMethod] = useState<FulfilmentMethod>('delivery');
  const [countySlug, setCountySlug] = useState(customerUser?.savedAddresses[0]?.countySlug ?? 'nairobi');
  const [town, setTown] = useState(customerUser?.savedAddresses[0]?.town ?? 'Kilimani');
  const [street, setStreet] = useState(customerUser?.savedAddresses[0]?.street ?? '');
  const [collectionPoint, setCollectionPoint] = useState(COLLECTION_HUBS[COLLECTION_HUBS.length - 1]?.hubName ?? 'BuyHive Nairobi Westlands Flagship Hub');
  const [orderNotes, setOrderNotes] = useState('');
  const [couponCode, setCouponCode] = useState(params.get('coupon') || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState(customerUser?.phone ?? '+254 718 552 104');
  const [error, setError] = useState('');

  if (!customerUser) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <CustomerNavbar />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">Sign in to Complete Checkout</h1>
          <button type="button" onClick={() => navigate('/login')} className="px-6 py-2.5 rounded-lg bg-[#141619] text-white text-sm font-semibold cursor-pointer">
            Customer Login
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const items = cart
    .map((ci) => {
      const p = publicProducts.find((prod) => prod.id === ci.productId);
      if (!p) return null;
      const v = p.variations.find((vr) => vr.id === ci.variationId) ?? p.variations[0];
      const unit = p.price + (v?.priceDelta ?? 0);
      return { ci, p, v, lineTotal: unit * ci.quantity };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const subtotal = items.reduce((s, x) => s + x.lineTotal, 0);
  const couponCheck = couponCode ? validateCouponServerSide(couponCode, subtotal) : { valid: false, discount: 0 };
  const deliveryFee = fulfilmentMethod === 'delivery' ? (countySlug === 'nairobi' ? 350 : 650) : 0;
  const totalPayable = Math.max(0, subtotal - (couponCheck.valid ? couponCheck.discount : 0) + deliveryFee);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (fulfilmentMethod === 'delivery' && (!town.trim() || !street.trim())) {
      setError('Please enter your delivery town and street / apartment details.');
      return;
    }
    const res = await placeCheckoutOrder({
      customerName,
      customerPhone,
      customerEmail,
      fulfilmentMethod,
      deliveryAddress: fulfilmentMethod === 'delivery' ? { countySlug, town, street } : undefined,
      collectionPoint: fulfilmentMethod === 'store_collection' ? collectionPoint : undefined,
      orderNotes,
      couponCode: couponCheck.valid ? couponCode : undefined,
      paymentMethod,
      mpesaPhone,
    });
    if (!res.ok || !res.order) {
      setError(res.error || 'Checkout validation failed.');
      return;
    }
    navigate(`/order-confirmation/${res.order.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
      <CustomerNavbar />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">Secure Checkout</h1>
        <p className="text-sm text-stone-600 mb-8">
          All order totals, coupon rules, and delivery fees are recalculated and validated server-side.
        </p>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Contact */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-base font-bold">1. Customer Contact Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                  <input required type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                </div>
              </div>
            </section>

            {/* Fulfilment Choice */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-base font-bold">2. Fulfilment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFulfilmentMethod('delivery')}
                  className={`p-4 rounded-xl border text-left cursor-pointer space-y-1 ${
                    fulfilmentMethod === 'delivery' ? 'border-[#141619] bg-stone-50' : 'border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Truck className="w-4 h-4 text-amber-800" />
                    <span>Doorstep Delivery</span>
                  </div>
                  <p className="text-xs text-stone-500">BuyHive collects, conducts Stage-2 inspection, and delivers to you.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfilmentMethod('store_collection')}
                  className={`p-4 rounded-xl border text-left cursor-pointer space-y-1 ${
                    fulfilmentMethod === 'store_collection' ? 'border-[#141619] bg-stone-50' : 'border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Store className="w-4 h-4 text-emerald-700" />
                    <span>BuyHive Hub Collection</span>
                  </div>
                  <p className="text-xs text-stone-500">Free hub pickup after Stage-2 inspection using your secure code.</p>
                </button>
              </div>

              {fulfilmentMethod === 'delivery' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">County (47 Kenyan Counties)</label>
                    <select value={countySlug} onChange={(e) => setCountySlug(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg bg-white">
                      {KENYAN_COUNTIES.map((c) => (
                        <option key={c.code} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Town / Estate</label>
                    <input required value={town} onChange={(e) => setTown(e.target.value)} placeholder="Kilimani" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Street / Building / Landmark</label>
                    <input required value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Argwings Kodhek Rd, Gate 12" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Select BuyHive Collection Hub</label>
                  <select value={collectionPoint} onChange={(e) => setCollectionPoint(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg bg-white">
                    {COLLECTION_HUBS.map((h) => (
                      <option key={h.hubName} value={h.hubName}>{h.hubName} ({h.countyName})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Order Notes (Optional)</label>
                <input value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Delivery instructions or gate code" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
              </div>
            </section>

            {/* Payment Method (M-Pesa Prioritized, Sandbox Mode Clearly Identified) */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-base font-bold">3. Payment Method</h2>
                <span className="text-xs font-mono text-amber-800">Sandbox Mode</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'mpesa' as const, label: 'M-Pesa STK Push (Prioritized)', sub: 'Instant Safaricom Daraja sandbox prompt', icon: Smartphone },
                  { id: 'card' as const, label: 'Visa / Mastercard', sub: 'Debit & credit card gateway', icon: CreditCard },
                  { id: 'paypal' as const, label: 'PayPal Checkout', sub: 'International PayPal account', icon: Lock },
                  { id: 'bank' as const, label: 'Kenyan Bank Online Pay', sub: 'Supported PesaLink / RTGS flow', icon: MapPin },
                ].map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer space-y-1 ${
                        paymentMethod === pm.id ? 'border-[#141619] bg-stone-50' : 'border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Icon className="w-4 h-4 text-amber-800" />
                        <span>{pm.label}</span>
                      </div>
                      <div className="text-xs text-stone-500">{pm.sub}</div>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === 'mpesa' && (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <label className="block text-xs font-semibold text-emerald-900">M-Pesa Number for STK Push</label>
                  <input
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    className="w-full h-10 px-3 text-sm font-mono bg-white border border-emerald-300 rounded-lg"
                  />
                  <p className="text-[11px] text-emerald-800">
                    Development sandbox only: no STK push or real charge is made. A pending payment record is created and must be reconciled by a test callback.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Right Summary */}
          <aside className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 space-y-5 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-bold">Order Review ({items.length})</h2>
            <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto pr-1">
              {items.map(({ ci, p, v, lineTotal }) => (
                <div key={ci.id} className="py-2.5 flex justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-[#141619]">{p.name}</div>
                    <div className="text-stone-500">Qty {ci.quantity} {v ? `· ${v.label}` : ''}</div>
                  </div>
                  <div className="font-mono font-semibold tabular-nums shrink-0">{formatKSh(lineTotal)}</div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Coupon Code</label>
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="HIVEWELCOME10"
                className="w-full h-9 px-3 text-xs font-mono border border-stone-200 rounded-lg"
              />
            </div>

            <div className="space-y-2 text-sm border-t border-stone-100 pt-4">
              <div className="flex justify-between">
                <span className="text-stone-600">Subtotal</span>
                <span className="font-mono tabular-nums">{formatKSh(subtotal)}</span>
              </div>
              {couponCheck.valid && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon ({couponCode})</span>
                  <span className="font-mono tabular-nums">-{formatKSh(couponCheck.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-600">Delivery / Hub Logistics</span>
                <span className="font-mono tabular-nums">{deliveryFee === 0 ? 'Free (Hub Pickup)' : formatKSh(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-3 border-t border-stone-200">
                <span>Final Payable (Server-Validated)</span>
                <span className="font-mono tabular-nums">{formatKSh(totalPayable)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={items.length === 0}
              className="w-full py-3.5 rounded-lg bg-[#141619] hover:bg-stone-800 text-white text-sm font-semibold cursor-pointer"
            >
              Create Order · {formatKSh(totalPayable)} (Sandbox)
            </button>

            <div className="flex items-center gap-2 text-xs text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Seller payout remains held until Stage-2 inspection passes and receipt is confirmed.</span>
            </div>
          </aside>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export const OrderConfirmationPage: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { orders, navigate, confirmSandboxPayment } = useMarketplace();
  const order = orders.find((o) => o.id === orderId);
  const [paymentActionError, setPaymentActionError] = useState('');
  const [paymentActionBusy, setPaymentActionBusy] = useState(false);
  const handleSandboxPayment = async (succeeded: boolean) => {
    setPaymentActionBusy(true);
    setPaymentActionError('');
    const result = await confirmSandboxPayment(orderId,succeeded);
    if (!result.ok) setPaymentActionError(result.error || 'Sandbox payment could not be updated.');
    setPaymentActionBusy(false);
  };

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <CustomerNavbar />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">Order Not Found</h1>
          <button type="button" onClick={() => navigate('/orders')} className="px-5 py-2.5 rounded-lg bg-[#141619] text-white text-sm font-semibold cursor-pointer">
            View My Orders
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
      <CustomerNavbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-7 sm:p-9 space-y-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-700">{order.paymentStatus === 'pending' ? 'Order Created · Payment Pending' : 'Order Created · Sandbox Payment'}</p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1">Thank you! Order {order.orderNumber}</h1>
              <p className="text-sm text-stone-600 mt-1">
                Payment reference <span className="font-mono text-[#141619]">{order.paymentReference}</span>. {order.paymentStatus === 'pending' ? 'No payment has been confirmed and no funds have been charged. Seller fulfilment remains on hold.' : 'This is a sandbox transaction only; no real funds were transferred.'}
              </p>
            </div>
          </div>

          {import.meta.env.DEV && order.paymentStatus === 'pending' && order.paymentTransactionId && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="text-xs font-semibold text-amber-900">Local sandbox payment controls</div>
              <p className="text-xs text-amber-800">These controls only test the local payment lifecycle. They do not contact M-Pesa, charge a card or transfer money.</p>
              {paymentActionError && <p className="text-xs text-red-700">{paymentActionError}</p>}
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={paymentActionBusy} onClick={() => void handleSandboxPayment(true)} className="px-4 py-2 rounded-lg bg-[#141619] text-white text-xs font-semibold disabled:opacity-50">Mark sandbox payment successful</button>
                <button type="button" disabled={paymentActionBusy} onClick={() => void handleSandboxPayment(false)} className="px-4 py-2 rounded-lg border border-red-300 text-red-700 text-xs font-semibold disabled:opacity-50">Simulate payment failure</button>
              </div>
            </div>
          )}

          {order.fulfilmentMethod === 'store_collection' && order.collectionCode && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-amber-900">Your Secure Store Collection Code</div>
                <div className="text-xs text-amber-800">Present this code at {order.collectionPoint} once Stage-2 inspection clears.</div>
              </div>
              <div className="font-mono text-xl font-bold text-[#141619]">{order.collectionCode}</div>
            </div>
          )}

          <div className="border-t border-stone-100 pt-4 space-y-3">
            <h2 className="font-display text-sm font-bold">Purchased Items ({order.sellerItems.length})</h2>
            {order.sellerItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-xs text-stone-500">Qty {item.quantity} {item.variationLabel ? `· ${item.variationLabel}` : ''}</div>
                </div>
                <div className="font-mono font-semibold tabular-nums">{formatKSh(item.lineTotal)}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-100 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Fulfilment</span>
              <span>{order.fulfilmentMethod === 'delivery' ? `Delivery (${order.deliveryAddress?.town})` : order.collectionPoint}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2">
              <span>Order Total</span>
              <span className="font-mono tabular-nums">{formatKSh(order.totalAmount)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/track-order/${order.id}`)}
              className="px-5 py-2.5 rounded-lg bg-[#141619] text-white text-sm font-semibold cursor-pointer"
            >
              Track Order Progress
            </button>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="px-5 py-2.5 rounded-lg border border-stone-200 text-sm font-semibold hover:bg-stone-50 cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
