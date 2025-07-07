"use client"
import React, { useState } from "react";
import BackgroundCard from "../elements/BackgroundCard";
import ColorPicker from "../elements/ColorPicker";
import GradientPicker from "../elements/GradientPicker";
import { useTranslation } from "@/lib/useTranslation";

export const backgroundContext = React.createContext();

export default function Backgrounds() {
    const { t } = useTranslation();
    const [isGradient, setIsGradient] = useState(false);
    
    return (
        <backgroundContext.Provider value={{ setIsGradient }}>
            <div className="w-full bg-white rounded-3xl my-3 flex flex-col p-6">
                <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] sm:gap-4 gap-2 w-full">
                    <BackgroundCard type="flat_color" text={t("appearance.flat_colour")} colorValue={"#3d444b"} />
                    <BackgroundCard type="gradient" text={t("appearance.gradient")} backImg={"linear-gradient(to top, #3d444b, #686d73)"} />
                    <BackgroundCard type="image" text={t("appearance.image")} />
                    <BackgroundCard type="video" text={t("appearance.video")} />
                    <BackgroundCard type="polka" text={t("appearance.polka")} backImg={'url("https://linktree.sirv.com/Images/gif/selector-polka.51162b39945eaa9c181a.gif")'} />
                    <BackgroundCard type="stripe" text={t("appearance.stripe")} backImg={'url("https://linktree.sirv.com/Images/gif/selector-stripe.19d28e1aac1e5a38452e.gif")'} />
                    <BackgroundCard type="waves" text={t("appearance.waves")} backImg={'url("https://linktree.sirv.com/Images/gif/selector-waves.5cf0a8a65908cd433192.gif")'} />
                    <BackgroundCard type="zig_zag" text={t("appearance.zig_zag")} backImg={'url("https://linktree.sirv.com/Images/gif/selector-zigzag.0bfe34b10dd92cad79b9.gif")'} />
                </div>
                {isGradient && <GradientPicker />}
                <ColorPicker />
            </div>
        </backgroundContext.Provider>
    );
}