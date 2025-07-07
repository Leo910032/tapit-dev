// app/dashboard/appearance/elements/ThemeCard.jsx - FIXED for Firebase Auth
"use client"

import { fireApp } from "@/important/firebase";
// ❌ Removed the old, problematic session checker
// import { testForActiveSession } from "@/lib/authentication/testForActiveSession";
import { updateTheme, updateThemeTextColour } from "@/lib/update data/updateTheme";
import { collection, doc, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { useTranslation } from "@/lib/useTranslation";
import { useAuth } from "@/contexts/AuthContext"; // ✅ Add the new Firebase Auth context

export default function ThemeCard({ type, pic, text, themeId = "custom" }) {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth(); // ✅ Get user and loading state from context
    const [isSelectedTheme, setIsSelectedTheme] = useState(false);
    const [themeColor, setThemeColor] = useState("");

    // This helper function remains the same
    const getThemeNameForUpdate = (themeId) => {
        const themeMap = {
            'custom': 'Custom', 'matrix': 'Matrix', 'new_mario': 'New Mario',
            'pebble_blue': 'Pebble Blue', 'pebble_yellow': 'Pebble Yellow', 'pebble_pink': 'Pebble Pink',
            'cloud_red': 'Cloud Red', 'cloud_green': 'Cloud Green', 'cloud_blue': 'Cloud Blue',
            'breeze_pink': 'Breeze Pink', 'breeze_orange': 'Breeze Orange', 'breeze_green': 'Breeze Green',
            'rainbow': 'Rainbow', 'confetti': 'Confetti', '3d_blocks': '3D Blocks',
            'starry_night': 'Starry Night', 'lake_white': 'Lake White', 'lake_black': 'Lake Black'
        };
        return themeMap[themeId] || 'Custom';
    };

    const specialThemes = ["new_mario", "matrix"];

    // This function remains the same, as the underlying update functions should be refactored
    // to get the current user from Firebase Auth directly.
    const handleUpdateTheme = async() => {
        const themeName = getThemeNameForUpdate(themeId);
        await updateTheme(themeName, themeColor);
        if(!specialThemes.includes(themeId)) return;
        await updateThemeTextColour(themeColor);
    }

    // This effect remains the same
    useEffect(() => {
        if(!isSelectedTheme) return;
        switch (themeId) {
            case 'lake_black':
            case 'starry_night':
            case '3d_blocks':
                setThemeColor("#fff");
                break;
            case 'matrix':
                setThemeColor("#0f0");
                break;
            case 'new_mario':
            case 'default':
                setThemeColor("#000");
                break;
        }
    }, [themeId, isSelectedTheme]);
    
    // 🔧 This is the main part that has been fixed
    useEffect(() => {
        // Don't run this effect until Firebase Auth has loaded and we have a user
        if (authLoading || !user) {
            console.log('⏳ ThemeCard: Waiting for authentication...');
            return;
        }

        function fetchTheme() {
            console.log(`✅ ThemeCard: Setting up listener for user: ${user.uid}`);
            
            const collectionRef = collection(fireApp, "AccountData");
            // ✅ Use the correct Firebase user UID instead of the old session system
            const docRef = doc(collectionRef, user.uid);
        
            const unsubscribe = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const { selectedTheme } = docSnap.data();
                    const themeName = getThemeNameForUpdate(themeId);
                    setIsSelectedTheme(selectedTheme === themeName);
                } else {
                    console.warn(`⚠️ ThemeCard: No document found for user: ${user.uid}`);
                }
            }, (error) => {
                console.error(`❌ ThemeCard: Firebase listener error:`, error);
            });
            
            // Return the cleanup function
            return unsubscribe;
        }
        
        const cleanup = fetchTheme();
        return () => {
            if (cleanup) {
                console.log('🧹 ThemeCard: Cleaning up listener.');
                cleanup();
            }
        };
    }, [themeId, user, authLoading]); // ✅ Add user and authLoading to the dependency array

    // ✅ Add a loading skeleton to prevent errors and layout shifts while authenticating
    if (authLoading) {
        return (
            <div className="min-w-[8rem] flex-1 flex flex-col animate-pulse">
                <div className="w-full h-[13rem] rounded-lg bg-gray-200"></div>
                <div className="py-3 mt-1 h-4 w-3/4 rounded bg-gray-200"></div>
            </div>
        );
    }

    return (
        <>
            <div className={`min-w-[8rem] flex-1 items-center flex flex-col group`} onClick={handleUpdateTheme}>
                {type !== 1 ?
                    <>
                        <div className="w-full h-[13rem] border border-dashed rounded-lg relative group-hover:bg-black group-hover:bg-opacity-[0.05] border-black grid place-items-center cursor-pointer">
                            <span className="uppercase max-w-[5rem] sm:text-xl text-base text-center">
                                {t("themes.create_your_own")}
                            </span>
                            {isSelectedTheme && <div className="h-full w-full absolute top-0 left-0 bg-black bg-opacity-[0.5] grid place-items-center z-10 text-white text-xl">
                                <FaCheck />
                            </div>}
                        </div>
                        <span className="py-3 text-sm">{t("themes.custom")}</span>
                    </>
                    :
                    <>
                        <div className="w-full h-[13rem] border rounded-lg group-hover:scale-105 relative group-active:scale-90 grid place-items-center cursor-pointer overflow-hidden">
                            <Image src={pic} alt="bg-image" height={1000} width={1000} className="min-w-full h-full object-cover" />
                            {isSelectedTheme && <div className="h-full w-full absolute top-0 left-0 bg-black bg-opacity-[0.5] grid place-items-center z-10 text-white text-xl">
                                <FaCheck />
                            </div>}
                        </div>
                        <span className="py-3 text-sm">{text}</span>
                    </>
                }
            </div>
        </>
    );
}