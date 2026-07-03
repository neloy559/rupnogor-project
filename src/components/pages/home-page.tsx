'use client';
// RupNogor Homepage

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/store/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/shared/constants/routes';
import {
  bannerSlides,
  defaultCategories,
  categoryIconMap,
  lookbookItems,
} from '@/shared/constants/product-defaults';
import {
  Search, Heart, Star, ChevronRight, ChevronLeft,
  MessageCircle,
} from 'lucide-react';
import type { Product } from '@/shared/types/product.types';
import type { LucideIcon } from 'lucide-react';

interface CategoryItem {
  name: string;
  icon?: string;
  color?: string;
}

interface BannerItem {
  title: string;
  image?: string;
  link?: string;
  isActive: boolean;
  isPublic: boolean;
}

interface ResolvedCategory {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function formatPrice(price: number): string {
  return `৳${price?.toLocaleString()}`;
}

export function HomePage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const slideInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  // Read category from URL search params
  const activeCategory = searchParams.get('category') || '';

  // Use DB banners if available, otherwise fall back to hardcoded slides
  const activeSlides = banners.length > 0
    ? banners.map((b) => ({
        image: b.image || '/banner-slide-1.png',
        badge: b.title || 'Promotion',
        title: b.title,
        subtitle: b.link || '',
        cta: 'Shop Now',
        gradient: 'from-black/40 via-transparent to-black/60',
      }))
    : bannerSlides;

