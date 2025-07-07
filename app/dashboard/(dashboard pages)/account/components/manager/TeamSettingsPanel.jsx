// app/dashboard/(dashboard pages)/account/components/team/manager/TeamSettingsPanel.jsx

import { useState } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { toast } from 'react-hot-toast';

export const TeamSettingsPanel = ({ 
    teamData, 
    onUpdate, 
    onRegenerateCode, 
    onDeleteTeam, 
    onClose, 
    showDangerZone, 
    onToggleDangerZone 
}) => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState({
        teamName: teamData.teamName || '',
        description: teamData.description || '',
        allowMemberAnalytics: teamData.settings?.allowMemberAnalytics ?? true,
        allowContactSharing: teamData.settings?.allowContactSharing ?? true,
        allowMemberInvites: teamData.settings?.allowMemberInvites ?? false,
        requireApprovalForJoin: teamData.settings?.requireApprovalForJoin ?? false,
    });
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await onUpdate(settings);
            toast.success(t('teams.settings_updated') || 'Settings updated successfully!');
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRegenerateCode = async () => {
        if (!confirm(t('teams.confirm_regenerate_code') || 'Are you sure? This will invalidate the current team code and all pending invitations.')) {
            return;
        }
        
        try {
            await onRegenerateCode();
            toast.success(t('teams.code_regenerated') || 'Team code regenerated successfully!');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDeleteTeam = async () => {
        const confirmText = teamData.teamName;
        const userInput = prompt(
            `${t('teams.confirm_delete_team') || 'This will permanently delete your team and remove all members. Type'} "${confirmText}" ${t('teams.to_confirm') || 'to confirm'}:`
        );
        
        if (userInput === confirmText) {
            try {
                await onDeleteTeam();
                toast.success(t('teams.team_deleted') || 'Team deleted successfully');
            } catch (error) {
                toast.error(error.message);
            }
        } else if (userInput !== null) {
            toast.error(t('teams.delete_cancelled') || 'Team deletion cancelled - text did not match');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">{t('teams.team_settings') || 'Team Settings'}</h3>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('teams.team_name') || 'Team Name'}
                        </label>
                        <input
                            type="text"
                            value={settings.teamName}
                            onChange={(e) => setSettings({...settings, teamName: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            maxLength={50}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('teams.description') || 'Description'}
                        </label>
                        <textarea
                            value={settings.description}
                            onChange={(e) => setSettings({...settings, description: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            maxLength={200}
                        />
                    </div>
                </div>

                {/* Permission Settings */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">{t('teams.permissions') || 'Permissions'}</h4>
                    
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={settings.allowMemberAnalytics}
                            onChange={(e) => setSettings({...settings, allowMemberAnalytics: e.target.checked})}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                            {t('teams.allow_member_analytics') || 'Allow members to view team analytics'}
                        </span>
                    </label>

                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={settings.allowContactSharing}
                            onChange={(e) => setSettings({...settings, allowContactSharing: e.target.checked})}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                            {t('teams.allow_contact_sharing') || 'Allow contact list sharing'}
                        </span>
                    </label>

                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={settings.allowMemberInvites}
                            onChange={(e) => setSettings({...settings, allowMemberInvites: e.target.checked})}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                            {t('teams.allow_member_invites') || 'Allow members to invite others'}
                        </span>
                    </label>

                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={settings.requireApprovalForJoin}
                            onChange={(e) => setSettings({...settings, requireApprovalForJoin: e.target.checked})}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                            {t('teams.require_approval') || 'Require approval for new members'}
                        </span>
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        {t('common.cancel') || 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isUpdating ? (t('common.saving') || 'Saving...') : (t('common.save') || 'Save Changes')}
                    </button>
                </div>
            </form>

            {/* Danger Zone */}
            <div className="mt-6 pt-6 border-t">
                <button
                    onClick={onToggleDangerZone}
                    className="flex items-center text-red-600 hover:text-red-700 font-medium"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    {t('teams.danger_zone') || 'Danger Zone'}
                </button>

                {showDangerZone && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h5 className="font-medium text-red-900">{t('teams.regenerate_code_title') || 'Regenerate Team Code'}</h5>
                                <p className="text-sm text-red-700">{t('teams.regenerate_code_desc') || 'This will invalidate the current code and all pending invitations.'}</p>
                            </div>
                            <button
                                onClick={handleRegenerateCode}
                                className="px-3 py-2 text-red-600 border border-red-300 rounded hover:bg-red-100 transition-colors"
                            >
                                {t('teams.regenerate') || 'Regenerate'}
                            </button>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-red-200">
                            <div>
                                <h5 className="font-medium text-red-900">{t('teams.delete_team_title') || 'Delete Team'}</h5>
                                <p className="text-sm text-red-700">{t('teams.delete_team_desc') || 'Permanently delete this team and remove all members.'}</p>
                            </div>
                            <button
                                onClick={handleDeleteTeam}
                                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                                {t('teams.delete') || 'Delete'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};