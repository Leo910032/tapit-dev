// app/[userId]/elements/Socials.jsx - ENHANCED WITH REFERRER TRACKING
import { useSocialsList } from "@/lib/SocialsList";
import { isSuitableForWhiteText } from "@/lib/utilities";
import Image from "next/image";
import Link from "next/link";
import { recordLinkClick, SessionManager } from "@/lib/analytics/linkClickTracker";
import { fetchUserData } from "@/lib/fetch data/fetchUserData";
import { useEffect, useState } from "react";

export default function Socials({ socialArray, themeFontColor, userId }) {
    const SocialsList = useSocialsList(); // Use the translated hook
    const [username, setUsername] = useState("");
    const [sessionData, setSessionData] = useState(null); // ✅ NEW: Track session data

    // ✅ NEW: Initialize session tracking on component mount
    useEffect(() => {
        // Get or create session data when component mounts
        const session = SessionManager.getOrCreateSession();
        setSessionData(session);
        
        console.log("🎯 Session initialized for Socials component:", session);
    }, []);

    useEffect(() => {
        // Get username for analytics tracking
        async function getUsername() {
            if (userId) {
                try {
                    const userData = await fetchUserData(userId);
                    setUsername(userData?.username || "");
                } catch (error) {
                    console.error("Failed to get username:", error);
                }
            }
        }
        getUsername();
    }, [userId]);

    // ✅ ENHANCED: Social click handler with referrer tracking
    const handleSocialClick = async (social, socialData) => {
        if (!username) return;

        try {
            const socialUrl = socialData.valueType !== "url" 
                ? `${socialData.baseUrl}${social.value}` 
                : social.value;

            // Get current session data
            const currentSession = SessionManager.getOrCreateSession();

            await recordLinkClick(username, {
                linkId: `social_${social.type}_${social.id}`,
                linkTitle: socialData.title,
                linkUrl: socialUrl,
                linkType: "social"
            }, {
                userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
                referrer: typeof window !== 'undefined' ? document.referrer : '',
                recordDetailed: true, // ✅ ENHANCED: Enable detailed logging with referrer data
                // ✅ NEW: Include current page info and social-specific data
                currentUrl: typeof window !== 'undefined' ? window.location.href : '',
                timestamp: new Date().toISOString(),
                socialPlatform: social.type,
                socialHandle: social.value,
                socialUrl: socialUrl
            });

            console.log("✅ Social click recorded with referrer data:", socialData.title);
            console.log("🎯 Traffic source:", currentSession?.trafficSource);
            console.log("📱 Social platform:", social.type, "Handle:", social.value);
        } catch (error) {
            console.error("❌ Failed to record social click:", error);
        }
    };

    return (
        <div className="flex gap-2 justify-center flex-wrap max-w-full sArray relative">
            {socialArray.map((social, index) => {
                if (social.active) {
                    // Find the social data using the type
                    const socialData = SocialsList.find(s => s.type === social.type);
                    
                    if (!socialData) {
                        return null; // Skip if social data not found
                    }

                    const socialUrl = socialData.valueType !== "url" 
                        ? `${socialData.baseUrl}${social.value}` 
                        : social.value;

                    return (
                        <div key={index} className="relative">
                            <Link
                                href={socialUrl}
                                target="_blank"
                                className={`hover:scale-[1.25] active:scale-95 min-w-fit sIcon ${isSuitableForWhiteText(themeFontColor) ? "filter invert" : ""}`}
                                onClick={() => handleSocialClick(social, socialData)}
                            >
                                <Image 
                                    src={socialData.icon} 
                                    alt={socialData.title} 
                                    width={40} 
                                    height={40} 
                                    style={{ filter: "drop-shadow(inset 0 0 10px #fff)" }} 
                                />
                            </Link>

                            {/* ✅ NEW: Optional referrer indicator for social icons (for debugging) */}
                            {process.env.NODE_ENV === 'development' && sessionData && index === 0 && (
                                <div className="absolute -top-8 left-0 text-xs bg-green-100 text-green-800 px-2 py-1 rounded opacity-75 whitespace-nowrap z-50">
                                    👥 {sessionData.trafficSource.source}
                                </div>
                            )}
                        </div>
                    )
                }
            })}

            {/* ✅ NEW: Optional session info display (for debugging) */}
            {process.env.NODE_ENV === 'development' && sessionData && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded opacity-75 whitespace-nowrap">
                    Session: {sessionData.trafficSource.source} • {sessionData.trafficSource.medium}
                    {sessionData.utmParams.utm_campaign && ` • ${sessionData.utmParams.utm_campaign}`}
                </div>
            )}
        </div>
    );
}