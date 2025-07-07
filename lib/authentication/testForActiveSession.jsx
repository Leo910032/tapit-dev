// lib/authentication/testForActiveSession.jsx
import { getSessionCookie } from "./session";

export const testForActiveSession = (skipRedirect = false) => {
    const sessionUsername = getSessionCookie("adminLinker");
    
    if (!sessionUsername) {
        // If skipRedirect is true, just return null without redirecting
        if (skipRedirect) {
            return null;
        }
        
        // Check if we're on an NFC route or other public routes
        if (typeof window !== 'undefined') {
            const pathname = window.location.pathname;
            
            // Don't redirect for these routes
            const publicRoutes = [
                '/nfc-cards',
                '/',
                '/login', 
                '/signup',
                '/forgot-password',
                '/reset-password'
            ];
            
            const isPublicRoute = publicRoutes.some(route => 
                pathname === route || pathname.startsWith(route + '/')
            );
            
            if (isPublicRoute) {
                console.log('🔵 Public route detected, not redirecting:', pathname);
                return null;
            }
        }
        
        // For all other routes, redirect to login as before
        if (typeof window !== 'undefined') {
            window.location.href = "/login";
        }
        return null;
    }
    
    return sessionUsername;
}