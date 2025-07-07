// app/components/General Components/NFCSignupModal.jsx
"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useDebounce } from "@/LocalHooks/useDebounce";
import { fireApp } from "@/important/firebase";
import { createAccount } from "@/lib/authentication/createAccount";
import { signInWithGoogle, handleGoogleRedirectResult } from "@/lib/authentication/googleAuth";
import { setSessionCookie } from "@/lib/authentication/session";
import { useTranslation } from "@/lib/useTranslation";
import { validateEmail, validatePassword } from "@/lib/utilities";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";
import { collection, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";

export default function NFCSignupModal({ onClose, onSuccess, onSwitchToLogin }) {
    const { t, isInitialized, locale } = useTranslation();

    const [seePassword, setSeePassword] = useState(true);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [canProceed, setCanProceed] = useState(false);
    const [existingUsernames, setExistingUsernames] = useState([]);
    const [existingEmails, setExistingEmails] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const unsubscribeRef = useRef(null);
    const debouncedUsername = useDebounce(username, 500);
    const debouncedEmail = useDebounce(email, 500);

    const translations = useMemo(() => {
        if (!isInitialized) return {};
        return {
            title: t('signup.title'),
            creatingAccount: t('signup.creating_account'),
            accountCreated: t('signup.account_created'),
            accountFailed: t('signup.account_failed'),
            emailPlaceholder: t('signup.email_placeholder'),
            usernamePlaceholder: t('signup.username_placeholder'),
            passwordPlaceholder: t('signup.password_placeholder'),
            submit: t('signup.submit'),
            validation: {
                invalidEmail: t('signup.validation.invalid_email'),
                emailTaken: t('signup.validation.email_taken'),
                usernameTaken: t('signup.validation.username_taken'),
                passwordLength: t('signup.validation.password_length'),
            },
            continueWithGoogle: t('signup.continue_with_google') || 'Continue with Google',
            googleSignInSuccess: t('signup.google_signin_success') || 'Sign-up successful!',
            googleSignInFailed: t('signup.google_signin_failed') || 'Google sign-in failed'
        };
    }, [t, isInitialized]);

    const handleGoogleSignIn = useCallback(async () => {
        if (isGoogleLoading || isLoading) return;
        setIsGoogleLoading(true);
        try {
            const result = await signInWithGoogle(locale);
            if (result.requiresRedirect) return;
            setSessionCookie("adminLinker", result.userId, (60 * 60));
            toast.success(result.isNewUser ? translations.accountCreated : translations.googleSignInSuccess);
            // Don't redirect, just call onSuccess to update parent component
            onSuccess();
        } catch (error) {
            setIsGoogleLoading(false);
            toast.error(error.message || translations.googleSignInFailed);
        }
    }, [isGoogleLoading, isLoading, locale, translations, onSuccess]);

    const handleSignUp = useCallback(async (e) => {
        e.preventDefault();
        if (!canProceed || isLoading || isGoogleLoading) throw new Error("Cannot proceed with signup.");
        setIsLoading(true);
        const data = { email, username, password, language: locale };
        try {
            const userId = await createAccount(data);
            setSessionCookie("adminLinker", `${userId}`, (60 * 60));
            toast.success(translations.accountCreated);
            // Don't redirect, just call onSuccess to update parent component
            onSuccess();
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    }, [canProceed, isLoading, isGoogleLoading, email, username, password, locale, translations, onSuccess]);

    const signupHandler = (e) => {
        e.preventDefault();
        toast.promise(handleSignUp(e), {
            loading: translations.creatingAccount,
            success: translations.accountCreated,
            error: (err) => err.message || translations.accountFailed,
        });
    };

    useEffect(() => {
        if (unsubscribeRef.current) return;
        const collectionRef = collection(fireApp, "accounts");
        const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
            const usernames = [], emails = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.username) usernames.push(String(data.username).toLowerCase());
                if (data.email) emails.push(String(data.email).toLowerCase());
            });
            setExistingUsernames(usernames);
            setExistingEmails(emails);
        });
        unsubscribeRef.current = unsubscribe;
        return () => { if (unsubscribeRef.current) unsubscribeRef.current(); };
    }, []);

    useEffect(() => {
        if (isLoading || isGoogleLoading) return;
        const isEmailValid = validateEmail(email), isEmailTaken = existingEmails.includes(debouncedEmail.toLowerCase());
        const isUsernameTaken = existingUsernames.includes(debouncedUsername.toLowerCase()), isPasswordValid = validatePassword(password);
        let error = "";
        if (debouncedEmail && !isEmailValid) error = translations.validation.invalidEmail;
        else if (debouncedEmail && isEmailTaken) error = translations.validation.emailTaken;
        else if (debouncedUsername && isUsernameTaken) error = translations.validation.usernameTaken;
        else if (password && !isPasswordValid) error = translations.validation.passwordLength;
        setErrorMessage(error);
        setCanProceed(email !== "" && username !== "" && password !== "" && isEmailValid && !isEmailTaken && !isUsernameTaken && isPasswordValid);
    }, [debouncedUsername, debouncedEmail, password, existingUsernames, existingEmails, isLoading, isGoogleLoading, translations]);

    if (!isInitialized) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{translations.title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FaTimes className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <GoogleSignInButton 
                        onClick={handleGoogleSignIn} 
                        isLoading={isGoogleLoading} 
                        disabled={isLoading || isGoogleLoading} 
                        text={translations.continueWithGoogle} 
                    />
                    
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="text-sm text-gray-500">or</span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                    </div>

                    <form className="space-y-4" onSubmit={signupHandler}>
                        <div className="flex items-center py-3 px-4 rounded-md border border-gray-300 focus-within:border-themeGreen">
                            <input 
                                type="email" 
                                placeholder={translations.emailPlaceholder} 
                                className="outline-none border-none bg-transparent flex-1 text-sm" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                disabled={isLoading || isGoogleLoading} 
                            />
                        </div>
                        
                        <div className="flex items-center py-3 px-4 rounded-md border border-gray-300 focus-within:border-themeGreen">
                            <input 
                                type="text" 
                                placeholder={translations.usernamePlaceholder} 
                                className="outline-none border-none bg-transparent flex-1 text-sm" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                                disabled={isLoading || isGoogleLoading} 
                            />
                        </div>
                        
                        <div className="flex items-center py-3 px-4 rounded-md border border-gray-300 focus-within:border-themeGreen">
                            <input 
                                type={seePassword ? "password" : "text"} 
                                placeholder={translations.passwordPlaceholder} 
                                className="outline-none border-none bg-transparent flex-1 text-sm" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                disabled={isLoading || isGoogleLoading} 
                            />
                            {seePassword ? 
                                <FaEyeSlash className={`opacity-60 cursor-pointer ${(isLoading || isGoogleLoading) ? 'pointer-events-none' : ''}`} onClick={() => !(isLoading || isGoogleLoading) && setSeePassword(!seePassword)} /> 
                                : 
                                <FaEye className={`opacity-60 cursor-pointer text-themeGreen ${(isLoading || isGoogleLoading) ? 'pointer-events-none' : ''}`} onClick={() => !(isLoading || isGoogleLoading) && setSeePassword(!seePassword)} />
                            }
                        </div>

                        {!isLoading && !isGoogleLoading && errorMessage && (
                            <span className="text-sm text-red-500 block">{errorMessage}</span>
                        )}

                        <button 
                            type="submit" 
                            disabled={!canProceed || isLoading || isGoogleLoading} 
                            className={`w-full py-3 rounded-md font-semibold transition-all duration-200 ${
                                canProceed && !isLoading && !isGoogleLoading 
                                    ? "cursor-pointer active:scale-95 bg-themeGreen text-white hover:bg-green-600" 
                                    : "cursor-default opacity-50 bg-gray-300"
                            }`}
                        >
                            {!isLoading ? (
                                <span>{translations.submit}</span>
                            ) : (
                                <Image src={"https://linktree.sirv.com/Images/gif/loading.gif"} width={20} height={20} alt="loading" className="mx-auto" />
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm mt-6">
                        <span className="text-gray-600">Already have an account? </span>
                        <button 
                            onClick={onSwitchToLogin}
                            className="text-themeGreen hover:underline font-medium"
                        >
                            Log in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}