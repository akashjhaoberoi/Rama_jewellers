const GOLD_API_URL = 'https://www.goldapi.io/api/XAU/INR';
const GOLD_PRICE_URL = 'https://data-asg.goldprice.org/dbXRates/INR';
const GOLD_API_KEY = process.env.GOLDAPI_KEY || 'goldapi-18qrwqsmlxk4cqg-io';

exports.handler = async () => {
    try {
        const response = await fetch(GOLD_API_URL, {
            headers: {
                'x-access-token': GOLD_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`GoldAPI.io HTTP ${response.status}`);

        const data = await response.json();
        if (!data.price_gram_24k || !data.price_gram_22k) {
            throw new Error('GoldAPI.io returned invalid data');
        }

        return jsonResponse({
            '24k': Math.round(data.price_gram_24k),
            '22k': Math.round(data.price_gram_22k),
            '21k': data.price_gram_21k ? Math.round(data.price_gram_21k) : null,
            '18k': data.price_gram_18k ? Math.round(data.price_gram_18k) : null,
            source: 'goldapi.io',
            currency: data.currency || 'INR'
        });
    } catch (goldApiError) {
        try {
            const response = await fetch(GOLD_PRICE_URL);
            if (!response.ok) throw new Error(`GoldPrice.org HTTP ${response.status}`);

            const data = await response.json();
            const pricePerOunce = data.items?.[0]?.xauPrice;
            if (!pricePerOunce) throw new Error('GoldPrice.org returned invalid data');

            const pricePerGram24K = pricePerOunce / 31.1035;
            return jsonResponse({
                '24k': Math.round(pricePerGram24K),
                '22k': Math.round(pricePerGram24K * (22 / 24)),
                source: 'goldprice.org',
                currency: 'INR'
            });
        } catch (fallbackError) {
            return jsonResponse({
                error: 'Live rate providers unavailable',
                details: goldApiError.message
            }, 502);
        }
    }
};

function jsonResponse(body, statusCode = 200) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        },
        body: JSON.stringify(body)
    };
}
