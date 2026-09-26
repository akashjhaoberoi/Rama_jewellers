// ============================================
// Navbar Component
// ============================================
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiShield } from 'react-icons/fi';
import '../styles/Navbar.css';

export default function Navbar() {
    const { currentUser, isAdmin, logout } = useAuth();
    const { totalItems } = useCart();
    const navigate = useNavigate();

    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Track scroll for shadow effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleLogout = async () => {
        await logout();
        setDropdownOpen(false);
        setMobileOpen(false);
        navigate('/');
    };

    return (
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-inner">
                    {/* Brand */}
                    <Link to="/" className="navbar-brand">
                        <div className="logo-icon">RJ</div>
                        <div className="brand-text">
                            Rama <span>Jewellers</span>
                        </div>
                    </Link>

                    {/* Desktop Links */}
                    <div className="navbar-links">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/products">Collection</NavLink>
                        <NavLink to="/sell-gold">Sell Gold</NavLink>
                        {isAdmin && <NavLink to="/admin">Admin</NavLink>}
                    </div>

                    {/* Actions */}
                    <div className="navbar-actions">
                        <Link to="/cart" className="icon-btn desktop-only" title="Cart">
                            <FiShoppingCart />
                            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
                        </Link>

                        {currentUser ? (
                            <div className="user-menu" ref={dropdownRef}>
                                <button
                                    className="user-menu-toggle"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <FiUser />
                                    <span className="desktop-only">
                                        {currentUser.displayName || 'Account'}
                                    </span>
                                </button>
                                {dropdownOpen && (
                                    <div className="user-dropdown">
                                        <Link to="/orders" onClick={() => setDropdownOpen(false)}>
                                            <FiPackage /> My Orders
                                        </Link>
                                        {isAdmin && (
                                            <Link to="/admin" onClick={() => setDropdownOpen(false)}>
                                                <FiShield /> Admin Panel
                                            </Link>
                                        )}
                                        <div className="divider" />
                                        <button onClick={handleLogout}>
                                            <FiLogOut /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
                        )}

                        {/* Mobile Toggle */}
                        <button
                            className="mobile-toggle"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <FiX /> : <FiMenu />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Nav */}
            <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
                <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
                <Link to="/products" onClick={() => setMobileOpen(false)}>Collection</Link>
                <Link to="/sell-gold" onClick={() => setMobileOpen(false)}>Sell Gold</Link>
                <Link to="/cart" onClick={() => setMobileOpen(false)}>
                    <FiShoppingCart /> Cart {totalItems > 0 && `(${totalItems})`}
                </Link>
                {currentUser ? (
                    <>
                        <Link to="/orders" onClick={() => setMobileOpen(false)}>
                            <FiPackage /> My Orders
                        </Link>
                        {isAdmin && (
                            <Link to="/admin" onClick={() => setMobileOpen(false)}>
                                <FiShield /> Admin Panel
                            </Link>
                        )}
                        <button onClick={handleLogout}>
                            <FiLogOut /> Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
                )}
            </div>
        </>
    );
}
