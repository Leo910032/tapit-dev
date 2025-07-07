// contexts/AuthContext.js - Firebase Auth Context
"use client"
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChangedFirebase, 
  getCurrentUser,
  signOutFirebase 
} from '@/lib/authentication/firebaseAuth';
import { doc, getDoc } from 'firebase/firestore';
import { fireApp } from '@/important/firebase';

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedFirebase(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          setUser(firebaseUser);
          
          // Fetch user data from Firestore
          const userRef = doc(fireApp, 'AccountData', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          } else {
            console.warn('User data not found in Firestore');
            setUserData(null);
          }
        } else {
          // User is signed out
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
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
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// HOC for protecting routes
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    
    useEffect(() => {
      if (!loading && !user) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
      }
    }, [user, loading]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return null; // Will redirect
    }

    return <Component {...props} />;
  };
}