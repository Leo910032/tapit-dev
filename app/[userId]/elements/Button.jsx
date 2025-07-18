// app/[userId]/elements/Button.jsx - ENHANCED WITH REFERRER TRACKING
"use client"
import { fireApp } from "@/important/firebase";
import { fetchUserData } from "@/lib/fetch data/fetchUserData";
import { hexToRgba, makeValidUrl } from "@/lib/utilities";
import { collection, doc, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import IconDiv from "./IconDiv";
import "./style/3d.css";
import { getCompanyFromUrl } from "@/lib/BrandLinks";
import { availableFonts_Classic } from "@/lib/FontsList";
import ButtonText from "./ButtonText";
import { FaCopy } from "react-icons/fa6";
import { toast } from "react-hot-toast";
import { useTranslation } from "@/lib/useTranslation";
import { recordLinkClickByUserId, SessionManager } from "@/lib/analytics/linkClickTracker";

export default function Button({ url, content, userId, linkId, linkType = "custom" }) {
    const [modifierClass, setModifierClass] = useState("");
    const [specialElements, setSpecialElements] = useState(null);
    const [selectedTheme, setSelectedTheme] = useState('');
    const [btnType, setBtnType] = useState(0);
    const [btnShadowColor, setBtnShadowColor] = useState('');
    const [btnFontColor, setBtnFontColor] = useState('');
    const [themeTextColour, setThemeTextColour] = useState("");
    const [btnColor, setBtnColor] = useState('');
    const [accentColor, setAccentColor] = useState([]);
    const [btnFontStyle, setBtnFontStyle] = useState(null);
    const [selectedFontClass, setSelectedFontClass] = useState("");
    const [currentUserId, setCurrentUserId] = useState("");
    const [sessionData, setSessionData] = useState(null); // ✅ NEW: Track session data
    const router = useRouter();
    const { t } = useTranslation();

    const [isHovered, setIsHovered] = useState(false);

    const urlRef = useRef(null)

    const [modifierStyles, setModifierStyles] = useState({
        backgroundColor: "",
        color: "",
        boxShadow: "",
    });

    // ✅ NEW: Initialize session tracking on component mount
    useEffect(() => {
        // Get or create session data when component mounts
        const session = SessionManager.getOrCreateSession();
        setSessionData(session);
        
        console.log("🎯 Session initialized for Button component:", session);
    }, []);

    /**
     * ✅ ENHANCED: Link click handler with referrer tracking
     */
    const handleLinkClick = async (e) => {
        console.log("🔥 Link clicked:", content);
        console.log("📊 Tracking data:", { 
            userId: currentUserId, 
            linkId, 
            content, 
            url, 
            linkType,
            sessionData 
        });
        
        if (!currentUserId) {
            console.warn("⚠️ No user ID available for click tracking");
            return;
        }

        if (!linkId) {
            console.warn("⚠️ No linkId provided for click tracking");
            return;
        }

        try {
            // Get current session data (in case it was updated)
            const currentSession = SessionManager.getOrCreateSession();
            
            recordLinkClickByUserId(currentUserId, {
                linkId: linkId || `link_${Date.now()}`,
                linkTitle: content,
                linkUrl: url,
                linkType: linkType
            }, {
                userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
                referrer: typeof window !== 'undefined' ? document.referrer : '',
                recordDetailed: true, // ✅ ENHANCED: Enable detailed logging with referrer data
                // ✅ NEW: Include current page info
                currentUrl: typeof window !== 'undefined' ? window.location.href : '',
                timestamp: new Date().toISOString()
            }).then(() => {
                console.log("✅ Link click recorded successfully with referrer data:", content);
                console.log("🎯 Traffic source:", currentSession?.trafficSource);
            }).catch((error) => {
                console.error("❌ Failed to record link click:", error);
            });

        } catch (error) {
            console.error("❌ Failed to record link click:", error);
        }
    };

    /**
     * The `handleCopy` function copies a given URL to the clipboard and displays a success toast
     * notification.
     */
    const handleCopy = (myUrl) => {
        if (myUrl) {
            navigator.clipboard.writeText(myUrl);
            toast.success(
                t('button.link_copied'),
                {
                    style: {
                        border: '1px solid #6fc276',
                        padding: '16px',
                        color: '#6fc276',
                    },
                    iconTheme: {
                        primary: '#6fc276',
                        secondary: '#FFFAEE',
                    },
                }
            );
        }
    };

    /**
     * The function `getRootNameFromUrl` takes a URL as input and returns the root name (hostname) of
     * the URL.
     * @returns the root name of the given URL.
     */
    function getRootNameFromUrl(url) {
        try {
            const urlObj = new URL(makeValidUrl(url));
            const rootName = urlObj.hostname;
            return rootName;
        } catch (error) {
            console.log(error.message, url);
            throw new Error(error);
        }
    }

    useEffect(() => {
        async function fetchInfo() {
            try {
                const currentUser = await fetchUserData(userId);

                if (!currentUser) {
                    router.push("/");
                    return;
                }

                console.log("👤 Current user data:", currentUser);

                let actualUserId = '';

                if (typeof currentUser === 'string') {
                    actualUserId = currentUser;
                    console.log("🆔 Using user ID directly:", actualUserId);
                    setCurrentUserId(actualUserId);
                    
                    const collectionRef = collection(fireApp, "AccountData");
                    const docRef = doc(collectionRef, currentUser);
                    
                    onSnapshot(docRef, (docSnapshot) => {
                        if (docSnapshot.exists()) {
                            const accountData = docSnapshot.data();
                            console.log("📋 Account data:", accountData);
                            
                            const { btnType, btnShadowColor, btnFontColor, themeFontColor, btnColor, selectedTheme, fontType } = accountData;
                            const fontName = availableFonts_Classic[fontType ? fontType - 1 : 0];
                            setSelectedFontClass(fontName?.class || '');
                            setThemeTextColour(themeFontColor ? themeFontColor : "");
                            setBtnColor(btnColor ? btnColor : "#fff");
                            setSelectedTheme(selectedTheme);
                            setBtnFontColor(btnFontColor ? btnFontColor : "#000");
                            setBtnShadowColor(btnShadowColor ? btnShadowColor : "#000");
                            setBtnType(btnType);
                        }
                    });
                } else if (currentUser.userId || currentUser.id) {
                    actualUserId = currentUser.userId || currentUser.id;
                    console.log("🆔 Extracted user ID from object:", actualUserId);
                    setCurrentUserId(actualUserId);
                } else {
                    actualUserId = userId;
                    console.log("🆔 Fallback to userId parameter:", actualUserId);
                    setCurrentUserId(actualUserId);
                }

            } catch (error) {
                console.error("❌ Error in fetchInfo:", error);
            }
        }

        fetchInfo();
    }, [router, userId]);

    useEffect(() => {
        console.log("🔍 Button debug info:", {
            currentUserId,
            linkId,
            content,
            url,
            linkType,
            userId,
            sessionData: sessionData?.trafficSource // Only log relevant session info
        });
    }, [currentUserId, linkId, content, url, linkType, userId, sessionData]);

    useEffect(() => {
        if (selectedTheme === "3D Blocks") {
            const rootName = getRootNameFromUrl(url);
            setModifierClass(`
                relative after:absolute after:h-2 after:w-[100.5%] after:bg-black bg-white
                after:-bottom-2 after:left-[1px] after:skew-x-[57deg] after:ml-[2px]
                before:absolute before:h-[107%] before:w-3 before:bg-[currentColor]
                before:top-[1px] before:border-2 before:border-black before:-right-3 before:skew-y-[30deg]
                before:grid before:grid-rows-2
                border-2 border-black inset-2
                ml-[-20px]
                btn
            `);
            setSpecialElements(null);
            setBtnFontStyle({
                color: "#fff"
            });

            switch (String(getCompanyFromUrl(rootName)).toLocaleLowerCase()) {
                case 'tiktok':
                    setAccentColor(["#ff0050", "#00f2ea"]);
                    break;
                case 'audiomack':
                    setAccentColor(["#ffa200", "#2a2a2a"]);
                    break;
                case 'twitter':
                    setAccentColor(["#1DA1F2", "#657786"]);
                    break;
                case 'linkedin':
                    setAccentColor(["#0077b5", "#0077b5"]);
                    break;
                case 'spotify':
                    setAccentColor(["#1DB954", "#1DB954"]);
                    break;
                case 'youtube':
                    setAccentColor(["#FF0000", "#FF0000"]);
                    break;
                case 'reddit':
                    setAccentColor(["#ff4500", "#5f99cf"]);
                    break;
                case 'paypal':
                    setAccentColor(["#003087", "#009cde"]);
                    break;
                case 'instagram':
                    setAccentColor(["#E1306C", "#833AB4"]);
                    break;
                case 'facebook':
                    setAccentColor(["#4267B2", "#898F9C"]);
                    break;
                case 'linktree':
                    setAccentColor(["#43E660", "#657786"]);
                    break;
                case 'pornhub':
                    setAccentColor(["#ffa31a", "#1b1b1b"]);
                    break;
                case 'xvideos':
                    setAccentColor(["#C9221E", "#ffffff"]);
                    break;
                case 'xnxx':
                    setAccentColor(["#5D9FFF", "#000092"]);
                    break;
                case 'whatsapp':
                    setAccentColor(["#25d366", "#075e54"]);
                    break;
                case 'pinterest':
                    setAccentColor(["#BB0F23", "#F8F9FC"]);
                    break;
                case 'fabiconcept':
                    setAccentColor(["#fea02f", "#de6600"]);
                    break;

                default:
                    setAccentColor(["#191414", "#14171A"]);
                    break;
            }
            return;
        }

        switch (btnType) {
            case 0:
                setModifierClass("");
                setSpecialElements(null);
                break;
            case 1:
                setModifierClass("rounded-lg");
                setSpecialElements(null);
                break;
            case 2:
                setModifierClass("rounded-3xl");
                setSpecialElements(null);
                break;
            case 3:
                setModifierClass("border border-black bg-opacity-0");
                setSpecialElements(null);
                break;
            case 4:
                setModifierClass("border border-black rounded-lg bg-opacity-0");
                setSpecialElements(null);
                break;
            case 5:
                setModifierClass("border border-black rounded-3xl bg-opacity-0");
                setSpecialElements(null);
                break;
            case 6:
                setModifierClass(`bg-white border border-black`);
                setSpecialElements(null);
                break;
            case 7:
                setModifierClass(`bg-white border border-black rounded-lg`);
                setSpecialElements(null);
                break;
            case 8:
                setModifierClass(`bg-white border border-black rounded-3xl`);
                setSpecialElements(null);
                break;
            case 9:
                setModifierClass(`bg-white`);
                setSpecialElements(null);
                break;
            case 10:
                setModifierClass(`bg-white rounded-lg`);
                setSpecialElements(null);
                break;
            case 11:
                setModifierClass(`bg-white rounded-3xl`);
                setSpecialElements(null);
                break;
            case 12:
                setModifierClass("relative border border-black bg-black");
                setSpecialElements(
                    <>
                        <span className="w-full absolute left-0 bottom-0 translate-y-[6px]">
                            <Image src={"https://linktree.sirv.com/Images/svg%20element/torn.svg"} alt="ele" width={1000} height={100} priority className="w-full scale-[-1]" />
                        </span>
                        <span className="w-full absolute left-0 top-0 -translate-y-[6px]">
                            <Image src={"https://linktree.sirv.com/Images/svg%20element/torn.svg"} alt="ele" width={1000} height={1000} priority className="w-full" />
                        </span>
                    </>
                );
                break;
            case 13:
                setModifierClass("relative border border-black bg-black");
                setSpecialElements(
                    <>
                        <span className="w-full absolute left-0 bottom-0 translate-y-[4px]">
                            <Image src={"https://linktree.sirv.com/Images/svg%20element/jiggy.svg"} style={{ fill: modifierStyles.backgroundColor }} alt="ele" width={1000} height={8} priority className="w-full" />
                        </span>
                        <span className="w-full absolute left-0 top-0 -translate-y-[3px]">
                            <Image src={"https://linktree.sirv.com/Images/svg%20element/jiggy.svg"} style={{ fill: modifierStyles.backgroundColor }} alt="ele" width={1000} height={8} priority className="w-full scale-[-1]" />
                        </span>
                    </>
                );
                break;
            case 14:
                setModifierClass("border border-black relative after:-translate-y-1/2 after:-translate-x-1/2 after:top-1/2 after:left-1/2 after:h-[88%] after:w-[104%] after:absolute after:border after:border-black after:mix-blend-difference");
                setSpecialElements(null);
                break;
            case 15:
                setModifierClass("border border-black bg-black rounded-3xl");
                setSpecialElements(null);
                break;
            case 16:
                setModifierClass("relative border border-black bg-black");
                setSpecialElements(
                    <>
                        <div className={"h-2 w-2 border border-black bg-white absolute -top-1 -left-1"}></div>
                        <div className={"h-2 w-2 border border-black bg-white absolute -top-1 -right-1"}></div>
                        <div className={"h-2 w-2 border border-black bg-white absolute -bottom-1 -left-1"}></div>
                        <div className={"h-2 w-2 border border-black bg-white absolute -bottom-1 -right-1"}></div>
                    </>
                );
                break;
            default:
                setModifierClass("");
                setSpecialElements(null);
                break;
        }
    }, [btnType, selectedTheme, modifierStyles.backgroundColor, url]);

    useEffect(() => {
        if (selectedTheme === "3D Blocks") {
            return;
        }

        function getShadow() {
            switch (btnType) {
                case 6:
                    return `4px 4px 0 0 ${hexToRgba(btnShadowColor)}`;
                case 7:
                    return `4px 4px 0 0 ${hexToRgba(btnShadowColor)}`;
                case 8:
                    return `4px 4px 0 0 ${hexToRgba(btnShadowColor)}`;
                case 9:
                    return `0 4px 4px 0 ${hexToRgba(btnShadowColor, 0.16)}`;
                case 10:
                    return `0 4px 4px 0 ${hexToRgba(btnShadowColor, 0.16)}`;
                case 11:
                    return `0 4px 4px 0 ${hexToRgba(btnShadowColor, 0.16)}`;

                default:
                    return '';
            }
        }

        const shadowStyle = getShadow();

        setModifierStyles((previewsStyles) => ({
            ...previewsStyles,
            boxShadow: shadowStyle,
        }));
    }, [btnShadowColor, btnType, selectedTheme]);

    useEffect(() => {
        if (selectedTheme === "3D Blocks") {
            return;
        }

        function getBtnColor() {
            switch (btnType) {
                case 12:
                    return ``;
                case 13:
                    return ``;

                default:
                    return `${btnColor}`;
            }
        }

        const backgroundStyle = getBtnColor();

        setModifierStyles((previewsStyles) => ({
            ...previewsStyles,
            backgroundColor: `${backgroundStyle}`,
        }));
    }, [btnColor, btnType, selectedTheme]);

    useEffect(() => {
        if (selectedTheme === "3D Blocks") {
            return;
        }

        function getBtnFontColor() {
            switch (btnType) {
                case 12:
                    return `#fff`;
                case 13:
                    return `#fff`;

                default:
                    return `${btnFontColor}`;
            }
        }

        const fontColorStyle = getBtnFontColor();

        setBtnFontStyle((previewsStyles) => ({
            ...previewsStyles,
            color: `${fontColorStyle}`,
        }));
    }, [btnFontColor, btnType, selectedTheme]);

    useEffect(() => {
        if (accentColor.length > 0) {
            setModifierStyles({
                backgroundColor: `${accentColor[0]}`,
                color: `${accentColor[1]}`
            });
        }
    }, [accentColor]);

    return (
        selectedTheme !== "New Mario" ? (
        <div
            className={`${modifierClass} userBtn relative justify-between items-center flex hover:scale-[1.025] md:w-[35rem] sm:w-[30rem] w-clamp`}
            style={{...modifierStyles, borderColor: selectedTheme === "Matrix" ? `${themeTextColour}` : ""}}
        >
            <Link
                className={`cursor-pointer flex gap-3 items-center min-h-10 py-3 px-3 flex-1`}
                href={makeValidUrl(url)}
                target="_blank"
                onClick={handleLinkClick}
            >
                {specialElements}
                <IconDiv url={url} />
                <ButtonText btnFontStyle={btnFontStyle} content={content} fontClass={selectedFontClass} />
            </Link>
            <div onClick={()=>handleCopy(url)} className="absolute p-2 h-9 right-3 grid place-items-center aspect-square rounded-full border border-white group cursor-pointer bg-black text-white hover:scale-105 active:scale-90">
                <FaCopy className="rotate-10 group-hover:rotate-0" />
            </div>

            {/* ✅ NEW: Optional referrer indicator (for debugging) */}
            {process.env.NODE_ENV === 'development' && sessionData && (
                <div className="absolute -top-8 left-0 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded opacity-75">
                    {sessionData.trafficSource.source}
                </div>
            )}
        </div>)
        :
        (
        <div className="userBtn relative overflow-x-hidden overflow-y-hidden flex justify-between items-center h-16 md:w-[35rem] sm:w-[30rem] w-clamp">
            {Array(9).fill("").map((_, brick_index) => (
                <Image
                    src={"https://linktree.sirv.com/Images/Scene/Mario/mario-brick.png"}
                    alt="Mario Brick"
                    width={650}
                    key={brick_index}
                    onClick={()=>urlRef.current?.click()}
                    onMouseEnter={()=>setIsHovered(true)}
                    onMouseLeave={()=>setIsHovered(false)}
                    height={660}
                    className="h-16 w-auto object-contain hover:-translate-y-2 cursor-pointer"
                />
            ))}
            <Link
                className={` absolute top-0 left-0 z-30 pointer-events-none cursor-pointer flex gap-3 items-center min-h-10 py-3 px-3 flex-1`}
                href={makeValidUrl(url)}
                target="_blank"
                ref={urlRef}
                onClick={handleLinkClick}
            >
                <div className="grid place-items-center">
                    <Image
                        src={"https://linktree.sirv.com/Images/Scene/Mario/mario-box.png"}
                        alt="Mario Box"
                        width={650}
                        height={660}
                                className={`h-12 w-auto object-contain hover:-translate-y-2 ${isHovered ? "rotate-2" : ""}`}
                    />

                    <div className={`${isHovered ? "rotate-2" : ""} absolute`}>
                        <IconDiv url={url} unique="Mario" />
                    </div>
                </div>
                {/* ✅ FIXED: Use selectedFontClass instead of hardcoded MariaFont */}
                <ButtonText btnFontStyle={btnFontStyle} content={(<SuperFont text={content} isHovered={isHovered} fontClass={selectedFontClass} />)} fontClass={selectedFontClass} />
            </Link>
            <div onClick={() => handleCopy(url)} className="absolute p-2 h-9 right-3 grid place-items-center aspect-square rounded-full border border-white group cursor-pointer bg-black text-white hover:scale-105 active:scale-90">
                <FaCopy className="rotate-10 group-hover:rotate-0" />
            </div>

            {/* ✅ NEW: Optional referrer indicator for Mario theme (for debugging) */}
            {process.env.NODE_ENV === 'development' && sessionData && (
                <div className="absolute -top-8 left-0 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded opacity-75 z-50">
                    {sessionData.trafficSource.source}
                </div>
            )}
        </div>
        )
    );
}

// ✅ FIXED: SuperFont now accepts fontClass prop
const SuperFont = ({ text, isHovered, fontClass }) => {
    const colors = ['#fff', '#fff', '#fff', '#fff', '#fff'];

    const coloredText = text.split('').map((char, index) => (
        <span className={`${fontClass} md:text-2xl sm:text-xl text-lg drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-transparent`} key={index} style={{ color: isHovered ? "#3b82f6" : colors[index % colors.length] }}>
            {char}
        </span>
    ));

    return <div>{coloredText}</div>;
};