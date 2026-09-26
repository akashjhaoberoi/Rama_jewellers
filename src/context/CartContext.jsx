// ============================================
// Cart Context - Shopping Cart State Management
// ============================================
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        // Load cart from localStorage on init
        const saved = localStorage.getItem('kgs_cart');
        return saved ? JSON.parse(saved) : [];
    });

    // Persist cart to localStorage
    useEffect(() => {
        localStorage.setItem('kgs_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Add item to cart
    function addToCart(product, calculatedPrice) {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, calculatedPrice, quantity: 1 }];
        });
    }

    // Remove item from cart
    function removeFromCart(productId) {
        setCartItems(prev => prev.filter(item => item.id !== productId));
    }

    // Update quantity
    function updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    }

    // Clear cart
    function clearCart() {
        setCartItems([]);
    }

    // Total price
    const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.calculatedPrice * item.quantity,
        0
    );

    // Total items
    const totalItems = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}
