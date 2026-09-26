// ============================================
// Home Page Component (Gold + Silver)
// ============================================
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoDiamondOutline } from 'react-icons/io5';
import { GiDiamondRing, GiDoubleNecklace, GiCrystalEarrings } from 'react-icons/gi';
import { FiArrowRight } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import GoldRateWidget from '../components/GoldRateWidget';
import { fetchLiveGoldRates, getStoredSilverRates } from '../services/goldRateService';
import { getAllProducts } from '../services/productService';
import '../styles/Home.css';

const CATEGORIES = [
    { name: 'Rings', key: 'ring', icon: <GiDiamondRing /> },
    { name: 'Chains', key: 'chain', icon: <IoDiamondOutline /> },
    { name: 'Necklaces', key: 'necklace', icon: <GiDoubleNecklace /> },
    { name: 'Bangles', key: 'bangle', icon: <GiCrystalEarrings /> },
    { name: 'Earrings', key: 'earring', icon: <GiCrystalEarrings /> }
];

export default function Home() {
    const [goldRates, setGoldRates] = useState(null);
    const [silverRates, setSilverRates] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [gRates, sRates, prods] = await Promise.all([
                    fetchLiveGoldRates(),
                    getStoredSilverRates(),
                    getAllProducts()
                ]);
                setGoldRates(gRates);
                setSilverRates(sRates);
                setProducts(prods);
            } catch (error) {
                console.error('Error loading home data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();

        // Auto-refresh gold rates every minute
        const interval = setInterval(async () => {
            try {
                const [rates, sRates] = await Promise.all([
                    fetchLiveGoldRates(),
                    getStoredSilverRates()
                ]);
                setGoldRates(rates);
                setSilverRates(sRates);
            } catch (err) {
                console.warn('Rate refresh failed');
            }
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const featuredProducts = products.slice(0, 8);

    return (
        <div>
            {/* Hero */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-text">
                        <span className="tagline">✦ Premium Jewelry Since 1990</span>
                        <h1>
                            Timeless <span className="highlight">Elegance</span> Crafted
                            in Gold & Silver
                        </h1>
                        <p>
                            Discover our exquisite collection of handcrafted gold and silver
                            jewelry. Every piece tells a story of tradition, artistry, and
                            unmatched quality.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/products" className="btn btn-primary btn-lg">
                                Explore Collection <FiArrowRight />
                            </Link>
                            <Link to="/sell-gold" className="btn btn-outline btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>
                                Sell Gold & Silver
                            </Link>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-diamond">
                            <IoDiamondOutline className="icon" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Rates */}
            <section className="gold-rates-section">
                <div className="container">
                    <GoldRateWidget goldRates={goldRates} silverRates={silverRates} />
                </div>
            </section>

            {/* Categories */}
            <section className="categories-section">
                <div className="container">
                    <div className="section-title">
                        <div className="divider"></div>
                        <h2>Shop by Category</h2>
                        <p>Explore our curated collections of fine jewelry</p>
                    </div>
                    <div className="categories-grid">
                        {CATEGORIES.map((cat) => (
                            <Link
                                to={`/products?category=${cat.key}`}
                                key={cat.key}
                                className="category-card"
                            >
                                <div className="cat-icon">{cat.icon}</div>
                                <h3>{cat.name}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="featured-section">
                <div className="container">
                    <div className="section-title">
                        <div className="divider"></div>
                        <h2>Featured Collection</h2>
                        <p>Our most loved pieces, handpicked for you</p>
                    </div>

                    {loading ? (
                        <div className="spinner-overlay">
                            <div className="spinner"></div>
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <>
                            <div className="products-grid">
                                {featuredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        goldRates={goldRates}
                                        silverRates={silverRates}
                                    />
                                ))}
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '48px' }}>
                                <Link to="/products" className="btn btn-outline">
                                    View All Collection <FiArrowRight />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                            <IoDiamondOutline style={{ fontSize: '3rem', marginBottom: '16px', color: 'var(--rose-gold-light)' }} />
                            <p>No products available yet. Check back soon!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="container">
                    <h2>Have Old Gold or Silver to Sell?</h2>
                    <p>Get the best value for your precious metals with our transparent HUID-based pricing</p>
                    <Link to="/sell-gold" className="btn btn-gold btn-lg">
                        Sell Your Gold & Silver <FiArrowRight />
                    </Link>
                </div>
            </section>
        </div>
    );
}
