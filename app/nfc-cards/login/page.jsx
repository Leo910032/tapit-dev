// app/nfc-cards/login/page.jsx
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import NFCLoginForm from "./components/NFCLoginForm";
import SideThing from "@/app/components/General Components/SideThing";

export const generateMetadata = () => {
    return {
        title: "TapIt | Login for NFC Cards",
        description: "Log into your account to purchase NFC cards"
    }
}

function LoadingFallback() {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
                <div className="text-lg">Loading login form...</div>
            </div>
        </div>
    );
}

export default function NFCLoginPage() {
    return (
        <div className="flex h-screen w-screen">
            <Toaster />
            <Suspense fallback={<LoadingFallback />}>
                <NFCLoginForm />
            </Suspense>
            <SideThing />
        </div>
    );
}