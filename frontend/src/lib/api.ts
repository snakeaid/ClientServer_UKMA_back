import { encrypt, decrypt } from './encryption';
import { Product, ProductGroup } from './types';

const API_BASE_URL = 'http://localhost:8000/api';

async function fetchApi(path: string, options: RequestInit = {}) {
  const defaultHeaders = {
    'Content-Type': 'text/plain; charset=UTF-8',
  };

  if (options.body && typeof options.body === 'string') {
    options.body = await encrypt(options.body);
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${path}`, config);

  const encryptedText = await response.text();
  if (!response.ok) {
    let errorData = { message: 'An error occurred' };
    try {
        const decryptedError = await decrypt(encryptedText);
        errorData = JSON.parse(decryptedError);
    } catch(e) {
        console.error("Could not decrypt or parse error response", e);
    }
    throw new Error(errorData.message);
  }

  if (!encryptedText) {
    return null;
  }
  
  const decryptedText = await decrypt(encryptedText);
  return JSON.parse(decryptedText);
}

// Type Aliases for Create operations (omitting id)
export type CreateProductGroup = Omit<ProductGroup, 'id'>;
export type CreateProduct = Omit<Product, 'id'>;

// Product Group Endpoints
export const getGroups = (): Promise<ProductGroup[]> => fetchApi('/groups');
export const getGroupById = (id: number): Promise<ProductGroup> => fetchApi(`/groups/${id}`);
export const createGroup = (group: CreateProductGroup) => fetchApi('/groups', { method: 'POST', body: JSON.stringify(group) });
export const updateGroup = (id: number, group: CreateProductGroup) => fetchApi(`/groups/${id}`, { method: 'PUT', body: JSON.stringify(group) });
export const deleteGroup = (id: number) => fetchApi(`/groups/${id}`, { method: 'DELETE' });

// Product Endpoints
export const getProducts = (groupId?: number): Promise<Product[]> => fetchApi(groupId ? `/products?groupId=${groupId}` : '/products');
export const createProduct = (product: CreateProduct) => fetchApi('/products', { method: 'POST', body: JSON.stringify(product) });
export const updateProduct = (id: number, product: CreateProduct) => fetchApi(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) });
export const deleteProduct = (id: number) => fetchApi(`/products/${id}`, { method: 'DELETE' });
export const addStock = (id: number, amount: number) => fetchApi(`/products/${id}/add`, { method: 'POST', body: JSON.stringify({ amount }) });
export const sellStock = (id: number, amount: number) => fetchApi(`/products/${id}/sell`, { method: 'POST', body: JSON.stringify({ amount }) });
export const searchProducts = (query: string): Promise<Product[]> => fetchApi(`/products/search?q=${query}`);

// Statistics Endpoints
export const getTotalValue = (): Promise<{totalValue: number}> => fetchApi('/stats/total-value');
export const getGroupTotalValue = (groupId: number): Promise<{totalValue: number}> => fetchApi(`/stats/groups/${groupId}/total-value`); 