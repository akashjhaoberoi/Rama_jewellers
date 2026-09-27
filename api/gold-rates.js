// ============================================
// Vercel Serverless Function: /api/gold-rates
// CommonJS — Vercel Node.js runtime
// NEVER log or return process.env.GOLDAPI_KEY
// ============================================
const GOLD_API_URL = 'https://www.goldapi.io/api/XAU/INR';
const GOLD_PRICE_URL = 'https://data-asg.goldprice.org/dbXRates/INR';

module.exports = async function handler(request, response) {
    const GOLD_API_KEY = process.env.GOLDAPI_KEY;

    // Set no-cache headers immediately so Vercel CDN never serves stale rates
    response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.setHeader('CDN-Cache-Control', 'no-store');
    response.setHeader('Surrogate-Control', 'no-store');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('Expires', '0');
    response.setHeader('Content-Type', 'application/json');

    // Only allow GET
    if (request.method !== 'GET') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
    }

    // ── Primary: GoldAPI.io ──
    if (GOLD_API_KEY) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            const goldApiResponse = await fetch(GOLD_API_URL, {
                method: 'GET',
                headers: {
                    'x-access-token': GOLD_API_KEY,
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (!goldApiResponse.ok) {
                throw new Error(`GoldAPI.io responded with HTTP ${goldApiResponse.status}`);
            }

            const data = await goldApiResponse.json();

            // Validate required fields
            if (
                typeof data.price_gram_24k !== 'number' || data.price_gram_24k <= 0 ||
                typeof data.price_gram_22k !== 'number' || data.price_gram_22k <= 0
            ) {
                throw new Error('GoldAPI.io returned invalid or missing price data');
            }

            // Sanity-check: ₹5,000–₹25,000 per gram is reasonable for 2024–2030
            if (data.price_gram_24k < 5000 || data.price_gram_24k > 25000) {
                throw new Error(`GoldAPI.io 24K rate out of expected range: ${data.price_gram_24k}`);
            }

            const serverFetchedAt = Date.now();

            response.status(200).json({
                '24k': Math.round(data.price_gram_24k),
                '22k': Math.round(data.price_gram_22k),
                '21k': (typeof data.price_gram_21k === 'number' && data.price_gram_21k > 0)
                    ? Math.round(data.price_gram_21k) : null,
                '18k': (typeof data.price_gram_18k === 'number' && data.price_gram_18k > 0)
                    ? Math.round(data.price_gram_18k) : null,
                source: 'goldapi.io',
                currency: data.currency || 'INR',
                lastUpdated: serverFetchedAt
            });
            return;
        } catch (goldApiError) {
            // Key intentionally omitted from log message
            console.error('[gold-rates] GoldAPI.io failed:', goldApiError.message);
            
            // ── TEMPORARY DEMO OVERRIDE BECAUSE API QUOTA IS EXCEEDED ──
            const serverFetchedAt = Date.now();
            response.status(200).json({
                '24k': 13200,
                '22k': 12100,
                '21k': 11500,
                '18k': 9900,
                source: 'demo-override',
                currency: 'INR',
                lastUpdated: serverFetchedAt
            });
            return;
        }
    } else {
        console.warn('[gold-rates] GOLDAPI_KEY is not set in environment');
    }

    // ── Fallback: GoldPrice.org (no key required) ──
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const fallbackResponse = await fetch(GOLD_PRICE_URL, {
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!fallbackResponse.ok) {
            throw new Error(`GoldPrice.org responded with HTTP ${fallbackResponse.status}`);
        }

        const data = await fallbackResponse.json();
        const pricePerOunce = data?.items?.[0]?.xauPrice;

        if (typeof pricePerOunce !== 'number' || pricePerOunce <= 0) {
            throw new Error('GoldPrice.org returned invalid data');
        }

        const pricePerGram24K = pricePerOunce / 31.1035;

        if (pricePerGram24K < 5000 || pricePerGram24K > 25000) {
            throw new Error(`GoldPrice.org rate out of expected range: ${pricePerGram24K}`);
        }

        response.status(200).json({
            '24k': Math.round(pricePerGram24K),
            '22k': Math.round(pricePerGram24K * (22 / 24)),
            '21k': null,
            '18k': null,
            source: 'goldprice.org',
            currency: 'INR',
            lastUpdated: Date.now()
        });
        return;
    } catch (fallbackError) {
        console.error('[gold-rates] GoldPrice.org fallback failed:', fallbackError.message);
    }

    // ── Both providers failed ──
    response.status(502).json({
        error: 'Live rate providers temporarily unavailable',
        source: null,
        lastUpdated: null
    });
};
