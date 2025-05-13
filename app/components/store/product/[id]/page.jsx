// app/store/product/[id]/page.jsx

import StorePage from '@components/store/StorePage';

export default function ProductDetailPage({ params }) {
  return <StorePage />;
}

// Optional: Add dynamic metadata for SEO
export async function generateMetadata({ params }) {
  try {
    // You could fetch the product data here to get the name
    // For now we'll use a generic title
    return {
      title: `Product Details - TagIt Store`,
      description: 'Premium NFC business cards with customization options',
    };
  } catch (error) {
    return {
      title: 'Product - TagIt Store',
    };
  }
}
