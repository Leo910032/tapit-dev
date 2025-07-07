// app/nfc-cards/layout.jsx - FIXED VERSION
"use client";

import { useState, useEffect } from 'react';
import NFCLandingNav from '@/app/components/General Components/NFCLandingNav';
import { testForActiveSession } from '@/lib/authentication/testForActiveSession';

export default function NFCCardsLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        // ✅ FIXED: Proper auth check with error handling
        const user = testForActiveSession(true); 
        setIsLoggedIn(!!user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []); // Only run once on mount

  // ✅ FIXED: Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeGreen mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NFCLandingNav isLoggedIn={isLoggedIn} />
      <main>{children}</main>
    </div>
  );
}