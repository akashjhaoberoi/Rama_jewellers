// ============================================
// Sell Old Gold & Silver Page (HUID)
// ============================================
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchLiveGoldRates, getStoredSilverRates } from '../services/goldRateService';
import { createSellRequest, calculateSellValue, getUserSellRequests } from '../services/sellGoldService';
import GoldRateWidget from '../components/GoldRateWidget';
import toast from 'react-hot-toast';
import '../styles/Pages.css';

const STATUS_COLORS = {
    'Pending': '#e6a817',
    'Reviewing': '#3b82f6',
    'Approved': '#22c55e',
    'Rejected': '#ef4444',
    'Completed': '#10b981'
};

export default function SellGold() {
    const { currentUser } = useAuth();
    const [goldRates, setGoldRates] = useState(null);
    const [silverRates, setSilverRates] = useState(null);
    const [form, setForm] = useState({
        metalType: 'gold',
        huidNumber: '',
        weight: '',
        purity: '22K'
    });
    const [sellValue, setSellValue] = useState(null);
    const [loading, setLoading] = useState(false);
    const [myRequests, setMyRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    useEffect(() => {
        async function loadRates() {
            try {
                const [gRates, sRates] = await Promise.all([
                    fetchLiveGoldRates(),
                    getStoredSilverRates()
                ]);
                setGoldRates(gRates);
                setSilverRates(sRates);
            } catch (error) {
                console.error('Error loading rates:', error);
            }
        }
        loadRates();
    }, []);

    useEffect(() => {
        if (currentUser) loadMyRequests();
    }, [currentUser]);

    async function loadMyRequests() {
        setLoadingRequests(true);
        try {
            const requests = await getUserSellRequests(currentUser.uid);
            setMyRequests(requests);
        } catch (error) {
            console.error('Error loading requests:', error);
        } finally {
            setLoadingRequests(false);
        }
    }

    // Calculate value on form change
    useEffect(() => {
        if (form.weight) {
            let rate = 0;
            if (form.metalType === 'gold') {
                rate = form.purity === '24K' ? (goldRates?.['24k'] || 0) : (goldRates?.['22k'] || 0);
            } else {
                rate = form.purity === '999' ? (silverRates?.['999'] || 0) : (silverRates?.['925'] || 0);
            }
            setSellValue(calculateSellValue(rate, parseFloat(form.weight)));
        } else {
            setSellValue(null);
        }
    }, [form.weight, form.purity, form.metalType, goldRates, silverRates]);

    // Reset purity when metal type changes
    const handleMetalChange = (metalType) => {
        setForm({
            ...form,
            metalType,
            purity: metalType === 'gold' ? '22K' : '925'
        });
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            toast.error('Please login to submit a sell request');
            return;
        }

        if (!form.huidNumber || !form.weight) {
            toast.error('Please fill all fields');
            return;
        }

        let rate = 0;
        if (form.metalType === 'gold') {
            rate = form.purity === '24K' ? (goldRates?.['24k'] || 0) : (goldRates?.['22k'] || 0);
        } else {
            rate = form.purity === '999' ? (silverRates?.['999'] || 0) : (silverRates?.['925'] || 0);
        }

        setLoading(true);
        try {
            await createSellRequest({
                userId: currentUser.uid,
                userEmail: currentUser.email,
                userName: currentUser.displayName || '',
                metalType: form.metalType,
                huidNumber: form.huidNumber,
                weight: parseFloat(form.weight),
                purity: form.purity,
                estimatedValue: sellValue,
                metalRate: rate
            });
            toast.success('Sell request submitted successfully!');
            setForm({ metalType: 'gold', huidNumber: '', weight: '', purity: '22K' });
            setSellValue(null);
            await loadMyRequests();
        } catch (error) {
            toast.error('Failed to submit. Try again.');
            console.error('Sell request error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sell-gold-page">
            <div className="container">
                <h1>Sell Your Gold & Silver</h1>
                <p className="subtitle">
                    Get the best value for your precious metals with HUID-verified transparent pricing
                </p>

                {/* Current Rates */}
                <div style={{ maxWidth: '700px', margin: '0 auto 32px' }}>
                    <GoldRateWidget goldRates={goldRates} silverRates={silverRates} />
                </div>

                {/* Sell Form */}
                <div className="sell-gold-card">
                    <form onSubmit={handleSubmit}>
                        {/* Metal Type Toggle */}
                        <div className="form-group">
                            <label>Metal Type</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    type="button"
                                    className={`btn ${form.metalType === 'gold' ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => handleMetalChange('gold')}
                                    style={{ flex: 1 }}
                                >
                                    🥇 Gold
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${form.metalType === 'silver' ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => handleMetalChange('silver')}
                                    style={{ flex: 1 }}
                                >
                                    🥈 Silver
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>HUID Number</label>
                            <input
                                type="text"
                                name="huidNumber"
                                value={form.huidNumber}
                                onChange={handleChange}
                                placeholder="Enter HUID number"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Weight (in grams)</label>
                            <input
                                type="number"
                                name="weight"
                                value={form.weight}
                                onChange={handleChange}
                                placeholder="Enter weight in grams"
                                min="0.1"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Purity</label>
                            <select name="purity" value={form.purity} onChange={handleChange}>
                                {form.metalType === 'gold' ? (
                                    <>
                                        <option value="22K">22K Gold</option>
                                        <option value="24K">24K Gold</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="925">925 Sterling Silver</option>
                                        <option value="999">999 Fine Silver</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {sellValue !== null && (
                            <div className="sell-value-display">
                                <div className="label">Estimated Sell Value</div>
                                <div className="value">₹{sellValue.toLocaleString('en-IN')}</div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-gold btn-lg"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Sell Request'}
                        </button>
                    </form>
                </div>

                {/* User's Sell Request History */}
                {currentUser && (
                    <div style={{ marginTop: '48px' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '20px' }}>
                            📋 My Sell Requests
                        </h2>

                        {loadingRequests ? (
                            <div className="spinner-overlay" style={{ minHeight: '100px' }}>
                                <div className="spinner"></div>
                            </div>
                        ) : myRequests.length === 0 ? (
                            <div className="sell-gold-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                No sell requests yet. Submit your first request above.
                            </div>
                        ) : (
                            myRequests.map(req => (
                                <div key={req.id} className="sell-gold-card" style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                        <div>
                                            <strong style={{ fontSize: '1rem' }}>
                                                {req.metalType === 'silver' ? '🥈' : '🥇'} HUID: {req.huidNumber}
                                            </strong>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                }) : ''}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '4px 14px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            color: '#fff',
                                            background: STATUS_COLORS[req.status] || '#999'
                                        }}>
                                            {req.status}
                                        </span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Metal</div>
                                            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{req.metalType || 'gold'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weight</div>
                                            <div style={{ fontWeight: 600 }}>{req.weight}g</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Purity</div>
                                            <div style={{ fontWeight: 600 }}>{req.purity}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Value</div>
                                            <div style={{ fontWeight: 700, color: 'var(--rose-gold)' }}>₹{req.estimatedValue?.toLocaleString('en-IN')}</div>
                                        </div>
                                    </div>

                                    {req.adminMessage && (
                                        <div style={{
                                            background: 'var(--light-gray)',
                                            borderRadius: 'var(--radius-sm)',
                                            padding: '12px 16px',
                                            borderLeft: '3px solid var(--rose-gold)'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                                                💬 Message from Admin
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                                {req.adminMessage}
                                            </div>
                                            {req.updatedAt && (
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                    {new Date(req.updatedAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
