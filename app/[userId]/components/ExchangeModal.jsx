// app/[userId]/components/ExchangeModal.jsx - OPTIMIZED VERSION
"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/lib/useTranslation';
import { validateEmail } from '@/lib/utilities';
import { toast } from 'react-hot-toast';
import { addContactToProfile, addContactToProfileByUserId } from '@/lib/contacts/addContact'; // ✅ Import both functions

export default function ExchangeModal({ 
    isOpen, 
    onClose, 
    profileOwnerUsername, 
    profileOwnerId = null // ✅ Optional: pass user ID directly for ultra-fast submission
}) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [location, setLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('unavailable'); // ✅ Track location permission status
    const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            console.log("🔄 Exchange modal opened for:", profileOwnerUsername);
            
            // ✅ Enhanced geolocation permission checking
            if (navigator.geolocation && navigator.permissions) {
                navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                    console.log("📍 Geolocation permission status:", result.state);
                    setLocationStatus(result.state);
                    setIsLocationPermissionGranted(result.state === 'granted');
                    
                    if (result.state === 'granted') {
                        // Automatically get location if permission is already granted
                        getCurrentLocation();
                    }
                    
                    // Listen for permission changes
                    result.addEventListener('change', () => {
                        console.log("📍 Geolocation permission changed to:", result.state);
                        setLocationStatus(result.state);
                        setIsLocationPermissionGranted(result.state === 'granted');
                    });
                }).catch((error) => {
                    console.warn("⚠️ Permission API not supported:", error);
                    setLocationStatus('unavailable');
                });
            } else {
                console.warn("⚠️ Geolocation not supported");
                setLocationStatus('unavailable');
            }
        }
    }, [isOpen, profileOwnerUsername]);

    const getCurrentLocation = () => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                console.warn("⚠️ Geolocation not supported");
                setLocationStatus('unavailable');
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString()
                    };
                    
                    console.log("📍 Location obtained:", userLocation);
                    setLocation(userLocation);
                    setLocationStatus('granted');
                    setIsLocationPermissionGranted(true);
                    resolve(userLocation);
                },
                (error) => {
                    console.error("❌ Geolocation error:", error);
                    
                    // Handle different error cases
                    if (error.code === error.PERMISSION_DENIED) {
                        setLocationStatus('denied');
                        console.log("❌ Location permission denied by user");
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        setLocationStatus('unavailable');
                        console.log("❌ Location position unavailable");
                    } else if (error.code === error.TIMEOUT) {
                        setLocationStatus('timeout');
                        console.log("❌ Location request timeout");
                    }
                    
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = t('exchange.name_required');
        }
        
        if (!formData.email.trim()) {
            newErrors.email = t('exchange.email_required');
        } else if (!validateEmail(formData.email)) {
            newErrors.email = t('exchange.email_invalid');
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const requestLocation = async () => {
        console.log("🔍 Requesting location permission...");
        
        if (!navigator.geolocation) {
            toast.error(t('exchange.geolocation_not_supported'));
            return null;
        }

        try {
            const userLocation = await getCurrentLocation();
            
            if (userLocation) {
                toast.success(t('exchange.location_obtained'), {
                    style: {
                        border: '1px solid #10B981',
                        padding: '16px',
                        color: '#10B981',
                    },
                    iconTheme: {
                        primary: '#10B981',
                        secondary: '#FFFAEE',
                    },
                });
            } else {
                // Show appropriate error message based on status
                if (locationStatus === 'denied') {
                    toast.error(t('exchange.location_permission_denied'));
                } else {
                    toast.error(t('exchange.location_retrieval_failed'));
                }
            }
            
            return userLocation;
        } catch (error) {
            console.error("❌ Error requesting location:", error);
            toast.error(t('exchange.location_retrieval_failed'));
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        console.log("🚀 Submitting contact form...");
        
        try {
            // ✅ Enhanced contact data with better location tracking
            const contactData = {
                ...formData,
                submittedAt: new Date().toISOString(),
                location: location, // Include location data if available
                locationStatus: locationStatus, // Track permission status
                
                // ✅ Enhanced metadata
                userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
                referrer: typeof window !== 'undefined' ? document.referrer : '',
                sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            
            console.log("📋 Contact data prepared:", {
                ...contactData,
                userAgent: contactData.userAgent.substring(0, 50) + '...' // Log truncated user agent
            });
            
            let contactId;
            
            // ✅ Use ultra-fast method if we have the user ID
            if (profileOwnerId) {
                console.log("🚀 Using ultra-fast submission with user ID:", profileOwnerId);
                contactId = await addContactToProfileByUserId(profileOwnerId, contactData);
            } else {
                console.log("🔍 Using optimized username lookup for:", profileOwnerUsername);
                contactId = await addContactToProfile(profileOwnerUsername, contactData);
            }
            
            console.log("✅ Contact submitted successfully:", contactId);
            
            // ✅ Enhanced success message based on location sharing
            let successMessage = t('exchange.success_message');
            if (location) {
                successMessage += ` ${t('exchange.success_with_location')}`;
            }
            
            toast.success(successMessage, {
                style: {
                    border: '1px solid #10B981',
                    padding: '16px',
                    color: '#10B981',
                },
                iconTheme: {
                    primary: '#10B981',
                    secondary: '#FFFAEE',
                },
                duration: 4000
            });
            
            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                message: ''
            });
            setLocation(null);
            setLocationStatus('unavailable');
            setIsLocationPermissionGranted(false);
            onClose();
            
        } catch (error) {
            console.error('❌ Error submitting contact:', error);
            
            // ✅ Better error handling with specific messages
            let errorMessage = t('exchange.error_message');
            
            if (error.message.includes('not found')) {
                errorMessage = t('exchange.profile_not_found');
            } else if (error.message.includes('validation')) {
                errorMessage = t('exchange.validation_error');
            }
            
            toast.error(errorMessage, {
                style: {
                    border: '1px solid #EF4444',
                    padding: '16px',
                    color: '#EF4444',
                },
                iconTheme: {
                    primary: '#EF4444',
                    secondary: '#FFFAEE',
                },
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // ✅ Enhanced location status display
    const getLocationStatusDisplay = () => {
        switch (locationStatus) {
            case 'granted':
                return {
                    color: 'text-green-600',
                    message: location ? t('exchange.location_shared') : t('exchange.location_granted'),
                    icon: '✓'
                };
            case 'denied':
                return {
                    color: 'text-red-600',
                    message: t('exchange.location_denied'),
                    icon: '✗'
                };
            case 'prompt':
                return {
                    color: 'text-yellow-600',
                    message: t('exchange.location_prompt_available'),
                    icon: '?'
                };
            default:
                return {
                    color: 'text-gray-600',
                    message: t('exchange.location_unavailable'),
                    icon: '-'
                };
        }
    };

    const locationDisplay = getLocationStatusDisplay();

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">

                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {t('exchange.title')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label={t('exchange.close_modal')}
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

            
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <p className="text-gray-600 mb-6 text-sm">
                        {t('exchange.description')}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                    
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('exchange.name_label')} *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder={t('exchange.name_placeholder')}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

       
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('exchange.email_label')} *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder={t('exchange.email_placeholder')}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

              
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('exchange.phone_label')}
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                placeholder={t('exchange.phone_placeholder')}
                            />
                        </div>

        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('exchange.company_label')}
                            </label>
                            <input
                                type="text"
                                value={formData.company}
                                onChange={(e) => handleInputChange('company', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                placeholder={t('exchange.company_placeholder')}
                            />
                        </div>

        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('exchange.message_label')}
                            </label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => handleInputChange('message', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                                placeholder={t('exchange.message_placeholder')}
                            />
                        </div>
                        
      
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                            <svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-800">
                                        {t('exchange.location_share_title')}
                                    </h4>
                                    <span className={`text-xs font-medium ${locationDisplay.color}`}>
                                        {locationDisplay.icon} {locationDisplay.message}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{t('exchange.location_share_description')}</p>
                                
                        
                                {location && location.accuracy && (
                                    <p className="text-xs text-green-600 mt-1">
                                        {t('exchange.location_accuracy')}: ~{Math.round(location.accuracy)}m
                                    </p>
                                )}
                                
                       
                                {(locationStatus === 'prompt' || locationStatus === 'unavailable') && (
                                    <button
                                        type="button"
                                        onClick={requestLocation}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 mt-2 flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                        {t('exchange.share_location_button')}
                                    </button>
                                )}
                            </div>
                        </div>

                  
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                {t('exchange.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Image 
                                            src="https://linktree.sirv.com/Images/gif/loading.gif" 
                                            width={16} 
                                            height={16} 
                                            alt="loading" 
                                            className="filter invert" 
                                        />
                                        {t('exchange.submitting')}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                        </svg>
                                        {t('exchange.submit')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}