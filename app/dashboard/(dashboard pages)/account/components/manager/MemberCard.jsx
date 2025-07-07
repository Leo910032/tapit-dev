// app/dashboard/(dashboard pages)/account/components/team/manager/MemberCard.jsx

import { useState } from 'react';
import { useTranslation } from '@/lib/useTranslation';

export const MemberCard = ({ member, onRemove, canRemove, showDetails }) => {
    const { t } = useTranslation();
    const [showActions, setShowActions] = useState(false);

    const formatDate = (date) => {
        if (!date) return 'Unknown';
        return new Date(date.seconds * 1000).toLocaleDateString();
    };

    const formatLastActivity = (date) => {
        if (!date) return 'Never';
        const activityDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
        const now = new Date();
        const diffInHours = (now - activityDate) / (1000 * 60 * 60);
        
        if (diffInHours < 1) return 'Less than 1 hour ago';
        if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
        return activityDate.toLocaleDateString();
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'manager': return 'bg-purple-100 text-purple-800';
            case 'member': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex flex-col p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {member.profilePhoto ? (
                            <img 
                                src={member.profilePhoto} 
                                alt={member.displayName} 
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            member.displayName?.charAt(0).toUpperCase() || member.username?.charAt(0).toUpperCase()
                        )}
                    </div>

                    {/* Member Info */}
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">
                                {member.displayName || member.username}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.teamRole)}`}>
                                {member.teamRole}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-xs text-gray-500">
                            {t('teams.joined') || 'Joined'}: {formatDate(member.joinedAt)}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                {canRemove && (
                    <div className="relative">
                        <button
                            onClick={() => setShowActions(!showActions)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>

                        {showActions && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                                <button
                                    onClick={() => {
                                        onRemove(member.userId);
                                        setShowActions(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    {t('teams.remove_member') || 'Remove from team'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Member Analytics (shown when showDetails is true) */}
            {showDetails && member.stats && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-lg font-semibold text-green-600">{member.stats.totalViews}</div>
                            <div className="text-xs text-gray-500">Views</div>
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-blue-600">{member.stats.totalClicks}</div>
                            <div className="text-xs text-gray-500">Clicks</div>
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-purple-600">{member.stats.totalContacts}</div>
                            <div className="text-xs text-gray-500">Contacts</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-600">{formatLastActivity(member.stats.lastActivity)}</div>
                            <div className="text-xs text-gray-500">Last Active</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};