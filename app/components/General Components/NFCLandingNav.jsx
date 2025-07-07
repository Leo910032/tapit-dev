// app/components/General Components/NFCLandingNav.jsx - UPDATED
"use client"
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import { useTranslation } from "@/lib/useTranslation";
import NFCLoginModal from "./NFCLoginModal";
import NFCSignupModal from "./NFCSignupModal";

// The component now accepts `isLoggedIn` as a prop
export default function NFCLandingNav({ isLoggedIn }) {
    const { t } = useTranslation();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);

    // This function reloads the page to reflect the new login state.
    // The layout will then detect the change and pass the new `isLoggedIn` prop.
    const onAuthSuccess = () => {
        window.location.reload();
    };
    
    return (
        <>
            <div className="w-[96%] justify-between flex items-center rounded-[3rem] py-3 fixed sm:top-4 top-2 left-1/2 -translate-x-1/2 z-[999] md:px-12 sm:px-6 px-3 bg-white bg-opacity-[0.1] border backdrop-blur-xl">
                <Link href={"/"}>
                    <Image src={"https://firebasestorage.googleapis.com/v0/b/lintre-ffa96.firebasestorage.app/o/Logo%2Fimage-removebg-preview.png?alt=media&token=4ac6b2d0-463e-4ed7-952a-2fed14985fc0"} alt="logo" height={70} width={70} className="filter invert" priority />
                </Link>

                <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                    
                    {/* The logic now simply checks the prop */}
                    {isLoggedIn ? (
                        <Link 
                            href='/dashboard' 
                            className="p-3 sm:px-6 px-3 bg-blue-600 text-white flex items-center gap-2 rounded-3xl cursor-pointer hover:scale-105 hover:bg-blue-700 active:scale-90"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link 
                                href="/login?returnTo=/nfc-cards/checkout"
                                className="p-3 sm:px-4 px-3 text-white border border-white/30 rounded-3xl cursor-pointer hover:scale-105 hover:bg-white/10 active:scale-90"
                            >
                                {t('common.login')}
                            </Link>
                            <Link 
                                href="/signup?returnTo=/nfc-cards/checkout"
                                className="p-3 sm:px-4 px-3 bg-themeGreen text-white rounded-3xl cursor-pointer hover:scale-105 hover:bg-gray-100 hover:text-black active:scale-90"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* I have removed the modals for now to simplify. We are using the main /login and /signup pages which is a better flow. */}
        </>
    );
}