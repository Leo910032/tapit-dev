"use client"
import { fireApp } from "@/important/firebase";
import { testForActiveSession } from "@/lib/authentication/testForActiveSession";
import { updateTheme, updateThemeTextColour } from "@/lib/update data/updateTheme";
import { collection, doc, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { useTranslation } from "@/lib/useTranslation";

export default function ThemeCard({ type, pic, text, themeId = "custom" }) {
    const { t } = useTranslation();
    const [isSelectedTheme, setIsSelectedTheme] = useState(false);
    const [themeColor, setThemeColor] = useState("");

    // Map themeId to the text expected by updateTheme
    const getThemeNameForUpdate = (themeId) => {
        const themeMap = {
            'custom': 'Custom',
            'matrix': 'Matrix',
            'new_mario': 'New Mario',
            'pebble_blue': 'Pebble Blue',
            'pebble_yellow': 'Pebble Yellow',
            'pebble_pink': 'Pebble Pink',
            'cloud_red': 'Cloud Red',
            'cloud_green': 'Cloud Green',
            'cloud_blue': 'Cloud Blue',
            'breeze_pink': 'Breeze Pink',
            'breeze_orange': 'Breeze Orange',
            'breeze_green': 'Breeze Green',
            'rainbow': 'Rainbow',
            'confetti': 'Confetti',
            '3d_blocks': '3D Blocks',
            'starry_night': 'Starry Night',
            'lake_white': 'Lake White',
            'lake_black': 'Lake Black'
        };
        return themeMap[themeId] || 'Custom';
    };

    const specialThemes = ["new_mario", "matrix"];

    const handleUpdateTheme = async() => {
        const themeName = getThemeNameForUpdate(themeId);
        await updateTheme(themeName, themeColor);
        if(!specialThemes.includes(themeId)) return;
        await updateThemeTextColour(themeColor);
    }

    useEffect(() => {
        if(!isSelectedTheme) return;
        switch (themeId) {
            case 'lake_black':
                setThemeColor("#fff");
                break;
            case 'starry_night':
                setThemeColor("#fff");
                break;
            case '3d_blocks':
                setThemeColor("#fff");
                break;
            case 'matrix':
                setThemeColor("#0f0");
                break;
            case 'new_mario':
                setThemeColor("#000");
                break;
        
            default:
                setThemeColor("#000");
                break;
        }
    }, [themeId, isSelectedTheme]);
    
    useEffect(() => {
        function fetchTheme() {
            const currentUser = testForActiveSession();
            const collectionRef = collection(fireApp, "AccountData");
            const docRef = doc(collectionRef, `${currentUser}`);
        
            onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const { selectedTheme } = docSnap.data();
                    const themeName = getThemeNameForUpdate(themeId);
                    setIsSelectedTheme(selectedTheme === themeName);
                }
            });
        }
        
        fetchTheme();
    }, [themeId]);

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