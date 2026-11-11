// api/create-payment.js — NOWPayments invoice creation
// Total is computed server-side from data/products.json; client sends only {id, qty, size}.
import products from '../data/products.json';
import { guard } from './_guard.js';

const PRICE_BY_ID = new Map(products.map(p => [p.id, p]));
const MAX_LINES = 30;
const MAX_QTY = 20;
const RATE = { max: 5, windowMs: 10 * 60 * 1000 };

export function priceCart(items) {
  if (!Array.isArray(items) || !items.length || items.length > MAX_LINES) return null;
  let total = 0;
  const names = [];
  for (const it of items) {
    const p = PRICE_BY_ID.get(Number(it?.id));
    const qty = Number(it?.qty ?? 1);
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return null;
    total += Number(p.price) * qty;
    const size = String(it.size || '').replace(/[^\w.\- ]/g, '').slice(0, 10);
    names.push(p.name + (size ? ` (Size ${size})` : '') + (qty > 1 ? ` ×${qty}` : ''));
  }
  return total > 0 ? { total: Math.round(total * 100) / 100, description: names.join(', ').slice(0, 500) } : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (guard(req, res, RATE)) return;

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  const cart = priceCart(req.body?.items);
  if (!cart) {
    return res.status(400).json({ error: 'Invalid cart' });
  }

  try {
    const r = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: cart.total,
        price_currency: 'usd',
        order_id: `AMBERRA-${Date.now()}`,
        order_description: cart.description,
        success_url: 'https://www.amberrajewelry.com/shop?payment=success',
        cancel_url: 'https://www.amberrajewelry.com/shop',
        is_fixed_rate: false,
        is_fee_paid_by_user: false,
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      return res.status(502).json({ error: 'Payment creation failed' });
    }

    return res.status(200).json({ invoiceUrl: data.invoice_url, invoiceId: data.id });
  } catch (err) {
    return res.status(500).json({ error: 'Network error' });
  }
}
