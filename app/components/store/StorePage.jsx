'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiCheck, FiCreditCard, FiSmartphone, FiGlobe, FiTrendingUp, FiArrowRight, FiStar, FiUser, FiLogIn } from 'react-icons/fi';
import CardSelector from './CardSelector';
import CustomizationPanel from './CustomizationPanel';
import ShoppingCart from './ShoppingCart';

// Import other components as needed

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
  const [currentStep, setCurrentStep] = useState('home'); // home, select, customize, checkout
  const [selectedCard, setSelectedCard] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  // Check if user is logged in - with proper error handling
  // IMPORTANT: Don't redirect if not logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use cookies directly
        const cookies = document.cookie.split(';');
        const adminLinkerCookie = cookies.find(c => c.trim().startsWith('adminLinker='));
        const userId = adminLinkerCookie ? adminLinkerCookie.split('=')[1] : null;
        
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

  const handleAuthAction = () => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/store");
    } else {
      router.push("/dashboard");
    }
  };

  // Handle checkout action with login prompt if needed
  const handleCheckoutAction = () => {
    if (!isLoggedIn) {
      // Show login prompt instead of redirecting
      setCurrentStep('login-needed');
    } else {
      setCurrentStep('checkout');
    }
  };

  // Don't render anything until auth check is complete to prevent flashes
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'select':
        return <CardSelector 
          onSelect={(card) => {
            setSelectedCard(card);
            setCurrentStep('customize');
          }} 
          onBack={() => setCurrentStep('home')} 
        />;
        
      case 'customize':
        return (
          <CustomizationPanel
            cardType={selectedCard}
            onNext={handleCheckoutAction}
            onBack={() => setCurrentStep('select')}
          />
        );
        
      case 'checkout':
        // Only allow checkout step if logged in
        if (!isLoggedIn) {
          setCurrentStep('login-needed');
          return null;
        }
        return <ShoppingCart username={username} />;
      
      case 'login-needed':
        // A step that prompts for login instead of redirecting
        return (
          <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md text-center my-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
              <FiUser className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="mb-6 text-gray-600">
              You need to be logged in to complete your purchase. Please sign in or create an account to continue.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/login?redirect=/store&step=checkout"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/signup?redirect=/store&step=checkout"
                className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition-colors"
              >
                Create Account
              </Link>
            </div>
            <button 
              onClick={() => setCurrentStep('home')}
              className="mt-6 text-gray-600 hover:text-gray-900"
            >
              ← Back to store
            </button>
          </div>
        );
        
      default:
        return (
          <div className="space-y-20">
            {/* Hero Section */}
            <section className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Smart Business Cards for the Digital Age
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Connect your physical business card to your digital presence. Order your NFC card and get instant access to your TagIt profile.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setCurrentStep('select')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Order Your Card
                </button>
                <button
                  onClick={handleAuthAction}
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isLoggedIn ? (
                    <>
                      <FiUser className="w-5 h-5" />
                      Manage My Cards
                    </>
                  ) : (
                    <>
                      <FiLogIn className="w-5 h-5" />
                      Sign In / Register
                    </>
                  )}
                </button>
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

            {/* Product Showcase */}
            <section className="relative">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Choose Your Perfect Card
                  </h2>
                  <p className="text-gray-600 mb-6">
                    From recycled PVC to sustainable wood, our cards are designed to make a lasting impression while being kind to the planet.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span>Full customization options</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span>Premium materials</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span>Instant digital profile connection</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => setCurrentStep('select')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
                  >
                    Shop Now
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="aspect-[1.75/1] bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg transform rotate-[-5deg]"></div>
                    <div className="aspect-[1.75/1] bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg transform rotate-[5deg] mt-6"></div>
                  </div>
                </div>
              </div>
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
                    <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                    <div>
                      <p className="font-medium text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.company}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center bg-blue-600 text-white -mx-6 px-6 py-16 rounded-lg">
              <h2 className="text-3xl font-bold mb-4">Ready to Go Digital?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of professionals who've made the switch to smart business cards
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => setCurrentStep('select')}
                  className="bg-white text-blue-600 px-8 py-3 rounded-md hover:bg-blue-50 transition-colors font-medium"
                >
                  Order Your Card Today
                </button>
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
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 flex items-center">
              <Image src="/my-logo.png" alt="logo" height={40} width={40} className="mr-2" />
              TagIt Store
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
                <Link href="/login?redirect=/store" className="text-gray-600 hover:text-gray-900">
                  Sign In
                </Link>
              )}
              <button 
                className="relative"
                onClick={() => {
                  if (isLoggedIn) {
                    setCurrentStep('checkout');
                  } else {
                    // Don't redirect - just show the login prompt
                    setCurrentStep('login-needed');
                  }
                }}
              >
                <FiShoppingCart className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  0
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      {currentStep !== 'home' && currentStep !== 'login-needed' && (
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              {[
                { step: 'home', label: 'Shop' },
                { step: 'select', label: 'Select Card' },
                { step: 'customize', label: 'Customize' },
                { step: 'checkout', label: 'Checkout' }
              ].map((item, index) => (
                <div key={item.step} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Only allow navigating backward or to current step
                      const steps = ['home', 'select', 'customize', 'checkout'];
                      const currentIndex = steps.indexOf(currentStep);
                      const targetIndex = steps.indexOf(item.step);
                      if (targetIndex <= currentIndex) {
                        setCurrentStep(item.step);
                      }
                    }}
                    className={`text-sm ${
                      currentStep === item.step
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </button>
                  {index < 3 && <span className="text-gray-300">›</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {renderStep()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">About TagIt</h3>
              <p className="text-sm text-gray-600">
                Connecting your physical business card to your digital presence with smart NFC technology.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Products</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/store" className="hover:text-gray-900">NFC Cards</Link></li>
                <li><Link href="/store?filter=pvc" className="hover:text-gray-900">PVC Cards</Link></li>
                <li><Link href="/store?filter=wood" className="hover:text-gray-900">Wood Cards</Link></li>
                <li><Link href="/dashboard" className="hover:text-gray-900">Digital Profiles</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Customer Care</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/support" className="hover:text-gray-900">Support</Link></li>
                <li><Link href="/shipping" className="hover:text-gray-900">Shipping Info</Link></li>
                <li><Link href="/returns" className="hover:text-gray-900">Returns</Link></li>
                <li><Link href="/faq" className="hover:text-gray-900">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Account</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {isLoggedIn ? (
                  <>
                    <li><Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link></li>
                    <li><Link href="/dashboard/analytics" className="hover:text-gray-900">Analytics</Link></li>
                    <li><Link href="/dashboard/settings" className="hover:text-gray-900">Settings</Link></li>
                    <li><Link href="/dashboard/logout" className="hover:text-gray-900">Log Out</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/login" className="hover:text-gray-900">Log In</Link></li>
                    <li><Link href="/signup" className="hover:text-gray-900">Sign Up</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
            <p>© 2025 TagIt.fr - All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}