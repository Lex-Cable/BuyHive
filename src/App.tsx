import React from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { LandingPage } from './pages/LandingPage';
import { CustomerAuthPage } from './pages/CustomerAuthPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { ShopCatalogPage } from './pages/ShopCatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage, CheckoutPage, OrderConfirmationPage } from './pages/CartCheckoutPages';
import { OrdersHistoryPage, TrackOrderPage } from './pages/OrdersTrackingPage';
import {
  AccountPage,
  CouponsRewardsPage,
  FeedbackPage,
  SupportContactAboutPage,
  WishlistPage,
} from './pages/CustomerPortalPages';
import { SellerDashboardPage, SellerLandingAndAuthPage } from './pages/SellerPortalPages';

const ToastBanner: React.FC = () => {
  const { toastMessage, clearToast } = useMarketplace();
  if (!toastMessage) return null;
  const toneStyles =
    toastMessage.tone === 'error'
      ? 'bg-red-700 text-white'
      : toastMessage.tone === 'success'
      ? 'bg-emerald-800 text-white'
      : 'bg-[#141619] text-white';

  return (
    <div
      role="status"
      className={`fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 rounded-xl shadow-lg text-xs font-medium flex items-center justify-between gap-4 ${toneStyles}`}
    >
      <span>{toastMessage.text}</span>
      <button type="button" onClick={clearToast} className="opacity-75 hover:opacity-100 cursor-pointer">
        Dismiss
      </button>
    </div>
  );
};

const RouterView: React.FC = () => {
  const { currentPath, currentSearch, customerUser } = useMarketplace();
  const path = currentPath.replace(/\/+$/, '') || '/';
  const catalogKey = `${path}${currentSearch}`;

  // Customer & Public Routes
  if (path === '/') return customerUser ? <CustomerDashboard /> : <LandingPage />;
  if (path === '/login') return <CustomerAuthPage mode="login" />;
  if (path === '/register') return <CustomerAuthPage mode="register" />;
  if (path === '/forgot-password') return <CustomerAuthPage mode="forgot" />;
  if (path === '/dashboard') return customerUser ? <CustomerDashboard /> : <CustomerAuthPage mode="login" />;
  if (path === '/shop' || path === '/products') return <ShopCatalogPage key={catalogKey} mode="shop" />;
  if (path === '/categories') return <ShopCatalogPage key={catalogKey} mode="categories" />;
  if (path.startsWith('/categories/')) {
    return <ShopCatalogPage key={catalogKey} mode="shop" categorySlugParam={path.replace('/categories/', '')} />;
  }
  if (path === '/deals') return <ShopCatalogPage key={catalogKey} mode="deals" />;
  if (path === '/occasions') return <ShopCatalogPage key={catalogKey} mode="occasions" />;
  if (path === '/locations') return <ShopCatalogPage key={catalogKey} mode="locations" />;
  if (path === '/trending') return <ShopCatalogPage key={catalogKey} mode="trending" />;
  if (path === '/new-arrivals') return <ShopCatalogPage key={catalogKey} mode="new-arrivals" />;
  if (path.startsWith('/products/')) {
    return <ProductDetailPage productId={path.replace('/products/', '')} />;
  }
  if (path === '/cart') return <CartPage />;
  if (path === '/checkout') return <CheckoutPage />;
  if (path.startsWith('/order-confirmation/')) {
    return <OrderConfirmationPage orderId={path.replace('/order-confirmation/', '')} />;
  }
  if (path === '/orders') return <OrdersHistoryPage />;
  if (path.startsWith('/orders/') || path.startsWith('/track-order/')) {
    const id = path.replace('/orders/', '').replace('/track-order/', '');
    return <TrackOrderPage orderId={id} />;
  }
  if (path === '/wishlist') return <WishlistPage />;
  if (path === '/feedback') return <FeedbackPage />;
  if (path === '/coupons-rewards') return <CouponsRewardsPage />;
  if (path === '/account') return <AccountPage />;
  if (path === '/support') return <SupportContactAboutPage page="support" />;
  if (path === '/contact') return <SupportContactAboutPage page="contact" />;
  if (path === '/about') return <SupportContactAboutPage page="about" />;
  if (path.startsWith('/policies/')) {
    return <SupportContactAboutPage page="policy" policySlug={path.replace('/policies/', '')} />;
  }

  // Separate Seller Portal Routes (NO admin/management routes anywhere)
  if (path === '/seller') return <SellerLandingAndAuthPage mode="welcome" />;
  if (path === '/seller/login') return <SellerLandingAndAuthPage mode="login" />;
  if (path === '/seller/register') return <SellerLandingAndAuthPage mode="register" />;
  if (path === '/seller/dashboard') return <SellerDashboardPage activeTab="overview" />;
  if (path === '/seller/products/create') return <SellerDashboardPage activeTab="create-product" />;
  if (path === '/seller/products') return <SellerDashboardPage activeTab="products" />;
  if (path === '/seller/orders') return <SellerDashboardPage activeTab="orders" />;
  if (path === '/seller/sales') return <SellerDashboardPage activeTab="sales" />;
  if (path === '/seller/earnings') return <SellerDashboardPage activeTab="earnings" />;
  if (path === '/seller/payments') return <SellerDashboardPage activeTab="payments" />;
  if (path === '/seller/messages') return <SellerDashboardPage activeTab="messages" />;
  if (path === '/seller/reviews') return <SellerDashboardPage activeTab="reviews" />;
  if (path === '/seller/promotions') return <SellerDashboardPage activeTab="promotions" />;
  if (path === '/seller/settings') return <SellerDashboardPage activeTab="settings" />;
  if (path === '/seller/support') return <SellerDashboardPage activeTab="support" />;

  return <LandingPage />;
};

export default function App() {
  return (
    <MarketplaceProvider>
      <RouterView />
      <ToastBanner />
    </MarketplaceProvider>
  );
}
