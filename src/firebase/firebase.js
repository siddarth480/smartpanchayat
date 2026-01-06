// firebase/firebase.js
import { initializeApp } from "firebase/app"; 
import { getAuth } from "firebase/auth";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore"; // ✅ Updated
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions"; 

const firebaseConfig = {
  apiKey: "AIzaSyAtIvRKozyar8ZIRO9D12UVadJPoWgZ494",
  authDomain: "smartpanchayat-d803c.firebaseapp.com",
  projectId: "smartpanchayat-d803c",
  storageBucket: "smartpanchayat-d803c.appspot.com",
  messagingSenderId: "369644064365",
  appId: "1:369644064365:web:f6a2e2a107c4b9d68e3964",
  measurementId: "G-ZT9KHM1BQM",
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