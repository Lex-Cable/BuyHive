import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  CartItem,
  Coupon,
  CustomerFeedback,
  CustomerUser,
  FulfilmentMethod,
  Order,
  OrderStatus,
  PaymentMethodId,
  Product,
  ProductReview,
  RewardTransaction,
  SellerMessage,
  SellerOrderItem,
  SellerPayout,
  SellerType,
  SellerUser,
  StageOneInspectionStatus,
  SupportTicket,
} from '../types/buyhive';
import {
  DEFAULT_MARKETPLACE_COMMISSION_PERCENT,
  INITIAL_COUPONS,
  INITIAL_CUSTOMER,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_REWARD_TRANSACTIONS,
  INITIAL_SELLER_MESSAGES,
  INITIAL_SELLER_PAYOUTS,
  INITIAL_SELLERS,
  INITIAL_TICKETS,
} from '../data/seedCatalog';
import { CATEGORIES, IMG_HERO } from '../data/categories';
import { fetchPublicCatalog, getStorefrontSession, loginStorefront, logoutStorefront, registerStorefront, fetchStorefrontMeta, fetchApiCart, addApiCartItem, updateApiCartItem, deleteApiCartItem, fetchApiOrders, checkoutApiOrder, createApiSellerProduct, confirmApiCollection, fetchApiSellerProducts, submitApiOrderFeedback, confirmApiSandboxPayment, fetchApiWishlist, toggleApiWishlist, fetchApiAddresses, saveApiAddress, updateApiCustomerProfile, fetchApiRewards, redeemApiRewards, createApiTicket, updateApiSellerProfile, saveApiSellerPayoutAccount, markApiSellerMessageRead, updateApiSellerProduct, resubmitApiSellerProduct, markApiSellerItemReady, requestApiSellerPayout, fetchApiSellerOrders, fetchApiSellerMessages, type ApiUser, type ApiOrder } from '../lib/buyhiveApi';

export function formatKSh(amount: number): string {
  return `KSh ${Math.round(amount).toLocaleString('en-KE')}`;
}

interface MarketplaceState {
  customerUser: CustomerUser | null;
  sellerUser: SellerUser | null;
  sellers: SellerUser[];
  products: Product[];
  reviews: ProductReview[];
  cart: CartItem[];
  orders: Order[];
  coupons: Coupon[];
  rewardTransactions: RewardTransaction[];
  feedbacks: CustomerFeedback[];
  tickets: SupportTicket[];
  sellerMessages: SellerMessage[];
  sellerPayouts: SellerPayout[];
  commissionConfigPercent: number;
}

