// ============================================
// Orders Page - View Order History & Track
// ============================================
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrdersByUserId } from '../services/orderService';
import { FiPackage } from 'react-icons/fi';
import '../styles/Pages.css';

function getStatusClass(status) {
    const s = (status || '').toLowerCase();
    if (s === 'placed') return 'placed';
    if (s === 'packed') return 'packed';
    if (s === 'shipped') return 'shipped';
    if (s === 'delivered') return 'delivered';
    return 'placed';
}

export default function Orders() {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadOrders() {
            if (!currentUser) return;
            try {
                const data = await getOrdersByUserId(currentUser.uid);
                // Sort by newest first
                data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                setOrders(data);
            } catch (error) {
                console.error('Error loading orders:', error);
            } finally {
                setLoading(false);
            }
        }
        loadOrders();
    }, [currentUser]);

    if (loading) {
        return (
            <div className="spinner-overlay" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="container">
                <h1>My Orders</h1>

                {orders.length === 0 ? (
                    <div className="cart-empty">
                        <FiPackage />
                        <h2>No orders yet</h2>
                        <p>Your order history will appear here</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div className="order-card" key={order.orderId}>
                            <div className="order-header">
                                <h3>Order #{order.orderId?.slice(-8).toUpperCase()}</h3>
                                <span className={`status-badge ${getStatusClass(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="order-items">
                                {order.items?.map((item, idx) => (
                                    <div className="order-item-row" key={idx}>
                                        <span>{item.name} ({item.goldType}) × {item.quantity}</span>
                                        <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="order-footer">
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {order.createdAt && new Date(order.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                    {order.trackingId && (
                                        <span style={{ marginLeft: '16px' }}>
                                            Tracking: <strong>{order.trackingId}</strong>
                                        </span>
                                    )}
                                </div>
                                <div className="price" style={{ fontSize: '1.1rem' }}>
                                    Total: ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
