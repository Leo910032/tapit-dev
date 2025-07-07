"use client"

import { useDebounce } from "@/LocalHooks/useDebounce";
import { fireApp } from "@/important/firebase";
import { testForActiveSession } from "@/lib/authentication/testForActiveSession";
import { updateThemeBackgroundColor, updateThemeBtnColor, updateThemeBtnFontColor, updateThemeBtnShadowColor, updateThemeTextColour } from "@/lib/update data/updateTheme";
import { isValidHexCode } from "@/lib/utilities";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

export default function ColorPicker({colorFor}) {
    const [colorText, setColorText] = useState(colorFor === 4 ? "#000000" : "#e8edf5");
    const debounceColor = useDebounce(colorText, 500);
    const [validColor, setValidColor] = useState(1);
    const [colorHasLoaded, setColorHasLoaded] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false); // ✅ Add updating state
    const colorPickRef = useRef();

    // ✅ Fix hydration by ensuring client-side only rendering
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    
    const handleUpdateTheme = async(text) => {
        // ✅ Prevent multiple simultaneous updates
        if (isUpdating) return;
        setIsUpdating(true);
        
        try {
            switch (colorFor) {
                case 0:
                    await updateThemeBackgroundColor(text);
                    break;
                case 1:
                    await updateThemeBtnColor(text);
                    break;
                case 2:
                    await updateThemeBtnFontColor(text);
                    break;
                case 3:
                    await updateThemeBtnShadowColor(text);
                    break;
                case 4:
                    await updateThemeTextColour(text);
                    break;
            
                default:
                    await updateThemeBackgroundColor(text);
                    break;
            }
        } finally {
            setIsUpdating(false);
        }
    }
  
    // ✅ FIXED: Remove the problematic useEffect that was causing infinite loop
    useEffect(() => {
        // Only update when debounced color changes and component has loaded
        if (!colorHasLoaded || isUpdating) {
            return;
        }

        if (colorText !== "" && isValidHexCode(colorText)) {
            handleUpdateTheme(colorText);
        }
        
        // Update validity state
        setValidColor(isValidHexCode(colorText));
    }, [debounceColor]); // ✅ Only depend on debounceColor

    // ✅ REMOVED the problematic useEffect that was calling handleUpdateTheme again

    useEffect(() => {
        // ✅ Only fetch theme after hydration
        if (!isHydrated) return;
        
        function fetchTheme() {
            const currentUser = testForActiveSession();
            if (!currentUser) return;
            
            const collectionRef = collection(fireApp, "AccountData");
            const docRef = doc(collectionRef, `${currentUser}`);
        
            const unsubscribe = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const { backgroundColor, btnShadowColor, btnFontColor, btnColor, themeTextColour } = docSnap.data();
                    let newColor;
                    
                    switch (colorFor) {
                        case 0:
                            newColor = backgroundColor || "#e8edf5";
                            break;
                        case 1:
                            newColor = btnColor || "#e8edf5";
                            break;
                        case 2:
                            newColor = btnFontColor || "#e8edf5";
                            break;
                        case 3:
                            newColor = btnShadowColor || "#e8edf5";
                            break;
                        case 4:
                            newColor = themeTextColour || "#000000";
                            break;
                        default:
                            newColor = backgroundColor || "#e8edf5";
                            break;
                    }
                    
                    // ✅ Only update if the color actually changed to prevent loops
                    if (newColor !== colorText) {
                        setColorText(newColor);
                    }
                    
                    // ✅ Mark as loaded after first fetch
                    if (!colorHasLoaded) {
                        setColorHasLoaded(true);
                    }
                }
            }, (error) => {
                console.error("Error fetching theme:", error);
            });
            
            return unsubscribe;
        }
        
        const unsubscribe = fetchTheme();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [colorFor, isHydrated]); // ✅ Remove colorText from dependencies to prevent loop

    // ✅ Show loading state until hydrated
    if (!isHydrated) {
        return (
            <div className="pt-6 flex items-center">
                <div className="h-12 w-12 mr-4 rounded-lg bg-gray-200 animate-pulse"></div>
                <div className="w-auto relative pt-2 flex items-center hover:border rounded-lg bg-black bg-opacity-[0.05] border-transparent border">
                    <div className="sm:flex-1 sm:w-auto w-[200px] px-4 py-2 bg-gray-100 animate-pulse h-10 rounded"></div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="pt-6 flex items-center">
            <input 
                type="color" 
                className="relative h-0 w-0 overflow-hidden"
                value={colorText}
                ref={colorPickRef}
                onChange={(e) => setColorText(e.target.value)} 
            />
            <div 
                className="h-12 w-12 mr-4 rounded-lg cursor-pointer hover:scale-[1.05] active:scale-90 transition-transform" 
                style={{ background: colorText }} 
                onClick={() => colorPickRef.current?.click()}
            ></div>
            <div className={`w-auto relative pt-2 flex items-center hover:border rounded-lg bg-black bg-opacity-[0.05] ${validColor ? "focus-within:border-black border-transparent": "border-red-500" } focus-within:border-2 border`}>
                <input 
                    type="text"
                    className="sm:flex-1 sm:w-auto w-[200px] px-4 placeholder-shown:px-3 py-2 text-base font-semibold outline-none opacity-100 bg-transparent peer appearance-none"
                    placeholder=" "
                    value={colorText}
                    onChange={(e) => setColorText(e.target.value)}
                />
                <label className="absolute px-3 pointer-events-none top-[.25rem] left-1 text-xs text-main-green peer-placeholder-shown:top-2/4 peer-placeholder-shown:pt-2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-slate-500 peer-placeholder-shown:left-0 opacity-70 transition duration-[250] ease-linear">
                    Colour
                </label>
            </div>
        </div>
    )
}