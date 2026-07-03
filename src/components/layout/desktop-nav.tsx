'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/store/use-auth';
import { useCart } from '@/store/use-cart';
import { ROUTES } from '@/shared/constants/routes';
import { Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function DesktopNav() {
  const pathname = usePathname();
  const { token } = useAuth();
  const { cartCount } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');

  const navClick = (item: string) => {
    if (item === 'New Arrivals') return; // already on home
    toast({ title: item, description: `${item} page coming soon!` });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    router.push(ROUTES.SEARCH(searchInput.trim()));
    setSearchInput('');
  };

  return (
    <header className="hidden lg:block sticky top-0 z-50 bg-rl-surface/95 backdrop-blur-sm border-b border-rl-outline-variant/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={ROUTES.HOME} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/brand-logo.png" alt="RupNogor" width={28} height={28} className="rounded-full" />
            <span className="text-xl font-bold text-rl-primary italic">RupNogor</span>
          </Link>
          <nav className="flex items-center gap-6">
            {['Shop', 'New Arrivals', 'Sale', 'Lookbook'].map((item) => (
              <button key={item} onClick={() => navClick(item)} className="text-sm font-medium text-rl-on-surface-variant hover:text-rl-primary transition-colors">
                {item}
              </button>
            ))}
          </nav>
        </div>
        <div className="hidden md:flex items-center bg-rl-surface-container-low rounded-full px-4 py-2 w-64">
          <Search className="w-4 h-4 text-rl-on-surface-variant mr-2 flex-shrink-0" />
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for sarees, jewelry..."
              className="bg-transparent text-sm outline-none w-full text-rl-on-surface placeholder:text-rl-on-surface-variant"
            />
          </form>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={token ? ROUTES.WISHLIST : ROUTES.AUTH}
            className="p-2 rounded-full hover:bg-rl-surface-container-high transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5 text-rl-on-surface-variant" />
          </Link>
          <Link
            href={ROUTES.CART}
            className="p-2 rounded-full hover:bg-rl-surface-container-high transition-colors relative"
            aria-label="Shopping bag"
          >
            <ShoppingBag className="w-5 h-5 text-rl-on-surface-variant" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rl-primary text-rl-on-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          <Link
            href={token ? ROUTES.ACCOUNT : ROUTES.AUTH}
            className="p-2 rounded-full hover:bg-rl-surface-container-high transition-colors"
            aria-label="Account"
          >
            <User className="w-5 h-5 text-rl-on-surface-variant" />
          </Link>
        </div>
      </div>
    </header>
  );
}