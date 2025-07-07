// lib/contacts/addContact.js - OPTIMIZED with Lookup Table Support
import { fireApp } from "@/important/firebase";
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { generateRandomId } from "@/lib/utilities";
import { fastUserLookup } from "@/lib/userLookup"; // ✅ Import fast lookup

/**
 * OPTIMIZED: Add a contact to a profile owner's contact list with geolocation support
 * Now uses ultra-fast lookup table instead of scanning all accounts
 */
export async function addContactToProfile(profileUsername, contactData) {
    try {
        console.log("🔥 Starting OPTIMIZED addContactToProfile for username:", profileUsername);
        console.log("📋 Contact data:", contactData);
        console.log("🌍 Location data:", contactData.location);
        
        // ✅ SUPER FAST: Use lookup table instead of scanning all documents
        console.log("🔍 Using fast lookup for username:", profileUsername);
        const userInfo = await fastUserLookup(profileUsername);
        
        if (!userInfo) {
            console.error("❌ User not found in lookup table for username:", profileUsername);
            throw new Error(`Profile owner not found for username: ${profileUsername}`);
        }
        
        const userId = userInfo.userId;
        const actualUsername = userInfo.username;
        console.log("✅ Found user via lookup:", userId, "with username:", actualUsername);

        // Generate contact data with enhanced geolocation
        const contactId = generateRandomId();
        console.log("🆔 Generated contact ID:", contactId);
        
        const contact = {
            id: contactId,
            name: contactData.name.trim(),
            email: contactData.email.trim().toLowerCase(),
            phone: contactData.phone?.trim() || '',
            company: contactData.company?.trim() || '',
            message: contactData.message?.trim() || '',
            submittedAt: contactData.submittedAt,
            status: 'new',
            profileOwner: profileUsername,
            
            // Enhanced location data
            location: contactData.location ? {
                latitude: contactData.location.latitude,
                longitude: contactData.location.longitude,
                accuracy: contactData.location.accuracy || null,
                timestamp: contactData.location.timestamp || new Date().toISOString(),
                // Add reverse geocoding placeholder (you can enhance this later)
                address: null,
                city: null,
                country: null
            } : null,
            
            locationStatus: contactData.locationStatus || 'unavailable',
            
            // Additional metadata
            metadata: {
                userAgent: contactData.userAgent || '',
                referrer: contactData.referrer || 'direct',
                ipAddress: null, // Don't store IP for privacy
                sessionId: contactData.sessionId || null
            }
        };
        
        console.log("📝 Prepared contact object with location:", contact);
        
        // Save to Firebase
        const contactsRef = collection(fireApp, "Contacts");
        const userContactsDocRef = doc(contactsRef, userId);
        
        try {
            const docSnap = await getDoc(userContactsDocRef);
            
            if (docSnap.exists()) {
                console.log("🔄 Document exists, updating with new contact...");
                const existingData = docSnap.data();
                const currentContacts = existingData.contacts || [];
                const newTotalContacts = currentContacts.length + 1;
                
                // Update location stats
                const currentLocationStats = existingData.locationStats || {
                    totalWithLocation: 0,
                    totalWithoutLocation: 0,
                    locationGranted: 0,
                    locationDenied: 0,
                    locationUnavailable: 0
                };
                
                const updatedLocationStats = {
                    totalWithLocation: currentLocationStats.totalWithLocation + (contactData.location ? 1 : 0),
                    totalWithoutLocation: currentLocationStats.totalWithoutLocation + (contactData.location ? 0 : 1),
                    locationGranted: currentLocationStats.locationGranted + (contactData.locationStatus === 'granted' ? 1 : 0),
                    locationDenied: currentLocationStats.locationDenied + (contactData.locationStatus === 'denied' ? 1 : 0),
                    locationUnavailable: currentLocationStats.locationUnavailable + (contactData.locationStatus === 'unavailable' ? 1 : 0)
                };
                
                await updateDoc(userContactsDocRef, {
                    contacts: arrayUnion(contact),
                    lastUpdated: new Date().toISOString(),
                    totalContacts: newTotalContacts,
                    locationStats: updatedLocationStats
                });
                console.log("✅ Successfully updated existing document");
            } else {
                console.log("🆕 Document doesn't exist, creating new one...");
                await setDoc(userContactsDocRef, {
                    userId: userId,
                    username: actualUsername,
                    contacts: [contact],
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    totalContacts: 1,
                    // Analytics for location data
                    locationStats: {
                        totalWithLocation: contactData.location ? 1 : 0,
                        totalWithoutLocation: contactData.location ? 0 : 1,
                        locationGranted: contactData.locationStatus === 'granted' ? 1 : 0,
                        locationDenied: contactData.locationStatus === 'denied' ? 1 : 0,
                        locationUnavailable: contactData.locationStatus === 'unavailable' ? 1 : 0
                    }
                });
                console.log("✅ Successfully created new document");
            }
            
            // If this contact has location data, you might want to trigger
            // additional analytics or notifications here
            if (contactData.location) {
                console.log("📍 Contact includes geolocation data - lat:", 
                    contactData.location.latitude, "lng:", contactData.location.longitude);
                
                // Optional: You could add reverse geocoding here to get address info
                // await enhanceContactWithGeocoding(contactId, contactData.location);
            }
            
        } catch (contactWriteError) {
            console.error("❌ Contact write failed:", contactWriteError);
            throw new Error(`Contact write failed: ${contactWriteError.message}`);
        }
        
        console.log("🎉 Contact added successfully:", contactId);
        return contactId;
        
    } catch (error) {
        console.error("❌ Function failed:", error.message);
        throw error;
    }
}

