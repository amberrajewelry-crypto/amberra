// scripts/generate-collections.js
// Generates story-driven collection landing pages (/collections/{slug}) with a
// real, crawlable product grid filtered by props.Collection. Shell (nav/footer)
// is lifted from our-story.html so it stays in sync. Slugs match generate-products
// (same toSlug + assignSlugs order on the same product source).
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const SITE = 'https://www.amberrajewelry.com';
const CSSVER   = '20260830';

function toSlug(name) {
  return name.toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u').replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '');
}
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function assignSlugs(products) {
  const seen = [];
  for (const p of products) {
    if (!p.name) continue;
    let slug = toSlug(p.name);
    if (seen.includes(slug)) slug = slug + '-' + seen.length;
    seen.push(slug); p.slug = slug;
  }
  return products;
}
function loadProducts() {
  for (const f of ['/tmp/products.json', path.join(ROOT, 'data', 'products.json'), path.join(ROOT, 'products.json')]) {
    try { const raw = JSON.parse(fs.readFileSync(f, 'utf8')); const arr = Array.isArray(raw) ? raw : (raw.products || raw.records || []); if (arr.length) return arr; } catch {}
  }
  return [];
}

// Story + which props.Collection buckets belong to each landing.
const COLLS = [
  { slug: 'solar', label: 'The Solar Collection', lbl: 'Warmth & Light',
    buckets: ['Solar', 'Aurora', 'Halo'],
    desc: 'The Solar Collection by AMBERRA — cognac and honey Baltic amber that holds the stored light of the sun. Handcrafted.',
    s1: 'Amber begins as sunlight caught in resin. The Solar Collection celebrates that origin — cognac, honey and butterscotch stones chosen for the way they glow from within, like a low afternoon sun held in the hand.',
    s2: 'Set in warm 925 sterling silver, each Solar piece is made to catch and hold light. Wear it when you want to carry a little brightness with you.' },
  { slug: 'sacred', label: 'The Sacred Collection', lbl: 'Ritual & Protection',
    buckets: ['Sacred', 'Temple', 'Moon', 'Lotus', 'Eternal', 'Lucky', 'Wings', 'East', 'Cosmos'],
    desc: 'The Sacred Collection by AMBERRA — natural Baltic amber pieces in 925 sterling silver, worn for protection and intention. Handmade by our artisans.',
    s1: 'Amber is believed to carry protective energy — a stone of grounding and quiet power. The Sacred Collection gathers our most symbolic pieces, each finished with care before it leaves the atelier.',
    s2: 'These are pieces to be worn with intention: for a threshold, a blessing, a beginning. Deep cherry and dark cognac amber set in hand-forged silver.' },
  { slug: 'botanica', label: 'The Botanica Collection', lbl: 'Nature & Growth',
    buckets: ['Bloom', 'Raw Nature', 'Nature', 'Iris', 'Mosaic', 'Ocean'],
    desc: 'The Botanica Collection by AMBERRA — organic leaf and blossom forms in green and honey Baltic amber. Handcrafted.',
    s1: 'Amber is fossilised forest — forty million years of leaves, insects and light. The Botanica Collection returns to that origin with organic forms: petals, leaves and vines in green and honey amber.',
    s2: 'Each piece feels grown rather than made, alive with tiny inclusions. For those drawn to the natural world and its quiet, imperfect beauty.' },
];

function absImg(img) { return img && img.startsWith('/') ? img : '/' + (img || ''); }
function card(p) {
  const price = '$' + p.price;
  return `      <a class="coll-card" href="/products/${esc(p.slug)}">
        <span class="coll-card-img"><img src="${esc(absImg(p.img))}" alt="${esc(p.name)} — AMBERRA amber jewelry" loading="lazy" width="300" height="300"></span>
        <span class="coll-card-cat">${esc(p.cat)}</span>
        <span class="coll-card-name">${esc(p.name)}</span>
        <span class="coll-card-price" data-usd="${p.price}">${price}</span>
      </a>`;
}

function build() {
  const products = assignSlugs(loadProducts());
  const lines = fs.readFileSync(path.join(ROOT, 'our-story.html'), 'utf8').split('\n');
  const FS = lines.findIndex(l => l.includes('<section'));
  const FF = lines.findIndex(l => l.includes('<footer>'));
  const top0 = lines.slice(0, FS).join('\n');
  const bottom = lines.slice(FF).join('\n');
  fs.mkdirSync(path.join(ROOT, 'collections'), { recursive: true });
  const sitemapUrls = [];

  for (const c of COLLS) {
    const picks = products.filter(p => c.buckets.includes((p.props && p.props.Collection) || ''));
    const url = SITE + '/collections/' + c.slug;
    let top = top0
      .split(SITE + '/our-story').join(url)
      .replace(/<title>[^<]*<\/title>/, `<title>${c.label} — AMBERRA Amber Jewelry Bali</title>`)
      .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(c.desc)}"`)
      .replace(/(og:title" content=")[^"]*"/, `$1${c.label} — AMBERRA"`)
      .replace(/(href=")(style\.css|amberra\.css)/g, '$1/$2')
      .replace(/(src=")(app|shop|amberra-nav|chat-widget)\.js/g, '$1/$2.js')
      .replace(/\?v=[0-9a-z]+/g, '?v=' + CSSVER);

    const grid = picks.length
      ? `<section id="coll-grid" style="max-width:1200px;margin:0 auto;padding:8px 6vw 72px">
  <div class="coll-grid">
${picks.map(card).join('\n')}
  </div>
</section>`
      : '';

    const main = `<section id="coll-hero" style="text-align:center;padding:72px 6vw 18px">
  <span class="s-lbl">${c.lbl}</span>
  <h1 class="s-title" style="margin-top:12px">${c.label}</h1>
</section>
<section style="max-width:640px;margin:0 auto;padding:12px 6vw 40px">
  <p class="s-body" style="margin-bottom:22px">${c.s1}</p>
  <p class="s-body">${c.s2}</p>
</section>
${grid}
<section style="text-align:center;padding:8px 6vw 64px">
  <a class="btn-s" href="/shop">Explore All Pieces</a>
</section>`;

    // ItemList schema for the collection's products
    const itemList = picks.length ? `
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'CollectionPage', name: c.label, description: c.desc, url,
  mainEntity: { '@type': 'ItemList', numberOfItems: picks.length,
    itemListElement: picks.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + '/products/' + p.slug, name: p.name })) },
}, null, 0)}
</script>` : '';
    top = top.replace('</head>', itemList + '\n</head>');

    fs.writeFileSync(path.join(ROOT, 'collections', c.slug + '.html'), top + '\n' + main + '\n' + bottom);
    console.log(`  ✓ collections/${c.slug}.html (${picks.length} pieces)`);
    sitemapUrls.push('/collections/' + c.slug);
  }

  // keep collection URLs in sitemap
  const smPath = path.join(ROOT, 'sitemap.xml');
  try {
    let sm = fs.readFileSync(smPath, 'utf8');
    sm = sm.replace(/\s*<url>\s*<loc>[^<]*\/collections\/[a-z-]+<\/loc>[\s\S]*?<\/url>\s*/g, '');
    const entries = sitemapUrls.map(u => `  <url>\n    <loc>${SITE}${u}</loc>\n    <lastmod>2026-07-27</lastmod>\n  </url>`).join('\n');
    sm = sm.replace('</urlset>', entries + '\n</urlset>');
    fs.writeFileSync(smPath, sm);
  } catch (e) { console.warn('sitemap update skipped:', e.message); }
  console.log(`Done: ${COLLS.length} collection pages.`);
}
build();
