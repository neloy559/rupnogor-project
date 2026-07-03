'use client';

import { MobileHeader } from '@/components/layout/mobile-header';
import { DesktopNav } from '@/components/layout/desktop-nav';
import { BottomTabBar } from '@/components/layout/bottom-tab-bar';
import { Footer } from '@/components/layout/footer';

export function ShopLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-rl-surface pb-20 lg:pb-0">
      <MobileHeader showMenu showSearch />
      <DesktopNav />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomTabBar />
    </div>
  );
}