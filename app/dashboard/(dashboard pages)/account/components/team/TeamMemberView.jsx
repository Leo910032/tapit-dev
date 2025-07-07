// app/dashboard/(dashboard pages)/account/components/team/TeamMemberView.jsx

import { useState } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { InviteMemberModal } from '../manager/InviteMemberModal';

export const TeamMemberView = ({ userData, teamData, userRole, onLeaveTeam }) => {
    const { t } = useTranslation();
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Check if member can invite others
    const canInviteMembers = teamData.settings?.allowMemberInvites === true;

    return (
        <div className="space-y-6">
            {/* Main Team Info Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {t('teams.member_title') || 'Your Team'}
                        </h2>
                        <p className="text-gray-600">
                            {t('teams.member_subtitle') || 'You are a member of this team.'}
                        </p>
                    </div>
                    
                    {/* Member Invite Button - Only show if enabled */}
                    {canInviteMembers && (
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t('teams.invite_member') || 'Invite Member'}
                        </button>
                    )}
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2 text-sm">
                    <p><strong>{t('teams.team_name') || 'Team Name'}:</strong> {teamData.teamName}</p>
                    <p><strong>{t('teams.role') || 'Your Role'}:</strong> <span className="capitalize">{userData.teamRole}</span></p>
                    <p><strong>{t('teams.members') || 'Members'}:</strong> {teamData.memberCount}</p>
                    {teamData.description && (
                        <p><strong>{t('teams.description') || 'Description'}:</strong> {teamData.description}</p>
                    )}
                </div>

                {/* Member Permissions Indicator */}
                {canInviteMembers && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <div className="text-sm">
                                <p className="font-medium text-blue-900">
                                    {t('teams.invite_permission_enabled') || 'You can invite new members'}
                                </p>
                                <p className="text-blue-700 text-xs">
                                    {t('teams.invite_permission_desc') || 'Your team manager has allowed members to send invitations.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Team Stats for Members (if allowed) */}
            {teamData.settings?.allowMemberAnalytics && teamData.teamStats && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-medium text-gray-900 mb-4">
                        {t('teams.team_analytics') || 'Team Analytics'}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {teamData.teamStats.totalViews || 0}
                            </div>
                            <div className="text-sm text-gray-600">
                                {t('teams.total_views') || 'Total Views'}
                            </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {teamData.teamStats.totalClicks || 0}
                            </div>
                            <div className="text-sm text-gray-600">
                                {t('teams.total_clicks') || 'Total Clicks'}
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {teamData.teamStats.totalContacts || 0}
                            </div>
                            <div className="text-sm text-gray-600">
                                {t('teams.total_contacts') || 'Total Contacts'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Permissions Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-medium text-gray-900 mb-4">
                    {t('teams.your_permissions') || 'Your Permissions'}
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${teamData.settings?.allowMemberAnalytics ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-700">
                            {t('teams.view_analytics') || 'View team analytics'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${teamData.settings?.allowMemberAnalytics ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {teamData.settings?.allowMemberAnalytics ? (t('common.enabled') || 'Enabled') : (t('common.disabled') || 'Disabled')}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${teamData.settings?.allowContactSharing ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-700">
                            {t('teams.share_contacts') || 'Share contacts with team'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${teamData.settings?.allowContactSharing ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {teamData.settings?.allowContactSharing ? (t('common.enabled') || 'Enabled') : (t('common.disabled') || 'Disabled')}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${canInviteMembers ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-700">
                            {t('teams.invite_members') || 'Invite new members'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${canInviteMembers ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {canInviteMembers ? (t('common.enabled') || 'Enabled') : (t('common.disabled') || 'Disabled')}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Leave Team Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="border-t pt-4">
                    <button
                        onClick={onLeaveTeam}
                        className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        {t('teams.leave_team') || 'Leave Team'}
                    </button>
                </div>
            </div>

            {/* Invite Modal - For Members with Permission */}
            {showInviteModal && (
                <InviteMemberModal 
                    teamData={teamData}
                    userRole={userRole}
                    onClose={() => setShowInviteModal(false)}
                />
            )}
        </div>
    );
};