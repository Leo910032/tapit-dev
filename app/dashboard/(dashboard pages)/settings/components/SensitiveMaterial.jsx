// app/dashboard/(dashboard pages)/appearance/elements/SensitiveMaterial.jsx - FIXED for Firebase Auth
"use client"

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext"; // ✅ 1. Import the new Firebase Auth context
import { fireApp } from '@/important/firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { updateSensitiveStatus } from '@/lib/update data/updateSocials';
import { useTranslation } from '@/lib/useTranslation';
import AgeRestriction from '../elements/AgeRestriction';

// ❌ The old session system is no longer needed
// import { testForActiveSession } from '@/lib/authentication/testForActiveSession';

export default function SensitiveMaterial() {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth(); // ✅ 2. Get user and loading state from the context
    const [containsSensitiveMaterial, setContainsSensitiveMaterial] = useState(false); // Default to false
    const [isUpdating, setIsUpdating] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const handleCheckboxChange = (event) => {
        if (isUpdating) return; // Prevent changes while an update is in progress
        const checkedStatus = event.target.checked;
        setContainsSensitiveMaterial(checkedStatus);
    };

    // This useEffect handles writing the change back to Firestore
    useEffect(() => {
        // Don't run on the initial load, only on user-driven changes
        if (initialLoad || authLoading || !user) {
            return;
        }

        const updateStatus = async () => {
            setIsUpdating(true);
            try {
                // The updateSensitiveStatus function will need the user.uid if not already using the context
                await updateSensitiveStatus(containsSensitiveMaterial);
            } catch (error) {
                console.error("❌ Failed to update sensitive status:", error);
            } finally {
                setIsUpdating(false);
            }
        };

        updateStatus();
    }, [containsSensitiveMaterial, initialLoad, authLoading, user]); // Depend on user input

    // ✅ 3. This useEffect now correctly fetches data using the Firebase user
    useEffect(() => {
        // Wait until authentication is complete and we have a user
        if (authLoading || !user) {
            console.log("⏳ SensitiveMaterial: Waiting for user authentication...");
            return;
        }

        console.log("🔍 SensitiveMaterial: Setting up listener for user:", user.uid);
        const collectionRef = collection(fireApp, "AccountData");
        const docRef = doc(collectionRef, user.uid); // ✅ Use the correct Firebase user.uid

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const { sensitiveStatus } = docSnap.data();
                setContainsSensitiveMaterial(sensitiveStatus || false);
                console.log("📝 SensitiveMaterial: Status updated to", sensitiveStatus || false);
            } else {
                console.warn("⚠️ SensitiveMaterial: No document found for user.");
                setContainsSensitiveMaterial(false); // Default to false if no document
            }
            setInitialLoad(false); // Mark that the initial data has been loaded
        }, (error) => {
            console.error("❌ SensitiveMaterial: Firestore listener error:", error);
            setInitialLoad(false); // Stop loading even on error
        });

        // Cleanup the listener when the component unmounts
        return () => unsubscribe();

    }, [user, authLoading]); // ✅ Re-run this effect only when auth state changes

    // ✅ 4. Add a loading state for better UX
    if (authLoading || initialLoad) {
        return (
            <div className="w-full my-4 px-2" id="Settings--SensitiveMaterial">
                <div className="flex items-center gap-3 py-4 animate-pulse">
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    <div className="h-6 w-40 bg-gray-200 rounded"></div>
                </div>
                <div className="p-5 bg-white rounded-lg animate-pulse">
                    <div className='flex items-center justify-between w-full'>
                        <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                        <div className="w-9 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="w-full my-4 px-2" id="Settings--SensitiveMaterial">
            <div className="flex items-center gap-3 py-4">
                <Image
                    src={"https://linktree.sirv.com/Images/icons/sensitive.svg"}
                    alt="icon"
                    height={24}
                    width={24}
                />
                <span className="text-xl font-semibold">{t('settings.sensitive_material')}</span>
            </div>
            <div className="p-5 bg-white rounded-lg">
                <div className='flex gap-3 items-center justify-between w-full'>
                    <span className='opacity-70 sm:text-[.965rem] text-sm'>{t('settings.sensitive_material_description')}</span>
                    <div>
                        <label className="cursor-pointer relative flex justify-between items-center group p-2 text-xl">
                            <input
                                type="checkbox"
                                onChange={handleCheckboxChange}
                                checked={containsSensitiveMaterial}
                                disabled={isUpdating}
                                className="absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md"
                            />
                            <span className="cursor-pointer w-9 h-6 flex items-center flex-shrink-0 ml-4 p-1 bg-gray-400 rounded-full duration-300 ease-in-out peer-checked:bg-green-400 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow-md after:duration-300 peer-checked:after:translate-x-3 group-hover:after:translate-x-[2px]"></span>
                        </label>
                    </div>
                </div>
                {containsSensitiveMaterial && <AgeRestriction />}
            </div>
        </div>
    );
}