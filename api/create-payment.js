// api/create-payment.js — NOWPayments invoice creation
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, description, orderId } = req.body;
  const apiKey = process.env.NOWPAYMENTS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const r = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: Number(amount),
        price_currency: 'usd',
        order_id: orderId || `AMBERRA-${Date.now()}`,
        order_description: description || 'AMBERRA Jewelry',
        success_url: 'https://www.amberrajewelry.com/shop?payment=success',
        cancel_url: 'https://www.amberrajewelry.com/shop',
        is_fixed_rate: false,
        is_fee_paid_by_user: false,
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({ error: data.message || 'Payment creation failed' });
    }

    return res.status(200).json({ invoiceUrl: data.invoice_url, invoiceId: data.id });
  } catch (err) {
    return res.status(500).json({ error: 'Network error' });
  }
}
