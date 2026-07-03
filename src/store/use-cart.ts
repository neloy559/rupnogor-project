import { create } from 'zustand';
import { useAuth } from '@/store/use-auth';
import { parseJsonField } from '@/shared/helpers/json-field';
import type { Order } from '@/shared/types/order.types';

interface CartItemProduct {
  id: string;
  name: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  category: string;
  stock: number;
  colors?: string[];
  colorNames?: string[];
  sizes?: string[];
}

interface CartItemData {
  id: string;
  productId: string;
  quantity: number;
  product: CartItemProduct;
}

interface PlaceOrderResult {
  success: boolean;
  order?: Order;
  error?: string;
}

interface CartState {
  items: CartItemData[];
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
  placeOrder: (addressId: string, items: { productId: string; quantity: number; color?: string; size?: string }[]) => Promise<PlaceOrderResult>;
}

interface RawCartItemRow {
  id: string;
  productId: string;
  quantity: number;
  product?: Record<string, unknown>;
}

function formatCartItem(raw: RawCartItemRow): CartItemData {
  const p = raw.product || {};
  return {
    id: raw.id,
    productId: raw.productId,
    quantity: raw.quantity,
    product: {
      id: (p.id as string) || raw.productId,
      name: (p.name as string) || 'Unknown Product',
      price: typeof p.price === 'number' ? p.price : 0,
      comparePrice: (p.comparePrice as number | null) ?? null,
      images: parseJsonField<string[]>(p.images, []),
      category: (p.category as string) || '',
      stock: (p.stock as number) ?? 0,
      colors: parseJsonField<string[]>(p.colors, []),
      colorNames: parseJsonField<string[]>(p.colorNames, []),
      sizes: parseJsonField<string[]>(p.sizes, []),
    },
  };
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  cartCount: 0,
  cartTotal: 0,
  isLoading: false,

  fetchCart: async () => {
    const token = useAuth.getState().token;
    if (!token) { set({ items: [], cartCount: 0, cartTotal: 0 }); return; }
    set({ isLoading: true });
    try {
      const { getAuthHeaders } = useAuth.getState();
      const res = await fetch('/api/cart', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const items = (data.items || []).map((r: RawCartItemRow) => formatCartItem(r));
        set({
          items,
          cartCount: data.cartCount || items.reduce((s: number, i: CartItemData) => s + i.quantity, 0),
          cartTotal: data.cartTotal || 0,
        });
      }
    } catch { /* silent */ }
    set({ isLoading: false });
  },

  addToCart: async (productId: string, quantity = 1) => {
    const { getAuthHeaders } = useAuth.getState();
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ productId, quantity }),
      });
      if (res.ok) {
        await get().fetchCart();
        return true;
      }
      return false;
    } catch { return false; }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    const { getAuthHeaders } = useAuth.getState();
    try {
      await fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ productId, quantity }),
      });
      await get().fetchCart();
    } catch { /* silent */ }
  },

  removeFromCart: async (productId: string) => {
    const { getAuthHeaders } = useAuth.getState();
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ productId }),
      });
      await get().fetchCart();
    } catch { /* silent */ }
  },

  clearCart: () => {
    set({ items: [], cartCount: 0, cartTotal: 0 });
  },

  placeOrder: async (addressId: string, items: { productId: string; quantity: number; color?: string; size?: string }[]): Promise<PlaceOrderResult> => {
    const { getAuthHeaders } = useAuth.getState();
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ items, addressId }),
      });
      const data = await res.json();
      if (res.ok) {
        set({ items: [], cartCount: 0, cartTotal: 0 });
        return { success: true, order: data as Order };
      }
      return { success: false, error: data.error || 'Failed to place order' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },
}));