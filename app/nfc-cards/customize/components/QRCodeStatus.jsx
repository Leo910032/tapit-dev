// app/nfc-cards/customize/components/QRCodeStatus.jsx - NEW COMPONENT
"use client";

export default function QRCodeStatus({ userId }) {
    return (
        <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code
            </label>
            {userId ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">QR Code Active</p>
                        <p className="text-xs text-green-600">Links to your TapIt profile - will appear on the back of your card</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800">Login Required for QR Code</p>
                        <p className="text-xs text-blue-600">QR code will link to your profile after login</p>
                    </div>
                </div>
            )}
        </div>
    );
}