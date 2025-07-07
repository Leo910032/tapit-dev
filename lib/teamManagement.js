// lib/teamManagement.js - ENHANCED VERSION
import { fireApp } from '@/important/firebase';
import { 
    doc, setDoc, updateDoc, collection, query, where, 
    getDocs, getDoc, writeBatch, serverTimestamp, increment,
    runTransaction, deleteDoc, arrayUnion, arrayRemove,orderBy
} from 'firebase/firestore';

import { EmailJs } from '@/lib/EmailJs'; // Import your email service
import { teamInvitationEmail } from '@/lib/emailTemplate'; // Import the new 
import { testForActiveSession } from '@/lib/authentication/testForActiveSession';
import { teamInvitationNotificationEmail } from '@/lib/emailTemplate'; 

const generateUniqueTeamCode = async () => {
    let teamCode;
    let isUnique = false;
    const teamsRef = collection(fireApp, "Teams");

    while (!isUnique) {
        teamCode = Math.floor(100000 + Math.random() * 900000).toString();
        const q = query(teamsRef, where("teamCode", "==", teamCode), where("isActive", "==", true));
        const snapshot = await getDocs(q);
        isUnique = snapshot.empty;
    }
    return teamCode;
};
/**
 * 🆕 NEW: Approve join request (for managers)
 */
export const approveJoinRequest = async (managerId, requestId) => {
    try {
        const currentUserId = testForActiveSession();
        if (!currentUserId || currentUserId !== managerId) {
            throw new Error("Unauthorized access");
        }

        console.log('🔍 Approving join request:', { managerId, requestId });

        return await runTransaction(fireApp, async (transaction) => {
            // Get the join request
            const requestRef = doc(fireApp, "TeamJoinRequests", requestId);
            const requestSnap = await transaction.get(requestRef);
            
            if (!requestSnap.exists()) {
                throw new Error("Join request not found");
            }

            const requestData = requestSnap.data();
            
            if (requestData.status !== 'pending') {
                throw new Error("This request has already been processed");
            }

            // Verify manager permissions
            const managerRef = doc(fireApp, "AccountData", managerId);
            const managerSnap = await transaction.get(managerRef);
            
            if (!managerSnap.exists()) {
                throw new Error("Manager not found");
            }

            const managerData = managerSnap.data();
            if (!managerData.isTeamManager || !managerData.teamId) {
                throw new Error("Not a team manager");
            }

            if (managerData.teamId !== requestData.teamId) {
                throw new Error("You can only approve requests for your own team");
            }

            // Get the user who wants to join
            const userRef = doc(fireApp, "AccountData", requestData.userId);
            const userSnap = await transaction.get(userRef);
            
            if (!userSnap.exists()) {
                throw new Error("User not found");
            }

            const userData = userSnap.data();
            
            if (userData.teamId) {
                throw new Error("User is already in a team");
            }

            // Get team data to check capacity
            const teamRef = doc(fireApp, "Teams", requestData.teamId);
            const teamSnap = await transaction.get(teamRef);
            
            if (!teamSnap.exists()) {
                throw new Error("Team not found");
            }

            const teamData = teamSnap.data();
            if (teamData.memberCount >= teamData.maxMembers) {
                throw new Error("Team is at maximum capacity");
            }

            // Execute the approval
            // 1. Update the user to join the team
            transaction.update(userRef, {
                teamId: requestData.teamId,
                teamRole: "member",
                managerUserId: managerId,
                isTeamManager: false,
                joinedTeamAt: serverTimestamp()
            });

            // 2. Update team member count
            transaction.update(teamRef, {
                memberCount: increment(1),
                memberIds: arrayUnion(requestData.userId),
                "teamStats.totalMembers": increment(1),
                "teamStats.lastUpdated": serverTimestamp()
            });

            // 3. Update the join request status
            transaction.update(requestRef, {
                status: "approved",
                approvedAt: serverTimestamp(),
                approvedBy: managerId
            });

            return {
                success: true,
                teamName: teamData.teamName,
                memberName: userData.displayName || userData.username
            };
        });

    } catch (error) {
        console.error('❌ approveJoinRequest error:', error);
        throw error;
    }
};

/**
 * 🆕 NEW: Reject join request (for managers)
 */
export const rejectJoinRequest = async (managerId, requestId, reason = "") => {
    try {
        const currentUserId = testForActiveSession();
        if (!currentUserId || currentUserId !== managerId) {
            throw new Error("Unauthorized access");
        }

        const requestRef = doc(fireApp, "TeamJoinRequests", requestId);
        const requestSnap = await getDoc(requestRef);
        
        if (!requestSnap.exists()) {
            throw new Error("Join request not found");
        }

        const requestData = requestSnap.data();
        
        if (requestData.status !== 'pending') {
            throw new Error("This request has already been processed");
        }

        // Verify manager permissions
        const managerRef = doc(fireApp, "AccountData", managerId);
        const managerSnap = await getDoc(managerRef);
        
        if (!managerSnap.exists()) {
            throw new Error("Manager not found");
        }

        const managerData = managerSnap.data();
        if (!managerData.isTeamManager || managerData.teamId !== requestData.teamId) {
            throw new Error("You can only reject requests for your own team");
        }

        await updateDoc(requestRef, {
            status: "rejected",
            rejectedAt: serverTimestamp(),
            rejectedBy: managerId,
            rejectionReason: reason
        });

        return { success: true };

    } catch (error) {
        console.error('❌ rejectJoinRequest error:', error);
        throw error;
    }
};
/**
 * 🚀 ENHANCED: Creates a new team with better validation and features
 */
