// contexts/AuthContext.js - FINAL, CORRECTED VERSION
"use client"
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChangedFirebase, 
  signOutFirebase 
} from '@/lib/authentication/firebaseAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { fireApp } from '@/important/firebase';
import { updateUserLookup } from '../lib/userLookup'; 

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

// contexts/AuthContext.js

// ... other code in the file

async function createMissingUserProfile(firebaseUser) {
  try {
    console.log('🔧 Creating missing user profile for:', firebaseUser.email);
    
    // ✅ This creates a URL-safe username, removing spaces and special characters.
    const safeUsername = (firebaseUser.displayName?.replace(/\s+/g, '').toLowerCase() || firebaseUser.email.split('@')[0]).replace(/[^a-z0-9]/g, '');

    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      username: safeUsername, // Use the new safe username
      photoURL: firebaseUser.photoURL || "",
      links: [],
      selectedTheme: "Lake White",
      createdAt: new Date().toISOString(),
      accountType: "free",
      isTeamManager: false,
      teamId: null,
      teamRole: null,
      managerUserId: null,
      autoCreated: true,
      autoCreatedAt: new Date().toISOString()
    };
    
    const userRef = doc(fireApp, 'AccountData', firebaseUser.uid);
    await setDoc(userRef, userData);
    
    console.log(`✅ Missing user profile created successfully with username: ${safeUsername}`);
        await updateUserLookup(userData.uid, userData.username);

    return userData;
    
  } catch (error) {
    console.error('❌ Failed to create missing user profile:', error);
    throw error;
  }
}

// ... the rest of your AuthContext.js file ...

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedFirebase(async (firebaseUser) => {
      try {
        setError(null);
        
        if (firebaseUser) {
          console.log('🔍 Firebase user detected:', firebaseUser.email);
          setUser(firebaseUser);
          
          const userRef = doc(fireApp, 'AccountData', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            console.log('✅ User data found in Firestore');
            setUserData(userSnap.data());
          } else {
            console.warn('⚠️ User data not found in Firestore, creating profile...');
            const newUserData = await createMissingUserProfile(firebaseUser);
            setUserData(newUserData);
          }
        } else {
          console.log('🔓 User signed out');
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('❌ Error in auth state change:', error);
        setError(error.message);
        if (firebaseUser) {
          setUser(firebaseUser);
          setUserData(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOutFirebase();
      setUser(null);
      setUserData(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    error,
    logout,
    isAuthenticated: !!user,
    hasUserData: !!userData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// The HOC remains the same, it's already well-written.
export function withAuth(Component) {
  // ... (your existing HOC code)
  return function AuthenticatedComponent(props) {
    const { user, userData, loading, error, hasUserData } = useAuth();
    
    useEffect(() => {
      if (!loading && !user) {
        window.location.href = '/login';
      }
    }, [user, loading]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">Authentication Error: {error}</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (user && !hasUserData) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Setting up your profile...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}