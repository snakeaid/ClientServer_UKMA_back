export interface ProductGroup {
  id: number;
  name: string;
  description: string;
}

export interface Product {
  id: number;
  groupId: number;
  name: string;
  description: string;
  manufacturer: string;
  quantity: number;
  price: number;
}

export type CreateProductGroup = Omit<ProductGroup, 'id'>;
export type CreateProduct = Omit<Product, 'id'>; 