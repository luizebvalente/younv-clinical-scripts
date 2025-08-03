// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Firebase config - estas chaves devem ser substituídas pelas do projeto real
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "younv-clinical-scripts.firebaseapp.com",
  projectId: "younv-clinical-scripts",
  storageBucket: "younv-clinical-scripts.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;

