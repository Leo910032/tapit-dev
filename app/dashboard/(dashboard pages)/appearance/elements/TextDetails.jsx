// app/dashboard/appearance/elements/TextDetails.jsx - FIXED for Firebase Auth
"use client"

import { useEffect, useState } from "react";
import { useDebounce } from "@/LocalHooks/useDebounce";
import { useAuth } from "@/contexts/AuthContext"; // ✅ 1. Import the Firebase Auth context
import updateBio from "@/lib/update data/updateBio";
import updateDisplayName from "@/lib/update data/updateDisplayName";
import { useTranslation } from "@/lib/useTranslation";
// ❌ No longer need these old imports or Firestore directly
// import { testForActiveSession } from "@/lib/authentication/testForActiveSession";
// import { collection, doc, onSnapshot } from "firebase/firestore";

export default function TextDetails() {
    const { t } = useTranslation();
    const { user, userData, loading: authLoading } = useAuth(); // ✅ 2. Get user, data, and loading state from context

    // Local state for the input fields
    const [displayName, setDisplayName] = useState("");
    const [myBio, setMyBio] = useState("");

    // Debounce hooks to prevent excessive Firestore writes
    const debounceDisplayName = useDebounce(displayName, 500);
    const debounceMyBio = useDebounce(myBio, 500);
    
    // State to prevent updates on the very first render
    const [isDataInitialized, setIsDataInitialized] = useState(false);

    // ✅ 3. Sync local state with data from the AuthContext
    useEffect(() => {
        // When userData from our context is available, update the local input fields
        if (userData) {
            console.log("🎨 TextDetails: Syncing data from AuthContext");
            setDisplayName(userData.displayName || "");
            setMyBio(userData.bio || "");
            // Mark that the initial data has been loaded
            setIsDataInitialized(true);
        }
    }, [userData]); // This effect runs whenever userData changes

    // ✅ 4. Update Firestore with debounced display name
    useEffect(() => {
        // Don't run on the first render or if the data isn't loaded yet
        if (!isDataInitialized) {
            return;
        }
        console.log("✍️ TextDetails: Updating display name in Firestore...");
        updateDisplayName(displayName);
    }, [debounceDisplayName, isDataInitialized]); // Depend on the debounced value

    // ✅ 5. Update Firestore with debounced bio
    useEffect(() => {
        // Don't run on the first render
        if (!isDataInitialized) {
            return;
        }
        console.log("✍️ TextDetails: Updating bio in Firestore...");
        updateBio(myBio);
    }, [debounceMyBio, isDataInitialized]); // Depend on the debounced value

    // ✅ 6. Handle the loading state
    if (authLoading) {
        return (
            <div className="flex px-6 pb-6 pt-2 flex-col gap-2 animate-pulse">
                <div className="h-16 rounded-lg bg-gray-200"></div>
                <div className="h-24 rounded-lg bg-gray-200"></div>
            </div>
        );
    }
    
    // ✅ 7. Handle the unauthenticated state
    if (!user) {
         return (
            <div className="flex px-6 pb-6 pt-2">
                <p className="text-center text-gray-500 text-sm">Please log in to edit your profile details.</p>
            </div>
        );
    }

    return (
        <div className="flex px-6 pb-6 pt-2 flex-col gap-2">
            <div className="flex-1 relative pt-2 flex items-center rounded-lg bg-black bg-opacity-[0.05] focus-within:border-black focus-within:border-2 border border-transparent">
                <input
                    type="text"
                    className="flex-1 px-4 placeholder-shown:px-3 py-4 sm:text-base text-sm font-semibold outline-none opacity-100 bg-transparent peer appearance-none"
                    placeholder=" " // Important for the floating label effect
                    onChange={(e)=>setDisplayName(e.target.value)}
                    value={displayName} // Controlled component
                    maxLength={50}
                />
                <label className="absolute px-3 pointer-events-none top-[.25rem] left-1 text-sm text-main-green peer-placeholder-shown:top-2/4 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-slate-500 peer-placeholder-shown:left-0 opacity-70 transition duration-[250] ease-linear">
                    {t('textDetails.profile_title')}
                </label>
            </div>
            <div className="flex-1 relative pt-2 flex items-center rounded-lg bg-black bg-opacity-[0.05] focus-within:border-black focus-within:border-[2px] border border-transparent">
                <textarea 
                    className="flex-1 px-4 placeholder-shown:px-3 py-4 sm:text-md text-sm outline-none opacity-100 bg-transparent peer appearance-none resize-none" 
                    cols="30" 
                    rows="2"
                    onChange={(e)=>setMyBio(e.target.value)}
                    value={myBio} // Controlled component
                    maxLength={150}
                ></textarea>
                <label className="absolute px-3 pointer-events-none top-[.25rem] left-1 text-sm text-main-green peer-placeholder-shown:top-2/4 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-slate-500 peer-placeholder-shown:left-0 opacity-70 transition duration-[250] ease-linear">
                    {t('textDetails.bio')}
                </label>
            </div>
        </div>
    );
}