export const createTeam = async (managerId, teamName, settings = {}) => {
    console.log('🚀 createTeam called with:', { managerId, teamName, settings });
    
    if (!managerId || !teamName || teamName.trim().length < 3) {
        throw new Error("Manager ID and team name (3+ characters) are required.");
    }

    if (teamName.trim().length > 50) {
        throw new Error("Team name must be 50 characters or less.");
    }

    const currentUserId = testForActiveSession();
    if (!currentUserId || currentUserId !== managerId) {
        throw new Error("Unauthorized: User not logged in or ID mismatch");
    }

    try {
        return await runTransaction(fireApp, async (transaction) => {
            // Verify manager eligibility
            const managerRef = doc(fireApp, "AccountData", managerId);
            const managerSnap = await transaction.get(managerRef);

            if (!managerSnap.exists()) {
                throw new Error("User account not found.");
            }

            const managerData = managerSnap.data();

            if (managerData.accountType !== 'team_manager') {
                throw new Error("Upgrade to Team Manager plan required to create teams.");
            }

            if (managerData.teamId) {
                throw new Error("You are already in a team. Leave your current team first.");
            }

            // Generate unique team code
            const teamCode = await generateUniqueTeamCode();
            
            // Create team document
            const newTeamRef = doc(collection(fireApp, "Teams"));
            
            const teamData = {
                teamId: newTeamRef.id,
                teamName: teamName.trim(),
                teamCode: teamCode,
                managerId: managerId,
                createdAt: serverTimestamp(),
                isActive: true,
                maxMembers: 10,
                memberCount: 1,
                memberIds: [managerId], // Track member IDs for easier queries
                settings: {
                    allowMemberAnalytics: settings.allowMemberAnalytics ?? true,
                    allowContactSharing: settings.allowContactSharing ?? true,
                    autoAcceptInvites: settings.autoAcceptInvites ?? false,
                    dataRetention: settings.dataRetention ?? 90,
                    allowMemberInvites: settings.allowMemberInvites ?? false,
                    requireApprovalForJoin: settings.requireApprovalForJoin ?? false
                },
                teamStats: {
                    totalMembers: 1,
                    totalViews: 0,
                    totalClicks: 0,
                    lastUpdated: serverTimestamp()
                },
                // 🆕 Activity tracking
                recentActivity: [],
                // 🆕 Team description
                description: settings.description || "",
                // 🆕 Team avatar/icon
                teamAvatar: settings.teamAvatar || null
            };

            // Update manager's account
            const managerUpdate = {
                isTeamManager: true,
                teamId: newTeamRef.id,
                teamRole: "manager",
                joinedTeamAt: serverTimestamp()
            };

            transaction.set(newTeamRef, teamData);
            transaction.update(managerRef, managerUpdate);

            // Log activity
            await logTeamActivity(newTeamRef.id, managerId, 'team_created', {
                teamName: teamName.trim()
            });

            return { 
                teamId: newTeamRef.id, 
                teamCode,
                teamName: teamName.trim()
            };
        });

    } catch (error) {
        console.error('❌ createTeam error:', error);
        throw error;
    }
};

/**
 * 🔧 UPDATED: Join team with automatic analytics aggregation
 */
export const joinTeamByCode = async (userId, teamCode, invitationId = null) => {
    console.log('🚀 joinTeamByCode called with:', { userId, teamCode, invitationId });
    
    if (!userId || !teamCode || !/^\d{6}$/.test(teamCode)) {
        throw new Error("Valid User ID and 6-digit team code required.");
    }

    const currentUserId = testForActiveSession();
    if (!currentUserId || currentUserId !== userId) {
        throw new Error("User not logged in or ID mismatch");
    }

    try {
        // Step 1: Read operations outside transaction
        console.log('📖 Step 1: Reading user data...');
        const userRef = doc(fireApp, "AccountData", userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            throw new Error("User account not found.");
        }

        const userData = userSnap.data();
        
        if (userData.teamId) {
            throw new Error("You are already in a team. Leave current team first.");
        }

        // Step 2: Find the team outside the transaction
        console.log('🔍 Step 2: Finding team...');
        const teamsRef = collection(fireApp, "Teams");
        const q = query(teamsRef, where("teamCode", "==", teamCode), where("isActive", "==", true));
        const teamSnapshot = await getDocs(q);

        if (teamSnapshot.empty) {
            throw new Error("Invalid or expired team code.");
        }

        const teamDoc = teamSnapshot.docs[0];
        const teamData = teamDoc.data();

        // Check capacity before starting transaction
        if (teamData.memberCount >= teamData.maxMembers) {
            throw new Error("Team is at maximum capacity.");
        }

        // Check if approval required
        if (teamData.settings.requireApprovalForJoin) {
            console.log('📝 Creating join request for approval...');
            await createJoinRequest(teamData.teamId, userId, teamCode);
            return {
                teamId: teamData.teamId,
                teamName: teamData.teamName,
                status: 'pending_approval'
            };
        }

        // Step 3: Transaction
        console.log('💾 Step 3: Starting transaction...');
        const result = await runTransaction(fireApp, async (transaction) => {
            // Quick read to ensure team capacity hasn't changed
            const teamCurrentSnap = await transaction.get(teamDoc.ref);
            if (!teamCurrentSnap.exists() || teamCurrentSnap.data().memberCount >= teamCurrentSnap.data().maxMembers) {
                throw new Error("Team is no longer available or at capacity.");
            }

            // Execute the join operations
            const userUpdate = {
                teamId: teamData.teamId,
                teamRole: "member",
                managerUserId: teamData.managerId,
                isTeamManager: false,
                joinedTeamAt: serverTimestamp()
            };

            const teamUpdate = {
                memberCount: increment(1),
                memberIds: arrayUnion(userId),
                "teamStats.totalMembers": increment(1),
                "teamStats.lastUpdated": serverTimestamp()
            };

            transaction.update(userRef, userUpdate);
            transaction.update(teamDoc.ref, teamUpdate);

            // Update invitation if provided
            if (invitationId) {
                const invitationRef = doc(fireApp, "TeamInvitations", invitationId);
                transaction.update(invitationRef, {
                    status: "accepted",
                    acceptedAt: serverTimestamp()
                });
            }

            return {
                teamId: teamData.teamId,
                teamName: teamData.teamName,
                teamCode: teamData.teamCode,
                status: 'joined'
            };
        });

        // Step 4: Log activity and trigger analytics aggregation
        console.log('📊 Step 4: Logging activity and updating analytics...');
        try {
            await logTeamActivity(teamData.teamId, userId, 'member_joined', {
                memberName: userData.displayName || userData.username
            });
            
            // 🔄 Automatically schedule analytics aggregation
            await scheduleTeamAnalyticsUpdate(teamData.teamId);
        } catch (logError) {
            console.warn('Activity logging failed, but join was successful:', logError);
        }

        console.log('✅ Join team successful:', result);
        return result;

    } catch (error) {
        console.error('❌ joinTeamByCode error:', error);
        
        if (error.message.includes('aborted') || error.message.includes('NS_BINDING_ABORTED')) {
            throw new Error("The team join operation was interrupted. Please try again.");
        }
        
        throw error;
    }
};
/**
 * 🆕 NEW: Generate and send team invitation email - UPDATED to allow member invitations
 */
