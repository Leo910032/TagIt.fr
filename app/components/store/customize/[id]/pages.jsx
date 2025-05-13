// app/store/customize/[id]/page.jsx
'use client';
import ProductDetail from '@components/store/ProductDetail';

export default function CustomizePage({ params }) {
  return <ProductDetail productId={params.id} />;
}