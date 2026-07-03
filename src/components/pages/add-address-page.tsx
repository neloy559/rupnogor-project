'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin, ShieldCheck, Truck, MessageCircle, Package, User, ChevronRight, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/store/use-auth';
import { ROUTES } from '@/shared/constants/routes';

const CITIES = ['Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi', 'Barishal', 'Rangpur', 'Mymensingh'];

export function AddAddressPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { getAuthHeaders } = useAuth();

  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [label, setLabel] = useState('');

  const inputClass = 'w-full rounded-full border border-rl-outline-variant bg-rl-surface-container-lowest px-4 py-3 text-sm text-rl-on-surface placeholder:text-rl-on-surface-variant focus:ring-2 focus:ring-rl-primary focus:border-rl-primary outline-none transition-all';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !street.trim() || !city) {
      toast({ title: 'Validation Error', description: 'Full name, phone, street, and city are required.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          street: street.trim(),
          apartment: apartment.trim() || undefined,
          city,
          postalCode: postalCode.trim() || undefined,
          label: label.trim() || undefined,
          isDefault,
        }),
      });

      if (res.ok) {
        toast({ title: 'Address Saved!', description: 'New address has been added to your address book' });
        router.push(ROUTES.ACCOUNT);
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error || 'Failed to save address', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network Error', description: 'Please check your connection and try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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
              </div>
              <nav className="space-y-1">
                {[
                  { label: 'Profile Settings', icon: User, active: false, href: ROUTES.ACCOUNT },
                  { label: 'My Orders', icon: Package, active: false, href: ROUTES.ACCOUNT },
                  { label: 'Address Book', icon: MapPin, active: true, href: ROUTES.ADD_ADDRESS },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      item.active
                        ? 'bg-rl-secondary-container text-rl-on-secondary-container'
                        : 'text-rl-on-surface-variant hover:bg-rl-surface-container-high hover:text-rl-on-surface'
                    }`}
                  >
                    <item.icon className="w-4.5 h-4.5" />
                    {item.label}
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Form Content */}
          <div className="flex-1 max-w-2xl">
            <h2 className="text-xl font-bold text-rl-on-surface mb-6">Add New Address</h2>

            <form onSubmit={handleSubmit} className="bg-rl-surface-container-lowest rounded-2xl border border-rl-outline-variant/50 p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="address-label" className="text-sm font-medium text-rl-on-surface mb-1.5 block">Address Label</label>
                  <input
                    id="address-label"
                    type="text"
                    placeholder="e.g. Home, Office"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="full-name" className="text-sm font-medium text-rl-on-surface mb-1.5 block">Full Name</label>
                  <input
                    id="full-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="text-sm font-medium text-rl-on-surface mb-1.5 block">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+880 1XXX-XXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="postal-code" className="text-sm font-medium text-rl-on-surface mb-1.5 block">Postal Code</label>
                  <input
                    id="postal-code"
                    type="text"
                    placeholder="1200"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="street" className="text-sm font-medium text-rl-on-surface mb-1.5 block">Street Address</label>
                  <input
                    id="street"
                    type="text"
                    placeholder="House 12, Road 5, Dhanmondi"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="apartment" className="text-sm font-medium text-rl-on-surface mb-1.5 block">Apartment/Suite <span className="text-rl-on-surface-variant font-normal">(optional)</span></label>
                  <input
                    id="apartment"
                    type="text"
                    placeholder="Apt 4B"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="city" className="text-sm font-medium text-rl-on-surface mb-1.5 block">City</label>
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className={inputClass + ' appearance-none'}
                  >
                    <option value="">Select city</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-rl-outline-variant/50">
                <div>
                  <p className="text-sm font-medium text-rl-on-surface">Set as Default Address</p>
                  <p className="text-xs text-rl-on-surface-variant">This will be used for your future orders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-rl-outline-variant peer-focus:ring-2 peer-focus:ring-rl-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rl-primary"></div>
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-rl-outline-variant/50">
                <Link
                  href={ROUTES.ACCOUNT}
                  className="flex-1 py-3 rounded-full border border-rl-outline-variant text-sm font-semibold text-rl-on-surface hover:bg-rl-surface-container-high transition-colors text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-rl-primary text-rl-on-primary py-3 rounded-full text-sm font-semibold shadow-md hover:bg-rl-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {submitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              {[
                { icon: Truck, title: 'Fast Shipping', desc: 'All over Bangladesh' },
                { icon: ShieldCheck, title: 'Privacy', desc: '100% secure data' },
                { icon: MessageCircle, title: '24/7 Support', desc: 'Always here for you' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-rl-surface-container-low rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-rl-primary-container rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-rl-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-rl-on-surface">{title}</p>
                    <p className="text-xs text-rl-on-surface-variant">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}