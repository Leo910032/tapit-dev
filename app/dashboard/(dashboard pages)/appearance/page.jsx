"use client"
import { useTranslation } from "@/lib/useTranslation";
import Backgrounds from "./components/Backgrounds";
import ChristmasAccessories from "./components/ChristmasAccessories";
import Buttons from "./components/Buttons";
import FontsOptions from "./components/FontsOptions";
import ProfileCard from "./components/ProfileCard";
import Themes from "./components/Themes";

export default function AppearancePage() {
    const { t } = useTranslation();
    
    return (
        <div className="flex-1 py-2 flex flex-col max-h-full overflow-y-auto">
            <div className="py-4">
                <span className="text-lg font-semibold my-4">{t('appearance.profile')}</span>
                <ProfileCard />
            </div>
            <div className="py-4">
                <span className="text-lg font-semibold my-4">{t('appearance.themes')}</span>
                <Themes />
            </div>
            <div className="py-4">
                <span className="text-lg font-semibold my-4">{t('appearance.custom_appearance')}</span>
                <p className="py-3 sm:text-base text-sm">
                    {t('appearance.custom_appearance_description')}
                </p>
            </div>
            <div className="py-4">
                <span className="text-lg font-semibold my-4">{t('appearance.backgrounds')}</span>
                <Backgrounds />
            </div>
            <div className="py-4">
                <span className="text-lg font-semibold my-4">
                    {t('appearance.christmas_accessories')} 
                    <span className="py-1 px-3 rounded bg-green-500 text-white font-medium text-sm ml-2">
                        {t('appearance.new_badge')}
                    </span>
                </span>
                <ChristmasAccessories />
            </div>
            <div className="py-4">
                <span className="text-lg font-semibold my-4">{t('appearance.buttons')}</span>
                <Buttons />
            </div>
            <div className="py-4">
                <span className="text-lg font-semibold my-4">{t('appearance.fonts')}</span>
                <FontsOptions />
            </div>
        </div>
    );
}