// app/dashboard/general components/FirebaseAuthCheck.jsx - UPDATED
"use client"
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function FirebaseAuthCheck() {
    const { user, userData, loading, error } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    
    useEffect(() => {
        // Skip authentication check for NFC routes
        if (pathname?.startsWith('/nfc-cards')) {
            console.log('🔵 Skipping Firebase auth check for NFC route:', pathname);
            return;
        }

        // Skip authentication check for public routes
        if (pathname === '/' || 
            pathname?.startsWith('/login') || 
            pathname?.startsWith('/signup') || 
            pathname?.startsWith('/forgot-password') || 
            pathname?.startsWith('/reset-password')) {
            console.log('🔵 Skipping Firebase auth check for public route:', pathname);
            return;
        }

        // Wait for auth to load
        if (loading) {
            console.log('⏳ Firebase auth loading...');
            return;
        }

        // Check for authentication errors
        if (error) {
            console.log('❌ Firebase auth error:', error);
            router.push("/login");
            return;
        }

        // Check if user is authenticated
        if (!user) {
            console.log('❌ Firebase auth check failed, redirecting to login from:', pathname);
            router.push("/login");
            return;
        }

        // Check if user data exists
        if (!userData) {
            console.log('⚠️ User authenticated but no user data, staying on loading...');
            return;
        }

        console.log('✅ Firebase auth check passed for:', pathname, user.email);
    }, [user, userData, loading, error, router, pathname]);

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Authentication Error</p>
                    <button 
                        onClick={() => router.push('/login')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // Show loading if user exists but no user data
    if (user && !userData) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Setting up your profile...</p>
                </div>
            </div>
        );
    }

    // If everything is good, render nothing (let the page load)
    return null;
}