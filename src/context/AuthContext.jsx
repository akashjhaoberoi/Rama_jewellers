// @refresh reset
// ============================================
// Auth Context - Firebase Authentication
// Handles Google Sign-In (popup with redirect fallback),
// redirect result processing on app init, and auth state.
// ============================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
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
// Request basic profile and email scopes explicitly
googleProvider.addScope('profile');
googleProvider.addScope('email');

const appleProvider = new OAuthProvider('apple.com');

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState('user');
    // loading=true while Firebase restores auth state on page load.
    // Components that depend on auth must NOT render until this is false.
    const [loading, setLoading] = useState(true);
    // Separate flag for in-progress social login actions
    const [authActionLoading, setAuthActionLoading] = useState(false);

    function isAdminEmail(email) {
        return ADMIN_EMAILS.includes(email?.toLowerCase());
    }

    // Save user profile to Firebase DB if not already there
    async function ensureUserProfile(user) {
        try {
            const userRef = ref(database, `users/${user.uid}`);
            const snapshot = await get(userRef);
            if (!snapshot.exists()) {
                await set(userRef, {
                    email: user.email || '',
                    displayName: user.displayName || 'User',
                    role: isAdminEmail(user.email) ? 'admin' : 'user',
                    createdAt: Date.now()
                });
            }
        } catch (err) {
            // Non-fatal: don't block auth flow if DB write fails
            console.warn('[Auth] Could not write user profile to DB:', err.message);
        }
    }

    // Register a new user with email + password
    async function register(email, password, displayName) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        await ensureUserProfile(userCredential.user);
        return userCredential.user;
    }

    // Login with email + password
    async function login(email, password) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    }

    /**
     * Google Sign-In.
     * Tries popup first. If the environment blocks popups, falls back to redirect.
     *
     * IMPORTANT: when redirect is used this function resolves immediately with null
     * because the browser navigates away. The redirect result is processed inside
     * the useEffect below via getRedirectResult() and onAuthStateChanged will fire
     * once the user returns.
     *
     * Callers (Login.jsx) must handle null gracefully.
     */
    async function loginWithGoogle() {
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
            await ensureUserProfile(userCredential.user);
            return userCredential.user;
        } catch (error) {
            // Fall back to redirect flow for popup-hostile environments
            const popupErrors = [
                'auth/popup-blocked',
                'auth/popup-cancelled-by-user',
                'auth/operation-not-supported-in-this-environment'
            ];
            if (popupErrors.includes(error.code)) {
                await signInWithRedirect(auth, googleProvider);
                // Browser navigates away — return null so caller knows to wait
                return null;
            }
            // Re-throw all other errors (unauthorized domain, etc.)
            throw error;
        }
    }

    // Apple Sign-In
    async function loginWithApple() {
        const userCredential = await signInWithPopup(auth, appleProvider);
        await ensureUserProfile(userCredential.user);
        return userCredential.user;
    }

    // Logout
    async function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        let unsubscribe;

        async function init() {
            // ── Step 1: handle redirect result BEFORE subscribing to auth state ──
            // This is critical: if the user just returned from a Google redirect,
            // getRedirectResult() resolves with the credential. onAuthStateChanged
            // will also fire, so we just need to ensure the profile is saved.
            try {
                const result = await getRedirectResult(auth);
                if (result?.user) {
                    await ensureUserProfile(result.user);
                }
            } catch (redirectError) {
                // Common causes: unauthorized domain, operation-not-allowed
                console.warn('[Auth] getRedirectResult error:', redirectError.code, redirectError.message);
                // Do not throw — let the rest of auth init proceed
            }

            // ── Step 2: subscribe to ongoing auth state changes ──
            unsubscribe = onAuthStateChanged(auth, (user) => {
                setCurrentUser(user);
                if (user) {
                    setUserRole(isAdminEmail(user.email) ? 'admin' : 'user');
                } else {
                    setUserRole('user');
                }
                // Firebase has resolved the initial auth state — unblock the UI
                setLoading(false);
            });
        }

        init();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const value = {
        currentUser,
        userRole,
        isAdmin: userRole === 'admin',
        loading,
        authActionLoading,
        setAuthActionLoading,
        register,
        login,
        loginWithGoogle,
        loginWithApple,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Render children only after Firebase has determined auth state.
                This prevents ProtectedRoute from redirecting users to /login
                while Firebase is still restoring a previously-authenticated session. */}
            {!loading && children}
        </AuthContext.Provider>
    );
}
