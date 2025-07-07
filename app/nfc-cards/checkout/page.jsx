// app/nfc-cards/checkout/page.jsx - FINAL CORRECTED VERSION
"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
// We don't need to import LandingNav anymore because the layout provides it.
import { testForActiveSession } from "@/lib/authentication/testForActiveSession";

export default function CheckoutPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // *** FIX #1: Use the useEffect hook to run the check on page load ***
    useEffect(() => {
        console.log("📦 Checkout page mounted");
        
        // This function now runs after the component has loaded
        const checkAuthStatus = () => {
            const userId = testForActiveSession(true); // Use skipRedirect=true
            const loggedIn = !!userId;
            setIsLoggedIn(loggedIn);
            setIsLoading(false); // This will remove the "Loading..." screen
            console.log("🔍 Checkout auth check:", loggedIn ? "✅ Logged in" : "❌ Not logged in");
        };

        checkAuthStatus();
    }, []); // The empty array [] ensures this effect runs only once.

 

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg text-gray-500">Loading checkout...</div>
                </div>
            </div>
        );
    }

    // If not logged in, show login instructions
    if (!isLoggedIn) {
        return (
            // *** FIX #2: The <LandingNav /> is REMOVED from here ***
            <div className="container mx-auto px-4 pt-32 pb-16">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">
                        Almost There! 🔐
                    </h1>
                    
                    <p className="text-lg text-gray-600 mb-12">
                        Please log in or create an account to complete your NFC card purchase.
                    </p>

                    <div className="bg-white p-8 rounded-lg shadow-sm mb-8 border-l-4 border-blue-500">
                        <h3 className="font-semibold text-gray-800 mb-4">Continue to checkout:</h3>
                        <div className="space-y-3">
                            <Link 
                                href="/login?returnTo=/nfc-cards/checkout"
                                className="block w-full bg-themeGreen text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 active:scale-95 transition-transform"
                            >
                                Login to Your Account
                            </Link>
                            <Link 
                                href="/signup?returnTo=/nfc-cards/checkout"
                                className="block w-full border-2 border-themeGreen text-themeGreen px-6 py-3 rounded-lg font-semibold hover:scale-105 active:scale-95 transition-transform hover:bg-themeGreen hover:text-white"
                            >
                                Create New Account
                            </Link>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            After login/signup, youll be redirected back here to complete your purchase.
                        </p>
                    </div>
                    
                    <Link 
                        href="/nfc-cards/customize" 
                        className="inline-block text-gray-600 hover:text-gray-800 hover:underline"
                    >
                        ← Back to Customize
                    </Link>
                </div>
            </div>
        );
    }

    // If logged in, show checkout form
    return (
        // *** FIX #2: The <LandingNav /> is REMOVED from here ***
        <div className="container mx-auto px-4 pt-32 pb-16">
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                    Checkout ✅
                </h1>
                
                <p className="text-lg text-gray-600 mb-12">
                    Complete your NFC card purchase
                </p>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                    <p className="text-green-800 font-medium">
                        🎉 Successfully authenticated! You can now complete your purchase.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                    <div className="text-left space-y-2 text-gray-600">
                        <div className="flex justify-between">
                            <span>Custom NFC Card</span>
                            <span>$25.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>$5.00</span>
                        </div>
                        <hr className="my-3" />
                        <div className="flex justify-between font-semibold text-gray-800">
                            <span>Total</span>
                            <span>$30.00</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-4">
                        (Payment processing, shipping details, etc. will be added here)
                    </p>
                </div>
                
                <div className="space-y-4">
                    <button 
                        className="w-full bg-themeGreen text-white px-8 py-4 rounded-lg font-semibold hover:scale-105 active:scale-95 transition-transform"
                        onClick={() => alert('🚀 Payment processing will be implemented here!')}
                    >
                        Complete Purchase ($30.00)
                    </button>
                    
                    <Link 
                        href="/nfc-cards/customize" 
                        className="block text-gray-600 hover:text-gray-800 hover:underline"
                    >
                        ← Back to Customize
                    </Link>
                </div>
            </div>
        </div>
    );
}