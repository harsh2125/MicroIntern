import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);  // Firebase user object
  const [userProfile, setUserProfile] = useState(null);   // Firestore profile (role, name, etc.)
  const [loading, setLoading] = useState(true);           // Prevents flash of unauthenticated UI

  useEffect(() => {
    // onAuthStateChanged fires on login, logout, and page refresh
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Fetch the user's Firestore profile to get their role
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,   // Firebase Auth user
    userProfile,   // { role: 'student'|'company'|'admin', name, ... }
    loading,
  };

  // Don't render children until auth state is determined
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);