// ============================================
// Checkout Page
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { sendOrderEmail } from '../services/emailService';
import toast from 'react-hot-toast';
import '../styles/Pages.css';

export default function Checkout() {
    const { cartItems, totalPrice, clearCart } = useCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: currentUser?.displayName || '',
        phone: '',
        address: '',
        pincode: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.phone || !form.address || !form.pincode) {
            toast.error('Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                customerName: form.name,
                phone: form.phone,
                address: form.address,
                pincode: form.pincode,
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    goldType: item.goldType,
                    weightInGrams: item.weightInGrams,
                    category: item.category,
                    quantity: item.quantity,
                    price: item.calculatedPrice
                })),
                totalAmount: totalPrice
            };

            const order = await createOrder(orderData);
            clearCart();
            try {
                await sendOrderEmail(order);
                toast.success('Order placed and email sent successfully!');
            } catch (emailError) {
                console.error('Order email error:', emailError);
                toast.success('Order placed successfully! Email notification is pending setup.');
            }
            navigate('/orders');
        } catch (error) {
            toast.error('Failed to place order. Try again.');
            console.error('Order error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <h1>Checkout</h1>

                <div className="checkout-layout">
                    {/* Form */}
                    <form className="checkout-form" onSubmit={handleSubmit}>
                        <h3>Delivery Information</h3>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Delivery Address</label>
                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Enter your full address"
                                rows={3}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Pincode</label>
                            <input
                                type="text"
                                name="pincode"
                                value={form.pincode}
                                onChange={handleChange}
                                placeholder="Enter pincode"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? 'Placing Order...' : `Place Order • ₹${totalPrice.toLocaleString('en-IN')}`}
                        </button>
                    </form>

                    {/* Order Summary */}
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
                    </div>
                </div>
            </div>
        </div>
    );
}
