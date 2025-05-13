// Updated version of ShoppingCart.jsx that checks auth status
// but doesn't force redirects

'use client';

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { FiAlertCircle, FiShoppingCart } from 'react-icons/fi';
import { fetchUserData } from '@lib/fetch data/fetchUserData';
import { toast } from 'react-hot-toast';

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const step = searchParams.get('step');

  // Check if user is logged in and fetch user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use cookies directly
        const cookies = document.cookie.split(';');
        const adminLinkerCookie = cookies.find(c => c.trim().startsWith('adminLinker='));
        const userId = adminLinkerCookie ? adminLinkerCookie.split('=')[1] : null;
        
        if (userId) {
          setIsLoggedIn(true);
          
          // Fetch user data to pre-fill the form
          try {
            const data = await fetchUserData(userId);
            if (data) {
              setUserData(data);
            }
          } catch (error) {
            console.error("Failed to fetch user data:", error);
          }
          
          // Fetch cart items from localStorage or API
          try {
            const storedCart = localStorage.getItem('tagit_cart');
            if (storedCart) {
              setCartItems(JSON.parse(storedCart));
            }
          } catch (error) {
            console.error("Error loading cart:", error);
          }
          
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, []);

  // If still checking auth status, show loading indicator
  if (isCheckingAuth) {
    return (
      <div className="max-w-2xl mx-auto p-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not logged in, show auth message but don't redirect
  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md text-center my-12">
        <FiAlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="mb-6 text-gray-600">You need to be logged in to complete your purchase.</p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => router.push(`/login?redirect=${encodeURIComponent(redirect || '/store')}&step=${step || 'checkout'}`)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Sign In
          </button>
          <button 
            onClick={() => router.push(`/signup?redirect=${encodeURIComponent(redirect || '/store')}&step=${step || 'checkout'}`)}
            className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50"
          >
            Create Account
          </button>
        </div>
        <button 
          onClick={() => router.push('/store')}
          className="mt-6 text-gray-600 hover:text-gray-900"
        >
          ← Back to store
        </button>
      </div>
    );
  }

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md text-center my-12">
        <FiShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="mb-6 text-gray-600">You haven't added any items to your cart yet.</p>
        <button 
          onClick={() => router.push('/store')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // Otherwise render the cart as normal
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <FiShoppingCart className="w-8 h-8" />
          Shopping Cart
        </h1>
        <p className="text-gray-600">
          Review your order and proceed to checkout
        </p>
      </div>
      
      {/* Cart content would go here */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <p>Welcome {userData?.username || 'User'}, your cart is ready for checkout!</p>
        {/* Cart items would render here */}
      </div>
    </div>
  );
}