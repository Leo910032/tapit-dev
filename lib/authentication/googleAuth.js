// lib/authentication/googleAuth.js
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";
import { auth, googleProvider, fireApp } from "@/important/firebase";
import { generateId } from "../utilities";
import { EmailJs } from "../EmailJs";
import { welcomeEmail } from "../emailTemplate";
import { updateUserLookup } from "../userLookup"; // ✅ Import lookup function

// Function to get email subject based on language
function getEmailSubject(language) {
    const subjects = {
        en: "Welcome to TapIt - Your account is ready! 🚀",
        fr: "Bienvenue sur TapIt - Votre compte est prêt ! 🚀",
        es: "¡Bienvenido a TapIt - Tu cuenta está lista! 🚀",
        vm: "Chào mừng đến với TapIt - Tài khoản của bạn đã sẵn sàng! 🚀",
        zh: "欢迎来到 TapIt - 您的账户已准备就绪！🚀"
    };
    return subjects[language] || subjects.en;
}

// Check if user exists in our database
export const checkUserExists = async (email) => {
    try {
        const accountsRef = collection(fireApp, "accounts");
        const q = query(accountsRef, where("email", "==", email.toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            return {
                exists: true,
                userId: userDoc.id,
                userData: userDoc.data()
            };
        }
        
        return { exists: false };
    } catch (error) {
        console.error("❌ Error checking user existence:", error);
        throw error;
    }
};

// Generate username from Google display name
const generateUsername = (displayName, email) => {
    if (displayName) {
        // Remove spaces and special characters, keep only alphanumeric
        let username = displayName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (username.length >= 3) {
            return username;
        }
    }
    
    // Fallback: use email prefix
    const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return emailPrefix.length >= 3 ? emailPrefix : `user${Date.now()}`;
};

// Check if username is already taken and generate unique one
const ensureUniqueUsername = async (baseUsername) => {
    const accountsRef = collection(fireApp, "accounts");
    let username = baseUsername;
    let counter = 1;
    
    while (true) {
        const q = query(accountsRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return username;
        }
        
        username = `${baseUsername}${counter}`;
        counter++;
        
        // Prevent infinite loop
        if (counter > 1000) {
            return `${baseUsername}${Date.now()}`;
        }
    }
};

// Create new user account from Google data
export const createAccountFromGoogle = async (googleUser, language = 'en') => {
    const { email, displayName, photoURL, uid } = googleUser;
    const userId = generateId();
    
    console.log('🚀 Creating account from Google data:', { email, displayName, userId, language });
    
    try {
        // Generate and ensure unique username
        const baseUsername = generateUsername(displayName, email);
        const uniqueUsername = await ensureUniqueUsername(baseUsername);
        
        console.log('👤 Generated unique username:', uniqueUsername);
        
        const accountRef = collection(fireApp, "accounts");
        const accountDetailsRef = collection(fireApp, "AccountData");
        
        // Prepare email content
        const emailSubject = getEmailSubject(language);
        const emailPayload = {
            htmlContent: welcomeEmail(email, "Google Account", uniqueUsername, language),
            email: email,
            name: displayName || uniqueUsername,
            subject: emailSubject
        };
        
        console.log('📧 Sending welcome email for Google signup...');
        
        try {
            await EmailJs(
                emailPayload.name,
                emailPayload.email,
                emailPayload.subject,
                emailPayload.htmlContent
            );
            console.log('✅ Welcome email sent successfully');
        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError);
            // Continue without failing the account creation
            console.warn('⚠️ Continuing account creation without email...');
        }
        
        // Save account credentials
        await setDoc(doc(accountRef, userId), {
            userId: userId,
            email: email.toLowerCase(),
            username: uniqueUsername,
            googleUid: uid, // Store Google UID for future reference
            authProvider: 'google',
            displayName: displayName || uniqueUsername,
            photoURL: photoURL || "",
            createdAt: new Date().toISOString()
        });
        
        console.log('✅ Google account credentials saved');
        
        // Save account details/profile
         await setDoc(doc(accountDetailsRef, userId), {
            // --- Standard Fields ---
            userId: userId, // Good practice to include it here too
            displayName: displayName || uniqueUsername,
            username: uniqueUsername,
            links: [],
            profilePhoto: photoURL || "",
            selectedTheme: "Lake White",
            createdAt: new Date().toISOString(),

            // --- CRITICAL TEAM MANAGEMENT FIELDS ---
            // These fields ensure the user starts on the correct plan and without a team.
            accountType: "free",
            isTeamManager: false,
            teamId: null,
            teamRole: null,
            managerUserId: null
        });
        
        console.log('✅ Google account profile created');

        // ✅ CREATE LOOKUP TABLE ENTRIES
        console.log('🔍 Creating lookup table entries for Google user...');
        try {
            await updateUserLookup(userId, uniqueUsername, displayName || uniqueUsername, email);
            console.log('✅ Google user lookup table entries created');
        } catch (lookupError) {
            console.error('❌ Failed to create lookup entries:', lookupError);
            // Don't fail account creation for lookup errors
            console.warn('⚠️ Continuing without lookup entries...');
        }
        
        console.log('🎉 Google account creation completed for userId:', userId);
        
        return {
            userId,
            username: uniqueUsername,
            email: email,
            displayName: displayName || uniqueUsername,
            photoURL: photoURL || ""
        };
        
    } catch (error) {
        console.error('❌ Google account creation failed:', error);
        throw new Error(`Google account creation failed: ${error.message}`);
    }
};

