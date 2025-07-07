// app/dashboard/general components/FirebaseAuthCheck.jsx - FINAL VERSION
"use client"
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function FirebaseAuthCheck() {
    const { user, userData, loading, error } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    
    // 🔧 This useEffect is now simplified. Its ONLY job is redirection AFTER loading is done.
    useEffect(() => {
        // 1. Don't do anything while the initial auth state is being determined.
        //    The JSX below will handle showing a loading screen.
        if (loading) {
            return;
        }

        // 2. Define which routes are "public" and don't need an auth check.
        const isPublicRoute = 
            pathname === '/' ||
            pathname.startsWith('/login') ||
            pathname.startsWith('/signup') ||
            pathname.startsWith('/nfc-cards') || // Added your NFC route here
            pathname.startsWith('/forgot-password') ||
            pathname.startsWith('/reset-password');

        // 3. If we are on a protected route, and loading is finished, THEN check for a user.
        if (!isPublicRoute && !user) {
            console.log('🚪 Gatekeeper: No user on a protected route. Redirecting to /login.');
            router.push('/login');
        }

    }, [user, loading, router, pathname]); // Dependencies are correct

    // --- This JSX rendering block is the key to preventing the crash ---
    // It blocks the rest of the application from rendering until it's safe.

    // A. Check if we are on a public route. If so, render nothing and let the page load.
    const isPublicRoute = 
        pathname === '/' ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/nfc-cards') ||
        pathname.startsWith('/forgot-password') ||
        pathname.startsWith('/reset-password');

    if (isPublicRoute) {
        return null;
    }
    
    // B. If we are on a PROTECTED route, these checks will now run.
    
    // While the context is determining the auth state, show a full-page loader.
    // This stops the dashboard layout and its children from trying to render with null data.
    if (loading) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-[99999]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Authenticating...</p>
                </div>
            </div>
        );
    }

    // If the user is authenticated but we're creating their profile, show this.
    // This prevents the "Cannot destructure username" crash for new users.
    if (user && !userData) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-[99999]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Setting up your profile...</p>
                </div>
            </div>
        );
    }
    
    // If auth is loaded, and the user and their data exist, render nothing.
    // This "opens the gate" and allows the actual dashboard page to render.
    return null;
}