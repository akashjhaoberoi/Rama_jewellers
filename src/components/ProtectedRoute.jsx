// ============================================
// Protected Route Component
// ============================================
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
    const { currentUser } = useAuth();
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

export function AdminRoute({ children }) {
    const { currentUser, isAdmin } = useAuth();
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }
    return children;
}
