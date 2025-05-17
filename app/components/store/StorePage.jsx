'use client';
// app/components/store/StorePage.jsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { FiShoppingCart, FiCheck, FiCreditCard, FiSmartphone, FiGlobe, FiTrendingUp, 
         FiArrowRight, FiStar, FiUser, FiLogIn } from 'react-icons/fi';
import ProductGrid from './ProductGrid';
import { testForActiveSession } from "@lib/authentication/testForActiveSession";

// Constants for page content
const FEATURES = [
  {
    icon: <FiSmartphone className="w-6 h-6" />,
    title: 'NFC + QR Technology',
    description: 'Works with all smartphones, no app required'
  },
  {
    icon: <FiGlobe className="w-6 h-6" />,
    title: 'Eco-Friendly Materials',
    description: 'Recycled PVC and upcycled wood options'
  },
  {
    icon: <FiTrendingUp className="w-6 h-6" />,
    title: 'Real-Time Analytics',
    description: 'Track how your card is performing'
  },
  {
    icon: <FiCheck className="w-6 h-6" />,
    title: 'Instant Updates',
    description: 'Change your info anytime without reprinting'
  }
];

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    company: 'Tech Startup',
    text: 'These NFC cards have revolutionized our networking. No more forgotten business cards!',
    rating: 5
  },
  {
    name: 'David Martin',
    company: 'Consulting Firm',
    text: 'The eco-friendly options align perfectly with our sustainability goals.',
    rating: 5
  },
  {
    name: 'Elena Rodriguez',
    company: 'Creative Agency',
    text: 'The customization options let us create cards that truly represent our brand.',
    rating: 5
  }
];

export default function StorePage() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // Auth check effect
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = testForActiveSession();
        if (userId) {
          setIsLoggedIn(true);
          // Fetch username for personalized experience
          try {
            const response = await fetch(`/api/user/${userId}`);
            if (response.ok) {
              const userData = await response.json();
              if (userData && userData.username) {
                setUsername(userData.username);
              }
            }
          } catch (error) {
            console.error("Failed to fetch username", error);
          }
          
          // Fetch cart count
          try {
            const cartResponse = await fetch(`/api/cart/${userId}`);
            if (cartResponse.ok) {
              const cartData = await cartResponse.json();
              if (cartData && cartData.items) {
                setCartCount(cartData.items.length);
              }
            }
          } catch (error) {
            console.error("Failed to fetch cart data", error);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setIsLoggedIn(false);
      } finally {
        // Always set this to false when auth check is complete
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, []);

  // Handle login request
  const handleLoginRequest = () => {
    router.push("/login?redirect=/store");
  };

  // Handle product selection
  const handleSelectProduct = (product) => {
    router.push(`/store/customize/${product.id}`);
  };

  // When showing loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 flex items-center">
              <span className="text-blue-600 mr-2">TagIt</span>
              NFC Cards
            </Link>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/analytics" className="text-gray-600 hover:text-gray-900">
                    Analytics
                  </Link>
                </>
              ) : (
                <button 
                  onClick={handleLoginRequest}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign In
                </button>
              )}
              <Link href="/store/cart" className="relative">
                <FiShoppingCart className="w-5 h-5 text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-20">
          {/* Hero Section */}
          <section className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Smart Business Cards for the Digital Age
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect your physical business card to your digital presence. Order your NFC card and get instant access to your TagIt profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#product-grid"
                className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Order Your Card
              </a>
              {isLoggedIn ? (
                <Link 
                  href="/dashboard"
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FiUser className="w-5 h-5" />
                  Manage My Cards
                </Link>
              ) : (
                <button
                  onClick={handleLoginRequest}
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FiLogIn className="w-5 h-5" />
                  Sign In / Register
                </button>
              )}
            </div>
          </section>

          {/* Features Section */}
          <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </section>

          {/* Product Grid Section */}
          <section id="product-grid" className="scroll-mt-24">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Choose Your Card Style
              </h2>
              <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
                Digital networking made simple. Tap to share your contact information and online profile.
              </p>
            </div>
            
            <ProductGrid onProductSelect={handleSelectProduct} />
          </section>

          {/* How It Works */}
          <section className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Order Your Card</h3>
                <p className="text-gray-600">Choose your material, design, and customization options</p>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Receive & Activate</h3>
                <p className="text-gray-600">Get your card delivered and activate it with your TagIt profile</p>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Share & Connect</h3>
                <p className="text-gray-600">Tap to share your profile instantly, anywhere, anytime</p>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">What Our Customers Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FiStar key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
                  <div>
                    <p className="font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-blue-600 text-white -mx-4 sm:-mx-6 lg:-mx-8 px-6 py-16 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Ready to Go Digital?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of professionals who&apos;ve made the switch to smart business cards
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="#product-grid"
                className="bg-white text-blue-600 px-8 py-3 rounded-md hover:bg-blue-50 transition-colors font-medium"
              >
                Order Your Card Today
              </a>
              {!isLoggedIn && (
                <button
                  onClick={() => router.push('/signup')}
                  className="bg-transparent border border-white text-white px-8 py-3 rounded-md hover:bg-white/10 transition-colors font-medium"
                >
                  Create an Account
                </button>
              )}
            </div>
          </section>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About TagIt</h3>
              <p className="text-gray-300">
                We create innovative NFC business cards that make networking simple, 
                sustainable, and effective.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
                <li><Link href="/store" className="text-gray-300 hover:text-white">Store</Link></li>
                <li><Link href="/faq" className="text-gray-300 hover:text-white">FAQ</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p className="text-gray-300">
                Email: info@tagit.com<br />
                Phone: +1 (555) 123-4567<br />
                Address: 123 Business Ave, Tech City
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} TagIt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}