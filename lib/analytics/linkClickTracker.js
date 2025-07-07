// lib/analytics/linkClickTracker.js - ENHANCED WITH REFERRER TRACKING
import { fireApp } from "@/important/firebase";
import { collection, doc, updateDoc, increment, setDoc, getDoc } from "firebase/firestore";
import { fastUserLookup } from "@/lib/userLookup";

/**
 * ✅ NEW: Traffic source detection from referrer
 */
function detectTrafficSource(referrer, urlParams = {}) {
    // Check UTM parameters first (highest priority)
    if (urlParams.utm_source) {
        return {
            source: urlParams.utm_source,
            medium: urlParams.utm_medium || 'unknown',
            campaign: urlParams.utm_campaign || '',
            type: 'utm'
        };
    }

    // If no referrer, it's direct traffic
    if (!referrer || referrer === '') {
        return {
            source: 'direct',
            medium: 'direct',
            campaign: '',
            type: 'direct'
        };
    }

    try {
        const url = new URL(referrer);
        const domain = url.hostname.toLowerCase();

        // Social media platforms
        if (domain.includes('instagram.com') || domain.includes('ig.me')) {
            return { source: 'instagram', medium: 'social', campaign: '', type: 'social' };
        } else if (domain.includes('tiktok.com')) {
            return { source: 'tiktok', medium: 'social', campaign: '', type: 'social' };
        } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
            return { source: 'twitter', medium: 'social', campaign: '', type: 'social' };
        } else if (domain.includes('facebook.com') || domain.includes('fb.com')) {
            return { source: 'facebook', medium: 'social', campaign: '', type: 'social' };
        } else if (domain.includes('linkedin.com')) {
            return { source: 'linkedin', medium: 'social', campaign: '', type: 'social' };
        } else if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
            return { source: 'youtube', medium: 'social', campaign: '', type: 'social' };
        } else if (domain.includes('snapchat.com')) {
            return { source: 'snapchat', medium: 'social', campaign: '', type: 'social' };
        } else if (domain.includes('discord.com') || domain.includes('discord.gg')) {
            return { source: 'discord', medium: 'social', campaign: '', type: 'social' };
        } else if (domain.includes('reddit.com')) {
            return { source: 'reddit', medium: 'social', campaign: '', type: 'social' };
        } else if (domain.includes('pinterest.com')) {
            return { source: 'pinterest', medium: 'social', campaign: '', type: 'social' };
        }
        
        // Search engines
        else if (domain.includes('google.')) {
            return { source: 'google', medium: 'organic', campaign: '', type: 'search' };
        } else if (domain.includes('bing.com')) {
            return { source: 'bing', medium: 'organic', campaign: '', type: 'search' };
        } else if (domain.includes('yahoo.com')) {
            return { source: 'yahoo', medium: 'organic', campaign: '', type: 'search' };
        } else if (domain.includes('duckduckgo.com')) {
            return { source: 'duckduckgo', medium: 'organic', campaign: '', type: 'search' };
        }
        
        // Email providers
        else if (domain.includes('gmail.com') || domain.includes('outlook.com') || domain.includes('yahoo.com')) {
            return { source: 'email', medium: 'email', campaign: '', type: 'email' };
        }
        
        // Other referrals
        else {
            return { source: domain, medium: 'referral', campaign: '', type: 'referral' };
        }
    } catch (error) {
        console.error('Error parsing referrer:', error);
        return { source: 'unknown', medium: 'unknown', campaign: '', type: 'unknown' };
    }
}

/**
 * ✅ NEW: Get UTM parameters from URL
 */
function getUTMParameters() {
    if (typeof window === 'undefined') return {};
    
    const params = new URLSearchParams(window.location.search);
    return {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_content: params.get('utm_content'),
        utm_term: params.get('utm_term')
    };
}

/**
 * ✅ NEW: Session and referrer management
 */
class SessionManager {
    static SESSION_KEY = 'tapit_session_data';
    static SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

    static getSessionData() {
        if (typeof window === 'undefined') return null;
        
        try {
            const sessionData = sessionStorage.getItem(this.SESSION_KEY);
            if (!sessionData) return null;
            
            const parsed = JSON.parse(sessionData);
            
            // Check if session is expired
            if (Date.now() - parsed.timestamp > this.SESSION_DURATION) {
                this.clearSession();
                return null;
            }
            
            return parsed;
        } catch (error) {
            console.error('Error reading session data:', error);
            return null;
        }
    }

    static setSessionData(data) {
        if (typeof window === 'undefined') return;
        
        try {
            const sessionData = {
                ...data,
                timestamp: Date.now()
            };
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        } catch (error) {
            console.error('Error setting session data:', error);
        }
    }

    static clearSession() {
        if (typeof window === 'undefined') return;
        
        try {
            sessionStorage.removeItem(this.SESSION_KEY);
        } catch (error) {
            console.error('Error clearing session:', error);
        }
    }

