'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/use-auth';
import { useCart } from '@/store/use-cart';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/shared/constants/routes';
import { parseJsonField } from '@/shared/helpers/json-field';
import type { Product } from '@/shared/types/product.types';
import type { Review } from '@/shared/types/review.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Minus, Plus, ShoppingCart, ShieldCheck, Truck, RotateCcw, Home, Loader2, Heart, Star } from 'lucide-react';

export function ProductDetailPage({ productId }: { productId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, getAuthHeaders } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [activeThumb, setActiveThumb] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!productId) {
      // Fallback: fetch newest product if no ID
      (async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/products?limit=1&sort=newest');
          if (res.ok) {
            const data = await res.json();
            if (data.products?.[0]) {
              const p = data.products[0];
              setProduct(p);
              const revRes = await fetch(`/api/reviews?productId=${p.id}`);
              if (revRes.ok) {
                const revData = await revRes.json();
                // Reviews API may return an array directly or wrapped in { reviews: [...] }
                const revs = Array.isArray(revData) ? revData : (revData.reviews || []);
                setReviews(revs);
              }
            }
          }
        } catch { /* silent */ }
        setLoading(false);
      })();
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setProduct(data);
        const revRes = await fetch(`/api/reviews?productId=${productId}`);
        if (revRes.ok) {
          const revData = await revRes.json();
          // Reviews API may return an array directly or wrapped in { reviews: [...] }
          const revs = Array.isArray(revData) ? revData : (revData.reviews || []);
          setReviews(revs);
        }
      } catch {
        setProduct(null);
      }
      setLoading(false);
    })();
  }, [productId]);

  // Check wishlist status
  useEffect(() => {
    if (!token || !product?.id) return;
    (async () => {
      try {
        const res = await fetch(`/api/wishlist/check?productId=${product.id}`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setWishlisted(!!data.wishlisted);
        }
      } catch { /* silent */ }
    })();
  }, [token, product?.id, getAuthHeaders]);

  const handleAddToCart = async () => {
    if (!token) {
      router.push(ROUTES.AUTH);
      return;
    }
    if (!product) return;
    setAddingToCart(true);
    const success = await addToCart(product.id, quantity);
    setAddingToCart(false);
    if (success) {
      toast({ title: 'Added to bag', description: `${product.name} added to your shopping bag` });
    } else {
      toast({ title: 'Error', description: 'Failed to add to cart', variant: 'destructive' });
    }
  };

  const handleToggleWishlist = async () => {
    if (!token) {
      router.push(ROUTES.AUTH);
      return;
    }
    if (!product) return;
    try {
      if (wishlisted) {
        await fetch('/api/wishlist', { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify({ productId: product.id }) });
        setWishlisted(false);
        toast({ title: 'Removed from wishlist' });
      } else {
        await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify({ productId: product.id }) });
        setWishlisted(true);
        toast({ title: 'Added to wishlist' });
      }
    } catch { /* silent */ }
  };

  const images = product ? parseJsonField<string[]>(product.images, []) : [];
  const colors = product ? parseJsonField<string[]>(product.colors, []) : [];
  const colorNames = product ? parseJsonField<string[]>(product.colorNames, []) : [];
  const sizes = product ? parseJsonField<string[]>(product.sizes, []) : [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="rounded-3xl h-[350px] sm:h-[450px]" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-lg text-rl-on-surface-variant mb-4">Product not found</p>
        <Link href={ROUTES.HOME} className="text-sm font-semibold text-rl-primary hover:underline">Go Home</Link>
      </div>
    );
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((sum: number, r: Review) => sum + (r.rating || 0), 0) / reviews.length : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-6 text-xs text-rl-on-surface-variant">
        <Link href={ROUTES.HOME} className="flex items-center gap-1 hover:text-rl-primary transition-colors">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <span>/</span>
        <span>{product.category || 'Products'}</span>
        <span>/</span>
        <span className="text-rl-on-surface font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-2 overflow-x-auto no-scrollbar">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveThumb(idx)}
                className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                  activeThumb === idx ? 'border-rl-primary' : 'border-transparent'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          {/* Main Image */}
          <div className="flex-1 rounded-3xl overflow-hidden bg-rl-surface-container-high">
            {images[activeThumb] ? (
              <img
                src={images[activeThumb]}
                alt={product.name}
                className="w-full h-[350px] sm:h-[450px] lg:h-[500px] object-cover"
              />
            ) : (
              <div className="w-full h-[350px] sm:h-[450px] lg:h-[500px] flex items-center justify-center text-rl-on-surface-variant">
                No image
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          {product.badge && (
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
              product.badge === 'Best Seller'
                ? 'bg-rl-primary text-rl-on-primary'
                : 'bg-rl-primary-container text-rl-on-primary-container'
            }`}>
              {product.badge}
            </span>
          )}
          <p className="text-sm text-rl-on-surface-variant">{product.category}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-rl-on-surface">{product.name}</h1>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-rl-primary">৳{product.price?.toLocaleString()}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-base text-rl-on-surface-variant line-through">৳{product.comparePrice.toLocaleString()}</span>
            )}
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-rl-on-surface-variant/30'}`} />
              ))}
            </div>
            <span className="text-sm text-rl-on-surface-variant">
              {reviews.length > 0 ? `${avgRating.toFixed(1)} (${reviews.length} reviews)` : 'No reviews yet'}
            </span>
          </div>

          <p className="text-sm text-rl-on-surface-variant leading-relaxed">{product.description}</p>

          {/* Color Selection */}
          {colors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-rl-on-surface">
                Color: <span className="font-normal text-rl-on-surface-variant">{colorNames[selectedColor] || colors[selectedColor]}</span>
              </p>
              <div className="flex gap-2">
                {colors.map((color: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(idx)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === idx ? 'border-rl-primary scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${colorNames[idx] || color}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-rl-on-surface">Size</p>
              <div className="flex gap-2">
                {sizes.map((size: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSize(idx)}
                    className={`w-12 h-12 rounded-xl text-sm font-medium transition-all ${
                      selectedSize === idx
                        ? 'bg-rl-primary text-rl-on-primary'
                        : 'bg-rl-surface-container-high text-rl-on-surface hover:bg-rl-surface-container-highest'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-rl-surface-container-high rounded-full px-1 py-1 gap-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-rl-surface-container-lowest disabled:opacity-30 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-rl-surface-container-lowest disabled:opacity-30 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              className="flex-1 bg-rl-primary text-rl-on-primary py-3 rounded-full font-semibold hover:bg-rl-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {addingToCart ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
              {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`p-3 rounded-full border transition-colors ${
                wishlisted ? 'bg-rl-error-container border-rl-error-container' : 'border-rl-outline-variant hover:bg-rl-surface-container-high'
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-rl-on-surface-variant'}`} />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-rl-outline-variant/50">
            {[
              { icon: ShieldCheck, title: 'Genuine', desc: '100% Authentic' },
              { icon: Truck, title: 'Free Delivery', desc: 'All over BD' },
              { icon: RotateCcw, title: 'Easy Returns', desc: '7-day policy' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <Icon className="w-5 h-5 text-rl-primary mx-auto mb-1" />
                <p className="text-xs font-medium text-rl-on-surface">{title}</p>
                <p className="text-[10px] text-rl-on-surface-variant">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs: Description & Reviews */}
      <div className="mt-10 max-w-3xl">
        <div className="flex border-b border-rl-outline-variant/50">
          {(['description', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-rl-primary text-rl-primary'
                  : 'border-transparent text-rl-on-surface-variant hover:text-rl-on-surface'
              }`}
            >
              {tab === 'reviews' ? `Reviews (${reviews.length})` : tab}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="py-6 text-sm text-rl-on-surface-variant leading-relaxed space-y-3">
            <p>{product.description}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="py-6 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-rl-on-surface-variant text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review: Review) => (
                <div key={review.id} className="bg-rl-surface-container-lowest rounded-2xl p-4 border border-rl-outline-variant/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-rl-primary-container rounded-full flex items-center justify-center text-xs font-bold text-rl-on-primary-container">
                        {(review.user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-rl-on-surface">{review.user?.name || 'Anonymous'}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-3 h-3 ${star <= (review.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-rl-on-surface-variant/30'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-rl-on-surface-variant">{review.text}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}