  const startAutoSlide = useCallback(() => {
    if (slideInterval.current) clearInterval(slideInterval.current);
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 4500);
  }, [activeSlides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    startAutoSlide();
  }, [startAutoSlide]);

  const prevSlide = useCallback(() => goToSlide((currentSlide - 1 + activeSlides.length) % activeSlides.length), [currentSlide, goToSlide, activeSlides.length]);
  const nextSlide = useCallback(() => goToSlide((currentSlide + 1) % activeSlides.length), [currentSlide, goToSlide, activeSlides.length]);

  const handleDragStart = useCallback((clientX: number) => {
    dragStartX.current = clientX;
    isDragging.current = true;
  }, []);

  const handleDragEnd = useCallback((clientX: number) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = dragStartX.current - clientX;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) nextSlide(); else prevSlide();
    }
  }, [nextSlide, prevSlide]);

  useEffect(() => {
    startAutoSlide();
    return () => { if (slideInterval.current) clearInterval(slideInterval.current); };
  }, [startAutoSlide]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const categoryParam = activeCategory ? `&category=${encodeURIComponent(activeCategory)}` : '';
        const [productsRes, arrivalsRes, categoriesRes, bannersRes] = await Promise.all([
          fetch(`/api/products?limit=5&sort=popular${categoryParam}`),
          fetch('/api/products?badge=New&limit=4&sort=newest'),
          fetch('/api/categories'),
          fetch('/api/banners'),
        ]);

        if (cancelled) return;

        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.products || []);
        }
        if (arrivalsRes.ok) {
          const data = await arrivalsRes.json();
          setNewArrivals(data.products || []);
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(Array.isArray(data) ? data : []);
        }
        if (bannersRes.ok) {
          const data = await bannersRes.json();
          // The banners API returns an array of banner objects
          const arr = Array.isArray(data) ? data : [];
          setBanners(arr.filter((b: BannerItem) => b.isActive && b.isPublic));
        }
      } catch {
        // Silently fail
      }
    })();
    return () => { cancelled = true; };
  }, [activeCategory]);

  const toggleLike = async (productId: string) => {
    const token = useAuth.getState().token;
    if (!token) { window.location.href = ROUTES.AUTH; return; }
    if (likedProducts.has(productId)) {
      await fetch('/api/wishlist', { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...useAuth.getState().getAuthHeaders() }, body: JSON.stringify({ productId }) });
      setLikedProducts(prev => { const n = new Set(prev); n.delete(productId); return n; });
      toast({ title: 'Removed from wishlist' });
    } else {
      await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json', ...useAuth.getState().getAuthHeaders() }, body: JSON.stringify({ productId }) });
      setLikedProducts(prev => { const n = new Set(prev); n.add(productId); return n; });
      toast({ title: 'Added to wishlist' });
    }
  };

  const resolvedCategories = categories.length > 0
    ? categories.map((cat: CategoryItem) => {
        const IconComponent = cat.icon ? categoryIconMap[cat.icon] : null;
        return {
          name: cat.name,
          icon: IconComponent || Star,
          color: cat.color || 'bg-rl-surface-container-high text-rl-on-surface',
        };
      })
    : defaultCategories;

  return (
    <>
      {/* ─── Banner Carousel ─── */}
      <section
        className="relative mx-3 sm:mx-4 lg:mx-6 mt-3 sm:mt-4 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl select-none cursor-grab active:cursor-grabbing"
        style={{ height: 'clamp(300px, 52vw, 560px)' }}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseUp={(e) => handleDragEnd(e.clientX)}
        onMouseLeave={(e) => { if (isDragging.current) handleDragEnd(e.clientX); }}
      >
        {activeSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover object-center"
              priority={idx === 0}
              sizes="100vw"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${slide.gradient}`} />
            <div className="relative z-10 h-full flex flex-col justify-end px-6 sm:px-8 pb-8 max-w-7xl mx-auto">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full w-fit mb-3 border border-white/30">
                {slide.badge}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2 drop-shadow-lg">
                {slide.title}
              </h2>
              <p className="text-white/85 text-sm sm:text-base mb-5 max-w-md drop-shadow">
                {slide.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <button className="bg-white text-rl-primary px-6 py-2.5 rounded-full font-semibold shadow-lg w-fit hover:bg-white/90 active:scale-95 transition-all text-sm">
                  {slide.cta}
                </button>
                {/* Inline search — desktop only */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value.trim();
                    if (input) router.push(ROUTES.SEARCH(input));
                  }}
                  className="hidden sm:flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-2.5 border border-white/30 w-64 hover:bg-white/30 transition-colors"
                >
                  <Search className="w-4 h-4 text-white/80 mr-2 flex-shrink-0" />
                  <input
                    name="search"
                    type="text"
                    placeholder="Search sarees, jewelry..."
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
                  />
                </form>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-6 bg-rl-primary'
                  : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Mobile search bar — shown below banner on mobile only */}
      <div className="sm:hidden px-4 mt-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value.trim();
            if (input) router.push(ROUTES.SEARCH(input));
          }}
          className="flex items-center bg-rl-surface-container-high rounded-full px-4 py-3 border border-rl-outline-variant/40 shadow-sm"
        >
          <Search className="w-4 h-4 text-rl-on-surface-variant mr-3 flex-shrink-0" />
          <input
            name="search"
            type="text"
            placeholder="Search for sarees, jewelry..."
            className="flex-1 bg-transparent text-sm text-rl-on-surface placeholder:text-rl-on-surface-variant outline-none"
          />
        </form>
      </div>

      {/* Shop by Category */}
      <section className="mt-6 sm:mt-8 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-rl-on-surface">Shop by Category</h3>
            <div className="w-10 h-0.5 bg-rl-primary rounded-full mt-1" />
          </div>
          <Link href={ROUTES.HOME} className="text-sm text-rl-primary font-medium flex items-center gap-1 hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {resolvedCategories.map((cat) => (
            <Link
              key={cat.name}
              href={`/?category=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center gap-2 flex-shrink-0 group"
            >
              <div className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md`}>
                <cat.icon className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className={`text-xs sm:text-sm font-semibold ${activeCategory === cat.name ? 'text-rl-primary' : 'text-rl-on-surface'}`}>{cat.name}</span>
            </Link>
          ))}
        </div>
        {activeCategory && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-rl-on-surface-variant">Filtering by:</span>
            <span className="text-sm font-semibold text-rl-primary bg-rl-primary-container px-3 py-1 rounded-full">
              {activeCategory}
              <button
                onClick={() => window.location.href = ROUTES.HOME}
                className="ml-2 text-rl-on-primary-container hover:text-rl-primary"
                aria-label="Clear filter"
              >
                ×
              </button>
            </span>
          </div>
        )}
      </section>

      {/* Trending Now */}
      <section className="mt-10 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-rl-on-surface">Trending Now</h3>
            <div className="w-10 h-0.5 bg-rl-primary rounded-full mt-1" />
          </div>
          <Link href={ROUTES.HOME} className="text-sm text-rl-primary font-medium flex items-center gap-1 hover:underline">
            See All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {products.map((product: Product) => (
            <Link
              key={product.id}
              href={ROUTES.PRODUCT(product.id)}
              className="flex-shrink-0 w-[160px] sm:w-[190px] group cursor-pointer"
            >
              <div className="relative rounded-2xl overflow-hidden mb-2 shadow-sm group-hover:shadow-md transition-shadow">
                <div className="h-[210px] sm:h-[250px] w-full overflow-hidden bg-rl-surface-container-low">
                  <Image
                    src={product.images?.[0] || '/products/product-saree-rose.png'}
                    alt={product.name}
                    width={200}
                    height={260}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {product.badge && (
                  <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    product.badge === 'Best Seller'
                      ? 'bg-rl-primary text-rl-on-primary'
                      : 'bg-white text-rl-primary border border-rl-primary/30'
                  }`}>
                    {product.badge}
                  </span>
                )}
                <button
                  onClick={(e) => { e.preventDefault(); toggleLike(product.id); }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
                  aria-label="Add to wishlist"
                >
                  <Heart className={`w-3.5 h-3.5 ${likedProducts.has(product.id) ? 'fill-rl-primary text-rl-primary' : 'text-rl-on-surface-variant'}`} />
                </button>
              </div>
              <p className="text-[10px] text-rl-on-surface-variant mb-0.5 uppercase tracking-wide">{product.category}</p>
              <p className="text-sm font-semibold text-rl-on-surface line-clamp-1">{product.name}</p>
              <p className="text-sm font-bold text-rl-primary mt-0.5">{formatPrice(product.price)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mt-10 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-rl-on-surface">New Arrivals</h3>
            <div className="w-10 h-0.5 bg-rl-primary rounded-full mt-1" />
          </div>
          <Link href={ROUTES.HOME} className="text-sm text-rl-primary font-medium flex items-center gap-1 hover:underline">
            See All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {newArrivals.map((product: Product) => (
            <Link
              key={product.id}
              href={ROUTES.PRODUCT(product.id)}
              className="text-left group cursor-pointer"
            >
              <div className="relative rounded-2xl overflow-hidden mb-2 shadow-sm group-hover:shadow-md transition-shadow">
                <div className="h-[180px] sm:h-[240px] w-full overflow-hidden bg-rl-surface-container-low">
                  <Image
                    src={product.images?.[0] || '/products/product-chiffon-saree.png'}
                    alt={product.name}
                    width={400}
                    height={240}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); toggleLike(product.id); }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
                  aria-label="Add to wishlist"
                >
                  <Heart className={`w-3.5 h-3.5 ${likedProducts.has(product.id) ? 'fill-rl-primary text-rl-primary' : 'text-rl-on-surface-variant'}`} />
                </button>
              </div>
              <p className="text-[10px] text-rl-on-surface-variant mb-0.5 uppercase tracking-wide">{product.category}</p>
              <p className="text-sm font-semibold text-rl-on-surface line-clamp-1">{product.name}</p>
              <p className="text-sm font-bold text-rl-primary mt-0.5">{formatPrice(product.price)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Lookbook / Lifestyle Picks ─── */}
      <section className="mt-12 px-4 max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-rl-on-surface">Our Lookbook</h3>
            <p className="text-xs text-rl-on-surface-variant mt-0.5">Styled by RupNogor — see how our pieces come to life</p>
            <div className="w-10 h-0.5 bg-rl-primary rounded-full mt-1" />
          </div>
          <Link href={ROUTES.HOME} className="text-sm text-rl-primary font-medium flex items-center gap-1 hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {lookbookItems.map((item, idx) => (
            <Link
              key={idx}
              href={ROUTES.HOME}
              className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[3/4]"
            >
              <Image
                src={item.img}
                alt={item.label}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <span className="text-[10px] sm:text-xs text-white/70 font-medium uppercase tracking-wide">{item.category}</span>
                <p className="text-sm sm:text-base font-semibold text-white leading-tight mt-0.5">{item.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}