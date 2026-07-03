'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Loader2 } from 'lucide-react';

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleFooterLink = (label: string) => {
    toast({ title: label, description: `${label} page coming soon!` });
  };

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast({ title: 'Email required', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    setSubscribing(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        toast({ title: 'Subscribed!', description: "You've joined our newsletter." });
        setEmail('');
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error || 'Failed to subscribe', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network Error', description: 'Please try again later.', variant: 'destructive' });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="hidden lg:block bg-rl-surface-container-lowest border-t border-rl-outline-variant/50 px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/brand-logo.png" alt="RupNogor" width={28} height={28} className="rounded-full" />
              <h4 className="text-lg font-bold text-rl-primary italic">RupNogor</h4>
            </div>
            <p className="text-sm text-rl-on-surface-variant leading-relaxed">
              Your destination for premium Bangladeshi fashion. Elegant sarees, handcrafted jewelry, and modern fusion wear.
            </p>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-rl-on-surface mb-3">Quick Links</h5>
            <ul className="space-y-2 text-sm text-rl-on-surface-variant">
              {['About Us', 'Shipping', 'Returns', 'Contact'].map((item) => (
                <li key={item}><button onClick={() => handleFooterLink(item)} className="hover:text-rl-primary transition-colors">{item}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-rl-on-surface mb-3">Support</h5>
            <ul className="space-y-2 text-sm text-rl-on-surface-variant">
              {['FAQ', 'Size Guide', 'Track Order', 'Privacy Policy'].map((item) => (
                <li key={item}><button onClick={() => handleFooterLink(item)} className="hover:text-rl-primary transition-colors">{item}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-rl-on-surface mb-3">Newsletter</h5>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubscribe(); }}
                className="flex-1 rounded-full border border-rl-outline-variant bg-rl-surface-container-lowest px-3 py-2 text-sm text-rl-on-surface placeholder:text-rl-on-surface-variant outline-none focus:border-rl-primary"
              />
              <button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="bg-rl-primary text-rl-on-primary px-4 py-2 rounded-full text-sm font-semibold hover:bg-rl-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {subscribing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Join
              </button>
            </div>
            <h5 className="text-sm font-semibold text-rl-on-surface mt-6 mb-3">Follow Us</h5>
            <div className="flex gap-3">
              {/* Facebook */}
              <button onClick={() => window.open('https://facebook.com', '_blank', 'noopener,noreferrer')} aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-90 transition-opacity">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
              </button>
              {/* Instagram */}
              <button onClick={() => window.open('https://instagram.com', '_blank', 'noopener,noreferrer')} aria-label="Instagram"
                className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                style={{background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%,#d6249f 60%,#285AEB 90%)'}}>
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </button>
              {/* YouTube */}
              <button onClick={() => window.open('https://youtube.com', '_blank', 'noopener,noreferrer')} aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-[#FF0000] flex items-center justify-center hover:opacity-90 transition-opacity">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
                </svg>
              </button>
              {/* WhatsApp */}
              <button onClick={() => window.open('https://wa.me/', '_blank', 'noopener,noreferrer')} aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center hover:opacity-90 transition-opacity">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-rl-outline-variant/50 mt-8 pt-6 text-center text-xs text-rl-on-surface-variant">
          &copy; 2024 RupNogor. All rights reserved. Made in Bangladesh.
        </div>
      </div>
    </footer>
  );
}

export function ChatFab() {
  const { toast } = useToast();

  return (
    <button
      onClick={() => toast({ title: 'Live Chat', description: 'Chat support coming soon! We\'re here to help.' })}
      className="fixed bottom-24 right-4 lg:bottom-6 w-14 h-14 bg-rl-primary text-rl-on-primary rounded-full shadow-lg flex items-center justify-center hover:bg-rl-primary/90 active:scale-95 transition-all z-40"
      aria-label="Chat with us"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}