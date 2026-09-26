// ============================================
// Firebase Configuration - Rama Jewellers
// ============================================
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyARq6C9_gKJmVAqboc-QadORWa-1o5Oz4A",
    authDomain: "ramajwl-62851.firebaseapp.com",
    databaseURL: "https://ramajwl-62851-default-rtdb.firebaseio.com",
    projectId: "ramajwl-62851",
    storageBucket: "ramajwl-62851.firebasestorage.app",
    messagingSenderId: "721410598447",
    appId: "1:721410598447:web:7bd0edb9b23989f3d808da",
    measurementId: "G-RWYT1HTHV6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Product catalog remains in the original Firebase project until migration.
const legacyProductsApp = initializeApp({
    apiKey: "AIzaSyBlK_r-ieeCoVyYceCh1lyc8cgUcIM18a4",
    authDomain: "kgsjewel-98b89.firebaseapp.com",
    databaseURL: "https://kgsjewel-98b89-default-rtdb.firebaseio.com",
    projectId: "kgsjewel-98b89",
    storageBucket: "kgsjewel-98b89.firebasestorage.app",
    messagingSenderId: "740786421316",
    appId: "1:740786421316:web:928a95c1b2dc7bb79ac611"
}, 'legacyProducts');
const legacyProductsDatabase = getDatabase(legacyProductsApp);

// Analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

export { app, database, auth, analytics, legacyProductsDatabase };
export default app;
