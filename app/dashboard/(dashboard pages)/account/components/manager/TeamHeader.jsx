// app/dashboard/(dashboard pages)/account/components/team/manager/TeamHeader.jsx - ENHANCED WITH REAL-TIME UPDATES

import { useTranslation } from '@/lib/useTranslation';
import { toast } from 'react-hot-toast';

export const TeamHeader = ({ teamData, onShowInviteModal, onShowSettings }) => {
    const { t } = useTranslation();

    const copyTeamCode = async () => {
        try {
            await navigator.clipboard.writeText(teamData.teamCode);
            toast.success(t('teams.code_copied') || 'Team code copied to clipboard!');
        } catch (error) {
            toast.error(t('teams.copy_failed') || 'Failed to copy code');
        }
    };

    // ✅ NEW: Format timestamp for better display
    const formatLastUpdated = (timestamp) => {
        if (!timestamp) return 'Never';
        
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        const now = new Date();
        const diffInMinutes = (now - date) / (1000 * 60);
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)} minutes ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{teamData.teamName}</h2>
                    <p className="text-gray-600">{teamData.description || 'No description'}</p>
                
                    {/* ✅ ENHANCED: Better real-time indicator */}
                    {teamData.teamStats?.lastUpdated && (
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                                <span className="text-xs text-green-600 font-medium">{t("contacts.live_updates")}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                                • {t("analytics.last_updated")}: {formatLastUpdated(teamData.teamStats.lastUpdated)}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onShowInviteModal}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {t('teams.invite_member') || 'Invite Member'}
                    </button>
                    <button
                        onClick={onShowSettings}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        {t('teams.settings') || 'Settings'}
                    </button>
                </div>
            </div>

            {/* ✅ ENHANCED: Better team stats with animations and colors */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                <div className="text-center group hover:bg-white rounded-lg p-2 transition-all duration-300">
                    <div className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform">
                        {teamData.memberCount}
                    </div>
                    <div className="text-sm text-gray-600">{t('teams.members') || 'Members'}</div>
                </div>
                
                <div className="text-center group hover:bg-white rounded-lg p-2 transition-all duration-300">
                    <div className="text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform">
                        {(teamData.teamStats?.totalViews || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">{t('teams.total_views') || 'Total Views'}</div>
                    {/* ✅ NEW: Show if this stat was recently updated */}
                    {teamData.teamStats?.lastUpdated && (
                        <div className="w-1 h-1 bg-green-400 rounded-full mx-auto mt-1 animate-pulse"></div>
                    )}
                </div>
                
                <div className="text-center group hover:bg-white rounded-lg p-2 transition-all duration-300">
                    <div className="text-2xl font-bold text-purple-600 group-hover:scale-110 transition-transform">
                        {(teamData.teamStats?.totalClicks || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">{t('teams.total_clicks') || 'Total Clicks'}</div>
                    {teamData.teamStats?.lastUpdated && (
                        <div className="w-1 h-1 bg-purple-400 rounded-full mx-auto mt-1 animate-pulse"></div>
                    )}
                </div>
                
                <div className="text-center group hover:bg-white rounded-lg p-2 transition-all duration-300">
                    <div className="text-2xl font-bold text-orange-600 group-hover:scale-110 transition-transform">
                        {(teamData.teamStats?.totalContacts || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">{t('teams.total_contacts') || 'Total Contacts'}</div>
                    {teamData.teamStats?.lastUpdated && (
                        <div className="w-1 h-1 bg-orange-400 rounded-full mx-auto mt-1 animate-pulse"></div>
                    )}
                </div>
                
                <div className="text-center group hover:bg-white rounded-lg p-2 transition-all duration-300">
                    <div 
                        className="text-2xl font-bold text-indigo-600 cursor-pointer hover:bg-indigo-50 px-2 py-1 rounded group-hover:scale-110 transition-all"
                        onClick={copyTeamCode}
                        title="Click to copy team code"
                    >
                        {teamData.teamCode}
                    </div>
                    <div className="text-sm text-gray-600">{t('teams.join_code') || 'Join Code'}</div>
                    <div className="text-xs text-gray-400 mt-1">{t('teams.click_to_copy')}</div>
                </div>
            </div>

            {/* ✅ NEW: Real-time activity indicator */}
            {teamData.teamStats?.lastAggregation && (
                <div className="mt-3 flex items-center justify-center">
                    <div className="bg-green-100 border border-green-200 rounded-full px-3 py-1 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-700 font-medium">
                            {t('teams.Auto')}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};