// scripts/generate-products.js
// Runs at Vercel build time — generates static product pages from Airtable

const fs   = require('fs');
const path = require('path');

const BASE_ID  = 'apprPtQw98iLfe0rF';
const TABLE_ID = 'tblg9KjmXRv9u0dzv';
const PAT      = process.env.AIRTABLE_PAT;
const SITE     = 'https://www.amberrajewelry.com';
const TODAY    = new Date().toISOString().slice(0, 10);
const LANGS    = ['en','ru','zh','ar','id','fr','de','es','pt','ja','ko','it','tr','hi','ka'];

// ── helpers ──────────────────────────────────────────────────────────────────

function toSlug(name) {
  return name.toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u').replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Airtable fetch ────────────────────────────────────────────────────────────

async function fetchProducts() {
  let records = [], offset = null;
  do {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?pageSize=100${offset ? '&offset=' + offset : ''}`;
    const r   = await fetch(url, { headers: { Authorization: `Bearer ${PAT}` } });
    if (!r.ok) throw new Error(`Airtable ${r.status}: ${await r.text()}`);
    const data = await r.json();
    records    = records.concat(data.records || []);
    offset     = data.offset || null;
  } while (offset);
  return records;
}

// ── HTML template ─────────────────────────────────────────────────────────────

function productHTML(p, slug) {
  const { name, cat, price, desc, img, material, props, badge } = p;
  const catLabel  = cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'Jewelry';
  const canonical = `${SITE}/products/${slug}`;
  const title     = `${name} — AMBERRA Handcrafted Amber Jewelry`;
  const metaDesc  = `${desc} Handcrafted in Bali from natural amber. ${material}. Free worldwide shipping over $200.`;

  const hreflangTags = LANGS.map(l => {
    const href = l === 'en' ? canonical : `${SITE}/${l}/products/${slug}`;
    return `<link rel="alternate" hreflang="${l}" href="${href}">`;
  }).join('\n');

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type':    'Product',
        name,
        description: desc,
        image:       img ? [img] : [],
        brand:       { '@type': 'Brand', name: 'AMBERRA' },
        material,
        category:    catLabel,
        offers: {
          '@type':        'Offer',
          price:          String(price),
          priceCurrency:  'USD',
          availability:   'https://schema.org/InStock',
          url:            canonical,
          priceValidUntil: String(new Date().getFullYear() + 1) + '-12-31',
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'US',
            returnPolicyCategory: 'https://schema.org/MerchantReturnFineSale'
          },
          seller: { '@type': 'Organization', name: 'AMBERRA', url: SITE }
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: catLabel, item: `${SITE}/shop?cat=${cat}` },
          { '@type': 'ListItem', position: 3, name, item: canonical }
        ]
      }
    ]
  }, null, 2);

  const badgeHTML = badge
    ? `<div class="pbadge ${esc(badge)}">${badge === 'bestseller' ? 'Best Seller' : badge === 'limited' ? 'Limited Edition' : 'New'}</div>`
    : '';

  const propsHTML = Object.entries(props || {}).map(([k, v]) =>
    `<div class="pp-prop"><span class="pp-pk">${esc(k)}</span><span class="pp-pv">${esc(v)}</span></div>`
  ).join('');

  const reqName = name.replace(/'/g, "\\'").replace(/"/g, '\\"');

  return `<!DOCTYPE html>
<html lang="en" translate="no">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(metaDesc)}">
<meta name="robots" content="index, follow">
<meta name="author" content="AMBERRA">
<link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
<link rel="canonical" href="${canonical}">
${hreflangTags}
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="AMBERRA">
<meta property="og:title" content="${esc(name)} — AMBERRA">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img || '')}">
<meta property="og:url" content="${canonical}">
<meta property="product:price:amount" content="${price}">
<meta property="product:price:currency" content="USD">
<script type="application/ld+json">
${schema}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Cormorant+SC:wght@300;400;500&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
<style>
.pp-nav{display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:64px;border-bottom:1px solid var(--mist);position:sticky;top:0;background:var(--white);z-index:100}
.pp-nav-back{font:300 11px/1 var(--sans);letter-spacing:.15em;text-transform:uppercase;color:var(--gray);text-decoration:none;display:flex;align-items:center;gap:8px}
.pp-nav-back:hover{color:var(--charcoal)}
.pp-nav-logo{font:400 18px/1 var(--serif);letter-spacing:.1em;color:var(--charcoal);text-decoration:none}
.pp-wrap{max-width:1100px;margin:0 auto;padding:60px 32px 100px;display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:start}
.pp-img-wrap{position:relative;background:var(--silk);overflow:hidden;aspect-ratio:3/4}
.pp-img-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .7s ease}
.pp-img-wrap:hover img{transform:scale(1.04)}
.pp-info{position:sticky;top:80px}
.pp-breadcrumb{font:300 11px/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--stone);margin-bottom:20px}
.pp-breadcrumb a{color:var(--stone);text-decoration:none}
.pp-breadcrumb a:hover{color:var(--amber)}
.pp-cat{font:300 11px/1 var(--sans);letter-spacing:.2em;text-transform:uppercase;color:var(--amber);margin-bottom:10px}
.pp-name{font:300 38px/1.1 var(--serif);color:var(--charcoal);margin:0 0 18px}
.pp-price{font:400 26px/1 var(--serif);color:var(--charcoal);margin:0 0 24px}
.pp-divider{border:none;border-top:1px solid var(--mist);margin:24px 0}
.pp-desc{font:300 15px/1.75 var(--sans);color:var(--gray);margin:0 0 20px}
.pp-material{font:300 13px/1.6 var(--sans);color:var(--stone);font-style:italic;margin:0 0 28px}
.pp-props{display:flex;flex-direction:column;gap:0;margin-bottom:36px}
.pp-prop{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--silk)}
.pp-pk{font:400 10px/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--stone)}
.pp-pv{font:300 13px/1 var(--sans);color:var(--charcoal)}
.pp-badge-wrap{margin-bottom:14px}
.pp-cta{display:block;width:100%;padding:18px;background:var(--charcoal);color:var(--white);font:400 11px/1 var(--sans);letter-spacing:.18em;text-transform:uppercase;text-align:center;border:none;cursor:pointer;transition:background .2s}
.pp-cta:hover{background:var(--amber)}
.pp-cta-ghost{display:block;width:100%;padding:15px;background:transparent;color:var(--gray);font:300 11px/1 var(--sans);letter-spacing:.15em;text-transform:uppercase;text-align:center;text-decoration:none;border:1px solid var(--mist);margin-top:10px;transition:border-color .2s,color .2s}
.pp-cta-ghost:hover{border-color:var(--charcoal);color:var(--charcoal)}
.pp-footer{text-align:center;padding:40px 32px 60px;border-top:1px solid var(--mist);margin-top:40px}
.pp-footer p{font:300 13px/1.7 var(--sans);color:var(--stone);max-width:480px;margin:0 auto 16px}
.pp-footer a{color:var(--amber);text-decoration:none}
@media(max-width:760px){.pp-wrap{grid-template-columns:1fr;gap:32px;padding:32px 20px 80px}.pp-info{position:static}.pp-name{font-size:28px}}
</style>
</head>
<body>
<nav class="pp-nav">
  <a class="pp-nav-back" href="/shop">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="15 18 9 12 15 6"/></svg>
    Shop All
  </a>
  <a class="pp-nav-logo" href="/">AMBERRA</a>
  <div style="width:80px"></div>
