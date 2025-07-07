// app/components/General Components/NFCLoginModal.jsx
"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useDebounce } from "@/LocalHooks/useDebounce";
import { fireApp } from "@/important/firebase";
import { loginAccount } from "@/lib/authentication/login";
import { signInWithGoogle, handleGoogleRedirectResult } from "@/lib/authentication/googleAuth";
import { setSessionCookie } from "@/lib/authentication/session";
import { useTranslation } from "@/lib/useTranslation";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";
import { collection, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";

export default function NFCLoginModal({ onClose, onSuccess, onSwitchToSignup }) {
    const { t, isInitialized, locale } = useTranslation();
    
    const [seePassword, setSeePassword] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [canProceed, setCanProceed] = useState(false);
    const [existingUsernames, setExistingUsernames] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    
    const unsubscribeRef = useRef(null);
    const debouncedUsername = useDebounce(username, 500);
    const debouncedPassword = useDebounce(password, 500);

    const translations = useMemo(() => {
        if (!isInitialized) return {};
        return {
            validating: t('login.validating'),
            invalidCredentials: t('login.invalid_credentials'),
            success: t('login.success'),
            incorrectPassword: t('login.incorrect_password'),
            usernameNotRegistered: t('login.username_not_registered'),
            title: t('login.title'),
            usernamePlaceholder: t('login.username_placeholder'),
            passwordPlaceholder: t('login.password_placeholder'),
            submit: t('login.submit'),
            continueWithGoogle: t('login.continue_with_google') || 'Continue with Google',
            googleSignInSuccess: t('login.google_signin_success') || 'Login successful!',
            googleSignInFailed: t('login.google_signin_failed') || 'Google sign-in failed'
        };
    }, [t, isInitialized]);

    const handleLogin = useCallback(async(e) => {
        e.preventDefault();
        if (!canProceed || isLoading) throw new Error('Cannot proceed with login');
        
        setIsLoading(true);
        const data = { log_username: username, log_password: password };

        try {
            const userId = await loginAccount(data);
            setSessionCookie("adminLinker", `${userId}`, (60 * 60));
            toast.success(translations.success);
            // Don't redirect, just call onSuccess to update parent component
            onSuccess();
        } catch (error) {
            setIsLoading(false);
            let errorMsg = existingUsernames.includes(String(username).toLowerCase()) 
                ? translations.incorrectPassword 
                : translations.usernameNotRegistered;
            setErrorMessage(errorMsg);
            throw new Error(errorMsg);
        }
    }, [canProceed, isLoading, username, password, existingUsernames, translations, onSuccess]);

    const handleGoogleSignIn = useCallback(async () => {
        if (isGoogleLoading || isLoading) return;
        setIsGoogleLoading(true);
        
        try {
            const result = await signInWithGoogle(locale);
            if (result.requiresRedirect) return;
            
            setSessionCookie("adminLinker", result.userId, (60 * 60));
            toast.success(translations.googleSignInSuccess);
            // Don't redirect, just call onSuccess to update parent component
            onSuccess();
        } catch (error) {
            setIsGoogleLoading(false);
            toast.error(error.message || translations.googleSignInFailed);
        }
    }, [isGoogleLoading, isLoading, locale, translations, onSuccess]);

    const loginHandler = useCallback((e) => {
        e.preventDefault();
        toast.promise(handleLogin(e), {
            loading: translations.validating,
            error: translations.invalidCredentials,
            success: translations.success,
        });
    }, [handleLogin, translations]);

    useEffect(() => {
        if (unsubscribeRef.current) return;
        const collectionRef = collection(fireApp, "accounts");
        const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
            const usernames = [];
            querySnapshot.forEach((doc) => { 
                if (doc.data().username) usernames.push(String(doc.data().username).toLowerCase()); 
            });
            setExistingUsernames(usernames);
        });
        unsubscribeRef.current = unsubscribe;
        return () => { if (unsubscribeRef.current) unsubscribeRef.current(); };
    }, []);

    useEffect(() => {
        if (isLoading) return;
        if (username !== "" && password !== "") {
            setCanProceed(true);
            if (!errorMessage.includes(translations.incorrectPassword) && !errorMessage.includes(translations.usernameNotRegistered)) {
                setErrorMessage("");
            }
        } else {
            setCanProceed(false);
        }
    }, [debouncedUsername, debouncedPassword, isLoading, errorMessage, translations]);

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

                    <form className="space-y-4" onSubmit={loginHandler}>
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
                        <span className="text-gray-600">Dont have an account? </span>
                        <button 
                            onClick={onSwitchToSignup}
                            className="text-themeGreen hover:underline font-medium"
                        >
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}