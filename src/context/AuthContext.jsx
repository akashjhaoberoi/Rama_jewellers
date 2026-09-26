// ============================================
// Auth Context - Firebase Authentication
// ============================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    GoogleAuthProvider,
    OAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

// Hardcoded admin emails — ONLY these accounts get admin access
const ADMIN_EMAILS = ['admin1@gmail.com', 'admin2@gmail.com'];
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState('user');
    const [loading, setLoading] = useState(true);

    // Check if email is admin
    function isAdminEmail(email) {
        return ADMIN_EMAILS.includes(email?.toLowerCase());
    }

    // Register a new user
    async function register(email, password, displayName) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        // Save user profile in database
        await set(ref(database, `users/${userCredential.user.uid}`), {
            email,
            displayName,
            role: isAdminEmail(email) ? 'admin' : 'user',
            createdAt: Date.now()
        });
        return userCredential.user;
    }

    // Login
    async function login(email, password) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    }

    // Login or create an account with Google
    async function loginWithGoogle() {
        let userCredential;
        try {
            userCredential = await signInWithPopup(auth, googleProvider);
        } catch (error) {
            const redirectErrors = [
                'auth/popup-blocked',
                'auth/popup-cancelled-by-user',
                'auth/operation-not-supported-in-this-environment'
            ];
            if (!redirectErrors.includes(error.code)) throw error;
            await signInWithRedirect(auth, googleProvider);
            return null;
        }
        const user = userCredential.user;
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            await set(userRef, {
                email: user.email,
                displayName: user.displayName || 'Google User',
                role: isAdminEmail(user.email) ? 'admin' : 'user',
                createdAt: Date.now()
            });
        }

        return user;
    }

    // Login or create an account with Apple ID (iCloud account)
    async function loginWithApple() {
        const userCredential = await signInWithPopup(auth, appleProvider);
        const user = userCredential.user;
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            await set(userRef, {
                email: user.email || '',
                displayName: user.displayName || 'Apple User',
                role: isAdminEmail(user.email) ? 'admin' : 'user',
                createdAt: Date.now()
            });
        }

        return user;
    }

    // Logout
    async function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                // Determine role directly from email — no database lookup needed
                setUserRole(isAdminEmail(user.email) ? 'admin' : 'user');
            } else {
                setUserRole('user');
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        isAdmin: userRole === 'admin',
        loading,
        register,
        login,
        loginWithGoogle,
        loginWithApple,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
