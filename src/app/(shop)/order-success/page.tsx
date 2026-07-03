'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { OrderSuccessPage } from '@/components/pages/order-success-page';

function OrderSuccessInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  return <OrderSuccessPage orderId={orderId} />;
}

export default function OrderSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-rl-surface" />}>
      <OrderSuccessInner />
    </Suspense>
  );
}