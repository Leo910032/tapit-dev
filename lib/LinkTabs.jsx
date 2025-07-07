// lib/LinkTabs.js
export const getLinkTabs = (t) => [
    {
        img: "https://linktree.sirv.com/Images/icons/social.svg",
        imgActive: "https://linktree.sirv.com/Images/icons/fill/social.svg",
        text: t("dropdown.social_icons"), 
        tag: '#Settings--SocialLinks'
    },
    {
        img: "https://linktree.sirv.com/Images/icons/support.svg",
        imgActive: "https://linktree.sirv.com/Images/icons/fill/support.svg",
        text: t("dropdown.support_banner"), 
        tag: '#Settings--SupportBanner'
    },
    {
        img: "https://linktree.sirv.com/Images/icons/sensitive.svg",
        imgActive: "https://linktree.sirv.com/Images/icons/fill/sensitive.svg",
        text: t("dropdown.sensitive_material"), 
        tag: '#Settings--SensitiveMaterial'
    },
    {
        img: "https://linktree.sirv.com/Images/icons/seo.svg",
        imgActive: "https://linktree.sirv.com/Images/icons/fill/seo.svg",
        text: t("dropdown.seo"), 
        tag: '#Settings--SEO'
    },
];