'use client';
import { use } from 'react';
import { ProductDetailPage } from '@/components/pages/product-detail-page';
export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProductDetailPage productId={id} />;
}