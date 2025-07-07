// lib/teamContactSharing.js - Functions for sharing contacts between team members

import { fireApp } from '@/important/firebase';
import { 
    doc, getDoc, setDoc,updateDoc, collection, query, where, 
    getDocs, serverTimestamp, arrayUnion
} from 'firebase/firestore';
import { testForActiveSession } from '@/lib/authentication/testForActiveSession';

/**
 * Share contacts with team members
 */
export const shareContactsWithTeam = async (contactIds, senderUserId, targetTeamMembers = 'all') => {
    try {
        const currentUserId = testForActiveSession();
        if (!currentUserId || currentUserId !== senderUserId) {
            throw new Error("Unauthorized access");
        }

        // Get sender's data and team info
        const senderRef = doc(fireApp, "AccountData", senderUserId);
        const senderSnap = await getDoc(senderRef);
        
        if (!senderSnap.exists()) {
            throw new Error("Sender not found");
        }

        const senderData = senderSnap.data();
        if (!senderData.teamId) {
            throw new Error("User is not in a team");
        }

        // Get sender's contacts
        const senderContactsRef = doc(fireApp, "Contacts", senderUserId);
        const senderContactsSnap = await getDoc(senderContactsRef);
        
        if (!senderContactsSnap.exists()) {
            throw new Error("No contacts found");
        }

        const senderContacts = senderContactsSnap.data().contacts || [];
        
        // Filter contacts to share
        const contactsToShare = senderContacts.filter(contact => 
            contactIds.includes(contact.id)
        );

        if (contactsToShare.length === 0) {
            throw new Error("No valid contacts to share");
        }

        // Get team members
        const usersRef = collection(fireApp, "AccountData");
        const teamQuery = query(usersRef, where("teamId", "==", senderData.teamId));
        const teamSnapshot = await getDocs(teamQuery);

        let targetMembers = [];
        if (targetTeamMembers === 'all') {
            // Share with all team members except sender
            targetMembers = teamSnapshot.docs
                .filter(doc => doc.id !== senderUserId)
                .map(doc => ({ userId: doc.id, ...doc.data() }));
        } else {
            // Share with specific members
            targetMembers = teamSnapshot.docs
                .filter(doc => targetTeamMembers.includes(doc.id))
                .map(doc => ({ userId: doc.id, ...doc.data() }));
        }

        // Prepare shared contacts with team member info
  // Prepare shared contacts with team member info - COMPLETELY CLEAN VERSION
const sharedContacts = contactsToShare.map(contact => {
    const cleanSharedContact = {
        id: `shared_${contact.id}_${Date.now()}`,
        originalId: contact.id,
        name: contact.name || '',
        email: contact.email || '',
        status: 'new',
        submittedAt: contact.submittedAt || new Date().toISOString(),
        sharedBy: {
            userId: senderUserId,
            displayName: senderData.displayName || senderData.username || '',
            username: senderData.username || '',
            email: senderData.email || ''
        },
        sharedAt: new Date().toISOString(),
        isSharedContact: true,
        canEdit: false
    };

    // Only add optional fields if they have real values
    if (contact.phone && typeof contact.phone === 'string' && contact.phone.trim() !== '') {
        cleanSharedContact.phone = contact.phone.trim();
    }
    if (contact.company && typeof contact.company === 'string' && contact.company.trim() !== '') {
        cleanSharedContact.company = contact.company.trim();
    }
    if (contact.message && typeof contact.message === 'string' && contact.message.trim() !== '') {
        cleanSharedContact.message = contact.message.trim();
    }
    if (contact.location && typeof contact.location === 'object' && contact.location !== null) {
        cleanSharedContact.location = contact.location;
    }

    return cleanSharedContact;
});


        // Share contacts with each team member
       // Share contacts with each team member
// Share contacts with each team member
const sharePromises = targetMembers.map(async (member) => {
    try {
        const memberContactsRef = doc(fireApp, "Contacts", member.userId);
        const memberContactsSnap = await getDoc(memberContactsRef);
        
        let existingContacts = [];
        if (memberContactsSnap.exists()) {
            existingContacts = memberContactsSnap.data().contacts || [];
        }

        // Check for duplicates by email to avoid sharing same contact twice
        const newSharedContacts = sharedContacts.filter(sharedContact => 
            !existingContacts.some(existing => 
                existing.email === sharedContact.email && existing.isSharedContact
            )
        );

        if (newSharedContacts.length > 0) {
            // Create completely clean contacts - be very explicit about each field
            const cleanedNewContacts = newSharedContacts.map(contact => {
                const cleanContact = {
                    id: contact.id,
                    name: contact.name,
                    email: contact.email,
                    status: contact.status,
                    submittedAt: contact.submittedAt,
                    isSharedContact: true,
                    canEdit: false,
                    originalId: contact.originalId,
                    sharedAt: contact.sharedAt
                };

                // Add sharedBy object carefully
                if (contact.sharedBy) {
                    cleanContact.sharedBy = {
                        userId: contact.sharedBy.userId,
                        displayName: contact.sharedBy.displayName,
                        username: contact.sharedBy.username,
                        email: contact.sharedBy.email
                    };
                }

                // Only add optional fields if they exist and are not undefined
                if (contact.phone !== undefined && contact.phone !== null) {
                    cleanContact.phone = contact.phone;
                }
                if (contact.company !== undefined && contact.company !== null) {
                    cleanContact.company = contact.company;
                }
                if (contact.message !== undefined && contact.message !== null) {
                    cleanContact.message = contact.message;
                }
                if (contact.location !== undefined && contact.location !== null) {
                    cleanContact.location = contact.location;
                }

                return cleanContact;
            });

            // Also clean existing contacts to make sure they don't have undefined values
            const cleanedExistingContacts = existingContacts.map(contact => {
                const cleanContact = {
                    id: contact.id || `existing_${Date.now()}`,
                    name: contact.name || '',
                    email: contact.email || '',
                    status: contact.status || 'new',
                    submittedAt: contact.submittedAt || new Date().toISOString()
                };

                // Add optional fields only if they're not undefined
                if (contact.phone !== undefined && contact.phone !== null) {
                    cleanContact.phone = contact.phone;
                }
                if (contact.company !== undefined && contact.company !== null) {
                    cleanContact.company = contact.company;
                }
                if (contact.message !== undefined && contact.message !== null) {
                    cleanContact.message = contact.message;
                }
                if (contact.location !== undefined && contact.location !== null) {
                    cleanContact.location = contact.location;
                }
                if (contact.lastModified !== undefined && contact.lastModified !== null) {
                    cleanContact.lastModified = contact.lastModified;
                }
                if (contact.isSharedContact !== undefined) {
                    cleanContact.isSharedContact = contact.isSharedContact;
                }
                if (contact.canEdit !== undefined) {
                    cleanContact.canEdit = contact.canEdit;
                }
                if (contact.originalId !== undefined && contact.originalId !== null) {
                    cleanContact.originalId = contact.originalId;
                }
                if (contact.sharedBy !== undefined && contact.sharedBy !== null) {
                    cleanContact.sharedBy = contact.sharedBy;
                }
                if (contact.sharedAt !== undefined && contact.sharedAt !== null) {
                    cleanContact.sharedAt = contact.sharedAt;
                }

                return cleanContact;
            });

            const allCleanedContacts = [...cleanedExistingContacts, ...cleanedNewContacts];
            
            // DEBUG: Check for undefined values before writing
            const debugContacts = (contacts, label) => {
                contacts.forEach((contact, index) => {
                    Object.keys(contact).forEach(key => {
                        if (contact[key] === undefined) {
                            console.error(`❌ UNDEFINED FOUND in ${label}[${index}].${key}`);
                        }
                        if (typeof contact[key] === 'object' && contact[key] !== null) {
                            Object.keys(contact[key]).forEach(subKey => {
                                if (contact[key][subKey] === undefined) {
                                    console.error(`❌ UNDEFINED FOUND in ${label}[${index}].${key}.${subKey}`);
                                }
                            });
                        }
                    });
                });
            };

            debugContacts(allCleanedContacts, 'allCleanedContacts');

            // NUCLEAR OPTION: Use JSON serialization to completely remove undefined values
            const safeContacts = JSON.parse(JSON.stringify(allCleanedContacts, (key, value) => {
                return value === undefined ? null : value;
            }));

            // Remove any null values we just created and empty strings
            const finalSafeContacts = safeContacts.map(contact => {
                const safeContact = {};
                Object.keys(contact).forEach(key => {
                    if (contact[key] !== null && contact[key] !== undefined && contact[key] !== '') {
                        safeContact[key] = contact[key];
                    }
                });
                
                // Ensure required fields are always present
                if (!safeContact.id) safeContact.id = `fallback_${Date.now()}`;
                if (!safeContact.name) safeContact.name = '';
                if (!safeContact.email) safeContact.email = '';
                if (!safeContact.status) safeContact.status = 'new';
                if (!safeContact.submittedAt) safeContact.submittedAt = new Date().toISOString();
                
                return safeContact;
            });

            console.log('🔍 About to write contacts for member:', member.userId, finalSafeContacts);

            await setDoc(memberContactsRef, {
                contacts: finalSafeContacts,
                lastUpdated: new Date().toISOString()
            });
        }

        return {
            memberId: member.userId,
            memberName: member.displayName || member.username,
            contactsShared: newSharedContacts.length
        };
    } catch (error) {
        console.error(`Failed to share contacts with ${member.userId}:`, error);
        return {
            memberId: member.userId,
            memberName: member.displayName || member.username,
            contactsShared: 0,
            error: error.message
        };
    }
});

        const results = await Promise.all(sharePromises);

        // Log team activity
        try {
const { logTeamActivity } = await import('./teamManagement');
            await logTeamActivity(senderData.teamId, senderUserId, 'contacts_shared', {
                contactCount: contactsToShare.length,
                sharedWith: results.filter(r => r.contactsShared > 0).length,
                memberNames: results.map(r => r.memberName)
            });
        } catch (logError) {
            console.warn('Failed to log team activity:', logError);
        }

        return {
            success: true,
            totalContactsShared: contactsToShare.length,
            results
        };

    } catch (error) {
        console.error('❌ shareContactsWithTeam error:', error);
        throw error;
    }
};

