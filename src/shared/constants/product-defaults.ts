import {
  ShoppingBasket, Gem, Store, Briefcase, Star, ShoppingBag,
} from 'lucide-react';

export const bannerSlides = [
  {
    image: '/banner-slide-1.png',
    badge: 'New Collection',
    title: 'Elegance in Every Thread',
    subtitle: 'Discover our curated collection of premium Bangladeshi fashion',
    cta: 'Shop Sarees',
    gradient: 'from-black/40 via-transparent to-black/60',
  },
  {
    image: '/banner-slide-2.png',
    badge: 'Trending',
    title: 'Bold & Beautiful',
    subtitle: 'Traditional embroidery meets contemporary design',
    cta: 'Explore Now',
    gradient: 'from-black/30 via-black/10 to-black/50',
  },
  {
    image: '/banner-slide-3.png',
    badge: 'Festive Special',
    title: 'Celebrate in Style',
    subtitle: 'Exquisite jewelry and ornate sarees for every occasion',
    cta: 'Shop Jewelry',
    gradient: 'from-black/50 via-transparent to-black/60',
  },
  {
    image: '/banner-slide-4.png',
    badge: 'Exclusive',
    title: 'Golden Hour Glamour',
    subtitle: 'Rich fabrics and intricate detailing, crafted for you',
    cta: 'View Collection',
    gradient: 'from-black/30 via-black/10 to-black/50',
  },
];

export const defaultCategories: { name: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { name: 'Sarees', icon: ShoppingBasket, color: 'bg-pink-100 text-pink-700' },
  { name: 'Jewelry', icon: Gem, color: 'bg-amber-100 text-amber-700' },
  { name: 'Fusion Wear', icon: Store, color: 'bg-purple-100 text-purple-700' },
  { name: 'Bags', icon: Briefcase, color: 'bg-orange-100 text-orange-700' },
  { name: 'Accessories', icon: Star, color: 'bg-rose-100 text-rose-700' },
];

export const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBasket,
  Gem,
  Store,
  Briefcase,
  Star,
  ShoppingBag,
};

export const socialLinks: Record<string, string> = {
  FB: 'https://facebook.com',
  IG: 'https://instagram.com',
  TW: 'https://twitter.com',
  YT: 'https://youtube.com',
};

export const lookbookItems = [
  { img: '/lookbook-blue-saree.png', label: 'Classic Blue Saree', category: 'Sarees' },
  { img: '/lookbook-red-ensemble.png', label: 'Embossed Red Ensemble', category: 'Fusion Wear' },
  { img: '/lookbook-jewelry-set.png', label: 'Festive Jewelry Set', category: 'Jewelry' },
  { img: '/lookbook-golden-saree.png', label: 'Golden Orange Saree', category: 'Sarees' },
];