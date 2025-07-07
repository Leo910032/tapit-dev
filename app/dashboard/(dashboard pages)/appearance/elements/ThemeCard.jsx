// app/dashboard/(dashboard pages)/appearance/elements/TextDetails.jsx - FIXED for Firebase Auth
"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext"; // ✅ 1. Use the central Auth Context
import { useTranslation } from "@/lib/useTranslation";
import { useDebounce } from "@/LocalHooks/useDebounce";
import { fireApp } from "@/important/firebase";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { updateDisplayName, updateBio } from "@/lib/update data/updateProfile"; // Assuming these are updated

export default function TextDetails() {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth(); // ✅ 2. Get user and loading state from context

    const [displayName, setDisplayName] = useState("");
    const [myBio, setMyBio] = useState("");
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false); // ✅ 3. Better state flag

    const debounceDisplayName = useDebounce(displayName, 500);
    const debounceMyBio = useDebounce(myBio, 500);

    // Effect to fetch and listen for real-time data
    useEffect(() => {
        // Don't do anything until authentication is resolved
        if (authLoading || !user) {
            return;
        }

        console.log('🔍 TextDetails: Setting up listener for user:', user.uid);
        const docRef = doc(fireApp, "AccountData", user.uid); // ✅ 4. Use the correct Firebase UID

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const { displayName: newDisplayName, bio: newBio } = docSnap.data();
                console.log('📝 TextDetails: Received data ->', { newDisplayName, newBio });
                
                // Set state from Firestore
                setDisplayName(newDisplayName || "");
                setMyBio(newBio || "");

                // Mark that initial data has loaded to enable debounced updates
                setIsInitialDataLoaded(true);
            } else {
                console.warn('⚠️ TextDetails: No document found for this user.');
            }
        }, (error) => {
            console.error("❌ TextDetails: Error fetching data:", error);
        });

        // Cleanup the listener when the component unmounts
        return () => {
            console.log('🧹 TextDetails: Cleaning up listener.');
            unsubscribe();
        };

    }, [user, authLoading]); // ✅ 5. Re-run when user or loading state changes

    // Effect to update display name after user stops typing
    useEffect(() => {
        // Prevent running on the initial data load
        if (!isInitialDataLoaded || authLoading || !user) {
            return;
        }
        console.log('🔄 TextDetails: Updating displayName to ->', debounceDisplayName);
        updateDisplayName(debounceDisplayName); // This function should use getAuth() to find the user UID

    }, [debounceDisplayName]);

    // Effect to update bio after user stops typing
    useEffect(() => {
        // Prevent running on the initial data load
        if (!isInitialDataLoaded || authLoading || !user) {
            return;
        }
        console.log('🔄 TextDetails: Updating bio to ->', debounceMyBio);
        updateBio(debounceMyBio); // This function should also use getAuth() to find the user UID

    }, [debounceMyBio]);

    // ✅ 6. Show a loading skeleton while authenticating
    if (authLoading) {
        return (
            <div className="flex px-6 pb-6 pt-2 flex-col gap-2 animate-pulse">
                <div className="h-[60px] bg-gray-200 rounded-lg"></div>
                <div className="h-[76px] bg-gray-200 rounded-lg"></div>
            </div>
        );
    }
    
    return (
        <div className="flex px-6 pb-6 pt-2 flex-col gap-2">
            <div className="flex-1 relative pt-2 flex items-center rounded-lg bg-black bg-opacity-[0.05] focus-within:border-black focus-within:border-2 border border-transparent">
                <input
                    type="text"
                    className="flex-1 px-4 placeholder-shown:px-3 py-4 sm:text-base text-sm font-semibold outline-none opacity-100 bg-transparent peer appearance-none"
                    placeholder=" "
                    onChange={(e) => setDisplayName(e.target.value)}
                    value={displayName} // Correctly bind to state
                />
                <label className="absolute px-3 pointer-events-none top-[.25rem] left-1 text-sm text-main-green peer-placeholder-shown:top-2/4 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-slate-500 peer-placeholder-shown:left-0 opacity-70 transition duration-[250] ease-linear">
                    {t('textDetails.profile_title')}
                </label>
            </div>
            <div className="flex-1 relative pt-2 flex items-center rounded-lg bg-black bg-opacity-[0.05] focus-within:border-black focus-within:border-[2px] border border-transparent">
                <textarea
                    className="flex-1 px-4 placeholder-shown:px-3 py-4 sm:text-md text-sm outline-none opacity-100 bg-transparent peer appearance-none"
                    cols="30"
                    rows="2"
                    onChange={(e) => setMyBio(e.target.value)}
                    value={myBio}
                ></textarea>
                <label className="absolute px-3 pointer-events-none top-[.25rem] left-1 text-sm text-main-green peer-placeholder-shown:top-2/4 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-slate-500 peer-placeholder-shown:left-0 opacity-70 transition duration-[250] ease-linear">
                    {t('textDetails.bio')}
                </label>
            </div>
        </div>
    );
}