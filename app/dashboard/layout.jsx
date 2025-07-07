// app/dashboard/layout.jsx - FINAL, CORRECTED VERSION
"use client" // ✅ 1. This entire layout must be a client component to use hooks.

import { Inter } from 'next/font/google'
import NavBar from '../components/General Components/NavBar'
import Preview from './general components/Preview'
import { useAuth } from '@/contexts/AuthContext' // ✅ 2. Import the auth context here.
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

// Metadata can be kept, Next.js handles it correctly.
// export const metadata = { ... } 

export default function DashboardLayout({ children }) {
    // ✅ 3. The layout itself becomes the gatekeeper.
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // After loading, if there's no user, redirect away from the dashboard.
        if (!loading && !user) {
            console.log('🚪 Layout Gatekeeper: No user, redirecting to /login.');
            router.push('/login');
        }
    }, [user, loading, router]);

    // ✅ 4. The CRITICAL rendering logic.

    // While loading the initial user state from Firebase, show a full-page spinner.
    // This blocks BOTH {children} and <Preview/> from rendering.
    if (loading) {
        return (
            <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Authenticating...</p>
                </div>
            </div>
        );
    }
    
    // If the user is authenticated but we're creating their profile in Firestore,
    // show a specific "Setting up" screen. This prevents the crash.
    if (user && !userData) {
        return (
            <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Setting up your profile...</p>
                </div>
            </div>
        );
    }
    
    // ✅ 5. ONLY if the user and their data are fully loaded, render the actual dashboard.
    if (user && userData) {
        return (
            <div className='w-screen h-screen max-w-screen max-h-screen overflow-y-auto relative bg-black bg-opacity-[.05] p-2 flex flex-col'>
                <NavBar />
                {/* No more FirebaseAuthCheck component needed here! */}
                
                <div className="flex sm:px-3 px-2 h-full overflow-y-hidden">
                    {children}
                    <Preview />
                </div>
            </div>
        )
    }

    // Fallback for the brief moment of redirection.
    return null;
}