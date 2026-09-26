// ============================================
// Cart Page
// ============================================
import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowRight } from 'react-icons/fi';
import { IoDiamondOutline } from 'react-icons/io5';
import { useCart } from '../context/CartContext';
import '../styles/Pages.css';

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="cart-empty">
                        <FiShoppingCart />
                        <h2>Your cart is empty</h2>
                        <p>Browse our collection and add your favorite pieces</p>
                        <Link to="/products" className="btn btn-primary" style={{ marginTop: '20px' }}>
                            Explore Collection
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1>Shopping Cart ({totalItems} items)</h1>

                <div className="cart-layout">
                    {/* Cart Items */}
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div className="cart-item" key={item.id}>
                                <div className="cart-item-image">
                                    {item.imageURL ? (
                                        <img src={item.imageURL} alt={item.name} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <IoDiamondOutline style={{ fontSize: '2rem', color: 'var(--rose-gold-light)' }} />
                                        </div>
                                    )}
                                </div>
                                <div className="cart-item-info">
                                    <h3>{item.name}</h3>
                                    <div className="item-meta">
                                        {item.weightInGrams}g • {item.goldType} • {item.category}
                                    </div>
                                    <div className="item-price">
                                        ₹{item.calculatedPrice.toLocaleString('en-IN')}
                                    </div>
                                </div>
                                <div className="cart-item-actions">
                                    <div className="qty-controls">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                            <FiMinus />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                            <FiPlus />
                                        </button>
                                    </div>
                                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="cart-summary">
                        <h3>Order Summary</h3>
                        {cartItems.map(item => (
                            <div className="summary-row" key={item.id}>
                                <span>{item.name} × {item.quantity}</span>
                                <span>₹{(item.calculatedPrice * item.quantity).toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <Link
                            to="/checkout"
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: '24px' }}
                        >
                            Checkout <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