/**
 * OPTIMIZED: Add contact by user ID directly (fastest method)
 * Use this when you already have the user ID
 */
export async function addContactToProfileByUserId(userId, contactData) {
    try {
        console.log("🔥 Starting SUPER FAST addContactToProfileByUserId for user ID:", userId);
        console.log("📋 Contact data:", contactData);
        
        // Get user info from lookup table for username
        const userInfo = await fastUserLookup(userId);
        
        if (!userInfo) {
            console.error("❌ User not found in lookup table for ID:", userId);
            throw new Error(`Profile owner not found for user ID: ${userId}`);
        }
        
        console.log("✅ Found user via lookup:", userInfo.username);

        // Generate contact data with enhanced geolocation
        const contactId = generateRandomId();
        console.log("🆔 Generated contact ID:", contactId);
        
        const contact = {
            id: contactId,
            name: contactData.name.trim(),
            email: contactData.email.trim().toLowerCase(),
            phone: contactData.phone?.trim() || '',
            company: contactData.company?.trim() || '',
            message: contactData.message?.trim() || '',
            submittedAt: contactData.submittedAt,
            status: 'new',
            profileOwner: userInfo.username,
            
            // Enhanced location data
            location: contactData.location ? {
                latitude: contactData.location.latitude,
                longitude: contactData.location.longitude,
                accuracy: contactData.location.accuracy || null,
                timestamp: contactData.location.timestamp || new Date().toISOString(),
                address: null,
                city: null,
                country: null
            } : null,
            
            locationStatus: contactData.locationStatus || 'unavailable',
            
            // Additional metadata
            metadata: {
                userAgent: contactData.userAgent || '',
                referrer: contactData.referrer || 'direct',
                ipAddress: null,
                sessionId: contactData.sessionId || null
            }
        };
        
        // Save to Firebase (same logic as above but with direct user ID)
        const contactsRef = collection(fireApp, "Contacts");
        const userContactsDocRef = doc(contactsRef, userId);
        
        const docSnap = await getDoc(userContactsDocRef);
        
        if (docSnap.exists()) {
            const existingData = docSnap.data();
            const currentContacts = existingData.contacts || [];
            const newTotalContacts = currentContacts.length + 1;
            
            const currentLocationStats = existingData.locationStats || {
                totalWithLocation: 0,
                totalWithoutLocation: 0,
                locationGranted: 0,
                locationDenied: 0,
                locationUnavailable: 0
            };
            
            const updatedLocationStats = {
                totalWithLocation: currentLocationStats.totalWithLocation + (contactData.location ? 1 : 0),
                totalWithoutLocation: currentLocationStats.totalWithoutLocation + (contactData.location ? 0 : 1),
                locationGranted: currentLocationStats.locationGranted + (contactData.locationStatus === 'granted' ? 1 : 0),
                locationDenied: currentLocationStats.locationDenied + (contactData.locationStatus === 'denied' ? 1 : 0),
                locationUnavailable: currentLocationStats.locationUnavailable + (contactData.locationStatus === 'unavailable' ? 1 : 0)
            };
            
            await updateDoc(userContactsDocRef, {
                contacts: arrayUnion(contact),
                lastUpdated: new Date().toISOString(),
                totalContacts: newTotalContacts,
                locationStats: updatedLocationStats
            });
        } else {
            await setDoc(userContactsDocRef, {
                userId: userId,
                username: userInfo.username,
                contacts: [contact],
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                totalContacts: 1,
                locationStats: {
                    totalWithLocation: contactData.location ? 1 : 0,
                    totalWithoutLocation: contactData.location ? 0 : 1,
                    locationGranted: contactData.locationStatus === 'granted' ? 1 : 0,
                    locationDenied: contactData.locationStatus === 'denied' ? 1 : 0,
                    locationUnavailable: contactData.locationStatus === 'unavailable' ? 1 : 0
                }
            });
        }
        
        console.log("🎉 Contact added successfully via user ID:", contactId);
        return contactId;
        
    } catch (error) {
        console.error("❌ Function failed:", error.message);
        throw error;
    }
}

/**
 * Optional: Enhance contact with reverse geocoding
 * This function can be called to get readable address from coordinates
 */
