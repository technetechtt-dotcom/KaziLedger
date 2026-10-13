import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIlZQZIhUhUZ5v_DUrXmiIuhxxuPXwah4",
  authDomain: "kaziledger.firebaseapp.com",
  projectId: "kaziledger",
  storageBucket: "kaziledger.firebasestorage.app",
  messagingSenderId: "408477236021",
  appId: "1:408477236021:web:21f35974761c694d5a6a7c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
