"use client"
//tapit.fr/app/dashboard/general components/CheckSession.jsx 
import { getSessionCookie } from "@/lib/authentication/session";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function CheckSession() {
    const router = useRouter();
    const pathname = usePathname();
    
    useEffect(() => {
        // Skip authentication check for NFC routes
        if (pathname?.startsWith('/nfc-cards')) {
            console.log('🔵 Skipping auth check for NFC route:', pathname);
            return;
        }

        // Skip authentication check for public routes
        if (pathname === '/' || pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname?.startsWith('/forgot-password') || pathname?.startsWith('/reset-password')) {
            console.log('🔵 Skipping auth check for public route:', pathname);
            return;
        }

        const sessionUsername = getSessionCookie("adminLinker");
        if (sessionUsername !== undefined) {
            console.log('✅ Auth check passed for:', pathname);
            return;
        }

        console.log('❌ Auth check failed, redirecting to login from:', pathname);
        router.push("/login");
    }, [router, pathname]);
}