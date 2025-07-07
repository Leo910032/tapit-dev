// app/nfc-cards/customize/components/LivePreview.jsx - ENHANCED DUAL PREVIEW
"use client";

export default function LivePreview({
    frontSvg,
    backSvg,
    isSaving,
    selectedProduct,
    onProceedToCheckout
}) {
    return (
        <div className="sticky top-32 h-fit">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Live Preview
            </h2>
            
            {/* Dual Card Preview */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                
                {/* Front Card */}
                <div className="space-y-3">
                    <div className="flex items-center justify-center">
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            Front Side
                        </span>
                    </div>
                    <div className="relative">
                        <div
                            className="w-full aspect-[500/300] bg-gray-100 rounded-lg overflow-hidden shadow-lg border-2 border-gray-200"
                            dangerouslySetInnerHTML={{ __html: frontSvg }}
                        />
                        <div className="absolute top-2 left-2">
                            <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                                Front
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                        ✨ Clean design with logo and branding
                    </p>
                </div>

                {/* Back Card */}
                <div className="space-y-3">
                    <div className="flex items-center justify-center">
                        <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                            Back Side
                        </span>
                    </div>
                    <div className="relative">
                        <div
                            className="w-full aspect-[500/300] bg-gray-100 rounded-lg overflow-hidden shadow-lg border-2 border-gray-200"
                            dangerouslySetInnerHTML={{ __html: backSvg }}
                        />
                        <div className="absolute top-2 left-2">
                            <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                                Back
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                        📇 Complete contact info and QR code
                    </p>
                </div>
            </div>

            {/* Card Info */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6">
                <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">
                        {selectedProduct?.name || 'Select a card type'}
                    </h3>
                    {selectedProduct && (
                        <div className="space-y-2">
                            <p className="text-lg font-bold text-gray-900">
                                ${selectedProduct.price}
                            </p>
                            <div className="flex justify-center gap-4 text-sm text-gray-600">
                                <span>📐 500×300px</span>
                                <span>🎨 Custom Design</span>
                                <span>📱 NFC Enabled</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Controls */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Preview Tips</h4>
                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>Front side shows your logo prominently</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Back side contains all contact information</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        <span>QR code links directly to your profile</span>
                    </div>
                </div>
            </div>

            {/* Mobile Preview Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <div className="flex items-start gap-2">
                    <span className="text-yellow-600 text-sm">💡</span>
                    <div className="text-sm text-yellow-800">
                        <p className="font-medium">Mobile Responsive</p>
                        <p>Cards are optimized for both desktop and mobile viewing</p>
                    </div>
                </div>
            </div>
            
            {/* Checkout Button */}
            <button
                onClick={onProceedToCheckout}
                disabled={isSaving || !selectedProduct}
                className="w-full bg-gradient-to-r from-themeGreen to-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:scale-105 active:scale-95 transition-transform disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
            >
                {isSaving ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Saving Your Design...
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2">
                        <span>🛒</span>
                        <span>Save & Proceed to Checkout</span>
                        <span className="font-bold">${selectedProduct?.price || '0.00'}</span>
                    </div>
                )}
            </button>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                <span>🔒</span>
                <span>Secure checkout with SSL encryption</span>
            </div>
        </div>
    );
}