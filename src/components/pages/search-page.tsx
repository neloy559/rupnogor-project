'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Loader2, PackageSearch, X } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import type { Product } from '@/shared/types/product.types';

function formatPrice(price: number): string {
  return `৳${price?.toLocaleString()}`;
}

export function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setProducts([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: q, limit: '20', sort: 'newest' });
      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run search whenever URL query param changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    setInputValue(q);
    doSearch(q);
  }, [searchParams, doSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    router.push(ROUTES.SEARCH(inputValue.trim()));
  };

  const handleClear = () => {
    setInputValue('');
    router.push('/search');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Search input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 mb-6">
        <div className="flex-1 flex items-center bg-rl-surface-container-high rounded-full px-4 py-3 border border-rl-outline-variant/50 focus-within:border-rl-primary/60 focus-within:ring-2 focus-within:ring-rl-primary/20 transition-all">
          <Search className="w-5 h-5 text-rl-on-surface-variant mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search for sarees, jewelry, kurtas..."
            className="flex-1 bg-transparent text-sm text-rl-on-surface placeholder:text-rl-on-surface-variant outline-none"
            aria-label="Search products"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 p-0.5 rounded-full hover:bg-rl-surface-container-highest transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-rl-on-surface-variant" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-rl-primary text-rl-on-primary px-5 py-3 rounded-full text-sm font-semibold hover:bg-rl-primary/90 active:scale-[0.98] transition-all flex-shrink-0"
        >
          Search
        </button>
      </form>

      {/* Results header */}
      {query && !loading && (
        <p className="text-sm text-rl-on-surface-variant mb-4">
          {total > 0
            ? <><span className="font-semibold text-rl-on-surface">{total}</span> result{total !== 1 ? 's' : ''} for &ldquo;<span className="font-semibold text-rl-primary">{query}</span>&rdquo;</>
            : <>No results for &ldquo;<span className="font-semibold text-rl-primary">{query}</span>&rdquo;</>
          }
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-rl-primary animate-spin" />
          <span className="ml-2 text-sm text-rl-on-surface-variant">Searching…</span>
        </div>
      )}

      {/* Empty state — no query */}
      {!loading && !query && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="w-12 h-12 text-rl-on-surface-variant/30 mb-3" />
          <p className="text-sm font-medium text-rl-on-surface">What are you looking for?</p>
          <p className="text-xs text-rl-on-surface-variant mt-1">Try &ldquo;muslin saree&rdquo;, &ldquo;jhumka&rdquo;, or &ldquo;kurta&rdquo;</p>
        </div>
      )}

      {/* Empty state — query but no results */}
      {!loading && query && total === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PackageSearch className="w-12 h-12 text-rl-on-surface-variant/30 mb-3" />
          <p className="text-sm font-medium text-rl-on-surface">No products found</p>
          <p className="text-xs text-rl-on-surface-variant mt-1 mb-4">Try different keywords or browse by category</p>
          <Link href={ROUTES.HOME} className="text-sm text-rl-primary font-medium hover:underline">
            Browse All Products
          </Link>
        </div>
      )}

      {/* Results grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={ROUTES.PRODUCT(product.id)}
              className="group"
            >
              <div className="relative rounded-2xl overflow-hidden mb-2 bg-rl-surface-container-low">
                <div className="aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={product.images?.[0] || '/products/product-saree-rose.png'}
                    alt={product.name}
                    width={300}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                {product.badge && (
                  <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rl-primary text-rl-on-primary">
                    {product.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-rl-on-surface-variant mb-0.5">{product.category}</p>
              <p className="text-sm font-medium text-rl-on-surface line-clamp-2 leading-snug">{product.name}</p>
              <p className="text-sm font-semibold text-rl-primary mt-1">{formatPrice(product.price)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
