// api/_guard.js — shared request guards (underscore = not deployed as a function)

// ponytail: per-instance in-memory limiter; cold starts/parallel instances reset it.
// Upgrade to Vercel KV / Upstash if abuse gets past this.
const hits = new Map();

export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  try { return new URL(origin).host === host; } catch { return false; }
}

export function rateLimited(req, max, windowMs) {
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > max;
}

// Returns true if the request was rejected (response already sent).
export function guard(req, res, { max, windowMs }) {
  if (!sameOrigin(req)) { res.status(403).json({ error: 'Forbidden' }); return true; }
  if (rateLimited(req, max, windowMs)) {
    res.setHeader('Retry-After', String(Math.ceil(windowMs / 1000)));
    res.status(429).json({ error: 'Too many requests' });
    return true;
  }
  return false;
}
