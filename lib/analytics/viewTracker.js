// lib/analytics/viewTracker.js - ENHANCED WITH TRAFFIC SOURCE VIEW TRACKING
import { fireApp } from "@/important/firebase";
import { collection, doc, updateDoc, increment, setDoc, getDoc } from "firebase/firestore";
import { fastUserLookup } from "@/lib/userLookup";
import { SessionManager, detectTrafficSource, getUTMParameters } from "./linkClickTracker";

/**
 * ✅ ENHANCED: Profile view tracking with traffic source detection
 * @param {string} identifier - Username, display name, or user ID
 * @param {Object} viewerInfo - Optional info about the viewer (IP, user agent, etc.)
 */
export async function recordProfileView(identifier, viewerInfo = {}) {
    try {
        console.log("👁️ Recording profile view for:", identifier);

        // Get or create session data for traffic source tracking
        const sessionData = SessionManager.getOrCreateSession();
        console.log("🎯 Session data for view:", sessionData?.trafficSource);

        // Super fast lookup - single document read
        const userInfo = await fastUserLookup(identifier);
        
        if (!userInfo) {
            console.error("❌ User not found in lookup table:", identifier);
            return;
        }
        
        console.log("✅ Found user via lookup:", userInfo.userId, userInfo.username);
        
        // Record the view using the found user ID with traffic source data
        await recordViewData(userInfo.userId, userInfo.username, viewerInfo, sessionData);
        
        // ✅ Check if user is in a team and trigger team analytics update
        await updateTeamAnalyticsIfNeeded(userInfo.userId);
        
        console.log("🎉 Successfully recorded profile view with traffic source!");

    } catch (error) {
        console.error("❌ Error recording profile view:", error);
        console.error("🔍 Error details:", {
            message: error.message,
            identifier,
            viewerInfo
        });
    }
}

/**
 * Most efficient version - use this when you have the user ID directly
 * @param {string} userId - The user ID (like "user2648OK")
 * @param {Object} viewerInfo - Optional info about the viewer
 */
export async function recordProfileViewByUserId(userId, viewerInfo = {}) {
    try {
        console.log("👁️ Recording profile view by user ID:", userId);

        // Get session data for traffic source tracking
        const sessionData = SessionManager.getOrCreateSession();

        // Get user info from lookup table (still faster than accounts collection)
        const userInfo = await fastUserLookup(userId);
        
        if (!userInfo) {
            console.error("❌ User not found in lookup table for ID:", userId);
            return;
        }

        console.log("✅ Found user via lookup:", userInfo.username);

        // Record the view with traffic source data
        await recordViewData(userId, userInfo.username, viewerInfo, sessionData);
        
        // ✅ Check if user is in a team and trigger team analytics update
        await updateTeamAnalyticsIfNeeded(userId);
        
        console.log("🎉 Successfully recorded profile view!");

    } catch (error) {
        console.error("❌ Error recording profile view by user ID:", error);
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
        // Don't throw - team analytics update shouldn't break view tracking
    }
}

/**
 * ✅ ENHANCED: Internal function to record view data with traffic sources
 */
