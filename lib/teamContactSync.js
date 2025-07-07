// lib/teamContactSync.js - Utilities for synchronizing team contacts

import { fireApp } from '@/important/firebase';
import { 
    doc, getDoc, updateDoc, onSnapshot, 
    serverTimestamp, collection, query, where, getDocs
} from 'firebase/firestore';
import { testForActiveSession } from '@/lib/authentication/testForActiveSession';

/**
 * Set up real-time listener for team contact updates
 */
export const setupTeamContactListener = (userId, onContactsUpdate) => {
    if (!userId) return null;

    try {
        const contactsRef = doc(fireApp, "Contacts", userId);
        
        return onSnapshot(contactsRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                const allContacts = data.contacts || [];
                
                // Separate personal and team contacts
                const personalContacts = allContacts.filter(contact => !contact.isSharedContact);
                const teamContacts = allContacts.filter(contact => contact.isSharedContact);
                
                // Notify about updates with metadata
                onContactsUpdate({
                    allContacts,
                    personalContacts,
                    teamContacts,
                    totalCount: allContacts.length,
                    teamContactCount: teamContacts.length,
                    personalContactCount: personalContacts.length
                });
                
                console.log('📊 Contacts updated:', {
                    total: allContacts.length,
                    personal: personalContacts.length,
                    team: teamContacts.length
                });
            } else {
                onContactsUpdate({
                    allContacts: [],
                    personalContacts: [],
                    teamContacts: [],
                    totalCount: 0,
                    teamContactCount: 0,
                    personalContactCount: 0
                });
            }
        }, (error) => {
            console.error('❌ Error in team contact listener:', error);
        });
    } catch (error) {
        console.error('❌ Error setting up team contact listener:', error);
        return null;
    }
};

/**
 * Get team contact statistics
 */
export const getTeamContactStats = async (userId) => {
    try {
        const currentUserId = testForActiveSession();
        if (!currentUserId || currentUserId !== userId) {
            throw new Error("Unauthorized access");
        }

        // Get user's contacts
        const contactsRef = doc(fireApp, "Contacts", userId);
        const contactsSnap = await getDoc(contactsRef);
        
        if (!contactsSnap.exists()) {
            return {
                totalContacts: 0,
                personalContacts: 0,
                teamContacts: 0,
                sharedByMembers: {},
                teamMemberSources: []
            };
        }

        const allContacts = contactsSnap.data().contacts || [];
        const personalContacts = allContacts.filter(contact => !contact.isSharedContact);
        const teamContacts = allContacts.filter(contact => contact.isSharedContact);
        
        // Group team contacts by who shared them
        const sharedByMembers = {};
        const teamMemberSources = [];
        
        teamContacts.forEach(contact => {
            if (contact.sharedBy) {
                const memberKey = contact.sharedBy.userId;
                const memberName = contact.sharedBy.displayName || contact.sharedBy.username;
                
                if (!sharedByMembers[memberKey]) {
                    sharedByMembers[memberKey] = {
                        memberInfo: contact.sharedBy,
                        contactCount: 0,
                        contacts: []
                    };
                    teamMemberSources.push({
                        userId: memberKey,
                        name: memberName,
                        contactCount: 0
                    });
                }
                
                sharedByMembers[memberKey].contactCount++;
                sharedByMembers[memberKey].contacts.push(contact);
                
                // Update the source count
                const sourceIndex = teamMemberSources.findIndex(s => s.userId === memberKey);
                if (sourceIndex !== -1) {
                    teamMemberSources[sourceIndex].contactCount++;
                }
            }
        });

        return {
            totalContacts: allContacts.length,
            personalContacts: personalContacts.length,
            teamContacts: teamContacts.length,
            sharedByMembers,
            teamMemberSources
        };

    } catch (error) {
        console.error('❌ getTeamContactStats error:', error);
        throw error;
    }
};

/**
 * Sync team contacts when team settings change
 */
