'use client';
// app/store/customize/[id]/page.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CardCustomizer from '@components/store/CardCustomizer';
import { getProductById } from '@components/store/firebase-utils';
import { FiLoader } from 'react-icons/fi';

export default function CustomizePage({ params }) {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch product details
    const fetchProduct = async () => {
      if (params?.id) {
        try {
          const productData = await getProductById(params.id);
          setProduct(productData);
        } catch (error) {
          console.error("Error fetching product:", error);
          setError("Failed to load product details. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setError("Product ID not provided");
      }
    };

    fetchProduct();
  }, [params?.id]);

  const handleBack = () => {
    router.push('/store');
  };

  const handleSave = (customizationData) => {
    // Here you would add to cart with the customization data
    console.log('Saving customization:', customizationData);
    // For demo, just navigate to cart
    router.push('/store/cart');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <FiLoader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading product details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error}</p>
        <button 
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Store
        </button>
      </div>
    );
  }

  return <CardCustomizer 
    onBack={handleBack} 
    onSave={handleSave} 
    initialProduct={product} 
  />;
}