// frontend/types/index.ts

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  old_price?: number;
  image_url: string;
  category_id: number;
  manufacturer?: string;
  model?: string;
  in_stock: boolean;
  is_featured?: boolean;
  power?: string;
  description?: string;
  specifications?: string;
  brand?: string;
  stock_quantity?: number;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}
