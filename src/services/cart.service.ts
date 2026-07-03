import { CartRepository } from '@/repositories/cart.repository';

interface FormattedCartItem {
  id: string;
  productId: string;
  quantity: number;
  createdAt: Date;
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

function ensureArray<T>(value: unknown, fallback: T[]): T[] {
  if (Array.isArray(value)) return value;
  return fallback;
}

function formatCartItem(raw: Record<string, unknown>): FormattedCartItem {
  const p = (raw.product || {}) as Record<string, unknown>;
  return {
    id: raw.id as string,
    productId: raw.productId as string,
    quantity: raw.quantity as number,
    createdAt: raw.createdAt as Date,
    product: {
      id: (p.id as string) || (raw.productId as string),
      name: (p.name as string) || 'Unknown Product',
      price: typeof p.price === 'number' ? p.price : 0,
      comparePrice: (p.comparePrice as number | null) ?? null,
      images: ensureArray<string>(p.images, []),
      category: (p.category as string) || '',
      stock: (p.stock as number) ?? 0,
      colors: ensureArray<string>(p.colors, []),
      colorNames: ensureArray<string>(p.colorNames, []),
      sizes: ensureArray<string>(p.sizes, []),
    },
  };
}

export class CartService {
  constructor(private cartRepo: CartRepository) {}

  async getCart(userId: string) {
    const items = await this.cartRepo.findUserCart(userId);
    const formatted = items.map((item) => formatCartItem(item as unknown as Record<string, unknown>));
    const cartCount = formatted.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = formatted.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return { items: formatted, cartCount, cartTotal };
  }

  async addToCart(userId: string, productId: string, quantity: number) {
    const existing = await this.cartRepo.findItem(userId, productId);
    if (existing) {
      return this.cartRepo.updateQuantity(existing.id, existing.quantity + quantity);
    }
    return this.cartRepo.addItem(userId, productId, quantity);
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    const existing = await this.cartRepo.findItem(userId, productId);
    if (!existing) throw new Error('Item not found in cart');
    if (quantity <= 0) {
      await this.cartRepo.deleteItem(existing.id);
      return { success: true, removed: true };
    }
    return this.cartRepo.updateQuantity(existing.id, quantity);
  }

  async removeFromCart(userId: string, productId: string) {
    const existing = await this.cartRepo.findItem(userId, productId);
    if (!existing) throw new Error('Item not found in cart');
    await this.cartRepo.deleteItem(existing.id);
    return { success: true };
  }
}