'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/store/use-auth';
import { useCart } from '@/store/use-cart';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useAuth((s) => s.token);
  const fetchMe = useAuth((s) => s.fetchMe);
  const fetchCart = useCart((s) => s.fetchCart);
  const prevToken = useRef(token);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  useEffect(() => {
    if (token && token !== prevToken.current) {
      fetchCart();
    }
    prevToken.current = token;
  }, [token, fetchCart]);

  return <>{children}</>;
}