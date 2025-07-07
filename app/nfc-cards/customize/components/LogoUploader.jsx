// app/nfc-cards/customize/components/LogoUploader.jsx - UPDATED STANDALONE
"use client";
import { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function LogoUploader({ 
    userId, 
    logoUrl, 
    isUploading, 
    onUploadStart, 
    onUploadComplete 
}) {
    const [preview, setPreview] = useState(logoUrl || null);
    const fileInputRef = useRef(null);

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('Image size must be less than 5MB');
            return;
        }

        // Show preview immediately
        setPreview(URL.createObjectURL(file));
        onUploadStart();

        try {
            console.log('🔄 Starting logo upload...');

            // Use Firebase Storage
            const { appStorage } = await import('@/important/firebase');
            
            if (!appStorage) {
                throw new Error('Firebase Storage is not available');
            }

            const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

            // Create unique filename per card design session
            const uniqueId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const fileName = `logo_${uniqueId}.${file.name.split('.').pop()}`;
            const storageRef = ref(appStorage, `nfc-logos/${fileName}`);
            
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            console.log('✅ Logo uploaded successfully:', downloadURL);
            onUploadComplete(downloadURL);
        } catch (error) {
            console.error('❌ Logo upload failed:', error);
            toast.error(error.message || 'Failed to upload logo');
            onUploadComplete(null);
        }
    };

    const handleRemoveLogo = () => {
        setPreview(null);
        onUploadComplete("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo (Optional)
            </label>
            
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
                    {preview ? (
                        <Image 
                            src={preview} 
                            alt="Logo preview" 
                            width={80} 
                            height={80} 
                            className="object-contain" 
                        />
                    ) : (
                        <span className="text-xs text-gray-400">No Logo</span>
                    )}
                </div>
                
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/svg+xml"
                    className="hidden"
                />
                
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? 'Uploading...' : 'Choose File'}
                    </button>
                    
                    {preview && (
                        <button
                            type="button"
                            onClick={handleRemoveLogo}
                            disabled={isUploading}
                            className="px-4 py-2 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                            Remove
                        </button>
                    )}
                </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
                PNG, JPG, or SVG. Max 5MB. Will appear on the front of your card.
            </p>
        </div>
    );
}