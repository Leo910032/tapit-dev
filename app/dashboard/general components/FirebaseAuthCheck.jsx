// app/dashboard/general components/FirebaseAuthCheck.jsx - Updated Auth Check for Firebase
"use client"
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function FirebaseAuthCheck() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    
    useEffect(() => {
        // Don't redirect while loading
        if (loading) return;
        
        // Skip authentication check for public routes
        const publicRoutes = [
            '/', 
            '/login', 
            '/signup', 
            '/forgot-password', 
            '/reset-password',
            '/nfc-cards' // Add any other public routes
        ];
        
        const isPublicRoute = publicRoutes.some(route => 
            pathname === route || pathname?.startsWith(route + '/')
        );
        
        if (isPublicRoute) {
            console.log('🔵 Skipping auth check for public route:', pathname);
            return;
        }

        // Redirect to login if not authenticated
        if (!user) {
            console.log('❌ Auth check failed, redirecting to login from:', pathname);
            
            // Preserve the current URL as returnTo parameter
            const returnTo = encodeURIComponent(pathname || '/dashboard');
            router.push(`/login?returnTo=${returnTo}`);
            return;
        }

        console.log('✅ Firebase auth check passed for:', pathname, user.email);
    }, [user, loading, router, pathname]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-themeGreen mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Don't render anything if user is not authenticated (will redirect)
    if (!user) {
        return null;
    }

    // User is authenticated, don't render anything (let the page continue)
    return null;
}