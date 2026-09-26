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

// Analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

export { app, database, auth, analytics };
export default app;
