// contexts/AuthContext.js - FINAL, BULLETPROOF VERSION
"use client"
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; // Use the direct import
import { auth, fireApp } from '@/important/firebase'; // Assuming 'auth' is exported from your firebase config
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateUserLookup } from '../lib/userLookup'; // Your corrected lookup function

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

async function createMissingUserProfile(firebaseUser) {
    const safeUsername = (firebaseUser.displayName?.replace(/\s+/g, '').toLowerCase() || firebaseUser.email.split('@')[0]).replace(/[^a-z0-9]/g, '');
    const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        username: safeUsername,
        photoURL: firebaseUser.photoURL || "",
        links: [],
        selectedTheme: "Lake White",
        createdAt: new Date().toISOString(),
        // Add all other default fields here
    };
    const userRef = doc(fireApp, 'AccountData', firebaseUser.uid);
    await setDoc(userRef, userData);
    await updateUserLookup(userData.uid, userData.username);
    return userData;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  // ✅ This is the crucial new state. It's true until the VERY FIRST auth check is complete.
  const [initialLoad, setInitialLoad] = useState(true); 

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
            setUser(firebaseUser);
            const userRef = doc(fireApp, 'AccountData', firebaseUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setUserData(userSnap.data());
            } else {
                console.warn('⚠️ User exists in Auth, but not in Firestore. Creating profile...');
                const newProfile = await createMissingUserProfile(firebaseUser);
                setUserData(newProfile);
            }
        } else {
            setUser(null);
            setUserData(null);
        }
      } catch (error) {
          console.error("❌ Auth state change error:", error);
          // On error, ensure we are in a signed-out state
          setUser(null);
          setUserData(null);
      } finally {
          // ✅ This now only happens ONCE.
          if (initialLoad) {
            setInitialLoad(false);
          }
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [initialLoad]); // Dependency on initialLoad is important

  const value = {
    user,
    userData,
    loading: initialLoad, // The app is "loading" until the initial check is done.
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}