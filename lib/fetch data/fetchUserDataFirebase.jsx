// lib/fetch data/fetchUserDataFirebase.js - NEW Firebase-compatible fetch function
import { doc, getDoc } from 'firebase/firestore';
import { fireApp } from '@/important/firebase';

/**
 * Fetch user data from Firestore using Firebase UID
 * @param {string} userId - Firebase UID 
 * @returns {Object|null} User data object or null if not found
 */
export async function fetchUserDataFirebase(userId) {
    try {
        console.log('🔍 Fetching user data for Firebase UID:', userId);
        
        if (!userId) {
            console.warn('⚠️ No userId provided to fetchUserDataFirebase');
            return null;
        }

        const userRef = doc(fireApp, 'AccountData', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log('✅ User data fetched successfully:', userData.username || userData.email);
            return userData;
        } else {
            console.log('❌ No user data found for UID:', userId);
            return null;
        }
    } catch (error) {
        console.error('❌ Error fetching user data:', error);
        throw new Error(`Failed to fetch user data: ${error.message}`);
    }
}

/**
 * Fetch user data by username (for backward compatibility)
 * @param {string} username - Username to search for
 * @returns {Object|null} User data object or null if not found
 */
export async function fetchUserDataByUsername(username) {
    try {
        console.log('🔍 Fetching user data for username:', username);
        
        if (!username) {
            console.warn('⚠️ No username provided to fetchUserDataByUsername');
            return null;
        }

        // This would require a different approach since Firestore doesn't allow
        // direct queries by username in this structure. You'd need to either:
        // 1. Use a collection query (slower)
        // 2. Use the lookup table you mentioned
        // 3. Store username as document ID
        
        // For now, let's implement a simple collection query
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        
        const accountDataRef = collection(fireApp, 'AccountData');
        const q = query(accountDataRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            console.log('✅ User data fetched by username:', userData.username);
            return userData;
        } else {
            console.log('❌ No user data found for username:', username);
            return null;
        }
    } catch (error) {
        console.error('❌ Error fetching user data by username:', error);
        throw new Error(`Failed to fetch user data: ${error.message}`);
    }
}

/**
 * Update user data in Firestore
 * @param {string} userId - Firebase UID
 * @param {Object} updateData - Data to update
 * @returns {boolean} Success status
 */
export async function updateUserDataFirebase(userId, updateData) {
    try {
        console.log('🔄 Updating user data for UID:', userId);
        
        const { updateDoc, doc } = await import('firebase/firestore');
        const userRef = doc(fireApp, 'AccountData', userId);
        
        await updateDoc(userRef, {
            ...updateData,
            updatedAt: new Date().toISOString()
        });
        
        console.log('✅ User data updated successfully');
        return true;
    } catch (error) {
        console.error('❌ Error updating user data:', error);
        throw new Error(`Failed to update user data: ${error.message}`);
    }
}