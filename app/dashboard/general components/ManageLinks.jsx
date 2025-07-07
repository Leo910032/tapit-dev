// app/dashboard/general components/ManageLinks.jsx - FIXED for Firebase Auth
"use client"

import Image from "next/image";
import AddBtn from "../general elements/addBtn";
import DraggableList from "./Drag";
import React, { useEffect, useState } from "react";
import { generateRandomId } from "@/lib/utilities";
import { updateLinks } from "@/lib/update data/updateLinks";
import { useAuth } from "@/contexts/AuthContext";
import { fireApp } from "@/important/firebase";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useTranslation } from "@/lib/useTranslation";

export const ManageLinksContent = React.createContext();

export default function ManageLinks() {
    const { user, userData, loading } = useAuth();
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const addItem = () => {
        const newItem = {
            id: `${generateRandomId()}`, 
            title: "", 
            isActive: true, 
            type: 0
        };
        setData(prevData => {
            return [newItem, ...prevData];
        });
    };
    
    // Update links when data changes (but not on initial load)
    useEffect(() => {
        if (!hasLoaded) {
            setHasLoaded(true);
            return;
        }
        
        // Only update if we have a valid user
        if (user && userData) {
            console.log('🔄 ManageLinks: Updating links data...');
            updateLinks(data, user.uid); // Pass Firebase UID to update function
        }
    }, [data, hasLoaded, user, userData]);

    // Setup real-time listener for links
    useEffect(() => {
        async function setupLinksListener() {
            try {
                console.log('🔍 ManageLinks: Setting up links listener...');
                
                // Wait for auth to load
                if (loading) {
                    console.log('⏳ ManageLinks: Auth still loading...');
                    return;
                }

                // Check if user is authenticated
                if (!user) {
                    console.log('❌ ManageLinks: No authenticated user');
                    return;
                }

                // Check if we have user data
                if (!userData) {
                    console.log('❌ ManageLinks: No user data available');
                    return;
                }

                console.log('✅ ManageLinks: Setting up listener for user:', user.uid);
                
                const collectionRef = collection(fireApp, "AccountData");
                const docRef = doc(collectionRef, user.uid); // Use Firebase UID

                const unsubscribe = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        const links = userData.links || [];
                        
                        console.log('📝 ManageLinks: Links updated from Firestore:', links.length, 'links');
                        setData(links);
                        setIsConnected(true);
                    } else {
                        console.log('❌ ManageLinks: No document found');
                        setData([]);
                        setIsConnected(false);
                    }
                }, (error) => {
                    console.error('❌ ManageLinks: Firestore listener error:', error);
                    setIsConnected(false);
                });

                // Cleanup function
                return () => {
                    console.log('🔧 ManageLinks: Cleaning up listener');
                    unsubscribe();
                };
                
            } catch (error) {
                console.error('❌ ManageLinks: Error setting up listener:', error);
                setIsConnected(false);
            }
        }

        setupLinksListener();
    }, [user, userData, loading]); // Dependencies on Firebase auth state

    // Show loading state while auth is loading or no user data
    if (loading || !user || !userData) {
        return (
            <div className="h-full flex-col gap-4 py-1 flex sm:px-2 px-1 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600">Loading links...</p>
            </div>
        );
    }

    return (
        <ManageLinksContent.Provider value={{setData, data}}>
            <div className="h-full flex-col gap-4 py-1 flex sm:px-2 px-1 transition-[min-height]">
                <AddBtn />

                {/* Connection status indicator (development only) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className={`text-xs px-2 py-1 rounded ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isConnected ? '🟢 Connected to Firestore' : '🔴 Disconnected from Firestore'}
                    </div>
                )}

                <div 
                    className={`flex items-center gap-3 justify-center rounded-3xl cursor-pointer active:scale-95 active:opacity-60 active:translate-y-1 hover:scale-[1.005] border hover:bg-black hover:bg-opacity-[0.05] w-fit text-sm p-3 mt-3`} 
                    onClick={addItem}
                >
                    <Image src={"https://linktree.sirv.com/Images/icons/add.svg"} alt="links" height={15} width={15} />
                    <span>{t('manageLinks.add_header')}</span>
                </div>

                {data.length === 0 && (
                    <div className="p-6 flex-col gap-4 flex items-center justify-center opacity-30">
                        <Image
                            src={"https://linktree.sirv.com/Images/logo-icon.svg"}
                            alt="logo"
                            height={100}
                            width={100}
                            className="opacity-50 sm:w-24 w-16"
                        />
                        <span className="text-center sm:text-base text-sm max-w-[15rem] font-semibold">
                            {t('manageLinks.show_world_who_you_are')}
                            {' '}
                            {t('manageLinks.add_link_to_get_started')}
                        </span>
                    </div>
                )}

                {data.length > 0 && <DraggableList array={data} />}
            </div>
        </ManageLinksContent.Provider>
    );
}