// Main Google Sign-In function
export const signInWithGoogle = async (language = 'en') => {
    try {
        console.log('🔐 Starting Google authentication...');
        
        // Try popup first, fallback to redirect on mobile
        let result;
        
        try {
            result = await signInWithPopup(auth, googleProvider);
        } catch (popupError) {
            console.log('⚠️ Popup failed, trying redirect...', popupError.code);
            
            if (popupError.code === 'auth/popup-blocked' || 
                popupError.code === 'auth/popup-closed-by-user' ||
                /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
                
                await signInWithRedirect(auth, googleProvider);
                return { requiresRedirect: true };
            }
            throw popupError;
        }
        
        const { user } = result;
        console.log('✅ Google authentication successful:', user.email);
        
        // Check if user already exists
        const userCheck = await checkUserExists(user.email);
        
        if (userCheck.exists) {
            console.log('👤 Existing user found, logging in...');
            return {
                isNewUser: false,
                userId: userCheck.userId,
                userData: userCheck.userData,
                user: user
            };
        } else {
            console.log('🆕 New user, creating account...');
            const newUserData = await createAccountFromGoogle(user, language);
            return {
                isNewUser: true,
                userId: newUserData.userId,
                userData: newUserData,
                user: user
            };
        }
        
    } catch (error) {
        console.error('❌ Google authentication failed:', error);
        
        // Handle specific Google Auth errors
        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error('Google sign-in was cancelled');
        } else if (error.code === 'auth/popup-blocked') {
            throw new Error('Popup was blocked by browser');
        } else if (error.code === 'auth/cancelled-popup-request') {
            throw new Error('Another popup is already open');
        } else if (error.code === 'auth/network-request-failed') {
            throw new Error('Network error. Please check your connection');
        }
        
        throw new Error(`Google sign-in failed: ${error.message}`);
    }
};

// Handle redirect result (for mobile/popup-blocked scenarios)
export const handleGoogleRedirectResult = async (language = 'en') => {
    try {
        const result = await getRedirectResult(auth);
        
        if (!result) {
            // No redirect result
            return null;
        }
        
        const { user } = result;
        console.log('✅ Google redirect authentication successful:', user.email);
        
        // Check if user already exists
        const userCheck = await checkUserExists(user.email);
        
        if (userCheck.exists) {
            console.log('👤 Existing user found, logging in...');
            return {
                isNewUser: false,
                userId: userCheck.userId,
                userData: userCheck.userData,
                user: user
            };
        } else {
            console.log('🆕 New user, creating account...');
            const newUserData = await createAccountFromGoogle(user, language);
            return {
                isNewUser: true,
                userId: newUserData.userId,
                userData: newUserData,
                user: user
            };
        }
        
    } catch (error) {
        console.error('❌ Google redirect authentication failed:', error);
        throw new Error(`Google sign-in failed: ${error.message}`);
    }
};