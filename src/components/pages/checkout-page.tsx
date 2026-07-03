'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/use-auth';
import { useCart } from '@/store/use-cart';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/shared/constants/routes';
import { MapPin, Plus, Truck, ShieldCheck, Loader2, CheckCircle, CreditCard, Banknote } from 'lucide-react';

interface Address {
  id: string; label?: string; fullName: string; phone: string;
  street: string; apartment?: string; city: string; postalCode?: string; isDefault?: boolean;
}

export function CheckoutPage() {
  const router = useRouter();
  const { token, getAuthHeaders } = useAuth();
  const { items, cartTotal, isLoading, placeOrder } = useCart();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [placing, setPlacing] = useState(false);
  const [loadingAddr, setLoadingAddr] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch('/api/addresses', { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setAddresses(Array.isArray(data) ? data : []);
          const def = (Array.isArray(data) ? data : []).find((a: Address) => a.isDefault);
          if (def) setSelectedAddress(def.id);
        }
      } catch { /* silent */ }
      setLoadingAddr(false);
    })();
  }, [token, getAuthHeaders]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast({ title: 'Select Address', description: 'Please select a delivery address' });
      return;
    }
    if (items.length === 0) return;

    setPlacing(true);
    const orderItems = items.map(i => ({
      productId: i.productId,
      quantity: i.quantity,
    }));

    const result = await placeOrder(selectedAddress, orderItems);
    setPlacing(false);

    if (result.success && result.order) {
      router.push(ROUTES.ORDER_SUCCESS(result.order.id));
    } else {
      toast({ title: 'Order Failed', description: result.error || 'Something went wrong' });
    }
  };

  const formatPrice = (p: number) => `৳${p.toLocaleString()}`;

  if (!isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-rl-on-surface-variant/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-rl-on-surface mt-4">Your cart is empty</h2>
        <p className="text-sm text-rl-on-surface-variant mt-1">Add items before checking out</p>
        <Link href={ROUTES.HOME} className="mt-6 bg-rl-primary text-rl-on-primary px-6 py-3 rounded-full font-semibold hover:bg-rl-primary/90 transition-colors inline-block">
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Delivery Address */}
            <section>
              <h2 className="text-base font-semibold text-rl-on-surface mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rl-primary" /> Delivery Address
              </h2>
              {loadingAddr ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <div key={i} className="animate-pulse bg-rl-surface-container-high rounded-2xl h-24" />)}
                </div>
              ) : addresses.length === 0 ? (
                <div className="bg-rl-surface-container-high rounded-2xl p-6 text-center">
                  <MapPin className="w-10 h-10 text-rl-on-surface-variant/30 mx-auto mb-2" />
                  <p className="text-sm text-rl-on-surface-variant">No saved addresses</p>
                  <Link href={ROUTES.ADD_ADDRESS} className="mt-3 text-sm font-semibold text-rl-primary flex items-center gap-1 mx-auto hover:underline">
                    <Plus className="w-4 h-4" /> Add Address
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr.id)}
                      className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                        selectedAddress === addr.id
                          ? 'border-rl-primary bg-rl-primary-container/10'
                          : 'border-rl-outline-variant/50 bg-rl-surface-container-lowest hover:border-rl-on-surface-variant'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          {addr.label && (
                            <span className="inline-block text-xs font-semibold text-rl-on-primary-container bg-rl-primary-container px-2 py-0.5 rounded-full mb-1">
                              {addr.label}
                            </span>
                          )}
                          <p className="text-sm font-medium text-rl-on-surface">{addr.fullName}</p>
                          <p className="text-xs text-rl-on-surface-variant mt-0.5">{addr.phone}</p>
                          <p className="text-xs text-rl-on-surface-variant mt-1">
                            {addr.street}{addr.apartment ? `, ${addr.apartment}` : ''}, {addr.city}{addr.postalCode ? ` - ${addr.postalCode}` : ''}
                          </p>
                        </div>
                        {selectedAddress === addr.id && (
                          <CheckCircle className="w-5 h-5 text-rl-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </button>
                  ))}
                  <Link
                    href={ROUTES.ADD_ADDRESS}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-rl-outline-variant text-sm font-medium text-rl-on-surface-variant hover:border-rl-primary hover:text-rl-primary transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add New Address
                  </Link>
                </div>
              )}
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="text-base font-semibold text-rl-on-surface mb-3">Payment Method</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-rl-primary bg-rl-primary-container/10'
                      : 'border-rl-outline-variant/50 bg-rl-surface-container-lowest'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-rl-secondary-container flex items-center justify-center flex-shrink-0">
                    <Banknote className="w-5 h-5 text-rl-on-secondary-container" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-rl-on-surface">Cash on Delivery</p>
                    <p className="text-xs text-rl-on-surface-variant">Pay when you receive your order</p>
                  </div>
                  {paymentMethod === 'cod' && <CheckCircle className="w-5 h-5 text-rl-primary" />}
                </button>
                <button
                  disabled
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-rl-outline-variant/30 bg-rl-surface-container-lowest opacity-50 cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-full bg-rl-surface-container-high flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-rl-on-surface-variant" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-rl-on-surface">Online Payment</p>
                    <p className="text-xs text-rl-on-surface-variant">Coming soon</p>
                  </div>
                </button>
              </div>
            </section>

            {/* Order Items (Mobile) */}
            <section className="lg:hidden">
              <h2 className="text-base font-semibold text-rl-on-surface mb-3">Order Items ({items.length})</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const img = item.product.images?.[0] || '/products/product-saree-rose.png';
                  return (
                    <div key={item.id} className="flex gap-3 p-3 bg-rl-surface-container-lowest rounded-2xl">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                        <Image src={img} alt={item.product.name} width={56} height={56} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-rl-on-surface truncate">{item.product.name}</p>
                        <p className="text-xs text-rl-on-surface-variant">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-rl-on-surface flex-shrink-0">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column — Order Summary (Desktop) */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-20 bg-rl-surface-container-lowest rounded-2xl p-6 border border-rl-outline-variant/50">
              <h2 className="text-base font-semibold text-rl-on-surface mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-72 overflow-y-auto mb-4">
                {items.map((item) => {
                  const img = item.product.images?.[0] || '/products/product-saree-rose.png';
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                        <Image src={img} alt={item.product.name} width={56} height={56} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-rl-on-surface truncate">{item.product.name}</p>
                        <p className="text-xs text-rl-on-surface-variant">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-rl-on-surface flex-shrink-0">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-rl-outline-variant/50 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-rl-on-surface-variant">Subtotal</span>
                  <span className="text-rl-on-surface">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-rl-on-surface-variant">Shipping</span>
                  <span className="text-rl-primary font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-rl-outline-variant/50">
                  <span className="text-rl-on-surface">Total</span>
                  <span className="text-rl-primary">{formatPrice(cartTotal)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-rl-outline-variant/50 text-xs text-rl-on-surface-variant">
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Free Delivery</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Secure Payment</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placing || items.length === 0}
                className="w-full mt-4 bg-rl-primary text-rl-on-primary py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-rl-primary/90 transition-colors disabled:opacity-50"
              >
                {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-50 bg-rl-surface border-t border-rl-outline-variant/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-rl-on-surface-variant">Total</p>
            <p className="text-lg font-bold text-rl-primary">{formatPrice(cartTotal)}</p>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={placing || items.length === 0}
            className="bg-rl-primary text-rl-on-primary px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-rl-primary/90 transition-colors disabled:opacity-50"
          >
            {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {placing ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </>
  );
}