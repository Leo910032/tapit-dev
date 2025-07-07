import { fireApp } from "@/important/firebase";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { realEscapeString } from "../utilities";
import { resetPasswordEmail } from "../emailTemplate";
import { EmailJs } from "../EmailJs";

// Function to get email subject based on language
function getResetEmailSubject(language) {
    const subjects = {
        en: "Password Reset Request - TapIt 🔒",
        fr: "Demande de réinitialisation de mot de passe - TapIt 🔒",
        es: "Solicitud de restablecimiento de contraseña - TapIt 🔒",
        vm: "Yêu cầu đặt lại mật khẩu - TapIt 🔒",
        zh: "密码重置请求 - TapIt 🔒"
    };
    return subjects[language] || subjects.en;
}

export async function sendResetUrl(payload) {
    const { email, uid, expiresIn, language } = payload; // ✅ Get language from client
    
    try {
        const dbRef = collection(fireApp, "accountsReset");
        const collectionSnap = await getDocs(collection(fireApp, "accounts"));

        const cleanEmail = realEscapeString(email);
        const cleanUID = realEscapeString(uid);
        let userId;

        // Use language passed from client, fallback to English
        const userLanguage = language || 'en';
        console.log('🌍 Using language from client for reset email:', userLanguage);

        const resetUrl = `https://www.tapit.fr/reset-password/${cleanUID}`;

        let status = false;

        // Find the user (no need to get language from database)
        collectionSnap.forEach((credential) => {
            const data = credential.data();
            const { email: dbEmail, userId: userKey } = data;

            if (cleanEmail === dbEmail) {
                status = true;
                userId = userKey;
            }
        });

        if (!status) throw new Error("Email does not exist!");

        // Store reset request WITHOUT language
        await setDoc(doc(dbRef, `${cleanUID}`), {
            uid: cleanUID,
            expiresIn: expiresIn,
            userId
        });

        console.log('📧 Preparing password reset email in language:', userLanguage);

        // Generate localized email content using language from client
        const emailSubject = getResetEmailSubject(userLanguage);
        const emailPayload = {
            htmlContent: resetPasswordEmail(resetUrl, userLanguage),
            email: cleanEmail,
            name: "Client", // You might want to get the actual username from the database
            subject: emailSubject,
            language: userLanguage
        };

        console.log('📤 Sending password reset email with subject:', emailSubject);

        const emailResult = await EmailJs(
            emailPayload.name,
            emailPayload.email,
            emailPayload.subject,
            emailPayload.htmlContent
        );

        console.log('✅ Password reset email sent successfully in', userLanguage, emailResult);

    } catch (error) {
        console.error('❌ Error in sendResetUrl:', error);
        throw new Error(error);
    }
}