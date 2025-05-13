'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSessionCookie } from '@lib/authentication/session';
import { toast } from 'react-hot-toast';
import { isFromRedirect } from '@utils/auth-utils';

export default function AuthRedirector({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [loopDetected, setLoopDetected] = useState(false);

  useEffect(() => {
    // First, check if we're in a redirect loop
    if (isFromRedirect()) {
      console.warn("Redirect loop detected - breaking out of the loop");
      setLoopDetected(true);
      setIsProcessing(false);
      return;
    }

    const handleRedirect = async () => {
      try {
        const redirect = searchParams.get('redirect');
        const step = searchParams.get('step');
        
        // Check if we're on the store page or a store related path
        const isStorePage = redirect && (
          redirect === '/store' || 
          redirect.startsWith('/store/') ||
          window.location.pathname === '/store' ||
          window.location.pathname.startsWith('/store/')
        );
        
        // Check if user is logged in - WITHOUT forcing redirect
        const userId = getSessionCookie("adminLinker");
        
        // Only redirect if both conditions are met: user is logged in and redirect is specified
        if (userId && redirect) {
          // Store current action to prevent loops
          localStorage.setItem('last_redirect', window.location.href);
          
          // Allow a little time for any authentication processes to complete
          setTimeout(() => {
            // Clear the redirect information from storage after using it
            localStorage.removeItem('last_redirect');
            
            // Redirect to the specified path with the step if provided
            if (step) {
              router.push(`${redirect}?step=${step}`);
            } else {
              router.push(redirect);
            }
            
            // Show success message
            toast.success('Login successful! Redirecting...');
          }, 500);
          return;
        }
        
        setIsProcessing(false);
      } catch (error) {
        console.error('Redirect error:', error);
        setIsProcessing(false);
      }
    };
    
    handleRedirect();
  }, [router, searchParams]);

  // If in a loop, just render children without processing
  if (loopDetected) {
    return <>{children}</>;
  }

  // While processing the redirect, show a minimal loading indicator
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-themeGreen"></div>
      </div>
    );
  }

  // Once processed, render children normally
  return <>{children}</>;
}