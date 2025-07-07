// app/[userId]/components/SaveContactButton.jsx - COMPLETE THEME AND FONT SUPPORT
"use client"
import { useState, useEffect } from 'react';
import { fireApp } from "@/important/firebase";
import { fetchUserData } from "@/lib/fetch data/fetchUserData";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useTranslation } from "@/lib/useTranslation";
import { FaAddressCard, FaDownload } from "react-icons/fa6";
import { toast } from 'react-hot-toast';
import { hexToRgba } from "@/lib/utilities";
import { availableFonts_Classic } from "@/lib/FontsList";
import Image from "next/image";

export default function SaveContactButton({ userId }) {
    const { t } = useTranslation();
    const [contactData, setContactData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Theme state - COMPLETE THEME SUPPORT like Button.jsx
    const [btnType, setBtnType] = useState(0);
    const [btnShadowColor, setBtnShadowColor] = useState('');
    const [btnFontColor, setBtnFontColor] = useState('');
    const [btnColor, setBtnColor] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('');
    const [themeTextColour, setThemeTextColour] = useState("");
    const [selectedFontClass, setSelectedFontClass] = useState(""); // ✅ Add font support
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        async function fetchThemeData() {
            try {
                const currentUser = await fetchUserData(userId);
                if (!currentUser) return;

                const collectionRef = collection(fireApp, "AccountData");
                const docRef = doc(collectionRef, currentUser);

                const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        
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
                        
                        // Set contact data
                        const contact = {
                            displayName: data.displayName || '',
                            email: data.email || '',
                            phone: data.phone || '',
                            website: data.website || '',
                            company: data.company || '',
                            profilePhoto: data.profilePhoto || '',
                            bio: data.bio || ''
                        };
                        
                        const hasData = contact.displayName || contact.email || contact.phone || contact.website;
                        if (hasData) {
                            setContactData(contact);
                        } else {
                            setContactData(null);
                        }
                    } else {
                        setContactData(null);
                    }
                    setIsLoading(false);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error("Error fetching data:", error);
                setIsLoading(false);
            }
        }

        fetchThemeData();
    }, [userId]);

    // ✅ COMPLETE BUTTON STYLING - SAME AS Button.jsx
    const getButtonClasses = () => {
        let baseClasses = "userBtn relative justify-between items-center flex hover:scale-[1.025] w-full";
        
        if (selectedTheme === "3D Blocks") {
            return `${baseClasses} relative after:absolute after:h-2 after:w-[100.5%] after:bg-black bg-white after:-bottom-2 after:left-[1px] after:skew-x-[57deg] after:ml-[2px] before:absolute before:h-[107%] before:w-3 before:bg-[currentColor] before:top-[1px] before:border-2 before:border-black before:-right-3 before:skew-y-[30deg] before:grid before:grid-rows-2 border-2 border-black inset-2 ml-[-20px] btn`;
        }
        
        if (selectedTheme === "New Mario") {
            return "userBtn relative overflow-x-hidden overflow-y-hidden flex justify-between items-center h-16 w-full";
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
                backgroundColor: "#10B981" // Green color for save button
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

    const generateVCard = () => {
        if (!contactData) return '';

        const escapeVCardValue = (value) => {
            if (!value) return '';
            return value
                .replace(/\\/g, '\\\\')
                .replace(/,/g, '\\,')
                .replace(/;/g, '\\;')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '');
        };

        let vcard = 'BEGIN:VCARD\r\nVERSION:3.0\r\n';
        
        if (contactData.displayName) {
            const name = escapeVCardValue(contactData.displayName);
            vcard += `FN:${name}\r\n`;
            vcard += `N:${name};;;;\r\n`;
        }
        
        if (contactData.email) {
            vcard += `EMAIL:${escapeVCardValue(contactData.email)}\r\n`;
        }
        
        if (contactData.phone) {
            vcard += `TEL:${escapeVCardValue(contactData.phone)}\r\n`;
        }
        
        if (contactData.website) {
            const websiteUrl = contactData.website.startsWith('http') 
                ? contactData.website 
                : `https://${contactData.website}`;
            vcard += `URL:${escapeVCardValue(websiteUrl)}\r\n`;
        }
        
        if (contactData.company) {
            vcard += `ORG:${escapeVCardValue(contactData.company)}\r\n`;
        }
        
        if (contactData.bio) {
            vcard += `NOTE:${escapeVCardValue(contactData.bio)}\r\n`;
        }
        
        if (contactData.profilePhoto && contactData.profilePhoto.startsWith('http')) {
            vcard += `PHOTO:${contactData.profilePhoto}\r\n`;
        }
        
        vcard += 'END:VCARD';
        return vcard;
    };

    const handleDirectSave = () => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        try {
            const vCardContent = generateVCard();
            
            if (isMobile) {
                const dataURL = `data:text/vcard;charset=utf-8,${encodeURIComponent(vCardContent)}`;
                
                const link = document.createElement('a');
                link.href = dataURL;
                link.download = `${contactData.displayName || 'contact'}.vcf`;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                
                if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                    window.open(dataURL, '_blank');
                } else {
                    link.click();
                }
                
                document.body.removeChild(link);
                
                toast.success(t('save_contact.open_contacts_app') || '📱 Open with Contacts app!', {
                    duration: 4000
                });
                
            } else {
                const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `${contactData.displayName || 'contact'}.vcf`;
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                setTimeout(() => URL.revokeObjectURL(url), 100);
                
                toast.success(t('save_contact.file_downloaded') || '📥 File downloaded!', {
                    duration: 4000
                });
            }
            
        } catch (error) {
            console.error('Save error:', error);
            toast.error(t('save_contact.failed_save') || 'Failed to save contact');
        }
    };

    if (isLoading || !contactData) {
        return null;
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const specialElements = getSpecialElements();
    const fontStyle = getFontStyle();

    return (
        <div className="relative">
            {/* ✅ MARIO THEME RENDERING - SAME AS Button.jsx */}
            {selectedTheme === "New Mario" ? (
                <div className={getButtonClasses()}>         
                    {/* Mario brick background - 4 bricks for side-by-side buttons */}
                    {Array(4).fill("").map((_, brick_index) => (
                        <Image
                            key={brick_index}
                            src="https://linktree.sirv.com/Images/Scene/Mario/mario-brick.png"
                            alt="Mario Brick"
                            width={650}
                            height={660}
                            onClick={handleDirectSave}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="h-16 w-1/4 object-cover hover:-translate-y-2 cursor-pointer transition-transform"
                        />
                    ))}
                    
                    {/* Mario box with icon */}
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-30">
                        <div className="relative">
                            <Image
                                src="https://linktree.sirv.com/Images/Scene/Mario/mario-box.png"
                                alt="Mario Box"
                                width={650}
                                height={660}
                                className={`h-12 w-auto object-contain hover:-translate-y-2 hover:rotate-2 transition-all cursor-pointer ${isHovered ? "rotate-2" : ""}`}
                                onClick={handleDirectSave}
                            />
                            {/* Save icon inside the box */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FaAddressCard className="w-6 h-6 text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Button text overlay */}
                    <div 
                        className="absolute top-0 left-0 z-20 w-full h-full flex items-center justify-center cursor-pointer"
                        onClick={handleDirectSave}
                        style={{ 
                            paddingLeft: '4rem' // Space for the box
                        }}
                    >
                        {/* ✅ FIXED: Use selectedFontClass and proper styling */}
                        <div className={`${selectedFontClass}`} style={fontStyle}>
                            {/* Desktop text */}
                            <span className={`hidden md:block md:text-2xl sm:text-xl text-lg drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] font-semibold ${isHovered ? "text-blue-500" : "text-white"}`}>
                                {isMobile ? t('save_contact.save_contact') || 'Save Contact' : t('save_contact.download_contact') || 'Download Contact'}
                            </span>
                            
                            {/* Mobile text (shorter) */}
                            <span className={`block md:hidden text-sm drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] font-semibold ${isHovered ? "text-blue-500" : "text-white"}`}>
                                {t('save_contact.button_text') || 'Save'}
                            </span>
                        </div>
                    </div>
                </div>
            ) : selectedTheme === "3D Blocks" ? (
                <div className="userBtn relative justify-between items-center flex hover:scale-[1.025] w-full">
                    <div
                        onClick={handleDirectSave}
                        className={getButtonClasses()}
                        style={{...getButtonStyles(), borderColor: selectedTheme === "Matrix" ? `${themeTextColour}` : ""}}
                    >
                        <div className="cursor-pointer flex gap-3 items-center min-h-10 py-3 px-3 flex-1">
                            {specialElements}
                            
                            <FaAddressCard className="w-5 h-5 flex-shrink-0" />
                            
                            {/* ✅ FIXED: Use selectedFontClass and fontStyle */}
                            <div className={`${selectedFontClass} font-semibold truncate max-w-[90%] flex-1`} style={fontStyle}>
                                {/* Desktop text */}
                                <span className="hidden md:block">
                                    {isMobile ? t('save_contact.save_contact') || 'Save Contact' : t('save_contact.download_contact') || 'Download Contact'}
                                </span>
                                
                                {/* Mobile text (shorter) */}
                                <span className="block md:hidden text-sm">
                                    {t('save_contact.button_text') || 'Save'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className={getButtonClasses()}
                    style={{...getButtonStyles(), borderColor: selectedTheme === "Matrix" ? `${themeTextColour}` : ""}}
                >
                    <div
                        onClick={handleDirectSave}
                        className="cursor-pointer flex gap-3 items-center min-h-10 py-3 px-3 flex-1"
                    >
                        {specialElements}
                        
                        <FaAddressCard className="w-5 h-5 flex-shrink-0" />
                        
                        {/* ✅ FIXED: Use selectedFontClass and fontStyle */}
                        <div className={`${selectedFontClass} font-semibold truncate max-w-[90%] flex-1`} style={fontStyle}>
                            {/* Desktop text */}
                            <span className="hidden md:block">
                                {isMobile ? t('save_contact.save_contact') || 'Save Contact' : t('save_contact.download_contact') || 'Download Contact'}
                            </span>
                            
                            {/* Mobile text (shorter) */}
                            <span className="block md:hidden text-sm">
                                {t('save_contact.button_text') || 'Save'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}