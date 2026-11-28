// Vercel Routing Middleware: first visit → open the site in the device language.
// Order: saved choice (cookie amb_lang, set by the footer language switcher) →
// Accept-Language (device/browser language) → English. Crawlers are never
// redirected (they get hreflang alternates instead).
export const config = {
  matcher: ['/', '/((?!api/|(?:ru|de|fr|es|it|pt|tr|ar|zh|ja|ko|id|hi|ka)/|_vercel|images/|vendor/|js/|models/|audio/|i18n/|data/|fonts/).*)'],
};

const LANGS = ['ru', 'de', 'fr', 'es', 'it', 'pt', 'tr', 'ar', 'zh', 'ja', 'ko', 'id', 'hi', 'ka'];
const SUPPORTED = new Set(['en', ...LANGS]);
const BOT = /bot|crawl|spider|slurp|bingpreview|lighthouse|pagespeed|facebookexternalhit|whatsapp|telegram|preview|headless/i;
const ROOT_PAGES = new Set(['/', '/shop', '/rings', '/earrings', '/pendants', '/bracelets', '/chains', '/amber',
  '/amber-rings', '/artisan-jewelry', '/bali-jewelry', '/handmade-sterling-silver-jewelry',
  '/sterling-silver-amber-jewelry', '/amber-jewellery-australia', '/contact', '/cookies', '/faq', '/journal',
  '/our-story', '/privacy', '/services', '/shipping', '/stores', '/terms', '/tryon', '/wholesale']);
const SECTION = /^\/(products|journal|collections|amber|shop)\/[a-z0-9-]+$/;

export function pickLang(acceptLanguage) {
  const prefs = String(acceptLanguage || '')
    .split(',')
    .map((part, i) => {
      const [tag, ...params] = part.trim().toLowerCase().split(';');
      const q = params.map(p => p.trim()).find(p => p.startsWith('q='));
      return { lang: tag.split('-')[0], q: q ? parseFloat(q.slice(2)) || 0 : 1, i };
    })
    .filter(p => p.lang && p.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i);
  const hit = prefs.find(p => SUPPORTED.has(p.lang));
  return hit ? hit.lang : 'en';
}

export default function middleware(request) {
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '') || '/';
  if (!ROOT_PAGES.has(path) && !SECTION.test(path)) return;
  const ua = request.headers.get('user-agent') || '';
  if (BOT.test(ua)) return;
  const cookie = (request.headers.get('cookie') || '').match(/(?:^|;\s*)amb_lang=([a-z]{2})/);
  const lang = cookie ? cookie[1] : pickLang(request.headers.get('accept-language'));
  if (!LANGS.includes(lang)) return;
  const target = new URL(`/${lang}${path === '/' ? '' : path}${url.search}`, url);
  return new Response(null, {
    status: 307,
    headers: {
      Location: target.toString(),
      'Cache-Control': 'private, no-store',
      Vary: 'Accept-Language, Cookie',
    },
  });
}
