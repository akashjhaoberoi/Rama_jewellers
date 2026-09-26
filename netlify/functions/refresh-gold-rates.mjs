// Scheduled function: keeps the cached gold rate in Firebase fresh automatically,
// so the site always has a recent live rate even before any visitor triggers a fetch.
const GOLD_API_URL = 'https://www.goldapi.io/api/XAU/INR';
const GOLD_PRICE_URL = 'https://data-asg.goldprice.org/dbXRates/INR';
const FIREBASE_RATES_URL = 'https://ramajwl-62851-default-rtdb.firebaseio.com/goldRates.json';

async function fetchGoldRates() {
    try {
        const response = await fetch(GOLD_API_URL, {
            headers: {
                'x-access-token': process.env.GOLDAPI_KEY,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`GoldAPI.io HTTP ${response.status}`);

        const data = await response.json();
        if (!data.price_gram_24k || !data.price_gram_22k) {
            throw new Error('GoldAPI.io returned invalid data');
        }

        return {
            '24k': Math.round(data.price_gram_24k),
            '22k': Math.round(data.price_gram_22k),
            '21k': data.price_gram_21k ? Math.round(data.price_gram_21k) : null,
            '18k': data.price_gram_18k ? Math.round(data.price_gram_18k) : null,
            source: 'goldapi.io'
        };
    } catch (goldApiError) {
        const response = await fetch(GOLD_PRICE_URL);
        if (!response.ok) throw new Error(`GoldPrice.org HTTP ${response.status}`);

        const data = await response.json();
        const pricePerOunce = data.items?.[0]?.xauPrice;
        if (!pricePerOunce) throw new Error('GoldPrice.org returned invalid data');

        const pricePerGram24K = pricePerOunce / 31.1035;
        return {
            '24k': Math.round(pricePerGram24K),
            '22k': Math.round(pricePerGram24K * (22 / 24)),
            source: 'goldprice.org'
        };
    }
}

export default async () => {
    try {
        const rates = await fetchGoldRates();
        await fetch(FIREBASE_RATES_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...rates, lastUpdated: Date.now() })
        });
        console.log(`Gold rates refreshed from ${rates.source}: 24k=${rates['24k']} 22k=${rates['22k']}`);
    } catch (error) {
        console.error('Scheduled gold rate refresh failed:', error.message);
    }
};

export const config = {
    schedule: '@hourly'
};
