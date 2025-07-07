// app/components/General Components/NavBar.jsx - FINAL, CORRECTED VERSION
"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
// Import any other components your Navbar uses, like a dropdown menu.

export default function NavBar() {
    // ✅ 1. Get ALL data directly and ONLY from the AuthContext.
    // Do NOT do any other data fetching in this component.
    const { user, userData, loading, logout } = useAuth();

    // ✅ 2. Render a loading skeleton while the auth state is being determined.
    // This prevents any errors before data is ready.
    if (loading) {
        return (
            <nav className="w-full flex justify-between items-center p-4 bg-white shadow-sm animate-pulse">
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
                <div className="flex items-center gap-4">
                    <div className="h-6 w-48 bg-gray-200 rounded"></div>
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                </div>
            </nav>
        );
    }
    
    // ✅ 3. If everything is loaded, render the real Navbar.
    return (
        <nav className="w-full flex justify-between items-center p-4 bg-white shadow-sm">
            <Link href="/dashboard">
                {/* Your Logo */}
                <span className="text-xl font-bold text-gray-800">TapIt</span>
            </Link>

            {/* Check if the user is logged in before rendering user-specific elements */}
            {user && userData ? (
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        {/* ✅ 4. Safely access properties from the userData object. */}
                        <p className="font-semibold text-sm">{userData.displayName}</p>
                        <p className="text-xs text-gray-500">{userData.email}</p>
                    </div>
                    {/* The User's Profile Picture */}
                    <Image
                        src={userData.photoURL || `https://ui-avatars.com/api/?name=${userData.displayName}&background=random`}
                        alt="User Profile"
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <button onClick={logout} className="text-sm text-gray-600 hover:text-red-500">
                        Logout
                    </button>
                </div>
            ) : (
                // What to show in the Navbar if the user is not logged in (e.g., on public pages)
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-500">
                        Login
                    </Link>
                    <Link href="/signup" className="text-sm font-medium bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                        Sign Up
                    </Link>
                </div>
            )}
        </nav>
    );
}