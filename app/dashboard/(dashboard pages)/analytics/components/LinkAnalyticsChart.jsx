// app/dashboard/(dashboard pages)/analytics/components/LinkAnalyticsChart.jsx - FIXED FOR TOPLINKS
"use client"
import { useTranslation } from "@/lib/useTranslation";
import Image from "next/image";

export default function LinkAnalyticsChart({ analytics, isConnected }) {
    const { t } = useTranslation();
    
    console.log("🔍 Analytics structure check:", {
        hasAnalytics: !!analytics,
        hasLinkClicks: !!analytics?.linkClicks,
        hasTopLinks: !!analytics?.topLinks,
        topLinksLength: analytics?.topLinks?.length || 0,
        topLinksData: analytics?.topLinks
    });
    
    // ✅ FIX: Use topLinks array instead of linkClicks object
    const processLinkData = () => {
        // Check both possible data sources
        let linkData = null;
        
        if (analytics?.topLinks && Array.isArray(analytics.topLinks)) {
            console.log("✅ Using topLinks array data");
            linkData = analytics.topLinks;
        } else if (analytics?.linkClicks && typeof analytics.linkClicks === 'object') {
            console.log("✅ Using linkClicks object data");
            linkData = Object.entries(analytics.linkClicks).map(([linkId, data]) => ({
                linkId,
                ...data
            }));
        } else {
            console.log("❌ No link data found in analytics");
            return [];
        }
        
        console.log("📊 Processing link data:", linkData);
        
        const processedLinks = linkData
            .map((link) => {
                console.log("🔗 Processing link:", link);
                
                // Handle both array and object formats
                const linkId = link.linkId;
                const title = link.title || 'Untitled Link';
                const url = link.url || '';
                const type = link.type || 'custom';
                const totalClicks = link.totalClicks || 0;
                const lastClicked = link.lastClicked;
                
                // Clean up display title
                let displayTitle = title;
                
                // Handle file downloads
                if (linkId && linkId.startsWith('file_download_')) {
                    displayTitle = linkId.replace('file_download_', '').trim();
                    if (displayTitle.length > 25) {
                        displayTitle = displayTitle.substring(0, 25) + '...';
                    }
                } else if (displayTitle.length > 30) {
                    displayTitle = displayTitle.substring(0, 30) + '...';
                }
                
                const processedLink = {
                    linkId,
                    title: displayTitle,
                    fullTitle: title,
                    url,
                    type: linkId && linkId.startsWith('file_download_') ? 'File' : (type || 'Custom'),
                    totalClicks,
                    lastClicked,
                    createdAt: link.createdAt || new Date().toISOString(),
                    todayClicks: link.todayClicks || 0,
                    weekClicks: link.weekClicks || 0,
                    monthClicks: link.monthClicks || 0,
                };
                
                console.log("✅ Processed link:", processedLink);
                return processedLink;
            })
            .filter(link => {
                const hasClicks = link.totalClicks > 0;
                console.log(`🔗 Link ${link.linkId}: ${link.totalClicks} clicks, included: ${hasClicks}`);
                return hasClicks;
            })
            .sort((a, b) => (b.totalClicks || 0) - (a.totalClicks || 0));
            
        console.log("✅ Final processed links:", processedLinks);
        return processedLinks;
    };

    const topLinks = processLinkData();
    console.log("🎯 Top links for display:", topLinks);
    
    if (!topLinks.length) {
        console.log("🚫 No links with clicks to display");
        return (
            <div className="mb-8">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {t('analytics.link_performance') || 'Link Performance'}
                        </h2>
                        {isConnected && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <div className="animate-pulse bg-green-500 w-2 h-2 rounded-full"></div>
                                <span>{t('analytics.real_time_updates') || 'Real-time updates'}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="text-center py-8">
                        <Image 
                            src="https://linktree.sirv.com/Images/icons/links.svg"
                            alt="no data"
                            width={48}
                            height={48}
                            className="mx-auto mb-4 opacity-50"
                        />
                        <p className="text-gray-600 mb-2">
                            {analytics?.topLinks?.length ? 'No links with clicks yet' : 'No link data available'}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            {analytics?.topLinks?.length 
                                ? 'Share your profile to start getting clicks on your links!' 
                                : 'Add links to your profile to track their performance!'
                            }
                        </p>
                        
                        {/* Show available links without clicks */}
                        {analytics?.topLinks?.length > 0 && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-900 mb-2">
                                    Available Links ({analytics.topLinks.length})
                                </h4>
                                <div className="space-y-2">
                                    {analytics.topLinks.slice(0, 5).map((link, index) => (
                                        <div key={link.linkId || index} className="flex items-center justify-between text-xs">
                                            <span className="text-blue-700 truncate">
                                                {getTypeIcon(link.type)} {link.title || 'Untitled'}
                                            </span>
                                            <span className="text-blue-600 font-medium">
                                                {link.totalClicks || 0} clicks
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Prepare data for charts - take top 8 links
    const chartData = topLinks.slice(0, 8).map((link, index) => ({
        name: link.title,
        clicks: link.totalClicks || 0,
        fullTitle: link.fullTitle,
        type: link.type,
        linkId: link.linkId,
        percentage: 0 // Will be calculated below
    }));

    // Calculate percentages
    const totalClicks = chartData.reduce((sum, item) => sum + item.clicks, 0);
    chartData.forEach(item => {
        item.percentage = totalClicks > 0 ? (item.clicks / totalClicks) * 100 : 0;
    });

    console.log("📊 Chart data prepared:", chartData);

    // Colors for the charts
    const colors = [
        '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', 
        '#EF4444', '#EC4899', '#14B8A6', '#F97316'
    ];

    // Find max clicks for scaling
    const maxClicks = Math.max(...chartData.map(item => item.clicks));
    
    console.log("🎨 Rendering full analytics component with", chartData.length, "links");

    return (
        <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {t('analytics.link_performance') || 'Link Performance'}
                    </h2>
                    {isConnected && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <div className="animate-pulse bg-green-500 w-2 h-2 rounded-full"></div>
                            <span>{t('analytics.real_time_updates') || 'Real-time updates'}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Bar Chart */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">
                            {t('analytics.clicks_by_link') || 'Clicks by Link'}
                        </h3>
                        <div className="space-y-3">
                            {chartData.map((item, index) => (
                                <div key={item.linkId} className="group">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <span className="text-lg">{getTypeIcon(item.type)}</span>
                                            <span className="text-sm font-medium text-gray-700 truncate">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 ml-2">
                                            {item.clicks}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                                            style={{ 
                                                width: maxClicks > 0 ? `${(item.clicks / maxClicks) * 100}%` : '0%' 
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-gray-500 capitalize">
                                            {item.type}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {item.percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Distribution Chart */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">
                            {t('analytics.click_distribution') || 'Click Distribution'}
                        </h3>
                        
                        {/* Top Links with Visual Indicators */}
                        <div className="space-y-3">
                            {chartData.slice(0, 6).map((item, index) => (
                                <div key={item.linkId} className="flex items-center gap-3">
                                    <div 
                                        className="w-4 h-4 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: colors[index % colors.length] }}
                                    ></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <span className="text-sm">{getTypeIcon(item.type)}</span>
                                                <span className="text-sm font-medium text-gray-700 truncate">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 ml-2">
                                                {item.clicks}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                            <div 
                                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{ 
                                                    backgroundColor: colors[index % colors.length],
                                                    width: `${item.percentage}%`
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {item.percentage.toFixed(1)}% of total
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {topLinks.length}
                            </p>
                            <p className="text-sm text-gray-600">
                                Active Links
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {analytics.totalClicks || 0}
                            </p>
                            <p className="text-sm text-gray-600">
                                Total Clicks
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                {topLinks.length > 0 ? Math.round((analytics.totalClicks || 0) / topLinks.length) : 0}
                            </p>
                            <p className="text-sm text-gray-600">
                                Avg. per Link
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">
                                {topLinks.filter(link => link.type === 'File').length}
                            </p>
                            <p className="text-sm text-gray-600">
                                File Downloads
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ✅ Helper function for type icons
function getTypeIcon(type) {
    const iconMap = {
        'file': '📄',
        'File': '📄',
        'file_download': '📥',
        'instagram': '📸',
        'twitter': '🐦',
        'tiktok': '🎵',
        'youtube': '📺',
        'spotify': '🎵',
        'social': '👥',
        'video': '🎥',
        'music': '🎶',
        'custom': '🔗',
        'Custom': '🔗'
    };
    return iconMap[type?.toLowerCase()] || '🔗';
}