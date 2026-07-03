'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/store/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Search, Filter, Clock, Truck, Package, ChevronRight,
  ShoppingBag, Loader2
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  user?: { id: string; name: string | null; email: string } | null;
}

function getStatusInfo(status: string) {
  switch (status) {
    case 'processing':
      return { color: 'bg-rl-tertiary-container text-rl-on-tertiary-container', icon: Clock };
    case 'shipped':
      return { color: 'bg-rl-surface-container-highest text-rl-on-surface', icon: Truck };
    case 'delivered':
      return { color: 'bg-green-100 text-green-800', icon: Package };
    case 'cancelled':
      return { color: 'bg-rl-error-container text-rl-on-error-container', icon: Clock };
    default:
      return { color: 'bg-rl-surface-container-high text-rl-on-surface', icon: Clock };
  }
}

export function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const headers = useAuth.getState().getAuthHeaders();
      const res = await fetch('/api/orders', { headers });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load orders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const stats = {
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-rl-on-surface">Order Management</h1>
        <button onClick={() => toast({ title: 'Export', description: 'Export orders as CSV coming soon!' })} className="bg-rl-surface-container-high text-rl-on-surface px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-rl-surface-container-highest active:scale-[0.98] transition-all flex items-center gap-2 w-fit">
          <Search className="w-4 h-4" />
          Export Orders
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-rl-secondary-container rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-rl-on-secondary-container/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-rl-on-secondary-container" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rl-on-secondary-container">{stats.processing}</p>
          <p className="text-sm text-rl-on-secondary-container/80">Processing</p>
        </div>
        <div className="bg-rl-surface-container-high rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-rl-on-surface/10 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-rl-on-surface" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rl-on-surface">{stats.shipped}</p>
          <p className="text-sm text-rl-on-surface-variant">Shipped</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-5 hidden lg:block">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-green-700" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-800">{stats.delivered}</p>
          <p className="text-sm text-green-700/80">Delivered</p>
        </div>
        <div className="bg-rl-error-container/50 rounded-2xl p-5 hidden lg:block">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-rl-error-container rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-rl-on-error-container" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rl-on-error-container">{stats.cancelled}</p>
          <p className="text-sm text-rl-on-error-container/80">Cancelled</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6 lg:hidden">
        <div className="flex-1 flex items-center bg-rl-surface-container-low rounded-full px-4 py-2.5">
          <Search className="w-4 h-4 text-rl-on-surface-variant mr-2" />
          <input type="text" placeholder="Search orders..." className="bg-transparent text-sm outline-none flex-1 text-rl-on-surface placeholder:text-rl-on-surface-variant" />
        </div>
        <button onClick={() => toast({ title: 'Filter', description: 'Order filters coming soon!' })} className="w-10 h-10 bg-rl-surface-container-high rounded-full flex items-center justify-center hover:bg-rl-surface-container-highest transition-colors">
          <Filter className="w-5 h-5 text-rl-on-surface-variant" />
        </button>
      </div>

      <div className="bg-rl-surface-container-lowest rounded-2xl border border-rl-outline-variant/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-rl-primary animate-spin" />
            <span className="ml-2 text-sm text-rl-on-surface-variant">Loading orders…</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <ShoppingBag className="w-10 h-10 text-rl-on-surface-variant/40 mb-3" />
            <p className="text-sm text-rl-on-surface-variant">No orders yet</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[500px] hidden lg:table">
                <thead>
                  <tr className="border-b border-rl-outline-variant/50">
                    <th className="text-left text-xs font-semibold text-rl-on-surface-variant px-6 py-3">Order ID</th>
                    <th className="text-left text-xs font-semibold text-rl-on-surface-variant px-4 py-3">Customer</th>
                    <th className="text-left text-xs font-semibold text-rl-on-surface-variant px-4 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-rl-on-surface-variant px-4 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-rl-on-surface-variant px-6 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr key={order.id} className="border-b border-rl-outline-variant/30 last:border-0 hover:bg-rl-surface-container-low/50 transition-colors">
                        <td className="px-6 py-4">
                          <button onClick={() => toast({ title: order.orderNumber, description: `Order for ${formatCurrency(order.total)} — ${order.status}` })} className="text-sm font-semibold text-rl-primary hover:underline">
                            #{order.orderNumber}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-sm text-rl-on-surface">{order.user?.name || order.user?.email || 'Unknown'}</td>
                        <td className="px-4 py-4 text-sm text-rl-on-surface-variant">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-rl-on-surface">{formatCurrency(order.total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-rl-outline-variant/30">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <div key={order.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-rl-on-surface">#{order.orderNumber}</p>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-rl-on-surface-variant">{order.user?.name || order.user?.email || 'Unknown'}</p>
                        <p className="text-xs text-rl-on-surface-variant">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-rl-on-surface">{formatCurrency(order.total)}</p>
                        <button onClick={() => toast({ title: order.orderNumber, description: `Order for ${formatCurrency(order.total)} — ${order.status}` })} className="text-xs text-rl-primary font-medium flex items-center gap-0.5 hover:underline mt-1">
                          View <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}