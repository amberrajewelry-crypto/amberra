// Geo-detect by IP via Vercel's x-vercel-ip-country header. No external API, no cost.
// Returns the ISO country code so the client can map it to a UI language.
export default function handler(req, res) {
  // x-vercel-ip-country is injected by Vercel at the edge (ISO-3166 alpha-2).
  const country = (req.headers['x-vercel-ip-country'] || '').toUpperCase();
  // per-visitor answer: never cache at the shared edge (it served the first visitor's country to everyone)
  res.setHeader('Cache-Control', 'private, no-store');
  res.status(200).json({ country });
}