export const sendTeamInvitation = async (senderId, memberEmail, personalMessage = "") => {
    const currentUserId = testForActiveSession();
    if (!currentUserId || currentUserId !== senderId) throw new Error("Unauthorized access");

    const senderRef = doc(fireApp, "AccountData", senderId);
    const senderSnap = await getDoc(senderRef);
    if (!senderSnap.exists()) throw new Error("Sender not found");

    const senderData = senderSnap.data();
    if (!senderData.teamId) throw new Error("User is not in a team");

    // Get team data to check permissions
    const teamRef = doc(fireApp, "Teams", senderData.teamId);
    const teamSnap = await getDoc(teamRef);
    if (!teamSnap.exists()) throw new Error("Team not found");
    const teamData = teamSnap.data();

    // Check if sender has permission to invite
    const isManager = senderData.isTeamManager || senderId === teamData.managerId;
    const isMemberWithPermission = senderData.teamRole === 'member' && teamData.settings?.allowMemberInvites === true;
    
    if (!isManager && !isMemberWithPermission) {
        throw new Error("You do not have permission to send team invitations");
    }
    
    const memberQuery = query(collection(fireApp, "AccountData"), where("email", "==", memberEmail.toLowerCase()));
    const memberSnap = await getDocs(memberQuery);
    if (!memberSnap.empty && memberSnap.docs[0].data().teamId === teamData.teamId) {
        throw new Error("This user is already a member of your team.");
    }

    const existingInviteQuery = query(collection(fireApp, "TeamInvitations"), where("teamId", "==", teamData.teamId), where("invitedEmail", "==", memberEmail.toLowerCase()), where("status", "==", "pending"));
    if (!(await getDocs(existingInviteQuery)).empty) throw new Error("User already has a pending invitation to this team");

    const invitationRef = doc(collection(fireApp, "TeamInvitations"));
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitationData = {
        invitationId: invitationRef.id,
        teamId: teamData.teamId,
        teamName: teamData.teamName,
        teamCode: teamData.teamCode,
        invitedBy: senderId,
        invitedByName: senderData.displayName || senderData.username,
        invitedByRole: senderData.teamRole || (isManager ? 'manager' : 'member'),
        invitedEmail: memberEmail.toLowerCase(),
        personalMessage: personalMessage.trim(),
        status: "pending",
        sentAt: serverTimestamp(),
        expiresAt: expiresAt,
    };
    
    const emailHtml = teamInvitationNotificationEmail(
        teamData.teamName,
        senderData.displayName || senderData.username,
        personalMessage.trim(),
        'en'
    );
    
    await EmailJs(memberEmail, memberEmail, `You're invited to join ${teamData.teamName} on TapIt!`, emailHtml);
    
    await setDoc(invitationRef, invitationData);
    await logTeamActivity(teamData.teamId, senderId, 'invitation_sent', { 
        invitedEmail: memberEmail,
        sentByRole: senderData.teamRole || 'manager'
    });

    return { invitationId: invitationRef.id };
};

/**
 * 🔧 UPDATED: Accept invitation with automatic analytics aggregation
 */
