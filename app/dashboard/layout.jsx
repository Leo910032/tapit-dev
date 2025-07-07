// app/dashboard/layout.jsx - FINAL, STABLE & COMPLETE VERSION
"use client"; // This entire layout must be a client component to use hooks.

import { Inter } from 'next/font/google';
import NavBar from '../components/General Components/NavBar.jsx'; // Un-commented
import Preview from './general components/Preview.jsx';         // Un-commented
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

// Note: If you have metadata, it's fine to keep it.
// Next.js handles metadata separately from component rendering.
/*
export const metadata = {
    title: 'Tapit.fr - Dashboard',
    description: 'Manage your digital business card',
}
*/

export default function DashboardLayout({ children }) {
    // This layout is now the "Gatekeeper". It controls everything.
    // 'loading' now correctly means "is the initial auth check complete?"
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    // This effect handles redirection *after* the initial auth check.
    useEffect(() => {
        // Don't do anything while the initial auth state is being determined.
        if (loading) {
            return;
        }

        // If the initial check is complete and there's still no user,
        // it's safe to redirect to login.
        if (!user) {
            console.log('🚪 Dashboard Layout: Initial check complete, no user found. Redirecting to /login.');
            router.push('/login');
        }
    }, [user, loading, router]);


    // ----- This rendering logic is the core of the fix -----

    // 1. While the initial auth state is loading, show a full-page spinner.
    // This blocks BOTH {children}, <NavBar/>, and <Preview/> from rendering prematurely.
    if (loading) {
        return (
            <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Authenticating...</p>
                </div>
            </div>
        );
    }
    
    // 2. If the user is authenticated but their Firestore profile is still being created,
    // show a specific "Setting up" screen. This is crucial for new user sign-ups.
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
    
    // 3. ONLY if the user and their data are fully loaded and ready, render the actual dashboard UI.
    // This condition will only be met when it's absolutely safe for all child components.
    if (user && userData) {
        return (
            <div className='w-screen h-screen max-w-screen max-h-screen overflow-y-auto relative bg-black bg-opacity-[.05] p-2 flex flex-col'>
                {/* It is now safe to render the NavBar */}
                <NavBar />
                
                <div className="flex sm:px-3 px-2 h-full overflow-y-hidden">
                    {/* It is now safe to render the page's content */}
                    {children}
                    
                    {/* It is now safe to render the Preview */}
                    <Preview />
                </div>
            </div>
        )
    }

    // This will render null very briefly during the redirect from the useEffect.
    return null; 
}