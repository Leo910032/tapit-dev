// app/dashboard/general elements/MyLinkDiv.jsx - FIXED for Firebase Auth
"use client"
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/useTranslation";

export default function MyLinkDiv() {
    const { user, userData, loading } = useAuth();
    const [myUrl, setMyUrl] = useState("");
    const [copied, setCopied] = useState(false);
    const { t } = useTranslation();

    const handleCopy = () => {
        if (myUrl) {
            navigator.clipboard.writeText(myUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    useEffect(() => {
        async function setupUserUrl() {
            try {
                console.log('🔍 MyLinkDiv: Setting up user URL...');
                
                // Wait for auth to load
                if (loading) {
                    console.log('⏳ MyLinkDiv: Auth still loading...');
                    return;
                }

                // Check if user is authenticated
                if (!user) {
                    console.log('❌ MyLinkDiv: No authenticated user');
                    return;
                }

                // Check if we have user data
                if (!userData) {
                    console.log('❌ MyLinkDiv: No user data available');
                    return;
                }

                // Get username from Firebase user data
                const username = userData.username || user.email?.split('@')[0] || 'user';
                const url = `https://www.tapit.fr/${username}`;
                
                console.log('✅ MyLinkDiv: Setting URL:', url);
                setMyUrl(url);
                
            } catch (error) {
                console.error('❌ MyLinkDiv: Error setting up URL:', error);
            }
        }

        setupUserUrl();
    }, [user, userData, loading]); // Dependencies on Firebase auth state

    // Don't render anything while loading or if no user
    if (loading || !user || !userData) {
        return null;
    }

    // Don't render if no URL is set
    if (!myUrl) {
        return null;
    }

    return (
        <div className="w-full p-3 rounded-3xl border-b bg-white mb-4 flex justify-between items-center sticky top-0 z-10">
            <span className="text-sm flex">
                <span className="font-semibold sm:block hidden">
                    {t("mylinkdiv.linktree")}
                </span>
                <Link
                    href={myUrl}
                    target="_blank"
                    className="underline ml-2 w-[10rem] truncate"
                >
                    {myUrl}
                </Link>
            </span>
            <div
                className={`font-semibold sm:text-base text-sm py-3 px-4 rounded-3xl border cursor-pointer hover:bg-black hover:bg-opacity-5 active:scale-90 ${copied ? "text-green-600" : ""}`}
                onClick={handleCopy}
            >
                {copied ? t("mylinkdiv.copy") : t("mylinkdiv.copy_url")} 
            </div>
        </div>
    );
}