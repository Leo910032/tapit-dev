// app/dashboard/layout.jsx - CONFIRMED CORRECT
"use client"

import { Inter } from 'next/font/google'
import NavBar from '../components/General Components/NavBar' // You can now uncomment this
import Preview from './general components/Preview' // And this
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function DashboardLayout({ children }) {
    // 'loading' now means "is the initial auth check complete?"
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Only perform check after the initial load is complete.
        if (!loading && !user) {
            console.log('🚪 Dashboard Layout: Initial check complete, no user found. Redirecting.');
            router.push('/login');
        }
    }, [user, loading, router]);

    // 1. Show a full-page spinner during the initial, definitive check.
    if (loading) {
        return (
            <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }
    
    // 2. If the user is authenticated but the Firestore profile is being created,
    // show a specific "Setting up" screen.
    if (user && !userData) {
        return (
            <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                 <p className="ml-4">Setting up your account...</p>
            </div>
        );
    }
    
    // 3. If everything is loaded and ready, render the dashboard.
    // This condition will only be met when it's absolutely safe.
    if (user && userData) {
        return (
            <div className='w-screen h-screen max-w-screen max-h-screen overflow-y-auto relative bg-black bg-opacity-[.05] p-2 flex flex-col'>
                <NavBar />
                <div className="flex sm:px-3 px-2 h-full overflow-y-hidden">
                    {children}
                    <Preview />
                </div>
            </div>
        )
    }

    // This will show briefly during the redirect from the useEffect.
    return null; 
}