export async function enhanceContactWithGeocoding(contactId, location) {
    try {
        // This would require Google Geocoding API
        // You can implement this if you want to convert coordinates to addresses
        console.log("🌐 Would enhance contact", contactId, "with geocoding for:", location);
        
        // Example implementation:
        /*
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        
        if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                
                // Extract address components
                const addressComponents = result.address_components;
                let city = null;
                let country = null;
                
                addressComponents.forEach(component => {
                    if (component.types.includes('locality')) {
                        city = component.long_name;
                    }
                    if (component.types.includes('country')) {
                        country = component.long_name;
                    }
                });
                
                return {
                    address: result.formatted_address,
                    city: city,
                    country: country,
                    addressComponents: addressComponents
                };
            }
        }
        */
        
    } catch (error) {
        console.error("❌ Geocoding enhancement failed:", error);
    }
}

/**
 * OPTIMIZED: Get analytics about contact locations using user ID
 */
export async function getContactLocationAnalytics(userId) {
    try {
        console.log("📊 Fetching contact location analytics for user ID:", userId);
        
        const contactsRef = collection(fireApp, "Contacts");
        const userContactsDocRef = doc(contactsRef, userId);
        const docSnap = await getDoc(userContactsDocRef);
        
        if (!docSnap.exists()) {
            console.log("❌ No contacts document found for user:", userId);
            return {
                totalContacts: 0,
                contactsWithLocation: 0,
                contactsWithoutLocation: 0,
                locationGrantRate: 0,
                uniqueLocations: 0,
                locationsByStatus: {
                    granted: 0,
                    denied: 0,
                    unavailable: 0
                },
                recentContacts: []
            };
        }
        
        const data = docSnap.data();
        const contacts = data.contacts || [];
        const locationStats = data.locationStats || {};
        
        console.log(`📈 Found ${contacts.length} contacts with location stats:`, locationStats);
        
        const contactsWithLocation = contacts.filter(c => c.location && c.location.latitude);
        const contactsWithoutLocation = contacts.filter(c => !c.location || !c.location.latitude);
        const locationGranted = contacts.filter(c => c.locationStatus === 'granted');
        
        // Calculate unique locations (within ~100m radius)
        const uniqueLocations = new Set();
        contactsWithLocation.forEach(contact => {
            const roundedLat = Math.round(contact.location.latitude * 1000) / 1000;
            const roundedLng = Math.round(contact.location.longitude * 1000) / 1000;
            uniqueLocations.add(`${roundedLat},${roundedLng}`);
        });
        
        // Get recent contacts (last 10)
        const recentContacts = contacts
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, 10)
            .map(contact => ({
                id: contact.id,
                name: contact.name,
                email: contact.email,
                submittedAt: contact.submittedAt,
                hasLocation: !!(contact.location && contact.location.latitude),
                locationStatus: contact.locationStatus
            }));
        
        return {
            totalContacts: contacts.length,
            contactsWithLocation: contactsWithLocation.length,
            contactsWithoutLocation: contactsWithoutLocation.length,
            locationGrantRate: contacts.length > 0 ? (locationGranted.length / contacts.length) * 100 : 0,
            uniqueLocations: uniqueLocations.size,
            locationsByStatus: {
                granted: locationStats.locationGranted || 0,
                denied: locationStats.locationDenied || 0,
                unavailable: locationStats.locationUnavailable || 0
            },
            recentContacts: recentContacts,
            
            // Additional analytics
            averageContactsPerDay: calculateAverageContactsPerDay(contacts),
            topContactSources: getTopContactSources(contacts),
            locationAccuracyStats: getLocationAccuracyStats(contactsWithLocation)
        };
        
    } catch (error) {
        console.error("❌ Error getting location analytics:", error);
        return null;
    }
}

/**
 * Helper function to calculate average contacts per day
 */
function calculateAverageContactsPerDay(contacts) {
    if (contacts.length === 0) return 0;
    
    const dates = contacts.map(c => new Date(c.submittedAt).toDateString());
    const uniqueDates = new Set(dates);
    
    return Math.round((contacts.length / uniqueDates.size) * 100) / 100;
}

/**
 * Helper function to get top contact sources/referrers
 */
function getTopContactSources(contacts) {
    const sources = {};
    
    contacts.forEach(contact => {
        const source = contact.metadata?.referrer || 'direct';
        sources[source] = (sources[source] || 0) + 1;
    });
    
    return Object.entries(sources)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([source, count]) => ({ source, count }));
}

/**
 * Helper function to get location accuracy statistics
 */
function getLocationAccuracyStats(contactsWithLocation) {
    if (contactsWithLocation.length === 0) {
        return { average: 0, best: 0, worst: 0 };
    }
    
    const accuracies = contactsWithLocation
        .filter(c => c.location.accuracy && c.location.accuracy > 0)
        .map(c => c.location.accuracy);
    
    if (accuracies.length === 0) {
        return { average: 0, best: 0, worst: 0, total: 0 };
    }
    
    const average = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    const best = Math.min(...accuracies);
    const worst = Math.max(...accuracies);
    
    return {
        average: Math.round(average * 100) / 100,
        best: Math.round(best * 100) / 100,
        worst: Math.round(worst * 100) / 100,
        total: accuracies.length
    };
}