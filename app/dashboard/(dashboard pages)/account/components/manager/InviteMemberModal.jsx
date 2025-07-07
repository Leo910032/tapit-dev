// app/dashboard/(dashboard pages)/account/components/team/manager/InviteMemberModal.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { toast } from 'react-hot-toast';
import { sendTeamInvitation } from '@/lib/teamManagement';
import { testForActiveSession } from '@/lib/authentication/testForActiveSession';

export const InviteMemberModal = ({ teamData, userRole, onClose }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [canInvite, setCanInvite] = useState(false);

    // Check invitation permissions
    useEffect(() => {
        const currentUserId = testForActiveSession();
        if (!currentUserId || !teamData) {
            setCanInvite(false);
            return;
        }

        // Debug information
        console.log('🔍 Permission Check Debug:', {
            currentUserId,
            userRole,
            teamData: teamData,
            allowMemberInvites: teamData.settings?.allowMemberInvites,
            managerId: teamData.managerId
        });

        // Determine user role if not provided
        let actualUserRole = userRole;
        if (!actualUserRole) {
            if (currentUserId === teamData.managerId) {
                actualUserRole = 'manager';
            } else {
                actualUserRole = 'member';
            }
        }

        // Managers can always invite
        if (actualUserRole === 'manager' || currentUserId === teamData.managerId) {
            console.log('✅ Manager permission found');
            setCanInvite(true);
            return;
        }

        // Members can invite only if allowMemberInvites is enabled
        if (actualUserRole === 'member' && teamData.settings?.allowMemberInvites === true) {
            console.log('✅ Member invitation permission found');
            setCanInvite(true);
            return;
        }

        console.log('❌ No permission found');
        setCanInvite(false);
    }, [teamData, userRole]);

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!email || isInviting || !canInvite) return;

        setIsInviting(true);
        try {
            // Use the current user's ID (could be manager or member with permission)
            const currentUserId = testForActiveSession();
            await sendTeamInvitation(currentUserId, email, message);
            toast.success(t('teams.invitation_sent') || 'Invitation sent successfully!');
            setEmail('');
            setMessage('');
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsInviting(false);
        }
    };

    // If user doesn't have permission, show permission denied message
    if (!canInvite) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                    <div className="flex items-center justify-between p-6 border-b">
                        <h3 className="text-lg font-semibold">{t('teams.invite_member') || 'Invite Team Member'}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {t('teams.invitation_disabled') || 'Invitations Disabled'}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                            {teamData.settings?.allowMemberInvites === false 
                                ? (t('teams.member_invite_disabled') || 'Only team managers can send invitations. Ask your manager to enable member invitations in team settings.')
                                : (t('teams.no_permission') || 'You do not have permission to send team invitations.')
                            }
                        </p>
                        
                        {/* Show team code as alternative */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                            <div className="flex">
                                <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">{t('teams.alternative_option') || 'Alternative:'}</p>
                                    <p>{t('teams.share_team_code') || 'Share the team code'} <strong>{teamData.teamCode}</strong> {t('teams.for_manual_join') || 'for others to join manually.'}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            {t('common.close') || 'Close'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold">{t('teams.invite_member') || 'Invite Team Member'}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleInvite} className="p-6 space-y-4">
                    {/* Show permission indicator */}
                    {teamData.settings?.allowMemberInvites === true && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                            <div className="flex">
                                <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm text-green-800">
                                    <p className="font-medium">{t('teams.member_invite_enabled') || 'Member invitations enabled'}</p>
                                    <p className="text-xs mt-1">{t('teams.manager_allows_invites') || 'Your team manager has allowed members to send invitations.'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('teams.email_address') || 'Email Address'}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="member@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('teams.personal_message') || 'Personal Message (Optional)'}
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder={t('teams.invite_message_placeholder') || 'Join our team to collaborate...'}
                            maxLength={200}
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                            <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">{t('teams.team_code_info') || 'Alternative:'}</p>
                                <p>{t('teams.share_code_instead') || 'You can also share the team code'} <strong>{teamData.teamCode}</strong> {t('teams.for_manual_join') || 'for members to join manually.'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            {t('common.cancel') || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={isInviting || !email}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {isInviting ? (t('teams.sending') || 'Sending...') : (t('teams.send_invite') || 'Send Invite')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};