export const acceptInvitation = async (userId, invitationId) => {
    const currentUserId = testForActiveSession();
    if (!currentUserId || currentUserId !== userId) throw new Error("Unauthorized access.");

    return await runTransaction(fireApp, async (transaction) => {
        const userRef = doc(fireApp, "AccountData", userId);
        const invitationRef = doc(fireApp, "TeamInvitations", invitationId);

        const [userSnap, invitationSnap] = await Promise.all([
            transaction.get(userRef),
            transaction.get(invitationRef)
        ]);

        if (!userSnap.exists()) throw new Error("User account not found.");
        if (!invitationSnap.exists()) throw new Error("Invitation not found or has expired.");

        const userData = userSnap.data();
        const invitationData = invitationSnap.data();
        
        // Get the user's email
        let userEmail = userData.email;

        // If the email is missing from AccountData, fetch it from the 'accounts' collection
        if (!userEmail) {
            const accountDocRef = doc(fireApp, "accounts", userId);
            const accountDocSnap = await transaction.get(accountDocRef);
            if (accountDocSnap.exists()) {
                userEmail = accountDocSnap.data().email;
            }
        }
        
        if (!userEmail) throw new Error("Could not verify user's email address.");

        // Check if invitation is for this user
        if (userEmail.toLowerCase() !== invitationData.invitedEmail) {
            throw new Error("This invitation is for a different user.");
        }

        if (userData.teamId) throw new Error("You are already in a team. Leave your current team first.");
        if (invitationData.status !== 'pending') throw new Error(`This invitation has already been ${invitationData.status}.`);
        
        const teamRef = doc(fireApp, "Teams", invitationData.teamId);
        const teamSnap = await transaction.get(teamRef);
        if (!teamSnap.exists()) throw new Error("The team for this invitation no longer exists.");
        
        const teamData = teamSnap.data();
        if (teamData.memberCount >= teamData.maxMembers) throw new Error("This team is now full.");

        transaction.update(userRef, {
            teamId: teamData.teamId,
            teamRole: "member",
            managerUserId: teamData.managerId,
            isTeamManager: false,
            joinedTeamAt: serverTimestamp()
        });

        transaction.update(teamRef, {
            memberCount: increment(1),
            memberIds: arrayUnion(userId),
            "teamStats.totalMembers": increment(1),
            "teamStats.lastUpdated": serverTimestamp()
        });

        transaction.update(invitationRef, {
            status: "accepted",
            respondedAt: serverTimestamp()
        });

        // Store team ID for later use
        const teamId = teamData.teamId;

        // Log activity and trigger analytics aggregation after transaction
        setTimeout(async () => {
            try {
                await logTeamActivity(teamId, userId, 'member_joined_via_invite', { 
                    memberName: userData.displayName || userData.username 
                });
                
                // 🔄 Automatically schedule analytics aggregation
                await scheduleTeamAnalyticsUpdate(teamId);
            } catch (error) {
                console.warn('Post-invitation analytics update failed:', error);
            }
        }, 1000); // Small delay to ensure transaction is complete

        return { teamName: teamData.teamName };
    });
};




export const declineInvitation = async (userId, invitationId) => {
    const currentUserId = testForActiveSession();
    if (!currentUserId || currentUserId !== userId) throw new Error("Unauthorized access.");
    
    const invitationRef = doc(fireApp, "TeamInvitations", invitationId);
    await updateDoc(invitationRef, {
        status: "declined",
        respondedAt: serverTimestamp()
    });
    return { success: true };
};

/**
 * 🆕 NEW: Get team members with enhanced info
 */
export const getTeamMembers = async (managerId) => {
    try {
        const currentUserId = testForActiveSession();
        if (!currentUserId || currentUserId !== managerId) {
            throw new Error("Unauthorized access");
        }

        // Get manager's team
        const managerRef = doc(fireApp, "AccountData", managerId);
        const managerSnap = await getDoc(managerRef);
        
        if (!managerSnap.exists()) {
            throw new Error("Manager not found");
        }

        const managerData = managerSnap.data();
        if (!managerData.isTeamManager || !managerData.teamId) {
            throw new Error("Not a team manager");
        }

        // Get team details
        const teamRef = doc(fireApp, "Teams", managerData.teamId);
        const teamSnap = await getDoc(teamRef);
        
        if (!teamSnap.exists()) {
            throw new Error("Team not found");
        }

        const teamData = teamSnap.data();

        // Get all team members
        const usersRef = collection(fireApp, "AccountData");
        const q = query(usersRef, where("teamId", "==", managerData.teamId));
        const snapshot = await getDocs(q);

        const members = [];
        for (const docSnap of snapshot.docs) {
            const userData = docSnap.data();
            
            // Get member's recent activity (optional)
            let lastActivity = null;
            try {
                const analyticsRef = doc(fireApp, "Analytics", docSnap.id);
                const analyticsSnap = await getDoc(analyticsRef);
                if (analyticsSnap.exists()) {
                    const analyticsData = analyticsSnap.data();
                    lastActivity = analyticsData.lastUpdated || null;
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
                lastActivity: lastActivity,
                isOnline: false, // You can implement online status if needed
                permissions: {
                    canViewAnalytics: teamData.settings.allowMemberAnalytics,
                    canViewContacts: teamData.settings.allowContactSharing,
                    canInviteMembers: teamData.settings.allowMemberInvites
                }
            });
        }

        // Sort by role (manager first) then by join date
        members.sort((a, b) => {
            if (a.teamRole === 'manager' && b.teamRole !== 'manager') return -1;
            if (b.teamRole === 'manager' && a.teamRole !== 'manager') return 1;
            return new Date(b.joinedAt || 0) - new Date(a.joinedAt || 0);
        });

        return {
            team: teamData,
            members: members,
            totalMembers: members.length
        };

    } catch (error) {
        console.error('❌ getTeamMembers error:', error);
        throw error;
    }
};

