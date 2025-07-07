// app/dashboard/layout.jsx - FINAL DEBUGGING STEP
"use client"

import { Inter } from 'next/font/google'
// import NavBar from '../components/General Components/NavBar' // <-- COMMENT THIS OUT
// import Preview from './general components/Preview' // This should still be commented out
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function DashboardLayout({ children }) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // This gatekeeper logic is correct.
    if (loading) {
        return <div className="fixed inset-0 ...">Authenticating...</div>;
    }
    
    if (user && !userData) {
        return <div className="fixed inset-0 ...">Setting up your profile...</div>;
    }
    
    if (user && userData) {
        return (
            <div className='w-screen h-screen ...'>
                {/* <NavBar /> */} {/* <-- AND COMMENT IT OUT HERE */}
                
                <div className="flex ...">
                    {children}
                    {/* <Preview /> */}
                </div>
            </div>
        )
    }

    return null;
}