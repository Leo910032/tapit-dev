// app/dashboard/appearance/elements/SupportBanner.jsx - FIXED for Firebase Auth
"use client"

import Image from "next/image";
import SupportSwitch from "../elements/SupportSwitch";
import React, { useEffect, useState } from "react";
import ChooseCause from "./ChooseCause";
import { fireApp } from "@/important/firebase";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { updateSupportBanner, updateSupportBannerStatus } from "@/lib/update data/updateSocials";
import { useTranslation } from "@/lib/useTranslation";
import { useAuth } from "@/contexts/AuthContext"; // ✅ 1. Import the new Auth Context

export const SupportContext = React.createContext();

export default function SupportBanner() {
    const { user, loading } = useAuth(); // ✅ 2. Get the authenticated user and loading state
    const [showSupport, setShowSupport] = useState(null);
    const [chosenGroup, setChosenGroup] = useState(null);
    const { t } = useTranslation();
    
    // This useEffect updates the chosen cause when it changes
    useEffect(() => {
        // Prevent updates if not logged in or data hasn't loaded yet
        if (chosenGroup === null || !user) {
            return;
        }
        // NOTE: Ensure 'updateSupportBanner' is also refactored to use the new auth system
        updateSupportBanner(chosenGroup);
    }, [chosenGroup, user]);

    // This useEffect updates the banner's visibility status
    useEffect(() => {
        // Prevent updates if not logged in or data hasn't loaded yet
        if (showSupport === null || !user) {
            return;
        }
        // NOTE: Ensure 'updateSupportBannerStatus' is also refactored to use the new auth system
        updateSupportBannerStatus(showSupport);
    }, [showSupport, user]);

    // ✅ 3. This useEffect now fetches data using the Firebase user UID
    useEffect(() => {
        // Don't run if auth is loading or user is not logged in
        if (loading || !user) {
            return;
        }

        function fetchSupportData() {
            console.log("🔍 SupportBanner: Setting up listener for user:", user.uid);
            const collectionRef = collection(fireApp, "AccountData");
            // Use the correct Firebase UID
            const docRef = doc(collectionRef, user.uid);

            const unsubscribe = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const { supportBanner, supportBannerStatus } = docSnap.data();
                    console.log("✅ SupportBanner: Data received.", { supportBanner, supportBannerStatus });
                    // Only update state if the values have actually changed to prevent loops
                    if (supportBanner !== chosenGroup) {
                        setChosenGroup(supportBanner ?? 0);
                    }
                    if (supportBannerStatus !== showSupport) {
                        setShowSupport(supportBannerStatus ?? false);
                    }
                } else {
                    console.warn("⚠️ SupportBanner: No document found for user.");
                }
            }, (error) => {
                console.error("❌ SupportBanner: Firestore listener error:", error);
            });

            return unsubscribe;
        }

        const cleanup = fetchSupportData();
        return cleanup; // Cleanup listener on component unmount
    }, [user, loading]); // ✅ 4. Depend on the new auth state

    // ✅ 5. Add a loading state to prevent errors and improve UX
    if (loading) {
        return (
            <div className="w-full my-4 px-2 animate-pulse">
                <div className="flex items-center gap-3 py-4">
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    <div className="h-6 w-48 bg-gray-200 rounded"></div>
                </div>
                <div className="p-5 bg-gray-100 rounded-lg h-24"></div>
            </div>
        );
    }
    
    // Don't render if the user is not logged in
    if (!user) {
        return null;
    }

    return (
        <SupportContext.Provider value={{ showSupport, setShowSupport, chosenGroup, setChosenGroup }}>
            <div className="w-full my-4 px-2" id="Settings--SupportBanner">
                <div className="flex items-center gap-3 py-4">
                    <Image
                        src={"https://linktree.sirv.com/Images/icons/support.svg"}
                        alt="icon"
                        height={24}
                        width={24}
                    />
                    <span className="text-xl font-semibold">{t("supportbanner.support_banner")}</span>
                </div>
                <div className="p-5 bg-white rounded-lg">
                    <SupportSwitch />
                    {showSupport && <ChooseCause />}
                </div>
            </div>
        </SupportContext.Provider>
    )
}