/**
 * 🔧 UPDATED: Remove team member with automatic analytics aggregation
 */
export const removeTeamMember = async (managerId, memberUserId, reason = "") => {
    try {
        const currentUserId = testForActiveSession();
        if (!currentUserId || currentUserId !== managerId) {
            throw new Error("Unauthorized access");
        }

        if (managerId === memberUserId) {
            throw new Error("Managers cannot remove themselves. Delete the team instead.");
        }

        return await runTransaction(fireApp, async (transaction) => {
            // Verify manager
            const managerRef = doc(fireApp, "AccountData", managerId);
            const managerSnap = await transaction.get(managerRef);
            
            if (!managerSnap.exists()) {
                throw new Error("Manager not found");
            }

            const managerData = managerSnap.data();
            if (!managerData.isTeamManager || !managerData.teamId) {
                throw new Error("Not a team manager");
            }

            // Verify member is in the team
            const memberRef = doc(fireApp, "AccountData", memberUserId);
            const memberSnap = await transaction.get(memberRef);
            
            if (!memberSnap.exists()) {
                throw new Error("Member not found");
            }

            const memberData = memberSnap.data();
            if (memberData.teamId !== managerData.teamId) {
                throw new Error("User is not a member of your team");
            }

            // Remove member from team
            const teamRef = doc(fireApp, "Teams", managerData.teamId);
            transaction.update(teamRef, {
                memberCount: increment(-1),
                memberIds: arrayRemove(memberUserId),
                "teamStats.totalMembers": increment(-1),
                "teamStats.lastUpdated": serverTimestamp()
            });

            // Update member's account
            transaction.update(memberRef, {
                teamId: null,
                teamRole: null,
                managerUserId: null,
                isTeamManager: false,
                leftTeamAt: serverTimestamp(),
                leftTeamReason: reason || "Removed by manager"
            });

            // Store team ID for later use
            const teamId = managerData.teamId;

            // Log activity and trigger analytics aggregation after transaction
            setTimeout(async () => {
                try {
                    await logTeamActivity(teamId, managerId, 'member_removed', {
                        removedMember: memberData.displayName || memberData.username,
                        removedBy: managerData.displayName || managerData.username,
                        reason: reason
                    });
                    
                    // 🔄 Automatically schedule analytics aggregation
                    await scheduleTeamAnalyticsUpdate(teamId);
                } catch (error) {
                    console.warn('Post-removal analytics update failed:', error);
                }
            }, 1000); // Small delay to ensure transaction is complete

            return { success: true };
        });

    } catch (error) {
        console.error('❌ removeTeamMember error:', error);
        throw error;
    }
};


/**
 * 🆕 NEW: Update team settings
 */
export const updateTeamSettings = async (managerId, newSettings) => {
    try {
        const currentUserId = testForActiveSession();
        if (!currentUserId || currentUserId !== managerId) {
            throw new Error("Unauthorized access");
        }

        // Get manager's team
        const managerRef = doc(fireApp, "AccountData", managerId);
        const managerSnap = await getDoc(managerRef);
        
        if (!managerSnap.exists()) {
            throw new Error("Manager not found");
        }

        const managerData = managerSnap.data();
        if (!managerData.isTeamManager || !managerData.teamId) {
            throw new Error("Not a team manager");
        }

        // Update team settings
        const teamRef = doc(fireApp, "Teams", managerData.teamId);
        const settingsUpdate = {};

        // Only update provided settings
        const allowedSettings = [
            'allowMemberAnalytics', 'allowContactSharing', 'autoAcceptInvites',
            'dataRetention', 'allowMemberInvites', 'requireApprovalForJoin'
        ];

        allowedSettings.forEach(setting => {
            if (newSettings[setting] !== undefined) {
                settingsUpdate[`settings.${setting}`] = newSettings[setting];
            }
        });

        // Update team name and description if provided
        if (newSettings.teamName && newSettings.teamName.trim().length >= 3) {
            settingsUpdate.teamName = newSettings.teamName.trim();
        }

        if (newSettings.description !== undefined) {
            settingsUpdate.description = newSettings.description.trim();
        }

        if (Object.keys(settingsUpdate).length === 0) {
            throw new Error("No valid settings provided");
        }

        await updateDoc(teamRef, settingsUpdate);

        // Log activity
        await logTeamActivity(managerData.teamId, managerId, 'settings_updated', {
            updatedBy: managerData.displayName || managerData.username,
            changes: Object.keys(settingsUpdate)
        });

        return { success: true };

    } catch (error) {
        console.error('❌ updateTeamSettings error:', error);
        throw error;
    }
};

/**
 * 🆕 NEW: Regenerate team code
 */
