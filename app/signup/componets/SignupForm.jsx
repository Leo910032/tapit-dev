// app/signup/componets/SignupForm.jsx - FIXED VERSION
"use client"
import { useDebounce } from "@/LocalHooks/useDebounce";
import { fireApp } from "@/important/firebase";
import { createAccount } from "@/lib/authentication/createAccount";
import { signInWithGoogle, handleGoogleRedirectResult } from "@/lib/authentication/googleAuth";
import { setSessionCookie } from "@/lib/authentication/session";
import { useTranslation } from "@/lib/useTranslation";
import { validateEmail, validatePassword } from "@/lib/utilities";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { collection, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

export default function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
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
    const hasCheckedRedirect = useRef(false);

    const debouncedUsername = useDebounce(username, 500);
    const debouncedEmail = useDebounce(email, 500);

    // Function to determine redirect URL
    const getRedirectUrl = useCallback(() => {
        // Check if there's a return URL in the query params
        const returnUrl = searchParams?.get('returnUrl');
        if (returnUrl) {
            console.log('🔄 Using return URL:', returnUrl);
            return returnUrl;
        }

        // Check if user came from NFC checkout
        if (typeof window !== 'undefined') {
            const referrer = document.referrer;
            if (referrer.includes('/nfc-cards')) {
                console.log('🔄 Came from NFC pages, redirecting to checkout');
                return '/nfc-cards/checkout';
            }
        }

        // Default to dashboard
        console.log('🔄 Using default redirect: /dashboard');
        return '/dashboard';
    }, [searchParams]);

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
            haveAccount: t('signup.have_account'),
            logIn: t('signup.log_in'),
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

    useEffect(() => {
        if (!isInitialized || hasCheckedRedirect.current) return;
        const checkRedirectResult = async () => {
            try {
                hasCheckedRedirect.current = true;
                const result = await handleGoogleRedirectResult(locale);
                if (result) {
                    setIsGoogleLoading(true);
                    setSessionCookie("adminLinker", result.userId, (60 * 60));
                    toast.success(result.isNewUser ? translations.accountCreated : translations.googleSignInSuccess);
                    
                    // Use context-aware redirect
                    const redirectUrl = getRedirectUrl();
                    setTimeout(() => { 
                        router.push(redirectUrl); 
                    }, 1000);
                }
            } catch (error) {
                toast.error(error.message || translations.googleSignInFailed);
                setIsGoogleLoading(false);
            }
        };
        checkRedirectResult();
    }, [isInitialized, locale, translations, router, getRedirectUrl]);

    const handleGoogleSignIn = useCallback(async () => {
        if (isGoogleLoading || isLoading) return;
        setIsGoogleLoading(true);
        try {
            const result = await signInWithGoogle(locale);
            if (result.requiresRedirect) return;
            setSessionCookie("adminLinker", result.userId, (60 * 60));
            toast.success(result.isNewUser ? translations.accountCreated : translations.googleSignInSuccess);
            
            // Use context-aware redirect
            const redirectUrl = getRedirectUrl();
            setTimeout(() => { 
                router.push(redirectUrl); 
            }, 1000);
        } catch (error) {
            setIsGoogleLoading(false);
            toast.error(error.message || translations.googleSignInFailed);
        }
    }, [isGoogleLoading, isLoading, locale, translations, router, getRedirectUrl]);

    const handleSignUp = useCallback(async (e) => {
        e.preventDefault();
        if (!canProceed || isLoading || isGoogleLoading) throw new Error("Cannot proceed with signup.");
        setIsLoading(true);
        const data = { email, username, password, language: locale };
        try {
            const userId = await createAccount(data);
            setSessionCookie("adminLinker", `${userId}`, (60 * 60));
            
            // Use context-aware redirect
            const redirectUrl = getRedirectUrl();
            setTimeout(() => { 
                router.push(redirectUrl); 
            }, 1000);
            return userId;
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    }, [canProceed, isLoading, isGoogleLoading, email, username, password, locale, router, getRedirectUrl]);

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

    if (!isInitialized) return <div>Loading...</div>;

    return (
        <div className="flex-1 sm:p-12 px-4 py-8 flex flex-col overflow-y-auto">
            <Link href={'/'} className="sm:p-0 p-3">
                <Image src={"https://firebasestorage.googleapis.com/v0/b/lintre-ffa96.firebasestorage.app/o/Logo%2Fimage-removebg-preview.png?alt=media&token=4ac6b2d0-463e-4ed7-952a-2fed14985fc0"} alt="logo" height={150} width={150} className="filter invert" priority style={{ height: 'auto' }} />
            </Link>
            <section className="mx-auto py-10 w-full sm:w-5/6 md:w-3/4 lg:w-2/3 xl:w-1/2 flex-1 flex flex-col justify-center">
                <p className="text-2xl sm:text-5xl md:text-3xl font-extrabold text-center">{translations.title}</p>
                <div className="py-8 sm:py-12 flex flex-col gap-4 sm:gap-6 w-full">
                    <GoogleSignInButton onClick={handleGoogleSignIn} isLoading={isGoogleLoading} disabled={isLoading || isGoogleLoading} text={translations.continueWithGoogle} />
                    <div className="flex items-center gap-4 my-2">
                        <div className="flex-1 h-px bg-gray-300"></div><span className="text-sm text-gray-500">or</span><div className="flex-1 h-px bg-gray-300"></div>
                    </div>
                    <form className="flex flex-col gap-4 sm:gap-6 w-full" onSubmit={signupHandler}>
                        <div className="flex items-center py-2 sm:py-3 px-2 sm:px-6 rounded-md myInput bg-black bg-opacity-5 text-base sm:text-lg w-full">
                            <input type="email" placeholder={translations.emailPlaceholder} className="outline-none border-none bg-transparent ml-1 py-3 flex-1 text-sm sm:text-base" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading || isGoogleLoading} />
                        </div>
                        <div className="flex items-center py-2 sm:py-3 px-2 sm:px-6 rounded-md myInput bg-black bg-opacity-5 text-base sm:text-lg w-full">
                            <input type="text" placeholder={translations.usernamePlaceholder} className="outline-none border-none bg-transparent ml-1 py-3 flex-1 text-sm sm:text-base" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isLoading || isGoogleLoading} />
                        </div>
                        <div className="flex items-center relative py-2 sm:py-3 px-2 sm:px-6 rounded-md bg-black bg-opacity-5 text-base sm:text-lg myInput">
                            <input type={seePassword ? "password" : "text"} placeholder={translations.passwordPlaceholder} className="peer outline-none border-none bg-transparent py-3 ml-1 flex-1 text-sm sm:text-base" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading || isGoogleLoading} />
                            {seePassword ? <FaEyeSlash className={`opacity-60 cursor-pointer ${(isLoading || isGoogleLoading) ? 'pointer-events-none' : ''}`} onClick={() => !(isLoading || isGoogleLoading) && setSeePassword(!seePassword)} /> : <FaEye className={`opacity-60 cursor-pointer text-themeGreen ${(isLoading || isGoogleLoading) ? 'pointer-events-none' : ''}`} onClick={() => !(isLoading || isGoogleLoading) && setSeePassword(!seePassword)} />}
                        </div>
                        {!isLoading && !isGoogleLoading && errorMessage && <span className="text-sm text-red-500 block">{errorMessage}</span>}
                        <button type="submit" disabled={!canProceed || isLoading || isGoogleLoading} className={`rounded-md py-4 sm:py-5 grid place-items-center font-semibold transition-all duration-200 ${canProceed && !isLoading && !isGoogleLoading ? "cursor-pointer active:scale-95 active:opacity-40 hover:scale-[1.025] bg-themeGreen mix-blend-screen" : "cursor-default opacity-50"}`}>
                            {!isLoading ? <span className="nopointer">{translations.submit}</span> : <Image src={"https://linktree.sirv.com/Images/gif/loading.gif"} width={25} height={25} alt="loading" className="mix-blend-screen" />}
                        </button>
                    </form>
                </div>
                <p className="text-center sm:text-base text-sm"><span className="opacity-60">{translations.haveAccount}</span> <Link href={"/login"} className="text-themeGreen">{translations.logIn}</Link></p>
            </section>
        </div>
    );
}