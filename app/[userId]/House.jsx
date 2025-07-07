// app/[userId]/House.jsx - HYDRATION ERROR PREVENTION
"use client"
import FileDownloadButton from "./components/FileDownloadButton";
import ProfilePic from "./components/ProfilePic";
import UserInfo from "./components/UserInfo";
import BgDiv from "./components/BgDiv";
import MyLinks from "./components/MyLinks";
import SupportBanner from "./components/SupportBanner";
import ExchangeButton from "./components/ExchangeButton";
import React, { useEffect, useState } from "react";
import { fetchUserData } from "@/lib/fetch data/fetchUserData";
import { fastUserLookup } from "@/lib/userLookup";
import { fireApp } from "@/important/firebase";
import { collection, doc, getDoc } from "firebase/firestore";
import SensitiveWarning from "./components/SensitiveWarning";
import { LanguageProvider } from "@/lib/languageContext";
import PublicLanguageSwitcher from "./components/PublicLanguageSwitcher";
import { recordProfileView } from "@/lib/analytics/viewTracker";
import SaveContactButton from "./components/SaveContactButton";

export const HouseContext = React.createContext();

export default function House({ userId }) {
    const [sensitiveWarning, setSensitiveWarning] = useState(null);
    const [hasSensitiveContent, setHasSensitiveContent] = useState(false);
    const [sensitiveType, setSensitiveType] = useState(false);
    const [viewRecorded, setViewRecorded] = useState(false);
    const [username, setUsername] = useState("");
    const [isClient, setIsClient] = useState(false); // Client-side hydration check

    // Fast lookup state
    const [fastLookupUsed, setFastLookupUsed] = useState(false);
    const [userLookupData, setUserLookupData] = useState(null);

    // 🔧 Initialize preview mode safely to avoid hydration errors
    const [isPreviewMode, setIsPreviewMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const preview = urlParams.get('preview') === 'true';
            const suppressHydration = urlParams.get('suppress-hydration-warning') === 'true';
            
            // If we're suppressing hydration warnings, log it
            if (suppressHydration) {
                console.log('🔧 Hydration warning suppression enabled');
            }
            
            return preview;
        }
        return false;
    });

    // 🔧 Client-side hydration detection
    useEffect(() => {
        setIsClient(true);
        
        // Double-check preview mode after hydration
        const urlParams = new URLSearchParams(window.location.search);
        const preview = urlParams.get('preview') === 'true';
        
        if (preview !== isPreviewMode) {
            console.log('🔧 Correcting preview mode after hydration:', preview);
            setIsPreviewMode(preview);
        }
        
        console.log('🔧 Client-side hydration complete');
        console.log('🔍 House: Preview mode detected:', preview);
        console.log('🔍 House: Full URL:', window.location.href);
        console.log('🔍 House: userId param:', userId);
    }, []);

    // Enhanced fetchUserData function that tries fast lookup first
    const enhancedFetchUserData = async (inputUserId) => {
        console.log('🚀 Enhanced fetchUserData called with:', inputUserId);
        console.log('🔍 Preview mode:', isPreviewMode);
        console.log('🔍 Is client:', isClient);
        
        try {
            // Try fast lookup first
            const lookupResult = await fastUserLookup(inputUserId);
            
            if (lookupResult && lookupResult.userId) {
                console.log('✅ Fast lookup successful:', lookupResult.userId);
                setFastLookupUsed(true);
                setUserLookupData(lookupResult);
                return lookupResult.userId;
            } else {
                console.log('🔄 Fast lookup failed, using fallback...');
                setFastLookupUsed(false);
                return await fetchUserData(inputUserId);
            }
        } catch (error) {
            console.error('❌ Error in enhanced fetch, using fallback:', error);
            setFastLookupUsed(false);
            return await fetchUserData(inputUserId);
        }
    };

    // Keep the original useEffect structure but use enhanced fetch
    useEffect(() => {
        // Only run after client-side hydration to prevent hydration mismatch
        if (!isClient) {
            console.log('🔧 Waiting for client-side hydration...');
            return;
        }

        async function fetchProfilePicture() {
            try {
                console.log('📊 Starting profile fetch for:', userId);
                console.log('🔍 Is preview mode:', isPreviewMode);
                console.log('🔍 Client hydrated:', isClient);
                
                const currentUser = await enhancedFetchUserData(userId);
                console.log('✅ Got currentUser:', currentUser);
                
                if (!currentUser) {
                    console.error('❌ No current user found');
                    return;
                }

                const collectionRef = collection(fireApp, "AccountData");
                const docRef = doc(collectionRef, `${currentUser}`);
                
                console.log('🔍 Fetching from Firestore document:', currentUser);
                const getDocRef = await getDoc(docRef);

                if (getDocRef.exists()) {
                    const data = getDocRef.data();
                    console.log('✅ Document data retrieved - preview mode:', isPreviewMode);
                    
                    const { sensitiveStatus, sensitivetype, username: profileUsername } = data;
                    
                    setSensitiveWarning(sensitiveStatus ? sensitiveStatus : false);
                    setHasSensitiveContent(sensitiveStatus ? sensitiveStatus : false);
                    setSensitiveType(sensitivetype ? sensitivetype : 3);
                    
                    // Use the best available username
                    const finalUsername = userLookupData?.username || 
                                        profileUsername || 
                                        userLookupData?.displayName || 
                                        userId;
                    
                    setUsername(finalUsername);
                    
                    console.log('✅ Profile data loaded successfully:', {
                        username: finalUsername,
                        fastLookupUsed: fastLookupUsed,
                        isPreview: isPreviewMode,
                        clientHydrated: isClient
                    });
                } else {
                    console.error('❌ Profile document does not exist for:', currentUser);
                    
                    // 🔧 In preview mode, show a helpful error
                    if (isPreviewMode) {
                        console.warn('⚠️ Preview mode: Document not found, this might be normal for new users');
                    }
                }
            } catch (error) {
                console.error('❌ Error in fetchProfilePicture:', error);
                
                // 🔧 Enhanced error logging for preview mode
                if (isPreviewMode) {
                    console.error('❌ Preview mode error details:', {
                        message: error.message,
                        stack: error.stack,
                        userId: userId,
                        clientHydrated: isClient
                    });
                }
            }
        }
        
        fetchProfilePicture();
    }, [userId, isClient]); // Wait for client hydration

    // Record profile view - but NOT in preview mode and only after client hydration
    useEffect(() => {
        async function recordView() {
            // 🔧 Skip if not client-side hydrated yet
            if (!isClient) {
                return;
            }

            // 🔧 IMPORTANT: Skip analytics in preview mode
            if (isPreviewMode) {
                console.log('🔍 Skipping view recording - preview mode active');
                return;
            }
            
            if (!viewRecorded && userId) {
                try {
                    console.log('📈 Recording profile view with fast lookup data');
                    
                    // Get some basic viewer info (without compromising privacy)
                    const viewerInfo = {
                        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
                        referrer: typeof window !== 'undefined' ? document.referrer : '',
                        recordDetailed: false,
                        fastLookupUsed: fastLookupUsed,
                        viewedUsername: userLookupData?.username || userId,
                        viewedDisplayName: userLookupData?.displayName,
                        clientHydrated: isClient
                    };

                    await recordProfileView(userId, viewerInfo);
                    setViewRecorded(true);
                    console.log('✅ Profile view recorded successfully');
                } catch (error) {
                    console.error("❌ Failed to record view:", error);
                }
            }
        }

        // Record view after a short delay to ensure it's a real view
        const timer = setTimeout(recordView, 2000);
        
        return () => clearTimeout(timer);
    }, [userId, viewRecorded, fastLookupUsed, userLookupData, isPreviewMode, isClient]);

    // 🔧 Show loading state until client hydration is complete
    if (!isClient) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <LanguageProvider>
            <PublicLanguageSwitcher />
            
       
            
            <HouseContext.Provider value={{ 
                setSensitiveWarning, 
                sensitiveType,
                userInfo: userLookupData,
                fastLookupUsed,
                isPreviewMode,
                isClient // 🔧 Add client state to context
            }}>
                {!sensitiveWarning ? (
                    <>
                        <BgDiv userId={userId} />

                        <div className="relative z-20 md:w-[50rem] w-full flex flex-col items-center h-full mx-auto" suppressHydrationWarning={isPreviewMode}>
                            <div className="flex flex-col items-center flex-1 overflow-auto py-6">
                                <ProfilePic userId={userId} />
                                <UserInfo userId={userId} hasSensitiveContent={hasSensitiveContent} />
                                <FileDownloadButton userId={userId} />
                                <MyLinks userId={userId} hasSensitiveContent={hasSensitiveContent} />
                                
                                {/* File Download Button - Only shows if user has uploaded a file 
                                <FileDownloadButton userId={userId} />*/}
                                
                                {/* 🔥 COMBINED BUTTONS SECTION - Only show after client hydration */}
{/* 🔥 COMBINED BUTTONS SECTION - Only show after client hydration */}
{/* 🔥 COMBINED BUTTONS SECTION - Now properly centered and matching link width */}
{isClient && (
    <div className="w-full px-5 mb-4">
        <div className="md:w-[35rem] sm:w-[30rem] w-full max-w-[calc(100vw-2.5rem)] mx-auto">
            <div className="flex gap-3">
                {/* Exchange Button - Left Side */}
                <div className="flex-1">
                    <ExchangeButton 
                        username={username} 
                        userInfo={userLookupData}
                        fastLookupUsed={fastLookupUsed}
                        userId={userId}
                    />
                </div>
                
                {/* Save Contact Button - Right Side */}
                <div className="flex-1">
                    <SaveContactButton userId={userId} />
                </div>
            </div>
        </div>
    </div>
)}
                            </div>
                        </div>
                        <SupportBanner userId={userId} />
                    </>
                ) : (
                    <SensitiveWarning />
                )}
            </HouseContext.Provider>
        </LanguageProvider>
    );
}