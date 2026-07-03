'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/use-auth';
import { ROUTES } from '@/shared/constants/routes';
import {
  Star, User, Settings, Package,
  MapPin, ShieldCheck, ChevronRight, LogOut, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  orderItems: { name: string; quantity: number; price: number }[];
}

interface Address {
  id: string;
  label?: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  postalCode?: string;
  isDefault: boolean;
}

const statusColorMap: Record<string, string> = {
  Processing: 'bg-rl-tertiary-container text-rl-on-tertiary-container',
  Shipped: 'bg-rl-surface-container-highest text-rl-on-surface',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-rl-error-container text-rl-on-error-container',
  Pending: 'bg-amber-100 text-amber-800',
};

const formatPrice = (price: number) => `৳${price.toLocaleString('en-BD')}`;

export function MyAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, getAuthHeaders, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!token && !user) {
      router.push(ROUTES.AUTH);
    }
  }, [token, user, router]);

  // Fetch orders and addresses
  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      setDataLoading(true);
      try {
        const [ordersRes, addressesRes] = await Promise.all([
          fetch('/api/orders', { headers: getAuthHeaders() }),
          fetch('/api/addresses', { headers: getAuthHeaders() }),
        ]);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(Array.isArray(ordersData) ? ordersData : []);
        }

        if (addressesRes.ok) {
          const addressData = await addressesRes.json();
          setAddresses(Array.isArray(addressData) ? addressData : []);
        }
      } catch {
        // silent
      } finally {
        setDataLoading(false);
      }
    }
    fetchData();
  }, [token, getAuthHeaders]);

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged Out', description: 'You have been logged out successfully' });
    router.push(ROUTES.HOME);
  };

  if (!token && !user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Desktop Only */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="bg-rl-surface-container-lowest rounded-2xl border border-rl-outline-variant/50 p-6 sticky top-24">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-rl-primary-container rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-9 h-9 text-rl-on-primary-container" />
              </div>
              <h3 className="text-lg font-semibold text-rl-on-surface">Welcome back</h3>
              <p className="text-sm text-rl-primary font-medium">Exclusive Member</p>
              <button onClick={() => toast({ title: 'Profile', description: 'Profile editing coming soon!' })} className="mt-3 text-xs font-semibold text-rl-primary bg-rl-primary-container px-4 py-1.5 rounded-full hover:bg-rl-primary-container/80 transition-colors">
                View Profile
              </button>
            </div>
            <nav className="space-y-1">
              {[
                { key: 'profile' as const, label: 'Profile Settings', icon: User },
                { key: 'orders' as const, label: 'My Orders', icon: Package },
                { key: 'address' as const, label: 'Address Book', icon: MapPin },
              ].map((item) => (
                <Link
                  key={item.key}
                  href={item.key === 'address' ? ROUTES.ADD_ADDRESS : '#'}
                  onClick={(e) => {
                    if (item.key !== 'address') {
                      e.preventDefault();
                      setActiveTab(item.key);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    (item.key !== 'address' && activeTab === item.key) || item.key === 'address'
                      ? 'bg-rl-secondary-container text-rl-on-secondary-container'
                      : 'text-rl-on-surface-variant hover:bg-rl-surface-container-high hover:text-rl-on-surface'
                  }`}
                >
                  <item.icon className="w-4.5 h-4.5" />
                  {item.label}
                  {item.key !== 'address' && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              ))}
            </nav>

            <div className="border-t border-rl-outline-variant/50 mt-4 pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rl-error hover:bg-rl-error-container transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" />
                Log Out
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {/* Mobile Tab Switcher */}
          <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto no-scrollbar">
            {[
              { key: 'profile' as const, label: 'Profile', icon: User },
              { key: 'orders' as const, label: 'Orders', icon: Package },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'bg-rl-primary text-rl-on-primary'
                    : 'bg-rl-surface-container-high text-rl-on-surface-variant'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
            <Link
              href={ROUTES.ADD_ADDRESS}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap bg-rl-surface-container-high text-rl-on-surface-variant transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Address
            </Link>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-rl-on-surface">Personal Identity</h2>

              <div className="bg-rl-surface-container-lowest rounded-2xl border border-rl-outline-variant/50 p-6">
                <h3 className="text-sm font-semibold text-rl-on-surface mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-rl-primary" />
                  Account Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', value: user?.name || 'Not provided' },
                    { label: 'Email', value: user?.email || '' },
                    { label: 'Phone', value: user?.phone || 'Not provided' },
                    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-rl-on-surface-variant mb-1">{label}</p>
                      <p className="text-sm font-medium text-rl-on-surface">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-rl-surface-container-lowest rounded-2xl border border-rl-outline-variant/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-rl-on-surface flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rl-primary" />
                    Saved Addresses
                  </h3>
                  <Link
                    href={ROUTES.ADD_ADDRESS}
                    className="text-xs font-semibold text-rl-primary hover:underline"
                  >
                    + Add New
                  </Link>
                </div>
                {dataLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                  </div>
                ) : addresses.length === 0 ? (
                  <p className="text-sm text-rl-on-surface-variant text-center py-4">No saved addresses</p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="bg-rl-surface-container-low rounded-xl p-4 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-rl-on-surface">{addr.fullName}</p>
                            {addr.isDefault && (
                              <span className="text-xs font-semibold text-rl-primary bg-rl-primary-container px-2 py-0.5 rounded-full">Default</span>
                            )}
                            {addr.label && (
                              <span className="text-xs text-rl-on-surface-variant">({addr.label})</span>
                            )}
                          </div>
                          <p className="text-xs text-rl-on-surface-variant">{addr.street}{addr.apartment ? `, ${addr.apartment}` : ''}, {addr.city}{addr.postalCode ? ` - ${addr.postalCode}` : ''}</p>
                          <p className="text-xs text-rl-on-surface-variant">{addr.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-rl-surface-container-lowest rounded-2xl border border-rl-outline-variant/50 p-6">
                <h3 className="text-sm font-semibold text-rl-on-surface mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rl-primary" />
                  Security
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-rl-on-surface">Password</p>
                      <p className="text-xs text-rl-on-surface-variant">Last changed 30 days ago</p>
                    </div>
                    <button onClick={() => toast({ title: 'Change Password', description: 'Password change form coming soon!' })} className="text-sm font-semibold text-rl-primary hover:underline">Change</button>
                  </div>
                  <div className="border-t border-rl-outline-variant/50" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-rl-on-surface">Two-Factor Authentication</p>
                      <p className="text-xs text-rl-on-surface-variant">Add an extra layer of security</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-rl-outline-variant peer-focus:ring-2 peer-focus:ring-rl-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rl-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-rl-surface-container-lowest rounded-2xl border border-rl-outline-variant/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rl-on-surface">Sign Out</p>
                    <p className="text-xs text-rl-on-surface-variant">Log out of your account</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-semibold text-rl-error hover:underline"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-rl-on-surface">My Orders</h2>
              {dataLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-rl-surface-container-lowest rounded-2xl border border-rl-outline-variant/50 p-8 text-center">
                  <Package className="w-12 h-12 text-rl-on-surface-variant mx-auto mb-3" />
                  <p className="text-sm text-rl-on-surface-variant mb-4">You haven&apos;t placed any orders yet</p>
                  <Link
                    href={ROUTES.HOME}
                    className="bg-rl-primary text-rl-on-primary px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-rl-primary/90 transition-colors inline-block"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-rl-surface-container-lowest rounded-2xl border border-rl-outline-variant/50 p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-rl-on-surface">#{order.orderNumber}</p>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColorMap[order.status] || 'bg-rl-surface-container-high text-rl-on-surface'}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-rl-on-surface-variant">
                            {order.orderItems?.map((item) => item.name).join(', ') || 'Order items'}
                            {' · '}
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <p className="text-sm font-bold text-rl-on-surface">{formatPrice(order.total)}</p>
                          <button onClick={() => toast({ title: `Order #${order.orderNumber}`, description: `Viewing details for order #${order.orderNumber}` })} className="text-xs font-semibold text-rl-primary flex items-center gap-1 hover:underline">
                            Details <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}