// ============================================
// Login Page
// ============================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import '../styles/Pages.css';

function getAuthErrorMessage(error) {
    const messages = {
        'auth/operation-not-allowed':
            'Google Sign-In is not enabled. Please contact the site administrator.',
        'auth/unauthorized-domain':
            'This domain is not authorised for Google Sign-In. Please contact the site administrator.',
        'auth/popup-blocked':
            'Your browser blocked the sign-in popup. Please allow popups for this site and try again.',
        'auth/popup-closed-by-user':
            'The sign-in popup was closed before completing. Please try again.',
        'auth/cancelled-popup-request':
            'Only one sign-in popup can be open at a time. Please try again.',
        'auth/account-exists-with-different-credential':
            'An account already exists with the same email but a different sign-in method.',
        'auth/network-request-failed':
            'A network error occurred. Please check your connection and try again.',
        'auth/user-disabled':
            'This account has been disabled. Please contact support.',
        'auth/too-many-requests':
            'Too many failed attempts. Please wait a moment before trying again.',
        'auth/wrong-password':
            'Incorrect password. Please try again.',
        'auth/user-not-found':
            'No account found with this email address.',
        'auth/invalid-email':
            'Please enter a valid email address.',
        'auth/invalid-credential':
            'Invalid email or password. Please try again.'
    };
    return messages[error.code] || error.message || 'Sign-in failed. Please try again.';
}

export default function Login() {
    const { login, loginWithGoogle, loginWithApple } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const user = await loginWithGoogle();
            if (user) {
                // Popup succeeded — navigate immediately
                toast.success('Welcome to Rama Jewellers!');
                navigate('/');
            } else {
                // Redirect flow initiated — browser will navigate away.
                // Do not call navigate() here; the page is leaving.
                // Show a brief message in case there's a delay.
                toast('Redirecting to Google Sign-In…', { icon: '🔄' });
            }
        } catch (err) {
            setError(getAuthErrorMessage(err));
            setLoading(false);
        }
        // Note: setLoading(false) is intentionally omitted for the redirect path
        // because the page navigates away. For popup success/failure it is called above.
    };

    const handleAppleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const user = await loginWithApple();
            if (user) {
                toast.success('Welcome to Rama Jewellers!');
                navigate('/');
            }
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo-icon">Rama Jewellers</div>
                    <h2>Welcome Back</h2>
                    <p className="auth-subtitle">Sign in to your account</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-divider"><span>or</span></div>

                <button
                    type="button"
                    className="google-btn"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    id="google-signin-btn"
                >
                    <FcGoogle /> Continue with Google
                </button>

                <button
                    type="button"
                    className="google-btn apple-btn"
                    onClick={handleAppleLogin}
                    disabled={loading}
                    id="apple-signin-btn"
                >
                    <FaApple /> Continue with Apple
                </button>

                <div className="auth-footer">
                    Don&apos;t have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
}
