// app/login/components/LoginForm.jsx - Add return URL handling
"use client"
import { useDebounce } from "@/LocalHooks/useDebounce";
import { fireApp } from "@/important/firebase";
import { loginAccount } from "@/lib/authentication/login";
import { signInWithGoogle, handleGoogleRedirectResult } from "@/lib/authentication/googleAuth";
import { setSessionCookie } from "@/lib/authentication/session";
import { useTranslation } from "@/lib/useTranslation";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";
import { collection, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo, useRef, Suspense } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

function LoginFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo') || '/dashboard';
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
    const hasCheckedRedirect = useRef(false);
    
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
            forgotPassword: t('login.forgot_password'),
            submit: t('login.submit'),
            noAccount: t('login.no_account'),
            signUp: t('login.sign_up'),
            continueWithGoogle: t('login.continue_with_google') || 'Continue with Google',
            googleSignInSuccess: t('login.google_signin_success') || 'Google sign-in successful!',
            googleSignInFailed: t('login.google_signin_failed') || 'Google sign-in failed'
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
                    toast.success(translations.googleSignInSuccess);
                    setTimeout(() => {
                        router.push(returnTo);
                    }, 1000);
                }
            } catch (error) {
                toast.error(error.message || translations.googleSignInFailed);
                setIsGoogleLoading(false);
            }
        };
        checkRedirectResult();
    }, [isInitialized, locale, translations, router, returnTo]);

    const handleLogin = useCallback(async(e) => {
        e.preventDefault();
        if (!canProceed || isLoading) throw new Error('Cannot proceed with login');
        
        setIsLoading(true);
        const data = { log_username: username, log_password: password };

        try {
            const userId = await loginAccount(data);
            setSessionCookie("adminLinker", `${userId}`, (60 * 60));
            setTimeout(() => { 
                console.log('🔄 Redirecting to:', returnTo);
                router.push(returnTo); 
            }, 1000);
        } catch (error) {
            setIsLoading(false);
            let errorMsg = existingUsernames.includes(String(username).toLowerCase()) 
                ? translations.incorrectPassword 
                : translations.usernameNotRegistered;
            setErrorMessage(errorMsg);
            throw new Error(errorMsg);
        }
    }, [canProceed, isLoading, username, password, existingUsernames, translations, router, returnTo]);

    const handleGoogleSignIn = useCallback(async () => {
        if (isGoogleLoading || isLoading) return;
        setIsGoogleLoading(true);
        
        try {
            const result = await signInWithGoogle(locale);
            if (result.requiresRedirect) return;
            
            setSessionCookie("adminLinker", result.userId, (60 * 60));
            toast.success(translations.googleSignInSuccess);
            setTimeout(() => { 
                console.log('🔄 Redirecting to:', returnTo);
                router.push(returnTo); 
            }, 1000);
        } catch (error) {
            setIsGoogleLoading(false);
            toast.error(error.message || translations.googleSignInFailed);
        }
    }, [isGoogleLoading, isLoading, locale, translations, router, returnTo]);

    const loginHandler = useCallback((e) => {
        e.preventDefault();
        toast.promise(handleLogin(e), {
            loading: translations.validating,
            error: translations.invalidCredentials,
            success: translations.success,
        }, { /* toast styles */ });
    }, [handleLogin, translations]);

    useEffect(() => {
        if (unsubscribeRef.current) return;
        const collectionRef = collection(fireApp, "accounts");
        const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
            const usernames = [];
            querySnapshot.forEach((doc) => { if (doc.data().username) usernames.push(String(doc.data().username).toLowerCase()); });
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

    if (!isInitialized) return <div>Loading...</div>;

    return (
        <div className="flex-1 sm:p-12 px-4 py-8 flex flex-col overflow-y-auto">
            <Link href={'/'} className="sm:p-0 p-3">
                <Image src={"https://firebasestorage.googleapis.com/v0/b/lintre-ffa96.firebasestorage.app/o/Logo%2Fimage-removebg-preview.png?alt=media&token=4ac6b2d0-463e-4ed7-952a-2fed14985fc0"} alt="logo" height={150} width={150} className="filter invert" priority style={{ height: 'auto' }} />
            </Link>
            <section className="mx-auto py-10 w-full sm:w-5/6 md:w-3/4 lg:w-2/3 xl:w-1/2 flex-1 flex flex-col justify-center">
                <p className="text-2xl sm:text-5xl md:text-3xl font-extrabold text-center">{translations.title}</p>
                {returnTo !== '/dashboard' && (
                    <p className="text-center text-blue-600 mt-2 text-sm">
                        Youll be redirected back to complete your purchase
                    </p>
                )}
                <div className="py-8 sm:py-12 flex flex-col gap-4 sm:gap-6 w-full">
                    <GoogleSignInButton onClick={handleGoogleSignIn} isLoading={isGoogleLoading} disabled={isLoading || isGoogleLoading} text={translations.continueWithGoogle} />
                    <div className="flex items-center gap-4 my-2">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="text-sm text-gray-500">or</span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                    </div>
                    <form className="flex flex-col gap-4 sm:gap-6 w-full" onSubmit={loginHandler}>
                        <div className="flex items-center py-2 sm:py-3 px-2 sm:px-6 rounded-md myInput bg-black bg-opacity-5 text-base sm:text-lg w-full">
                            <input type="text" placeholder={translations.usernamePlaceholder} className="outline-none border-none bg-transparent ml-1 py-3 flex-1 text-sm sm:text-base" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isLoading || isGoogleLoading} />
                        </div>
                        <div className="flex items-center relative py-2 sm:py-3 px-2 sm:px-6 rounded-md bg-black bg-opacity-5 text-base sm:text-lg myInput">
                            <input type={seePassword ? "password" : "text"} placeholder={translations.passwordPlaceholder} className="peer outline-none border-none bg-transparent py-3 ml-1 flex-1 text-sm sm:text-base" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading || isGoogleLoading} />
                            {seePassword ? <FaEyeSlash className={`opacity-60 cursor-pointer ${(isLoading || isGoogleLoading) ? 'pointer-events-none' : ''}`} onClick={() => !(isLoading || isGoogleLoading) && setSeePassword(!seePassword)} /> : <FaEye className={`opacity-60 cursor-pointer text-themeGreen ${(isLoading || isGoogleLoading) ? 'pointer-events-none' : ''}`} onClick={() => !(isLoading || isGoogleLoading) && setSeePassword(!seePassword)} />}
                        </div>
                        <Link href={"/forgot-password"} className="w-fit hover:rotate-2 hover:text-themeGreen origin-left">{translations.forgotPassword}</Link>
                        <button type="submit" disabled={!canProceed || isLoading || isGoogleLoading} className={`rounded-md py-4 sm:py-5 grid place-items-center font-semibold transition-all duration-200 ${canProceed && !isLoading && !isGoogleLoading ? "cursor-pointer active:scale-95 active:opacity-40 hover:scale-[1.025] bg-themeGreen mix-blend-screen" : "cursor-default opacity-50"}`}>
                            {!isLoading ? <span className="nopointer">{translations.submit}</span> : <Image src={"https://linktree.sirv.com/Images/gif/loading.gif"} width={25} height={25} alt="loading" className="mix-blend-screen" />}
                        </button>
                        {!isLoading && !isGoogleLoading && errorMessage && <span className="text-sm text-red-500 text-center">{errorMessage}</span>}
                    </form>
                </div>
                <p className="text-center sm:text-base text-sm">
                    <span className="opacity-60">{translations.noAccount}</span> 
                    <Link href={`/signup${returnTo !== '/dashboard' ? `?returnTo=${returnTo}` : ''}`} className="text-themeGreen"> {translations.signUp}</Link>
                </p>
            </section>
        </div>
    )
}

export default function LoginForm() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginFormContent />
        </Suspense>
    );
}