    static getOrCreateSession() {
        let sessionData = this.getSessionData();
        
        if (!sessionData) {
            // Create new session with current referrer and UTM data
            const referrer = typeof window !== 'undefined' ? document.referrer : '';
            const utmParams = getUTMParameters();
            const trafficSource = detectTrafficSource(referrer, utmParams);
            
            sessionData = {
                originalReferrer: referrer,
                trafficSource,
                utmParams,
                landingPage: typeof window !== 'undefined' ? window.location.href : '',
                userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
                timestamp: Date.now(),
                sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            
            this.setSessionData(sessionData);
            console.log('🎯 Created new session:', sessionData);
        }
        
        return sessionData;
    }
}

/**
 * ✅ IMPROVED: Normalize linkId to ensure consistency
 */
function normalizeLinkId(linkId, title = '') {
    if (!linkId) return generateLinkId({ linkTitle: title });
    
    // Clean up file download IDs
    if (linkId.startsWith('file_download_')) {
        // Remove file extension and extra spaces for consistency
        let cleanId = linkId
            .replace(/\.(docx|pdf|txt|jpg|png|gif|mp4|mp3|zip|rar)$/i, '') // Remove common extensions
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim(); // Remove trailing spaces
        
        console.log('🔧 Normalized file linkId:', linkId, '->', cleanId);
        return cleanId;
    }
    
    return linkId;
}

/**
 * ✅ ENHANCED: Process and normalize link information with referrer data
 */
function processLinkInfo(linkInfo, sessionData) {
    let processedInfo = { ...linkInfo };
    
    // ✅ CRITICAL: Normalize the linkId first
    processedInfo.linkId = normalizeLinkId(linkInfo.linkId, linkInfo.linkTitle);
    
    // Handle file download links
    if (processedInfo.linkId && processedInfo.linkId.startsWith('file_download_')) {
        processedInfo.linkType = 'file_download';
        processedInfo.displayType = 'File';
        
        // Clean up the title for file downloads
        if (linkInfo.linkTitle && linkInfo.linkTitle.startsWith('Download ')) {
            processedInfo.cleanTitle = linkInfo.linkTitle.replace('Download ', '').trim();
        } else {
            processedInfo.cleanTitle = linkInfo.linkTitle;
        }
        
        // Extract filename from linkId for better title
        if (!processedInfo.cleanTitle || processedInfo.cleanTitle === 'Untitled Link') {
            const filename = processedInfo.linkId.replace('file_download_', '').trim();
            if (filename) {
                processedInfo.cleanTitle = filename;
                processedInfo.linkTitle = filename;
            }
        }
    } else {
        // Regular links
        processedInfo.linkType = linkInfo.linkType || 'custom';
        processedInfo.displayType = linkInfo.linkType || 'Custom';
        processedInfo.cleanTitle = linkInfo.linkTitle;
    }
    
    // Ensure we have all required fields
    processedInfo.linkTitle = processedInfo.linkTitle || processedInfo.cleanTitle || 'Untitled Link';
    processedInfo.linkUrl = linkInfo.linkUrl || '';
    
    // ✅ NEW: Add referrer data to link info
    if (sessionData) {
        processedInfo.referrerData = {
            originalReferrer: sessionData.originalReferrer,
            trafficSource: sessionData.trafficSource,
            utmParams: sessionData.utmParams,
            sessionId: sessionData.sessionId
        };
    }
    
    console.log("📝 Processed link info with referrer data:", {
        original: linkInfo,
        processed: processedInfo
    });
    
    return processedInfo;
}

/**
 * ENHANCED link click tracking with referrer tracking + TEAM ANALYTICS UPDATE
 */
export async function recordLinkClick(identifier, linkInfo, clickerInfo = {}) {
    try {
        console.log("🔥 Recording link click for:", identifier, "Link:", linkInfo.linkTitle);
        console.log("🔍 Original linkInfo:", linkInfo);

        // Get session data (includes referrer info)
        const sessionData = SessionManager.getOrCreateSession();

        // Super fast lookup - single document read
        const userInfo = await fastUserLookup(identifier);
        
        if (!userInfo) {
            console.error("❌ User not found in lookup table:", identifier);
            return;
        }
        
        console.log("✅ Found user via lookup:", userInfo.userId, userInfo.username);
        
        // ✅ ENHANCED: Better linkId processing with referrer data
        const processedLinkInfo = processLinkInfo(linkInfo, sessionData);
        console.log("🔗 Processed link info:", processedLinkInfo);
        
        // Record the click using the found user ID
        await recordClickData(userInfo.userId, userInfo.username, processedLinkInfo, clickerInfo, sessionData);
        
        // ✅ Check if user is in a team and trigger team analytics update
        await updateTeamAnalyticsIfNeeded(userInfo.userId);
        
        console.log("🎉 Successfully recorded link click with referrer data!");

    } catch (error) {
        console.error("❌ Error recording link click:", error);
        console.error("🔍 Error details:", {
            message: error.message,
            identifier,
            linkInfo
        });
    }
}

/**
 * Generate a linkId if one doesn't exist
 */
function generateLinkId(linkInfo) {
    if (linkInfo.linkTitle) {
        // Create a simple ID from title
        return linkInfo.linkTitle
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .substring(0, 30);
    }
    return `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Most efficient version - use this when you have the user ID directly
 */
export async function recordLinkClickByUserId(userId, linkInfo, clickerInfo = {}) {
    try {
        console.log("🔥 Recording link click by user ID:", userId, "Link:", linkInfo.linkTitle);

        // Get session data (includes referrer info)
        const sessionData = SessionManager.getOrCreateSession();

        // Get user info from lookup table
        const userInfo = await fastUserLookup(userId);
        
        if (!userInfo) {
            console.error("❌ User not found in lookup table for ID:", userId);
            return;
        }

        console.log("✅ Found user via lookup:", userInfo.username);

        // ✅ ENHANCED: Better linkId processing with referrer data
        const processedLinkInfo = processLinkInfo(linkInfo, sessionData);

        // Record the click
        await recordClickData(userId, userInfo.username, processedLinkInfo, clickerInfo, sessionData);
        
        // ✅ Check if user is in a team and trigger team analytics update
        await updateTeamAnalyticsIfNeeded(userId);
        
        console.log("🎉 Successfully recorded link click with referrer data!");

    } catch (error) {
        console.error("❌ Error recording link click by user ID:", error);
        throw error;
    }
}

/**
 * ✅ Check if user is in a team and update team analytics
 */
async function updateTeamAnalyticsIfNeeded(userId) {
    try {
        // Check if user is in a team
        const userRef = doc(fireApp, "AccountData", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists() && userSnap.data().teamId) {
            const teamId = userSnap.data().teamId;
            console.log("🏢 User is in team, triggering team analytics update:", teamId);
            
            // Dynamically import to avoid circular dependencies
            const { aggregateTeamAnalytics } = await import('../teamManagement');
            await aggregateTeamAnalytics(teamId);
            
            console.log("✅ Team analytics updated successfully");
        }
    } catch (error) {
        console.error("❌ Failed to update team analytics:", error);
        // Don't throw - team analytics update shouldn't break click tracking
    }
}

/**
 * ✅ ENHANCED: Internal function to record click data with referrer tracking
 */
async function recordClickData(userId, username, linkInfo, clickerInfo, sessionData) {
    const analyticsRef = doc(collection(fireApp, "Analytics"), userId);
    const today = new Date().toISOString().split('T')[0];
    
    console.log("📊 Recording click data for user:", userId, "Link:", linkInfo.linkId);
    
    // Check if analytics document exists
    const analyticsDoc = await getDoc(analyticsRef);
    console.log("📈 Analytics document exists:", analyticsDoc.exists());
    
    // ✅ ENHANCED: Better data structure for link tracking with referrer data
    const linkClickData = {
        title: linkInfo.linkTitle,
        cleanTitle: linkInfo.cleanTitle || linkInfo.linkTitle,
        url: linkInfo.linkUrl,
        type: linkInfo.linkType,
        displayType: linkInfo.displayType || linkInfo.linkType,
        lastClicked: new Date(),
        totalClicks: increment(1),
        // Add daily/weekly/monthly tracking for individual links
        [`dailyClicks.${today}`]: increment(1),
        [`weeklyClicks.${getWeekKey()}`]: increment(1),
        [`monthlyClicks.${getMonthKey()}`]: increment(1),
        // ✅ NEW: Add referrer tracking
        ...(linkInfo.referrerData && {
            [`referrerData.${linkInfo.referrerData.sessionId}`]: {
                source: linkInfo.referrerData.trafficSource.source,
                medium: linkInfo.referrerData.trafficSource.medium,
                campaign: linkInfo.referrerData.trafficSource.campaign,
                originalReferrer: linkInfo.referrerData.originalReferrer,
                utmParams: linkInfo.referrerData.utmParams,
                clickedAt: new Date()
            }
        })
    };
    
    // Prepare main analytics update
    const clickData = {
        totalClicks: increment(1),
        [`dailyClicks.${today}`]: increment(1),
        [`weeklyClicks.${getWeekKey()}`]: increment(1),
        [`monthlyClicks.${getMonthKey()}`]: increment(1),
        lastUpdated: new Date(),
        // ✅ NEW: Track traffic sources at the main level
        ...(sessionData && {
            [`trafficSources.${sessionData.trafficSource.source}.clicks`]: increment(1),
            [`trafficSources.${sessionData.trafficSource.source}.lastClick`]: new Date(),
            [`trafficSources.${sessionData.trafficSource.source}.medium`]: sessionData.trafficSource.medium
        })
    };
    
    // Add the link-specific data
    Object.keys(linkClickData).forEach(key => {
        clickData[`linkClicks.${linkInfo.linkId}.${key}`] = linkClickData[key];
    });

    if (!analyticsDoc.exists()) {
        console.log("🆕 Creating new analytics document with click data...");
        const newDocData = {
            username: username,
            totalViews: 0,
            totalClicks: 1,
            dailyViews: {},
            dailyClicks: { [today]: 1 },
            weeklyViews: {},
            weeklyClicks: { [getWeekKey()]: 1 },
            monthlyViews: {},
            monthlyClicks: { [getMonthKey()]: 1 },
            linkClicks: {
                [linkInfo.linkId]: {
                    title: linkInfo.linkTitle,
                    cleanTitle: linkInfo.cleanTitle || linkInfo.linkTitle,
                    url: linkInfo.linkUrl,
                    type: linkInfo.linkType,
                    displayType: linkInfo.displayType || linkInfo.linkType,
                    totalClicks: 1,
                    lastClicked: new Date(),
                    dailyClicks: { [today]: 1 },
                    weeklyClicks: { [getWeekKey()]: 1 },
                    monthlyClicks: { [getMonthKey()]: 1 }
                }
            },
            lastUpdated: new Date(),
            createdAt: new Date()
        };

        // ✅ NEW: Add traffic sources and referrer data to new document
        if (sessionData) {
            newDocData.trafficSources = {
                [sessionData.trafficSource.source]: {
                    clicks: 1,
                    views: 0,
                    lastClick: new Date(),
                    medium: sessionData.trafficSource.medium,
                    campaign: sessionData.trafficSource.campaign
                }
            };

            // Add referrer data to the specific link
            if (linkInfo.referrerData) {
                newDocData.linkClicks[linkInfo.linkId].referrerData = {
                    [linkInfo.referrerData.sessionId]: {
                        source: linkInfo.referrerData.trafficSource.source,
                        medium: linkInfo.referrerData.trafficSource.medium,
                        campaign: linkInfo.referrerData.trafficSource.campaign,
                        originalReferrer: linkInfo.referrerData.originalReferrer,
                        utmParams: linkInfo.referrerData.utmParams,
                        clickedAt: new Date()
                    }
                };
            }
        }

        await setDoc(analyticsRef, newDocData);
        console.log("✅ Created new analytics document with referrer data");
    } else {
        console.log("🔄 Updating existing analytics with click data...");
        await updateDoc(analyticsRef, clickData);
        console.log("✅ Updated analytics document with referrer data");
    }

    // Optional: Record detailed click logs with referrer data
    if (clickerInfo.recordDetailed) {
        await recordDetailedClick(username, linkInfo, clickerInfo, sessionData);
    }
}

/**
 * ✅ ENHANCED: Records detailed click information with referrer data
 */
async function recordDetailedClick(username, linkInfo, clickerInfo, sessionData) {
    try {
        console.log("📝 Recording detailed click log with referrer data...");
        const clickLogsRef = collection(fireApp, "ClickLogs");
        const clickId = `${username}_${linkInfo.linkId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const detailedClickData = {
            userId: username,
            linkId: linkInfo.linkId,
            linkTitle: linkInfo.linkTitle,
            linkUrl: linkInfo.linkUrl,
            linkType: linkInfo.linkType,
            timestamp: new Date(),
            date: new Date().toISOString().split('T')[0],
            clickerInfo: {
                userAgent: clickerInfo.userAgent || '',
                referrer: clickerInfo.referrer || '',
                country: clickerInfo.country || '',
                city: clickerInfo.city || ''
            }
        };

        // ✅ NEW: Add session and referrer data to detailed logs
        if (sessionData) {
            detailedClickData.sessionData = {
                sessionId: sessionData.sessionId,
                originalReferrer: sessionData.originalReferrer,
                trafficSource: sessionData.trafficSource,
                utmParams: sessionData.utmParams,
                landingPage: sessionData.landingPage,
                sessionStartTime: new Date(sessionData.timestamp)
            };
        }
        
        await setDoc(doc(clickLogsRef, clickId), detailedClickData);
        console.log("✅ Recorded detailed click log with referrer data");
    } catch (error) {
        console.error("❌ Error recording detailed click:", error);
    }
}

/**
 * Gets the current week key (year-week format)
 */
function getWeekKey() {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now - yearStart) / 86400000 + yearStart.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Gets the current month key (year-month format)
 */
function getMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

/**
 * ✅ NEW: Export utility functions for use in other components
 */
export { detectTrafficSource, getUTMParameters, SessionManager };