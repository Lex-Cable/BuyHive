export type UserRole = 'customer' | 'seller';

export type SellerType = 'individual' | 'registered_business';

export type SellerVerificationStatus =
  | 'pending_verification'
  | 'under_review'
  | 'approved'
  | 'additional_info_required'
  | 'rejected'
  | 'suspended';

export type StageOneInspectionStatus =
  | 'draft'
  | 'pending_inspection'
  | 'inspection_scheduled'
  | 'under_inspection'
  | 'approved'
  | 'rejected'
  | 'correction_required';

export type StageTwoInspectionStatus =
  | 'awaiting_seller_prep'
  | 'collection_scheduled'
  | 'collected_by_agent'
  | 'under_pre_dispatch_inspection'
  | 'passed'
  | 'failed_held';

export type OrderStatus =
  | 'order_placed'
  | 'payment_confirmed'
  | 'seller_notified'
  | 'seller_preparing'
  | 'product_collected'
  | 'under_inspection'
  | 'inspection_approved'
  | 'preparing_for_dispatch'
  | 'dispatched'
  | 'out_for_delivery'
  | 'delivered'
  | 'ready_for_collection'
  | 'collected'
  | 'completed'
  | 'cancelled'
  | 'refund_processing'
  | 'refunded';

export type FulfilmentMethod = 'delivery' | 'store_collection';
export type PaymentMethodId = 'mpesa' | 'card' | 'paypal' | 'bank';

export interface KenyanCounty {
  code: number;
  name: string;
  slug: string;
  region: string;
  majorTowns: string[];
  hasCollectionHub: boolean;
  hubName?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  restricted?: boolean;
  restrictionNote?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  iconName: string;
  subcategories: Subcategory[];
}

export interface Occasion {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface ProductVariation {
  id: string;
  label: string; // e.g., "Matte Black · 256GB" or "Large · Terracotta"
  size?: string;
  colour?: string;
  model?: string;
  priceDelta: number;
  stock: number;
}

export interface InspectionChecklistItem {
  criterion: string;
  passed: boolean;
  note?: string;
}

export interface InspectionRecord {
  id: string;
  stage: 1 | 2;
  productId: string;
  orderId?: string;
  inspectorRef: string;
  inspectedAt: string;
  outcome: 'approved' | 'rejected' | 'correction_required' | 'passed' | 'failed';
  findings: string;
  rejectionReason?: string;
  checklist: InspectionChecklistItem[];
}

export interface ProductReview {
  id: string;
  productId: string;
  orderId: string;
  reviewerAlias: string; // Privacy-safe e.g. "Verified Buyer · Nairobi"
  rating: number;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  sku: string;
  sellerId: string; // Internal reference only — NEVER rendered in Customer UI
  name: string;
  slug: string;
  categoryId: string;
  subcategoryId: string;
  brand: string; // Public commercial/manufacturer brand (allowed)
  description: string;
  specifications: Record<string, string>;
  condition: 'New' | 'Refurbished (Certified)' | 'Handcrafted';
  images: string[];
  price: number; // KSh
  originalPrice?: number;
  dealExpiresAt?: string;
  stock: number;
  countySlug: string;
  town: string;
  deliveryAvailable: boolean;
  collectionAvailable: boolean;
  warrantyInfo?: string;
  variations: ProductVariation[];
  occasionSlugs: string[];
  stageOneStatus: StageOneInspectionStatus;
  isPublished: boolean;
  isPaused?: boolean;
  isFeatured?: boolean;
  viewsCount: number;
  salesCount: number;
  ratingAverage: number;
  ratingCount: number;
  createdAt: string;
  inspectionHistory: InspectionRecord[];
}

export interface CustomerUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  loyaltyPoints: number;
  savedAddresses: {
    id: string;
    label: string;
    countySlug: string;
    town: string;
    street: string;
    isDefault: boolean;
  }[];
  recentlyViewedIds: string[];
  wishlistIds: string[];
}

export interface SellerUser {
  id: string;
  fullName: string;
  businessName: string;
  sellerType: SellerType;
  email: string;
  phone: string;
  emailVerified: boolean;
  verificationStatus: SellerVerificationStatus;
  countySlug: string;
  town: string;
  businessDescription: string;
  kraOrIdRef: string;
  payoutMethod: 'mpesa_till' | 'mpesa_phone' | 'bank_transfer';
  payoutAccountLabel: string;
  commissionRatePercent: number; // Configurable by management system, never hardcoded in UI
  joinedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variationId?: string;
  quantity: number;
}

export interface SellerOrderItem {
  id: string;
  orderId: string;
  orderNumber: string; // Anonymized reference e.g. BH-ORD-8421
  sellerId: string;
  productId: string;
  productName: string;
  productImage: string;
  variationLabel?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  commissionRatePercent: number;
  commissionAmount: number;
  netSellerProceeds: number;
  preparationDeadline: string;
  fulfilmentInstructions: string;
  collectionStatus: 'pending_prep' | 'ready_for_pickup' | 'collected_by_agent';
  stageTwoStatus: StageTwoInspectionStatus;
  earningsStatus: 'pending' | 'available' | 'paid' | 'refunded';
  fieldAgentRef?: string;
  inspectionLocationRef?: string;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  label: string;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  fulfilmentMethod: FulfilmentMethod;
  deliveryAddress?: {
    countySlug: string;
    town: string;
    street: string;
  };
  collectionPoint?: string;
  collectionCode?: string;
  collectionConfirmed: boolean;
  deliveryConfirmed: boolean;
  orderNotes?: string;
  paymentMethod: PaymentMethodId;
  paymentStatus: 'pending' | 'paid_sandbox' | 'failed' | 'refunded';
  paymentReference: string;
  subtotal: number;
  productDiscounts: number;
  couponCode?: string;
  couponDiscount: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  sellerItems: SellerOrderItem[];
  feedbackSubmitted: boolean;
  createdAt: string;
}

export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  categorySlug?: string;
  expiresAt: string;
  status: 'active' | 'used' | 'expired';
}

export interface RewardTransaction {
  id: string;
  description: string;
  points: number; // positive earned, negative redeemed
  date: string;
}

export interface CustomerFeedback {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  overallRating: number;
  wouldShopAgain: boolean;
  answers: {
    smoothExperience: number;
    easyOrdering: number;
    convenientPayment: number;
    onTimeFulfilment: number;
    matchedDescription: number;
    goodCondition: number;
    satisfactoryPackaging: number;
    serviceSatisfaction: number;
    hadDifficulties: boolean;
    difficultyDetails?: string;
    improvementSuggestion?: string;
  };
  comments: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userRole: UserRole;
  userId: string;
  category:
    | 'Complaint'
    | 'Damaged Product'
    | 'Missing Product'
    | 'Incorrect Product'
    | 'Payment Issue'
    | 'Delivery Delay'
    | 'Collection Issue'
    | 'Return Request'
    | 'Refund Request'
    | 'General Enquiry';
  subject: string;
  orderNumber?: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Awaiting Customer' | 'Resolved' | 'Closed';
  createdAt: string;
  replies: { sender: 'You' | 'BuyHive Support'; text: string; at: string }[];
}

export interface SellerMessage {
  id: string;
  sellerId: string;
  type: 'announcement' | 'inspection' | 'order_ops' | 'payment' | 'verification' | 'support';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface SellerPayout {
  id: string;
  reference: string;
  sellerId: string;
  amount: number;
  methodLabel: string;
  status: 'pending' | 'processing' | 'completed';
  periodLabel: string;
  createdAt: string;
}
