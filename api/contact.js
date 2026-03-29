export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const RESEND_KEY = process.env.RESEND_API_KEY;
  const TO_EMAIL   = process.env.CONTACT_EMAIL || 'hello@amberrajewelry.com';

  if (!RESEND_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const body = req.body || {};
  const { type } = body;

  let subject = '';
  let html    = '';

  if (type === 'request') {
    const { piece, name, email, phone, message } = body;
    if (!name || !email) return res.status(400).json({ error: 'name and email are required' });

    subject = `✦ New Jewelry Request — ${piece || 'General Inquiry'}`;
    html = `
<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3D3530">
  <div style="background:#3D3530;padding:24px 32px;text-align:center">
    <span style="font-family:Georgia,serif;font-size:11px;letter-spacing:.3em;color:#C49C54">AMBERRA</span>
  </div>
  <div style="padding:32px">
    <h2 style="font-size:20px;font-weight:400;margin-bottom:24px">New Jewelry Request</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr><td style="padding:8px 0;color:#888;width:130px">Piece of Interest</td><td style="padding:8px 0"><strong>${piece || '—'}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#888">Name</td><td style="padding:8px 0">${name}</td></tr>
      <tr><td style="padding:8px 0;color:#888">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#C49C54">${email}</a></td></tr>
      <tr><td style="padding:8px 0;color:#888">WhatsApp</td><td style="padding:8px 0">${phone || '—'}</td></tr>
      ${message ? `<tr><td style="padding:8px 0;color:#888;vertical-align:top">Message</td><td style="padding:8px 0">${message.replace(/\n/g,'<br>')}</td></tr>` : ''}
    </table>
  </div>
  <div style="background:#F5F0E8;padding:16px 32px;font-size:11px;color:#888;text-align:center;letter-spacing:.08em">
    AMBERRA JEWELRY · BALI, INDONESIA · amberrajewelry.com
  </div>
</div>`;

  } else if (type === 'wholesale') {
    const { name, email, company, country, partnerType, volume, message } = body;
    if (!name || !email || !company) return res.status(400).json({ error: 'required fields missing' });

    subject = `✦ Wholesale Partnership — ${company} (${country || ''})`;
    html = `
<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3D3530">
  <div style="background:#3D3530;padding:24px 32px;text-align:center">
    <span style="font-family:Georgia,serif;font-size:11px;letter-spacing:.3em;color:#C49C54">AMBERRA WHOLESALE</span>
  </div>
  <div style="padding:32px">
    <h2 style="font-size:20px;font-weight:400;margin-bottom:24px">New Partnership Request</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr><td style="padding:8px 0;color:#888;width:150px">Company</td><td style="padding:8px 0"><strong>${company}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#888">Contact Name</td><td style="padding:8px 0">${name}</td></tr>
      <tr><td style="padding:8px 0;color:#888">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#C49C54">${email}</a></td></tr>
      <tr><td style="padding:8px 0;color:#888">Country</td><td style="padding:8px 0">${country || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#888">Partner Type</td><td style="padding:8px 0">${partnerType || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#888">Est. Volume</td><td style="padding:8px 0">${volume || '—'}</td></tr>
      ${message ? `<tr><td style="padding:8px 0;color:#888;vertical-align:top">Message</td><td style="padding:8px 0">${message.replace(/\n/g,'<br>')}</td></tr>` : ''}
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
