// app/dashboard/(dashboard pages)/analytics/page.jsx - FIXED with Firebase Auth
"use client"
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/useTranslation";
import { fireApp } from "@/important/firebase";
import { collection, doc, onSnapshot } from "firebase/firestore";

// Import components
import AnalyticsHeader from "./components/AnalyticsHeader";
import PeriodNavigation from "./components/PeriodNavigation";
import OverviewCards from "./components/OverviewCards";
import PerformanceChart from "./components/PerformanceChart";
import LinkTypeDistribution from "./components/LinkTypeDistribution";
import LinkAnalyticsChart from "./components/LinkAnalyticsChart";
import TrafficSourcesChart from "./components/TrafficSourceChart.jsx";

export default function AnalyticsPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const { t } = useTranslation();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('all');

    const getWeekKey = () => { 
        const now = new Date(); 
        const yearStart = new Date(now.getFullYear(), 0, 1); 
        const weekNumber = Math.ceil(((now - yearStart) / 86400000 + yearStart.getDay() + 1) / 7); 
        return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`; 
    };

    const getMonthKey = () => { 
        const now = new Date(); 
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`; 
    };

    // Process analytics data including traffic sources
    const processAnalyticsData = (data) => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const weekKey = getWeekKey();
        const monthKey = getMonthKey();

        // Process link clicks
        const topLinks = Object.entries(data.linkClicks || {})
            .map(([linkId, linkData]) => ({
                linkId,
                title: linkData.title || 'Untitled Link',
                url: linkData.url || '',
                type: linkData.type || 'custom',
                totalClicks: linkData.totalClicks || 0,
                todayClicks: linkData.dailyClicks?.[today] || 0,
                weekClicks: data.weeklyClicks?.[weekKey] || 0,
                monthClicks: data.monthlyClicks?.[monthKey] || 0,
                createdAt: linkData.createdAt || new Date().toISOString(),
                lastClicked: linkData.lastClicked,
                referrerData: linkData.referrerData || {}
            }))
            .filter(link => link.totalClicks > 0)
            .sort((a, b) => (b.totalClicks || 0) - (a.totalClicks || 0));

        // Process traffic sources data
        const trafficSources = data.trafficSources || {};
        
        // Calculate traffic source totals and trends
        const trafficSourceStats = {
            totalSources: Object.keys(trafficSources).length,
            topSource: null,
            socialTraffic: 0,
            searchTraffic: 0,
            directTraffic: 0,
            referralTraffic: 0
        };

        if (Object.keys(trafficSources).length > 0) {
            // Find top traffic source
            const sortedSources = Object.entries(trafficSources)
                .sort(([,a], [,b]) => (b.clicks || 0) - (a.clicks || 0));
            
            if (sortedSources.length > 0) {
                trafficSourceStats.topSource = {
                    name: sortedSources[0][0],
                    clicks: sortedSources[0][1].clicks || 0,
                    medium: sortedSources[0][1].medium || 'unknown'
                };
            }

            // Calculate traffic by medium
            Object.entries(trafficSources).forEach(([source, sourceData]) => {
                const clicks = sourceData.clicks || 0;
                switch (sourceData.medium) {
                    case 'social':
                        trafficSourceStats.socialTraffic += clicks;
                        break;
                    case 'search':
                    case 'organic':
                        trafficSourceStats.searchTraffic += clicks;
                        break;
                    case 'direct':
                        trafficSourceStats.directTraffic += clicks;
                        break;
                    case 'referral':
                        trafficSourceStats.referralTraffic += clicks;
                        break;
                }
            });
        }

        return {
            totalViews: data.totalViews || 0,
            todayViews: data.dailyViews?.[today] || 0,
            yesterdayViews: data.dailyViews?.[yesterday] || 0,
            thisWeekViews: data.weeklyViews?.[weekKey] || 0,
            thisMonthViews: data.monthlyViews?.[monthKey] || 0,
            totalClicks: data.totalClicks || 0,
            todayClicks: data.dailyClicks?.[today] || 0,
            yesterdayClicks: data.dailyClicks?.[yesterday] || 0,
            thisWeekClicks: data.weeklyClicks?.[weekKey] || 0,
            thisMonthClicks: data.monthlyClicks?.[monthKey] || 0,
            dailyViews: data.dailyViews || {},
            dailyClicks: data.dailyClicks || {},
            topLinks,
            trafficSources: trafficSources,
            trafficSourceStats: trafficSourceStats,
            campaigns: data.campaigns || {},
            referrerBreakdown: data.referrerBreakdown || {}
        };
    };

    useEffect(() => {
        const setupRealtimeAnalytics = async () => {
            try {
                console.log('📊 Analytics: Setting up real-time analytics...');
                
                // Wait for auth to load
                if (authLoading) {
                    console.log('⏳ Analytics: Auth still loading...');
                    return;
                }

                // Check if user is authenticated
                if (!user) {
                    console.log('❌ Analytics: No authenticated user');
                    setError("Not authenticated");
                    setLoading(false);
                    return;
                }

                // Check if we have user data
                if (!userData) {
                    console.log('❌ Analytics: No user data available');
                    setError("No user data available");
                    setLoading(false);
                    return;
                }

                console.log('✅ Analytics: Setting up listener for user:', user.uid);

                const analyticsRef = doc(collection(fireApp, "Analytics"), user.uid);
                
                const unsubscribe = onSnapshot(analyticsRef, (docSnapshot) => {
                    console.log('📊 Analytics data updated');
                    setIsConnected(true);
                    
                    const data = docSnapshot.exists() ? docSnapshot.data() : {};
                    const processed = processAnalyticsData(data);
                    
                    console.log("📊 Processed analytics with traffic sources:", processed);
                    setAnalytics(processed);
                    setLoading(false);
                }, (err) => {
                    console.error("❌ Analytics Firebase listener error:", err);
                    setError("Failed to connect to real-time analytics.");
                    setIsConnected(false);
                    setLoading(false);
                });

                return () => {
                    console.log('🧹 Analytics: Cleaning up listener');
                    unsubscribe();
                };
                
            } catch (err) {
                console.error("❌ Analytics setup error:", err);
                setLoading(false);
                setError("Failed to load analytics data.");
            }
        };

        setupRealtimeAnalytics();
    }, [user, userData, authLoading]);

    // Show loading while auth is loading or analytics is loading
    if (authLoading || loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-3 text-sm">
                        {authLoading ? 'Loading Authentication...' : 'Loading Analytics...'}
                    </span>
                </div>
            </div>
        );
    }

    // Show error if no user or error occurred
    if (!user || error) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="text-red-500 text-sm mb-2">⚠️ Error</div>
                    <div className="text-gray-600 text-xs">{error || 'Not authenticated'}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 py-2 flex flex-col max-h-full overflow-y-auto pb-20">
            <div className="p-4 space-y-4">
                {/* Compact Header */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">
                                {t('analytics.title') || 'Analytics'}
                            </h1>
                            <p className="text-xs text-gray-600 mt-1">
                                @{userData?.username || user?.email?.split('@')[0]}
                            </p>
                        </div>
                        <div className="flex items-center text-xs">
                            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                                {isConnected ? t('analytics.live_updates_enabled') : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Compact Period Navigation */}
                <div className="bg-white rounded-lg border p-3">
                    <div className="grid grid-cols-4 gap-1">
                        {[
                            { id: 'today', label: 'Today' },
                            { id: 'week', label: 'Week' },
                            { id: 'month', label: 'Month' },
                            { id: 'all', label: 'All' }
                        ].map((period) => (
                            <button
                                key={period.id}
                                onClick={() => setSelectedPeriod(period.id)}
                                className={`px-2 py-2 text-xs font-medium rounded-md transition-colors ${
                                    selectedPeriod === period.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {t(`analytics.${period.id}`) || period.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Compact Overview Cards */}
                <OverviewCards
                    analytics={analytics}
                    selectedPeriod={selectedPeriod}
                    isConnected={isConnected}
                />

                {/* Full Width Performance Chart */}
                <div className="bg-white rounded-lg border p-4">
                    <div className="h-64 w-full">
                        <PerformanceChart analytics={analytics} />
                    </div>
                </div>

                {/* Traffic Sources Chart */}
                {analytics?.trafficSources && Object.keys(analytics.trafficSources).length > 0 && (
                    <TrafficSourcesChart analytics={analytics} />
                )}

                {/* Traffic Sources Quick Stats (if no detailed data) */}
                {analytics?.trafficSourceStats && (
                    <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            {t('analytics.traffic_overview') || 'Traffic Overview'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div className="text-center">
                                <div className="text-lg font-bold text-purple-600">
                                    {analytics.trafficSourceStats.socialTraffic}
                                </div>
                                <div className="text-gray-600">
                                    {t('analytics.social_traffic') || 'Social'} 📱
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-600">
                                    {analytics.trafficSourceStats.searchTraffic}
                                </div>
                                <div className="text-gray-600">
                                    {t('analytics.search_traffic') || 'Search'} 🔍
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-gray-600">
                                    {analytics.trafficSourceStats.directTraffic}
                                </div>
                                <div className="text-gray-600">
                                    {t('analytics.direct_traffic') || 'Direct'} 🔗
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-pink-600">
                                    {analytics.trafficSourceStats.referralTraffic}
                                </div>
                                <div className="text-gray-600">
                                    {t('analytics.referral_traffic') || 'Referral'} 🌐
                                </div>
                            </div>
                        </div>
                        
                        {/* Top Traffic Source */}
                        {analytics.trafficSourceStats.topSource && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">
                                        {t('analytics.top_source') || 'Top Source'}:
                                    </span>
                                    <span className="text-xs font-medium text-gray-900 capitalize">
                                        {getSourceIcon(analytics.trafficSourceStats.topSource.name)} {analytics.trafficSourceStats.topSource.name}
                                        <span className="text-blue-600 ml-1">
                                            ({analytics.trafficSourceStats.topSource.clicks} clicks)
                                        </span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Compact Statistics Grid */}
                <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('analytics.quick_stats')}</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t('analytics.total_links_')}</span>
                                <span className="font-medium">{analytics?.topLinks?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t('analytics.active_links')}</span>
                                <span className="font-medium">{analytics?.topLinks?.filter(link => link.totalClicks > 0).length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t('analytics.traffic_sources') || 'Sources'}</span>
                                <span className="font-medium">{analytics?.trafficSourceStats?.totalSources || 0}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t('analytics.Avg_CTR')}</span>
                                <span className="font-medium">
                                    {analytics?.totalViews > 0 ? ((analytics?.totalClicks / analytics?.totalViews) * 100).toFixed(1) : 0}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t('analytics.Best_Day')}</span>
                                <span className="font-medium">
                                    {analytics?.dailyViews ? 
                                        Object.entries(analytics.dailyViews)
                                            .sort(([,a], [,b]) => b - a)[0]?.[1] || 0 
                                        : 0
                                    }
                                </span>
                            </div>
                            {analytics?.trafficSourceStats?.topSource && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{t('analytics.top_converter') || 'Top Conv.'}</span>
                                    <span className="font-medium capitalize">
                                        {analytics.trafficSourceStats.topSource.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Link Analytics Chart */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm">
                    <div className="h-81"> 
                        <LinkAnalyticsChart analytics={analytics} isConnected={isConnected} />
                    </div>
                </div>

                {/* Performance Summary with referrer insights */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('analytics.Performance_summary')}</h3>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">{t('analytics.Total_engagement')}</span>
                            <span className="font-bold text-purple-600">
                                {(analytics?.totalViews || 0) + (analytics?.totalClicks || 0)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">{t('analytics.Most_active_period')}</span>
                            <span className="font-medium text-gray-900">
                                {analytics?.dailyViews && analytics?.dailyViews[Object.keys(analytics.dailyViews).sort().reverse()[0]] > 0 ? Object.keys(analytics.dailyViews).sort().reverse()[0] : 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">{t('analytics.Growth_trend')}</span>
                            <span className={`font-medium ${
                                (analytics?.todayViews || 0) > (analytics?.yesterdayViews || 0) 
                                    ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {(analytics?.todayViews || 0) > (analytics?.yesterdayViews || 0) ? t('analytics.Growing') : t('analytics.Declining')}
                            </span>
                        </div>
                        {analytics?.trafficSourceStats?.totalSources > 0 && (
                            <div className="flex justify-between items-center pt-2 border-t border-purple-200">
                                <span className="text-gray-600">{t('analytics.traffic_diversity') || 'Traffic Mix'}</span>
                                <span className="font-medium text-blue-600">
                                    {analytics.trafficSourceStats.totalSources} {t('analytics.sources') || 'sources'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="h-10"></div> {/* Spacer at the bottom */}
        </div>
    );
}

// Helper function for source icons
function getSourceIcon(source) {
    const icons = {
        'instagram': '📸',
        'tiktok': '🎵',
        'twitter': '🐦',
        'facebook': '👤',
        'linkedin': '💼',
        'youtube': '📺',
        'google': '🔍',
        'direct': '🔗',
        'email': '📧'
    };
    return icons[source] || '🌐';
}