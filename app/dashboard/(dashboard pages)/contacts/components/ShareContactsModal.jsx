// components/ShareContactsModal.jsx - Modal for sharing contacts with team members

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { toast } from 'react-hot-toast';
import { 
    shareContactsWithTeam, 
    getTeamMembersForSharing, 
    checkTeamContactSharingEnabled 
} from '@/lib/teamContactSharing';

export function ShareContactsModal({ 
    isOpen, 
    onClose, 
    contacts = [], 
    selectedContactIds = [], 
    userId 
}) {
    const { t } = useTranslation();
    const [teamMembers, setTeamMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [shareWithAll, setShareWithAll] = useState(true);
    const [isSharing, setIsSharing] = useState(false);
    const [sharingEnabled, setSharingEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load team members and check permissions
    useEffect(() => {
        if (isOpen && userId) {
            loadTeamData();
        }
    }, [isOpen, userId]);

    const loadTeamData = async () => {
        try {
            setLoading(true);
            
            // Check if contact sharing is enabled
            const enabled = await checkTeamContactSharingEnabled(userId);
            setSharingEnabled(enabled);

            if (enabled) {
                // Get team members
                const members = await getTeamMembersForSharing(userId);
                setTeamMembers(members);
            }
        } catch (error) {
            console.error('Error loading team data:', error);
            toast.error('Failed to load team information');
        } finally {
            setLoading(false);
        }
    };

    const handleMemberToggle = (memberId) => {
        setSelectedMembers(prev => 
            prev.includes(memberId) 
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleShareModeChange = (shareAll) => {
        setShareWithAll(shareAll);
        if (shareAll) {
            setSelectedMembers([]);
        }
    };

    const handleShare = async () => {
        if (!shareWithAll && selectedMembers.length === 0) {
            toast.error('Please select at least one team member');
            return;
        }

        setIsSharing(true);
        try {
            const targetMembers = shareWithAll ? 'all' : selectedMembers;
            const result = await shareContactsWithTeam(selectedContactIds, userId, targetMembers);

            const successfulShares = result.results.filter(r => r.contactsShared > 0);
            const failedShares = result.results.filter(r => r.contactsShared === 0);

            if (successfulShares.length > 0) {
                toast.success(
                    `Successfully shared ${result.totalContactsShared} contact(s) with ${successfulShares.length} team member(s)`,
                    { duration: 4000 }
                );
            }

            if (failedShares.length > 0) {
                toast.error(
                    `Failed to share with ${failedShares.length} member(s) (possible duplicates)`,
                    { duration: 3000 }
                );
            }

            onClose();
        } catch (error) {
            console.error('Error sharing contacts:', error);
            toast.error(error.message || 'Failed to share contacts');
        } finally {
            setIsSharing(false);
        }
    };

    if (!isOpen) return null;

    // Get contacts to share
    const contactsToShare = contacts.filter(contact => 
        selectedContactIds.includes(contact.id)
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {t('contacts.share_with_team') || 'Share with Team'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        disabled={isSharing}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading team information...</span>
                        </div>
                    ) : !sharingEnabled ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {t('contacts.sharing_disabled') || 'Contact Sharing Disabled'}
                            </h3>
                            <p className="text-gray-500 text-sm">
                                {t('contacts.sharing_disabled_message') || 'Contact sharing is not enabled for your team. Ask your team manager to enable it in team settings.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Contacts to share */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">
                                    {t('contacts.contacts_to_share') || 'Contacts to Share'} ({contactsToShare.length})
                                </h4>
                                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                                    {contactsToShare.map(contact => (
                                        <div key={contact.id} className="flex items-center gap-3 py-1">
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                {contact.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {contact.name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {contact.email}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Share mode selection */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">
                                    {t('contacts.share_with') || 'Share With'}
                                </h4>
                                
                                <div className="space-y-3">
                                    {/* Share with all members */}
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={shareWithAll}
                                            onChange={() => handleShareModeChange(true)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            disabled={isSharing}
                                        />
                                        <span className="ml-3 text-sm text-gray-700">
                                            {t('contacts.all_team_members') || 'All Team Members'} ({teamMembers.length})
                                        </span>
                                    </label>

                                    {/* Share with specific members */}
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={!shareWithAll}
                                            onChange={() => handleShareModeChange(false)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            disabled={isSharing}
                                        />
                                        <span className="ml-3 text-sm text-gray-700">
                                            {t('contacts.specific_members') || 'Specific Members'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Team members selection */}
                            {!shareWithAll && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                                        {t('contacts.select_members') || 'Select Members'}
                                    </h4>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {teamMembers.map(member => (
                                            <label key={member.userId} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMembers.includes(member.userId)}
                                                    onChange={() => handleMemberToggle(member.userId)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    disabled={isSharing}
                                                />
                                                <div className="ml-3 flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                        {(member.displayName || member.username).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {member.displayName || member.username}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {member.teamRole} • {member.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Warning message */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                                <div className="flex">
                                    <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div className="text-sm text-yellow-800">
                                        <p className="font-medium mb-1">
                                            {t('contacts.sharing_notice') || 'Important Notice'}
                                        </p>
                                        <p>
                                            {t('contacts.sharing_warning') || 'Shared contacts will be added to team members\' contact lists. They can view but not edit these contacts.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    disabled={isSharing}
                                >
                                    {t('common.cancel') || 'Cancel'}
                                </button>
                                <button
                                    onClick={handleShare}
                                    disabled={isSharing || (!shareWithAll && selectedMembers.length === 0)}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSharing && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    )}
                                    {isSharing 
                                        ? (t('contacts.sharing') || 'Sharing...') 
                                        : (t('contacts.share_contacts') || 'Share Contacts')
                                    }
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}