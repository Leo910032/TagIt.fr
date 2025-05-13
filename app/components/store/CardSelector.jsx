// Updated version of CardSelector.jsx that doesn't force redirects
// This component is part of your store flow

'use client';

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiUser, FiX, FiCreditCard, FiTruck, FiShield } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';

// Sample card data - would come from an API in production
const MOCK_CARDS = [
  {
    id: 'card-1',
    name: 'Premium PVC Card',
    description: 'Our high-quality recycled PVC card with NFC technology',
    price: 45,
    image: '/api/placeholder/300/180'
  },
  {
    id: 'card-2',
    name: 'Eco Wood Card',
    description: 'Sustainable wooden card made from upcycled materials',
    price: 55,
    image: '/api/placeholder/300/180'
  },
  {
    id: 'card-3',
    name: 'Premium Metal Card',
    description: 'Stainless steel card with laser engraving',
    price: 85,
    image: '/api/placeholder/300/180'
  }
];

export default function CardSelector({ onSelect, onBack }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const router = useRouter();

  // Check if user is logged in without redirecting
  useEffect(() => {
    try {
      // Use cookies directly
      const cookies = document.cookie.split(';');
      const adminLinkerCookie = cookies.find(c => c.trim().startsWith('adminLinker='));
      const userId = adminLinkerCookie ? adminLinkerCookie.split('=')[1] : null;
      setIsLoggedIn(!!userId);
    } catch (error) {
      console.error("Auth check error:", error);
      setIsLoggedIn(false);
    }
  }, []);

  const handleCardSelect = (card) => {
    if (isLoggedIn) {
      // If logged in, proceed normally
      onSelect(card);
    } else {
      // If not logged in, show login prompt modal instead of redirecting
      setShowLoginPrompt(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Back to Store
        </button>
        
        {isLoggedIn ? (
          <div className="text-gray-600">
            <FiUser className="inline-block mr-2" />
            Account verified
          </div>
        ) : (
          <Link 
            href="/login?redirect=/store&step=select"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <FiUser className="w-4 h-4" />
            Sign in for faster checkout
          </Link>
        )}
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Select Your Card
      </h1>
      <p className="text-gray-600 mb-8">
        Choose from our range of smart business cards with embedded NFC technology.
      </p>
      
      <div className="grid md:grid-cols-3 gap-6">
        {MOCK_CARDS.map((card) => (
          <div 
            key={card.id} 
            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleCardSelect(card)}
          >
            <div className="h-44 bg-gray-100 relative">
              <Image 
                src={card.image} 
                alt={card.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{card.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{card.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-medium text-lg">€{card.price}</span>
                <button 
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardSelect(card);
                  }}
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Non-redirecting login prompt modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Sign in Required</h2>
              <button 
                onClick={() => setShowLoginPrompt(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Please sign in or create an account to customize and purchase your card.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/login?redirect=/store&step=select"
                className="bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700"
              >
                Sign In
              </Link>
              <Link
                href="/signup?redirect=/store&step=select"
                className="border border-blue-600 text-blue-600 py-2 px-4 rounded text-center hover:bg-blue-50"
              >
                Create Account
              </Link>
            </div>
            
            <div className="mt-6 pt-4 border-t text-center">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Continue browsing
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Shipping and payment info section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping & Payment Information</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mt-1">
              <FiTruck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Free Worldwide Shipping</h3>
              <p className="text-gray-600 text-sm">All orders include free standard shipping</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mt-1">
              <FiCreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Secure Payment</h3>
              <p className="text-gray-600 text-sm">Credit cards, PayPal, and bank transfers accepted</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mt-1">
              <FiShield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">30-Day Guarantee</h3>
              <p className="text-gray-600 text-sm">Not satisfied? Get a full refund within 30 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}