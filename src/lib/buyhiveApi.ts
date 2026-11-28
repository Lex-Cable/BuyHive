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
