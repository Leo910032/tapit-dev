// app/dashboard/general components/SocialSetting.jsx - FIXED for Firebase Auth
"use client"

// ❌ REMOVED: import { testForActiveSession } from "@/lib/authentication/testForActiveSession";
import { useAuth } from "@/contexts/AuthContext"; // ✅ ADDED: Firebase Auth context

import Image from "next/image";
import SocialCard from "./mini components/SocialCard";
import { useEffect, useState } from "react";
import React from "react";
import Position from "../elements/Position";
import AddIconModal from "../elements/AddIconModal";
import EditIconModal from "../elements/EditIconModal";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { fireApp } from "@/important/firebase";
import { updateSocials } from "@/lib/update data/updateSocials"; // 🔧 Note: This function will also need updating
import { useTranslation } from "@/lib/useTranslation";

export const SocialContext = React.createContext();

export default function SocialSetting() {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth(); // ✅ Get user and loading state from Firebase Auth

    const [addIconModalOpen, setAddIconModalOpen] = useState(false);
    const [settingIconModalOpen, setSettingIconModalOpen] = useState({
        status: false,
        type: 0,
        operation: 0,
        active: false
    });
    const [socialsArray, setSocialsArray] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false); // Prevents update on initial load

    // ✅ FIXED: useEffect to fetch data using Firebase Auth
    useEffect(() => {
        // Don't run if auth is loading or user is not logged in
        if (authLoading || !user) {
            return;
        }

        const collectionRef = collection(fireApp, "AccountData");
        // ✅ Use Firebase UID instead of old session cookie
        const docRef = doc(collectionRef, user.uid);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const { socials } = docSnap.data();
                setSocialsArray(socials || []);
            } else {
                console.warn('⚠️ SocialSetting: No document found for user');
                setSocialsArray([]); // Ensure it's an empty array if no doc
            }
        }, (error) => {
            console.error('❌ SocialSetting: Error fetching socials:', error);
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();

    }, [user, authLoading]); // ✅ Rerun effect when user or loading state changes

    // ✅ FIXED: useEffect to update data, ensuring user is authenticated
    useEffect(() => {
        // Prevent update on initial render or if auth is still loading
        if (!hasLoaded || authLoading || !user) {
            if (!hasLoaded) setHasLoaded(true); // Mark as loaded on the first run
            return;
        }
        
        // 🔧 IMPORTANT: Your `updateSocials` function must now accept the user's UID.
        // The old version likely got the user ID from a cookie.
        updateSocials(socialsArray, user.uid);

    }, [socialsArray, hasLoaded, user, authLoading]); // ✅ Dependencies updated

    // ✅ ADDED: Loading state UI while waiting for authentication
    if (authLoading) {
        return (
            <div className="w-full my-4 px-2 animate-pulse">
                <div className="flex items-center gap-3 py-4">
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    <div className="h-6 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="p-5 bg-white rounded-lg">
                    <div className="grid gap-2">
                        <div className="h-5 w-24 bg-gray-300 rounded"></div>
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-28 h-12 bg-gray-300 rounded-3xl my-7"></div>
                </div>
            </div>
        );
    }

    return (
        <SocialContext.Provider value={{ socialsArray, setSocialsArray, setSettingIconModalOpen, setAddIconModalOpen, settingIconModalOpen }}>
            <div className="w-full my-4 px-2" id="Settings--SocialLinks">
                <div className="flex items-center gap-3 py-4">
                    <Image
                        src={"https://linktree.sirv.com/Images/icons/social.svg"}
                        alt="icon"
                        height={24}
                        width={24}
                    />
                    <span className="text-xl font-semibold">{t('social.social_icons')}</span>
                </div>
                <div className="p-5 bg-white rounded-lg">
                    <div className="grid gap-1">
                        <span className="font-semibold">{t('social.be_iconic')}</span>
                        <span className="opacity-90 sm:text-base text-sm">{t('social.add_icons_description')}</span>
                    </div>
                    <div className="w-fit rounded-3xl bg-btnPrimary hover:bg-btnPrimaryAlt text-white py-3 px-4 my-7 cursor-pointer active:scale-90 select-none" onClick={() => setAddIconModalOpen(true)}>
                        {t('social.add_icon')}
                    </div>
                    {socialsArray.length > 0 && <div>
                        <SocialCard array={socialsArray} />
                        <p className="my-4 opacity-60 text-sm">{t('social.drag_drop_reorder')}</p>
                        <div className="grid gap-1 text-sm mt-5">
                            <span className="font-semibold">{t('social.position')}</span>
                            <span className="opacity-90">{t('social.display_icons_at')}</span>
                        </div>
                        <Position />
                    </div>}
                </div>
                {addIconModalOpen && <AddIconModal />}
                {settingIconModalOpen.status && <EditIconModal />}
            </div>
        </SocialContext.Provider>
    );
}