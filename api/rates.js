// /api/rates — exchange rates via frankfurter.app
// Cached in-memory for 24h (Vercel serverless warm instance)

let cache = { data: null, ts: 0 };
const TTL = 86400 * 1000; // 24h

// Base prices are in USD — we need USD→others
// frankfurter.app is EUR-based, so we fetch EUR→all and derive via USD rate
const CURRENCIES = ['USD','RUB','CNY','AED','IDR','EUR','JPY','KRW','TRY','PLN','INR','GEL'];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const now = Date.now();
  if (cache.data && now - cache.ts < TTL) {
    return res.json(cache.data);
  }

  try {
    const r = await fetch(
      `https://api.frankfurter.app/latest?base=USD&symbols=${CURRENCIES.filter(c => c !== 'USD').join(',')}`
    );
    if (!r.ok) throw new Error(`frankfurter ${r.status}`);
    const json = await r.json();

    const rates = { USD: 1, ...json.rates };
    cache = { data: rates, ts: now };
    return res.json(rates);
  } catch (e) {
    // Fallback to hardcoded rates if API fails
    const fallback = {
      USD:1, RUB:92, CNY:7.3, AED:3.67, IDR:15800,
      EUR:0.92, JPY:149, KRW:1320, TRY:32, PLN:4.0, INR:83, GEL:2.7
    };
    return res.status(200).json(fallback);
  }
}
