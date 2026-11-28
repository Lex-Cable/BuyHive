import type { Product } from '../types/buyhive';

interface CatalogResponse { data: Product[] }
export interface ApiUser {
  id:string; name:string; email:string; phone:string; role:'customer'|'seller'; email_verified:boolean; loyalty_points:number;
  seller?:{business_name:string;seller_type:'individual'|'registered_business';verification_status:any;town:string;location_id:number};
}
export interface ApiSession { authenticated:boolean; user:ApiUser|null }
export interface ApiCartItem { id:string;productId:string;variationId:string|null;quantity:number }
export interface ApiOrder {
  id:string;order_number:string;customer_id:string;fulfilment_method:'delivery'|'store_collection';
  delivery_town?:string;delivery_street?:string;collection_hub_name?:string;collection_code?:string;
  collection_confirmed:boolean;delivery_confirmed:boolean;payment_method:'mpesa'|'card'|'paypal'|'bank';
  payment_status:'pending'|'paid'|'failed'|'refunded';payment_reference?:string;subtotal:number;
  coupon_discount:number;delivery_fee:number;total_amount:number;status:any;feedback_submitted:boolean;
  created_at:string;status_history:{status:any;label:string;note:string;timestamp:string}[];
  items:{id:string;product_id:string;product_name:string;product_image?:string;quantity:number;unit_price:number;line_total:number;stage_two_status:string}[];
}

let csrfReady=false;
async function ensureCsrf():Promise<void>{
  if(csrfReady)return;
  const response=await fetch('/api/storefront/csrf',{credentials:'include',headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error('Unable to establish a secure BuyHive session.');
  csrfReady=true;
}
function xsrfCookie():string{
  const cookie=document.cookie.split('; ').find((part)=>part.startsWith('XSRF-TOKEN='));
  return cookie?decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)):'';
}
async function parseResponse<T>(response:Response):Promise<T>{
  const payload=await response.json().catch(()=>({}));
  if(!response.ok){
    const errors=payload.errors?Object.values(payload.errors).flat().join(' '):'';
    throw new Error(errors||payload.message||`BuyHive request failed (${response.status}).`);
  }
  return payload as T;
}
export async function storefrontRequest<T>(path:string,init:RequestInit={}):Promise<T>{
  const method=(init.method??'GET').toUpperCase();
  const unsafe=!['GET','HEAD','OPTIONS'].includes(method);
  if(unsafe)await ensureCsrf();
  const headers=new Headers(init.headers);
  headers.set('Accept','application/json');
  if(init.body && !(init.body instanceof FormData))headers.set('Content-Type','application/json');
  const token=xsrfCookie();
  if(unsafe && token)headers.set('X-XSRF-TOKEN',token);
  const response=await fetch(path,{...init,method,headers,credentials:'include'});
  if(response.status===419 && unsafe){
    csrfReady=false;
    await ensureCsrf();
    const retryHeaders=new Headers(headers);
    const retryToken=xsrfCookie();
    if(retryToken)retryHeaders.set('X-XSRF-TOKEN',retryToken);
    return parseResponse<T>(await fetch(path,{...init,method,headers:retryHeaders,credentials:'include'}));
  }
  return parseResponse<T>(response);
}
export async function fetchPublicCatalog():Promise<Product[]>{
  const response=await fetch('/api/catalog',{headers:{Accept:'application/json'},credentials:'include'});
  if(!response.ok)throw new Error(`BuyHive catalogue request failed (${response.status}).`);
  const payload=(await response.json()) as CatalogResponse;
  if(!Array.isArray(payload.data))throw new Error('BuyHive catalogue response has an invalid format.');
  return payload.data;
}
export const getStorefrontSession=()=>storefrontRequest<ApiSession>('/api/storefront/session');
export const loginStorefront=(data:{email_or_phone:string;password:string;role:'customer'|'seller';remember?:boolean})=>
  storefrontRequest<{user:ApiUser}>('/api/storefront/login',{method:'POST',body:JSON.stringify(data)});
export const registerStorefront=(data:Record<string,unknown>)=>
  storefrontRequest<{user:ApiUser}>('/api/storefront/register',{method:'POST',body:JSON.stringify(data)});
export const logoutStorefront=()=>storefrontRequest<{logged_out:boolean}>('/api/storefront/logout',{method:'POST',body:'{}'});
export const fetchStorefrontMeta=()=>storefrontRequest<{categories:any[];locations:any[]}>('/api/storefront/meta');
export const fetchApiCart=()=>storefrontRequest<{items:ApiCartItem[]}>('/api/storefront/cart');
export const addApiCartItem=(data:{product_id:number;variation_id?:number;quantity:number})=>
  storefrontRequest<{items:ApiCartItem[]}>('/api/storefront/cart/items',{method:'POST',body:JSON.stringify(data)});
export const updateApiCartItem=(id:string,quantity:number)=>
  storefrontRequest<{items:ApiCartItem[]}>(`/api/storefront/cart/items/${id}`,{method:'PATCH',body:JSON.stringify({quantity})});
export const deleteApiCartItem=(id:string)=>
  storefrontRequest<{items:ApiCartItem[]}>(`/api/storefront/cart/items/${id}`,{method:'DELETE'});
export const fetchApiOrders=()=>storefrontRequest<{data:ApiOrder[]}>('/api/storefront/orders');
export const checkoutApiOrder=(data:Record<string,unknown>)=>
  storefrontRequest<{order:ApiOrder;payment:{id:number;reference:string;status:string;sandbox:boolean;message:string}}>('/api/storefront/checkout',{method:'POST',body:JSON.stringify(data)});
export const fetchApiSellerProducts=()=>storefrontRequest<{data:any[]}>('/api/storefront/seller/products');
export const createApiSellerProduct=(data:Record<string,unknown>)=>
  storefrontRequest<{data:any}>('/api/storefront/seller/products',{method:'POST',body:JSON.stringify(data)});

export const confirmApiCollection = (orderId:string,collectionCode:string) =>
  storefrontRequest<{data:ApiOrder}>(`/api/storefront/orders/${orderId}/confirm-collection`,{method:'POST',body:JSON.stringify({collection_code:collectionCode})});

export const submitApiOrderFeedback = (orderId:string,data:Record<string,unknown>) =>
  storefrontRequest<{feedback_id:number;loyalty_points_awarded:number}>(`/api/storefront/orders/${orderId}/feedback`,{method:'POST',body:JSON.stringify(data)});

export const confirmApiSandboxPayment = (transactionId:string,succeeded:boolean) =>
  storefrontRequest<{order:ApiOrder;payment_status:string}>(`/api/storefront/payments/${transactionId}/sandbox-confirm`,{method:'POST',body:JSON.stringify({succeeded})});
