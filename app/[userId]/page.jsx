// app/[userId]/page.jsx - Enhanced with Fast Lookup
import { fetchUserData } from "@/lib/fetch data/fetchUserData";
import { fastUserLookup } from "@/lib/userLookup"; // ✅ Import fast lookup
import { fireApp } from "@/important/firebase";
import { collection, doc, getDoc } from "firebase/firestore";
import House from "./House";
import Filter from "bad-words"
import { Toaster } from "react-hot-toast";
import { notFound } from 'next/navigation';

export async function generateMetadata({ params: { userId } }) {
    try {
        console.log('🔍 Generating metadata for userId:', userId);
        const filter = new Filter();
        
        // ✅ Try fast lookup first for metadata generation
        let currentUser = null;
        let userInfo = null;
        
        try {
            console.log('⚡ Attempting fast lookup for metadata...');
            userInfo = await fastUserLookup(userId);
            
            if (userInfo) {
                console.log('✅ Fast lookup successful for metadata:', userInfo.username);
                currentUser = userInfo.userId;
            }
        } catch (error) {
            console.log('❌ Fast lookup failed for metadata, falling back to regular lookup');
        }
        
        // Fallback to regular fetchUserData if fast lookup fails
        if (!currentUser) {
            console.log('🔄 Using fallback fetchUserData for metadata...');
            currentUser = await fetchUserData(userId);
        }
        
        if (!currentUser) {
            console.log('❌ No user found for metadata generation');
            notFound();
            return;
        }

        const collectionRef = collection(fireApp, "AccountData");
        const docSnap = await getDoc(doc(collectionRef, currentUser));
    
        if (docSnap.exists()) {
            const { metaData, displayName } = docSnap.data();
            
            // Use displayName from fast lookup if available, otherwise from document
            const profileDisplayName = userInfo?.displayName || displayName || userId;
            
            console.log('✅ Metadata generated successfully for:', profileDisplayName);
            
            return {
                title: metaData && metaData.title ? 
                    filter.clean(metaData.title) : 
                    `${profileDisplayName} | TapIt Profile`,
                description: metaData && metaData.description ? 
                    filter.clean(metaData.description) : 
                    `Check out ${profileDisplayName}'s profile on TapIt`,
                openGraph: {
                    title: metaData && metaData.title ? 
                        filter.clean(metaData.title) : 
                        `${profileDisplayName} | TapIt Profile`,
                    description: metaData && metaData.description ? 
                        filter.clean(metaData.description) : 
                        `Check out ${profileDisplayName}'s profile on TapIt`,
                    type: 'profile',
                    username: userInfo?.username || userId
                },
                twitter: {
                    card: 'summary',
                    title: metaData && metaData.title ? 
                        filter.clean(metaData.title) : 
                        `${profileDisplayName} | TapIt Profile`,
                    description: metaData && metaData.description ? 
                        filter.clean(metaData.description) : 
                        `Check out ${profileDisplayName}'s profile on TapIt`
                }
            };
        } else {
            console.log('❌ No profile data found');
            notFound();
        }
    } catch (error) {
        console.error('❌ Error generating metadata:', error);
        notFound();
    }
}

export default function UserLinksPage({ params: { userId } }) {
    console.log('🏠 Rendering public profile page for:', userId);
    
    return (
        <div className="w-screen h-screen flex flex-col">
            <Toaster />
            <House userId={userId} />
        </div>
    );
}