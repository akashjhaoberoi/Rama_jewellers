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
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
            toast.success('Welcome to Rama Jewellers!');
            navigate('/');
        } catch (err) {
            setError(err.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAppleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithApple();
            toast.success('Welcome to Rama Jewellers!');
            navigate('/');
        } catch (err) {
            setError(err.message || 'Apple sign-in failed');
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
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-divider"><span>or</span></div>
                <button
                    type="button"
                    className="google-btn"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <FcGoogle /> Continue with Google
                </button>
                <button
                    type="button"
                    className="google-btn apple-btn"
                    onClick={handleAppleLogin}
                    disabled={loading}
                >
                    <FaApple /> Continue with Apple
                </button>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
}
