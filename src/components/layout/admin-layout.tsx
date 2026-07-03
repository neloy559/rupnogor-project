'use client';

import { useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/shared/constants/routes';
import { Menu, X, Settings, Search, Bell, LogOut, Package, ShoppingBag, ImageIcon, Users } from 'lucide-react';

interface AdminNavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const navItems: AdminNavItem[] = [
  { label: 'Products', icon: Package, href: ROUTES.ADMIN_PRODUCTS },
  { label: 'Orders', icon: ShoppingBag, href: ROUTES.ADMIN_ORDERS },
  { label: 'Banner', icon: ImageIcon, href: ROUTES.ADMIN_BANNERS },
  { label: 'Users', icon: Users, href: ROUTES.ADMIN_PRODUCTS },
];

interface AdminLayoutProps {
  searchPlaceholder?: string;
  children: ReactNode;
}

const titleMap: Record<string, string> = {
  [ROUTES.ADMIN_PRODUCTS]: 'Products',
  [ROUTES.ADMIN_ORDERS]: 'Orders',
  [ROUTES.ADMIN_BANNERS]: 'Banners',
};

export function AdminLayout({ searchPlaceholder = 'Search...', children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const title = titleMap[pathname] || 'Admin';
  const { logout } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen bg-rl-surface">
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-50 bg-rl-surface/95 backdrop-blur-sm border-b border-rl-outline-variant/50">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-full hover:bg-rl-surface-container-high transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5 text-rl-on-surface" />
          </button>
          <h1 className="text-base font-semibold text-rl-on-surface">{title}</h1>
          <button
            onClick={() => toast({ title: 'Settings', description: 'Settings page coming soon!' })}
            className="p-2 -mr-2 rounded-full hover:bg-rl-surface-container-high transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-rl-on-surface-variant" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-rl-surface-container-lowest shadow-xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <Link href={ROUTES.HOME} onClick={() => setSidebarOpen(false)} className="flex items-center gap-2">
                <span className="text-lg font-bold text-rl-primary italic">RupNogor</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-rl-surface-container-high">
                <X className="w-5 h-5 text-rl-on-surface-variant" />
              </button>
            </div>
            <nav className="space-y-1 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-rl-secondary-container text-rl-on-secondary-container'
                      : 'text-rl-on-surface-variant hover:bg-rl-surface-container-high'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <button
              onClick={() => { handleLogout(); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rl-on-surface-variant hover:bg-rl-error-container hover:text-rl-on-error-container transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Back to Store
            </button>
          </aside>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-rl-surface-container-lowest border-r border-rl-outline-variant/50 p-6 flex flex-col z-40">
          <div className="mb-8">
            <Link href={ROUTES.HOME}>
              <h2 className="text-lg font-bold text-rl-primary italic">RupNogor</h2>
            </Link>
            <p className="text-xs text-rl-on-surface-variant mt-0.5">Admin Dashboard</p>
          </div>
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-rl-secondary-container text-rl-on-secondary-container'
                    : 'text-rl-on-surface-variant hover:bg-rl-surface-container-high'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rl-on-surface-variant hover:bg-rl-error-container hover:text-rl-on-error-container transition-colors mt-4"
          >
            <LogOut className="w-5 h-5" />
            Back to Store
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          {/* Desktop Top Bar */}
          <div className="sticky top-0 z-30 bg-rl-surface/95 backdrop-blur-sm border-b border-rl-outline-variant/50 hidden lg:block">
            <div className="flex items-center justify-between px-8 h-16">
              <div className="flex items-center bg-rl-surface-container-low rounded-full px-4 py-2 w-80">
                <Search className="w-4 h-4 text-rl-on-surface-variant mr-2" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="bg-transparent text-sm outline-none flex-1 text-rl-on-surface placeholder:text-rl-on-surface-variant"
                  onKeyDown={(e) => { if (e.key === 'Enter') toast({ title: 'Search', description: 'Search coming soon!' }); }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-full hover:bg-rl-surface-container-high transition-colors relative"
                  onClick={() => toast({ title: 'Notifications', description: 'No new notifications' })}>
                  <Bell className="w-5 h-5 text-rl-on-surface-variant" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rl-primary rounded-full" />
                </button>
                <button onClick={() => toast({ title: 'Settings', description: 'Settings page coming soon!' })}
                  className="p-2.5 rounded-full hover:bg-rl-surface-container-high transition-colors">
                  <Settings className="w-5 h-5 text-rl-on-surface-variant" />
                </button>
                <div className="w-9 h-9 bg-rl-primary-container rounded-full flex items-center justify-center ml-2 text-sm font-bold text-rl-on-primary-container">
                  A
                </div>
              </div>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}