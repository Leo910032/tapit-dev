// app/login/page.jsx - CONFIRMED CORRECT
import { Suspense } from 'react';
import LoginForm from "./componets/LoginForm"; // <-- Ensure this path is correct
import SideThing from "@/app/components/General Components/SideThing";
import { Toaster } from "react-hot-toast";

// A simple loading component for Suspense (this is fine)
function LoadingSpinner() {
    return (
        <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading form...</p>
        </div>
    )
}

export const generateMetadata = () => {
    return {
        title: "Tapit | Login Page",
        description: "Log into your account"
    }
}

export default function LoginPage() {
    return (
        <div className="flex h-screen w-screen">
            <Toaster />
            {/* The actual logic is now inside LoginForm */}
            <Suspense fallback={<LoadingSpinner />}>
                <LoginForm />
            </Suspense>
            <SideThing />
        </div>
    )
}