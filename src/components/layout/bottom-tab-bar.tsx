'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/store/use-auth';
import { useCart } from '@/store/use-cart';
import { ROUTES } from '@/shared/constants/routes';
import { Home, Store, Heart, ShoppingBag, User } from 'lucide-react';

const tabs = [
  { key: 'home', label: 'Home', icon: Home, href: ROUTES.HOME },
  { key: 'shop', label: 'Shop', icon: Store, href: ROUTES.HOME },
  { key: 'cart', label: 'Cart', icon: ShoppingBag, href: ROUTES.CART },
  { key: 'wishlist', label: 'Wishlist', icon: Heart, href: ROUTES.WISHLIST },
  { key: 'profile', label: 'Account', icon: User, href: ROUTES.ACCOUNT },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();
  const { token } = useAuth();
  const { cartCount } = useCart();

  // Derive active key from pathname
  const activeKey =
    pathname === '/' ? 'home' :
    pathname.startsWith('/products') ? 'shop' :
    pathname === '/cart' || pathname === '/checkout' ? 'cart' :
    pathname === '/wishlist' ? 'wishlist' :
    pathname.startsWith('/account') ? 'profile' :
    '';

  const handleTabClick = (tab: typeof tabs[number]) => {
    if (tab.key === 'wishlist' && !token) {
      // Navigate to auth
      window.location.href = ROUTES.AUTH;
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-rl-surface border-t border-rl-outline-variant/50">
      <div className="flex items-center justify-around h-16 px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            onClick={() => handleTabClick(tab)}
            className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-colors ${
              activeKey === tab.key
                ? 'bg-rl-secondary-container text-rl-on-secondary-container'
                : 'text-rl-on-surface-variant hover:text-rl-on-surface'
            }`}
          >
            <div className="relative">
              <tab.icon className="w-5 h-5" />
              {tab.key === 'cart' && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 bg-rl-primary text-rl-on-primary text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}