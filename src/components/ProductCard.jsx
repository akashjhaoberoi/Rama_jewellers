// ============================================
// Product Card Component (Gold + Silver)
// ============================================
import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { IoDiamondOutline } from 'react-icons/io5';
import { useCart } from '../context/CartContext';
import { calculateJewelryPrice, getProductRate } from '../services/goldRateService';
import '../styles/ProductCard.css';

export default function ProductCard({ product, goldRates, silverRates }) {
    const { addToCart } = useCart();

    const metalRate = getProductRate(product, goldRates, silverRates);

    const calculatedPrice = calculateJewelryPrice(
        metalRate,
        product.weightInGrams || 0,
        product.wastageInGrams || 0,
        product.makingCharge || 0,
        product.taxPercentage || 0
    );

    const isGold = product.metalType !== 'silver';
    const purityLabel = isGold
        ? (product.goldType || '22K')
        : (product.silverPurity === '999' ? '999 Fine' : '925 Sterling');

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, calculatedPrice);
    };

    return (
        <Link to={`/product/${product.id}`} className="product-card">
            <div className="product-card-image">
                {product.imageURL ? (
                    <img src={product.imageURL} alt={product.name} loading="lazy" />
                ) : (
                    <div className="no-image-placeholder">
                        <IoDiamondOutline />
                    </div>
                )}
                <span className={`badge ${isGold ? 'badge-gold' : 'badge-silver'} gold-badge`}>
                    {isGold ? '🥇 Gold' : '🥈 Silver'}
                </span>
            </div>

            <div className="product-card-body">
                <span className="category-label">{product.category}</span>
                <h3>{product.name}</h3>
                <span className="weight-info">
                    {product.weightInGrams}g • {purityLabel}
                </span>

                <div className="product-card-footer">
                    <span className="price">₹{calculatedPrice.toLocaleString('en-IN')}</span>
                    <button
                        className="add-btn"
                        onClick={handleAddToCart}
                        title="Add to Cart"
                    >
                        <FiPlus />
                    </button>
                </div>
            </div>
        </Link>
    );
}
