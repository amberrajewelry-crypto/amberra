// Geo-detect by IP via Vercel's x-vercel-ip-country header. No external API, no cost.
// Returns the ISO country code so the client can map it to a UI language.
export default function handler(req, res) {
  // x-vercel-ip-country is injected by Vercel at the edge (ISO-3166 alpha-2).
  const country = (req.headers['x-vercel-ip-country'] || '').toUpperCase();
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  res.status(200).json({ country });
}
