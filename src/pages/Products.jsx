// ============================================
// Products Listing Page (Gold + Silver)
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IoDiamondOutline } from 'react-icons/io5';
import { FiSearch } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { fetchLiveGoldRates, getStoredSilverRates, calculateJewelryPrice, getProductRate } from '../services/goldRateService';
import { getAllProducts } from '../services/productService';
import '../styles/Products.css';

const CATEGORIES = ['all', 'ring', 'chain', 'necklace', 'bangle', 'earring', 'pendant', 'bracelet'];
const METAL_TYPES = ['all', 'gold', 'silver'];

export default function Products() {
    const [searchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || 'all';
    const initialMetal = searchParams.get('metal') || 'all';

    const [products, setProducts] = useState([]);
    const [goldRates, setGoldRates] = useState(null);
    const [silverRates, setSilverRates] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState(initialCategory);
    const [metalType, setMetalType] = useState(initialMetal);
    const [sortBy, setSortBy] = useState('newest');

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
                console.error('Error loading products:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Update filters from URL params
    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setCategory(cat);
        const metal = searchParams.get('metal');
        if (metal) setMetalType(metal);
    }, [searchParams]);

    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        // Search filter
        if (search.trim()) {
            const q = search.toLowerCase();
            filtered = filtered.filter(p =>
                p.name?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q)
            );
        }

        // Category filter
        if (category !== 'all') {
            filtered = filtered.filter(p => p.category === category);
        }

        // Metal type filter
        if (metalType !== 'all') {
            filtered = filtered.filter(p => {
                const pMetal = p.metalType || 'gold'; // default to gold for backward compat
                return pMetal === metalType;
            });
        }

        // Sort
        if (sortBy === 'price-low' || sortBy === 'price-high') {
            filtered.sort((a, b) => {
                const rateA = getProductRate(a, goldRates, silverRates);
                const rateB = getProductRate(b, goldRates, silverRates);
                const priceA = calculateJewelryPrice(rateA, a.weightInGrams || 0, a.wastageInGrams || 0, a.makingCharge || 0, a.taxPercentage || 0);
                const priceB = calculateJewelryPrice(rateB, b.weightInGrams || 0, b.wastageInGrams || 0, b.makingCharge || 0, b.taxPercentage || 0);
                return sortBy === 'price-low' ? priceA - priceB : priceB - priceA;
            });
        } else if (sortBy === 'weight') {
            filtered.sort((a, b) => (a.weightInGrams || 0) - (b.weightInGrams || 0));
        } else {
            // Newest first
            filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        }

        return filtered;
    }, [products, search, category, metalType, sortBy, goldRates, silverRates]);

    return (
        <div className="products-page">
            <div className="container">
                <div className="page-header">
                    <h1>Our Collection</h1>
                    <p>Discover exquisite gold & silver jewelry crafted with perfection</p>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search jewelry..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '36px' }}
                        />
                    </div>

                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        {CATEGORIES.map(c => (
                            <option key={c} value={c}>
                                {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
                            </option>
                        ))}
                    </select>

                    <select value={metalType} onChange={(e) => setMetalType(e.target.value)}>
                        {METAL_TYPES.map(m => (
                            <option key={m} value={m}>
                                {m === 'all' ? 'All Metals' : m.charAt(0).toUpperCase() + m.slice(1)}
                            </option>
                        ))}
                    </select>

                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="newest">Newest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="weight">Weight</option>
                    </select>

                    <span className="result-count">{filteredProducts.length} items</span>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="spinner-overlay">
                        <div className="spinner"></div>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                goldRates={goldRates}
                                silverRates={silverRates}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="products-empty">
                        <IoDiamondOutline />
                        <h3>No products found</h3>
                        <p>Try adjusting your filters or search terms</p>
                    </div>
                )}
            </div>
        </div>
    );
}