export const syncTeamContactsOnSettingsChange = async (teamId, previousSettings, newSettings) => {
    try {
        // If contact sharing was disabled, we might want to remove shared contacts
        if (previousSettings.allowContactSharing && !newSettings.allowContactSharing) {
            console.log('🔄 Contact sharing disabled - considering cleanup...');
            
            // Get all team members
            const usersRef = collection(fireApp, "AccountData");
            const teamQuery = query(usersRef, where("teamId", "==", teamId));
            const teamSnapshot = await getDocs(teamQuery);
            
            // For each team member, optionally remove shared contacts
            // Note: This is a policy decision - you might want to keep shared contacts
            const cleanupPromises = teamSnapshot.docs.map(async (docSnap) => {
                try {
                    const userId = docSnap.id;
                    const contactsRef = doc(fireApp, "Contacts", userId);
                    const contactsSnap = await getDoc(contactsRef);
                    
                    if (contactsSnap.exists()) {
                        const allContacts = contactsSnap.data().contacts || [];
                        // Keep only personal contacts
                        const personalContacts = allContacts.filter(contact => !contact.isSharedContact);
                        
                        await updateDoc(contactsRef, {
                            contacts: personalContacts,
                            lastUpdated: serverTimestamp()
                        });
                        
                        console.log(`✅ Cleaned up shared contacts for user ${userId}`);
                    }
                } catch (error) {
                    console.error(`❌ Error cleaning up contacts for user ${docSnap.id}:`, error);
                }
            });
            
            await Promise.all(cleanupPromises);
        }
        
        return { success: true };
        
    } catch (error) {
        console.error('❌ syncTeamContactsOnSettingsChange error:', error);
        throw error;
    }
};

/**
 * Mark team contacts as updated when a team member's info changes
 */
export const updateTeamContactMemberInfo = async (userId, oldUserData, newUserData) => {
    try {
        // Check if display name or username changed
        const nameChanged = (
            oldUserData.displayName !== newUserData.displayName ||
            oldUserData.username !== newUserData.username
        );
        
        if (!nameChanged || !newUserData.teamId) {
            return { success: true, updated: 0 };
        }
        
        console.log('🔄 Updating team contact member info for user:', userId);
        
        // Get all team members to update their shared contacts
        const usersRef = collection(fireApp, "AccountData");
        const teamQuery = query(usersRef, where("teamId", "==", newUserData.teamId));
        const teamSnapshot = await getDocs(teamQuery);
        
        let totalUpdated = 0;
        
        const updatePromises = teamSnapshot.docs.map(async (docSnap) => {
            try {
                const memberId = docSnap.id;
                if (memberId === userId) return 0; // Skip the user whose info changed
                
                const contactsRef = doc(fireApp, "Contacts", memberId);
                const contactsSnap = await getDoc(contactsRef);
                
                if (!contactsSnap.exists()) return 0;
                
                const allContacts = contactsSnap.data().contacts || [];
                let updated = false;
                
                // Update contacts shared by this user
                const updatedContacts = allContacts.map(contact => {
                    if (contact.isSharedContact && contact.sharedBy?.userId === userId) {
                        updated = true;
                        return {
                            ...contact,
                            sharedBy: {
                                ...contact.sharedBy,
                                displayName: newUserData.displayName,
                                username: newUserData.username
                            }
                        };
                    }
                    return contact;
                });
                
                if (updated) {
                    await updateDoc(contactsRef, {
                        contacts: updatedContacts,
                        lastUpdated: serverTimestamp()
                    });
                    return 1;
                }
                
                return 0;
            } catch (error) {
                console.error(`❌ Error updating contacts for member ${docSnap.id}:`, error);
                return 0;
            }
        });
        
        const results = await Promise.all(updatePromises);
        totalUpdated = results.reduce((sum, count) => sum + count, 0);
        
        console.log(`✅ Updated team contact member info in ${totalUpdated} contact lists`);
        
        return { success: true, updated: totalUpdated };
        
    } catch (error) {
        console.error('❌ updateTeamContactMemberInfo error:', error);
        throw error;
    }
};

/**
 * Clean up shared contacts when a user leaves a team
 */
