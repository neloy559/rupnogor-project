'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { socialLinks } from '@/shared/constants/product-defaults';
import { MessageCircle, Loader2 } from 'lucide-react';

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleFooterLink = (label: string) => {
    toast({ title: label, description: `${label} page coming soon!` });
  };

  const handleSocialClick = (platform: string) => {
    const url = socialLinks[platform];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
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
              {Object.entries(socialLinks).map(([key]) => (
                <button key={key} onClick={() => handleSocialClick(key)} className="w-10 h-10 rounded-full bg-rl-surface-container-high flex items-center justify-center text-xs font-semibold text-rl-on-surface-variant hover:bg-rl-secondary-container hover:text-rl-on-secondary-container transition-colors">
                  {key}
                </button>
              ))}
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