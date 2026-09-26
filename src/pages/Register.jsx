// ============================================
// Register Page
// ============================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import '../styles/Pages.css';

function getAuthErrorMessage(error, provider) {
    const messages = {
        'auth/operation-not-allowed': `Enable ${provider} in Firebase Authentication > Sign-in providers.`,
        'auth/unauthorized-domain': 'Add this website domain in Firebase Authentication > Settings > Authorized domains.',
        'auth/popup-blocked': 'Your browser blocked the sign-in popup. Allow popups and try again.',
        'auth/popup-closed-by-user': 'The sign-in popup was closed before completing sign-in.'
    };
    return messages[error.code] || error.message || `${provider} sign-up failed`;
}

export default function Register() {
    const { register, loginWithGoogle, loginWithApple } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await register(email, password, name);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
            toast.success('Account created successfully!');
            navigate('/');
        } catch (err) {
            setError(getAuthErrorMessage(err, 'Google'));
        } finally {
            setLoading(false);
        }
    };

    const handleAppleRegister = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithApple();
            toast.success('Account created successfully!');
            navigate('/');
        } catch (err) {
            setError(getAuthErrorMessage(err, 'Apple'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo-icon">Rama Jewellers</div>
                    <h2>Create Account</h2>
                    <p className="auth-subtitle">Join Rama Jewellers</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

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
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-divider"><span>or</span></div>
                <button
                    type="button"
                    className="google-btn"
                    onClick={handleGoogleRegister}
                    disabled={loading}
                >
                    <FcGoogle /> Continue with Google
                </button>
                <button
                    type="button"
                    className="google-btn apple-btn"
                    onClick={handleAppleRegister}
                    disabled={loading}
                >
                    <FaApple /> Continue with Apple
                </button>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
