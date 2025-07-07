// lib/SupportGroups.jsx
import { useTranslation } from "@/lib/useTranslation";
import { useMemo } from "react";

// Static data that doesn't need translation
const baseSupportGroups = [
    {
        type: 0,
        translationKey: "support_creator",
        linkTo: "https://github.com/fabiconcept",
    },
    {
        type: 1,
        translationKey: "free_palestine",
        linkTo: "https://mylinks.fabiconcept.online/freepalestine"
    },
    {
        type: 2,
        translationKey: "stand_with_ukraine",
        linkTo: "https://linktr.ee/withukraine",
    },
    {
        type: 3,
        translationKey: "anti_racism",
        linkTo: "https://linktr.ee/ACTION",
    },
    {
        type: 4,
        translationKey: "pride",
        linkTo: "https://linktr.ee/PrideMonth",
    },
];

// Hook to get translated support groups list
export const useSupportGroups = () => {
    const { t, locale } = useTranslation();
    
    return useMemo(() => {
        return baseSupportGroups.map(group => ({
            ...group,
            caption: t(`support_groups.${group.translationKey}.caption`),
            cardTitle: t(`support_groups.${group.translationKey}.card_title`),
            cardMessage: t(`support_groups.${group.translationKey}.card_message`),
            title: t(`support_groups.${group.translationKey}.title`),
            message: t(`support_groups.${group.translationKey}.message`)
        }));
    }, [t, locale]);
};

// For backward compatibility, export the static list (but recommend using the hook)
export const SupportGroups = baseSupportGroups;