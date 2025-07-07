// app/dashboard/appearance/elements/SelectFonts.jsx - FIXED for Firebase Auth
"use client"
import React, { useEffect, useState } from "react";
import FontsGallery from "../components/FontsGallery";
import { useAuth } from "@/contexts/AuthContext";
import { fireApp } from "@/important/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { availableFonts_Classic } from "@/lib/FontsList";

export const selectedFontContext = React.createContext();

export default function SelectFonts() {
    const { user, userData, loading } = useAuth();
    const [openFontGallery, setOpenFontGallery] = useState(false);
    const [selectedFont, setSelectedFont] = useState({ name: "Loading...", class: "" });
    
    useEffect(() => {
        let unsubscribe = null;
        
        function setupFontListener() {
            try {
                console.log('🔍 SelectFonts: Setting up font listener...');
                
                // Wait for auth to load
                if (loading) {
                    console.log('⏳ SelectFonts: Auth still loading...');
                    return;
                }

                // Check if user is authenticated
                if (!user) {
                    console.log('❌ SelectFonts: No authenticated user');
                    return;
                }

                // Check if we have user data
                if (!userData) {
                    console.log('❌ SelectFonts: No user data available');
                    return;
                }

                console.log('✅ SelectFonts: Setting up listener for user:', user.uid);
                
                const docRef = doc(fireApp, "AccountData", user.uid);
                
                unsubscribe = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const fontType = data.fontType;
                        
                        console.log('📝 SelectFonts: Font type received:', fontType);
                        
                        // Get font name with fallback
                        const fontIndex = fontType ? fontType - 1 : 0;
                        const fontName = availableFonts_Classic[fontIndex] || availableFonts_Classic[0];
                        
                        console.log('✅ SelectFonts: Setting font:', fontName?.name);
                        setSelectedFont(fontName || { name: "Default", class: "" });
                    } else {
                        console.warn('⚠️ SelectFonts: No document found for user');
                        // Set default font
                        setSelectedFont(availableFonts_Classic[0] || { name: "Default", class: "" });
                    }
                }, (error) => {
                    console.error('❌ SelectFonts: Listener error:', error);
                    // Set default font on error
                    setSelectedFont(availableFonts_Classic[0] || { name: "Default", class: "" });
                });
                
            } catch (error) {
                console.error('❌ SelectFonts: Error setting up listener:', error);
                // Set default font on error
                setSelectedFont(availableFonts_Classic[0] || { name: "Default", class: "" });
            }
        }

        setupFontListener();
        
        // Cleanup function
        return () => {
            if (unsubscribe) {
                console.log('🔧 SelectFonts: Cleaning up font listener');
                unsubscribe();
            }
        };
    }, [user, userData, loading]); // Dependencies on Firebase auth state
    
    // Don't render anything while loading or if no user
    if (loading || !user || !userData) {
        return (
            <div className="w-full my-4 group rounded-lg py-5 px-4 border shadow-lg flex items-center gap-4 bg-gray-100 animate-pulse">
                <span className="p-3 rounded-md bg-gray-200 text-xl font-semibold w-12 h-12"></span>
                <span className="font-semibold flex-1 bg-gray-200 h-6 rounded"></span>
            </div>
        );
    }
    
    return (
        <selectedFontContext.Provider value={{openFontGallery, setOpenFontGallery}}>
            <div 
                className={`${selectedFont.class} w-full my-4 group rounded-lg py-5 px-4 border shadow-lg flex items-center gap-4 cursor-pointer hover:bg-black hover:bg-opacity-10 active:scale-95`} 
                onClick={() => setOpenFontGallery(true)}
            >
                <span className="p-3 rounded-md group-hover:bg-white group-hover:bg-opacity-100 bg-black bg-opacity-10 text-xl font-semibold">
                    Aa
                </span>
                <span className="font-semibold flex-1 truncate">
                    {selectedFont.name || "Loading..."}
                </span>
            </div>
            {openFontGallery && <FontsGallery />}
        </selectedFontContext.Provider>
    );
}