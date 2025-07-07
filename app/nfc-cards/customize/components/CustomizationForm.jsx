// app/nfc-cards/customize/components/CustomizationForm.jsx - UPDATED WITH LOGO & QR
"use client";
import Image from "next/image";
import LogoUploader from "./LogoUploader";
import QRCodeStatus from "./QRCodeStatus";

export default function CustomizationForm({
    products,
    selectedProduct,
    customValues,
    userId,
    logoUrl,
    isUploading,
    onProductSelect,
    onCustomValueChange,
    onLogoUploadStart,
    onLogoUploadComplete,
}) {
    return (
        <div>
            {/* Step 1: Personalization */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Step 1: Personalize Your Card
                </h1>
                <p className="text-gray-600">
                    Enter the details you want to appear on the back of your card.
                </p>
                
                <div className="mt-6 space-y-4">
                    {selectedProduct?.customizableFields?.map(field => (
                        <div key={field.id}>
                            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                                {field.label}
                            </label>
                            <input
                                type="text"
                                id={field.id}
                                placeholder={field.placeholder}
                                value={customValues[field.id] || ''}
                                onChange={(e) => onCustomValueChange(field.id, e.target.value)}
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeGreen focus:border-transparent"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Logo Upload Section */}
            <LogoUploader
                userId={userId}
                logoUrl={logoUrl}
                isUploading={isUploading}
                onUploadStart={onLogoUploadStart}
                onUploadComplete={onLogoUploadComplete}
            />

            {/* QR Code Status */}
            <QRCodeStatus userId={userId} />

            {/* Step 2: Product Selection */}
            <div className="mt-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Step 2: Choose Card Type
                </h2>
                <p className="text-gray-600">
                    Select the physical card material and style.
                </p>
                
                <div className="space-y-4 mt-6">
                    {products.map((product) => (
                        <div 
                            key={product.id} 
                            onClick={() => onProductSelect(product)} 
                            className={`p-4 bg-white rounded-lg border-2 flex items-center gap-4 cursor-pointer transition-all ${
                                selectedProduct?.id === product.id 
                                    ? 'border-themeGreen shadow-md' 
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <Image 
                                src={product.image} 
                                alt={product.name} 
                                width={100} 
                                height={60} 
                                className="rounded-md object-cover"
                            />
                            <div>
                                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                                <p className="text-lg font-bold text-gray-900">${product.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}