</nav>

<main class="pp-wrap">
  <div class="pp-img-wrap">
    <img src="${esc(img || '')}" alt="${esc(name)} — handcrafted bali jewelry — AMBERRA" loading="eager" width="600" height="800">
  </div>

  <div class="pp-info">
    <div class="pp-breadcrumb">
      <a href="/">AMBERRA</a> &rsaquo; <a href="/shop?cat=${esc(cat)}">${esc(catLabel)}</a> &rsaquo; ${esc(name)}
    </div>
    <div class="pp-cat">${esc(catLabel)}</div>
    ${badgeHTML ? `<div class="pp-badge-wrap">${badgeHTML}</div>` : ''}
    <h1 class="pp-name">${esc(name)}</h1>
    <div class="pp-price">$${price}</div>
    <hr class="pp-divider">
    <p class="pp-desc">${esc(desc)}</p>
    <p class="pp-material">${esc(material)}</p>
    ${propsHTML ? `<div class="pp-props">${propsHTML}</div>` : ''}
    <button class="pp-cta" id="req-btn">Request This Piece</button>
    <a class="pp-cta-ghost" href="/shop?cat=${esc(cat)}">View All ${esc(catLabel)}</a>
  </div>
</main>

<footer class="pp-footer">
  <p>Each AMBERRA piece is handcrafted in Bali using natural amber. Free worldwide shipping on orders over $200.</p>
  <p><a href="/shop">Browse the full collection</a> &nbsp;·&nbsp; <a href="/our-story">Our Story</a> &nbsp;·&nbsp; <a href="/contact">Contact</a></p>