export const regenerateTeamCode = async (managerId) => {
    try {
        const currentUserId = testForActiveSession();
        if (!currentUserId || currentUserId !== managerId) {
            throw new Error("Unauthorized access");
        }

        // Get manager's team
        const managerRef = doc(fireApp, "AccountData", managerId);
        const managerSnap = await getDoc(managerRef);
        
        if (!managerSnap.exists()) {
            throw new Error("Manager not found");
        }

        const managerData = managerSnap.data();
        if (!managerData.isTeamManager || !managerData.teamId) {
            throw new Error("Not a team manager");
        }

        // Generate new unique code
        const newTeamCode = await generateUniqueTeamCode();

        // Update team
        const teamRef = doc(fireApp, "Teams", managerData.teamId);
        await updateDoc(teamRef, {
            teamCode: newTeamCode,
            codeRegeneratedAt: serverTimestamp(),
            codeRegeneratedBy: managerId
        });

        // Invalidate all pending invitations for this team
        const invitationsQuery = query(
            collection(fireApp, "TeamInvitations"),
            where("teamId", "==", managerData.teamId),
            where("status", "==", "pending")
        );
        const invitationsSnap = await getDocs(invitationsQuery);

        const batch = writeBatch(fireApp);
        invitationsSnap.docs.forEach(doc => {
            batch.update(doc.ref, {
                status: "expired",
                expiredReason: "Team code regenerated"
            });
        });
        await batch.commit();

        // Log activity
        await logTeamActivity(managerData.teamId, managerId, 'code_regenerated', {
            regeneratedBy: managerData.displayName || managerData.username,
            oldInvitationsInvalidated: invitationsSnap.docs.length
        });

        return { newTeamCode };

    } catch (error) {
        console.error('❌ regenerateTeamCode error:', error);
        throw error;
    }
};

/**
 * 🆕 NEW: Get team activity log
 */
export const getTeamActivity = async (managerId, limit = 20) => {
    try {
        const currentUserId = testForActiveSession();
        if (!currentUserId || currentUserId !== managerId) {
            throw new Error("Unauthorized access");
        }

        // Get manager's team
        const managerRef = doc(fireApp, "AccountData", managerId);
        const managerSnap = await getDoc(managerRef);
        
        if (!managerSnap.exists()) {
            throw new Error("Manager not found");
        }

        const managerData = managerSnap.data();
        if (!managerData.isTeamManager || !managerData.teamId) {
            throw new Error("Not a team manager");
        }

        // Get team activity
        const activityQuery = query(
            collection(fireApp, "TeamActivity"),
            where("teamId", "==", managerData.teamId),
            orderBy("timestamp", "desc"),
            limit(limit)
        );
        
        const activitySnap = await getDocs(activityQuery);
        const activities = activitySnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
        }));

        return activities;

    } catch (error) {
        console.error('❌ getTeamActivity error:', error);
        throw error;
    }
};

/**
 * 🛠️ HELPER: Optimized activity logging that doesn't affect main operations
 */
export const logTeamActivity = async (teamId, userId, activityType, details = {}) => {
    try {
        // Use a separate write operation instead of including in the main transaction
        const activityRef = doc(collection(fireApp, "TeamActivity"));
        await setDoc(activityRef, {
            teamId,
            userId,
            activityType,
            details,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error('❌ logTeamActivity error:', error);
        // Don't throw - activity logging shouldn't break main operations
    }
};
// Add these functions to your teamManagement.js file

/**
 * 🆕 NEW: Aggregate team analytics from all members
 */
export const aggregateTeamAnalytics = async (teamId) => {
    try {
        console.log('🔄 Aggregating analytics for team:', teamId);
        
        // Get all team members
        const usersRef = collection(fireApp, "AccountData");
        const q = query(usersRef, where("teamId", "==", teamId));
        const snapshot = await getDocs(q);

        let totalViews = 0;
        let totalClicks = 0;
        let totalContacts = 0;

        // Aggregate analytics for each member
        for (const docSnap of snapshot.docs) {
            const userId = docSnap.id;
            
            try {
                // Get member's analytics
                const analyticsRef = doc(fireApp, "Analytics", userId);
                const analyticsSnap = await getDoc(analyticsRef);
                
                if (analyticsSnap.exists()) {
                    const analyticsData = analyticsSnap.data();
                    totalViews += analyticsData.totalViews || 0;
                    totalClicks += analyticsData.totalClicks || 0;
                }

                // Get member's contacts count
                const contactsRef = doc(fireApp, "Contacts", userId);
                const contactsSnap = await getDoc(contactsRef);
                
                if (contactsSnap.exists()) {
                    const contactsData = contactsSnap.data();
                    totalContacts += contactsData.contacts?.length || 0;
                }
            } catch (error) {
                console.log('Could not fetch analytics for user:', userId, error);
            }
        }

        // Update team stats
        const teamRef = doc(fireApp, "Teams", teamId);
        await updateDoc(teamRef, {
            "teamStats.totalViews": totalViews,
            "teamStats.totalClicks": totalClicks,
            "teamStats.totalContacts": totalContacts,
            "teamStats.lastUpdated": serverTimestamp(),
            "teamStats.lastAggregation": serverTimestamp()
        });

        console.log('✅ Team analytics aggregated:', { totalViews, totalClicks, totalContacts });
        
        return {
            totalViews,
            totalClicks,
            totalContacts,
            memberCount: snapshot.docs.length
        };

    } catch (error) {
        console.error('❌ aggregateTeamAnalytics error:', error);
        throw error;
    }
};

/**
 * 🆕 NEW: Enhanced getTeamMembers with real-time analytics aggregation
 */
export const getTeamMembersWithAnalytics = async (managerId) => {
    try {
        const currentUserId = testForActiveSession();
        if (!currentUserId || currentUserId !== managerId) {
            throw new Error("Unauthorized access");
        }

        // Get manager's team
        const managerRef = doc(fireApp, "AccountData", managerId);
        const managerSnap = await getDoc(managerRef);
        
        if (!managerSnap.exists()) {
            throw new Error("Manager not found");
        }

        const managerData = managerSnap.data();
        if (!managerData.isTeamManager || !managerData.teamId) {
            throw new Error("Not a team manager");
        }

        // Get team details
        const teamRef = doc(fireApp, "Teams", managerData.teamId);
        const teamSnap = await getDoc(teamRef);
        
        if (!teamSnap.exists()) {
            throw new Error("Team not found");
        }

        let teamData = teamSnap.data();

        // 🔄 Aggregate real-time analytics
        const aggregatedStats = await aggregateTeamAnalytics(managerData.teamId);
        
        // Update teamData with fresh stats
        teamData = {
            ...teamData,
            teamStats: {
                ...teamData.teamStats,
                ...aggregatedStats,
                lastUpdated: new Date()
            }
        };

        // Get all team members with their individual analytics
        const usersRef = collection(fireApp, "AccountData");
        const q = query(usersRef, where("teamId", "==", managerData.teamId));
        const snapshot = await getDocs(q);

        const members = [];
        for (const docSnap of snapshot.docs) {
            const userData = docSnap.data();
            
            // Get member's analytics
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
                    canViewAnalytics: teamData.settings.allowMemberAnalytics,
                    canViewContacts: teamData.settings.allowContactSharing,
                    canInviteMembers: teamData.settings.allowMemberInvites
                }
            });
        }

        // Sort by role (manager first) then by join date
        members.sort((a, b) => {
            if (a.teamRole === 'manager' && b.teamRole !== 'manager') return -1;
            if (b.teamRole === 'manager' && a.teamRole !== 'manager') return 1;
            return new Date(b.joinedAt || 0) - new Date(a.joinedAt || 0);
        });

        return {
            team: teamData,
            members: members,
            totalMembers: members.length
        };

    } catch (error) {
        console.error('❌ getTeamMembersWithAnalytics error:', error);
        throw error;
    }
};

