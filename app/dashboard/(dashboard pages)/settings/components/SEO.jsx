// app/dashboard/(dashboard pages)/seo/elements/SEO.jsx - FIXED for Firebase Auth
"use client"

import { useDebounce } from "@/LocalHooks/useDebounce";
import { fireApp } from "@/important/firebase";
import { updateCustomMetaData } from "@/lib/update data/updateSocials";
import { collection, doc, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/useTranslation";
import { useAuth } from "@/contexts/AuthContext"; // ✅ 1. Import the new Auth Context

export default function SEO() {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth(); // ✅ 2. Use the new Auth hook

    const [metaTitle, setMetaTitle] = useState(""); // Initialize as empty string
    const [metaDescription, setMetaDescription] = useState(""); // Initialize as empty string
    
    // States to prevent premature updates
    const [hasDataLoaded, setHasDataLoaded] = useState(false);
    
    const debounceMetaTitle = useDebounce(metaTitle, 500);
    const debounceMetaDescription = useDebounce(metaDescription, 500);

    // ✅ 3. Updated data-updating useEffect
    useEffect(() => {
        // Prevent updates on initial load or if not authenticated
        if (!hasDataLoaded || authLoading || !user) {
            return;
        }

        console.log("📝 SEO: Updating metadata...");
        updateCustomMetaData({
            title: debounceMetaTitle,
            description: debounceMetaDescription,
        }); // 🔧 NOTE: updateCustomMetaData itself needs to be updated to use the authenticated user

    }, [debounceMetaTitle, debounceMetaDescription, hasDataLoaded, authLoading, user]);

    // ✅ 4. Updated data-fetching useEffect
    useEffect(() => {
        // Don't run if auth is loading or user is not logged in
        if (authLoading || !user) {
            return;
        }

        console.log("🔍 SEO: Setting up metadata listener for user:", user.uid);
        const collectionRef = collection(fireApp, "AccountData");
        const docRef = doc(collectionRef, user.uid); // ✅ Use Firebase UID

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const { metaData } = docSnap.data();
                console.log("📄 SEO: Metadata received:", metaData);
                
                // Only update state if the data is different to avoid loops
                if (metaData) {
                    if (metaData.title !== metaTitle) setMetaTitle(metaData.title || "");
                    if (metaData.description !== metaDescription) setMetaDescription(metaData.description || "");
                }
            } else {
                console.warn("⚠️ SEO: No document found for user.");
            }
            // Mark data as loaded after the first fetch attempt
            setHasDataLoaded(true);
        }, (error) => {
            console.error("❌ SEO: Listener error:", error);
            setHasDataLoaded(true); // Mark as loaded even on error to unblock UI
        });

        // Cleanup function
        return () => {
            console.log("🧹 SEO: Cleaning up listener.");
            unsubscribe();
        };

    }, [authLoading, user]); // Dependencies on auth state

    // ✅ 5. Add a loading state skeleton
    if (authLoading) {
        return (
            <div className="w-full my-4 px-2 animate-pulse" id="Settings--SEO">
                <div className="h-8 bg-gray-200 rounded-md w-1/3 mb-4"></div>
                <div className="p-5 bg-white rounded-lg">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="grid gap-3">
                        <div className="h-12 bg-gray-100 rounded-lg"></div>
                        <div className="h-12 bg-gray-100 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full my-4 px-2" id="Settings--SEO">
            {/* ... (rest of your JSX is fine and does not need changes) ... */}
            <div className="flex items-center gap-3 py-4">
                <Image
                    src={"https://linktree.sirv.com/Images/icons/seo.svg"}
                    alt="icon"
                    height={24}
                    width={24}
                />
                <span className="text-xl font-semibold">{t('seo.title')}</span>
            </div>
            <div className="p-5 bg-white rounded-lg">
                <p className="font-semibold">{t('seo.custom_metadata')}</p>
                <p className="opacity-60 sm:text-base text-sm">{t('seo.metadata_notice')}</p>

                <div className="my-3 grid gap-3">
                    <div className="rounded-[10px] relative focus-within:ring-2 focus-within:ring-black transition duration-75 ease-out hover:shadow-[inset_0_0_0_2px_#e0e2d9] hover:focus-within:shadow-none bg-black bg-opacity-[0.025]">
                        <div className="flex rounded-[10px] leading-[48px] border-solid border-2 border-transparent">
                            <div className="flex w-full items-center bg-chalk rounded-sm px-3">
                                <div className="relative grow">
                                    <input
                                        placeholder={t('seo.meta_title')}
                                        className="placeholder-transparent font-semibold peer px-0 sm:text-base text-sm leading-[48px] placeholder:leading-[48px] rounded-xl block pt-6 pb-2 w-full bg-chalk text-black transition duration-75 ease-out !outline-none bg-transparent"
                                        type="text"
                                        value={metaTitle}
                                        onChange={(e)=>setMetaTitle(e.target.value)}
                                    />
                                    <label
                                        className="absolute pointer-events-none text-base text-concrete transition-all transform -translate-y-2.5 scale-[0.85] top-[13px] origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1 peer-placeholder-shown:tracking-normal peer-focus:scale-[0.85] peer-focus:-translate-y-2.5 max-w-[calc(100%-16px)] truncate"
                                    >
                                        {t('seo.meta_title')}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-[10px] relative focus-within:ring-2 focus-within:ring-black transition duration-75 ease-out hover:shadow-[inset_0_0_0_2px_#e0e2d9] hover:focus-within:shadow-none bg-black bg-opacity-[0.025]">
                        <div className="flex rounded-[10px] leading-[48px] border-solid border-2 border-transparent">
                            <div className="flex w-full items-center bg-chalk rounded-sm px-3">
                                <div className="relative grow">
                                    <input
                                        placeholder={t('seo.meta_description')}
                                        className="placeholder-transparent font-semibold peer px-0 sm:text-base text-sm leading-[48px] placeholder:leading-[48px] rounded-xl block pt-6 pb-2 w-full bg-chalk text-black transition duration-75 ease-out !outline-none bg-transparent"
                                        type="text"
                                        value={metaDescription}
                                        onChange={(e)=>setMetaDescription(e.target.value)}
                                    />
                                    <label
                                        className="absolute pointer-events-none text-base text-concrete transition-all transform -translate-y-2.5 scale-[0.85] top-[13px] origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1 peer-placeholder-shown:tracking-normal peer-focus:scale-[0.85] peer-focus:-translate-y-2.5 max-w-[calc(100%-16px)] truncate"
                                    >
                                        {t('seo.meta_description')}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}