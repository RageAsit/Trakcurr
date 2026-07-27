import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Read Firebase configuration from Vite environment variables (import.meta.env) with project defaults
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBpzav7JI97lVcZbjiURSn8FW_xjmBfl8I";
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "trakcurren.firebaseapp.com";
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "trakcurren";
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "trakcurren.firebasestorage.app";
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "925939493668";
const appId = import.meta.env.VITE_FIREBASE_APP_ID || "1:925939493668:web:e112a8fb60493bcb6c21b1";

export const hasFirebaseConfig = true;

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

// Log active configuration in dev environment
if (import.meta.env.DEV) {
  console.log('[Firebase Init] Initialized with Trakcurr project credentials:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
  });
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export { app, auth, db, googleProvider };
