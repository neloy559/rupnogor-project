'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/use-auth';
import { useCart } from '@/store/use-cart';
import { ROUTES } from '@/shared/constants/routes';
import { ArrowLeft, Search, Heart, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { X } from 'lucide-react';

interface MobileHeaderProps {
  /** Page title shown in the center. If omitted, shows brand logo. */
  title?: string;
  /** Show back button. Defaults to false. */
  showBack?: boolean;
  /** Override back navigation target. Defaults to 'home'. */
  backTo?: 'home' | 'cart' | 'my-account' | 'back';
  /** Show search icon on the right. */
  showSearch?: boolean;
  /** Show heart icon on the right. */
  showHeart?: boolean;
  /** Show cart bag icon on the right. Default: true when no title, false otherwise. */
  showCart?: boolean;
  /** Show hamburger menu (mobile only). Default: false. */
  showMenu?: boolean;
  /** Extra right-side elements (JSX). */
  rightExtra?: React.ReactNode;
}

export function MobileHeader({
  title,
  showBack = false,
  backTo = 'home',
  showSearch = false,
  showHeart = false,
  showCart,
  showMenu = false,
  rightExtra,
}: MobileHeaderProps) {
  const router = useRouter();
  const { token } = useAuth();
  const { cartCount } = useCart();
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSearchOverlay(false);
    router.push(ROUTES.SEARCH(searchQuery.trim()));
    setSearchQuery('');
  };

  // Default: no title = home-style header with logo + menu + cart
  const isHomeStyle = !title && !showBack;

  const handleBack = () => {
    if (backTo === 'back') router.back();
    else router.push(ROUTES[backTo === 'my-account' ? 'ACCOUNT' : 'HOME' as keyof typeof ROUTES] as string);
  };

  return (
    <>
      <header className="lg:hidden sticky top-0 z-50 bg-rl-surface/95 backdrop-blur-sm border-b border-rl-outline-variant/50">
        <div className="px-4 h-14 flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-full hover:bg-rl-surface-container-high transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-rl-on-surface" />
              </button>
            )}
            {showMenu && (
              <Link
                href={ROUTES.AUTH}
                className="p-2 -ml-2 rounded-full hover:bg-rl-surface-container-high transition-colors"
                aria-label="Account"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-rl-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </Link>
            )}
            {isHomeStyle && (
              <Link href={ROUTES.HOME} className="flex items-center gap-2">
                <Image src="/brand-logo.png" alt="RupNogor" width={32} height={32} className="rounded-full" />
                <h1 className="text-xl font-bold text-rl-primary italic">RupNogor</h1>
              </Link>
            )}
            {title && <h1 className="text-base font-semibold text-rl-on-surface">{title}</h1>}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1">
            {showSearch && (
              <button
                onClick={() => setShowSearchOverlay(true)}
                className="p-2 rounded-full hover:bg-rl-surface-container-high transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-rl-on-surface-variant" />
              </button>
            )}
            {showHeart && (
              <Link
                href={token ? ROUTES.WISHLIST : ROUTES.AUTH}
                className="p-2 rounded-full hover:bg-rl-surface-container-high transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 text-rl-on-surface-variant" />
              </Link>
            )}
            {showCart !== false && (
              <Link
                href={ROUTES.CART}
                className="p-2 rounded-full hover:bg-rl-surface-container-high transition-colors relative"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="w-5 h-5 text-rl-on-surface" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rl-primary text-rl-on-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}
            {rightExtra}
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {showSearchOverlay && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/40" onClick={() => setShowSearchOverlay(false)}>
          <div className="bg-rl-surface p-4" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search for sarees, jewelry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 rounded-full border border-rl-outline-variant bg-rl-surface-container-lowest px-4 py-3 text-sm text-rl-on-surface placeholder:text-rl-on-surface-variant outline-none focus:border-rl-primary"
              />
              <button onClick={() => setShowSearchOverlay(false)} className="p-2 rounded-full hover:bg-rl-surface-container-high" type="button">
                <X className="w-5 h-5 text-rl-on-surface-variant" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}