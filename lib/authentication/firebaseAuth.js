// lib/authentication/firebaseAuth.js - New Firebase Auth Helper Functions
import { 
  auth, 
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  fireApp
} from "@/important/firebase";
import { doc, setDoc, getDoc, collection } from "firebase/firestore";
import { EmailJs } from "../EmailJs";
import { welcomeEmail } from "../emailTemplate";
import { updateUserLookup } from "../userLookup";

// Email subject helper
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
// lib/authentication/firebaseAuth.js - More robust Google sign-in
// Add this improved version to your existing firebaseAuth.js



// Create user profile in Firestore after Firebase Auth creation
async function createUserProfile(user, additionalData = {}) {
    const { uid, email, displayName, photoURL } = user;
    const userRef = doc(fireApp, 'AccountData', uid);
    
    // Check if user already exists
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data();
    }
    
    // Create user profile
    const userData = {
        uid,
        email,
        displayName: displayName || additionalData.username || email.split('@')[0],
        username: additionalData.username || email.split('@')[0],
        photoURL: photoURL || "",
        links: [],
        selectedTheme: "Lake White",
        createdAt: new Date().toISOString(),
        
        // Team management fields
        accountType: "free",
        isTeamManager: false,
        teamId: null,
        teamRole: null,
        managerUserId: null,
        
        ...additionalData
    };
    
    await setDoc(userRef, userData);
    
    // Create lookup entries
    try {
        await updateUserLookup(uid, userData.username, userData.displayName, email);
    } catch (error) {
        console.warn('⚠️ Failed to create lookup entries:', error);
    }
    
    return userData;
}

// Email/Password Registration with Firebase Auth
export async function registerWithEmailPassword(email, password, username, language = 'en') {
    try {
        console.log('🚀 Starting Firebase Auth registration...');
        
        // Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('✅ Firebase user created:', user.uid);
        
        // Update the user's display name
        await updateProfile(user, {
            displayName: username
        });
        
        // Create user profile in Firestore
        const userData = await createUserProfile(user, { username, language });
        
        // Send welcome email
        try {
            const emailSubject = getEmailSubject(language);
            const emailContent = welcomeEmail(email, "Firebase Account", username, language);
            
            await EmailJs(username, email, emailSubject, emailContent);
            console.log('✅ Welcome email sent');
        } catch (emailError) {
            console.warn('⚠️ Failed to send welcome email:', emailError);
        }
        
        console.log('🎉 Registration completed successfully');
        return { user, userData };
        
    } catch (error) {
        console.error('❌ Registration failed:', error);
        
        // Handle specific Firebase Auth errors
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('This email is already registered');
        } else if (error.code === 'auth/weak-password') {
            throw new Error('Password should be at least 6 characters');
        } else if (error.code === 'auth/invalid-email') {
            throw new Error('Invalid email address');
        }
        
        throw new Error(`Registration failed: ${error.message}`);
    }
}

// Email/Password Login with Firebase Auth
export async function loginWithEmailPassword(email, password) {
    try {
        console.log('🔐 Starting Firebase Auth login...');
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('✅ Firebase login successful:', user.uid);
        
        // Get or create user profile
        const userData = await createUserProfile(user);
        
        return { user, userData };
        
    } catch (error) {
        console.error('❌ Login failed:', error);
        
        // Handle specific Firebase Auth errors
        if (error.code === 'auth/user-not-found') {
            throw new Error('No account found with this email');
        } else if (error.code === 'auth/wrong-password') {
            throw new Error('Incorrect password');
        } else if (error.code === 'auth/invalid-email') {
            throw new Error('Invalid email address');
        } else if (error.code === 'auth/too-many-requests') {
            throw new Error('Too many failed attempts. Please try again later');
        }
        
        throw new Error(`Login failed: ${error.message}`);
    }
}

// Google Sign-In with Firebase Auth
export async function signInWithGoogleFirebase(language = 'en') {
    try {
        console.log('🔐 Starting Google Firebase Auth...');
        
        let result;
        
        // Try popup first, fallback to redirect on mobile
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
        
        const user = result.user;
        const isNewUser = result._tokenResponse?.isNewUser || false;
        
        console.log('✅ Google Firebase Auth successful:', user.email, 'New user:', isNewUser);
        
        // Create or get user profile
        const userData = await createUserProfile(user, { language });
        
        // Send welcome email for new users
        if (isNewUser) {
            try {
                const emailSubject = getEmailSubject(language);
                const emailContent = welcomeEmail(user.email, "Google Account", userData.username, language);
                
                await EmailJs(userData.displayName, user.email, emailSubject, emailContent);
                console.log('✅ Welcome email sent to new Google user');
            } catch (emailError) {
                console.warn('⚠️ Failed to send welcome email:', emailError);
            }
        }
        
        return { user, userData, isNewUser };
        
    } catch (error) {
        console.error('❌ Google authentication failed:', error);
        
        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error('Google sign-in was cancelled');
        } else if (error.code === 'auth/popup-blocked') {
            throw new Error('Popup was blocked by browser');
        }
        
        throw new Error(`Google sign-in failed: ${error.message}`);
    }
}

