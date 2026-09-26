const GOLD_API_URL = 'https://www.goldapi.io/api/XAU/INR';
const GOLD_PRICE_URL = 'https://data-asg.goldprice.org/dbXRates/INR';
const GOLD_API_KEY = process.env.GOLDAPI_KEY || 'goldapi-18qrwqsmlxk4cqg-io';

export default async function handler(_request, response) {
    try {
        const goldApiResponse = await fetch(GOLD_API_URL, {
            headers: {
                'x-access-token': GOLD_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        if (!goldApiResponse.ok) throw new Error(`GoldAPI.io HTTP ${goldApiResponse.status}`);

        const data = await goldApiResponse.json();
        if (!data.price_gram_24k || !data.price_gram_22k) {
            throw new Error('GoldAPI.io returned invalid data');
        }

        return sendJson(response, {
            '24k': Math.round(data.price_gram_24k),
            '22k': Math.round(data.price_gram_22k),
            '21k': data.price_gram_21k ? Math.round(data.price_gram_21k) : null,
            '18k': data.price_gram_18k ? Math.round(data.price_gram_18k) : null,
            source: 'goldapi.io',
            currency: data.currency || 'INR'
        });
    } catch (goldApiError) {
        try {
            const fallbackResponse = await fetch(GOLD_PRICE_URL);
            if (!fallbackResponse.ok) throw new Error(`GoldPrice.org HTTP ${fallbackResponse.status}`);

            const data = await fallbackResponse.json();
            const pricePerOunce = data.items?.[0]?.xauPrice;
            if (!pricePerOunce) throw new Error('GoldPrice.org returned invalid data');

            const pricePerGram24K = pricePerOunce / 31.1035;
            return sendJson(response, {
                '24k': Math.round(pricePerGram24K),
                '22k': Math.round(pricePerGram24K * (22 / 24)),
                source: 'goldprice.org',
                currency: 'INR'
            });
        } catch (_fallbackError) {
            return sendJson(response, {
                error: 'Live rate providers unavailable',
                details: goldApiError.message
            }, 502);
        }
    }
}

function sendJson(response, body, status = 200) {
    response.status(status);
    response.setHeader('Cache-Control', 'no-store');
    return response.json(body);
}
