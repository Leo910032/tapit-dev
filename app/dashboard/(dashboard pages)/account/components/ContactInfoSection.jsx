// app/dashboard/(dashboard pages)/account/components/ContactInfoSection.jsx
"use client"
import { useState, useEffect } from 'react';
import { fireApp } from "@/important/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { testForActiveSession } from '@/lib/authentication/testForActiveSession';
import { useTranslation } from '@/lib/useTranslation';
import { toast } from 'react-hot-toast';
import { FaUser, FaEnvelope, FaPhone, FaGlobe, FaBuilding, FaSave, FaEdit } from 'react-icons/fa';

export default function ContactInfoSection() {
    const { t } = useTranslation();
    const [contactInfo, setContactInfo] = useState({
        displayName: '',
        email: '',
        phone: '',
        website: '',
        company: '',
        bio: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const currentUserId = testForActiveSession();
        if (!currentUserId) return;
        
        setUserId(currentUserId);

        // Écouter les changements en temps réel
        const userRef = doc(fireApp, "AccountData", currentUserId);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setContactInfo({
                    displayName: data.displayName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    website: data.website || '',
                    company: data.company || '',
                    bio: data.bio || ''
                });
            }
        });

        return () => unsubscribe();
    }, []);

    const handleInputChange = (field, value) => {
        setContactInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        if (!userId) return;
        
        setIsSaving(true);
        try {
            const userRef = doc(fireApp, "AccountData", userId);
            await updateDoc(userRef, {
                displayName: contactInfo.displayName,
                email: contactInfo.email,
                phone: contactInfo.phone,
                website: contactInfo.website,
                company: contactInfo.company,
                bio: contactInfo.bio,
                updatedAt: new Date()
            });

            toast.success(t('account.contact_info_updated') || 'Contact information updated successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating contact info:', error);
            toast.error(t('account.update_failed') || 'Failed to update contact information');
        } finally {
            setIsSaving(false);
        }
    };

    const formatPhoneNumber = (phone) => {
        // Formatage simple du numéro de téléphone
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };

    const validateUrl = (url) => {
        if (!url) return true;
        try {
            new URL(url.startsWith('http') ? url : `https://${url}`);
            return true;
        } catch {
            return false;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FaUser className="w-5 h-5 text-blue-600" />
                        {t('account.contact_information') || 'Contact Information'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {t('account.contact_info_desc') || 'This information will be available when people save your contact.'}
                    </p>
                </div>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        isEditing 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } disabled:opacity-50`}
                >
                    {isSaving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            {t('common.saving') || 'Saving...'}
                        </>
                    ) : isEditing ? (
                        <>
                            <FaSave className="w-4 h-4" />
                            {t('common.save') || 'Save'}
                        </>
                    ) : (
                        <>
                            <FaEdit className="w-4 h-4" />
                            {t('common.edit') || 'Edit'}
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Display Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaUser className="w-4 h-4 inline mr-2" />
                        {t('account.display_name') || 'Display Name'}
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={contactInfo.displayName}
                            onChange={(e) => handleInputChange('displayName', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Your full name"
                            maxLength={100}
                        />
                    ) : (
                        <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                            {contactInfo.displayName || <span className="text-gray-500 italic">Not set</span>}
                        </div>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaEnvelope className="w-4 h-4 inline mr-2" />
                        {t('account.email') || 'Email'}
                    </label>
                    {isEditing ? (
                        <input
                            type="email"
                            value={contactInfo.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="your@email.com"
                        />
                    ) : (
                        <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                            {contactInfo.email || <span className="text-gray-500 italic">Not set</span>}
                        </div>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaPhone className="w-4 h-4 inline mr-2" />
                        {t('account.phone') || 'Phone'}
                    </label>
                    {isEditing ? (
                        <input
                            type="tel"
                            value={contactInfo.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="+1 (555) 123-4567"
                        />
                    ) : (
                        <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                            {contactInfo.phone ? formatPhoneNumber(contactInfo.phone) : <span className="text-gray-500 italic">Not set</span>}
                        </div>
                    )}
                </div>

                {/* Website */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaGlobe className="w-4 h-4 inline mr-2" />
                        {t('account.website') || 'Website'}
                    </label>
                    {isEditing ? (
                        <input
                            type="url"
                            value={contactInfo.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                contactInfo.website && !validateUrl(contactInfo.website) 
                                    ? 'border-red-300' 
                                    : 'border-gray-300'
                            }`}
                            placeholder="https://yourwebsite.com"
                        />
                    ) : (
                        <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                            {contactInfo.website ? (
                                <a 
                                    href={contactInfo.website.startsWith('http') ? contactInfo.website : `https://${contactInfo.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    {contactInfo.website}
                                </a>
                            ) : (
                                <span className="text-gray-500 italic">Not set</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Company */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaBuilding className="w-4 h-4 inline mr-2" />
                        {t('account.company') || 'Company'}
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={contactInfo.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Your company name"
                            maxLength={100}
                        />
                    ) : (
                        <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                            {contactInfo.company || <span className="text-gray-500 italic">Not set</span>}
                        </div>
                    )}
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('account.bio') || 'Bio'}
                    </label>
                    {isEditing ? (
                        <textarea
                            value={contactInfo.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                            placeholder="Tell people about yourself..."
                            maxLength={500}
                        />
                    ) : (
                        <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 min-h-[80px]">
                            {contactInfo.bio || <span className="text-gray-500 italic">Not set</span>}
                        </div>
                    )}
                    {isEditing && (
                        <div className="text-right text-xs text-gray-500 mt-1">
                            {contactInfo.bio.length}/500
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Section */}
            {!isEditing && (contactInfo.email || contactInfo.phone || contactInfo.website) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">
                            {t('account.contact_saveable') || 'Contact information is ready to be saved by visitors'}
                        </span>
                    </div>
                    <p className="text-xs text-gray-600">
                        {t('account.save_contact_preview') || 'Visitors to your profile will see a "Save Contact" button when you have contact information filled out.'}
                    </p>
                </div>
            )}

            {/* Cancel Button (only show when editing) */}
            {isEditing && (
                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        {t('common.cancel') || 'Cancel'}
                    </button>
                </div>
            )}
        </div>
    );
}