// app/[userId]/components/SessionTracker.jsx - Client-side session tracking
"use client"
import { useEffect } from 'react';
import { initializeSessionTracking } from '@/lib/analytics/linkClickTracker';

export default function SessionTracker({ userId }) {
    useEffect(() => {
        // ✅ Initialize session tracking when profile loads
        const trafficData = initializeSessionTracking();
        
        console.log('🎯 Profile loaded with traffic source:', trafficData);
        console.log('👤 Profile userId:', userId);
        
        // ✅ Enhanced logging for debugging
        if (trafficData) {
            console.log('📊 Traffic source details:', {
                source: trafficData.source,
                medium: trafficData.medium,
                campaign: trafficData.campaign,
                type: trafficData.type,
                referrer: trafficData.referrer,
                landingPage: trafficData.landingPage,
                landingTime: trafficData.landingTime
            });
            
            // ✅ Optional: Track profile view with traffic source
            // You can enhance this to record profile views with traffic source data
            if (userId) {
                console.log(`🔍 User ${userId} visited from ${trafficData.source}`);
                
                // Example: You could add profile view tracking here
                // recordProfileView(userId, trafficData);
            }
        }
        
        // ✅ Log UTM parameters if present
        const urlParams = new URLSearchParams(window.location.search);
        const utmParams = {
            utm_source: urlParams.get('utm_source'),
            utm_medium: urlParams.get('utm_medium'),
            utm_campaign: urlParams.get('utm_campaign'),
            utm_content: urlParams.get('utm_content'),
            utm_term: urlParams.get('utm_term')
        };
        
        const hasUTM = Object.values(utmParams).some(param => param !== null);
        if (hasUTM) {
            console.log('🏷️ UTM Parameters detected:', utmParams);
        }
        
    }, [userId]);

    // This component doesn't render anything visible
    return null;
}