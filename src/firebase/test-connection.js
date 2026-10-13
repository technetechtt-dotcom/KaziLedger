// Test Firestore connection
import { db } from './config.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const testFirestoreConnection = async () => {
  try {
    console.log('Testing Firestore connection...');
    
    // Try to write a test document
    const testDocRef = doc(db, 'test', 'connection');
    await setDoc(testDocRef, {
      message: 'Hello Firestore!',
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Firestore write successful!');
    
    // Try to read the test document
    const docSnap = await getDoc(testDocRef);
    if (docSnap.exists()) {
      console.log('✅ Firestore read successful!', docSnap.data());
    } else {
      console.log('❌ No document found');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return false;
  }
};
