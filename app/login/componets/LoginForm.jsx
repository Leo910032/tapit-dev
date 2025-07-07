// app/login/componets/LoginForm.jsx - FINAL, STABLE VERSION
"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  loginWithEmailPassword, 
  signInWithGoogleFirebase 
} from "@/lib/authentication/firebaseAuth"; // Assuming handleGoogleRedirectResult is not needed with this flow

import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

function LoginFormContent() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo') || '/dashboard';
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [seePassword, setSeePassword] = useState(true);
    const [canProceed, setCanProceed] = useState(false);

    // ✅ THIS IS THE "SMART REDIRECT" - THE ONLY SOURCE OF TRUTH FOR NAVIGATION
    useEffect(() => {
        // 1. Don't do anything while the AuthContext is determining the initial state.
        if (loading) {
            return;
        }

        // 2. If loading is finished, and we have BOTH the user and their Firestore data,
        //    it is now 100% safe to redirect.
        if (user && userData) {
            console.log('✅ Login Page: Auth and user data ready. Redirecting to /dashboard.');
            router.push(returnTo);
        }

    }, [user, userData, loading, router, returnTo]);


    // ✅ SIMPLIFIED GOOGLE SIGN-IN HANDLER
    const handleGoogleSignIn = useCallback(async () => {
        setIsSubmitting(true);
        try {
            await signInWithGoogleFirebase();
            // We DO NOT redirect here. The useEffect above will handle it
            // automatically and safely when the AuthContext updates.
            toast.success("Sign-in successful! Redirecting...");
        } catch (error) {
            toast.error(error.message || "Google sign-in failed.");
            setIsSubmitting(false); // Only set back to false on error
        }
    }, []);

    // ✅ SIMPLIFIED EMAIL/PASSWORD LOGIN HANDLER
    const handleEmailLogin = useCallback(async (e) => {
        e.preventDefault();
        if (!canProceed) return;
        
        setIsSubmitting(true);

        const promise = loginWithEmailPassword(email, password);
        
        toast.promise(promise, {
            loading: "Validating...",
            success: "Login successful! Redirecting...",
            error: (err) => err.message || "Invalid credentials."
        });

        try {
            await promise;
            // We DO NOT redirect here. The useEffect will handle it.
        } catch (error) {
            setIsSubmitting(false); // Only set back to false on error
        }

    }, [canProceed, email, password]);


    // Form validation useEffect (this is fine as it is)
    useEffect(() => {
        const emailValid = email.includes('@') && email.includes('.');
        const passwordValid = password.length >= 6;
        setCanProceed(emailValid && passwordValid);
    }, [email, password]);


    // ✅ THIS IS THE "GATEKEEPER UI"
    // While the context is loading OR if a user exists (meaning we're in the redirect process),
    // show a full-page loading spinner. This prevents UI flicker.
    if (loading || user) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verifying your session...</p>
                </div>
            </div>
        );
    }

    // --- If we get past the checks above, it means no user is logged in. ---
    // --- It is now safe to render the actual login form UI. ---
    return (
        <div className="flex-1 sm:p-12 px-4 py-8 flex flex-col overflow-y-auto">
            <Link href={'/'} className="sm:p-0 p-3">
                <Image src={"https://firebasestorage.googleapis.com/v0/b/lintre-ffa96.firebasestorage.app/o/Logo%2Fimage-removebg-preview.png?alt=media&token=4ac6b2d0-463e-4ed7-952a-2fed14985fc0"} alt="logo" height={150} width={150} className="filter invert" priority style={{ height: 'auto' }} />
            </Link>
            <section className="mx-auto py-10 w-full sm:w-5/6 md:w-3/4 lg:w-2/3 xl:w-1/2 flex-1 flex flex-col justify-center">
                <p className="text-2xl sm:text-5xl md:text-3xl font-extrabold text-center">Welcome Back!</p>
                
                <div className="py-8 sm:py-12 flex flex-col gap-4 sm:gap-6 w-full">
                    <GoogleSignInButton 
                        onClick={handleGoogleSignIn} 
                        isLoading={isSubmitting} 
                        disabled={isSubmitting} 
                        text={"Continue with Google"} 
                    />
                    <div className="flex items-center gap-4 my-2">
                        <div className="flex-1 h-px bg-gray-300"></div><span className="text-sm text-gray-500">or</span><div className="flex-1 h-px bg-gray-300"></div>
                    </div>
                    <form className="flex flex-col gap-4 sm:gap-6 w-full" onSubmit={handleEmailLogin}>
                        <div className="flex items-center py-2 sm:py-3 px-2 sm:px-6 rounded-md myInput bg-black bg-opacity-5 text-base sm:text-lg w-full">
                            <input type="email" placeholder="Email" className="outline-none border-none bg-transparent ml-1 py-3 flex-1 text-sm sm:text-base" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} />
                        </div>
                        <div className="flex items-center relative py-2 sm:py-3 px-2 sm:px-6 rounded-md bg-black bg-opacity-5 text-base sm:text-lg myInput">
                            <input type={seePassword ? "password" : "text"} placeholder="Password" className="peer outline-none border-none bg-transparent py-3 ml-1 flex-1 text-sm sm:text-base" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isSubmitting} />
                            {seePassword ? <FaEyeSlash className="opacity-60 cursor-pointer" onClick={() => setSeePassword(false)} /> : <FaEye className="opacity-60 cursor-pointer text-themeGreen" onClick={() => setSeePassword(true)} />}
                        </div>
                        <Link href={"/forgot-password"} className="w-fit hover:rotate-2 hover:text-themeGreen origin-left">Forgot your password?</Link>
                        <button type="submit" disabled={!canProceed || isSubmitting} className="rounded-md py-4 sm:py-5 grid place-items-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-default active:scale-95 active:opacity-40 hover:scale-[1.025] bg-themeGreen mix-blend-screen">
                            {!isSubmitting ? <span>Submit</span> : <Image src={"https://linktree.sirv.com/Images/gif/loading.gif"} width={25} height={25} alt="loading" className="mix-blend-screen" />}
                        </button>
                    </form>
                </div>
                <p className="text-center sm:text-base text-sm">
                    <span className="opacity-60">Dont have an account?</span> 
                    <Link href={`/signup${returnTo !== '/dashboard' ? `?returnTo=${returnTo}` : ''}`} className="text-themeGreen"> Sign up</Link>
                </p>
            </section>
        </div>
    )
}

// Keep the Suspense wrapper, it's good practice for useSearchParams
export default function LoginForm() {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
            <LoginFormContent />
        </Suspense>
    );
}