/**
 * 🆕 NEW: Schedule analytics aggregation (call this when members join/leave)
 */
export const scheduleTeamAnalyticsUpdate = async (teamId) => {
    try {
        // Add a small delay to ensure all transactions are complete
        setTimeout(async () => {
            try {
                await aggregateTeamAnalytics(teamId);
                console.log('🔄 Scheduled analytics update completed for team:', teamId);
            } catch (error) {
                console.error('❌ Scheduled analytics update failed:', error);
            }
        }, 2000); // 2 second delay
    } catch (error) {
        console.error('❌ scheduleTeamAnalyticsUpdate error:', error);
    }
};

/**
 * 🔧 UPDATED: Enhanced joinTeamByCode with analytics aggregation
 */
export const joinTeamByCodeWithAnalytics = async (userId, teamCode, invitationId = null) => {
    console.log('🚀 joinTeamByCodeWithAnalytics called with:', { userId, teamCode, invitationId });
    
    if (!userId || !teamCode || !/^\d{6}$/.test(teamCode)) {
        throw new Error("Valid User ID and 6-digit team code required.");
    }

    const currentUserId = testForActiveSession();
    if (!currentUserId || currentUserId !== userId) {
        throw new Error("User not logged in or ID mismatch");
    }

    try {
        // Step 1: Read operations outside transaction
        console.log('📖 Step 1: Reading user data...');
        const userRef = doc(fireApp, "AccountData", userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            throw new Error("User account not found.");
        }

        const userData = userSnap.data();
        
        if (userData.teamId) {
            throw new Error("You are already in a team. Leave current team first.");
        }

        // Step 2: Find the team outside the transaction
        console.log('🔍 Step 2: Finding team...');
        const teamsRef = collection(fireApp, "Teams");
        const q = query(teamsRef, where("teamCode", "==", teamCode), where("isActive", "==", true));
        const teamSnapshot = await getDocs(q);

        if (teamSnapshot.empty) {
            throw new Error("Invalid or expired team code.");
        }

        const teamDoc = teamSnapshot.docs[0];
        const teamData = teamDoc.data();

        // Check capacity before starting transaction
        if (teamData.memberCount >= teamData.maxMembers) {
            throw new Error("Team is at maximum capacity.");
        }

        // Check if approval required
        if (teamData.settings.requireApprovalForJoin) {
            console.log('📝 Creating join request for approval...');
            await createJoinRequest(teamData.teamId, userId, teamCode);
            return {
                teamId: teamData.teamId,
                teamName: teamData.teamName,
                status: 'pending_approval'
            };
        }

        // Step 3: Transaction
        console.log('💾 Step 3: Starting transaction...');
        const result = await runTransaction(fireApp, async (transaction) => {
            // Quick read to ensure team capacity hasn't changed
            const teamCurrentSnap = await transaction.get(teamDoc.ref);
            if (!teamCurrentSnap.exists() || teamCurrentSnap.data().memberCount >= teamCurrentSnap.data().maxMembers) {
                throw new Error("Team is no longer available or at capacity.");
            }

            // Execute the join operations
            const userUpdate = {
                teamId: teamData.teamId,
                teamRole: "member",
                managerUserId: teamData.managerId,
                isTeamManager: false,
                joinedTeamAt: serverTimestamp()
            };

            const teamUpdate = {
                memberCount: increment(1),
                memberIds: arrayUnion(userId),
                "teamStats.totalMembers": increment(1),
                "teamStats.lastUpdated": serverTimestamp()
            };

            transaction.update(userRef, userUpdate);
            transaction.update(teamDoc.ref, teamUpdate);

            // Update invitation if provided
            if (invitationId) {
                const invitationRef = doc(fireApp, "TeamInvitations", invitationId);
                transaction.update(invitationRef, {
                    status: "accepted",
                    acceptedAt: serverTimestamp()
                });
            }

            return {
                teamId: teamData.teamId,
                teamName: teamData.teamName,
                teamCode: teamData.teamCode,
                status: 'joined'
            };
        });

        // Step 4: Log activity and aggregate analytics
        console.log('📊 Step 4: Logging activity and updating analytics...');
        try {
            await logTeamActivity(teamData.teamId, userId, 'member_joined', {
                memberName: userData.displayName || userData.username
            });
            
            // 🔄 Schedule analytics aggregation
            await scheduleTeamAnalyticsUpdate(teamData.teamId);
        } catch (logError) {
            console.warn('Activity logging failed, but join was successful:', logError);
        }

        console.log('✅ Join team successful:', result);
        return result;

    } catch (error) {
        console.error('❌ joinTeamByCodeWithAnalytics error:', error);
        
        if (error.message.includes('aborted') || error.message.includes('NS_BINDING_ABORTED')) {
            throw new Error("The team join operation was interrupted. Please try again.");
        }
        
        throw error;
    }
};
/**
 * 🛠️ HELPER: Optimized join request creation
 */
