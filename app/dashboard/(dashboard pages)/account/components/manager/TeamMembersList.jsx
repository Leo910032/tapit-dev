// app/dashboard/(dashboard pages)/account/components/team/manager/TeamMembersList.jsx

import { useState } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { MemberCard } from './MemberCard';

export const TeamMembersList = ({ members, onRemoveMember }) => {
    const { t } = useTranslation();
    const [showMemberDetails, setShowMemberDetails] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('teams.team_members') || 'Team Members'}</h3>
                <button
                    onClick={() => setShowMemberDetails(!showMemberDetails)}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
 {showMemberDetails 
        ? (t('teams.hide_details') || 'Hide Details')
        : (t('teams.show_details') || 'Show Details')
    }                </button>
            </div>
            <div className="space-y-4">
                {members.map((member) => (
                    <MemberCard 
                        key={member.userId} 
                        member={member} 
                        onRemove={onRemoveMember}
                        canRemove={member.teamRole !== 'manager'}
                        showDetails={showMemberDetails}
                    />
                ))}
            </div>
        </div>
    );
};