// lib/SocialsList.jsx
import { useTranslation } from "@/lib/useTranslation";
import { useMemo } from "react";

// Static data that doesn't need translation
const baseSocialsList = [
    {
        id: "8f0033b8-ccd7-5762-a26b-666536f93ff8",
        icon: "https://linktree.sirv.com/Images/icons/threads.svg",
        type: 0,
        valueType: "text",
        baseUrl: "https://threads.net/@",
        translationKey: "threads"
    },
    {
        id: "59e6a60e-a396-566a-8d22-22ccb3b6431e",
        icon: "https://linktree.sirv.com/Images/icons/instagram.svg",
        type: 1,
        valueType: "url",
        baseUrl: "https://www.instagram.com/",
        translationKey: "instagram"
    },
    {
        id: "f0ece57e-b838-58db-977d-2e61c4567199",
        icon: "https://linktree.sirv.com/Images/icons/email.svg",
        type: 2,
        valueType: "email",
        baseUrl: "mailto:",
        translationKey: "email"
    },
    {
        id: "12d69e1b-fd47-5f00-9d1e-a441a50c1180",
        icon: "https://linktree.sirv.com/Images/icons/youtube.svg",
        type: 3,
        valueType: "url",
        baseUrl: "https://www.youtube.com/",
        translationKey: "youtube"
    },
    {
        id: "2c975301-8517-5ffe-8f98-3c999d2f9587",
        icon: "https://linktree.sirv.com/Images/icons/twitterJ.svg",
        type: 4,
        valueType: "url",
        baseUrl: "https://twitter.com/",
        translationKey: "twitter_jack"
    },
    {
        id: "3cb3ad25-6137-5ae2-b4d1-278fd2e8eb10",
        icon: "https://linktree.sirv.com/Images/icons/twitterE.svg",
        type: 5,
        valueType: "url",
        baseUrl: "https://twitter.com/",
        translationKey: "twitter_elon"
    },
    {
        id: "c77a517b-5e6e-505e-a8f0-343ff468c4d4",
        icon: "https://linktree.sirv.com/Images/icons/tiktok.svg",
        type: 6,
        valueType: "text",
        baseUrl: "https://www.tiktok.com/@",
        translationKey: "tiktok"
    },
    {
        id: "3d160d26-5a61-5b2a-9278-002f6bad7486",
        icon: "https://linktree.sirv.com/Images/icons/whatsapp.svg",
        type: 7,
        valueType: "text",
        baseUrl: "https://wa.me/",
        translationKey: "whatsapp"
    },
    {
        id: "dfdf370a-029b-522b-b4e8-f659301a52f4",
        icon: "https://linktree.sirv.com/Images/icons/snapchat.svg",
        type: 8,
        valueType: "text",
        baseUrl: "https://www.snapchat.com/add/",
        translationKey: "snapchat"
    },
    {
        id: "46ea79af-6298-509b-ab56-d20a425586a7",
        icon: "https://linktree.sirv.com/Images/icons/amazon.svg",
        type: 9,
        valueType: "url",
        baseUrl: "https://www.amazon.com/",
        translationKey: "amazon"
    },
    {
        id: "7ed42fe6-7e5f-5f36-aec6-7a0f85b9b918",
        icon: "https://linktree.sirv.com/Images/icons/andriod.svg",
        type: 10,
        valueType: "url",
        baseUrl: "https://play.google.com/",
        translationKey: "android"
    },
    {
        id: "32549fd5-eba6-5cc0-a0eb-fefd090495ba",
        icon: "https://linktree.sirv.com/Images/icons/apple.svg",
        type: 11,
        valueType: "url",
        baseUrl: "https://apps.apple.com/",
        translationKey: "apple_store"
    },
    {
        id: "0dafb665-cac2-5246-866b-6b10b4472077",
        icon: "https://linktree.sirv.com/Images/icons/appleMusic.svg",
        type: 12,
        valueType: "url",
        baseUrl: "https://music.apple.com/",
        translationKey: "apple_music"
    },
    {
        id: "ba29e00f-16cf-57e0-8d08-f1670a7670b8",
        icon: "https://linktree.sirv.com/Images/icons/applePodcast.svg",
        type: 13,
        valueType: "url",
        baseUrl: "https://podcasts.apple.com/",
        translationKey: "apple_podcast"
    },
    {
        id: "3294eed3-bbdc-5720-b62e-b5df0c6274ac",
        icon: "https://linktree.sirv.com/Images/icons/bandcamp.svg",
        type: 14,
        valueType: "url",
        baseUrl: "https://bandcamp.com/",
        translationKey: "bandcamp"
    },
    {
        id: "a57a4033-3407-5985-95fe-806a8a10eb00",
        icon: "https://linktree.sirv.com/Images/icons/bereal.svg",
        type: 15,
        valueType: "url",
        baseUrl: "https://bereal.com/",
        translationKey: "bereal"
    },
    {
        id: "ecb4f919-0e0f-5c42-94c5-5b8316f0df8f",
        icon: "https://linktree.sirv.com/Images/icons/cameo.svg",
        type: 16,
        valueType: "url",
        baseUrl: "https://www.cameo.com/",
        translationKey: "cameo"
    },
    {
        id: "e70465a8-b99c-52f6-88fa-8ffe649d5c96",
        icon: "https://linktree.sirv.com/Images/icons/clubhouse.svg",
        type: 17,
        valueType: "url",
        baseUrl: "https://www.joinclubhouse.com/",
        translationKey: "clubhouse"
    },
    {
        id: "b0501c72-7503-5a88-a0ac-ae4cd08f5f0c",
        icon: "https://linktree.sirv.com/Images/icons/discord.svg",
        type: 18,
        valueType: "url",
        baseUrl: "https://discord.gg/",
        translationKey: "discord"
    },
    {
        id: "66c4a560-6b2c-5e5f-9ba4-893f67ed2903",
        icon: "https://linktree.sirv.com/Images/icons/etsy.svg",
        type: 19,
        valueType: "url",
        baseUrl: "https://www.etsy.com/",
        translationKey: "etsy"
    },
    {
        id: "37122bc6-89cb-5625-a35f-c4d6de07ccdb",
        icon: "https://linktree.sirv.com/Images/icons/linkedin.svg",
        type: 20,
        valueType: "url",
        baseUrl: "https://www.linkedin.com/",
        translationKey: "linkedin"
    },
    {
        id: "805dadf2-d2d2-582d-b532-6f3c16bfe2f1",
        icon: "https://linktree.sirv.com/Images/icons/patreon.svg",
        type: 21,
        valueType: "url",
        baseUrl: "https://www.patreon.com/",
        translationKey: "patreon"
    },
    {
        id: "1968c63e-9a14-53a7-8623-0388f3b836c4",
        icon: "https://linktree.sirv.com/Images/icons/payment.svg",
        type: 22,
        valueType: "url",
        baseUrl: "https://www.paypal.me/",
        translationKey: "payment"
    },
    {
        id: "8611c825-d692-5b48-b955-b58ffe6b39b3",
        icon: "https://linktree.sirv.com/Images/icons/pinterest.svg",
        type: 23,
        valueType: "url",
        baseUrl: "https://www.pinterest.com/",
        translationKey: "pinterest"
    },
    {
        id: "6e275629-3994-5971-9dea-729ee4c72194",
        icon: "https://linktree.sirv.com/Images/icons/poshmark.svg",
        type: 24,
        valueType: "url",
        baseUrl: "https://poshmark.com/",
        translationKey: "poshmark"
    },
    {
        id: "f8e2e8f2-10fd-562a-8ace-7b5cbe4cce87",
        icon: "https://linktree.sirv.com/Images/icons/signal.svg",
        type: 25,
        valueType: "url",
        baseUrl: "https://signal.app/",
        translationKey: "signal"
    },
    {
        id: "5af20546-9926-5c6c-b301-8ec371286a1f",
        icon: "https://linktree.sirv.com/Images/icons/soundCloud.svg",
        type: 26,
        valueType: "url",
        baseUrl: "https://soundcloud.com/",
        translationKey: "soundcloud"
    },
    {
        id: "199e3494-6cbf-5d33-a0c8-db0a483d976b",
        icon: "https://linktree.sirv.com/Images/icons/spotify.svg",
        type: 27,
        valueType: "url",
        baseUrl: "https://open.spotify.com/",
        translationKey: "spotify"
    },
    {
        id: "87c6c6e4-92ac-5a7a-b408-b6a55c9eba4f",
        icon: "https://linktree.sirv.com/Images/icons/substack.svg",
        type: 28,
        valueType: "url",
        baseUrl: "https://yourpublication.substack.com/",
        translationKey: "substack"
    },
    {
        id: "2582ad8b-560e-5f0c-a330-3f75dd00a644",
        icon: "https://linktree.sirv.com/Images/icons/telegram.svg",
        type: 29,
        valueType: "url",
        baseUrl: "https://t.me/",
        translationKey: "telegram"
    },
    {
        id: "54e6c2c0-28c0-556c-98ee-aa3c675f6629",
        icon: "https://linktree.sirv.com/Images/icons/twitch.svg",
        type: 30,
        valueType: "url",
        baseUrl: "https://www.twitch.tv/",
        translationKey: "twitch"
    }
];

// Hook to get translated socials list
export const useSocialsList = () => {
    const { t, locale } = useTranslation();
    
    return useMemo(() => {
        return baseSocialsList.map(social => ({
            ...social,
            title: t(`socials.${social.translationKey}.title`),
            placeholder: t(`socials.${social.translationKey}.placeholder`),
            example: t(`socials.${social.translationKey}.example`),
            error: t(`socials.${social.translationKey}.error`)
        }));
    }, [t, locale]);
};

// For backward compatibility, export the static list (but recommend using the hook)
export const SocialsList = baseSocialsList;