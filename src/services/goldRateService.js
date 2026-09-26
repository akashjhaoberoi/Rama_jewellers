// ============================================
// Live Gold Rate Service
// Primary: GoldAPI.io (real-time INR rates)
// Requests go through Vite proxy to bypass CORS
// ============================================
import { ref, set, get } from 'firebase/database';
import { database } from '../firebase';

// ---- GoldAPI.io Configuration ----
const GOLDAPI_KEY = 'goldapi-18qrwqsmlxk4cqg-io';

// Use Vite proxy paths (see vite.config.js)
// /goldapi → proxied to https://www.goldapi.io/api
// /goldprice → proxied to https://data-asg.goldprice.org
const GOLDAPI_PROXY = '/goldapi/XAU/INR';
const GOLDPRICE_PROXY = '/goldprice/dbXRates/INR';

// In-memory cache (avoids burning free-tier quota)
let cachedRates = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute

/**
 * PRIMARY SOURCE: GoldAPI.io (via Vite proxy)
 * Returns price_gram_24k, price_gram_22k directly in INR
 */
async function fetchFromGoldAPI() {
    const response = await fetch(GOLDAPI_PROXY, {
        headers: {
            'x-access-token': GOLDAPI_KEY,
            'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(`GoldAPI.io HTTP ${response.status}: ${errorBody}`);
    }

    const data = await response.json();

    if (data.price_gram_24k && data.price_gram_22k) {
        return {
            '24k': Math.round(data.price_gram_24k),
            '22k': Math.round(data.price_gram_22k),
            '21k': data.price_gram_21k ? Math.round(data.price_gram_21k) : null,
            '18k': data.price_gram_18k ? Math.round(data.price_gram_18k) : null,
            source: 'goldapi.io',
            currency: data.currency || 'INR'
        };
    }

    throw new Error('GoldAPI.io returned invalid data');
}

/**
 * FALLBACK SOURCE: GoldPrice.org (via Vite proxy, no key needed)
 */
async function fetchFromGoldPriceOrg() {
    const response = await fetch(GOLDPRICE_PROXY, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) throw new Error(`GoldPrice.org HTTP ${response.status}`);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
        const pricePerOunce = data.items[0].xauPrice;
        const pricePerGram24K = pricePerOunce / 31.1035;
        return {
            '24k': Math.round(pricePerGram24K),
            '22k': Math.round(pricePerGram24K * (22 / 24)),
            source: 'goldprice.org'
        };
    }
    throw new Error('Invalid data from GoldPrice.org');
}

/**
 * Main: Fetch live gold rates with fallback chain
 * GoldAPI.io → GoldPrice.org → Firebase stored → hardcoded
 */
export async function fetchLiveGoldRates() {
    // Return cached if fresh
    if (cachedRates && (Date.now() - lastFetchTime) < CACHE_DURATION) {
        return cachedRates;
    }

    // Respect admin manual override
    const storedRates = await getStoredGoldRates();
    if (storedRates?.manualOverride) {
        cachedRates = storedRates;
        lastFetchTime = Date.now();
        return storedRates;
    }

    // Try each source in order
    const sources = [
        { name: 'GoldAPI.io', fn: fetchFromGoldAPI },
        { name: 'GoldPrice.org', fn: fetchFromGoldPriceOrg }
    ];

    for (const source of sources) {
        try {
            console.log(`⏳ Fetching gold rate from ${source.name}...`);
            const result = await source.fn();

            // Sanity check: ₹5k–₹25k per gram is reasonable for 2024-2030
            if (result['24k'] < 5000 || result['24k'] > 25000) {
                console.warn(`⚠️ ${source.name} returned suspicious rate: ₹${result['24k']}/g`);
                continue;
            }

            const rates = {
                '24k': result['24k'],
                '22k': result['22k'],
                '21k': result['21k'] || null,
                '18k': result['18k'] || null,
                lastUpdated: Date.now(),
                source: result.source
            };

            console.log(`✅ Live gold: 24K ₹${rates['24k']}/g • 22K ₹${rates['22k']}/g (${source.name})`);

            cachedRates = rates;
            lastFetchTime = Date.now();
            await saveGoldRatesToFirebase(rates);
            return rates;
        } catch (error) {
            console.warn(`❌ ${source.name} failed:`, error.message);
        }
    }

    // All live sources failed — use stored rates (but NOT if they're the old fallback)
    if (storedRates && storedRates['24k'] > 0 && storedRates.source !== 'fallback') {
        console.warn('⚠️ Using previously stored rates from Firebase');
        cachedRates = storedRates;
        lastFetchTime = Date.now();
        return storedRates;
    }

    // Absolute last resort
    return { '24k': 7800, '22k': 7150, lastUpdated: Date.now(), source: 'fallback' };
}

/** Save gold rates to Firebase */
export async function saveGoldRatesToFirebase(rates) {
    try {
        await set(ref(database, 'goldRates'), rates);
    } catch (error) {
        console.error('Failed to save gold rates:', error);
    }
}

/** Get stored gold rates from Firebase */
export async function getStoredGoldRates() {
    try {
        const snapshot = await get(ref(database, 'goldRates'));
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error('Failed to get stored gold rates:', error);
        return null;
    }
}

/** Admin: manually override gold rates */
export async function setManualGoldRates(rate24k, rate22k) {
    const rates = {
        '24k': Number(rate24k),
        '22k': Number(rate22k),
        lastUpdated: Date.now(),
        manualOverride: true,
        source: 'admin-manual'
    };
    cachedRates = rates;
    lastFetchTime = Date.now();
    await saveGoldRatesToFirebase(rates);
    return rates;
}

/** Clear manual override (resumes live fetching) */
export async function clearManualOverride() {
    cachedRates = null;
    lastFetchTime = 0;
    return await fetchLiveGoldRates();
}

// ============================================
// SILVER RATE MANAGEMENT (Admin-only, no API)
// ============================================

/** Get stored silver rates from Firebase */
export async function getStoredSilverRates() {
    try {
        const snapshot = await get(ref(database, 'silverRates'));
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error('Failed to get silver rates:', error);
        return null;
    }
}

/** Admin: set silver rate per gram */
export async function setManualSilverRates(rate999, rate925) {
    const rates = {
        '999': Number(rate999),
        '925': Number(rate925),
        lastUpdated: Date.now(),
        source: 'admin-manual'
    };
    try {
        await set(ref(database, 'silverRates'), rates);
    } catch (error) {
        console.error('Failed to save silver rates:', error);
    }
    return rates;
}

/**
 * Calculate jewelry price (works for both gold & silver)
 * Formula: (metalRate × (weight + wastage)) + makingCharge + tax%
 */
export function calculateJewelryPrice(metalRate, weightInGrams, wastageInGrams, makingCharge, taxPercentage) {
    const metalCost = metalRate * (weightInGrams + wastageInGrams);
    const subtotal = metalCost + makingCharge;
    const tax = (subtotal * taxPercentage) / 100;
    return Math.round(subtotal + tax);
}

/**
 * Helper: get the correct rate for a product based on its metal type and purity
 */
export function getProductRate(product, goldRates, silverRates) {
    if (product.metalType === 'silver') {
        const purity = product.silverPurity || '925';
        return silverRates?.[purity] || 0;
    }
    // Default: gold
    return product.goldType === '24K'
        ? (goldRates?.['24k'] || 0)
        : (goldRates?.['22k'] || 0);
}

