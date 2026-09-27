// ============================================
// Protected Route Component
// Waits for Firebase auth state before deciding to redirect.
// This prevents users from being bounced to /login while Firebase
// is still restoring a previously-authenticated session.
// ============================================
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
    const { currentUser, loading } = useAuth();

    // AuthProvider already blocks rendering children until loading=false,
    // so this guard is a safety net for any edge cases.
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export function AdminRoute({ children }) {
    const { currentUser, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}