/**
 * Get team contacts (contacts shared by team members)
 */
// Prepare shared contacts with team member info
/**
 * Get team contacts (contacts shared by team members)
 */
export const getTeamSharedContacts = async (userId) => {
    try {
        const currentUserId = testForActiveSession();
        if (!currentUserId || currentUserId !== userId) {
            throw new Error("Unauthorized access");
        }

        // Get user's contacts
        const userContactsRef = doc(fireApp, "Contacts", userId);
        const userContactsSnap = await getDoc(userContactsRef);
        
        if (!userContactsSnap.exists()) {
            return [];
        }

        const allContacts = userContactsSnap.data().contacts || [];
        
        // Filter for team shared contacts
        const teamSharedContacts = allContacts.filter(contact => contact.isSharedContact);

        return teamSharedContacts;

    } catch (error) {
        console.error('❌ getTeamSharedContacts error:', error);
        throw error;
    }
};
/**
 * Check if contact sharing is enabled for the user's team
 */
export const checkTeamContactSharingEnabled = async (userId) => {
    try {
        const currentUserId = testForActiveSession();
        if (!currentUserId || currentUserId !== userId) {
            throw new Error("Unauthorized access");
        }

        // Get user's team data
        const userRef = doc(fireApp, "AccountData", userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            throw new Error("User not found");
        }

        const userData = userSnap.data();
        if (!userData.teamId) {
            return false; // Not in a team
        }

        // Get team settings
        const teamRef = doc(fireApp, "Teams", userData.teamId);
        const teamSnap = await getDoc(teamRef);
        
        if (!teamSnap.exists()) {
            throw new Error("Team not found");
        }

        const teamData = teamSnap.data();
        return teamData.settings?.allowContactSharing === true;

    } catch (error) {
        console.error('❌ checkTeamContactSharingEnabled error:', error);
        return false;
    }
};

