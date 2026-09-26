// ============================================
// Footer Component
// ============================================
import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import '../styles/Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-grid">
                {/* Brand */}
                <div className="footer-brand">
                    <div className="brand-name">Rama <span>Jewellers</span></div>
                    <p>
                        Crafting timeless elegance since generations. Premium 22K and 24K
                        gold jewelry with expert craftsmanship and transparent pricing.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4>Quick Links</h4>
                    <div className="footer-links">
                        <Link to="/">Home</Link>
                        <Link to="/products">Collection</Link>
                        <Link to="/sell-gold">Sell Gold</Link>
                        <Link to="/cart">Cart</Link>
                    </div>
                </div>

                {/* Categories */}
                <div>
                    <h4>Categories</h4>
                    <div className="footer-links">
                        <Link to="/products?category=ring">Rings</Link>
                        <Link to="/products?category=chain">Chains</Link>
                        <Link to="/products?category=necklace">Necklaces</Link>
                        <Link to="/products?category=bangle">Bangles</Link>
                        <Link to="/products?category=earring">Earrings</Link>
                    </div>
                </div>

                {/* Contact */}
                <div className="footer-contact">
                    <h4>Contact Us</h4>
                    <p><FiMapPin /> Shitlakhet, Almora, UK</p>
                    <p><FiPhone /> 7903445967</p>
                    <p><FiMail /> rsaha2833@gmail.com</p>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Rama Jewellers. All rights reserved.</p>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Designed & Developed By Akarika Technologies Pvt Ltd. All rights reserved.</p>
            </div>
        </footer>
    );
}
