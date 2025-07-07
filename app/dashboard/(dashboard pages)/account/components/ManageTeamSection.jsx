// app/dashboard/(dashboard pages)/account/components/ManageTeamSection.jsx - ENHANCED WITH REAL-TIME ANALYTICS
"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { toast } from 'react-hot-toast';
import { testForActiveSession } from '@/lib/authentication/testForActiveSession';
import { doc, onSnapshot, collection, query, where, getDoc } from 'firebase/firestore';
import { fireApp } from '@/important/firebase';
import { PendingApprovalStatus } from './member/PendingApprovalStatus';

import { 
    createTeam, 
    joinTeamByCode, 
    getTeamMembers, 
    getTeamMembersWithAnalytics,
    aggregateTeamAnalytics,
    updateTeamSettings,
    regenerateTeamCode,
    removeTeamMember,
    sendTeamInvitation,
    leaveTeam,
    deleteTeam
} from '@/lib/teamManagement';

// Import our new components
import { 
    SkeletonLoader,
    UpgradeView,
    TeamManagerView,
    TeamMemberView,
    CreateTeamView,
    JoinTeamView
} from './team';

export default function ManageTeamSection() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [teamData, setTeamData] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ✅ NEW: Real-time analytics aggregation
    const [analyticsListeners, setAnalyticsListeners] = useState([]);

    // Real-time data fetching with Firebase listeners + ANALYTICS TRACKING
    useEffect(() => {
        const userId = testForActiveSession();
        if (!userId) {
            setLoading(false);
            return;
        }

        let unsubscribeTeam = null;
        let unsubscribeMembers = null;
        let analyticsUnsubscribers = [];
        
        const userRef = doc(fireApp, "AccountData", userId);
        const unsubscribeUser = onSnapshot(userRef, async (docSnap) => {
            // Cleanup previous subscriptions
            if (unsubscribeTeam) {
                unsubscribeTeam();
                unsubscribeTeam = null;
            }
            if (unsubscribeMembers) {
                unsubscribeMembers();
                unsubscribeMembers = null;
            }
            
            // ✅ NEW: Cleanup analytics listeners
            analyticsUnsubscribers.forEach(unsub => unsub());
            analyticsUnsubscribers = [];

            if (docSnap.exists()) {
                const data = { userId, ...docSnap.data() };
                setUserData(data);

                if (data.teamId) {
                    // Subscribe to team data changes
                    const teamRef = doc(fireApp, "Teams", data.teamId);
                    unsubscribeTeam = onSnapshot(teamRef, (teamSnap) => {
                        if (teamSnap.exists()) {
                            setTeamData(teamSnap.data());
                        } else {
                            setTeamData(null);
                        }
                    });

                    // If user is a team manager, also subscribe to team members AND their analytics
                    if (data.isTeamManager) {
                        console.log('🔥 Setting up REAL-TIME team analytics tracking...');
                        
                        // Subscribe to all team members in real-time
                        const usersRef = collection(fireApp, "AccountData");
                        const membersQuery = query(usersRef, where("teamId", "==", data.teamId));
                        
                        unsubscribeMembers = onSnapshot(membersQuery, async (snapshot) => {
                            const members = [];
                            
                            // ✅ NEW: Set up real-time analytics listeners for each member
                            snapshot.docs.forEach(memberDoc => {
                                const memberUserId = memberDoc.id;
                                const userData = memberDoc.data();
                                
                                // Real-time analytics listener for this member
                                const analyticsRef = doc(fireApp, "Analytics", memberUserId);
                                const analyticsUnsub = onSnapshot(analyticsRef, async (analyticsSnap) => {
                                    console.log(`📊 Analytics updated for team member: ${memberUserId}`);
                                    
                                    // Trigger team analytics aggregation when any member's analytics change
                                    try {
                                        await aggregateTeamAnalytics(data.teamId);
                                        console.log('✅ Team analytics auto-updated after member analytics change');
                                    } catch (error) {
                                        console.error('❌ Failed to auto-update team analytics:', error);
                                    }
                                });
                                
                                analyticsUnsubscribers.push(analyticsUnsub);

                                // Real-time contacts listener for this member
                                const contactsRef = doc(fireApp, "Contacts", memberUserId);
                                const contactsUnsub = onSnapshot(contactsRef, async (contactsSnap) => {
                                    console.log(`📇 Contacts updated for team member: ${memberUserId}`);
                                    
                                    // Trigger team analytics aggregation when any member's contacts change
                                    try {
                                        await aggregateTeamAnalytics(data.teamId);
                                        console.log('✅ Team analytics auto-updated after member contacts change');
                                    } catch (error) {
                                        console.error('❌ Failed to auto-update team analytics:', error);
                                    }
                                });
                                
                                analyticsUnsubscribers.push(contactsUnsub);
                            });
                            
                            // Process each member document for the UI
                            for (const docSnap of snapshot.docs) {
                                const userData = docSnap.data();
                                
                                // Get member's current analytics
                                let memberStats = {
                                    totalViews: 0,
                                    totalClicks: 0,
                                    totalContacts: 0,
                                    lastActivity: null
                                };

                                try {
                                    const analyticsRef = doc(fireApp, "Analytics", docSnap.id);
                                    const analyticsSnap = await getDoc(analyticsRef);
                                    if (analyticsSnap.exists()) {
                                        const analyticsData = analyticsSnap.data();
                                        memberStats = {
                                            totalViews: analyticsData.totalViews || 0,
                                            totalClicks: analyticsData.totalClicks || 0,
                                            lastActivity: analyticsData.lastUpdated || null
                                        };
                                    }

                                    // Get contacts count
                                    const contactsRef = doc(fireApp, "Contacts", docSnap.id);
                                    const contactsSnap = await getDoc(contactsRef);
                                    if (contactsSnap.exists()) {
                                        const contactsData = contactsSnap.data();
                                        memberStats.totalContacts = contactsData.contacts?.length || 0;
                                    }
                                } catch (error) {
                                    console.log('Could not fetch analytics for user:', docSnap.id);
                                }

                                members.push({
                                    userId: docSnap.id,
                                    username: userData.username,
                                    displayName: userData.displayName,
                                    email: userData.email,
                                    teamRole: userData.teamRole,
                                    profilePhoto: userData.profilePhoto,
                                    joinedAt: userData.joinedTeamAt || null,
                                    isOnline: false,
                                    stats: memberStats,
                                    permissions: {
                                        canViewAnalytics: true,
                                        canViewContacts: true,
                                        canInviteMembers: true
                                    }
                                });
                            }

                            // Sort by role (manager first) then by join date
                            members.sort((a, b) => {
                                if (a.teamRole === 'manager' && b.teamRole !== 'manager') return -1;
                                if (b.teamRole === 'manager' && a.teamRole !== 'manager') return 1;
                                return new Date(b.joinedAt || 0) - new Date(a.joinedAt || 0);
                            });

                            setTeamMembers(members);
                        });
                    }
                } else {
                    setTeamData(null);
                    setTeamMembers([]);
                }
                setLoading(false);
            } else {
                setUserData(null);
                setTeamData(null);
                setTeamMembers([]);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeUser();
            if (unsubscribeTeam) {
                unsubscribeTeam();
            }
            if (unsubscribeMembers) {
                unsubscribeMembers();
            }
            // ✅ NEW: Cleanup analytics listeners
            analyticsUnsubscribers.forEach(unsub => unsub());
        };
    }, []);

    // Event handlers (same as before)
    const handleCreateTeam = async (teamName) => {
        setIsSubmitting(true);
        try {
            const result = await createTeam(userData.userId, teamName);
            toast.success(
                `${t('teams.create_success') || 'Team created successfully!'}\n` +
                `${t('teams.team_code') || 'Team Code:'} ${result.teamCode}`,
                { duration: 6000 }
            );
            
            if (navigator.clipboard) {
                try {
                    await navigator.clipboard.writeText(result.teamCode);
                    toast.success(t('teams.code_copied') || 'Team code copied to clipboard!');
                } catch (clipboardError) {
                    console.log('Clipboard access denied');
                }
            }
        } catch (error) {
            console.error('Team creation error:', error);
            toast.error(error.message || (t('teams.create_failed') || 'Failed to create team.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleJoinTeam = async (teamCode) => {
        setIsSubmitting(true);
        try {
            const result = await joinTeamByCode(userData.userId, teamCode);
            
            if (result.status === 'pending_approval') {
                toast.success(t('teams.join_request_sent') || 'Join request sent for approval!');
            } else {
                toast.success(`${t('teams.join_success') || 'Successfully joined'} "${result.teamName}"!`);
            }
        } catch (error) {
            console.error('Team join error:', error);
            toast.error(error.message || (t('teams.join_failed') || 'Failed to join team.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveMember = async (memberUserId) => {
        if (!confirm(t('teams.confirm_remove_member') || 'Are you sure you want to remove this member?')) {
            return;
        }

        try {
            await removeTeamMember(userData.userId, memberUserId);
            toast.success(t('teams.member_removed') || 'Member removed successfully!');
            // Real-time listeners will update automatically
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleUpdateSettings = async (newSettings) => {
        await updateTeamSettings(userData.userId, newSettings);
        // Real-time listeners will update automatically
    };

    const handleRegenerateCode = async () => {
        const result = await regenerateTeamCode(userData.userId);
        // Real-time listeners will update automatically
        return result;
    };

    const handleDeleteTeam = async () => {
        await deleteTeam(userData.userId);
        // Real-time listeners will update automatically
    };

    const handleLeaveTeam = async () => {
        if (confirm(t('teams.confirm_leave') || 'Are you sure you want to leave this team?')) {
            try {
                await leaveTeam(userData.userId);
                toast.success(t('teams.left_team') || 'Left team successfully!');
                // Real-time listeners will update automatically
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    if (loading) return <SkeletonLoader />;

    if (!userData) {
        return (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                {t('errors.user_not_found') || 'User not found. Please try logging in again.'}
            </div>
        );
    }
    
    // STATE 1: User is a team manager with members
    if (!userData.teamId && !userData.isTeamManager) {
        return (
            <div className="space-y-8">
                <PendingApprovalStatus />
                <JoinTeamView 
                    onJoinTeam={handleJoinTeam}
                    isSubmitting={isSubmitting}
                />
                {userData.accountType !== 'team_manager' && <UpgradeView />}
            </div>
        );
    }

    if (userData.isTeamManager && userData.teamId && teamData) {
        return (
            <TeamManagerView 
                userData={userData}
                teamData={teamData}
                userRole="manager"
                members={teamMembers}
                onRemoveMember={handleRemoveMember}
                onUpdateSettings={handleUpdateSettings}
                onRegenerateCode={handleRegenerateCode}
                onDeleteTeam={handleDeleteTeam}
            />
        );
    }

    // STATE 2: User is a team member
    if (userData.teamId && !userData.isTeamManager && teamData) {
        return (
            <TeamMemberView 
                userData={userData}
                teamData={teamData}
                onLeaveTeam={handleLeaveTeam}
            />
        );
    }
    
    // STATE 3: User without team manager plan
    if (userData.accountType !== 'team_manager') {
        return (
            <div className="space-y-8">
                <JoinTeamView 
                    onJoinTeam={handleJoinTeam}
                    isSubmitting={isSubmitting}
                />
                <UpgradeView />
            </div>
        );
    }

    // STATE 4: Team manager without a team (can create one)
    return (
        <div className="space-y-8">
            <CreateTeamView 
                onCreateTeam={handleCreateTeam}
                isSubmitting={isSubmitting}
            />
            <JoinTeamView 
                onJoinTeam={handleJoinTeam}
                isSubmitting={isSubmitting}
                title={t('teams.join_existing_title') || 'Join an Existing Team'}
                subtitle={t('teams.join_existing_subtitle') || 'Have a team code? Join an existing team instead.'}
            />
        </div>
    );
}