// ============================================
// RamaLogo — Premium Jewellery Brand Logo SVG
// Scalable inline SVG — works in Navbar, Hero, Footer
// ============================================
import React from 'react';

/**
 * @param {object} props
 * @param {'dark' | 'light' | 'gold'} [props.variant='dark'] — 'dark' for light backgrounds, 'light' for dark backgrounds
 * @param {number} [props.size=40] — height in px (width scales proportionally)
 * @param {boolean} [props.showText=true] — show/hide "RAMA JEWELLERS" wordmark
 */
export default function RamaLogo({ variant = 'dark', size = 40, showText = true }) {
    const gold = '#C9A96E';
    const roseGold = '#B76E79';
    const dark = '#1A1A1A';
    const white = '#FFFFFF';

    const emblemColor = variant === 'light' ? white : dark;
    const goldAccent = gold;
    const textColor = variant === 'light' ? white : dark;
    const subTextColor = variant === 'light' ? 'rgba(255,255,255,0.7)' : '#888888';

    // The emblem is 40×40, wordmark adds ~120px width
    const emblemSize = size;
    const totalWidth = showText ? emblemSize + 110 : emblemSize;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${totalWidth} ${emblemSize}`}
            height={emblemSize}
            width={totalWidth}
            aria-label="Rama Jewellers"
            role="img"
        >
            {/* ── Octagonal Emblem Frame ── */}
            <g transform={`translate(${emblemSize / 2}, ${emblemSize / 2})`}>
                {/* Outer octagon */}
                <polygon
                    points="0,-18 12.7,-12.7 18,0 12.7,12.7 0,18 -12.7,12.7 -18,0 -12.7,-12.7"
                    fill="none"
                    stroke={goldAccent}
                    strokeWidth="1.2"
                />
                {/* Inner octagon (slightly smaller) */}
                <polygon
                    points="0,-14 9.9,-9.9 14,0 9.9,9.9 0,14 -9.9,9.9 -14,0 -9.9,-9.9"
                    fill="none"
                    stroke={roseGold}
                    strokeWidth="0.6"
                    opacity="0.6"
                />

                {/* Monogram "R" */}
                <text
                    x="-5.5"
                    y="5.5"
                    fontFamily="'Playfair Display', Georgia, serif"
                    fontSize="14"
                    fontWeight="700"
                    fill={goldAccent}
                    letterSpacing="0"
                    textAnchor="middle"
                >
                    R
                </text>
                {/* Stylised "J" */}
                <text
                    x="4"
                    y="5.5"
                    fontFamily="'Playfair Display', Georgia, serif"
                    fontSize="11"
                    fontWeight="400"
                    fill={roseGold}
                    letterSpacing="0"
                    textAnchor="middle"
                >
                    J
                </text>

                {/* Corner diamonds */}
                {[[-18, 0], [18, 0], [0, -18], [0, 18]].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="1.5" fill={goldAccent} opacity="0.5" />
                ))}
            </g>

            {/* ── Wordmark ── */}
            {showText && (
                <g transform={`translate(${emblemSize + 8}, 0)`}>
                    <text
                        x="0"
                        y={emblemSize * 0.44}
                        fontFamily="'Playfair Display', Georgia, serif"
                        fontSize={emblemSize * 0.32}
                        fontWeight="700"
                        fill={textColor}
                        letterSpacing="0.04em"
                    >
                        Rama
                    </text>
                    <text
                        x="0"
                        y={emblemSize * 0.80}
                        fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
                        fontSize={emblemSize * 0.20}
                        fontWeight="500"
                        fill={goldAccent}
                        letterSpacing="0.18em"
                    >
                        JEWELLERS
                    </text>
                </g>
            )}
        </svg>
    );
}
