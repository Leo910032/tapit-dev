// app/dashboard/(dashboard pages)/account/components/team/TeamManagerView.jsx

import { useState } from 'react';
import { TeamHeader } from '../manager/TeamHeader';
import { TeamMembersList } from '../manager/TeamMembersList';
import { TeamSettingsPanel } from '../manager/TeamSettingsPanel';
import { InviteMemberModal } from '../manager/InviteMemberModal';
import { PendingJoinRequests } from '../manager/PendingJoinRequests';


export const TeamManagerView = ({ 
    userData,
    teamData, 
    userRole, // Add this prop
    members, 
    onRemoveMember, 
    onUpdateSettings, 
    onRegenerateCode, 
    onDeleteTeam,
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showDangerZone, setShowDangerZone] = useState(false);

    return (
        <div className="space-y-4">
            <div className="space-y-6">
                {/* Team Header with Stats */}
                <TeamHeader 
                    teamData={teamData}
                    onShowInviteModal={() => setShowInviteModal(true)}
                    onShowSettings={() => setShowSettings(!showSettings)}
                />
                    <PendingJoinRequests teamData={teamData} />


                {/* Team Settings */}
                {showSettings && (
                    <TeamSettingsPanel 
                        teamData={teamData} 
                        onUpdate={onUpdateSettings}
                        onRegenerateCode={onRegenerateCode}
                        onDeleteTeam={onDeleteTeam}
                        onClose={() => setShowSettings(false)}
                        showDangerZone={showDangerZone}
                        onToggleDangerZone={() => setShowDangerZone(!showDangerZone)}
                    />
                )}

                {/* Members List */}
                <TeamMembersList 
                    members={members}
                    onRemoveMember={onRemoveMember}
                />

                {/* Invite Modal - NOW WITH PROPER PROPS */}
                {showInviteModal && (
                    <InviteMemberModal 
                        teamData={teamData}
                        userRole={userRole} // Pass the user role
                        onClose={() => setShowInviteModal(false)}
                    />
                )}
            </div>
        </div>
    );
};