// app/[userId]/components/FileDownloadButton.jsx - ENHANCED WITH REFERRER TRACKING
"use client"
import { fireApp } from "@/important/firebase";
import { fetchUserData } from "@/lib/fetch data/fetchUserData";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/useTranslation";
import { FaDownload, FaFileAlt } from "react-icons/fa6";
import { recordLinkClick, SessionManager } from "@/lib/analytics/linkClickTracker";
import { hexToRgba } from "@/lib/utilities";
import { availableFonts_Classic } from "@/lib/FontsList";
import Image from "next/image";

export default function FileDownloadButton({ userId }) {
    const { t } = useTranslation();
    const [profileFile, setProfileFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [sessionData, setSessionData] = useState(null); // ✅ NEW: Track session data
    
    // Theme state - COMPLETE THEME SUPPORT like Button.jsx
    const [btnType, setBtnType] = useState(0);
    const [btnShadowColor, setBtnShadowColor] = useState('');
    const [btnFontColor, setBtnFontColor] = useState('');
    const [btnColor, setBtnColor] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('');
    const [themeTextColour, setThemeTextColour] = useState("");
    const [selectedFontClass, setSelectedFontClass] = useState(""); // ✅ Add font support
    const [isHovered, setIsHovered] = useState(false);

    // ✅ NEW: Initialize session tracking on component mount
    useEffect(() => {
        // Get or create session data when component mounts
        const session = SessionManager.getOrCreateSession();
        setSessionData(session);
        
        console.log("🎯 Session initialized for FileDownloadButton:", session);
    }, []);

    // Get file icon based on file type
    const getFileIcon = (fileName) => {
        const extension = fileName?.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'xls':
            case 'xlsx':
                return '📊';
            case 'ppt':
            case 'pptx':
                return '📽️';
            case 'txt':
                return '📃';
            default:
                return '📎';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // ✅ COMPLETE BUTTON STYLING - SAME AS Button.jsx
    const getButtonClasses = () => {
        let baseClasses = "userBtn relative justify-between items-center flex hover:scale-[1.025] md:w-[35rem] sm:w-[30rem] w-clamp";
        
        if (selectedTheme === "3D Blocks") {
            return `${baseClasses} relative after:absolute after:h-2 after:w-[100.5%] after:bg-black bg-white after:-bottom-2 after:left-[1px] after:skew-x-[57deg] after:ml-[2px] before:absolute before:h-[107%] before:w-3 before:bg-[currentColor] before:top-[1px] before:border-2 before:border-black before:-right-3 before:skew-y-[30deg] before:grid before:grid-rows-2 border-2 border-black inset-2 ml-[-20px] btn`;
        }
        
        if (selectedTheme === "New Mario") {
            return "userBtn relative overflow-x-hidden overflow-y-hidden flex justify-between items-center h-16 md:w-[35rem] sm:w-[30rem] w-clamp";
        }
        
        switch (btnType) {
            case 0: 
                return `${baseClasses}`;
            case 1: 
                return `${baseClasses} rounded-lg`;
            case 2: 
                return `${baseClasses} rounded-3xl`;
            case 3: 
                return `${baseClasses} border border-black bg-opacity-0`;
            case 4: 
                return `${baseClasses} border border-black rounded-lg bg-opacity-0`;
            case 5: 
                return `${baseClasses} border border-black rounded-3xl bg-opacity-0`;
            case 6: 
                return `${baseClasses} bg-white border border-black`;
            case 7: 
                return `${baseClasses} bg-white border border-black rounded-lg`;
            case 8: 
                return `${baseClasses} bg-white border border-black rounded-3xl`;
            case 9: 
                return `${baseClasses} bg-white`;
            case 10: 
                return `${baseClasses} bg-white rounded-lg`;
            case 11: 
                return `${baseClasses} bg-white rounded-3xl`;
            case 12:
                return `${baseClasses} relative border border-black bg-black`;
            case 13:
                return `${baseClasses} relative border border-black bg-black`;
            case 14:
                return `${baseClasses} border border-black relative after:-translate-y-1/2 after:-translate-x-1/2 after:top-1/2 after:left-1/2 after:h-[88%] after:w-[104%] after:absolute after:border after:border-black after:mix-blend-difference`;
            case 15: 
                return `${baseClasses} border border-black bg-black rounded-3xl`;
            case 16:
                return `${baseClasses} relative border border-black bg-black`;
            default:
                return baseClasses;
        }
    };

    // ✅ COMPLETE BUTTON STYLING - SAME AS Button.jsx
    const getButtonStyles = () => {
        if (selectedTheme === "3D Blocks") {
            return {
                color: "#fff",
                backgroundColor: "#3B82F6" // Blue color for file download button
            };
        }
        
        if (selectedTheme === "New Mario") {
            return {
                color: "#fff",
                backgroundColor: "transparent",
                backgroundImage: `url('https://linktree.sirv.com/Images/Scene/Mario/mario-brick.png')`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center"
            };
        }
        
        let styles = {
            color: btnFontColor || "#000",
            backgroundColor: btnColor || "#fff"
        };

        switch (btnType) {
            case 6:
            case 7:
            case 8:
                styles.boxShadow = `4px 4px 0 0 ${hexToRgba(btnShadowColor)}`;
                break;
            case 9:
            case 10:
            case 11:
                styles.boxShadow = `0 4px 4px 0 ${hexToRgba(btnShadowColor, 0.16)}`;
                break;
            case 12:
            case 13:
            case 15:
            case 16:
                styles.color = "#fff";
                styles.backgroundColor = btnColor || "#000";
                break;
        }

        // Matrix theme override
        if (selectedTheme === "Matrix") {
            styles.borderColor = themeTextColour;
        }

        return styles;
    };

    // ✅ GET SPECIAL ELEMENTS - SAME AS Button.jsx
    const getSpecialElements = () => {
        switch (btnType) {
            case 12:
                return (
                    <>
                        <span className="w-full absolute left-0 bottom-0 translate-y-[6px]">
                            <Image src={"https://linktree.sirv.com/Images/svg%20element/torn.svg"} alt="ele" width={1000} height={100} priority className="w-full scale-[-1]" />
                        </span>
                        <span className="w-full absolute left-0 top-0 -translate-y-[6px]">
                            <Image src={"https://linktree.sirv.com/Images/svg%20element/torn.svg"} alt="ele" width={1000} height={1000} priority className="w-full" />
                        </span>
                    </>
                );
            case 13:
                return (
                    <>
                        <span className="w-full absolute left-0 bottom-0 translate-y-[4px]">
                            <Image src={"https://linktree.sirv.com/Images/svg%20element/jiggy.svg"} alt="ele" width={1000} height={8} priority className="w-full" />
                        </span>
                        <span className="w-full absolute left-0 top-0 -translate-y-[3px]">
                            <Image src={"https://linktree.sirv.com/Images/svg%20element/jiggy.svg"} alt="ele" width={1000} height={8} priority className="w-full scale-[-1]" />
                        </span>
                    </>
                );
            case 16:
                return (
                    <>
                        <div className={"h-2 w-2 border border-black bg-white absolute -top-1 -left-1"}></div>
                        <div className={"h-2 w-2 border border-black bg-white absolute -top-1 -right-1"}></div>
                        <div className={"h-2 w-2 border border-black bg-white absolute -bottom-1 -left-1"}></div>
                        <div className={"h-2 w-2 border border-black bg-white absolute -bottom-1 -right-1"}></div>
                    </>
                );
            default:
                return null;
        }
    };

    // ✅ GET FONT STYLE - SAME AS Button.jsx
    const getFontStyle = () => {
        if (selectedTheme === "3D Blocks") {
            return { color: "#fff" };
        }
        
        if (selectedTheme === "New Mario") {
            return { color: "#fff" };
        }
        
        switch (btnType) {
            case 12:
            case 13:
            case 15:
            case 16:
                return { color: "#fff" };
            default:
                return { color: btnFontColor || "#000" };
        }
    };

    // ✅ ENHANCED: File download handler with referrer tracking
    const handleDownload = async () => {
        if (!profileFile?.url) return;

        try {
            // Track the file download as a link click with referrer data
            if (username) {
                // Get current session data
                const currentSession = SessionManager.getOrCreateSession();
                
                await recordLinkClick(username, {
                    linkId: `file_download_${profileFile.name}`,
                    linkTitle: `Download ${profileFile.name}`,
                    linkUrl: profileFile.url,
                    linkType: "file_download"
                }, {
                    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
                    referrer: typeof window !== 'undefined' ? document.referrer : '',
                    recordDetailed: true, // ✅ ENHANCED: Enable detailed logging with referrer data
                    // ✅ NEW: Include current page info
                    currentUrl: typeof window !== 'undefined' ? window.location.href : '',
                    timestamp: new Date().toISOString(),
                    fileSize: profileFile.size,
                    fileType: profileFile.name?.split('.').pop()?.toLowerCase()
                });

                console.log("✅ File download tracked with referrer data:", profileFile.name);
                console.log("🎯 Traffic source:", currentSession?.trafficSource);
            }

            // Open file in new tab for download
            window.open(profileFile.url, '_blank');
        } catch (error) {
            console.error('❌ Failed to track file download:', error);
            // Still allow the download even if tracking fails
            window.open(profileFile.url, '_blank');
        }
    };

    useEffect(() => {
        async function fetchThemeAndFileData() {
            try {
                const currentUser = await fetchUserData(userId);
                if (!currentUser) {
                    setIsLoading(false);
                    return;
                }

                // Get username for analytics
                setUsername(currentUser.username || userId);

                const collectionRef = collection(fireApp, "AccountData");
                const docRef = doc(collectionRef, currentUser);

                const unsubscribe = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        
                        // Set theme data - COMPLETE THEME SUPPORT
                        setBtnType(data.btnType || 0);
                        setBtnShadowColor(data.btnShadowColor || "#000");
                        setBtnFontColor(data.btnFontColor || "#000");
                        setBtnColor(data.btnColor || "#fff");
                        setSelectedTheme(data.selectedTheme || '');
                        setThemeTextColour(data.themeFontColor || "");
                        
                        // ✅ Set font class - SAME AS Button.jsx
                        const fontName = availableFonts_Classic[data.fontType ? data.fontType - 1 : 0];
                        setSelectedFontClass(fontName?.class || '');
                        
                        // Set file data
                        setProfileFile(data.profileFile || null);
                    } else {
                        setProfileFile(null);
                    }
                    setIsLoading(false);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error("Error fetching profile file:", error);
                setIsLoading(false);
            }
        }

        fetchThemeAndFileData();
    }, [userId]);

    // Don't render anything if no file or still loading
    if (isLoading || !profileFile) {
        return null;
    }

    const specialElements = getSpecialElements();
    const fontStyle = getFontStyle();

    // ✅ MARIO THEME RENDERING - SAME AS Button.jsx
    if (selectedTheme === "New Mario") {
        return (
            <div className="w-full px-5 mb-4">
                <div className="md:w-[35rem] sm:w-[30rem] w-full max-w-[calc(100vw-2.5rem)] mx-auto">
                    <div className={getButtonClasses()}>
                        {Array(9).fill("").map((_, brick_index) => (
                            <Image
                                key={brick_index}
                                src={"https://linktree.sirv.com/Images/Scene/Mario/mario-brick.png"}
                                alt="Mario Brick"
                                width={650}
                                height={660}
                                onClick={handleDownload}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                className="h-16 w-auto object-contain hover:-translate-y-2 cursor-pointer"
                            />
                        ))}
                        
                        <div className="absolute top-0 left-0 z-30 pointer-events-none cursor-pointer flex gap-3 items-center min-h-10 py-3 px-3 flex-1">
                            <div className="grid place-items-center">
                                <Image
                                    src={"https://linktree.sirv.com/Images/Scene/Mario/mario-box.png"}
                                    alt="Mario Box"
                                    width={650}
                                    height={660}
                                    className={`h-12 w-auto object-contain hover:-translate-y-2 ${isHovered ? "rotate-2" : ""}`}
                                />
                                <div className={`${isHovered ? "rotate-2" : ""} absolute text-2xl`}>
                                    {getFileIcon(profileFile.name)}
                                </div>
                            </div>
                            
                            <div className="flex-1" style={fontStyle}>
                                <div className={`${selectedFontClass} md:text-2xl sm:text-xl text-lg drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-transparent ${isHovered ? "text-blue-500" : "text-white"}`}>
                                    <div className="flex items-center gap-2">
                                        <FaDownload className="w-4 h-4" />
                                        <span className="text-sm font-semibold">
                                            {t('file_download.download_file') || 'Download File'}
                                        </span>
                                    </div>
                                    <div className="text-xs opacity-90 truncate">
                                        {profileFile.name} • {formatFileSize(profileFile.size)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Copy button */}
                        <div onClick={() => navigator.clipboard.writeText(profileFile.url)} className="absolute p-2 h-9 right-3 grid place-items-center aspect-square rounded-full border border-white group cursor-pointer bg-black text-white hover:scale-105 active:scale-90">
                            <FaDownload className="rotate-10 group-hover:rotate-0" />
                        </div>

                        {/* ✅ NEW: Optional referrer indicator for Mario theme (for debugging) */}
                        {process.env.NODE_ENV === 'development' && sessionData && (
                            <div className="absolute -top-8 left-0 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded opacity-75 z-50">
                                📁 {sessionData.trafficSource.source}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ✅ STANDARD THEMES RENDERING - SAME AS Button.jsx
    return (
        <div className="w-full px-5 mb-4">
            <div className="md:w-[35rem] sm:w-[30rem] w-full max-w-[calc(100vw-2.5rem)] mx-auto">
                <div
                    className={getButtonClasses()}
                    style={{...getButtonStyles(), borderColor: selectedTheme === "Matrix" ? `${themeTextColour}` : ""}}
                >
                    <div
                        className="cursor-pointer flex gap-3 items-center min-h-10 py-3 px-3 flex-1"
                        onClick={handleDownload}
                    >
                        {specialElements}
                        
                        {/* File icon - same as IconDiv but for files */}
                        <div className="h-[2rem] w-fit rounded-lg p-[2px] bg-white aspect-square">
                            <div className="h-full w-full flex items-center justify-center text-xl">
                                {getFileIcon(profileFile.name)}
                            </div>
                        </div>
                        
                        {/* File details - same structure as ButtonText with font support */}
                        <div className={`${selectedFontClass} flex-1`} style={fontStyle}>
                            <div className="flex items-center gap-2">
                                <FaDownload className="w-4 h-4" />
                                <span className="font-semibold truncate max-w-[90%]">
                                    {t('file_download.download_file') || 'Download File'}
                                </span>
                            </div>
                            <div className="text-xs opacity-90 truncate">
                                {profileFile.name} • {formatFileSize(profileFile.size)}
                            </div>
                        </div>
                    </div>
                    
                    {/* Copy button - same as Button.jsx */}
                    <div onClick={() => navigator.clipboard.writeText(profileFile.url)} className="absolute p-2 h-9 right-3 grid place-items-center aspect-square rounded-full border border-white group cursor-pointer bg-black text-white hover:scale-105 active:scale-90">
                        <FaDownload className="rotate-10 group-hover:rotate-0" />
                    </div>

                    {/* ✅ NEW: Optional referrer indicator (for debugging) */}
                    {process.env.NODE_ENV === 'development' && sessionData && (
                        <div className="absolute -top-8 left-0 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded opacity-75">
                            📁 {sessionData.trafficSource.source}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}