async function recordViewData(userId, username, viewerInfo, sessionData) {
    const analyticsRef = doc(collection(fireApp, "Analytics"), userId);
    const today = new Date().toISOString().split('T')[0];
    
    console.log("📊 Recording view data for user:", userId);
    console.log("🎯 Traffic source:", sessionData?.trafficSource);
    
    // Check if analytics document exists
    let analyticsDoc;
    try {
        analyticsDoc = await getDoc(analyticsRef);
        console.log("📈 Analytics document exists:", analyticsDoc.exists());
    } catch (readError) {
        console.error("❌ Failed to read analytics document:", readError);
        throw readError;
    }
    
    // Prepare view data with traffic source tracking
    const viewData = {
        totalViews: increment(1),
        [`dailyViews.${today}`]: increment(1),
        [`weeklyViews.${getWeekKey()}`]: increment(1),
        [`monthlyViews.${getMonthKey()}`]: increment(1),
        lastUpdated: new Date()
    };

    // ✅ NEW: Add traffic source view tracking
    if (sessionData?.trafficSource) {
        viewData[`trafficSources.${sessionData.trafficSource.source}.views`] = increment(1);
        viewData[`trafficSources.${sessionData.trafficSource.source}.lastView`] = new Date();
        viewData[`trafficSources.${sessionData.trafficSource.source}.medium`] = sessionData.trafficSource.medium;
        
        // Add campaign data if available
        if (sessionData.trafficSource.campaign) {
            viewData[`trafficSources.${sessionData.trafficSource.source}.campaign`] = sessionData.trafficSource.campaign;
        }
        
        console.log(`📈 Recording view from: ${sessionData.trafficSource.source} (${sessionData.trafficSource.medium})`);
    }
    
    if (!analyticsDoc.exists()) {
        console.log("🆕 Creating new analytics document...");
        try {
            const newDoc = {
                username: username,
                totalViews: 1,
                totalClicks: 0,
                dailyViews: { [today]: 1 },
                dailyClicks: {},
                weeklyViews: { [getWeekKey()]: 1 },
                weeklyClicks: {},
                monthlyViews: { [getMonthKey()]: 1 },
                monthlyClicks: {},
                linkClicks: {},
                lastUpdated: new Date(),
                createdAt: new Date()
            };

            // ✅ NEW: Add initial traffic source data
            if (sessionData?.trafficSource) {
                newDoc.trafficSources = {
                    [sessionData.trafficSource.source]: {
                        views: 1,
                        clicks: 0,
                        medium: sessionData.trafficSource.medium,
                        lastView: new Date(),
                        ...(sessionData.trafficSource.campaign && { campaign: sessionData.trafficSource.campaign })
                    }
                };
            }

            await setDoc(analyticsRef, newDoc);
            console.log("✅ Created new analytics document for user:", userId);
        } catch (createError) {
            console.error("❌ Failed to create analytics document:", createError);
            throw createError;
        }
    } else {
        console.log("🔄 Updating existing analytics document...");
        try {
            await updateDoc(analyticsRef, viewData);
            console.log("✅ Updated analytics for user:", userId);
        } catch (updateError) {
            console.error("❌ Failed to update analytics document:", updateError);
            throw updateError;
        }
    }

    // Optional: Record detailed view logs
    if (viewerInfo.recordDetailed) {
        await recordDetailedView(username, viewerInfo, sessionData);
    }
}

/**
 * ✅ ENHANCED: Records detailed view information with traffic source data
 */
