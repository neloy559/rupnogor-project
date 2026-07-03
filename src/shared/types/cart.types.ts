export interface CartItemData {
  id: string;
  productId: string;
  quantity: number;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    comparePrice: number | null;
    images: string[];
    category: string;
    stock: number;
    colors: string[];
    colorNames: string[];
    sizes: string[];
  };
}

export interface CartResponse {
  items: CartItemData[];
  cartCount: number;
  cartTotal: number;
}