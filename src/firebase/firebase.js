// firebase/firebase.js
import { initializeApp } from "firebase/app"; 
import { getAuth } from "firebase/auth";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore"; // ✅ Updated
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions"; 

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const storage = getStorage(app);
// 🌍 Use 'us-central1' (default) or your specific region
const functions = getFunctions(app, "us-central1");

// ✅ Fix: This initialization prevents the "Unexpected State" crash
const db = initializeFirestore(app, {
  localCache: memoryLocalCache() 
});

export { auth, db, storage, functions };