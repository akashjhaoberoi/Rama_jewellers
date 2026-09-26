// ============================================
// Rate Widget Component (Gold + Silver)
// ============================================
import React, { useEffect, useState } from 'react';

const widgetStyle = {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
};

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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, transparent 0%, rgba(183,110,121,0.08) 50%, transparent 100%)',
    pointerEvents: 'none'
};

const silverShimmerOverlay = {
    ...shimmerOverlay,
    background: 'linear-gradient(135deg, transparent 0%, rgba(192,192,192,0.08) 50%, transparent 100%)'
};

export default function GoldRateWidget({ goldRates, silverRates, compact }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const clock = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(clock);
    }, []);

    const formatRate = (rate) => {
        if (!rate || rate === 0) return '—';
        return `₹${Number(rate).toLocaleString('en-IN')}`;
    };

    const liveTime = currentTime.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    if (compact) {
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

            <div style={{ ...widgetStyle, flex: 1 }}>
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

            {goldRates && (
                <div style={{ width: '100%', textAlign: 'right', fontSize: '0.75rem', color: '#999', marginTop: '-8px' }}>
                    🔴 Live now: {liveTime}
                    {goldRates.source && ` • via ${goldRates.source}`}
                </div>
            )}
        </div>
    );
}
