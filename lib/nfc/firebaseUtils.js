// lib/nfc/firebaseUtils.js - NEW FILE
import { collection, addDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { fireApp } from '@/important/firebase';

// ✅ Initialize Firestore and Storage
const db = getFirestore(fireApp);
const storage = getStorage(fireApp);

/**
 * Save a custom NFC card to Firestore
 */
export async function saveCustomCard(userId, cardData) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userCardsRef = collection(db, "AccountData", userId, "userCards");
    
    const newCardData = {
      ...cardData,
      createdAt: serverTimestamp(),
      linkedProfile: userId,
    };
    
    const docRef = await addDoc(userCardsRef, newCardData);
    
    return {
      success: true,
      cardId: docRef.id,
      message: 'Card saved successfully'
    };
  } catch (error) {
    console.error('Error saving custom card:', error);
    throw new Error(`Failed to save card: ${error.message}`);
  }
}

/**
 * Upload logo to Firebase Storage
 */
export async function uploadLogo(file, userId) {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // Create unique filename
    const timestamp = Date.now();
    const fileName = `logo_${userId}_${timestamp}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, `nfc-logos/${fileName}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      url: downloadURL,
      fileName: fileName
    };
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw new Error(`Failed to upload logo: ${error.message}`);
  }
}

/**
 * Get user's saved NFC cards
 */
export async function getUserCards(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { getDocs, orderBy, query: firestoreQuery } = await import('firebase/firestore');
    
    const userCardsRef = collection(db, "AccountData", userId, "userCards");
    const q = firestoreQuery(userCardsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const cards = [];
    querySnapshot.forEach((doc) => {
      cards.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      cards: cards
    };
  } catch (error) {
    console.error('Error fetching user cards:', error);
    throw new Error(`Failed to fetch cards: ${error.message}`);
  }
}