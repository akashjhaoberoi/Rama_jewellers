// ============================================
// Admin Panel - Product, Order, Gold Rate Mgmt
// ============================================
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiSave, FiPackage, FiDollarSign } from 'react-icons/fi';
import { IoDiamondOutline } from 'react-icons/io5';
import { GiGoldBar } from 'react-icons/gi';
import { addProduct, getAllProducts, updateProduct, deleteProduct } from '../services/productService';
import { getAllOrders, updateOrderStatus } from '../services/orderService';
import { uploadImageToImgbb } from '../services/imgbbService';
import { getStoredGoldRates, setManualGoldRates, getStoredSilverRates, setManualSilverRates } from '../services/goldRateService';
import { getAllSellRequests, updateSellRequestStatus } from '../services/sellGoldService';
import toast from 'react-hot-toast';
import '../styles/Admin.css';

const CATEGORIES = ['ring', 'chain', 'necklace', 'bangle', 'earring', 'pendant', 'bracelet', 'others'];

const EMPTY_FORM = {
    name: '',
    category: 'ring',
    customCategory: '',
    description: '',
    metalType: 'gold',
    goldType: '22K',
    silverPurity: '925',
    weightInGrams: '',
    makingCharge: '',
    wastageInGrams: '',
    taxPercentage: '',
    imageURL: ''
};

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [sellRequests, setSellRequests] = useState([]);
    const [goldRates, setGoldRates] = useState(null);
    const [silverRates, setSilverRates] = useState(null);
    const [loading, setLoading] = useState(true);

    // Product form
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [editingId, setEditingId] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [saving, setSaving] = useState(false);

    // Gold rate form
    const [rate24k, setRate24k] = useState('');
    const [rate22k, setRate22k] = useState('');
    // Silver rate form
    const [rateSilver999, setRateSilver999] = useState('');
    const [rateSilver925, setRateSilver925] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [prods, ords, sellReqs, gRates, sRates] = await Promise.all([
                getAllProducts(),
                getAllOrders(),
                getAllSellRequests(),
                getStoredGoldRates(),
                getStoredSilverRates()
            ]);
            setProducts(prods);
            setOrders(ords.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
            setSellRequests(sellReqs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
            setGoldRates(gRates);
            setSilverRates(sRates);
            if (gRates) {
                setRate24k(gRates['24k'] || '');
                setRate22k(gRates['22k'] || '');
            }
            if (sRates) {
                setRateSilver999(sRates['999'] || '');
                setRateSilver925(sRates['925'] || '');
            }
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setLoading(false);
        }
    }

    // Handle form change
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handle image selection
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Save product
    const handleSaveProduct = async (e) => {
        e.preventDefault();
        if (!form.name || !form.weightInGrams) {
            toast.error('Please fill required fields');
            return;
        }

        setSaving(true);
        try {
            let imageURL = form.imageURL;

            // Upload image if selected
            if (imageFile) {
                imageURL = await uploadImageToImgbb(imageFile);
                toast.success('Image uploaded!');
            }

            const productData = {
                name: form.name,
                category: form.category === 'others' ? (form.customCategory.trim().toLowerCase() || 'others') : form.category,
                description: form.description,
                metalType: form.metalType,
                goldType: form.metalType === 'gold' ? form.goldType : '',
                silverPurity: form.metalType === 'silver' ? form.silverPurity : '',
                weightInGrams: parseFloat(form.weightInGrams) || 0,
                makingCharge: parseFloat(form.makingCharge) || 0,
                wastageInGrams: parseFloat(form.wastageInGrams) || 0,
                taxPercentage: parseFloat(form.taxPercentage) || 0,
                imageURL
            };

            if (editingId) {
                await updateProduct(editingId, productData);
                toast.success('Product updated!');
            } else {
                await addProduct(productData);
                toast.success('Product added!');
            }

            // Reset form & reload
            setForm({ ...EMPTY_FORM });
            setEditingId(null);
            setImageFile(null);
            setImagePreview('');
            await loadData();
        } catch (error) {
            toast.error('Failed to save product');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    // Edit product
    const handleEdit = (product) => {
        const isStandardCat = CATEGORIES.includes(product.category);
        setForm({
            name: product.name || '',
            category: isStandardCat ? product.category : 'others',
            customCategory: isStandardCat ? '' : (product.category || ''),
            description: product.description || '',
            metalType: product.metalType || 'gold',
            goldType: product.goldType || '22K',
            silverPurity: product.silverPurity || '925',
            weightInGrams: product.weightInGrams || '',
            makingCharge: product.makingCharge || '',
            wastageInGrams: product.wastageInGrams || '',
            taxPercentage: product.taxPercentage || '',
            imageURL: product.imageURL || ''
        });
        setEditingId(product.id);
        setImagePreview(product.imageURL || '');
        setActiveTab('products');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Delete product
    const handleDelete = async (productId, productName) => {
        if (!window.confirm(`Delete "${productName}"?`)) return;
        try {
            await deleteProduct(productId);
            toast.success('Product deleted');
            await loadData();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    // Update order
    const handleUpdateOrder = async (orderId, status, trackingId) => {
        try {
            await updateOrderStatus(orderId, status, trackingId);
            toast.success('Order updated!');
            await loadData();
        } catch (error) {
            toast.error('Failed to update order');
        }
    };

    // Update gold rates
    const handleUpdateRates = async () => {
        if (!rate24k || !rate22k) {
            toast.error('Enter both rates');
            return;
        }
        try {
            await setManualGoldRates(rate24k, rate22k);
            toast.success('Gold rates updated!');
            await loadData();
        } catch (error) {
            toast.error('Failed to update rates');
        }
    };

    if (loading) {
        return (
            <div className="spinner-overlay" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="container">
                <h1>Admin Panel</h1>
                <p className="admin-subtitle">Manage your jewelry store</p>

                {/* Stats */}
                <div className="admin-stats">
                    <div className="stat-card">
                        <div className="stat-value">{products.length}</div>
                        <div className="stat-label">Products</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{orders.length}</div>
                        <div className="stat-label">Orders</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{sellRequests.length}</div>
                        <div className="stat-label">Sell Requests</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">₹{goldRates?.['24k']?.toLocaleString('en-IN') || '—'}</div>
                        <div className="stat-label">24K Rate</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="admin-tabs">
                    <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
                        <IoDiamondOutline style={{ marginRight: 6 }} /> Products
                    </button>
                    <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                        <FiPackage style={{ marginRight: 6 }} /> Orders
                    </button>
                    <button className={activeTab === 'sellRequests' ? 'active' : ''} onClick={() => setActiveTab('sellRequests')}>
                        <GiGoldBar style={{ marginRight: 6 }} /> Sell Requests
                    </button>
                    <button className={activeTab === 'rates' ? 'active' : ''} onClick={() => setActiveTab('rates')}>
                        <FiDollarSign style={{ marginRight: 6 }} /> Rates
                    </button>
                </div>

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <>
                        <div className="admin-card">
                            <h3>{editingId ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
                            <form onSubmit={handleSaveProduct}>
                                <div className="product-form">
                                    <div className="form-group">
                                        <label>Product Name *</label>
                                        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Royal Gold Necklace" required />
                                    </div>

                                    <div className="form-group">
                                        <label>Category</label>
                                        <select name="category" value={CATEGORIES.includes(form.category) ? form.category : 'others'} onChange={(e) => {
                                            setForm({ ...form, category: e.target.value, customCategory: e.target.value === 'others' ? form.customCategory : '' });
                                        }}>
                                            {CATEGORIES.map(c => (
                                                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {(form.category === 'others' || !CATEGORIES.includes(form.category)) && (
                                        <div className="form-group">
                                            <label>Custom Category Name *</label>
                                            <input
                                                type="text"
                                                name="customCategory"
                                                value={form.customCategory}
                                                onChange={handleChange}
                                                placeholder="e.g. Anklet, Brooch, Hair Pin..."
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Metal Type</label>
                                        <select name="metalType" value={form.metalType} onChange={handleChange}>
                                            <option value="gold">Gold</option>
                                            <option value="silver">Silver</option>
                                        </select>
                                    </div>

                                    {form.metalType === 'gold' ? (
                                        <div className="form-group">
                                            <label>Gold Purity</label>
                                            <select name="goldType" value={form.goldType} onChange={handleChange}>
                                                <option value="22K">22K</option>
                                                <option value="24K">24K</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="form-group">
                                            <label>Silver Purity</label>
                                            <select name="silverPurity" value={form.silverPurity} onChange={handleChange}>
                                                <option value="925">925 Sterling</option>
                                                <option value="999">999 Fine</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Weight (grams) *</label>
                                        <input type="number" name="weightInGrams" value={form.weightInGrams} onChange={handleChange} placeholder="e.g. 10" step="0.01" required />
                                    </div>

                                    <div className="form-group">
                                        <label>Making Charge (₹)</label>
                                        <input type="number" name="makingCharge" value={form.makingCharge} onChange={handleChange} placeholder="e.g. 2000" />
                                    </div>

                                    <div className="form-group">
                                        <label>Wastage (grams)</label>
                                        <input type="number" name="wastageInGrams" value={form.wastageInGrams} onChange={handleChange} placeholder="e.g. 0.5" step="0.01" />
                                    </div>

                                    <div className="form-group">
                                        <label>Tax (%)</label>
                                        <input type="number" name="taxPercentage" value={form.taxPercentage} onChange={handleChange} placeholder="e.g. 3" step="0.1" />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Description</label>
                                        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Product description..." rows={3} />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Product Image</label>
                                        <div className="image-upload-area" onClick={() => document.getElementById('imageInput').click()}>
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="preview-img" />
                                            ) : (
                                                <div>
                                                    <FiUpload style={{ fontSize: '2rem', color: 'var(--rose-gold)', marginBottom: '8px' }} />
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Click to upload image</p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            id="imageInput"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            style={{ display: 'none' }}
                                        />
                                    </div>

                                    <div className="full-width" style={{ display: 'flex', gap: '12px' }}>
                                        <button type="submit" className="btn btn-primary" disabled={saving}>
                                            <FiSave /> {saving ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}
                                        </button>
                                        {editingId && (
                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                onClick={() => { setForm({ ...EMPTY_FORM }); setEditingId(null); setImagePreview(''); setImageFile(null); }}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Products List */}
                        <div className="admin-card">
                            <h3>All Products ({products.length})</h3>
                            <div className="table-container">
                                <table className="product-list-table">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Name</th>
                                            <th>Category</th>
                                            <th>Metal</th>
                                            <th>Purity</th>
                                            <th>Weight</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => (
                                            <tr key={product.id}>
                                                <td>
                                                    {product.imageURL ? (
                                                        <img src={product.imageURL} alt={product.name} className="product-thumb" />
                                                    ) : (
                                                        <div className="product-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--light-gray)' }}>
                                                            <IoDiamondOutline style={{ color: 'var(--rose-gold-light)' }} />
                                                        </div>
                                                    )}
                                                </td>
                                                <td><strong>{product.name}</strong></td>
                                                <td style={{ textTransform: 'capitalize' }}>{product.category}</td>
                                                <td><span className={`badge ${product.metalType === 'silver' ? 'badge-silver' : 'badge-gold'}`}>{product.metalType === 'silver' ? 'Silver' : 'Gold'}</span></td>
                                                <td>{product.metalType === 'silver' ? (product.silverPurity === '999' ? '999 Fine' : '925') : (product.goldType || '22K')}</td>
                                                <td>{product.weightInGrams}g</td>
                                                <td>
                                                    <div className="actions">
                                                        <button className="btn btn-sm btn-outline" onClick={() => handleEdit(product)}>
                                                            <FiEdit2 />
                                                        </button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(product.id, product.name)}>
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {products.length === 0 && (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                                    No products yet. Add your first product above.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div>
                        {orders.length === 0 ? (
                            <div className="admin-card" style={{ textAlign: 'center', padding: '60px' }}>
                                <FiPackage style={{ fontSize: '3rem', color: 'var(--rose-gold-light)', marginBottom: '16px' }} />
                                <p style={{ color: 'var(--text-muted)' }}>No orders yet</p>
                            </div>
                        ) : (
                            orders.map(order => (
                                <OrderItem key={order.orderId} order={order} onUpdate={handleUpdateOrder} />
                            ))
                        )}
                    </div>
                )}

                {/* Sell Requests Tab */}
                {activeTab === 'sellRequests' && (
                    <div>
                        {sellRequests.length === 0 ? (
                            <div className="admin-card" style={{ textAlign: 'center', padding: '60px' }}>
                                <GiGoldBar style={{ fontSize: '3rem', color: 'var(--rose-gold-light)', marginBottom: '16px' }} />
                                <p style={{ color: 'var(--text-muted)' }}>No sell gold requests yet</p>
                            </div>
                        ) : (
                            sellRequests.map(req => (
                                <SellRequestItem
                                    key={req.id}
                                    request={req}
                                    onUpdate={async (id, status, message) => {
                                        try {
                                            await updateSellRequestStatus(id, status, message);
                                            toast.success('Sell request updated!');
                                            await loadData();
                                        } catch (err) {
                                            toast.error('Failed to update');
                                        }
                                    }}
                                />
                            ))
                        )}
                    </div>
                )}

                {/* Rates Tab */}
                {activeTab === 'rates' && (
                    <>
                        <div className="admin-card">
                            <h3>🥇 Gold Rate Override</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
                                Override the live gold rates. This changes pricing for all gold products.
                            </p>
                            <div className="gold-rate-form">
                                <div className="form-group">
                                    <label>24K Rate (₹/gram)</label>
                                    <input type="number" value={rate24k} onChange={(e) => setRate24k(e.target.value)} placeholder="e.g. 7200" />
                                </div>
                                <div className="form-group">
                                    <label>22K Rate (₹/gram)</label>
                                    <input type="number" value={rate22k} onChange={(e) => setRate22k(e.target.value)} placeholder="e.g. 6600" />
                                </div>
                                <button className="btn btn-primary" onClick={handleUpdateRates}>
                                    <FiSave /> Update Gold Rates
                                </button>
                            </div>
                            {goldRates && (
                                <div style={{ marginTop: '24px', padding: '16px', background: 'var(--light-gray)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current gold rates:</div>
                                    <div style={{ fontWeight: 600, marginTop: '4px' }}>
                                        24K: ₹{goldRates['24k']?.toLocaleString('en-IN')}/g • 22K: ₹{goldRates['22k']?.toLocaleString('en-IN')}/g
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        Last updated: {goldRates.lastUpdated ? new Date(goldRates.lastUpdated).toLocaleString('en-IN') : 'N/A'}
                                        {goldRates.manualOverride && ' (Manual Override)'}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="admin-card" style={{ marginTop: '24px' }}>
                            <h3>🥈 Silver Rate Management</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
                                Set silver rates manually. These are used for all silver product pricing.
                            </p>
                            <div className="gold-rate-form">
                                <div className="form-group">
                                    <label>999 Fine Silver (₹/gram)</label>
                                    <input type="number" value={rateSilver999} onChange={(e) => setRateSilver999(e.target.value)} placeholder="e.g. 95" />
                                </div>
                                <div className="form-group">
                                    <label>925 Sterling Silver (₹/gram)</label>
                                    <input type="number" value={rateSilver925} onChange={(e) => setRateSilver925(e.target.value)} placeholder="e.g. 85" />
                                </div>
                                <button className="btn btn-primary" onClick={async () => {
                                    if (!rateSilver999 || !rateSilver925) { toast.error('Enter both silver rates'); return; }
                                    try {
                                        await setManualSilverRates(rateSilver999, rateSilver925);
                                        toast.success('Silver rates updated!');
                                        await loadData();
                                    } catch (err) { toast.error('Failed to update silver rates'); }
                                }}>
                                    <FiSave /> Update Silver Rates
                                </button>
                            </div>
                            {silverRates && (
                                <div style={{ marginTop: '24px', padding: '16px', background: 'var(--light-gray)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current silver rates:</div>
                                    <div style={{ fontWeight: 600, marginTop: '4px' }}>
                                        999: ₹{silverRates['999']?.toLocaleString('en-IN')}/g • 925: ₹{silverRates['925']?.toLocaleString('en-IN')}/g
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ---- Order Item Sub-Component ----
function OrderItem({ order, onUpdate }) {
    const [status, setStatus] = useState(order.status || 'Placed');
    const [trackingId, setTrackingId] = useState(order.trackingId || '');

    return (
        <div className="admin-order">
            <div className="admin-order-header">
                <h4>Order #{order.orderId?.slice(-8).toUpperCase()}</h4>
                <span className={`status-badge ${(order.status || 'placed').toLowerCase()}`}>
                    {order.status}
                </span>
            </div>
            <div className="admin-order-customer">
                👤 {order.customerName || 'N/A'} • 📱 {order.phone || 'N/A'} • 📍 {order.address || 'N/A'}, {order.pincode || ''}
            </div>

            {order.items?.map((item, idx) => (
                <div className="order-item-row" key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <span>{item.name} ({item.goldType}) × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontWeight: 600, fontSize: '1rem' }}>
                <span>Total</span>
                <span className="price">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>

            <div className="admin-order-actions">
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Placed">Placed</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                </select>
                <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="Tracking ID"
                />
                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onUpdate(order.orderId, status, trackingId)}
                >
                    Update
                </button>
            </div>
        </div>
    );
}

// ---- Sell Request Item Sub-Component ----
function SellRequestItem({ request, onUpdate }) {
    const [status, setStatus] = useState(request.status || 'Pending');
    const [adminMessage, setAdminMessage] = useState(request.adminMessage || '');

    return (
        <div className="admin-order">
            <div className="admin-order-header">
                <h4>Sell #{request.id?.slice(-8).toUpperCase()}</h4>
                <span style={{
                    padding: '4px 14px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#fff',
                    background: {
                        'Pending': '#e6a817',
                        'Reviewing': '#3b82f6',
                        'Approved': '#22c55e',
                        'Rejected': '#ef4444',
                        'Completed': '#10b981'
                    }[request.status] || '#999'
                }}>
                    {request.status}
                </span>
            </div>

            <div className="admin-order-customer">
                👤 {request.userName || 'N/A'} • 📧 {request.userEmail || 'N/A'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', margin: '12px 0' }}>
                <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>HUID</div>
                    <div style={{ fontWeight: 600 }}>{request.huidNumber}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weight</div>
                    <div style={{ fontWeight: 600 }}>{request.weight}g</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Purity</div>
                    <div style={{ fontWeight: 600 }}>{request.purity}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Value</div>
                    <div style={{ fontWeight: 700, color: 'var(--rose-gold)' }}>₹{request.estimatedValue?.toLocaleString('en-IN')}</div>
                </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Submitted: {request.createdAt ? new Date(request.createdAt).toLocaleString('en-IN') : 'N/A'}
            </div>

            <div className="admin-order-actions" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ flex: '0 0 auto' }}>
                        <option value="Pending">Pending</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                    </select>
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => onUpdate(request.id, status, adminMessage)}
                    >
                        Update
                    </button>
                </div>
                <textarea
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    placeholder="Message to customer (visible to them)..."
                    rows={2}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.88rem',
                        resize: 'vertical'
                    }}
                />
            </div>
        </div>
    );
}
