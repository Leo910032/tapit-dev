// app/login/page.jsx - FINAL, CORRECTED VERSION
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { handleGoogleSignIn } from "@/lib/authentication/firebaseAuth"; // Assuming you have this

// Import your UI components for the login page
import YourLoginUI from "../components/Login/YourLoginUI"; // Replace with your actual UI component

export default function LoginPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState(null);

    // ✅ This is the smart redirect logic.
    useEffect(() => {
        // Don't do anything while the auth state is being determined.
        if (loading) {
            return;
        }

        // If loading is done, and we have BOTH the user and their Firestore data,
        // it is now safe to redirect to the dashboard.
        if (user && userData) {
            console.log('✅ Login Page: Auth and user data ready. Redirecting to /dashboard.');
            router.push('/dashboard');
        }

    }, [user, userData, loading, router]);

    const onGoogleSignIn = async () => {
        setIsSigningIn(true);
        setError(null);
        try {
            await handleGoogleSignIn();
            // The useEffect above will handle the redirect once the AuthContext updates.
        } catch (err) {
            console.error("Login Page: Google Sign-in failed", err);
            setError(err.message || "Failed to sign in. Please try again.");
            setIsSigningIn(false);
        }
    };
    
    // While the context is loading OR if the user is logged in but we are waiting
    // for the redirect, show a loading screen instead of the login button.
    if (loading || user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Checking your session...</p>
                </div>
            </div>
        );
    }

    // If we are not loading and there's no user, show the actual login page UI.
    return (
        <YourLoginUI
            onGoogleSignIn={onGoogleSignIn}
            isSigningIn={isSigningIn}
            error={error}
        />
    );
}