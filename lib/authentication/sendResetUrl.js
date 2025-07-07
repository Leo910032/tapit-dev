// lib/authentication/sendResetUrl.js - FINAL, CORRECTED VERSION
import { fireApp } from "@/important/firebase";
import { collection, doc, getDocs, setDoc, query, where } from "firebase/firestore";
import { generateSecureKey } from "../utilities"; // Assuming you have this helper
import { EmailJs } from "../EmailJs"; // Assuming you have this helper
import { resetPasswordEmail } from "../emailTemplate"; // Assuming you have this helper

function getResetEmailSubject(language) {
    const subjects = {
        en: "Password Reset Request - TapIt 🔒",
        fr: "Demande de réinitialisation de mot de passe - TapIt 🔒",
        // ... other languages
    };
    return subjects[language] || subjects.en;
}

/**
 * Finds a user by email in the 'AccountData' collection, generates a secure
 * reset key, and sends them a password reset email.
 * @param {object} payload - An object containing `email` and `language`.
 */
export async function sendResetUrl(payload) {
    const { email, language = 'en' } = payload;
    
    if (!email) {
        throw new Error("Email address is required to send a reset link.");
    }

    try {
        console.log(`🔎 Searching for user with email: ${email}`);
        
        // ✅ STEP 1: Look for the user in the correct 'AccountData' collection.
        const accountDataRef = collection(fireApp, "AccountData");
        const q = query(accountDataRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // IMPORTANT: For security, we don't tell the user the email doesn't exist.
            // This prevents attackers from guessing registered emails.
            console.warn(`⚠️ Password reset attempted for a non-existent email: ${email}. Pretending to succeed.`);
            return; // Exit quietly.
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const resetKey = generateSecureKey();
        const resetUrl = `https://www.tapit.fr/reset-password/${resetKey}`;

        // ✅ STEP 2: Store the one-time reset key, linking it to the user's UID.
        const resetKeyCollection = collection(fireApp, "resetKeys");
        await setDoc(doc(resetKeyCollection, resetKey), {
            uid: userData.uid, // The user's actual Firebase UID
            expires: Date.now() + 3600000, // Key expires in 1 hour
        });

        // ✅ STEP 3: Send the email.
        const emailSubject = getResetEmailSubject(language);
        const emailHtml = resetPasswordEmail(resetUrl, language);
        
        await EmailJs(userData.displayName, email, emailSubject, emailHtml);
        
        console.log(`✅ Password reset email sent successfully to ${email} for user ${userData.uid}`);

    } catch (error) {
        console.error('❌ Error in sendResetUrl:', error);
        // Throw a generic error to the user.
        throw new Error("Failed to send password reset email. Please try again later.");
    }
}