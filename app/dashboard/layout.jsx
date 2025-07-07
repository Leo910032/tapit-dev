// app/dashboard/layout.jsx - TEMPORARY DEBUGGING VERSION #1
"use client"

import { Inter } from 'next/font/google'
import NavBar from '../components/General Components/NavBar'
// import Preview from './general components/Preview' // <-- Temporarily commented out
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

    if (loading) {
        return <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">...Authenticating...</div>;
    }
    
    if (user && !userData) {
        return <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">...Setting up profile...</div>;
    }
    
    if (user && userData) {
        return (
            <div className='w-screen h-screen ...'>
                <NavBar />
                <div className="flex ...">
                    {children}
                    {/* <Preview /> */} {/* <-- Temporarily commented out */}
                </div>
            </div>
        )
    }

    return null;
}