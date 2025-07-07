"use client"
import ThemeCard from "../elements/ThemeCard";
import { useTranslation } from "@/lib/useTranslation";

export default function Themes() {
    const { t } = useTranslation();
    
    return (
        <div className="w-full bg-white rounded-3xl my-3 flex flex-col p-6">
            <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] sm:gap-4 gap-2 w-full">
                <ThemeCard themeId="custom" />
                <ThemeCard type={1} themeId="matrix" text={t("themes.matrix")} pic={"https://linktree.sirv.com/Images/bg/selector-matrix.gif"} />
                <ThemeCard type={1} themeId="new_mario" text={t("themes.new_mario")} pic={"https://linktree.sirv.com/Images/Scene/Mario/selector-mario.jpg"} />
                <ThemeCard type={1} themeId="pebble_blue" text={t("themes.pebble_blue")} pic={"https://linktree.sirv.com/Images/bg/selector-pebble-blue.png"} />
                <ThemeCard type={1} themeId="pebble_yellow" text={t("themes.pebble_yellow")} pic={"https://linktree.sirv.com/Images/bg/selector-pebble-yellow.adffcf319fe3cb16a9b7.png"} />
                <ThemeCard type={1} themeId="pebble_pink" text={t("themes.pebble_pink")} pic={"https://linktree.sirv.com/Images/bg/selector-pebble-pink.71c34887a9c4ca41828c.png"} />
                <ThemeCard type={1} themeId="cloud_red" text={t("themes.cloud_red")} pic={"https://linktree.sirv.com/Images/bg/selector-cloud-red.png"} />
                <ThemeCard type={1} themeId="cloud_green" text={t("themes.cloud_green")} pic={"https://linktree.sirv.com/Images/bg/selector-cloud-green.png"} />
                <ThemeCard type={1} themeId="cloud_blue" text={t("themes.cloud_blue")} pic={"https://linktree.sirv.com/Images/bg/selector-cloud-blue.png"} />
                <ThemeCard type={1} themeId="breeze_pink" text={t("themes.breeze_pink")} pic={"https://linktree.sirv.com/Images/bg/selector-breeze-pink.webp"} />
                <ThemeCard type={1} themeId="breeze_orange" text={t("themes.breeze_orange")} pic={"https://linktree.sirv.com/Images/bg/selector-breeze-orange.webp"} />
                <ThemeCard type={1} themeId="breeze_green" text={t("themes.breeze_green")} pic={"https://linktree.sirv.com/Images/bg/selector-breeze-green.webp"} />
                <ThemeCard type={1} themeId="rainbow" text={t("themes.rainbow")} pic={"https://linktree.sirv.com/Images/bg/selector-rainbow.85e9302f9aac535367aa.webp"} />
                <ThemeCard type={1} themeId="confetti" text={t("themes.confetti")} pic={"https://linktree.sirv.com/Images/bg/selector-confetti.3da60ad2f58e6d1f40da.webp"} />
                <ThemeCard type={1} themeId="3d_blocks" text={t("themes.3d_blocks")} pic={"https://linktree.sirv.com/Images/bg/selector-block-colors.3adc34edf1ddccfd1122.png"} />
                <ThemeCard type={1} themeId="starry_night" text={t("themes.starry_night")} pic={"https://linktree.sirv.com/Images/bg/selector-starry-night.4c4e7cd22f0ce2c39fa7.png"} />
                <ThemeCard type={1} themeId="lake_white" text={t("themes.lake_white")} pic={"https://linktree.sirv.com/Images/bg/selector-lake-white.2f951fa5f392d68bd733.gif"} />
                <ThemeCard type={1} themeId="lake_black" text={t("themes.lake_black")} pic={"https://linktree.sirv.com/Images/gif/selector-lake-black.fe2b50e40e996d766e0b.gif"} />
            </div>
        </div>
    );
}