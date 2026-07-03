export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice: number | null;
  sku: string;
  categoryId: string | null;
  images: string[];
  colors: string[];
  colorNames: string[];
  sizes: string[];
  stock: number;
  status: string;
  badge: string | null;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  // Joined/flattened fields
  category?: string;
  categoryRef?: {
    name: string;
  } | null;
  reviews?: Review[];
}

export interface ProductListParams {
  search?: string;
  category?: string;
  badge?: string;
  status?: string;
  limit?: number;
  offset?: number;
  sort?: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  sku: string;
  categoryId?: string | null;
  images?: string[];
  colors?: string[];
  colorNames?: string[];
  sizes?: string[];
  stock?: number;
  status?: string;
  badge?: string | null;
  rating?: number;
  reviewCount?: number;
}

import type { Review } from './review.types';