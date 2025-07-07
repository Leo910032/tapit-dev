// lib/userLookup.js - FINAL, CORRECTED AND SIMPLIFIED VERSION
import { fireApp } from "@/important/firebase";
import { collection, doc, setDoc } from "firebase/firestore";

/**
 * Creates or updates a document in the 'UserLookup' collection.
 * This function's ONLY purpose is to create a mapping from a public username
 * to a secure user ID (UID). This allows you to find a user by their username.
 * 
 * Call this ONLY when a user's profile is first created or when they update their username.
 * 
 * @param {string} uid - The user's secure Firebase Authentication UID.
 * @param {string} username - The user's public and URL-safe username.
 */
export async function updateUserLookup(uid, username) {
    if (!uid || !username) {
        console.error("❌ updateUserLookup: UID and username are required.");
        return;
    }

    try {
        console.log(`🔄 Updating user lookup: Mapping username '${username}' to UID '${uid}'`);
        
        const lookupRef = collection(fireApp, "UserLookup");
        
        // The document ID is the username, making it easy to query.
        // The document's content points back to the real UID.
        await setDoc(doc(lookupRef, username.toLowerCase()), { uid });
        
        console.log("✅ User lookup updated successfully.");
        
    } catch (error) {
        console.error("❌ Error in updateUserLookup:", error);
        // We don't re-throw the error, as a failed lookup update shouldn't crash the app.
    }
}