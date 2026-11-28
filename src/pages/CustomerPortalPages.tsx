import React, { useState } from 'react';
import { Award, CheckCircle2, Heart, LifeBuoy, Lock, MessageSquare, Star } from 'lucide-react';
import { formatKSh, useMarketplace } from '../context/MarketplaceContext';
import { KENYAN_COUNTIES } from '../data/kenyaLocations';
import { MARKETPLACE_FAQS } from '../data/seedCatalog';
import { SupportTicket } from '../types/buyhive';
import { CustomerNavbar } from '../components/layout/CustomerNavbar';
import { Footer } from '../components/layout/Footer';
import { ProductCard } from '../components/products/ProductCard';

export const WishlistPage: React.FC = () => {
  const { customerUser, publicProducts, addToCart, toggleWishlist, navigate } = useMarketplace();

  if (!customerUser) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <CustomerNavbar />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">Sign In to View Your Wishlist</h1>
          <button type="button" onClick={() => navigate('/login')} className="px-6 py-2.5 rounded-lg bg-[#141619] text-white text-sm font-semibold cursor-pointer">
            Customer Login
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const savedProducts = customerUser.wishlistIds
    .map((id) => publicProducts.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
      <CustomerNavbar />
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Saved Wishlist ({savedProducts.length})</h1>
            <p className="text-sm text-stone-600 mt-1">Persisted across your BuyHive customer sessions.</p>
          </div>
        </div>

        {savedProducts.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-3">
            <Heart className="w-8 h-8 text-stone-300 mx-auto" />
            <h2 className="font-display text-lg font-semibold">No saved products yet</h2>
            <button type="button" onClick={() => navigate('/shop')} className="px-5 py-2.5 rounded-lg bg-[#141619] text-white text-xs font-semibold cursor-pointer">
              Explore Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {savedProducts.map((p) => (
              <div key={p.id} className="space-y-2">
                <ProductCard product={p} />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(p.id, p.variations[0]?.id, 1);
                      toggleWishlist(p.id);
                    }}
                    className="flex-1 py-2 rounded-lg border border-stone-200 bg-white text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                  >
                    Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export const FeedbackPage: React.FC = () => {
  const { customerUser, orders, feedbacks, submitOrderFeedback, navigate, notify } = useMarketplace();
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [overallRating, setOverallRating] = useState(5);
  const [wouldShopAgain, setWouldShopAgain] = useState(true);
  const [hadDifficulties, setHadDifficulties] = useState(false);
  const [difficultyDetails, setDifficultyDetails] = useState('');
  const [improvementSuggestion, setImprovementSuggestion] = useState('');
  const [comments, setComments] = useState('');
  const [ratings, setRatings] = useState({
    smoothExperience: 5,
    easyOrdering: 5,
    convenientPayment: 5,
    onTimeFulfilment: 5,
    matchedDescription: 5,
    goodCondition: 5,
    satisfactoryPackaging: 5,
    serviceSatisfaction: 5,
  });

  if (!customerUser) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <CustomerNavbar />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">Sign In to Access Customer Feedback</h1>
          <button type="button" onClick={() => navigate('/login')} className="px-6 py-2.5 rounded-lg bg-[#141619] text-white text-sm font-semibold cursor-pointer">
            Customer Login
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const eligibleOrders = orders.filter(
    (o) =>
      o.customerId === customerUser.id &&
      !o.feedbackSubmitted &&
      ((o.fulfilmentMethod === 'delivery' && o.deliveryConfirmed) ||
        (o.fulfilmentMethod === 'store_collection' && o.collectionConfirmed) ||
        o.status === 'completed')
  );

  const activeOrder = eligibleOrders.find((o) => o.id === selectedOrderId) ?? eligibleOrders[0];

  const questions: { key: keyof typeof ratings; label: string }[] = [
    { key: 'smoothExperience', label: '1. Was your shopping experience smooth?' },
    { key: 'easyOrdering', label: '2. Was the ordering process easy?' },
    { key: 'convenientPayment', label: '3. Was payment convenient?' },
    { key: 'onTimeFulfilment', label: '4. Was the product delivered or collected on time?' },
    { key: 'matchedDescription', label: '5. Did the product match its description?' },
    { key: 'goodCondition', label: '6. Was the product in good condition?' },
    { key: 'satisfactoryPackaging', label: '7. Was the packaging satisfactory?' },
    { key: 'serviceSatisfaction', label: "8. Were you satisfied with BuyHive's service?" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    const result = await submitOrderFeedback({
      orderId: activeOrder.id,
      orderNumber: activeOrder.orderNumber,
      overallRating,
      wouldShopAgain,
      answers: {
        ...ratings,
        hadDifficulties,
        difficultyDetails: hadDifficulties ? difficultyDetails : undefined,
        improvementSuggestion,
      },
      comments,
    });
    if (!result.ok) {
      notify(result.error || 'Unable to submit feedback.','error');
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
      <CustomerNavbar />
      <main className="flex-1 max-w-[960px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Customer Feedback & Satisfaction</h1>
          <p className="text-sm text-stone-600 mt-1">
            Feedback invitations unlock strictly after confirmed delivery or verified store collection receipt.
          </p>
        </div>

        {eligibleOrders.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-8 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#141619]">
              <Lock className="w-4 h-4 text-amber-800" />
              <span>No Eligible Confirmed Orders Pending Feedback</span>
            </div>
            <p className="text-sm text-stone-600">
              Orders appear here only once delivery is confirmed or store collection is verified with your secure collection code. You can check or test order progression in Track Order.
            </p>
            <button type="button" onClick={() => navigate('/orders')} className="px-4 py-2 rounded-lg bg-[#141619] text-white text-xs font-semibold cursor-pointer">
              Go to Order History
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <div className="text-xs font-semibold text-emerald-700">Receipt Confirmed · Eligible for Feedback</div>
                <h2 className="font-display text-lg font-bold mt-0.5">Order {activeOrder.orderNumber}</h2>
              </div>
              {eligibleOrders.length > 1 && (
                <select
                  value={activeOrder.id}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="h-9 px-3 text-xs border border-stone-200 rounded-lg bg-white"
                >
                  {eligibleOrders.map((o) => (
                    <option key={o.id} value={o.id}>{o.orderNumber} ({o.createdAt})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map((q) => (
                <div key={q.key} className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200 flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-[#141619]">{q.label}</span>
                  <div className="flex gap-1 shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatings((r) => ({ ...r, [q.key]: star }))}
                        className="cursor-pointer"
                        aria-label={`${star} stars`}
                      >
                        <Star className={`w-4 h-4 ${ratings[q.key] >= star ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  9. Did you experience any difficulties?
                </label>
                <div className="flex gap-3 text-xs">
                  <button type="button" onClick={() => setHadDifficulties(false)} className={`px-3.5 py-1.5 rounded-lg border cursor-pointer ${!hadDifficulties ? 'bg-[#141619] text-white border-[#141619]' : 'border-stone-200'}`}>No</button>
                  <button type="button" onClick={() => setHadDifficulties(true)} className={`px-3.5 py-1.5 rounded-lg border cursor-pointer ${hadDifficulties ? 'bg-[#141619] text-white border-[#141619]' : 'border-stone-200'}`}>Yes</button>
                </div>
                {hadDifficulties && (
                  <input
                    value={difficultyDetails}
                    onChange={(e) => setDifficultyDetails(e.target.value)}
                    placeholder="Please describe any difficulty or complaint..."
                    className="mt-2 w-full h-10 px-3 text-sm border border-stone-200 rounded-lg"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  10. What would you like BuyHive to improve?
                </label>
                <input
                  value={improvementSuggestion}
                  onChange={(e) => setImprovementSuggestion(e.target.value)}
                  placeholder="Suggestions for packaging, inspection, delivery timing, or selection..."
                  className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Overall Satisfaction Rating</label>
                  <select value={overallRating} onChange={(e) => setOverallRating(Number(e.target.value))} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg bg-white">
                    <option value={5}>5 Stars — Excellent</option>
                    <option value={4}>4 Stars — Good</option>
                    <option value={3}>3 Stars — Satisfactory</option>
                    <option value={2}>2 Stars — Needs Improvement</option>
                    <option value={1}>1 Star — Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Would you shop with BuyHive again?</label>
                  <select value={wouldShopAgain ? 'yes' : 'no'} onChange={(e) => setWouldShopAgain(e.target.value === 'yes')} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg bg-white">
                    <option value="yes">Yes, definitely</option>
                    <option value="no">Not at this time</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Written Review / Comments</label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share your honest experience with the product condition and BuyHive delivery..."
                  className="w-full p-3 text-sm border border-stone-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-lg bg-[#141619] hover:bg-stone-800 text-white text-sm font-semibold cursor-pointer">
                Submit Verified Feedback (+50 pts)
              </button>
              <button type="button" onClick={() => navigate('/dashboard')} className="px-5 py-2.5 rounded-lg border border-stone-200 text-sm font-medium cursor-pointer">
                Skip & Return Later
              </button>
            </div>
          </form>
        )}

        {feedbacks.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold">Your Submitted Feedback History</h2>
            {feedbacks.map((fb) => (
              <div key={fb.id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between text-sm">
                <div>
                  <div className="font-semibold">Order {fb.orderNumber} · {fb.overallRating}/5 Stars</div>
                  <p className="text-xs text-stone-600 mt-0.5">{fb.comments}</p>
                </div>
                <span className="text-xs font-mono text-stone-400">{fb.createdAt}</span>
              </div>
            ))}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export const CouponsRewardsPage: React.FC = () => {
  const { customerUser, coupons, rewardTransactions, redeemRewardPoints, navigate } = useMarketplace();

  if (!customerUser) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <CustomerNavbar />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">Sign In to View Coupons & Rewards</h1>
          <button type="button" onClick={() => navigate('/login')} className="px-6 py-2.5 rounded-lg bg-[#141619] text-white text-sm font-semibold cursor-pointer">
            Customer Login
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
      <CustomerNavbar />
      <main className="flex-1 max-w-[1150px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800">
              <Award className="w-4 h-4" />
              <span>BuyHive Loyalty & Coupons</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Available Points: <span className="font-mono tabular-nums">{customerUser.loyaltyPoints} pts</span>
            </h1>
            <p className="text-sm text-stone-600">Earn points on confirmed orders and verified feedback. Redeem points for backend-validated vouchers.</p>
          </div>
          <button
            type="button"
            disabled={customerUser.loyaltyPoints < 200}
            onClick={() => redeemRewardPoints(200)}
            className="px-5 py-2.5 rounded-lg bg-[#141619] hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
          >
            Redeem 200 pts → KSh 400 Coupon
          </button>
        </div>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">Coupons (Active, Used & Expired)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((c) => (
              <div key={c.code} className="bg-white border border-stone-200 rounded-xl p-5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#141619]">{c.code}</span>
                    <span className={`text-xs font-semibold capitalize ${c.status === 'active' ? 'text-emerald-700' : 'text-stone-400'}`}>
                      · {c.status}
                    </span>
                  </div>
                  <div className="text-sm font-semibold">{c.title}</div>
                  <p className="text-xs text-stone-600">{c.description}</p>
                  <div className="text-[11px] text-stone-400 pt-1">
                    Min order {formatKSh(c.minOrderAmount)} · Expires {c.expiresAt}
                  </div>
                </div>
                <div className="font-mono text-base font-bold text-amber-800 shrink-0">
                  {c.discountType === 'percentage' ? `${c.discountValue}%` : formatKSh(c.discountValue)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-lg font-bold">Points History</h2>
          <div className="divide-y divide-stone-100 text-sm">
            {rewardTransactions.map((rt) => (
              <div key={rt.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{rt.description}</div>
                  <div className="text-xs text-stone-400">{rt.date}</div>
                </div>
                <span className={`font-mono font-semibold tabular-nums ${rt.points >= 0 ? 'text-emerald-700' : 'text-amber-800'}`}>
                  {rt.points >= 0 ? `+${rt.points}` : rt.points} pts
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export const AccountPage: React.FC = () => {
  const { customerUser, updateCustomerProfile, addCustomerAddress, logoutCustomer, navigate } = useMarketplace();
  const [fullName, setFullName] = useState(customerUser?.fullName ?? '');
  const [phone, setPhone] = useState(customerUser?.phone ?? '');
  const [addrLabel, setAddrLabel] = useState('');
  const [addrCounty, setAddrCounty] = useState('nairobi');
  const [addrTown, setAddrTown] = useState('');
  const [addrStreet, setAddrStreet] = useState('');

  if (!customerUser) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <CustomerNavbar />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">My Account</h1>
          <button type="button" onClick={() => navigate('/login')} className="px-6 py-2.5 rounded-lg bg-[#141619] text-white text-sm font-semibold cursor-pointer">
            Customer Login
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
      <CustomerNavbar />
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center justify-between border-b border-stone-200 pb-5">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">My Customer Account</h1>
            <p className="text-sm text-stone-600 mt-1">{customerUser.email} · {customerUser.emailVerified ? 'Email Verified' : 'Pending Verification'}</p>
          </div>
          <button type="button" onClick={logoutCustomer} className="px-4 py-2 rounded-lg border border-stone-300 text-xs font-semibold hover:bg-white cursor-pointer">
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Order History', path: '/orders' },
            { label: 'Saved Wishlist', path: '/wishlist' },
            { label: 'Coupons & Rewards', path: '/coupons-rewards' },
            { label: 'Customer Feedback', path: '/feedback' },
          ].map((q) => (
            <button
              key={q.path}
              type="button"
              onClick={() => navigate(q.path)}
              className="p-4 rounded-xl bg-white border border-stone-200 text-left text-sm font-semibold hover:border-amber-700 cursor-pointer"
            >
              {q.label} →
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateCustomerProfile({ fullName, phone });
            }}
            className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4"
          >
            <h2 className="font-display text-lg font-bold">Personal Information</h2>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
            </div>
            <button type="submit" className="px-5 py-2.5 rounded-lg bg-[#141619] text-white text-xs font-semibold cursor-pointer">
              Save Profile Changes
            </button>
          </form>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold">Saved Delivery Addresses</h2>
            <div className="space-y-2.5">
              {customerUser.savedAddresses.map((addr) => (
                <div key={addr.id} className="p-3 rounded-lg bg-[#FAF9F6] border border-stone-200 text-xs">
                  <div className="font-semibold">{addr.label}</div>
                  <div className="text-stone-600">{addr.street}, {addr.town}, {KENYAN_COUNTIES.find((c) => c.slug === addr.countySlug)?.name}</div>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!addrLabel || !addrTown || !addrStreet) return;
                addCustomerAddress({ label: addrLabel, countySlug: addrCounty, town: addrTown, street: addrStreet });
                setAddrLabel('');
                setAddrTown('');
                setAddrStreet('');
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-stone-100"
            >
              <input value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} placeholder="Label (e.g. Home)" className="h-9 px-3 text-xs border border-stone-200 rounded-lg" />
              <select value={addrCounty} onChange={(e) => setAddrCounty(e.target.value)} className="h-9 px-2 text-xs border border-stone-200 rounded-lg bg-white">
                {KENYAN_COUNTIES.map((c) => <option key={c.code} value={c.slug}>{c.name}</option>)}
              </select>
              <input value={addrTown} onChange={(e) => setAddrTown(e.target.value)} placeholder="Town / Estate" className="h-9 px-3 text-xs border border-stone-200 rounded-lg" />
              <input value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} placeholder="Street / Apt" className="h-9 px-3 text-xs border border-stone-200 rounded-lg" />
              <button type="submit" className="sm:col-span-2 py-2 rounded-lg border border-stone-300 text-xs font-semibold hover:bg-stone-50 cursor-pointer">
                Add New Address
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export const SupportContactAboutPage: React.FC<{ page: 'support' | 'contact' | 'about' | 'policy'; policySlug?: string }> = ({
  page,
  policySlug,
}) => {
  const { tickets, customerUser, createSupportTicket, notify } = useMarketplace();
  const [category, setCategory] = useState<SupportTicket['category']>('General Enquiry');
  const [subject, setSubject] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  if (page === 'about') {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
        <CustomerNavbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-amber-800">About BuyHive</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">Connecting Buyers and Verified Sellers Through Physical Inspection</h1>
            <p className="text-base text-stone-600 leading-relaxed">
              BuyHive is an online multi-vendor marketplace built to solve trust in East African e-commerce. We do not buy or store retail inventory — instead, we empower independent retailers, manufacturers, and artisans to list products while BuyHive safeguards every transaction through a rigorous Two-Stage Product Inspection workflow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-2">
              <h2 className="font-display text-lg font-bold">Stage-1 Pre-Listing Inspection</h2>
              <p className="text-sm text-stone-600">Before any listing appears publicly, BuyHive inspectors physically verify the item’s condition, authenticity, and category compliance.</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-2">
              <h2 className="font-display text-lg font-bold">Stage-2 Pre-Dispatch Inspection</h2>
              <p className="text-sm text-stone-600">After purchase, our field agents collect the product from the seller and our bay verifies it matches the approved listing before dispatch.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (page === 'contact') {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
        <CustomerNavbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-4">
            <h1 className="font-display text-3xl font-bold">Contact BuyHive</h1>
            <p className="text-sm text-stone-600">Questions about an order, product inspection, or becoming a seller? Reach BuyHive directly.</p>
            <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-2 text-sm">
              <div><span className="font-semibold">Support Email:</span> support@buyhive.co.ke</div>
              <div><span className="font-semibold">Phone:</span> +254 700 289 448</div>
              <div><span className="font-semibold">Flagship Hub:</span> Westlands, Nairobi, Kenya</div>
            </div>
          </div>
          <div className="md:col-span-7 bg-white border border-stone-200 rounded-2xl p-6">
            {contactSent ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 space-y-2">
                <div className="font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Enquiry Received</div>
                <p>Our BuyHive customer care desk will respond within 1 business day.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSent(true);
                  notify('Enquiry sent to BuyHive Customer Care.', 'success');
                }}
                className="space-y-4"
              >
                <h2 className="font-display text-lg font-bold">Send an Enquiry</h2>
                <input required placeholder="Your Name" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                <input required type="email" placeholder="Your Email" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
                <textarea required rows={4} placeholder="How can BuyHive assist you?" className="w-full p-3 text-sm border border-stone-200 rounded-lg" />
                <button type="submit" className="px-6 py-2.5 rounded-lg bg-[#141619] text-white text-sm font-semibold cursor-pointer">
                  Submit Enquiry
                </button>
              </form>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (page === 'policy') {
    const titles: Record<string, string> = {
      terms: 'Terms and Conditions',
      privacy: 'Privacy Policy',
      returns: 'Returns and Refunds Policy',
      delivery: 'Delivery & Collection Hub Information',
    };
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
        <CustomerNavbar />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 space-y-5">
          <h1 className="font-display text-3xl font-bold">{titles[policySlug ?? 'terms'] ?? 'BuyHive Policy'}</h1>
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-4 text-sm text-stone-700 leading-relaxed">
            <p>BuyHive acts strictly as the trusted marketplace intermediary connecting buyers and independent sellers. Sellers retain ownership of approved listings until purchase and Stage-2 pre-dispatch verification.</p>
            <p>All customer and seller personal contact details remain confidential inside BuyHive. Refunds for failed Stage-2 inspections or verified damaged/incorrect items are processed back to the original M-Pesa, card, or PayPal channel.</p>
            <p>Nationwide delivery covers all 47 Kenyan counties, alongside free verified pickup at BuyHive Hubs in Nairobi, Kiambu, Mombasa, Kisumu, Nakuru, and Eldoret.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Customer Support Page
  const myTickets = tickets.filter((t) => t.userRole === 'customer' && (!customerUser || t.userId === customerUser.id));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
      <CustomerNavbar />
      <main className="flex-1 max-w-[1150px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Customer Support Desk</h1>
          <p className="text-sm text-stone-600 mt-1">BuyHive handles all buyer support, disputes, returns, and inspection escalations directly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!subject.trim() || !message.trim()) return;
              createSupportTicket({ userRole: 'customer', category, subject, orderNumber: orderNumber || undefined, message });
              setSubject('');
              setOrderNumber('');
              setMessage('');
            }}
            className="lg:col-span-6 bg-white border border-stone-200 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2 text-base font-bold">
              <LifeBuoy className="w-5 h-5 text-amber-800" />
              <span>Open a Support Ticket</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Issue Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as SupportTicket['category'])} className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg bg-white">
                <option>General Enquiry</option>
                <option>Complaint</option>
                <option>Damaged Product</option>
                <option>Missing Product</option>
                <option>Incorrect Product</option>
                <option>Payment Issue</option>
                <option>Delivery Delay</option>
                <option>Collection Issue</option>
                <option>Return Request</option>
                <option>Refund Request</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Order Number (Optional)</label>
              <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="e.g. BH-ORD-8390" className="w-full h-10 px-3 text-sm font-mono border border-stone-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Subject</label>
              <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary" className="w-full h-10 px-3 text-sm border border-stone-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Details</label>
              <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe the issue..." className="w-full p-3 text-sm border border-stone-200 rounded-lg" />
            </div>
            <button type="submit" className="px-6 py-2.5 rounded-lg bg-[#141619] text-white text-sm font-semibold cursor-pointer">
              Submit Support Ticket
            </button>
          </form>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 font-display text-base font-bold">
                <MessageSquare className="w-4 h-4 text-amber-800" />
                <span>Your Tickets ({myTickets.length})</span>
              </div>
              {myTickets.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#141619]">{t.ticketNumber} · {t.category}</span>
                    <span className="font-semibold text-emerald-700">{t.status}</span>
                  </div>
                  <div className="font-semibold text-sm text-[#141619]">{t.subject}</div>
                  <p className="text-stone-600">{t.replies[t.replies.length - 1]?.text}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
              <h2 className="font-display text-base font-bold">Quick Support FAQs</h2>
              {MARKETPLACE_FAQS.slice(0, 3).map((f) => (
                <div key={f.q} className="text-xs space-y-1 border-t border-stone-100 pt-2.5 first:border-0 first:pt-0">
                  <div className="font-semibold text-[#141619]">{f.q}</div>
                  <div className="text-stone-600">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