</footer>

<script>
document.getElementById('req-btn').addEventListener('click', function() {
  sessionStorage.setItem('req_piece', '${reqName}');
  window.location.href = '/shop';
});
</script>
</body>
</html>`;
}

// ── sitemap update ────────────────────────────────────────────────────────────

function buildSitemap(slugs) {
  const existing = fs.readFileSync(path.join(__dirname, '../sitemap.xml'), 'utf8');

  // Remove existing product URLs if any (idempotent)
  const stripped = existing.replace(/<url>\s*<loc>[^<]*\/products\/[^<]*<\/loc>[\s\S]*?<\/url>/g, '');

  const productEntries = slugs.map(slug => `  <url>
    <loc>${SITE}/products/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

  return stripped.replace('</urlset>', `${productEntries}\n</urlset>`);
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!PAT) {
    console.warn('⚠  AIRTABLE_PAT not set — skipping product page generation');
    process.exit(0);
  }

  console.log('📦 Fetching products from Airtable…');
  let records;
  try {
    records = await fetchProducts();
  } catch (err) {
    console.error('❌ Airtable fetch failed:', err.message);
    process.exit(0); // non-fatal — deploy continues without product pages
  }

  console.log(`✓  ${records.length} products fetched`);

  const outDir = path.join(__dirname, '../products');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const slugs   = [];
  const seen    = new Set();

  for (const rec of records) {
    const f = rec.fields;
    if (!f.Name) continue;

    const props = {};
    if (f.Stone)      props.Stone      = f.Stone;
    if (f.Metal)      props.Metal      = f.Metal;
    if (f.Collection) props.Collection = f.Collection;
    if (f.Closure)    props.Closure    = f.Closure;
    if (f.Chain)      props.Chain      = f.Chain;

    const product = {
      name:     f.Name,
      cat:      (f.Category || '').toLowerCase(),
      price:    f.Price || 0,
      badge:    f.Badge || null,
      img:      f.Image || '',
      material: f.Material || '',
      desc:     f.Description || '',
      props,
    };

    let slug = toSlug(f.Name);
    // ensure uniqueness
    if (seen.has(slug)) slug = slug + '-' + slugs.length;
    seen.add(slug);
    slugs.push(slug);

    const html = productHTML(product, slug);
    fs.writeFileSync(path.join(outDir, `${slug}.html`), html, 'utf8');
  }

  console.log(`✓  ${slugs.length} product pages written to /products/`);

  // Update sitemap
  const updatedSitemap = buildSitemap(slugs);
  fs.writeFileSync(path.join(__dirname, '../sitemap.xml'), updatedSitemap, 'utf8');
  console.log(`✓  sitemap.xml updated (${slugs.length} product URLs added)`);
}

main().catch(err => {
  console.error('❌ Build script error:', err);
  process.exit(0); // non-fatal
});
