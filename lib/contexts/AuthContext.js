// contexts/AuthContext.js - FIXED to handle missing user data
"use client"
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChangedFirebase, 
  getCurrentUser,
  signOutFirebase 
} from '@/lib/authentication/firebaseAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { fireApp } from '@/important/firebase';

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

// Function to create missing user profile
async function createMissingUserProfile(firebaseUser) {
  try {
    console.log('🔧 Creating missing user profile for:', firebaseUser.email);
    
    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      photoURL: firebaseUser.photoURL || "",
      links: [],
      selectedTheme: "Lake White",
      createdAt: new Date().toISOString(),
      
      // Team management fields
      accountType: "free",
      isTeamManager: false,
      teamId: null,
      teamRole: null,
      managerUserId: null,
      
      // Mark as auto-created
      autoCreated: true,
      autoCreatedAt: new Date().toISOString()
    };
    
    const userRef = doc(fireApp, 'AccountData', firebaseUser.uid);
    await setDoc(userRef, userData);
    
    console.log('✅ Missing user profile created successfully');
    return userData;
    
  } catch (error) {
    console.error('❌ Failed to create missing user profile:', error);
    throw error;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedFirebase(async (firebaseUser) => {
      try {
        setError(null); // Clear any previous errors
        
        if (firebaseUser) {
          console.log('🔍 Firebase user detected:', firebaseUser.email);
          setUser(firebaseUser);
          
          // Try to fetch user data from Firestore
          const userRef = doc(fireApp, 'AccountData', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            console.log('✅ User data found in Firestore');
            setUserData(userSnap.data());
          } else {
            console.warn('⚠️ User data not found in Firestore, creating profile...');
            
            // Create missing user profile
            const newUserData = await createMissingUserProfile(firebaseUser);
            setUserData(newUserData);
          }
        } else {
          // User is signed out
          console.log('🔓 User signed out');
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('❌ Error in auth state change:', error);
        setError(error.message);
        
        // If there's an error and we have a user, don't sign them out completely
        // Just set userData to null so the app can handle it
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

// HOC for protecting routes - UPDATED to handle missing user data
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, userData, loading, error, hasUserData } = useAuth();
    
    useEffect(() => {
      if (!loading && !user) {
        // Redirect to login if not authenticated
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
      return null; // Will redirect
    }

    // If user exists but userData is still loading/missing, show a different loading state
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