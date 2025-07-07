// lib/authentication/createAccount.jsx - UPDATED WITH TEAM MANAGEMENT FIELDS

import { fireApp } from "@/important/firebase";
import { generateId, realEscapeString} from "../utilities";
import { collection, doc, setDoc } from "firebase/firestore";
import { generateSalt, hashPassword } from "./encryption";
import { EmailJs } from "../EmailJs";
import { updateUserLookup } from "../userLookup"; // ✅ Import lookup function

// Import the email templates using require for CommonJS compatibility
const { welcomeEmail } = require("../emailTemplate");

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

export const createAccount = async (data) => {
    const { email, username, password, language } = data;
    const userId = generateId();
    const generatedUserId = userId;

    console.log('🚀 Starting account creation for:', { email, username, userId, language });

    try {
        const userLanguage = language || 'en';
        console.log('🌍 Using language from client for email:', userLanguage);

        const accountRef = collection(fireApp, "accounts");
        const accountDetailsRef = collection(fireApp, "AccountData");

        const cleanUsername = realEscapeString(username);
        const cleanEmail = realEscapeString(email);
        const cleanPassword = realEscapeString(password);
        
        const salt = generateSalt();
        const hashedPasword = hashPassword(cleanPassword, salt);

        console.log('🔐 Password hashed, preparing multilingual email...');

        const emailSubject = getEmailSubject(userLanguage);
        const emailPayload = {
            htmlContent: welcomeEmail(cleanEmail, cleanPassword, cleanUsername, userLanguage),
            email: cleanEmail,
            name: cleanUsername,
            password: cleanPassword,
            language: userLanguage,
            subject: emailSubject
        };

        console.log('📧 Attempting to send welcome email in language:', userLanguage);

        try {
            await EmailJs(
                emailPayload.name, 
                emailPayload.email, 
                emailPayload.subject,
                emailPayload.htmlContent
            );
            console.log('✅ Email sent successfully');
        } catch (emailError) {
            console.error('❌ Email sending failed:', {
                error: emailError.message,
                stack: emailError.stack,
            });
            throw new Error(`Account creation failed due to email error: ${emailError.message}`);
        }

        console.log('💾 Saving account data to Firestore...');

        // Save account credentials (login info) - NO CHANGES HERE
        await setDoc(doc(accountRef, `${userId}`), {
            userId: userId,
            email: cleanEmail,
            username: cleanUsername,
            displayName: cleanUsername,
            password: hashedPasword,
            mySalt: salt,
            createdAt: new Date().toISOString()
        });

        console.log('✅ Account credentials saved');

        // ✨ ========================================================== ✨
        // ✨          MODIFICATION FOR TEAM MANAGEMENT FEATURE          ✨
        // ✨ ========================================================== ✨
        // Save account details/profile with the new team management fields initialized.
        // Every new user starts as an individual on a free plan.
        await setDoc(doc(accountDetailsRef, `${userId}`), {
            // --- Existing Fields ---
            displayName: cleanUsername,
            username: cleanUsername,
            links: [],
            profilePhoto: "",
            selectedTheme: "Lake White",
            createdAt: new Date().toISOString(),

            // --- NEW TEAM MANAGEMENT FIELDS ---
            // Simulates the user's subscription plan. We'll check this to see if they can create a team.
            // Values can be 'free', 'pro', 'business', etc.
            accountType: "free",
            
            // A quick boolean check for UI rendering (e.g., showing a "Team" nav link).
            // All new users start as non-managers.
            isTeamManager: false,
            
            // Will be populated with the ID from the "Teams" collection when they join or create a team.
            // Starts as null because they are not in a team yet.
            teamId: null,

            // Their role within the team. Will be 'manager' or 'member'.
            // Starts as null.
            teamRole: null,

            // If they are a 'member', this will point to their manager's userId.
            // Helps in creating a clear hierarchy. Starts as null.
            managerUserId: null
        });

        console.log('✅ Account profile created with initial team fields');

        console.log('🔍 Creating lookup table entries...');
        try {
            await updateUserLookup(userId, cleanUsername, cleanUsername, cleanEmail);
            console.log('✅ Lookup table entries created');
        } catch (lookupError) {
            console.error('❌ Failed to create lookup entries:', lookupError);
            console.warn('⚠️ Continuing without lookup entries...');
        }

        console.log('🎉 Account creation completed successfully for userId:', generatedUserId);
        return generatedUserId;

    } catch (error) {
        console.error('❌ Account creation failed:', {
            error: error.message,
            stack: error.stack,
            userId: generatedUserId,
            email: data.email,
            username: data.username
        });
        
        throw new Error(`Account creation failed: ${error.message}`);
    }
};