async function recordDetailedView(username, viewerInfo, sessionData) {
    try {
        console.log("📝 Recording detailed view log...");
        const viewLogsRef = collection(fireApp, "ViewLogs");
        const viewId = `${username}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const detailedViewData = {
            userId: username,
            timestamp: new Date(),
            date: new Date().toISOString().split('T')[0],
            viewerInfo: {
                userAgent: viewerInfo.userAgent || '',
                referrer: viewerInfo.referrer || '',
                location: viewerInfo.location || '',
                country: viewerInfo.country || '',
                city: viewerInfo.city || ''
            }
        };

        // ✅ NEW: Add session and traffic source data
        if (sessionData) {
            detailedViewData.sessionData = {
                sessionId: sessionData.sessionId,
                originalReferrer: sessionData.originalReferrer,
                trafficSource: sessionData.trafficSource,
                utmParams: sessionData.utmParams,
                landingPage: sessionData.landingPage,
                sessionStartTime: new Date(sessionData.timestamp)
            };
        }
        
        await setDoc(doc(viewLogsRef, viewId), detailedViewData);
        console.log("✅ Recorded detailed view log with traffic source data");
    } catch (error) {
        console.error("❌ Error recording detailed view:", error);
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
 * ✅ ENHANCED: Gets comprehensive analytics data including traffic sources
 */
export async function getAnalyticsDataByUserId(currentUserId) {
    try {
        console.log("📊 Fetching comprehensive analytics for user ID:", currentUserId);
        
        const analyticsRef = doc(collection(fireApp, "Analytics"), currentUserId);
        const analyticsDoc = await getDoc(analyticsRef);
        
        if (analyticsDoc.exists()) {
            const data = analyticsDoc.data();
            console.log("✅ Found analytics data:", data);
            
            // Calculate derived metrics
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            
            // Get top clicked links
            const linkClicks = data.linkClicks || {};
            const topLinks = Object.entries(linkClicks)
                .map(([linkId, linkData]) => ({
                    linkId,
                    ...linkData
                }))
                .sort((a, b) => (b.totalClicks || 0) - (a.totalClicks || 0))
                .slice(0, 10);
            
            // ✅ NEW: Process traffic sources data
            const trafficSources = data.trafficSources || {};
            
            return {
                // Views data
                totalViews: data.totalViews || 0,
                todayViews: data.dailyViews?.[today] || 0,
                yesterdayViews: data.dailyViews?.[yesterday] || 0,
                thisWeekViews: data.weeklyViews?.[getWeekKey()] || 0,
                thisMonthViews: data.monthlyViews?.[getMonthKey()] || 0,
                
                // Clicks data
                totalClicks: data.totalClicks || 0,
                todayClicks: data.dailyClicks?.[today] || 0,
                yesterdayClicks: data.dailyClicks?.[yesterday] || 0,
                thisWeekClicks: data.weeklyClicks?.[getWeekKey()] || 0,
                thisMonthClicks: data.monthlyClicks?.[getMonthKey()] || 0,
                
                // Detailed data
                dailyViews: data.dailyViews || {},
                dailyClicks: data.dailyClicks || {},
                weeklyViews: data.weeklyViews || {},
                weeklyClicks: data.weeklyClicks || {},
                monthlyViews: data.monthlyViews || {},
                monthlyClicks: data.monthlyClicks || {},
                linkClicks: data.linkClicks || {},
                topLinks,
                
                // ✅ NEW: Traffic sources data
                trafficSources: trafficSources,
                
                // Meta
                lastUpdated: data.lastUpdated,
                username: data.username
            };
        } else {
            console.log("❌ No analytics document found for user:", currentUserId);
        }
        
        return {
            totalViews: 0,
            todayViews: 0,
            yesterdayViews: 0,
            thisWeekViews: 0,
            thisMonthViews: 0,
            totalClicks: 0,
            todayClicks: 0,
            yesterdayClicks: 0,
            thisWeekClicks: 0,
            thisMonthClicks: 0,
            dailyViews: {},
            dailyClicks: {},
            weeklyViews: {},
            weeklyClicks: {},
            monthlyViews: {},
            monthlyClicks: {},
            linkClicks: {},
            topLinks: [],
            trafficSources: {}, // ✅ NEW: Empty traffic sources
            username: null
        };
    } catch (error) {
        console.error("❌ Error fetching analytics data by user ID:", error);
        return null;
    }
}

// Keep all other existing functions for backward compatibility
export const getAnalyticsWithClicks = getAnalyticsDataByUserId;

export async function getBulkAnalyticsData(userIds) {
    try {
        console.log("📊 Fetching bulk analytics for", userIds.length, "users");
        
        const results = {};
        const promises = userIds.map(async (userId) => {
            try {
                const data = await getAnalyticsDataByUserId(userId);
                results[userId] = data;
            } catch (error) {
                console.error(`❌ Failed to fetch analytics for user ${userId}:`, error);
                results[userId] = null;
            }
        });
        
        await Promise.all(promises);
        
        console.log("✅ Bulk analytics fetch completed");
        return results;
        
    } catch (error) {
        console.error("❌ Error in bulk analytics fetch:", error);
        return {};
    }
}

export async function getGlobalAnalytics() {
    try {
        console.log("🌍 Fetching global analytics...");
        
        const analyticsRef = collection(fireApp, "Analytics");
        const querySnapshot = await getDocs(analyticsRef);
        
        let totalViews = 0;
        let totalClicks = 0;
        let totalUsers = 0;
        const dailyViews = {};
        const dailyClicks = {};
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            totalUsers++;
            totalViews += data.totalViews || 0;
            totalClicks += data.totalClicks || 0;
            
            // Aggregate daily data
            Object.entries(data.dailyViews || {}).forEach(([date, views]) => {
                dailyViews[date] = (dailyViews[date] || 0) + views;
            });
            
            Object.entries(data.dailyClicks || {}).forEach(([date, clicks]) => {
                dailyClicks[date] = (dailyClicks[date] || 0) + clicks;
            });
        });
        
        console.log("✅ Global analytics calculated");
        
        return {
            totalUsers,
            totalViews,
            totalClicks,
            averageViewsPerUser: totalUsers > 0 ? Math.round(totalViews / totalUsers) : 0,
            averageClicksPerUser: totalUsers > 0 ? Math.round(totalClicks / totalUsers) : 0,
            dailyViews,
            dailyClicks,
            generatedAt: new Date()
        };
        
    } catch (error) {
        console.error("❌ Error fetching global analytics:", error);
        return null;
    }
}