// lib/userLookup.js - COMPLETE LOOKUP TABLE SYSTEM
import { fireApp } from "@/important/firebase";
import { collection, doc, setDoc, getDoc, writeBatch, getDocs } from "firebase/firestore";

/**
 * Creates/updates lookup entries when a user is created or updated
 * Call this in your createAccount and updateProfile functions
 */
export async function updateUserLookup(userId, username, displayName, email = null) {
    try {
        console.log("🔄 Updating user lookup for:", { userId, username, displayName, email });
        
        const lookupRef = collection(fireApp, "UserLookup");
        const batch = writeBatch(fireApp);
        
        const lookupData = {
            userId,
            username,
            displayName,
            email,
            updatedAt: new Date()
        };
        
        // Create lookup by user ID (primary key)
        batch.set(doc(lookupRef, userId), {
            ...lookupData,
            type: 'userId'
        });
        
        // Create lookup by username (lowercase for case-insensitive)
        if (username) {
            batch.set(doc(lookupRef, `username_${username.toLowerCase()}`), {
                ...lookupData,
                type: 'username'
            });
        }
        
        // Create lookup by display name
        if (displayName && displayName !== username) {
            batch.set(doc(lookupRef, `displayName_${displayName}`), {
                ...lookupData,
                type: 'displayName'
            });
        }
        
        // Create lookup by email (optional)
        if (email) {
            batch.set(doc(lookupRef, `email_${email.toLowerCase()}`), {
                ...lookupData,
                type: 'email'
            });
        }
        
        await batch.commit();
        console.log("✅ Updated user lookup successfully");
        
    } catch (error) {
        console.error("❌ Error updating user lookup:", error);
        throw error;
    }
}

/**
 * Fast user lookup using the lookup table
 * @param {string} identifier - Can be userId, username, displayName, or email
 * @returns {Object|null} User data or null if not found
 */
export async function fastUserLookup(identifier) {
    try {
        console.log("🔍 Fast lookup for:", identifier);
        
        const lookupRef = collection(fireApp, "UserLookup");
        
        // Try direct lookup first (for user IDs)
        let lookupDoc = await getDoc(doc(lookupRef, identifier));
        
        if (lookupDoc.exists()) {
            console.log("✅ Found by direct lookup");
            return lookupDoc.data();
        }
        
        // Try prefixed lookups
        const prefixes = ['username_', 'displayName_', 'email_'];
        
        for (const prefix of prefixes) {
            const key = `${prefix}${identifier.toLowerCase()}`;
            lookupDoc = await getDoc(doc(lookupRef, key));
            
            if (lookupDoc.exists()) {
                console.log(`✅ Found by ${prefix} lookup`);
                return lookupDoc.data();
            }
        }
        
        console.log("❌ User not found in lookup table");
        return null;
        
    } catch (error) {
        console.error("❌ Error in fast user lookup:", error);
        return null;
    }
}

/**
 * Migrates existing users to the lookup table
 * Run this once to populate the lookup table with existing users
 */
export async function migrateUsersToLookupTable() {
    try {
        console.log("🚀 Starting user migration to lookup table...");
        
        const accountsRef = collection(fireApp, "accounts");
        const accountDataRef = collection(fireApp, "AccountData");
        
        // Get all accounts
        const accountsSnapshot = await getDocs(accountsRef);
        const accountDataSnapshot = await getDocs(accountDataRef);
        
        // Create maps for quick lookup
        const accountDataMap = new Map();
        accountDataSnapshot.forEach(doc => {
            accountDataMap.set(doc.id, doc.data());
        });
        
        console.log(`📊 Found ${accountsSnapshot.size} accounts to migrate`);
        
        const batch = writeBatch(fireApp);
        const lookupRef = collection(fireApp, "UserLookup");
        let count = 0;
        
        accountsSnapshot.forEach(doc => {
            const accountData = doc.data();
            const accountDetails = accountDataMap.get(doc.id);
            const userId = doc.id;
            
            const lookupData = {
                userId,
                username: accountData.username,
                displayName: accountDetails?.displayName || accountData.displayName || accountData.username,
                email: accountData.email,
                updatedAt: new Date()
            };
            
            // Add lookup entries
            batch.set(doc(lookupRef, userId), { ...lookupData, type: 'userId' });
            
            if (accountData.username) {
                batch.set(doc(lookupRef, `username_${accountData.username.toLowerCase()}`), { 
                    ...lookupData, type: 'username' 
                });
            }
            
            if (lookupData.displayName && lookupData.displayName !== accountData.username) {
                batch.set(doc(lookupRef, `displayName_${lookupData.displayName}`), { 
                    ...lookupData, type: 'displayName' 
                });
            }
            
            if (accountData.email) {
                batch.set(doc(lookupRef, `email_${accountData.email.toLowerCase()}`), { 
                    ...lookupData, type: 'email' 
                });
            }
            
            count++;
        });
        
        await batch.commit();
        console.log(`✅ Successfully migrated ${count} users to lookup table`);
        
    } catch (error) {
        console.error("❌ Error migrating users to lookup table:", error);
        throw error;
    }
}

/**
 * Removes lookup entries for a user (for cleanup)
 */
export async function removeUserLookup(userId, username, displayName, email = null) {
    try {
        console.log("🗑️ Removing user lookup for:", userId);
        
        const lookupRef = collection(fireApp, "UserLookup");
        const batch = writeBatch(fireApp);
        
        // Remove all lookup entries
        batch.delete(doc(lookupRef, userId));
        
        if (username) {
            batch.delete(doc(lookupRef, `username_${username.toLowerCase()}`));
        }
        
        if (displayName) {
            batch.delete(doc(lookupRef, `displayName_${displayName}`));
        }
        
        if (email) {
            batch.delete(doc(lookupRef, `email_${email.toLowerCase()}`));
        }
        
        await batch.commit();
        console.log("✅ Removed user lookup successfully");
        
    } catch (error) {
        console.error("❌ Error removing user lookup:", error);
        throw error;
    }
}