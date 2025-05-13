// Update the auth check in LandingNav component to prevent automatic redirects

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getSessionCookie } from '@lib/authentication/session';

export default function LandingNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status without redirecting
    const checkAuth = () => {
      try {
        const userId = getSessionCookie("adminLinker");
        setIsLoggedIn(!!userId);
      } catch (error) {
        console.error("Authentication check error:", error);
        setIsLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, []);

  return (
    <div className="w-[96%] justify-between flex items-center rounded-[3rem] py-3 absolute sm:top-4 top-2 z-[9999999999] mdpx-12 sm:px-6 px-3 mx-auto bg-white bg-opacity-[0.1] border backdrop-blur-xl hover:glow-white">
      <Link href={"/"}>
        <Image src="/my-logo.png" alt="logo" height={125} width={125} priority className="bg-white rounded-[3rem]" />
      </Link>

      <div className="hidden sm:flex items-center gap-4">
        <Link href="/store" className="text-white hover:text-themeGreen transition-colors font-medium">
          Store
        </Link>
        {isLoggedIn && (
          <Link href="/dashboard" className="text-white hover:text-themeGreen transition-colors font-medium">
            Dashboard
          </Link>
        )}
      </div>

      {isCheckingAuth ? (
        // Loading state
        <div className="h-10 w-20 bg-gray-200 animate-pulse rounded-3xl"></div>
      ) : (
        // Auth button
        isLoggedIn ? (
          <Link href="/dashboard" className="p-3 sm:px-6 px-3 bg-themeGreen flex items-center gap-2 rounded-3xl cursor-pointer hover:scale-105 hover:bg-gray-100 active:scale-90">
            Dashboard
          </Link>
        ) : (
          <Link href="/login?redirect=/store" className="p-3 sm:px-6 px-3 bg-themeGreen flex items-center gap-2 rounded-3xl cursor-pointer hover:scale-105 hover:bg-gray-100 active:scale-90">
            Login
          </Link>
        )
      )}
    </div>
  );
}