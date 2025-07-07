// app/dashboard/appearance/elements/GradientPicker.jsx - FIXED for Firebase Auth
"use client"

import { fireApp } from "@/important/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { updateThemeGradientDirection } from "@/lib/update data/updateTheme";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react"

export default function GradientPicker() {
    const { user, userData, loading } = useAuth();
    const [pick, setPick] = useState(0);
    const [hasPicked, setHasPicked] = useState(false);

    const handleUpdateTheme = async() => {
        if (!user?.uid) {
            console.error('❌ GradientPicker: No user UID available for theme update');
            return;
        }
        
        try {
            await updateThemeGradientDirection(pick, user.uid); // Pass Firebase UID
        } catch (error) {
            console.error('❌ GradientPicker: Error updating theme:', error);
        }
    }

    useEffect(() => {
        function fetchTheme() {
            // Don't fetch if auth is loading or user not available
            if (loading || !user?.uid) {
                console.log('⏳ GradientPicker: Waiting for auth...');
                return;
            }

            console.log('🔍 GradientPicker: Setting up theme listener for UID:', user.uid);
            
            const collectionRef = collection(fireApp, "AccountData");
            const docRef = doc(collectionRef, user.uid); // Use Firebase UID
        
            const unsubscribe = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const gradientDirection = data.gradientDirection ?? 0;
                    console.log('🎨 GradientPicker: Theme data received, gradient direction:', gradientDirection);
                    setPick(gradientDirection);
                } else {
                    console.warn('⚠️ GradientPicker: No document found for user');
                }
            }, (error) => {
                console.error('❌ GradientPicker: Error in theme listener:', error);
            });

            // Return cleanup function
            return unsubscribe;
        }
        
        const unsubscribe = fetchTheme();
        
        // Cleanup on unmount
        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [user?.uid, loading]); // Dependencies on Firebase auth state

    useEffect(() => {
        if (!hasPicked) {
            setHasPicked(true);
            return;
        }
        
        // Only update theme if user is authenticated
        if (user?.uid) {
            handleUpdateTheme();
        }
    }, [pick, user?.uid]);

    // Don't render if auth is loading or no user
    if (loading || !user) {
        return (
            <div className="my-4 grid gap-3">
                <div className="animate-pulse bg-gray-200 h-12 rounded"></div>
                <div className="animate-pulse bg-gray-200 h-12 rounded"></div>
            </div>
        );
    }

    return (
        <div className="my-4 grid gap-3">
            <div className="cursor-pointer flex items-center gap-3 w-fit" onClick={()=>setPick(0)}>
                <div className={`hover:scale-105 active:scale-95 h-6 w-6 bg-black rounded-full relative grid place-items-center bg-opacity-0 ${pick === 0 ? "after:absolute after:h-2 after:w-2 bg-opacity-100 after:bg-white after:rounded-full" : "border"} `}></div>
                <div className="flex items-center text-sm">
                    <div className="h-8 w-8 rounded-lg mr-3" style={{ backgroundImage: 'linear-gradient(to bottom, #fff, rgba(0, 0, 0, 0.75))' }}></div>
                    <span className="opacity-80">Gradient down</span>
                </div>
            </div>
            <div className="cursor-pointer flex gap-3 w-fit" onClick={()=>setPick(1)}>
                <div className={`hover:scale-105 active:scale-95 h-6 w-6 bg-black rounded-full relative grid place-items-center bg-opacity-0 ${pick === 1 ? "after:absolute after:h-2 after:w-2 bg-opacity-100 after:bg-white after:rounded-full" : "border"} `}></div>
                <div className="flex items-center text-sm">
                    <div className="h-8 w-8 rounded-lg mr-3" style={{ backgroundImage: 'linear-gradient(to top, #fff, rgba(0, 0, 0, 0.75))' }}></div>                
                    <span className="opacity-80">Gradient up</span>
                </div>
            </div>
        </div>
    )
}