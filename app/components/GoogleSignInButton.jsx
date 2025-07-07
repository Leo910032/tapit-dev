"use client"
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";

export default function GoogleSignInButton({ 
    onClick, 
    isLoading, 
    disabled, 
    text = "Continue with Google",
    className = "" 
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`
                w-full flex items-center justify-center gap-3 
                py-4 px-6 rounded-md border border-gray-300 
                bg-white hover:bg-gray-50 
                transition-all duration-200
                font-medium text-gray-700
                ${disabled || isLoading 
                    ? 'cursor-not-allowed opacity-50' 
                    : 'cursor-pointer hover:scale-[1.02] active:scale-95'
                }
                ${className}
            `}
        >
            {isLoading ? (
                <Image 
                    src="https://linktree.sirv.com/Images/gif/loading.gif" 
                    width={20} 
                    height={20} 
                    alt="loading" 
                    className="mix-blend-multiply"
                />
            ) : (
                <FcGoogle className="text-xl" />
            )}
            <span className="text-sm sm:text-base">
                {isLoading ? 'Signing in...' : text}
            </span>
        </button>
    );
}