const createJoinRequest = async (teamId, userId, teamCode) => {
    try {
        const requestRef = doc(collection(fireApp, "TeamJoinRequests"));
        await setDoc(requestRef, {
            requestId: requestRef.id,
            teamId,
            userId,
            teamCode,
            status: "pending",
            requestedAt: serverTimestamp(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        return requestRef.id;
    } catch (error) {
        console.error('❌ createJoinRequest error:', error);
        throw new Error("Failed to create join request. Please try again.");
    }
};

/**
 * 🔧 UPDATED: Leave team with automatic analytics aggregation
 */
export const leaveTeam = async (userId) => {
    try {
        const currentUserId = testForActiveSession();
        if (!currentUserId || currentUserId !== userId) {
            throw new Error("Unauthorized access");
        }

        return await runTransaction(fireApp, async (transaction) => {
            const userRef = doc(fireApp, "AccountData", userId);
            const userSnap = await transaction.get(userRef);
            
            if (!userSnap.exists()) {
                throw new Error("User not found");
            }

            const userData = userSnap.data();
            if (!userData.teamId) {
                throw new Error("You are not in a team");
            }

            if (userData.isTeamManager) {
                throw new Error("Team managers cannot leave their team. Delete the team instead.");
            }

            // Store team ID for later use
            const teamId = userData.teamId;

            // Get team to update member count
            const teamRef = doc(fireApp, "Teams", teamId);
            const teamSnap = await transaction.get(teamRef);
            
            if (teamSnap.exists()) {
                transaction.update(teamRef, {
                    memberCount: increment(-1),
                    memberIds: arrayRemove(userId),
                    "teamStats.totalMembers": increment(-1),
                    "teamStats.lastUpdated": serverTimestamp()
                });
            }

            // Remove user from team
            transaction.update(userRef, {
                teamId: null,
                teamRole: null,
                managerUserId: null,
                isTeamManager: false,
                leftTeamAt: serverTimestamp(),
                leftTeamReason: "Left voluntarily"
            });

            // Log activity and trigger analytics aggregation after transaction
            setTimeout(async () => {
                try {
                    await logTeamActivity(teamId, userId, 'member_left', {
                        memberName: userData.displayName || userData.username
                    });
                    
                    // 🔄 Automatically schedule analytics aggregation
                    await scheduleTeamAnalyticsUpdate(teamId);
                } catch (error) {
                    console.warn('Post-leave analytics update failed:', error);
                }
            }, 1000); // Small delay to ensure transaction is complete

            return { success: true };
        });
    } catch (error) {
        console.error('❌ leaveTeam error:', error);
        throw error;
    }
};

export const deleteTeam = async (managerId) => {
    try {
        const currentUserId = testForActiveSession();
        if (!currentUserId || currentUserId !== managerId) {
            throw new Error("Unauthorized access");
        }

        return await runTransaction(fireApp, async (transaction) => {
            const managerRef = doc(fireApp, "AccountData", managerId);
            const managerSnap = await transaction.get(managerRef);
            
            if (!managerSnap.exists()) {
                throw new Error("Manager not found");
            }

            const managerData = managerSnap.data();
            if (!managerData.isTeamManager || !managerData.teamId) {
                throw new Error("Not a team manager");
            }

            // Get all team members
            const usersRef = collection(fireApp, "AccountData");
            const q = query(usersRef, where("teamId", "==", managerData.teamId));
            const snapshot = await getDocs(q);

            // Remove all members from team
            snapshot.forEach(doc => {
                transaction.update(doc.ref, {
                    teamId: null,
                    teamRole: null,
                    managerUserId: null,
                    isTeamManager: false,
                    leftTeamAt: serverTimestamp(),
                    leftTeamReason: "Team deleted by manager"
                });
            });

            // Mark team as inactive
            const teamRef = doc(fireApp, "Teams", managerData.teamId);
            transaction.update(teamRef, {
                isActive: false,
                deletedAt: serverTimestamp(),
                deletedBy: managerId
            });

            return { success: true };
        });
    } catch (error) {
        console.error('❌ deleteTeam error:', error);
        throw error;
    }
};

export const getTeamById = async (teamId) => {
    try {
        const teamRef = doc(fireApp, "Teams", teamId);
        const teamSnap = await getDoc(teamRef);
        
        if (!teamSnap.exists()) {
            throw new Error("Team not found");
        }
        
        return teamSnap.data();
    } catch (error) {
        console.error('❌ getTeamById error:', error);
        throw error;
    }
};