export const cleanupContactsOnTeamLeave = async (userId, teamId) => {
    try {
        console.log('🧹 Cleaning up contacts after team leave:', { userId, teamId });
        
        // Get all remaining team members
        const usersRef = collection(fireApp, "AccountData");
        const teamQuery = query(usersRef, where("teamId", "==", teamId));
        const teamSnapshot = await getDocs(teamQuery);
        
        let totalCleaned = 0;
        
        // Remove contacts shared by the leaving user from other members' lists
        const cleanupPromises = teamSnapshot.docs.map(async (docSnap) => {
            try {
                const memberId = docSnap.id;
                if (memberId === userId) return 0; // Skip the leaving user
                
                const contactsRef = doc(fireApp, "Contacts", memberId);
                const contactsSnap = await getDoc(contactsRef);
                
                if (!contactsSnap.exists()) return 0;
                
                const allContacts = contactsSnap.data().contacts || [];
                const originalCount = allContacts.length;
                
                // Remove contacts shared by the leaving user
                const filteredContacts = allContacts.filter(contact => 
                    !(contact.isSharedContact && contact.sharedBy?.userId === userId)
                );
                
                const removedCount = originalCount - filteredContacts.length;
                
                if (removedCount > 0) {
                    await updateDoc(contactsRef, {
                        contacts: filteredContacts,
                        lastUpdated: serverTimestamp()
                    });
                    
                    console.log(`✅ Removed ${removedCount} shared contacts from user ${memberId}`);
                }
                
                return removedCount;
            } catch (error) {
                console.error(`❌ Error cleaning contacts for member ${docSnap.id}:`, error);
                return 0;
            }
        });
        
        const results = await Promise.all(cleanupPromises);
        totalCleaned = results.reduce((sum, count) => sum + count, 0);
        
        // Also clean up the leaving user's shared contacts (optional)
        try {
            const leavingUserContactsRef = doc(fireApp, "Contacts", userId);
            const leavingUserContactsSnap = await getDoc(leavingUserContactsRef);
            
            if (leavingUserContactsSnap.exists()) {
                const allContacts = leavingUserContactsSnap.data().contacts || [];
                const personalContacts = allContacts.filter(contact => !contact.isSharedContact);
                
                await updateDoc(leavingUserContactsRef, {
                    contacts: personalContacts,
                    lastUpdated: serverTimestamp()
                });
                
                console.log(`✅ Cleaned up shared contacts for leaving user ${userId}`);
            }
        } catch (error) {
            console.error('❌ Error cleaning up leaving user contacts:', error);
        }
        
        console.log(`✅ Team contact cleanup completed. Removed ${totalCleaned} shared contacts total.`);
        
        return { success: true, cleaned: totalCleaned };
        
    } catch (error) {
        console.error('❌ cleanupContactsOnTeamLeave error:', error);
        throw error;
    }
};

/**
 * Get team contact sharing statistics for analytics
 */
export const getTeamContactSharingAnalytics = async (teamId) => {
    try {
        // Get all team members
        const usersRef = collection(fireApp, "AccountData");
        const teamQuery = query(usersRef, where("teamId", "==", teamId));
        const teamSnapshot = await getDocs(teamQuery);
        
        let totalPersonalContacts = 0;
        let totalSharedContacts = 0;
        let membersWithSharedContacts = 0;
        let memberStats = [];
        
        const memberPromises = teamSnapshot.docs.map(async (docSnap) => {
            try {
                const userId = docSnap.id;
                const userData = docSnap.data();
                
                const contactsRef = doc(fireApp, "Contacts", userId);
                const contactsSnap = await getDoc(contactsRef);
                
                let personalCount = 0;
                let receivedCount = 0;
                
                if (contactsSnap.exists()) {
                    const allContacts = contactsSnap.data().contacts || [];
                    personalCount = allContacts.filter(c => !c.isSharedContact).length;
                    receivedCount = allContacts.filter(c => c.isSharedContact).length;
                }
                
                const stats = {
                    userId,
                    displayName: userData.displayName || userData.username,
                    personalContacts: personalCount,
                    receivedSharedContacts: receivedCount,
                    totalContacts: personalCount + receivedCount
                };
                
                memberStats.push(stats);
                totalPersonalContacts += personalCount;
                totalSharedContacts += receivedCount;
                
                if (receivedCount > 0) {
                    membersWithSharedContacts++;
                }
                
                return stats;
            } catch (error) {
                console.error(`Error getting stats for member ${docSnap.id}:`, error);
                return null;
            }
        });
        
        await Promise.all(memberPromises);
        
        return {
            teamId,
            totalMembers: teamSnapshot.docs.length,
            totalPersonalContacts,
            totalSharedContacts,
            membersWithSharedContacts,
            sharingParticipation: teamSnapshot.docs.length > 0 ? 
                (membersWithSharedContacts / teamSnapshot.docs.length) * 100 : 0,
            memberStats: memberStats.filter(stat => stat !== null),
            averageContactsPerMember: teamSnapshot.docs.length > 0 ? 
                (totalPersonalContacts + totalSharedContacts) / teamSnapshot.docs.length : 0
        };
        
    } catch (error) {
        console.error('❌ getTeamContactSharingAnalytics error:', error);
        throw error;
    }
};