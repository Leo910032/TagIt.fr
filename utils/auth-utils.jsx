'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// This utility function checks if we're in a redirect loop - no matter
// where it's called from (login, signup, store, etc.)
export function isFromRedirect() {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check the referrer URL
    const referrer = document.referrer;
    if (!referrer) return false;
    
    const referrerUrl = new URL(referrer);
    const currentUrl = new URL(window.location.href);
    
    // If we're coming from the login page and going to login again, it's a loop
    if (
      (referrerUrl.pathname.includes('/login') && currentUrl.pathname.includes('/login')) ||
      (referrerUrl.pathname.includes('/signup') && currentUrl.pathname.includes('/signup'))
    ) {
      return true;
    }
    
    // Check localStorage for a redirect flag we set
    const lastRedirect = localStorage.getItem('last_redirect');
    if (lastRedirect === window.location.href) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking redirect history:", error);
    return false;
  }
}

// Helper function to check cookies without import issues
export function getCookieValue(name) {
  try {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
      return cookie ? cookie.split('=')[1] : null;
    }
    return null;
  } catch (error) {
    console.error(`Error getting cookie ${name}:`, error);
    return null;
  }
}

// Helper function to check if a path is a public route
export function isPublicRoute(path) {
  const publicRoutes = [
    '/store',
    '/store/',
    '/login',
    '/signup',
    '/',
    '/faq',
    '/support',
    '/shipping',
    '/returns'
  ];
  
  // Check exact matches
  if (publicRoutes.includes(path)) return true;
  
  // Check path prefixes
  return publicRoutes.some(route => 
    route.endsWith('/') && path.startsWith(route)
  );
}