// Handle Google redirect result
export async function handleGoogleRedirectResultFirebase(language = 'en') {
    try {
        const result = await getRedirectResult(auth);
        
        if (!result) {
            return null;
        }
        
        const user = result.user;
        const isNewUser = result._tokenResponse?.isNewUser || false;
        
        console.log('✅ Google redirect successful:', user.email);
        
        const userData = await createUserProfile(user, { language });
        
        return { user, userData, isNewUser };
        
    } catch (error) {
        console.error('❌ Google redirect failed:', error);
        throw new Error(`Google sign-in failed: ${error.message}`);
    }
}

// Password Reset with Firebase Auth
export async function resetPasswordFirebase(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        console.log('✅ Password reset email sent');
        return true;
    } catch (error) {
        console.error('❌ Password reset failed:', error);
        
        if (error.code === 'auth/user-not-found') {
            throw new Error('No account found with this email');
        } else if (error.code === 'auth/invalid-email') {
            throw new Error('Invalid email address');
        }
        
        throw new Error(`Password reset failed: ${error.message}`);
    }
}

// Sign out
export async function signOutFirebase() {
    try {
        await signOut(auth);
        console.log('✅ User signed out');
        return true;
    } catch (error) {
        console.error('❌ Sign out failed:', error);
        throw new Error(`Sign out failed: ${error.message}`);
    }
}

// Auth state observer
export function onAuthStateChangedFirebase(callback) {
    return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser() {
    return auth.currentUser;
}
// lib/authentication/firebaseAuth.js - More robust Google sign-in
// Add this improved version to your existing firebaseAuth.js

export async function signInWithGoogleFirebaseRobust(language = 'en') {
    try {
        console.log('🔐 Starting Google Firebase Auth...');
        
        let result;
        
        // Try popup first, fallback to redirect on mobile
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
        
        const user = result.user;
        const isNewUser = result._tokenResponse?.isNewUser || false;
        
        console.log('✅ Google Firebase Auth successful:', user.email, 'New user:', isNewUser);
        
        // ROBUST PROFILE CREATION/RETRIEVAL
        let userData = null;
        let maxRetries = 3;
        let retryCount = 0;
        
        while (!userData && retryCount < maxRetries) {
            try {
                // Try to get existing profile
                const userRef = doc(fireApp, 'AccountData', user.uid);
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists()) {
                    userData = userSnap.data();
                    console.log('✅ Existing profile found');
                    break;
                }
                
                // Create new profile if it doesn't exist
                console.log(`🔧 Creating user profile (attempt ${retryCount + 1}/${maxRetries})`);
                
                const newUserData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    username: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL || "",
                    links: [],
                    selectedTheme: "Lake White",
                    createdAt: new Date().toISOString(),
                    language: language,
                    
                    // Team management fields
                    accountType: "free",
                    isTeamManager: false,
                    teamId: null,
                    teamRole: null,
                    managerUserId: null,
                    
                    // Metadata
                    signupMethod: 'google',
                    isNewUser: isNewUser
                };
                
                await setDoc(userRef, newUserData);
                userData = newUserData;
                console.log('✅ Profile created successfully');
                
                // Try to create lookup entries (don't fail if this fails)
                try {
                    await updateUserLookup(user.uid, userData.username, userData.displayName, user.email);
                    console.log('✅ Lookup entries created');
                } catch (lookupError) {
                    console.warn('⚠️ Lookup creation failed, continuing...', lookupError);
                }
                
                break;
                
            } catch (profileError) {
                retryCount++;
                console.error(`❌ Profile creation attempt ${retryCount} failed:`, profileError);
                
                if (retryCount >= maxRetries) {
                    console.error('❌ All profile creation attempts failed');
                    throw new Error('Failed to create user profile after multiple attempts');
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
        }
        
        // Send welcome email for new users (don't fail the whole process if this fails)
        if (isNewUser) {
            try {
                const emailSubject = getEmailSubject(language);
                const emailContent = welcomeEmail(user.email, "Google Account", userData.username, language);
                
                await EmailJs(userData.displayName, user.email, emailSubject, emailContent);
                console.log('✅ Welcome email sent to new Google user');
            } catch (emailError) {
                console.warn('⚠️ Failed to send welcome email (continuing anyway):', emailError);
            }
        }
        
        return { user, userData, isNewUser };
        
    } catch (error) {
        console.error('❌ Google authentication failed:', error);
        
        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error('Google sign-in was cancelled');
        } else if (error.code === 'auth/popup-blocked') {
            throw new Error('Popup was blocked by browser');
        }
        
        throw new Error(`Google sign-in failed: ${error.message}`);
    }
}