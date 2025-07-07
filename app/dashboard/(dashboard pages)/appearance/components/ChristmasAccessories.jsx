"use client"
import AssestCardVideo from "../elements/AssestCardVideo";
import { useTranslation } from "@/lib/useTranslation";

export default function ChristmasAccessories() {
    const { t } = useTranslation();
    
    return (
        <div className="w-full bg-white rounded-3xl my-3 flex flex-col p-6">
            <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] sm:gap-4 gap-2 w-full">
                <AssestCardVideo 
                    coverImg={"https://linktree.sirv.com/Images/Christmas/videoframe_1211.png"} 
                    src={"https://linktree.sirv.com/Images/Christmas/Snow_Falling_Animation_Black_and_Green_Screen_Background.mp4"} 
                    type={"video/mp4"} 
                    text={t("christmas.snow_fall")}
                />
            </div>
        </div>
    )
}