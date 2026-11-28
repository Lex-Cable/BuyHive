import type { Product } from '../types/buyhive';

interface CatalogResponse {
  data: Product[];
}

export async function fetchPublicCatalog(): Promise<Product[]> {
  const response = await fetch('/api/catalog', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  });

  if (!response.ok) {
    throw new Error(`BuyHive catalogue request failed (${response.status}).`);
  }

  const payload = (await response.json()) as CatalogResponse;
  if (!Array.isArray(payload.data)) {
    throw new Error('BuyHive catalogue response has an invalid format.');
  }

  return payload.data;
}

export interface ApiCartItem { id: string; productId: string; variationId: string | null; quantity: number }
export interface ApiOrder {
  id: string; order_number: string; customer_id: string; fulfilment_method: 'delivery'|'store_collection';
  delivery_town?: string; delivery_street?: string; collection_hub_name?: string; collection_code?: string;
  collection_confirmed: boolean; delivery_confirmed: boolean; payment_method: 'mpesa'|'card'|'paypal'|'bank';
  payment_status: 'pending'|'paid'|'failed'|'refunded'; payment_reference?: string; subtotal: number;
  coupon_discount: number; delivery_fee: number; total_amount: number; status: any; feedback_submitted: boolean;
  created_at: string; status_history: {status:any;label:string;note:string;timestamp:string}[];
  items: {id:string;product_id:string;product_name:string;product_image?:string;quantity:number;unit_price:number;line_total:number;stage_two_status:string}[];
}
export const fetchApiCart = () => storefrontRequest<{items: ApiCartItem[]}>('/api/storefront/cart');
export const addApiCartItem = (data: {product_id:number;variation_id?:number;quantity:number}) =>
  storefrontRequest<{items: ApiCartItem[]}>('/api/storefront/cart/items',{method:'POST',body:JSON.stringify(data)});
export const updateApiCartItem = (id:string,quantity:number) =>
  storefrontRequest<{items:ApiCartItem[]}>(`/api/storefront/cart/items/${id}`,{method:'PATCH',body:JSON.stringify({quantity})});
export const deleteApiCartItem = (id:string) =>
  storefrontRequest<{items:ApiCartItem[]}>(`/api/storefront/cart/items/${id}`,{method:'DELETE'});
export const fetchApiOrders = () => storefrontRequest<{data:ApiOrder[]}>('/api/storefront/orders');
export const checkoutApiOrder = (data:Record<string,unknown>) =>
  storefrontRequest<{order:ApiOrder;payment:{id:number;reference:string;status:string;sandbox:boolean;message:string}}>('/api/storefront/checkout',{method:'POST',body:JSON.stringify(data)});
export const fetchApiSellerProducts = () => storefrontRequest<{data:any[]}>('/api/storefront/seller/products');
export const createApiSellerProduct = (data:Record<string,unknown>) =>
  storefrontRequest<{data:any}>('/api/storefront/seller/products',{method:'POST',body:JSON.stringify(data)});
