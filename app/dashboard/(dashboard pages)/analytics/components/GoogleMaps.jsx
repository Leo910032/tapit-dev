// app/dashboard/(dashboard pages)/analytics/components/GoogleMaps.jsx - OPTIMIZED VERSION
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useTranslation } from '@/lib/useTranslation';

export default function GoogleMaps({ contactsData = [], className = "" }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const { t } = useTranslation();

    // ✅ Check if we have valid API key
    const hasValidApiKey = () => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        return apiKey && apiKey !== 'your_api_key_here' && apiKey.length > 10;
    };

    useEffect(() => {
        let isMounted = true;
        let cleanupFunctions = [];

        const initializeMap = async () => {
            try {
                // ✅ Enhanced API key validation
                if (!hasValidApiKey()) {
                    console.warn('🗺️ Google Maps API key not configured properly');
                    setError('maps_api_key_missing');
                    setIsLoaded(true);
                    return;
                }

                console.log('🗺️ Initializing Google Maps...');

                const loader = new Loader({
                    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
                    version: 'weekly',
                    libraries: ['maps', 'marker', 'visualization'],
                    // ✅ Prevent API conflicts
                    preventGoogleFonts: true,
                });

                // ✅ Load required libraries
                const [{ Map }, { AdvancedMarkerElement }, { PinElement }] = await Promise.all([
                    loader.importLibrary('maps'),
                    loader.importLibrary('marker'),
                    loader.importLibrary('marker') // PinElement is in marker library
                ]);

                if (!isMounted || !mapRef.current) return;

                // ✅ Determine center based on contacts data
                let mapCenter = { lat: 46.5197, lng: 6.6323 }; // Default: Switzerland (neutral)
                let zoomLevel = 4;

                if (contactsData && contactsData.length > 0) {
                    // Calculate center from contacts with location data
                    const locationsWithCoords = contactsData.filter(contact => 
                        contact.location && 
                        contact.location.latitude && 
                        contact.location.longitude
                    );

                    if (locationsWithCoords.length > 0) {
                        const avgLat = locationsWithCoords.reduce((sum, contact) => 
                            sum + contact.location.latitude, 0) / locationsWithCoords.length;
                        const avgLng = locationsWithCoords.reduce((sum, contact) => 
                            sum + contact.location.longitude, 0) / locationsWithCoords.length;
                        
                        mapCenter = { lat: avgLat, lng: avgLng };
                        zoomLevel = locationsWithCoords.length === 1 ? 10 : 6;
                    }
                }

                const mapOptions = {
                    center: mapCenter,
                    zoom: zoomLevel,
                    mapId: 'ANALYTICS_MAP', // ✅ Use a proper map ID
                    
                    // ✅ Optimized performance settings
                    gestureHandling: 'greedy',
                    disableDefaultUI: true,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                    
                    // ✅ Styling for analytics theme
                    styles: [
                        { elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
                        { featureType: "water", stylers: [{ color: "#e2e8f0" }] },
                        { featureType: "road", elementType: "geometry", stylers: [{ color: "#e2e8f0" }] },
                        { featureType: "poi", stylers: [{ visibility: "off" }] },
                        { featureType: "transit", stylers: [{ visibility: "off" }] }
                    ],
                    
                    // ✅ Additional performance optimizations
                    clickableIcons: false,
                    keyboardShortcuts: false,
                    restriction: {
                        latLngBounds: {
                            north: 85,
                            south: -85,
                            east: 180,
                            west: -180
                        }
                    }
                };

                // Create map
                const map = new Map(mapRef.current, mapOptions);
                mapInstanceRef.current = map;

                // ✅ Add markers for contacts with location data
                if (contactsData && contactsData.length > 0) {
                    const locationsWithCoords = contactsData.filter(contact => 
                        contact.location && 
                        contact.location.latitude && 
                        contact.location.longitude
                    );

                    console.log(`🗺️ Adding ${locationsWithCoords.length} contact markers`);

                    locationsWithCoords.forEach((contact, index) => {
                        try {
                            // Create colored pin based on recency
                            const isRecent = new Date(contact.submittedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                            
                            const pin = new PinElement({
                                background: isRecent ? '#3b82f6' : '#6b7280',
                                borderColor: isRecent ? '#1d4ed8' : '#4b5563',
                                glyphColor: '#ffffff',
                                glyph: `${index + 1}`,
                                scale: isRecent ? 1.2 : 1.0,
                            });

                            const marker = new AdvancedMarkerElement({
                                map,
                                position: {
                                    lat: contact.location.latitude,
                                    lng: contact.location.longitude
                                },
                                content: pin.element,
                                title: `${contact.name} - ${contact.email}`,
                                gmpDraggable: false,
                            });

                            // ✅ Add info window for contact details
                            const infoWindow = new google.maps.InfoWindow({
                                content: `
                                    <div class="p-3 max-w-sm">
                                        <h3 class="font-semibold text-gray-900 mb-2">${contact.name}</h3>
                                        <p class="text-sm text-gray-600 mb-1">${contact.email}</p>
                                        ${contact.company ? `<p class="text-sm text-gray-500 mb-1">${contact.company}</p>` : ''}
                                        <p class="text-xs text-gray-400">
                                            ${new Date(contact.submittedAt).toLocaleString()}
                                        </p>
                                        ${contact.location.accuracy ? `
                                            <p class="text-xs text-blue-600 mt-1">
                                                Accuracy: ~${Math.round(contact.location.accuracy)}m
                                            </p>
                                        ` : ''}
                                    </div>
                                `
                            });

                            marker.addListener('click', () => {
                                // Close other info windows
                                markersRef.current.forEach(({ infoWindow: iw }) => iw?.close());
                                infoWindow.open(map, marker);
                            });

                            markersRef.current.push({ marker, infoWindow });

                        } catch (markerError) {
                            console.error('Error creating marker:', markerError);
                        }
                    });

                    // ✅ Auto-fit bounds if we have multiple markers
                    if (locationsWithCoords.length > 1) {
                        const bounds = new google.maps.LatLngBounds();
                        locationsWithCoords.forEach(contact => {
                            bounds.extend({
                                lat: contact.location.latitude,
                                lng: contact.location.longitude
                            });
                        });
                        map.fitBounds(bounds, { padding: 50 });
                    }
                }

                // ✅ Wait for map to be fully loaded
                const idleListener = map.addListener('idle', () => {
                    if (isMounted) {
                        setIsLoaded(true);
                        google.maps.event.removeListener(idleListener);
                    }
                });

                // ✅ Handle window resize
                const handleResize = () => {
                    if (mapInstanceRef.current) {
                        google.maps.event.trigger(mapInstanceRef.current, 'resize');
                    }
                };

                window.addEventListener('resize', handleResize);
                cleanupFunctions.push(() => window.removeEventListener('resize', handleResize));

                console.log('✅ Google Maps initialized successfully');

            } catch (error) {
                console.error('❌ Error loading Google Maps:', error);
                
                // ✅ Enhanced error handling
                if (error.message.includes('API key')) {
                    setError('maps_api_key_invalid');
                } else if (error.message.includes('quota')) {
                    setError('maps_quota_exceeded');
                } else if (error.message.includes('billing')) {
                    setError('maps_billing_required');
                } else {
                    setError('maps_generic_error');
                }
                setIsLoaded(true);
            }
        };

        if (mapRef.current && isVisible) {
            initializeMap();
        }

        return () => {
            isMounted = false;
            
            // ✅ Cleanup markers
            markersRef.current.forEach(({ marker, infoWindow }) => {
                if (infoWindow) infoWindow.close();
                if (marker) marker.map = null;
            });
            markersRef.current = [];
            
            // ✅ Cleanup other resources
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    }, [contactsData, isVisible]);

    // ✅ Enhanced error messages with translations
    const getErrorMessage = () => {
        switch (error) {
            case 'maps_api_key_missing':
                return t('analytics.maps.api_key_missing') || 'Google Maps API key is not configured. Please add your API key to enable maps.';
            case 'maps_api_key_invalid':
                return t('analytics.maps.api_key_invalid') || 'Invalid Google Maps API key. Please check your configuration.';
            case 'maps_quota_exceeded':
                return t('analytics.maps.quota_exceeded') || 'Google Maps quota exceeded. Please check your billing settings.';
            case 'maps_billing_required':
                return t('analytics.maps.billing_required') || 'Google Maps billing account required. Please enable billing in Google Cloud Console.';
            default:
                return t('analytics.maps.generic_error') || 'Unable to load map. Please try again later.';
        }
    };

    // ✅ No contacts with location data
    const contactsWithLocation = contactsData?.filter(contact => 
        contact.location && contact.location.latitude && contact.location.longitude
    ) || [];

    if (contactsWithLocation.length === 0) {
        return (
            <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('analytics.maps.no_location_data') || 'No Location Data'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                        {t('analytics.maps.no_location_description') || 'Contact locations will appear here when visitors share their location.'}
                    </p>
                </div>
            </div>
        );
    }

    // ✅ Error state
    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-xl p-6 ${className}`}>
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                        {t('analytics.maps.error_title') || 'Map Error'}
                    </h3>
                    <p className="text-red-600 text-sm mb-4">
                        {getErrorMessage()}
                    </p>
                    
                    {/* ✅ Help links for common issues */}
                    {error === 'maps_api_key_missing' && (
                        <div className="text-left bg-white rounded-lg p-4 border border-red-200">
                            <h4 className="font-medium text-gray-900 mb-2">Setup Instructions:</h4>
                            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                                <li>Go to <a href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                                <li>Enable the Maps JavaScript API</li>
                                <li>Create an API key</li>
                                <li>Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables</li>
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ✅ Map container
    return (
        <div className={`relative bg-white rounded-xl shadow-sm border overflow-hidden ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {t('analytics.maps.contact_locations') || 'Contact Locations'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {contactsWithLocation.length} {t('analytics.maps.locations') || 'locations'}
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="relative">
                {!isLoaded && (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10 h-[400px]">
                        <div className="flex flex-col items-center space-y-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="text-gray-500 text-sm">
                                {t('analytics.maps.loading') || 'Loading map...'}
                            </span>
                        </div>
                    </div>
                )}
                <div 
                    className="h-[400px] w-full" 
                    ref={mapRef}
                    style={{
                        // ✅ Optimize rendering performance
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                        willChange: 'transform',
                    }}
                />
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">
                                {t('analytics.maps.recent_contacts') || 'Recent (7 days)'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                            <span className="text-gray-600">
                                {t('analytics.maps.older_contacts') || 'Older'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsVisible(!isVisible)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        {isVisible ? 
                            (t('analytics.maps.hide_map') || 'Hide Map') : 
                            (t('analytics.maps.show_map') || 'Show Map')
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}