/**
 * Get team members for contact sharing
 */
export const getTeamMembersForSharing = async (userId) => {
    try {
        const currentUserId = testForActiveSession();
        if (!currentUserId || currentUserId !== userId) {
            throw new Error("Unauthorized access");
        }

        // Get user's team data
        const userRef = doc(fireApp, "AccountData", userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            throw new Error("User not found");
        }

        const userData = userSnap.data();
        if (!userData.teamId) {
            throw new Error("User is not in a team");
        }

        // Get all team members
        const usersRef = collection(fireApp, "AccountData");
        const teamQuery = query(usersRef, where("teamId", "==", userData.teamId));
        const teamSnapshot = await getDocs(teamQuery);

        const teamMembers = teamSnapshot.docs
            .filter(doc => doc.id !== userId) // Exclude current user
            .map(doc => ({
                userId: doc.id,
                username: doc.data().username,
                displayName: doc.data().displayName,
                email: doc.data().email,
                teamRole: doc.data().teamRole,
                profilePhoto: doc.data().profilePhoto
            }));

        return teamMembers;

    } catch (error) {
        console.error('❌ getTeamMembersForSharing error:', error);
        throw error;
    }
};

/**
 * Remove shared contact (for recipients)
 */
export const removeSharedContact = async (userId, contactId) => {
    try {
        const currentUserId = testForActiveSession();
        if (!currentUserId || currentUserId !== userId) {
            throw new Error("Unauthorized access");
        }

        const userContactsRef = doc(fireApp, "Contacts", userId);
        const userContactsSnap = await getDoc(userContactsRef);
        
        if (!userContactsSnap.exists()) {
            throw new Error("No contacts found");
        }

        const allContacts = userContactsSnap.data().contacts || [];
        const updatedContacts = allContacts.filter(contact => contact.id !== contactId);

        await updateDoc(userContactsRef, {
            contacts: updatedContacts,
            lastUpdated: serverTimestamp()
        });

        return { success: true };

    } catch (error) {
        console.error('❌ removeSharedContact error:', error);
        throw error;
    }
};