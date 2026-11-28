import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, PackageCheck, ShieldAlert, ShieldCheck } from 'lucide-react';
import { formatKSh, useMarketplace } from '../context/MarketplaceContext';
import { CustomerNavbar } from '../components/layout/CustomerNavbar';
import { Footer } from '../components/layout/Footer';

export const OrdersHistoryPage: React.FC = () => {
  const { customerUser, orders, navigate } = useMarketplace();

  if (!customerUser) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <CustomerNavbar />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">Sign In to View Your Orders</h1>
          <button type="button" onClick={() => navigate('/login')} className="px-6 py-2.5 rounded-lg bg-[#141619] text-white text-sm font-semibold cursor-pointer">
            Customer Login
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const myOrders = orders.filter((o) => o.customerId === customerUser.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
      <CustomerNavbar />
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Order History</h1>
          <p className="text-sm text-stone-600 mt-1">Track Stage-2 inspection, delivery progress, and collection confirmation.</p>
        </div>

        {myOrders.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-3">
            <h2 className="font-display text-lg font-semibold">No orders placed yet</h2>
            <button type="button" onClick={() => navigate('/shop')} className="px-5 py-2.5 rounded-lg bg-[#141619] text-white text-xs font-semibold cursor-pointer">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map((order) => (
              <div key={order.id} className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 text-xs text-stone-500">
                      <span className="font-mono font-bold text-[#141619] text-sm">{order.orderNumber}</span>
                      <span>·</span>
                      <span>{order.createdAt}</span>
                      <span>·</span>
                      <span className="capitalize">{order.fulfilmentMethod.replace('_', ' ')}</span>
                    </div>
                    <div className="text-xs text-stone-600">
                      Status: <span className="font-semibold text-amber-800 capitalize">{order.status.replace(/_/g, ' ')}</span>
                      {' · '}
                      Payment: <span className="font-medium text-emerald-700">{order.paymentMethod.toUpperCase()} ({order.paymentReference})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold tabular-nums">{formatKSh(order.totalAmount)}</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/track-order/${order.id}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141619] text-white text-xs font-semibold cursor-pointer"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.sellerItems.map((si) => (
                    <div key={si.id} className="flex items-center gap-3 text-xs">
                      <img src={si.productImage} alt={si.productName} className="w-14 h-11 rounded object-cover bg-stone-100" />
                      <div>
                        <div className="font-semibold text-[#141619]">{si.productName}</div>
                        <div className="text-stone-500">Qty {si.quantity} · {formatKSh(si.lineTotal)}</div>
                      </div>
                    </div>
                  ))}
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

export const TrackOrderPage: React.FC<{ orderId: string }> = ({ orderId }) => {
  const {
    orders,
    customerUser,
    confirmStoreCollectionWithCode,
    navigate,
  } = useMarketplace();
  const [collectionCodeInput, setCollectionCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  const order = orders.find((o) => o.id === orderId && (!customerUser || o.customerId === customerUser.id));

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <CustomerNavbar />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">Order Not Found</h1>
          <button type="button" onClick={() => navigate('/orders')} className="px-5 py-2.5 rounded-lg bg-[#141619] text-white text-sm font-semibold cursor-pointer">
            Back to Order History
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const receiptConfirmed =
    (order.fulfilmentMethod === 'delivery' && order.deliveryConfirmed) ||
    (order.fulfilmentMethod === 'store_collection' && order.collectionConfirmed) ||
    order.status === 'completed';

  const handleConfirmCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');
    const res = await confirmStoreCollectionWithCode(order.id, collectionCodeInput);
    if (!res.ok) setCodeError(res.error || 'Invalid code');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141619]">
      <CustomerNavbar />
      <main className="flex-1 max-w-[1050px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <p className="text-xs font-semibold text-amber-800">BuyHive Coordinated Fulfilment</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1">Track Order {order.orderNumber}</h1>
            <p className="text-xs text-stone-500 mt-1">
              Field agent personal locations & private seller addresses are never exposed.
            </p>
          </div>
          <div className="text-right">
            <div className="font-mono text-lg font-bold tabular-nums">{formatKSh(order.totalAmount)}</div>
            <div className="text-xs font-semibold text-emerald-700 capitalize">{order.status.replace(/_/g, ' ')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Timeline */}
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
            <h2 className="font-display text-lg font-bold">Order & Stage-2 Inspection Timeline</h2>
            <div className="space-y-4">
              {order.statusHistory.map((ev, idx) => (
                <div key={idx} className="flex gap-3.5">
                  <div className="mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="flex-1 pb-4 border-b border-stone-100 last:border-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-semibold text-[#141619]">{ev.label}</span>
                      <span className="font-mono text-[11px] text-stone-400">{ev.timestamp}</span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">{ev.note}</p>
                  </div>
                </div>
              ))}
            </div>


          </div>

          {/* Right Panel: Collection Verification or Feedback Gate */}
          <div className="lg:col-span-5 space-y-5">
            {order.fulfilmentMethod === 'store_collection' && order.status === 'ready_for_collection' && !order.collectionConfirmed && (
              <form onSubmit={handleConfirmCollection} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#141619]">
                  <PackageCheck className="w-5 h-5 text-emerald-700" />
                  <span>Confirm Store Collection</span>
                </div>
                <p className="text-xs text-stone-600">
                  Hub: <span className="font-semibold">{order.collectionPoint}</span>. Enter the collection code provided by BuyHive at the collection hub to verify receipt and unlock feedback.
                </p>
                {codeError && <p className="text-xs text-red-600 font-medium">{codeError}</p>}
                <input
                  value={collectionCodeInput}
                  onChange={(e) => setCollectionCodeInput(e.target.value)}
                  placeholder="Enter collection code e.g. BH-482910"
                  className="w-full h-10 px-3 text-sm font-mono border border-stone-200 rounded-lg uppercase"
                />
                <button type="submit" className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer">
                  Verify Collection Receipt
                </button>
              </form>
            )}

            <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <ShieldCheck className="w-5 h-5 text-amber-800" />
                <span>Feedback Eligibility Status</span>
              </div>
              {receiptConfirmed ? (
                order.feedbackSubmitted ? (
                  <p className="text-xs text-emerald-700 font-medium">
                    Verified feedback has already been submitted for this order. Thank you!
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-emerald-700 font-medium">
                      Receipt confirmed! You are now eligible to rate this order and earn +50 loyalty points.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/feedback')}
                      className="w-full py-2.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold cursor-pointer"
                    >
                      Open Feedback Survey
                    </button>
                  </div>
                )
              ) : (
                <p className="text-xs text-stone-600">
                  Feedback is locked until actual delivery or store collection receipt is confirmed. Checkout or payment alone does not unlock feedback.
                </p>
              )}
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
              <h3 className="font-display text-sm font-bold">Items & Stage-2 Inspection Status</h3>
              {order.sellerItems.map((si) => (
                <div key={si.id} className="text-xs border-t border-stone-100 pt-3 first:border-0 first:pt-0 space-y-1">
                  <div className="font-semibold text-[#141619]">{si.productName} (x{si.quantity})</div>
                  <div className="text-stone-500">
                    Stage-2 Inspection: <span className="font-medium text-[#141619] capitalize">{si.stageTwoStatus.replace(/_/g, ' ')}</span>
                  </div>
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
