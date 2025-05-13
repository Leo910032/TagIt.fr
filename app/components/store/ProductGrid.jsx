'use client';
//app/components/store$ ls ProductGrid.jsx 
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiShoppingCart, FiCheck, FiLoader } from 'react-icons/fi';
import { getProducts } from './firebase-utils';
import { toast } from 'react-hot-toast';
import { getCookieValue } from '@utils/auth-utils';

export default function ProductGrid({ onProductSelect }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userId = getCookieValue("adminLinker");
    setIsLoggedIn(!!userId);

    // Fetch products
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSelectProduct = (product) => {
    // If we have an onProductSelect callback, use it (for custom flow)
    if (typeof onProductSelect === 'function') {
      onProductSelect(product);
    } else {
      // Otherwise use the default behavior (direct URL navigation)
      router.push(`/store/customize/${product.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <FiLoader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No products available at this time.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 py-8">
      {products.map((product) => (
        <div 
          key={product.id} 
          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleSelectProduct(product)}
        >
          <div className="h-44 bg-gray-100 relative">
            {product.image ? (
              <Image 
                src={product.image} 
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-200">
                <FiShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
            )}
            {!product.inStock && (
              <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-sm">
                Out of Stock
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="font-medium text-lg">€{product.price}</span>
              <button 
                className={`px-3 py-1 rounded text-sm ${
                  product.inStock ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (product.inStock) {
                    handleSelectProduct(product);
                  }
                }}
                disabled={!product.inStock}
              >
                Select
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}