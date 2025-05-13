'use client';
//app/components/store$ ls ProductDetail.jsx 
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiArrowLeft, FiShoppingCart, FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { getProductById, addToCart } from '../firebase-utils';
import { toast } from 'react-hot-toast';
import { getCookieValue } from '@utils/auth-utils';
import CustomizationPanel from './CustomizationPanel';

export default function ProductDetail({ productId }) {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userIdFromCookie = getCookieValue("adminLinker");
    setIsLoggedIn(!!userIdFromCookie);
    setUserId(userIdFromCookie);

    // Fetch product details
    const fetchProduct = async () => {
      try {
        const productData = await getProductById(productId);
        setProduct(productData);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleCustomizationChange = (customizationData) => {
    setCustomization(customizationData);
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    setIsAddingToCart(true);

    try {
      await addToCart(userId, productId, quantity, customization);
      toast.success('Added to cart!');
      router.push('/store/cart');
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
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
          onClick={() => router.push('/store')} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Store
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Product not found.</p>
        <button 
          onClick={() => router.push('/store')} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back button */}
      <button 
        onClick={() => router.push('/store')} 
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <FiArrowLeft className="mr-2" />
        Back to Products
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Product Image */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
            {product.image ? (
              <Image 
                src={product.image} 
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-200">
                <FiShoppingCart className="w-24 h-24 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          
          <div className="text-2xl font-bold text-gray-900 mb-6">€{product.price}</div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">Features:</h2>
            <ul className="space-y-2">
              {product.features && product.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="border border-gray-300 px-3 py-1 rounded-l"
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="border-t border-b border-gray-300 text-center w-16 py-1"
              />
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="border border-gray-300 px-3 py-1 rounded-r"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || !product.inStock}
            className={`w-full py-3 rounded-lg flex items-center justify-center ${
              !product.inStock
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isAddingToCart ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                Adding to Cart...
              </>
            ) : !product.inStock ? (
              "Out of Stock"
            ) : (
              <>
                <FiShoppingCart className="mr-2" />
                Add to Cart
              </>
            )}
          </button>
          
          {/* Shipping Notice */}
          <div className="mt-4 text-sm text-gray-600">
            Free shipping worldwide. Delivery within 7-10 business days.
          </div>
        </div>
      </div>

      {/* Customization Panel */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customize Your Card</h2>
        <CustomizationPanel
          productType={product.type}
          onCustomizationChange={handleCustomizationChange}
        />
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex items-center mb-4">
              <FiAlertCircle className="text-blue-600 w-6 h-6 mr-2" />
              <h2 className="text-xl font-bold">Sign in Required</h2>
            </div>
            <p className="mb-6">
              Please sign in or create an account to add items to your cart.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/store/product/${productId}`)}`)}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push(`/signup?redirect=${encodeURIComponent(`/store/product/${productId}`)}`)}
                className="flex-1 border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50"
              >
                Create Account
              </button>
            </div>
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="w-full text-center mt-4 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}