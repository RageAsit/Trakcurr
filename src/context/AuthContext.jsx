import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, hasFirebaseConfig } from '../config/firebase';

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  logout: async () => {},
  clearError: () => {},
  hasFirebaseConfig: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (auth && hasFirebaseConfig) {
      const unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
          setLoading(false);
        },
        (err) => {
          console.error('Firebase Auth state listener error:', err);
          setError(err.message);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    if (!hasFirebaseConfig || !auth || !googleProvider) {
      const missingMsg =
        'Firebase configuration is missing or incomplete. Please paste your VITE_FIREBASE_* values into .env.local and restart the server.';
      setError(missingMsg);
      throw new Error(missingMsg);
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      return result.user;
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      let userMsg = 'Failed to sign in with Google. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        userMsg = 'Sign-in popup was closed before completing.';
      } else if (err.code === 'auth/popup-blocked') {
        userMsg = 'Sign-in popup was blocked by your browser settings.';
      } else if (err.code === 'auth/network-request-failed') {
        userMsg = 'Network request failed. Check your internet connection.';
      } else if (err.code === 'auth/invalid-api-key' || err.code === 'auth/api-key-not-valid') {
        userMsg = 'Invalid Firebase API Key. Please verify your VITE_FIREBASE_API_KEY in .env.local.';
      } else if (err.code === 'auth/operation-not-allowed') {
        userMsg = 'Google Sign-In is not enabled in your Firebase Console. Please enable "Google" in Authentication -> Sign-in method.';
      } else if (err.message) {
        userMsg = err.message;
      }
      setError(userMsg);
      throw new Error(userMsg);
    }
  };

  const logout = async () => {
    setError(null);
    if (auth && hasFirebaseConfig) {
      try {
        await signOut(auth);
        setUser(null);
      } catch (err) {
        console.error('Sign Out error:', err);
        setError(err.message || 'Failed to sign out.');
        throw err;
      }
    } else {
      setUser(null);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
    clearError,
    hasFirebaseConfig,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
