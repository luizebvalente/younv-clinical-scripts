import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyBl7XWGFY_72GAHDtmnae0ZRqN4IbPK2ss',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'younv-clinical-scripts.firebaseapp.com',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || 'younv-clinical-scripts',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'younv-clinical-scripts.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1049919552395',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:1049919552395:web:f22732f2a5fc1d0de58d8e',
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-YDN6LMHTTM'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