interface MarketplaceContextValue extends MarketplaceState {
  currentPath: string;
  currentSearch: string;
  navigate: (path: string) => void;
  // Customer-safe public catalog projection (only approved & published from approved sellers)
  publicProducts: Product[];
  toastMessage: { text: string; tone: 'success' | 'error' | 'info' } | null;
  clearToast: () => void;
  notify: (text: string, tone?: 'success' | 'error' | 'info') => void;
  // Auth (Strictly Separated)
  loginCustomer: (emailOrPhone: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  registerCustomer: (data: { fullName: string; email: string; phone: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  logoutCustomer: () => void;
  loginSeller: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  registerSeller: (data: {
    fullName: string;
    businessName: string;
    sellerType: SellerType;
    email: string;
    phone: string;
    countySlug: string;
    town: string;
    businessDescription: string;
    kraOrIdRef: string;
    payoutMethod: 'mpesa_till' | 'mpesa_phone' | 'bank_transfer';
    payoutAccountLabel: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  logoutSeller: () => void;
  // Customer Actions
  recordProductView: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  addToCart: (productId: string, variationId?: string, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  validateCouponServerSide: (code: string, subtotal: number) => {
    valid: boolean;
    discount: number;
    coupon?: Coupon;
    reason?: string;
  };
  placeCheckoutOrder: (payload: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    fulfilmentMethod: FulfilmentMethod;
    deliveryAddress?: { countySlug: string; town: string; street: string };
    collectionPoint?: string;
    orderNotes?: string;
    couponCode?: string;
    paymentMethod: PaymentMethodId;
    mpesaPhone?: string;
  }) => Promise<{ ok: boolean; order?: Order; error?: string }>;
  confirmStoreCollectionWithCode: (orderId: string, code: string) => Promise<{ ok: boolean; error?: string }>;
  confirmSandboxPayment: (orderId: string, succeeded?: boolean) => Promise<{ok:boolean;error?:string}>;
  advanceOrderFulfilmentStage: (orderId: string, simulateStage2Failure?: boolean) => void;
  submitOrderFeedback: (feedback: Omit<CustomerFeedback, 'id' | 'customerId' | 'createdAt'>) => Promise<{ ok: boolean; error?: string }>;
  redeemRewardPoints: (points: number) => { ok: boolean; couponCode?: string; error?: string };
  addCustomerAddress: (addr: { label: string; countySlug: string; town: string; street: string }) => void;
  updateCustomerProfile: (data: { fullName: string; phone: string }) => void;
  createSupportTicket: (data: {
    userRole: 'customer' | 'seller';
    category: SupportTicket['category'];
    subject: string;
    orderNumber?: string;
    message: string;
  }) => void;
  // Seller Portal Actions
  createSellerProduct: (payload: {
    name: string;
    categoryId: string;
    subcategoryId: string;
    brand: string;
    description: string;
    specifications: Record<string, string>;
    condition: Product['condition'];
    images: string[];
    price: number;
    stock: number;
    countySlug: string;
    town: string;
    deliveryAvailable: boolean;
    collectionAvailable: boolean;
    warrantyInfo?: string;
    variations: { label: string; size?: string; colour?: string; model?: string; priceDelta: number; stock: number }[];
    saveAsDraft?: boolean;
  }) => Promise<{ ok: boolean; product?: Product; error?: string }>;
  updateSellerProductStock: (productId: string, stock: number) => void;
  toggleSellerProductPause: (productId: string) => void;
  resubmitSellerProduct: (productId: string) => void;
  markSellerItemReadyForPickup: (orderItemId: string) => void;
  markSellerMessageRead: (messageId: string) => void;
  updateSellerSettings: (data: {
    businessName: string;
    phone: string;
    town: string;
    businessDescription: string;
    payoutMethod: SellerUser['payoutMethod'];
    payoutAccountLabel: string;
  }) => void;
  requestSellerPayout: () => { ok: boolean; error?: string };
  resetDemoState: () => void;
}

const STORAGE_KEY = 'buyhive_marketplace_v1';

const defaultState = (): MarketplaceState => ({
  customerUser: null,
  sellerUser: null,
  sellers: INITIAL_SELLERS,
  products: INITIAL_PRODUCTS,
  reviews: INITIAL_REVIEWS,
  cart: [],
  orders: INITIAL_ORDERS,
  coupons: INITIAL_COUPONS,
  rewardTransactions: INITIAL_REWARD_TRANSACTIONS,
  feedbacks: [],
  tickets: INITIAL_TICKETS,
  sellerMessages: INITIAL_SELLER_MESSAGES,
  sellerPayouts: INITIAL_SELLER_PAYOUTS,
  commissionConfigPercent: DEFAULT_MARKETPLACE_COMMISSION_PERCENT,
});

const mapApiUser = (user: ApiUser): { customerUser: CustomerUser | null; sellerUser: SellerUser | null } => {
  if (user.role === 'customer') return {
    customerUser: { id:user.id,fullName:user.name,email:user.email,phone:user.phone ?? '',emailVerified:user.email_verified,
      loyaltyPoints:user.loyalty_points ?? 0,savedAddresses:[],recentlyViewedIds:[],wishlistIds:[] },
    sellerUser: null,
  };
  const seller=user.seller;
  return { customerUser:null, sellerUser:{
    id:user.id,fullName:user.name,businessName:seller?.business_name ?? user.name,sellerType:seller?.seller_type ?? 'individual',
    email:user.email,phone:user.phone ?? '',emailVerified:user.email_verified,verificationStatus:seller?.verification_status ?? 'pending_verification',
    countySlug:'',town:seller?.town ?? '',businessDescription:'',kraOrIdRef:'',payoutMethod:'mpesa_till',payoutAccountLabel:'',
    commissionRatePercent:DEFAULT_MARKETPLACE_COMMISSION_PERCENT,joinedAt:new Date().toISOString().slice(0,10),
  }};
};
const mapApiSellerProduct = (record:any,sellerId:string,meta:{categories:any[];locations:any[]}):Product => {
  const categoryRecord=meta.categories.find((item)=>String(item.id)===String(record.category_id));
  const subcategoryIndex=(categoryRecord?.subcategories ?? []).findIndex((item:any)=>String(item.id)===String(record.subcategory_id));
  const category=CATEGORIES.find((item)=>item.id===`cat-${categoryRecord?.sort_order ?? 0}`);
  const location=meta.locations.find((item)=>String(item.id)===String(record.location_id));
  return {
    id:String(record.id),sku:record.sku,sellerId,name:record.name,slug:record.slug,
    categoryId:category?.id ?? '',subcategoryId:category&&subcategoryIndex>=0?category.subcategories[subcategoryIndex]?.id ?? '':'',
    brand:record.brand ?? '',description:record.description ?? '',specifications:record.specifications ?? {},
    condition:record.condition ?? 'New',images:(record.images ?? []).map((path:string)=>path.startsWith('http')?path:`/storage/${path}`),
    price:Number(record.price),stock:Number(record.stock),countySlug:location?.slug ?? '',town:record.town ?? '',
    deliveryAvailable:Boolean(record.delivery_available),collectionAvailable:Boolean(record.collection_available),
    warrantyInfo:record.warranty_info ?? undefined,variations:[],occasionSlugs:[],stageOneStatus:record.stage_one_status,
    isPublished:Boolean(record.is_published),isPaused:Boolean(record.is_paused),viewsCount:0,salesCount:0,
    ratingAverage:0,ratingCount:0,createdAt:new Date().toISOString().slice(0,10),inspectionHistory:[],
  };
};
const mapApiOrder = (order: ApiOrder, customer?: CustomerUser | null): Order => ({
  id:order.id,orderNumber:order.order_number,customerId:order.customer_id,customerName:customer?.fullName ?? '',
  customerPhone:customer?.phone ?? '',customerEmail:customer?.email ?? '',fulfilmentMethod:order.fulfilment_method,
  deliveryAddress:order.fulfilment_method==='delivery'?{countySlug:'',town:order.delivery_town ?? '',street:order.delivery_street ?? ''}:undefined,
  collectionPoint:order.collection_hub_name,collectionCode:order.collection_code ?? undefined,collectionConfirmed:order.collection_confirmed,
  deliveryConfirmed:order.delivery_confirmed,paymentMethod:order.payment_method,
  paymentStatus:order.payment_status==='paid'?'paid_sandbox':order.payment_status,paymentReference:order.payment_reference ?? 'Awaiting payment confirmation',
  subtotal:order.subtotal,productDiscounts:0,couponDiscount:order.coupon_discount,deliveryFee:order.delivery_fee,taxAmount:0,totalAmount:order.total_amount,
  status:order.status,statusHistory:(order.status_history ?? []).map((event)=>({status:event.status,label:event.label,timestamp:event.timestamp,note:event.note ?? ''})),
  sellerItems:(order.items ?? []).map((item)=>({id:item.id,orderId:order.id,orderNumber:order.order_number,sellerId:'',
    productId:item.product_id,productName:item.product_name,productImage:item.product_image ?? IMG_HERO,quantity:item.quantity,
    unitPrice:item.unit_price,lineTotal:item.line_total,commissionRatePercent:DEFAULT_MARKETPLACE_COMMISSION_PERCENT,
    commissionAmount:0,netSellerProceeds:item.line_total,preparationDeadline:'',fulfilmentInstructions:'',
    collectionStatus:'pending_prep',stageTwoStatus:item.stage_two_status as SellerOrderItem['stageTwoStatus'],earningsStatus:'pending'})),
  feedbackSubmitted:order.feedback_submitted,createdAt:order.created_at?.slice(0,10) ?? '',
});

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MarketplaceState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultState(), ...JSON.parse(saved), customerUser: null, sellerUser: null };
      }
    } catch {
      // ignore storage errors
    }
    return defaultState();
  });

  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [currentSearch, setCurrentSearch] = useState<string>(() => window.location.search || '');
  const [toastMessage, setToastMessage] = useState<{ text: string; tone: 'success' | 'error' | 'info' } | null>(null);
  const [catalogSource, setCatalogSource] = useState<'demo' | 'api'>('demo');
  const [backendSession, setBackendSession] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, customerUser: null, sellerUser: null }));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  useEffect(() => {
    let cancelled = false;

    getStorefrontSession().then(({authenticated,user}) => {
      if(cancelled)return;
      if(!authenticated || !user){setBackendSession(false);setState((previous)=>({...previous,customerUser:null,sellerUser:null}));return;}
      setBackendSession(true);
      const mapped=mapApiUser(user);
      setState((previous)=>({...previous,customerUser:mapped.customerUser,sellerUser:mapped.sellerUser,
        sellers:mapped.sellerUser?[mapped.sellerUser,...previous.sellers.filter((s)=>s.id!==mapped.sellerUser!.id)]:previous.sellers}));
      if(mapped.sellerUser) Promise.all([fetchApiSellerProducts(),fetchStorefrontMeta()]).then(([products,meta])=>{
        if(cancelled)return;
        const mappedProducts:Product[]=products.data.map((record:any)=>mapApiSellerProduct(record,mapped.sellerUser!.id,meta));
        setState((previous)=>({...previous,products:[...mappedProducts,...previous.products.filter((p)=>!mappedProducts.some((m:Product)=>m.id===p.id))]}));
      }).catch(()=>undefined);
      if(mapped.customerUser) Promise.all([fetchApiCart(),fetchApiOrders()]).then(([cart,orders])=>{
        if(cancelled)return;
        setState((previous)=>({...previous,
          cart:cart.items.map((i)=>({id:i.id,productId:i.productId,variationId:i.variationId ?? undefined,quantity:i.quantity})),
          orders:orders.data.map((o)=>mapApiOrder(o,mapped.customerUser))}));
      }).catch(()=>undefined);
    }).catch(()=>{if(!cancelled)setState((previous)=>({...previous,customerUser:null,sellerUser:null}));});

    fetchPublicCatalog()
      .then((products) => {
        if (cancelled) return;
        // Keep the populated preview catalogue visible in local development
        // until the Laravel database has its first approved public listings.
        if (products.length === 0 && import.meta.env.DEV) return;
        setState((previous) => ({ ...previous, products }));
        setCatalogSource('api');
      })
      .catch((error: unknown) => {
        if (import.meta.env.DEV) {
          console.info('BuyHive API is not available; keeping the local preview catalogue.', error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setCurrentSearch(window.location.search || '');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const notify = (text: string, tone: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, tone });
  };

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 4200);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const navigate = (path: string) => {
    if (path !== window.location.pathname + window.location.search) {
      window.history.pushState({}, '', path);
    }
    const [pathname, searchPart] = path.split('?');
    setCurrentPath(pathname || '/');
    setCurrentSearch(searchPart ? `?${searchPart}` : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Strict Marketplace Listing Gate: Only Stage-1 Approved, Published, Non-Paused products from Approved Sellers
  const publicProducts = useMemo(() => {
    const approvedSellerIds = new Set(
      state.sellers.filter((s) => s.verificationStatus === 'approved').map((s) => s.id)
    );
    return state.products.filter(
      (p) =>
        p.stageOneStatus === 'approved' &&
        p.isPublished &&
        !p.isPaused &&
        (catalogSource === 'api' || approvedSellerIds.has(p.sellerId))
    );
  }, [state.products, state.sellers, catalogSource]);

  const loginCustomer: MarketplaceContextValue['loginCustomer'] = async (emailOrPhone,password) => {
    try {
      const {user}=await loginStorefront({email_or_phone:emailOrPhone,password,role:'customer'});
      setBackendSession(true);
      const mapped=mapApiUser(user);
      if(!mapped.customerUser)return {ok:false,error:'This account is not registered as a customer.'};
      const [cart,orders]=await Promise.all([fetchApiCart(),fetchApiOrders()]);
      setState((previous)=>({...previous,customerUser:mapped.customerUser,sellerUser:null,
        cart:cart.items.map((i)=>({id:i.id,productId:i.productId,variationId:i.variationId ?? undefined,quantity:i.quantity})),
        orders:orders.data.map((o)=>mapApiOrder(o,mapped.customerUser))}));
      notify(`Welcome back to BuyHive, ${mapped.customerUser.fullName}.`,'success');
      return {ok:true};
    } catch(error){return {ok:false,error:error instanceof Error?error.message:'Unable to sign in.'};}
  };
  const registerCustomer: MarketplaceContextValue['registerCustomer'] = async (data) => {
    try {
      const {user}=await registerStorefront({name:data.fullName,email:data.email,phone:data.phone,password:data.password,password_confirmation:data.password,role:'customer'});
      setBackendSession(true);
      const mapped=mapApiUser(user);
      if(!mapped.customerUser)return {ok:false,error:'Customer registration failed.'};
      setState((previous)=>({...previous,customerUser:mapped.customerUser,sellerUser:null,cart:[]}));
      notify('Your BuyHive customer account has been created.','success');
      return {ok:true};
    } catch(error){return {ok:false,error:error instanceof Error?error.message:'Registration failed.'};}
  };

  const logoutCustomer = () => {
    void logoutStorefront().catch(()=>undefined);
    setBackendSession(false);
    setState((prev) => ({ ...prev, customerUser: null, cart: [] }));
    notify('You have signed out of your BuyHive customer session.', 'info');
    navigate('/');
  };

  const loginSeller: MarketplaceContextValue['loginSeller'] = async (email,password) => {
    try {
      const {user}=await loginStorefront({email_or_phone:email,password,role:'seller'});
      setBackendSession(true);
      const mapped=mapApiUser(user);
      if(!mapped.sellerUser)return {ok:false,error:'This account is not registered as a seller.'};
      setState((previous)=>({...previous,sellerUser:mapped.sellerUser,customerUser:null,
        sellers:[mapped.sellerUser!,...previous.sellers.filter((s)=>s.id!==mapped.sellerUser!.id)]}));
      void Promise.all([fetchApiSellerProducts(),fetchStorefrontMeta()]).then(([products,meta])=>{
        const mappedProducts=products.data.map((record)=>mapApiSellerProduct(record,mapped.sellerUser!.id,meta));
        setState((previous)=>({...previous,products:[...mappedProducts,...previous.products.filter((p)=>!mappedProducts.some((m)=>m.id===p.id))]}));
      }).catch(()=>undefined);
      notify(`Signed in to Seller Portal (${mapped.sellerUser.businessName}).`,'success');
      return {ok:true};
    } catch(error){return {ok:false,error:error instanceof Error?error.message:'Seller login failed.'};}
  };
  const registerSeller: MarketplaceContextValue['registerSeller'] = async (data) => {
    try {
      const meta=await fetchStorefrontMeta();
      const location=meta.locations.find((item)=>item.slug===data.countySlug);
      if(!location)return {ok:false,error:'Please select a valid Kenyan county.'};
      const {user}=await registerStorefront({name:data.fullName,email:data.email,phone:data.phone,password:data.password,
        password_confirmation:data.password,role:'seller',seller_type:data.sellerType,business_name:data.businessName || data.fullName,
        location_id:location.id,town:data.town,business_description:data.businessDescription});
      setBackendSession(true);
      const mapped=mapApiUser(user);
      if(!mapped.sellerUser)return {ok:false,error:'Seller registration failed.'};
      await saveApiSellerPayoutAccount({payout_method:data.payoutMethod,account_label:data.payoutAccountLabel,account_details:data.payoutAccountLabel});
      setState((previous)=>({...previous,sellerUser:mapped.sellerUser,customerUser:null,sellers:[mapped.sellerUser!,...previous.sellers]}));
      notify('Seller application received. Your account is pending BuyHive verification.','success');
      return {ok:true};
    } catch(error){return {ok:false,error:error instanceof Error?error.message:'Seller registration failed.'};}
  };

  const logoutSeller = () => {
    void logoutStorefront().catch(()=>undefined);
    setBackendSession(false);
    setState((prev) => ({ ...prev, sellerUser: null }));
    notify('Signed out of Seller Portal.', 'info');
    navigate('/seller');
  };

  const recordProductView = (productId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === productId ? { ...p, viewsCount: p.viewsCount + 1 } : p)),
      customerUser: prev.customerUser
        ? {
            ...prev.customerUser,
            recentlyViewedIds: [
              productId,
              ...prev.customerUser.recentlyViewedIds.filter((id) => id !== productId),
            ].slice(0, 10),
          }
        : null,
    }));
  };

  const toggleWishlist = (productId: string) => {
    if (!state.customerUser) {
      notify('Please sign in as a customer to save items to your Wishlist.', 'info');
      navigate('/login');
      return;
    }
    if (backendSession && /^\d+$/.test(productId)) {
      void toggleApiWishlist(productId).then(async (result) => {
        const wishlist = await fetchApiWishlist();
        setState((previous)=>({...previous,customerUser:previous.customerUser?{...previous.customerUser,wishlistIds:wishlist.product_ids}:null}));
        notify(result.saved?'Saved to Wishlist.':'Removed from Wishlist.','success');
      }).catch((error)=>notify(error instanceof Error?error.message:'Unable to update Wishlist.','error'));
      return;
    }
    notify('Wishlist requires an authenticated BuyHive session.','info');
  };

  const addToCart = (productId: string, variationId?: string, quantity = 1) => {
    const product = publicProducts.find((p) => p.id === productId);
    if (!product || product.stock < 1) {
      notify('This item is currently unavailable.', 'error');
      return;
    }
    const chosenVar = variationId
      ? product.variations.find((v) => v.id === variationId)
      : product.variations[0];
    const maxStock = chosenVar ? chosenVar.stock : product.stock;
    if (maxStock < 1) {
      notify('Selected variation is out of stock.', 'error');
      return;
    }

    if(state.customerUser && backendSession){
      if(!/^\d+$/.test(productId)){
        notify('This is a preview product. Only live Laravel catalogue products can be purchased from an authenticated account.','info');
        return;
      }
      void addApiCartItem({product_id:Number(productId),variation_id:chosenVar?.id?Number(chosenVar.id):undefined,quantity})
        .then((response)=>setState((previous)=>({...previous,cart:response.items.map((i)=>({id:i.id,productId:i.productId,variationId:i.variationId ?? undefined,quantity:i.quantity}))})))
        .catch((error)=>notify(error instanceof Error?error.message:'Unable to update your cart.','error'));
      return;
    }
    setState((prev) => {
      const existing = prev.cart.find(
        (c) => c.productId === productId && c.variationId === chosenVar?.id
      );
      if (existing) {
        const nextQty = Math.min(maxStock, existing.quantity + quantity);
        return {
          ...prev,
          cart: prev.cart.map((c) => (c.id === existing.id ? { ...c, quantity: nextQty } : c)),
        };
      }
      return {
        ...prev,
        cart: [
          ...prev.cart,
          {
            id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            productId,
            variationId: chosenVar?.id,
            quantity: Math.min(maxStock, quantity),
          },
        ],
      };
    });
    notify(`Added "${product.name}" to your shopping cart.`, 'success');
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    if(state.customerUser && catalogSource==='api' && /^\d+$/.test(cartItemId)){
      void updateApiCartItem(cartItemId,quantity).then((response)=>setState((previous)=>({...previous,cart:response.items.map((i)=>({id:i.id,productId:i.productId,variationId:i.variationId ?? undefined,quantity:i.quantity}))})))
        .catch((error)=>notify(error instanceof Error?error.message:'Unable to update your cart.','error'));
      return;
    }
    setState((prev) => ({
      ...prev,
      cart: prev.cart.map((c) => {
        if (c.id !== cartItemId) return c;
        const p = prev.products.find((prod) => prod.id === c.productId);
        const v = p?.variations.find((vr) => vr.id === c.variationId);
        const cap = v ? v.stock : p?.stock ?? 99;
        return { ...c, quantity: Math.min(cap, quantity) };
      }),
    }));
  };

  const removeFromCart = (cartItemId: string) => {
    if(state.customerUser && catalogSource==='api' && /^\d+$/.test(cartItemId)){
      void deleteApiCartItem(cartItemId).then((response)=>setState((previous)=>({...previous,cart:response.items.map((i)=>({id:i.id,productId:i.productId,variationId:i.variationId ?? undefined,quantity:i.quantity}))}))).catch((error)=>notify(error instanceof Error?error.message:'Unable to remove this item.','error'));
      return;
    }
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter((c) => c.id !== cartItemId),
    }));
  };

  const validateCouponServerSide = (code: string, subtotal: number) => {
    if (backendSession) return {valid:true,discount:0,reason:'The server validates coupon eligibility and calculates the final discount during checkout.'};
    const clean = code.trim().toUpperCase();
    if (!clean) return { valid: false, discount: 0, reason: 'Enter a coupon code.' };
    const coupon = state.coupons.find((c) => c.code.toUpperCase() === clean);
    if (!coupon) return { valid: false, discount: 0, reason: 'Coupon code not found.' };
    if (coupon.status !== 'active') return { valid: false, discount: 0, reason: `Coupon is ${coupon.status}.` };
    if (new Date(coupon.expiresAt) < new Date('2026-11-23')) {
      return { valid: false, discount: 0, reason: 'This coupon has expired.' };
    }
    if (subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        reason: `Minimum order of ${formatKSh(coupon.minOrderAmount)} required.`,
      };
    }
    if (coupon.categorySlug) {
      const cat = CATEGORIES.find((ct) => ct.slug === coupon.categorySlug);
      const hasEligibleItem = state.cart.some((ci) => {
        const prod = publicProducts.find((p) => p.id === ci.productId);
        return prod?.categoryId === cat?.id;
      });
      if (!hasEligibleItem) {
        return {
          valid: false,
          discount: 0,
          reason: `Requires at least one item from ${cat?.name ?? 'eligible category'}.`,
        };
      }
    }
    const discount =
      coupon.discountType === 'percentage'
        ? Math.round((subtotal * coupon.discountValue) / 100)
        : Math.min(subtotal, coupon.discountValue);

    return { valid: true, discount, coupon };
  };

  const placeCheckoutOrder: MarketplaceContextValue['placeCheckoutOrder'] = async (payload) => {
    if (!state.customerUser) {
      return { ok: false, error: 'Customer authentication required.' };
    }
    if (state.cart.length === 0) return {ok:false,error:'Your cart is empty.'};
    if(backendSession){
      try{
        const meta=await fetchStorefrontMeta();
        const location=payload.fulfilmentMethod==='delivery'?meta.locations.find((item)=>item.slug===payload.deliveryAddress?.countySlug):undefined;
        if(payload.fulfilmentMethod==='delivery'&&!location)return {ok:false,error:'Please choose a valid delivery county.'};
        const response=await checkoutApiOrder({
          customer_name:payload.customerName,customer_phone:payload.customerPhone,customer_email:payload.customerEmail,
          fulfilment_method:payload.fulfilmentMethod,delivery_location_id:location?.id,delivery_town:payload.deliveryAddress?.town,
          delivery_street:payload.deliveryAddress?.street,collection_hub_name:payload.collectionPoint,order_notes:payload.orderNotes,
          coupon_code:payload.couponCode,payment_method:payload.paymentMethod,
        });
        const order={...mapApiOrder(response.order,state.customerUser),paymentTransactionId:String(response.payment.id)};
        setState((previous)=>({...previous,orders:[order,...previous.orders],cart:[]}));
        notify(response.payment.message,'info');
        return {ok:true,order};
      }catch(error){return {ok:false,error:error instanceof Error?error.message:'Checkout could not be completed.'};}
    }

    // Backend-authoritative calculation (never trust frontend amounts)
    let subtotal = 0;
    const sellerItems: SellerOrderItem[] = [];
    const orderNumber = `BH-ORD-${Math.floor(8400 + Math.random() * 1500)}`;
    const orderId = `ord-${Date.now()}`;
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const prepDeadline = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' ');

    for (const item of state.cart) {
      const prod = publicProducts.find((p) => p.id === item.productId);
      if (!prod) {
        return { ok: false, error: 'One or more products are no longer available.' };
      }
      const variation = prod.variations.find((v) => v.id === item.variationId) ?? prod.variations[0];
      const availableStock = variation ? variation.stock : prod.stock;
      if (item.quantity > availableStock) {
        return { ok: false, error: `Insufficient stock for ${prod.name}.` };
      }

      const unitPrice = prod.price + (variation?.priceDelta ?? 0);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      const seller = state.sellers.find((s) => s.id === prod.sellerId);
      const commRate = seller?.commissionRatePercent ?? state.commissionConfigPercent;
      const commissionAmount = Math.round((lineTotal * commRate) / 100);
      const netSellerProceeds = lineTotal - commissionAmount;

      sellerItems.push({
        id: `soi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        orderId,
        orderNumber,
        sellerId: prod.sellerId,
        productId: prod.id,
        productName: prod.name,
        productImage: prod.images[0] || IMG_HERO,
        variationLabel: variation?.label,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        commissionRatePercent: commRate,
        commissionAmount,
        netSellerProceeds,
        preparationDeadline: prepDeadline,
        fulfilmentInstructions: `Prepare ${item.quantity}x SKU ${prod.sku} for BuyHive Field Agent collection & Stage-2 inspection.`,
        collectionStatus: 'pending_prep',
        stageTwoStatus: 'awaiting_seller_prep',
        earningsStatus: 'pending',
        fieldAgentRef: 'FA-PENDING',
        inspectionLocationRef: 'BuyHive Central Inspection Bay',
      });
    }

    let couponDiscount = 0;
    let appliedCouponCode: string | undefined;
    if (payload.couponCode) {
      const check = validateCouponServerSide(payload.couponCode, subtotal);
      if (check.valid && check.coupon) {
        couponDiscount = check.discount;
        appliedCouponCode = check.coupon.code;
      }
    }

    const deliveryFee =
      payload.fulfilmentMethod === 'delivery'
        ? payload.deliveryAddress?.countySlug === 'nairobi'
          ? 350
          : 650
        : 0;

    const totalAmount = Math.max(0, subtotal - couponDiscount + deliveryFee);
    const collectionCode =
      payload.fulfilmentMethod === 'store_collection'
        ? `BH-${Math.floor(100000 + Math.random() * 899999)}`
        : undefined;

    const paymentPrefix =
      payload.paymentMethod === 'mpesa'
        ? 'MPESA-SBX'
        : payload.paymentMethod === 'card'
        ? 'CARD-SBX'
        : payload.paymentMethod === 'paypal'
        ? 'PP-SBX'
        : 'BANK-SBX';

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: state.customerUser.id,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
      fulfilmentMethod: payload.fulfilmentMethod,
      deliveryAddress: payload.deliveryAddress,
      collectionPoint: payload.collectionPoint,
      collectionCode,
      collectionConfirmed: false,
      deliveryConfirmed: false,
      orderNotes: payload.orderNotes,
      paymentMethod: payload.paymentMethod,
      paymentStatus: 'paid_sandbox',
      paymentReference: `${paymentPrefix}-${Math.floor(100000 + Math.random() * 899999)}`,
      subtotal,
      productDiscounts: 0,
      couponCode: appliedCouponCode,
      couponDiscount,
      deliveryFee,
      taxAmount: 0,
      totalAmount,
      status: 'seller_notified',
      statusHistory: [
        { status: 'order_placed', label: 'Order Placed', timestamp: nowStr, note: 'Order validated server-side.' },
        { status: 'payment_confirmed', label: 'Payment Confirmed (Sandbox)', timestamp: nowStr, note: `${payload.paymentMethod.toUpperCase()} sandbox settlement verified.` },
        { status: 'seller_notified', label: 'Seller(s) Notified (Anonymized)', timestamp: nowStr, note: 'Seller(s) notified with anonymized fulfilment reference.' },
      ],
      sellerItems,
      feedbackSubmitted: false,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const earnedPoints = Math.max(20, Math.floor(totalAmount / 150));

    setState((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      cart: [],
      coupons: appliedCouponCode
        ? prev.coupons.map((c) => (c.code === appliedCouponCode ? { ...c, status: 'used' } : c))
        : prev.coupons,
      products: prev.products.map((prod) => {
        const bought = sellerItems.filter((si) => si.productId === prod.id);
        if (bought.length === 0) return prod;
        const qtySum = bought.reduce((acc, b) => acc + b.quantity, 0);
        return {
          ...prod,
          stock: Math.max(0, prod.stock - qtySum),
          salesCount: prod.salesCount + qtySum,
        };
      }),
      customerUser: prev.customerUser
        ? { ...prev.customerUser, loyaltyPoints: prev.customerUser.loyaltyPoints + earnedPoints }
        : null,
      rewardTransactions: [
        {
          id: `rw-${Date.now()}`,
          description: `Order ${orderNumber} Pending Loyalty Points`,
          points: earnedPoints,
          date: new Date().toISOString().slice(0, 10),
        },
        ...prev.rewardTransactions,
      ],
      sellerMessages: [
        ...sellerItems.map((si) => ({
          id: `smsg-${Date.now()}-${si.id}`,
          sellerId: si.sellerId,
          type: 'order_ops' as const,
          title: `New Fulfilment Order ${si.orderNumber}`,
          body: `Prepare ${si.quantity}x ${si.productName} by ${si.preparationDeadline}. Hand over to BuyHive Field Agent only.`,
          isRead: false,
          createdAt: nowStr,
        })),
        ...prev.sellerMessages,
      ],
    }));

    notify(`Order ${orderNumber} confirmed!`, 'success');
    return { ok: true, order: newOrder };
  };

  const confirmStoreCollectionWithCode = async (orderId: string, code: string) => {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return { ok: false, error: 'Order not found.' };
    if (order.fulfilmentMethod !== 'store_collection') {
      return { ok: false, error: 'Order is not a store collection order.' };
    }
    if (catalogSource === 'api') {
      try {
        const response = await confirmApiCollection(orderId,code);
        const updated = mapApiOrder(response.data,state.customerUser);
        setState((previous)=>({...previous,orders:previous.orders.map((item)=>item.id===orderId?updated:item)}));
        notify('Collection confirmed! You are now eligible to submit order feedback.','success');
        return {ok:true};
      } catch(error) {
        return {ok:false,error:error instanceof Error?error.message:'Collection confirmation failed.'};
      }
    }
    if (order.collectionCode?.toUpperCase() !== code.trim().toUpperCase()) {
      return { ok: false, error: 'Invalid collection code. Check your order confirmation code.' };
    }
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              collectionConfirmed: true,
              status: 'collected',
              statusHistory: [
                ...o.statusHistory,
                { status: 'collected', label: 'Collected & Receipt Confirmed', timestamp: nowStr, note: `Verified via secure collection code ${code}. Feedback eligibility unlocked.` },
              ],
              sellerItems: o.sellerItems.map((si) => ({
                ...si,
                earningsStatus: si.stageTwoStatus === 'passed' ? 'available' : si.earningsStatus,
              })),
            }
          : o
      ),
    }));
    notify('Collection confirmed! You are now eligible to submit order feedback.', 'success');
    return { ok: true };
  };

  const confirmSandboxPayment: MarketplaceContextValue['confirmSandboxPayment'] = async (orderId,succeeded=true) => {
    const order=state.orders.find((item)=>item.id===orderId);
    if(!order?.paymentTransactionId)return {ok:false,error:'No sandbox payment transaction is attached to this order.'};
    try{
      const response=await confirmApiSandboxPayment(order.paymentTransactionId,succeeded);
      const updated=mapApiOrder(response.order,state.customerUser);
      setState((previous)=>({...previous,orders:previous.orders.map((item)=>item.id===orderId?{...updated,paymentTransactionId:order.paymentTransactionId}:item)}));
      notify(succeeded?'Sandbox payment confirmed. No real funds were transferred.':'Sandbox payment marked failed. Reserved stock has been released.','success');
      return {ok:true};
    }catch(error){return {ok:false,error:error instanceof Error?error.message:'Sandbox payment confirmation failed.'};}
  };

  const advanceOrderFulfilmentStage = (orderId: string, simulateStage2Failure = false) => {
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => {
        if (o.id !== orderId) return o;
        let nextStatus: OrderStatus = o.status;
        let note = '';
        let label = '';
        let deliveryConfirmed = o.deliveryConfirmed;
        let updatedSellerItems = o.sellerItems;

        if (o.status === 'seller_notified' || o.status === 'seller_preparing') {
          nextStatus = 'product_collected';
          label = 'Product Collected by Field Agent';
          note = 'BuyHive field agent collected product from seller and logged handover.';
          updatedSellerItems = o.sellerItems.map((si) => ({
            ...si,
            collectionStatus: 'collected_by_agent',
            stageTwoStatus: 'collected_by_agent',
            fieldAgentRef: 'FA-NBO-09',
          }));
        } else if (o.status === 'product_collected') {
          nextStatus = 'under_inspection';
          label = 'Under Stage-2 Pre-Dispatch Inspection';
          note = 'Inspection team checking condition, quantity, and match with Stage-1 approval.';
          updatedSellerItems = o.sellerItems.map((si) => ({
            ...si,
            stageTwoStatus: 'under_pre_dispatch_inspection',
          }));
        } else if (o.status === 'under_inspection') {
          if (simulateStage2Failure) {
            nextStatus = 'seller_preparing';
            label = 'Stage-2 Inspection Held (Replacement Requested)';
            note = 'Item failed Stage-2 inspection. Held at bay; seller notified to supply compliant replacement.';
            updatedSellerItems = o.sellerItems.map((si) => ({
              ...si,
              stageTwoStatus: 'failed_held',
            }));
          } else {
            nextStatus = o.fulfilmentMethod === 'store_collection' ? 'ready_for_collection' : 'out_for_delivery';
            label =
              o.fulfilmentMethod === 'store_collection'
                ? 'Inspection Passed · Ready for Collection'
                : 'Inspection Passed · Out for Delivery';
            note =
              o.fulfilmentMethod === 'store_collection'
                ? `Stage-2 inspection passed. Available at ${o.collectionPoint}. Present code ${o.collectionCode}.`
                : 'Stage-2 inspection passed and sealed. Dispatched with BuyHive courier.';
            updatedSellerItems = o.sellerItems.map((si) => ({
              ...si,
              stageTwoStatus: 'passed',
            }));
          }
        } else if (o.status === 'out_for_delivery') {
          nextStatus = 'delivered';
          label = 'Delivered & Confirmed';
          note = 'Customer delivery confirmed. Feedback eligibility unlocked and seller earnings cleared.';
          deliveryConfirmed = true;
          updatedSellerItems = o.sellerItems.map((si) => ({
            ...si,
            earningsStatus: 'available',
          }));
        } else if (o.status === 'delivered' || o.status === 'collected') {
          nextStatus = 'completed';
          label = 'Order Completed';
          note = 'Order lifecycle finalized.';
        }

        if (nextStatus === o.status && !simulateStage2Failure) return o;
        return {
          ...o,
          status: nextStatus,
          deliveryConfirmed,
          sellerItems: updatedSellerItems,
          statusHistory: [...o.statusHistory, { status: nextStatus, label, timestamp: nowStr, note }],
        };
      }),
    }));
  };

  const submitOrderFeedback: MarketplaceContextValue['submitOrderFeedback'] = async (feedback) => {
    if (!state.customerUser) return { ok: false, error: 'Login required.' };
    const order = state.orders.find((o) => o.id === feedback.orderId && o.customerId === state.customerUser?.id);
    if (!order) return { ok: false, error: 'Order not found.' };

    // Strict Feedback Gate: Actual receipt MUST be confirmed
    const receiptConfirmed =
      (order.fulfilmentMethod === 'delivery' && order.deliveryConfirmed) ||
      (order.fulfilmentMethod === 'store_collection' && order.collectionConfirmed) ||
      order.status === 'completed';

    if (!receiptConfirmed) {
      return {
        ok: false,
        error: 'Feedback is strictly locked until delivery or store collection receipt is confirmed.',
      };
    }
    if (order.feedbackSubmitted) {
      return { ok: false, error: 'Feedback has already been submitted for this order.' };
    }
    if (catalogSource === 'api') {
      try {
        const response=await submitApiOrderFeedback(order.id,{
          overall_rating:feedback.overallRating,would_shop_again:feedback.wouldShopAgain,
          question_ratings:{
            smooth_experience:feedback.answers.smoothExperience,easy_ordering:feedback.answers.easyOrdering,
            convenient_payment:feedback.answers.convenientPayment,on_time_fulfilment:feedback.answers.onTimeFulfilment,
            matched_description:feedback.answers.matchedDescription,good_condition:feedback.answers.goodCondition,
            satisfactory_packaging:feedback.answers.satisfactoryPackaging,service_satisfaction:feedback.answers.serviceSatisfaction,
          },
          comments:feedback.comments,complaints:feedback.answers.hadDifficulties?feedback.answers.difficultyDetails:null,
          improvement_suggestions:feedback.answers.improvementSuggestion,
        });
        setState((previous)=>({...previous,
          orders:previous.orders.map((item)=>item.id===order.id?{...item,feedbackSubmitted:true,status:'completed'}:item),
          customerUser:previous.customerUser?{...previous.customerUser,loyaltyPoints:previous.customerUser.loyaltyPoints+response.loyalty_points_awarded}:null,
        }));
        notify('Thank you! Your verified feedback was recorded.','success');
        return {ok:true};
      } catch(error) {
        return {ok:false,error:error instanceof Error?error.message:'Feedback could not be submitted.'};
      }
    }

    const newFeedback: CustomerFeedback = {
      ...feedback,
      id: `fb-${Date.now()}`,
      customerId: state.customerUser.id,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const newReviews: ProductReview[] = order.sellerItems.map((si) => ({
      id: `rev-${Date.now()}-${si.id}`,
      productId: si.productId,
      orderId: order.id,
      reviewerAlias: `${state.customerUser!.fullName.split(' ')[0]} · Verified Buyer`,
      rating: feedback.overallRating,
      comment: feedback.comments || 'Verified BuyHive inspected purchase.',
      createdAt: new Date().toISOString().slice(0, 10),
      verifiedPurchase: true,
    }));

    setState((prev) => ({
      ...prev,
      feedbacks: [newFeedback, ...prev.feedbacks],
      reviews: [...newReviews, ...prev.reviews],
      orders: prev.orders.map((o) => (o.id === order.id ? { ...o, feedbackSubmitted: true, status: 'completed' } : o)),
      customerUser: prev.customerUser
        ? { ...prev.customerUser, loyaltyPoints: prev.customerUser.loyaltyPoints + 50 }
        : null,
      rewardTransactions: [
        { id: `rw-${Date.now()}`, description: `Verified Feedback Bonus (${order.orderNumber})`, points: 50, date: new Date().toISOString().slice(0, 10) },
        ...prev.rewardTransactions,
      ],
    }));
    notify('Thank you! Your verified feedback was recorded (+50 loyalty points).', 'success');
    return { ok: true };
  };

  const redeemRewardPoints = (points: number) => {
    if (!state.customerUser || state.customerUser.loyaltyPoints < points) return {ok:false,error:'Insufficient loyalty points balance.'};
    if (!backendSession) return {ok:false,error:'Sign in to redeem server-managed rewards.'};
    void redeemApiRewards(points).then(async (result)=>{
      const rewards=await fetchApiRewards();
      setState((previous)=>({...previous,customerUser:previous.customerUser?{...previous.customerUser,loyaltyPoints:rewards.points}:null,
        rewardTransactions:rewards.transactions.map((t:any)=>({id:String(t.id),description:t.description,points:t.points_delta,date:t.created_at?.slice(0,10)??''})),
        coupons:[{code:result.coupon_code,title:'Loyalty reward voucher',description:`KSh ${result.discount_value.toLocaleString()} off an eligible order.`,discountType:'fixed',discountValue:result.discount_value,minOrderAmount:result.discount_value*2,expiresAt:'',status:'active'},...previous.coupons]}));
      notify(`Redeemed points for coupon ${result.coupon_code}.`,'success');
    }).catch((error)=>notify(error instanceof Error?error.message:'Unable to redeem rewards.','error'));
    return {ok:true};
  };

  const addCustomerAddress: MarketplaceContextValue['addCustomerAddress'] = (addr) => {
    if(!backendSession) { notify('Please sign in to save an address.','info'); return; }
    void fetchStorefrontMeta().then(async (meta)=>{
      const location=meta.locations.find((item)=>item.slug===addr.countySlug);
      if(!location) throw new Error('Choose a valid county.');
      await saveApiAddress({label:addr.label,location_id:location.id,town:addr.town,street_address:addr.street,is_default:!state.customerUser?.savedAddresses.length});
      const addresses=await fetchApiAddresses();
      setState((previous)=>({...previous,customerUser:previous.customerUser?{...previous.customerUser,savedAddresses:addresses.data.map((a:any)=>({id:String(a.id),label:a.label,countySlug:a.county_slug??'',town:a.town,street:a.street_address,isDefault:Boolean(a.is_default)}))}:null}));
      notify('Saved delivery address.','success');
    }).catch((error)=>notify(error instanceof Error?error.message:'Unable to save address.','error'));
  };

  const updateCustomerProfile: MarketplaceContextValue['updateCustomerProfile'] = (data) => {
    if(!backendSession) { notify('Please sign in to update your profile.','info'); return; }
    void updateApiCustomerProfile({name:data.fullName,phone:data.phone}).then(({data:user})=>{
      setState((previous)=>({...previous,customerUser:previous.customerUser?{...previous.customerUser,fullName:user.name,phone:user.phone}:null}));
      notify('Profile updated.','success');
    }).catch((error)=>notify(error instanceof Error?error.message:'Unable to update profile.','error'));
  };

  const createSupportTicket: MarketplaceContextValue['createSupportTicket'] = (data) => {
    if(!backendSession) { notify('Please sign in to submit a support ticket.','info'); return; }
    void createApiTicket({category:data.category,subject:data.subject,order_number:data.orderNumber,message:data.message}).then(({data:t})=>{
      const ticket:SupportTicket={id:String(t.id),ticketNumber:t.ticket_number,userRole:t.user_role,userId:String(t.user_id),category:t.category,subject:t.subject,orderNumber:t.order_number??undefined,message:t.message,status:t.status,createdAt:t.created_at?.slice(0,10)??'',replies:[]};
      setState((previous)=>({...previous,tickets:[ticket,...previous.tickets]}));
      notify(`Support ticket ${ticket.ticketNumber} submitted.`,'success');
    }).catch((error)=>notify(error instanceof Error?error.message:'Unable to submit support ticket.','error'));
  };

  // Seller Actions
  const createSellerProduct: MarketplaceContextValue['createSellerProduct'] = async (payload) => {
    if (!state.sellerUser) return { ok: false, error: 'Seller authentication required.' };
    if (!payload.name.trim() || payload.price <= 0) {
      return { ok: false, error: 'Product name and valid selling price are required.' };
    }
    if(backendSession){
      try{
        const meta=await fetchStorefrontMeta();
        const category=CATEGORIES.find((item)=>item.id===payload.categoryId);
        const subcategory=category?.subcategories.find((item)=>item.id===payload.subcategoryId);
        const categoryRecord=meta.categories.find((item)=>item.slug===category?.slug);
        const subcategoryRecord=categoryRecord?.subcategories?.find((item:any)=>item.slug===subcategory?.slug);
        const location=meta.locations.find((item)=>item.slug===payload.countySlug);
        if(!categoryRecord||!subcategoryRecord||!location)return {ok:false,error:'Choose a valid category, subcategory and county.'};
        const response=await createApiSellerProduct({
          name:payload.name,category_id:categoryRecord.id,subcategory_id:subcategoryRecord.id,location_id:location.id,
          brand:payload.brand,description:payload.description,specifications:payload.specifications,condition:payload.condition,
          price:payload.price,stock:payload.stock,town:payload.town,delivery_available:payload.deliveryAvailable,
          collection_available:payload.collectionAvailable,warranty_info:payload.warrantyInfo,images:payload.images,
          variations:payload.variations.map((v)=>({label:v.label,size:v.size,colour:v.colour,model:v.model,price_delta:v.priceDelta,stock:v.stock})),
          save_as_draft:payload.saveAsDraft??false,
        });
        const record=response.data;
        const product:Product={id:record.id,sku:record.sku,sellerId:state.sellerUser.id,name:payload.name,slug:payload.name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
          categoryId:payload.categoryId,subcategoryId:payload.subcategoryId,brand:payload.brand,description:payload.description,specifications:payload.specifications,
          condition:payload.condition,images:record.images?.map((path:string)=>path.startsWith('http')?path:`/storage/${path}`)??[],price:payload.price,stock:record.stock,
          countySlug:payload.countySlug,town:payload.town,deliveryAvailable:payload.deliveryAvailable,collectionAvailable:payload.collectionAvailable,
          warrantyInfo:payload.warrantyInfo,variations:payload.variations.map((v,index)=>({id:`local-${index}`,...v})),occasionSlugs:[],
          stageOneStatus:record.stage_one_status,isPublished:record.is_published,isPaused:record.is_paused,viewsCount:0,salesCount:0,
          ratingAverage:0,ratingCount:0,createdAt:new Date().toISOString().slice(0,10),inspectionHistory:[]};
        setState((previous)=>({...previous,products:[product,...previous.products]}));
        notify(payload.saveAsDraft?'Product saved as draft.':'Product submitted for Stage-1 inspection.','success');
        return {ok:true,product};
      }catch(error){return {ok:false,error:error instanceof Error?error.message:'Unable to create product.'};}
    }
    const status: StageOneInspectionStatus = payload.saveAsDraft ? 'draft' : 'pending_inspection';
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      sku: `BH-SLR-${Math.floor(100 + Math.random() * 899)}`,
      sellerId: state.sellerUser.id,
      name: payload.name.trim(),
      slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryId: payload.categoryId,
      subcategoryId: payload.subcategoryId,
      brand: payload.brand.trim() || state.sellerUser.businessName,
      description: payload.description.trim(),
      specifications: payload.specifications,
      condition: payload.condition,
      images: payload.images.length > 0 ? payload.images : [IMG_HERO],
      price: payload.price,
      stock: payload.stock,
      countySlug: payload.countySlug,
      town: payload.town,
      deliveryAvailable: payload.deliveryAvailable,
      collectionAvailable: payload.collectionAvailable,
      warrantyInfo: payload.warrantyInfo,
      variations: payload.variations.map((v, idx) => ({ id: `var-${Date.now()}-${idx}`, ...v })),
      occasionSlugs: [],
      stageOneStatus: status,
      isPublished: false, // NEVER bypasses Stage-1 Inspection & Seller Verification!
      viewsCount: 0,
      salesCount: 0,
      ratingAverage: 0,
      ratingCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      inspectionHistory: payload.saveAsDraft
        ? []
        : [
            {
              id: `insp-${Date.now()}`,
              stage: 1,
              productId: '',
              inspectorRef: 'AWAITING-ASSIGNMENT',
              inspectedAt: new Date().toISOString(),
              outcome: 'correction_required',
              findings: 'Queued for Stage-1 pre-listing physical inspection by BuyHive inspection team.',
              checklist: [],
            },
          ],
    };
    setState((prev) => ({
      ...prev,
      products: [newProd, ...prev.products],
      sellerMessages: payload.saveAsDraft
        ? prev.sellerMessages
        : [
            {
              id: `smsg-${Date.now()}`,
              sellerId: state.sellerUser!.id,
              type: 'inspection',
              title: `Stage-1 Inspection Queued: ${newProd.name}`,
              body: `Your listing ${newProd.sku} has been logged for Stage-1 physical inspection. It cannot go live until approved.`,
              isRead: false,
              createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            },
            ...prev.sellerMessages,
          ],
    }));
    notify(
      payload.saveAsDraft
        ? 'Product saved as Draft.'
        : 'Product submitted for Stage-1 Pre-Listing Inspection.',
      'success'
    );
    return { ok: true, product: newProd };
  };

  const updateSellerProductStock = (productId: string, stock: number) => {
    if(!backendSession){notify('Seller changes require a live backend session.','error');return;}
    void updateApiSellerProduct(productId,{stock:Math.max(0,stock)}).then(()=>fetchApiSellerProducts()).then(async(result)=>{
      const meta=await fetchStorefrontMeta();
      const mapped=result.data.map((record:any)=>mapApiSellerProduct(record,state.sellerUser!.id,meta));
      setState((previous)=>({...previous,products:[...mapped,...previous.products.filter((p)=>!mapped.some((m)=>m.id===p.id))]}));
      notify('Stock updated.','success');
    }).catch((error)=>notify(error instanceof Error?error.message:'Unable to update stock.','error'));
  };

  const toggleSellerProductPause = (productId: string) => {
    if(!backendSession){notify('Seller changes require a live backend session.','error');return;}
    const product=state.products.find((item)=>item.id===productId);
    if(!product)return;
    void updateApiSellerProduct(productId,{is_paused:!product.isPaused}).then(()=>{
      setState((previous)=>({...previous,products:previous.products.map((p)=>p.id===productId?{...p,isPaused:!p.isPaused}:p)}));
      notify('Product visibility updated.','success');
    }).catch((error)=>notify(error instanceof Error?error.message:'Unable to update product.','error'));
  };

  const resubmitSellerProduct = (productId: string) => {
    if(!backendSession){notify('Seller changes require a live backend session.','error');return;}
    void resubmitApiSellerProduct(productId).then(()=>{
      setState((previous)=>({...previous,products:previous.products.map((p)=>p.id===productId?{...p,stageOneStatus:'pending_inspection',isPublished:false}:p)}));
      notify('Listing resubmitted for Stage-1 inspection.','success');
    }).catch((error)=>notify(error instanceof Error?error.message:'Unable to resubmit listing.','error'));
  };

  const markSellerItemReadyForPickup = (orderItemId: string) => {
    if(!backendSession){notify('Seller changes require a live backend session.','error');return;}
    void markApiSellerItemReady(orderItemId).then(()=>notify('Marked ready for BuyHive collection.','success'))
      .catch((error)=>notify(error instanceof Error?error.message:'Unable to update order item.','error'));
  };

  const markSellerMessageRead = (messageId: string) => {
    if(!backendSession)return;
    void markApiSellerMessageRead(messageId).then(()=>{
      setState((previous)=>({...previous,sellerMessages:previous.sellerMessages.map((m)=>m.id===messageId?{...m,isRead:true}:m)}));
    }).catch((error)=>notify(error instanceof Error?error.message:'Unable to update message.','error'));
  };

  const updateSellerSettings: MarketplaceContextValue['updateSellerSettings'] = (data) => {
    if(!backendSession){notify('Seller settings require a live backend session.','error');return;}
    void updateApiSellerProfile({business_name:data.businessName,phone:data.phone,town:data.town,business_description:data.businessDescription})
      .then(()=>saveApiSellerPayoutAccount({payout_method:data.payoutMethod,account_label:data.payoutAccountLabel,account_details:data.payoutAccountLabel}))
      .then((result)=>{
        setState((previous)=>({...previous,sellerUser:previous.sellerUser?{...previous.sellerUser,...data}:null}));
        notify(result.message,'info');
      }).catch((error)=>notify(error instanceof Error?error.message:'Unable to update seller settings.','error'));
  };

  const requestSellerPayout = () => {
    if(!backendSession||!state.sellerUser)return {ok:false,error:'Seller authentication required.'};
    void requestApiSellerPayout().then((result)=>notify(result.data.message,'info'))
      .catch((error)=>notify(error instanceof Error?error.message:'Payout request failed.','error'));
    return {ok:true};
  };

  const resetDemoState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState());
    notify('Marketplace data restored to clean initial state.', 'info');
  };

  return (
    <MarketplaceContext.Provider
      value={{
        ...state,
        currentPath,
        currentSearch,
        navigate,
        publicProducts,
        toastMessage,
        clearToast: () => setToastMessage(null),
        notify,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        loginSeller,
        registerSeller,
        logoutSeller,
        recordProductView,
        toggleWishlist,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        validateCouponServerSide,
        placeCheckoutOrder,
        confirmStoreCollectionWithCode,
        confirmSandboxPayment,
        advanceOrderFulfilmentStage,
        submitOrderFeedback,
        redeemRewardPoints,
        addCustomerAddress,
        updateCustomerProfile,
        createSupportTicket,
        createSellerProduct,
        updateSellerProductStock,
        toggleSellerProductPause,
        resubmitSellerProduct,
        markSellerItemReadyForPickup,
        markSellerMessageRead,
        updateSellerSettings,
        requestSellerPayout,
        resetDemoState,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) throw new Error('useMarketplace must be used inside MarketplaceProvider');
  return ctx;
}
