'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/store/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/shared/constants/routes';
import { CheckCircle, Package, MapPin, Phone, Copy } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string | null;
  color?: string | null;
  size?: string | null;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  address: string | Record<string, unknown>;
  orderItems: OrderItem[];
}

interface AddressData {
  fullName: string;
  street: string;
  apartment?: string;
  city: string;
  postalCode?: string;
  phone?: string;
}

export function OrderSuccessPage({ orderId }: { orderId: string }) {
  const { toast } = useToast();
  const { getAuthHeaders } = useAuth();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [address, setAddress] = useState<AddressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          if (data.address) {
            try {
              setAddress(typeof data.address === 'string' ? JSON.parse(data.address) : data.address);
            } catch { /* ignore */ }
          }
        }
      } catch { /* silent */ }
      setLoading(false);
    })();
  }, [orderId, getAuthHeaders]);

  const copyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber).then(() => {
        toast({ title: 'Copied!', description: 'Order number copied to clipboard' });
      }).catch(() => {
        toast({ title: 'Copied!', description: 'Order number copied' });
      });
    }
  };

  const formatPrice = (p: number) => `৳${p.toLocaleString()}`;

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <div className="w-20 h-20 rounded-full bg-rl-surface-container-high animate-pulse mx-auto mb-4" />
        <div className="h-6 w-48 bg-rl-surface-container-high rounded animate-pulse mx-auto mb-2" />
        <div className="h-4 w-32 bg-rl-surface-container-high rounded animate-pulse mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-[scaleIn_0.4s_ease-out]">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-rl-on-surface mt-4">Order Placed Successfully!</h2>
        <p className="text-sm text-rl-on-surface-variant mt-1">Thank you for shopping with RupNogor</p>
      </div>

      <div className="bg-rl-surface-container-high rounded-2xl p-4 mb-4">
        <p className="text-xs text-rl-on-surface-variant mb-1">Order Number</p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold font-mono text-rl-on-surface tracking-wider">
            {order?.orderNumber || 'N/A'}
          </p>
          <button
            onClick={copyOrderNumber}
            className="flex items-center gap-1 text-xs font-medium text-rl-primary hover:underline px-2 py-1 rounded-full hover:bg-rl-primary-container transition-colors"
          >
            <Copy className="w-3.5 h-3.5" /> Copy
          </button>
        </div>
      </div>

      <div className="bg-rl-surface-container-lowest rounded-2xl p-4 mb-4 border border-rl-outline-variant/30">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-rl-on-surface-variant">Status</span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rl-primary-container text-rl-on-primary-container">
            {order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Processing'}
          </span>
        </div>
        {address && (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-rl-on-surface-variant mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-rl-on-surface">{address.fullName}</p>
                <p className="text-xs text-rl-on-surface-variant">
                  {address.street}{address.apartment ? `, ${address.apartment}` : ''}, {address.city}{address.postalCode ? ` - ${address.postalCode}` : ''}
                </p>
              </div>
            </div>
            {address.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-rl-on-surface-variant flex-shrink-0" />
                <p className="text-sm text-rl-on-surface">{address.phone}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {order?.orderItems && order.orderItems.length > 0 && (
        <div className="bg-rl-surface-container-lowest rounded-2xl p-4 mb-4 border border-rl-outline-variant/30">
          <h3 className="text-sm font-semibold text-rl-on-surface mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" /> Items Ordered
          </h3>
          <div className="space-y-3">
            {order.orderItems.map((item: OrderItem, i: number) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-rl-surface-container-high">
                  <Image
                    src={item.image || '/products/product-saree-rose.png'}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-rl-on-surface truncate">{item.name}</p>
                  <p className="text-xs text-rl-on-surface-variant">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-rl-on-surface flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-rl-primary-container/30 rounded-2xl mb-8">
        <span className="text-sm font-medium text-rl-on-surface-variant">Total Paid</span>
        <span className="text-xl font-bold text-rl-primary">{formatPrice(order?.total || 0)}</span>
      </div>

      <div className="flex gap-3">
        <Link
          href={ROUTES.HOME}
          className="flex-1 py-3 rounded-full border-2 border-rl-primary text-rl-primary font-semibold text-sm hover:bg-rl-primary hover:text-rl-on-primary transition-colors text-center"
        >
          Continue Shopping
        </Link>
        <Link
          href={ROUTES.ACCOUNT}
          className="flex-1 py-3 rounded-full bg-rl-primary text-rl-on-primary font-semibold text-sm hover:bg-rl-primary/90 transition-colors text-center"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
}