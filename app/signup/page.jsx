// app/signup/page.jsx - FIXED
import { Suspense } from 'react'; // <-- 1. Import Suspense
import SignUpForm from "./componets/SignupForm";
import SideThing from "@/app/components/General Components/SideThing";
import { Toaster } from "react-hot-toast";

// A simple loading component to show while the form loads
function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center w-full h-full">
            <p className="text-gray-500">Loading...</p>
        </div>
    )
}

export const generateMetadata = () => {
    return {
        title: "Tapit | Create an account",
        description: "Register your new account with us"
    }
}

export default function SignupPage() {
    return (
        <div className="flex h-screen w-screen">
            <Toaster />
            <SideThing />
            {/* 2. Wrap the component using useSearchParams in Suspense */}
            <Suspense fallback={<LoadingSpinner />}>
                <SignUpForm />
            </Suspense>
        </div>
    )
}