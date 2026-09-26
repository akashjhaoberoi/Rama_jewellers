// ============================================
// App.jsx - Main Application with Routing
// Rama Jewellers E-Commerce
// ============================================
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import SellGold from './pages/SellGold';

// Admin
import AdminPanel from './admin/AdminPanel';

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                {/* Toast notifications */}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            borderRadius: '12px',
                            background: '#1A1A1A',
                            color: '#fff',
                            fontSize: '0.9rem'
                        },
                        success: {
                            iconTheme: { primary: '#B76E79', secondary: '#fff' }
                        }
                    }}
                />

                <Navbar />

                <main>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/sell-gold" element={<SellGold />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Routes */}
                        <Route path="/checkout" element={
                            <ProtectedRoute><Checkout /></ProtectedRoute>
                        } />
                        <Route path="/orders" element={
                            <ProtectedRoute><Orders /></ProtectedRoute>
                        } />

                        {/* Admin Routes */}
                        <Route path="/admin" element={
                            <AdminRoute><AdminPanel /></AdminRoute>
                        } />

                        {/* 404 */}
                        <Route path="*" element={
                            <div style={{
                                textAlign: 'center',
                                padding: '100px 24px',
                                minHeight: '50vh'
                            }}>
                                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', marginBottom: '12px' }}>404</h1>
                                <p style={{ color: '#999' }}>Page not found</p>
                            </div>
                        } />
                    </Routes>
                </main>

                <Footer />
            </CartProvider>
        </AuthProvider>
    );
}
