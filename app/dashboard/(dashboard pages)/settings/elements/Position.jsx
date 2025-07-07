// app/dashboard/general components/Position.jsx - FIXED for Firebase Auth
'use client'

import { fireApp } from "@/important/firebase";
import { useAuth } from "@/contexts/AuthContext"; // ✅ 1. Use the new Firebase Auth context
import { updateSocialPosition } from "@/lib/update data/updateSocials";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Position() {
    // ✅ 2. Get the authenticated user and loading state from the context
    const { user, loading } = useAuth();
    const [pick, setPick] = useState(0);
    const [hasPicked, setHasPicked] = useState(false);

    const handleUpdatePosition = async() => {
        // ✅ 3. Add a guard to ensure user is logged in before updating
        if (!user) {
            console.error("❌ Position: Cannot update, user not logged in.");
            return;
        }
        // ✅ 4. Pass the user's UID to the update function
        await updateSocialPosition(user.uid, pick);
    }

    // ✅ 5. This effect now correctly fetches data based on the authenticated user
    useEffect(() => {
        // Don't run if auth is still loading or if the user is not logged in
        if (loading || !user) {
            return;
        }

        // Set up the listener for the currently logged-in user
        const collectionRef = collection(fireApp, "AccountData");
        const docRef = doc(collectionRef, user.uid); // ✅ Use the correct Firebase UID

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const { socialPosition } = docSnap.data();
                setPick(socialPosition ?? 0); // Use nullish coalescing for a safe default
            }
        });

        // ✅ 6. Clean up the listener when the component unmounts or user changes
        return () => unsubscribe();

    }, [user, loading]); // ✅ Effect depends on user and loading state

    useEffect(() => {
        if (!hasPicked) {
            setHasPicked(true);
            return;
        }
        handleUpdatePosition();
    }, [pick, hasPicked]);


    // ✅ 7. Show a loading skeleton while waiting for authentication
    if (loading) {
        return (
            <div className="my-5 grid gap-4 pl-5 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-5 grid gap-4 pl-5">
            <div className="cursor-pointer flex items-center gap-3 w-fit" onClick={() => setPick(0)}>
                <div className={`hover:scale-105 active:scale-95 h-6 w-6 bg-black rounded-full relative grid place-items-center bg-opacity-0 ${pick === 0 ? "after:absolute after:h-2 after:w-2 bg-opacity-100 after:bg-white after:rounded-full" : "border"} `}></div>
                <div className="flex items-center text-sm">
                    <span className="opacity-80">Top</span>
                </div>
            </div>
            <div className="cursor-pointer flex gap-3 w-fit" onClick={() => setPick(1)}>
                <div className={`hover:scale-105 active:scale-95 h-6 w-6 bg-black rounded-full relative grid place-items-center bg-opacity-0 ${pick === 1 ? "after:absolute after:h-2 after:w-2 bg-opacity-100 after:bg-white after:rounded-full" : "border"} `}></div>
                <div className="flex items-center text-sm">
                    <span className="opacity-80">Bottom</span>
                </div>
            </div>
        </div>
    );
}