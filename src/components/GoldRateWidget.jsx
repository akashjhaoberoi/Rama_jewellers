// ============================================
// GoldRateWidget — Shows live gold & silver rates
// Timestamp reflects when the PROVIDER last gave us data,
// NOT a local clock that falsely implies prices change every second.
// ============================================
import React from 'react';

const rateCardStyle = {
    background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
    borderRadius: '12px',
    padding: '20px 28px',
    color: '#fff',
    flex: '1',
    minWidth: '150px',
    position: 'relative',
    overflow: 'hidden'
};

const silverCardStyle = {
    ...rateCardStyle,
    background: 'linear-gradient(135deg, #2D2D3D 0%, #3D3D4D 100%)'
};

const shimmerOverlay = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(135deg, transparent 0%, rgba(183,110,121,0.08) 50%, transparent 100%)',
    pointerEvents: 'none'
};

const silverShimmerOverlay = {
    ...shimmerOverlay,
    background: 'linear-gradient(135deg, transparent 0%, rgba(192,192,192,0.08) 50%, transparent 100%)'
};

/** Format INR rate for display */
function formatRate(rate) {
    if (rate === null || rate === undefined || typeof rate !== 'number' || rate === 0) return '—';
    return `₹${Number(rate).toLocaleString('en-IN')}`;
}

/** Format a timestamp to a readable time string */
function formatTimestamp(ts) {
    if (!ts) return null;
    try {
        return new Date(ts).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    } catch {
        return null;
    }
}

export default function GoldRateWidget({ goldRates, silverRates, compact }) {
    const isUnavailable = !goldRates || goldRates.unavailable === true;
    const isCached = goldRates?.cached === true;

    // Use the timestamp from the API response — this reflects when the provider
    // actually served the data, not a local clock.
    const updatedTime = formatTimestamp(goldRates?.lastUpdated);
    const sourceLabel = goldRates?.source;

    if (compact) {
        if (isUnavailable) {
            return (
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', flexWrap: 'wrap', color: '#999' }}>
                    <span>Live rate temporarily unavailable</span>
                </div>
            );
        }
        return (
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                <span>🥇 24K: <strong>{formatRate(goldRates?.['24k'])}</strong>/g</span>
                <span>22K: <strong>{formatRate(goldRates?.['22k'])}</strong>/g</span>
                {silverRates && (
                    <span>🥈 Silver: <strong>{formatRate(silverRates?.['925'])}</strong>/g</span>
                )}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                    📊 Live Rates (India)
                </span>
            </div>

            {isUnavailable ? (
                <div style={{
                    flex: 1,
                    padding: '20px 24px',
                    background: '#1A1A1A',
                    borderRadius: '12px',
                    color: '#888',
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                    Live rate temporarily unavailable. Please check back shortly.
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', flex: 1 }}>
                    {/* Gold 24K */}
                    <div style={rateCardStyle}>
                        <div style={shimmerOverlay} />
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#C9A96E', marginBottom: '6px' }}>
                            24K Gold
                        </div>
                        <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#C9A96E' }}>
                            {formatRate(goldRates?.['24k'])}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#888' }}>per gram</div>
                    </div>

                    {/* Gold 22K */}
                    <div style={rateCardStyle}>
                        <div style={shimmerOverlay} />
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#C9A96E', marginBottom: '6px' }}>
                            22K Gold
                        </div>
                        <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#C9A96E' }}>
                            {formatRate(goldRates?.['22k'])}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#888' }}>per gram</div>
                    </div>

                    {/* Silver 925 */}
                    {silverRates && (
                        <div style={silverCardStyle}>
                            <div style={silverShimmerOverlay} />
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#C0C0C0', marginBottom: '6px' }}>
                                925 Silver
                            </div>
                            <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#C0C0C0' }}>
                                {formatRate(silverRates?.['925'])}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#888' }}>per gram</div>
                        </div>
                    )}
                </div>
            )}

            {/* Status row: LIVE indicator + actual provider timestamp */}
            {!isUnavailable && (
                <div style={{ width: '100%', textAlign: 'right', fontSize: '0.75rem', color: '#999', marginTop: '-8px' }}>
                    {isCached ? (
                        <span style={{ color: '#f59e0b' }}>
                            🟡 Cached{updatedTime ? ` • Last fetched ${updatedTime}` : ''}
                            {sourceLabel ? ` • ${sourceLabel}` : ''}
                        </span>
                    ) : (
                        <span>
                            <span style={{
                                display: 'inline-block',
                                width: '8px', height: '8px',
                                borderRadius: '50%',
                                background: '#22c55e',
                                marginRight: '5px',
                                verticalAlign: 'middle'
                            }} />
                            LIVE{updatedTime ? ` • Updated ${updatedTime}` : ''}
                            {sourceLabel ? ` • via ${sourceLabel}` : ''}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
