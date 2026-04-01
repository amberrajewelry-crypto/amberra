export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ['https://www.amberrajewelry.com', 'https://amberrajewelry.com'];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.amberrajewelry.com');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const RESEND_KEY = process.env.RESEND_API_KEY;
  const TO_EMAIL   = process.env.CONTACT_EMAIL || 'hello@amberrajewelry.com';
  const TS_SECRET  = process.env.TURNSTILE_SECRET;

  if (!RESEND_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const body = req.body || {};
  const { type } = body;

  // ── Turnstile bot verification ──
  if (TS_SECRET) {
    const tsToken = body.turnstile || '';
    if (!tsToken) {
      return res.status(403).json({ error: 'Security check required' });
    }
    try {
      const tsRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${encodeURIComponent(TS_SECRET)}&response=${encodeURIComponent(tsToken)}`
      });
      const tsData = await tsRes.json();
      if (!tsData.success) {
        return res.status(403).json({ error: 'Bot detected' });
      }
    } catch (e) {
      // If Turnstile API is down, allow through to not block real users
    }
  }

  function escHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  let subject = '';
  let html    = '';

  if (type === 'request') {
    const { piece, name, email, phone, message } = body;
    if (!name || !email) return res.status(400).json({ error: 'name and email are required' });

    subject = `✦ New Jewelry Request — ${escHtml(piece) || 'General Inquiry'}`;
    html = `
<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3D3530">
  <div style="background:#3D3530;padding:24px 32px;text-align:center">
    <span style="font-family:Georgia,serif;font-size:11px;letter-spacing:.3em;color:#C49C54">AMBERRA</span>
  </div>
  <div style="padding:32px">
    <h2 style="font-size:20px;font-weight:400;margin-bottom:24px">New Jewelry Request</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr><td style="padding:8px 0;color:#888;width:130px">Piece of Interest</td><td style="padding:8px 0"><strong>${escHtml(piece) || '—'}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#888">Name</td><td style="padding:8px 0">${escHtml(name)}</td></tr>
      <tr><td style="padding:8px 0;color:#888">Email</td><td style="padding:8px 0"><a href="mailto:${escHtml(email)}" style="color:#C49C54">${escHtml(email)}</a></td></tr>
      <tr><td style="padding:8px 0;color:#888">WhatsApp</td><td style="padding:8px 0">${escHtml(phone) || '—'}</td></tr>
      ${message ? `<tr><td style="padding:8px 0;color:#888;vertical-align:top">Message</td><td style="padding:8px 0">${escHtml(message).replace(/\n/g,'<br>')}</td></tr>` : ''}
    </table>
  </div>
  <div style="background:#F5F0E8;padding:16px 32px;font-size:11px;color:#888;text-align:center;letter-spacing:.08em">
    AMBERRA JEWELRY · BALI, INDONESIA · amberrajewelry.com
  </div>
</div>`;

  } else if (type === 'wholesale') {
    const { name, email, company, country, partnerType, volume, message } = body;
    if (!name || !email || !company) return res.status(400).json({ error: 'required fields missing' });

    subject = `✦ Wholesale Partnership — ${escHtml(company)} (${escHtml(country) || ''})`;
    html = `
<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3D3530">
  <div style="background:#3D3530;padding:24px 32px;text-align:center">
    <span style="font-family:Georgia,serif;font-size:11px;letter-spacing:.3em;color:#C49C54">AMBERRA WHOLESALE</span>
  </div>
  <div style="padding:32px">
    <h2 style="font-size:20px;font-weight:400;margin-bottom:24px">New Partnership Request</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr><td style="padding:8px 0;color:#888;width:150px">Company</td><td style="padding:8px 0"><strong>${escHtml(company)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#888">Contact Name</td><td style="padding:8px 0">${escHtml(name)}</td></tr>
      <tr><td style="padding:8px 0;color:#888">Email</td><td style="padding:8px 0"><a href="mailto:${escHtml(email)}" style="color:#C49C54">${escHtml(email)}</a></td></tr>
      <tr><td style="padding:8px 0;color:#888">Country</td><td style="padding:8px 0">${escHtml(country) || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#888">Partner Type</td><td style="padding:8px 0">${escHtml(partnerType) || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#888">Est. Volume</td><td style="padding:8px 0">${escHtml(volume) || '—'}</td></tr>
      ${message ? `<tr><td style="padding:8px 0;color:#888;vertical-align:top">Message</td><td style="padding:8px 0">${escHtml(message).replace(/\n/g,'<br>')}</td></tr>` : ''}
    </table>
  </div>
  <div style="background:#F5F0E8;padding:16px 32px;font-size:11px;color:#888;text-align:center;letter-spacing:.08em">
    AMBERRA JEWELRY · BALI, INDONESIA · amberrajewelry.com
  </div>
</div>`;

  } else {
    return res.status(400).json({ error: 'Unknown form type' });
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'AMBERRA <noreply@amberrajewelry.com>',
        to: [TO_EMAIL],
        reply_to: body.email || undefined,
        subject,
        html
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data.message || 'Send failed' });

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
