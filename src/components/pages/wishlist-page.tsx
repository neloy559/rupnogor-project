'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/use-auth';
import { useCart } from '@/store/use-cart';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/shared/constants/routes';
import { Heart, ShoppingBag, Trash2, X } from 'lucide-react';

interface WishlistProduct {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    comparePrice: number | null;
    images: string;
    category: string;
    stock: number;
    badge: string | null;
  };
}

function parseImages(images: string): string[] {
  try {
    return JSON.parse(images || '[]');
  } catch {
    return [];
  }
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-rl-surface-container-lowest animate-pulse">
      <div className="h-[200px] sm:h-[240px] bg-rl-surface-container-high" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-16 rounded bg-rl-surface-container-high" />
        <div className="h-4 w-3/4 rounded bg-rl-surface-container-high" />
        <div className="h-4 w-1/3 rounded bg-rl-surface-container-high" />
        <div className="h-9 w-full rounded-full bg-rl-surface-container-high" />
      </div>
    </div>
  );
}

export function WishlistPage() {
  const router = useRouter();
  const { token, getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingCartId, setAddingCartId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/wishlist', {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setItems(data.items || []);
        }
      } catch {
        // silent
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [token, getAuthHeaders]);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
        toast({ title: 'Removed from wishlist' });
      }
    } catch {
      // silent
    }
    setRemovingId(null);
  };

  const handleAddToCart = async (productId: string) => {
    if (!token) {
      router.push(ROUTES.AUTH);
      return;
    }
    setAddingCartId(productId);
    try {
      const success = await useCart.getState().addToCart(productId);
      if (success) {
        toast({ title: 'Added to cart' });
      }
    } catch {
      // silent
    }
    setAddingCartId(null);
  };

  if (!token && !loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Heart className="w-20 h-20 text-rl-on-surface-variant/30 mb-4" />
        <h2 className="text-xl font-semibold text-rl-on-surface mb-2">
          Sign in to view your wishlist
        </h2>
        <p className="text-sm text-rl-on-surface-variant mb-6 text-center">
          Log in to see and manage your saved items
        </p>
        <Link
          href={ROUTES.AUTH}
          className="bg-rl-primary text-rl-on-primary px-8 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <Heart className="w-20 h-20 text-rl-on-surface-variant/30 mb-4" />
            <h2 className="text-xl font-semibold text-rl-on-surface mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-rl-on-surface-variant mb-6">
              Save items you love for later
            </p>
            <Link
              href={ROUTES.HOME}
              className="bg-rl-primary text-rl-on-primary px-8 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {items.map((item) => {
              const { product } = item;
              const images = parseImages(product.images);
              const imgSrc = images[0] || '/products/product-saree-rose.png';
              const isOutOfStock = product.stock === 0;
              const isRemoving = removingId === item.productId;
              const isAddingCart = addingCartId === item.productId;

              return (
                <article
                  key={item.id}
                  className="rounded-2xl overflow-hidden bg-rl-surface-container-lowest flex flex-col"
                >
                  <div className="relative h-[200px] sm:h-[240px] bg-rl-surface-container-high">
                    <Link
                      href={ROUTES.PRODUCT(product.id)}
                      className="absolute inset-0 w-full h-full"
                      aria-label={`View ${product.name}`}
                    >
                      <Image
                        src={imgSrc}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    </Link>

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <span className="bg-rl-error-container text-rl-on-error-container text-xs font-semibold px-3 py-1.5 rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(product.id);
                      }}
                      disabled={isRemoving}
                      className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors disabled:opacity-50"
                      aria-label="Remove from wishlist"
                    >
                      {isRemoving ? (
                        <X className="w-4 h-4 text-rl-on-surface-variant" />
                      ) : (
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      )}
                    </button>
                  </div>

                  <div className="p-3 flex flex-col gap-1 flex-1">
                    <p className="text-xs text-rl-on-surface-variant">
                      {product.category}
                    </p>
                    <h3 className="text-sm font-medium text-rl-on-surface line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-semibold text-rl-primary">
                        ৳{product.price.toLocaleString()}
                      </span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-xs text-rl-on-surface-variant line-through">
                          ৳{product.comparePrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-3 pb-3">
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={isOutOfStock || isAddingCart}
                      className="w-full bg-rl-primary text-rl-on-primary rounded-full text-xs font-semibold py-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {isAddingCart ? (
                        <span className="inline-block w-3.5 h-3.5 border-2 border-rl-on-primary/30 border-t-rl-on-primary rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}