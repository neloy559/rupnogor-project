'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/use-auth';
import { useCart } from '@/store/use-cart';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/shared/constants/routes';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

function CartItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 animate-pulse">
      <div className="w-24 h-24 lg:w-[120px] lg:h-[120px] rounded-xl bg-rl-surface-container-high shrink-0" />
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="space-y-2">
          <div className="h-4 w-3/4 rounded bg-rl-surface-container-high" />
          <div className="h-3 w-1/2 rounded bg-rl-surface-container-high" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 rounded bg-rl-surface-container-high" />
          <div className="h-8 w-28 rounded-full bg-rl-surface-container-high" />
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ onCheckout }: { onCheckout: () => void }) {
  const { cartTotal } = useCart();

  return (
    <div className="bg-rl-surface-container-lowest rounded-2xl border border-rl-outline-variant/50 p-6 lg:p-6">
      <h2 className="text-base font-semibold text-rl-on-surface mb-5">Order Summary</h2>

      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-rl-on-surface-variant">Subtotal</span>
          <span className="text-sm font-medium text-rl-on-surface">৳{cartTotal.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-rl-on-surface-variant">Shipping</span>
          <span className="text-sm font-semibold text-rl-primary">FREE</span>
        </div>
      </div>

      <div className="border-t border-rl-outline-variant/50 pt-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-rl-on-surface">Total</span>
          <span className="text-xl font-bold text-rl-on-surface">৳{cartTotal.toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full bg-rl-primary text-rl-on-primary rounded-full font-semibold py-3.5 text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        Proceed to Checkout
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-center gap-6 mt-5">
        <div className="flex items-center gap-1.5 text-rl-on-surface-variant">
          <span className="text-xs">Free Delivery</span>
        </div>
        <div className="w-px h-4 bg-rl-outline-variant/50" />
        <div className="flex items-center gap-1.5 text-rl-on-surface-variant">
          <span className="text-xs">Secure Payment</span>
        </div>
      </div>
    </div>
  );
}

export function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, cartCount, cartTotal, isLoading, fetchCart, updateQuantity, removeFromCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleRemove = async (productId: string) => {
    await removeFromCart(productId);
    toast({ title: 'Item removed from cart' });
  };

  const handleQuantityChange = async (productId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    await updateQuantity(productId, newQty);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Loading State */}
        {isLoading && (
          <div className="py-4 space-y-2">
            {[0, 1, 2].map((i) => (
              <CartItemSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty Cart State */}
        {!isLoading && items.length === 0 && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
            <div className="w-20 h-20 rounded-full bg-rl-surface-container-high flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-rl-on-surface-variant/30" />
            </div>
            <h2 className="text-xl font-semibold text-rl-on-surface mb-2">Your bag is empty</h2>
            <p className="text-sm text-rl-on-surface-variant mb-8 text-center max-w-xs">
              Looks like you haven&apos;t added anything yet
            </p>
            <Link
              href={ROUTES.HOME}
              className="bg-rl-primary text-rl-on-primary rounded-full font-semibold px-8 py-3 text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Start Shopping
            </Link>
          </div>
        )}

        {/* Cart Items */}
        {!isLoading && items.length > 0 && (
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:py-6 py-4">
            <div className="lg:col-span-7 xl:col-span-8 space-y-3 mb-4 lg:mb-0">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={ROUTES.PRODUCT(item.productId)}
                  className="flex gap-4 p-4 bg-rl-surface-container-lowest rounded-2xl border border-rl-outline-variant/30 hover:border-rl-outline-variant/60 transition-colors cursor-pointer group"
                >
                  <div className="w-24 h-24 lg:w-[120px] lg:h-[120px] rounded-xl overflow-hidden bg-rl-surface-container-high shrink-0 relative">
                    <Image
                      src={item.product.images?.[0] || '/products/product-saree-rose.png'}
                      alt={item.product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="96px (min-width: 1024px) 120px"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                    <div>
                      <h3 className="text-sm font-medium text-rl-on-surface leading-tight truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-rl-on-surface-variant mt-0.5 capitalize">
                        {item.product.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-semibold text-rl-primary">
                        ৳{item.product.price.toLocaleString()}
                      </span>
                      {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                        <span className="text-xs text-rl-on-surface-variant line-through">
                          ৳{item.product.comparePrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div
                      className="flex items-center justify-between mt-3"
                      onClick={(e) => e.preventDefault()}
                    >
                      <div className="flex items-center bg-rl-surface-container-high rounded-full px-1 py-1 gap-1">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity, -1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rl-surface-container-lowest disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4 text-rl-on-surface" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-rl-on-surface tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity, 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rl-surface-container-lowest disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4 text-rl-on-surface" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-rl-error/10 transition-colors group/delete"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4 text-rl-on-surface-variant group-hover/delete:text-rl-error transition-colors" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
              <div className="sticky top-24">
                <OrderSummary onCheckout={() => router.push(ROUTES.CHECKOUT)} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Bar */}
      {!isLoading && items.length > 0 && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 bg-rl-surface border-t border-rl-outline-variant/50 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-rl-on-surface-variant">Total</p>
              <p className="text-lg font-bold text-rl-on-surface tabular-nums">৳{cartTotal.toLocaleString()}</p>
            </div>
            <button
              onClick={() => router.push(ROUTES.CHECKOUT)}
              className="bg-rl-primary text-rl-on-primary rounded-full font-semibold px-6 py-3 text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 shrink-0"
            >
              Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}