// /api/rates — exchange rates via frankfurter.app
// Cached in-memory for 24h (Vercel serverless warm instance)

let cache = { data: null, ts: 0 };
const TTL = 86400 * 1000; // 24h

// Currencies supported by frankfurter.app (RUB removed due to sanctions, GEL not available)
const FRANKFURTER_CURRENCIES = ['CNY','AED','IDR','EUR','JPY','KRW','TRY','PLN','INR'];

// Hardcoded rates for currencies not available on frankfurter.app
// RUB: removed from frankfurter in 2022 (EU sanctions)
// GEL: Georgian Lari, not on frankfurter
const HARDCODED_RATES = {
  RUB: 92,
  GEL: 2.72,
};

// Full fallback if frankfurter fetch fails entirely
const FALLBACK_RATES = {
  USD:1, RUB:92, CNY:7.3, AED:3.67, IDR:15800,
  EUR:0.92, JPY:149, KRW:1320, TRY:32, PLN:4.0, INR:83, GEL:2.72
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const now = Date.now();
  if (cache.data && now - cache.ts < TTL) {
    return res.json(cache.data);
  }

  try {
    const r = await fetch(
      `https://api.frankfurter.app/latest?base=USD&symbols=${FRANKFURTER_CURRENCIES.join(',')}`
    );
    if (!r.ok) throw new Error(`frankfurter ${r.status}`);
    const json = await r.json();

    // Merge: frankfurter rates + hardcoded unsupported currencies
    const rates = { USD: 1, ...json.rates, ...HARDCODED_RATES };
    cache = { data: rates, ts: now };
    return res.json(rates);
  } catch (e) {
    return res.status(200).json(FALLBACK_RATES);
  }
}
