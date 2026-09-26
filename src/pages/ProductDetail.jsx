// ============================================
// Product Details Page (Gold + Silver)
// ============================================
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import { IoDiamondOutline } from 'react-icons/io5';
import { useCart } from '../context/CartContext';
import { getProductById } from '../services/productService';
import { fetchLiveGoldRates, getStoredSilverRates, calculateJewelryPrice, getProductRate } from '../services/goldRateService';
import toast from 'react-hot-toast';
import '../styles/ProductDetail.css';

export default function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [goldRates, setGoldRates] = useState(null);
    const [silverRates, setSilverRates] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProduct() {
            try {
                const [prod, gRates, sRates] = await Promise.all([
                    getProductById(id),
                    fetchLiveGoldRates(),
                    getStoredSilverRates()
                ]);
                setProduct(prod);
                setGoldRates(gRates);
                setSilverRates(sRates);
            } catch (error) {
                console.error('Error loading product:', error);
            } finally {
                setLoading(false);
            }
        }
        loadProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="spinner-overlay" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container page" style={{ textAlign: 'center' }}>
                <h2>Product not found</h2>
                <Link to="/products" className="btn btn-primary" style={{ marginTop: '16px' }}>
                    Back to Collection
                </Link>
            </div>
        );
    }

    const isGold = product.metalType !== 'silver';
    const metalRate = getProductRate(product, goldRates, silverRates);

    const metalCost = metalRate * ((product.weightInGrams || 0) + (product.wastageInGrams || 0));
    const subtotal = metalCost + (product.makingCharge || 0);
    const tax = (subtotal * (product.taxPercentage || 0)) / 100;
    const finalPrice = Math.round(subtotal + tax);

    const metalLabel = isGold ? 'Gold' : 'Silver';
    const purityLabel = isGold
        ? (product.goldType || '22K')
        : (product.silverPurity === '999' ? '999 Fine Silver' : '925 Sterling Silver');

    const handleAddToCart = () => {
        addToCart(product, finalPrice);
        toast.success(`${product.name} added to cart!`);
    };

    return (
        <div className="product-detail">
            <div className="container">
                {/* Breadcrumb */}
                <div style={{ marginBottom: '24px' }}>
                    <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--rose-gold)', fontSize: '0.9rem' }}>
                        <FiArrowLeft /> Back to Collection
                    </Link>
                </div>

                <div className="product-detail-grid">
                    {/* Image */}
                    <div className="product-image-section">
                        <div className="product-main-image">
                            {product.imageURL ? (
                                <img src={product.imageURL} alt={product.name} />
                            ) : (
                                <IoDiamondOutline className="placeholder-icon" />
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="product-info-section">
                        <div className="breadcrumb">
                            <Link to="/">Home</Link> / <Link to="/products">Collection</Link> / <span>{product.name}</span>
                        </div>

                        <h1>{product.name}</h1>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <span className={`badge ${isGold ? 'badge-gold' : 'badge-silver'} gold-type-badge`}>
                                {isGold ? '🥇 Gold' : '🥈 Silver'}
                            </span>
                            <span className="badge badge-gold gold-type-badge">{purityLabel}</span>
                        </div>

                        <p className="description">{product.description || `A beautiful piece of ${metalLabel.toLowerCase()} jewelry crafted with precision and care.`}</p>

                        {/* Specs */}
                        <div className="specs-grid">
                            <div className="spec-item">
                                <div className="label">Weight</div>
                                <div className="value">{product.weightInGrams}g</div>
                            </div>
                            <div className="spec-item">
                                <div className="label">Metal</div>
                                <div className="value">{metalLabel}</div>
                            </div>
                            <div className="spec-item">
                                <div className="label">Purity</div>
                                <div className="value">{purityLabel}</div>
                            </div>
                            <div className="spec-item">
                                <div className="label">Category</div>
                                <div className="value" style={{ textTransform: 'capitalize' }}>{product.category}</div>
                            </div>
                            <div className="spec-item">
                                <div className="label">Wastage</div>
                                <div className="value">{product.wastageInGrams}g</div>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="price-breakdown">
                            <h3>Price Breakdown</h3>
                            <div className="price-row">
                                <span>{metalLabel} Rate ({purityLabel})</span>
                                <span>₹{metalRate.toLocaleString('en-IN')}/g</span>
                            </div>
                            <div className="price-row">
                                <span>Weight + Wastage</span>
                                <span>{product.weightInGrams}g + {product.wastageInGrams}g = {(product.weightInGrams + product.wastageInGrams).toFixed(2)}g</span>
                            </div>
                            <div className="price-row">
                                <span>{metalLabel} Cost</span>
                                <span>₹{Math.round(metalCost).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="price-row">
                                <span>Making Charge</span>
                                <span>₹{(product.makingCharge || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="price-row">
                                <span>Tax ({product.taxPercentage || 0}%)</span>
                                <span>₹{Math.round(tax).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="price-row total">
                                <span>Total</span>
                                <span>₹{finalPrice.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <div className="add-to-cart-section">
                            <button className="btn btn-primary btn-lg" onClick={handleAddToCart} style={{ flex: 1 }}>
                                <FiShoppingCart /> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
