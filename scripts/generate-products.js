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

// Snipcart public API key — injected at build time. Store stays inert (button
// present, cart won't open) until the owner sets a real key. Set via env:
//   SNIPCART_PUBLIC_KEY=... vercel build
const SNIPCART_KEY = process.env.SNIPCART_PUBLIC_KEY || 'REPLACE_WITH_SNIPCART_PUBLIC_KEY';
const SNIPCART_VER = 'v3.7.1';

// Size options per category → Snipcart custom field. Mirrors shop.js
// buildSizeSelector. First value is the default. Earrings = one size (no field).
function sizeOptions(cat) {
  switch (cat) {
    case 'rings':     return 'US 7|US 5|US 6|US 8|US 9';
    case 'bracelets': return 'M (17cm)|XS (15cm)|S (16cm)|L (18cm)|XL (19cm)';
    case 'pendants':
    case 'chains':    return '45cm|40cm|50cm|55cm|60cm';
    default:          return null; // earrings & misc — one size
  }
}

const TYPE_NOUN = { rings: 'Ring', earrings: 'Earrings', pendants: 'Pendant', bracelets: 'Bracelet', chains: 'Chain' };
// Local webp product images (NUM.webp) — used to upgrade Airtable's /img/NUM.jpg URLs.
const _WEBP_NUMS = new Set((() => { try { return fs.readdirSync(path.join(__dirname, '..', 'images', 'products')).map(f => (f.match(/(\d+)\.webp/) || [])[1]).filter(Boolean); } catch { return []; } })());
function absImg(img) {
  if (!img) return '';
  let u = String(img);
  // Normalize bare/canonical host → www (matches canonical, kills host-mismatch for OG/schema).
  u = u.replace(/^https?:\/\/(www\.)?amberra-jewelry\.com\//i, 'https://www.amberrajewelry.com/');
  // Upgrade /img/{NUM}.{jpg,png} → /images/products/{NUM}.webp only when a local webp exists.
  const m = u.match(/\/img\/(\d+)\.(?:jpe?g|png)/i);
  if (m && _WEBP_NUMS.has(m[1])) u = u.replace(/\/img\/(\d+)\.(?:jpe?g|png)/i, `/images/products/${m[1]}.webp`);
  return /^https?:/.test(u) ? u : `${SITE}/${u.replace(/^\//, '')}`;
}
// Duplicate-name SKUs get their jewelry type appended so links/titles are distinct.
function displayName(prod) { const n = TYPE_NOUN[prod.cat] || ''; return (prod.dup && n) ? `${prod.name} ${n}` : prod.name; }

// Amber hue for schema `color` (GMC requires it) + product→color-hub interlink.
const AMBER_COLORS = ['blue','butterscotch','cherry','cognac','green','honey','mosaic','raw'];
function amberColor(prod) { const hay = `${prod.name} ${(prod.props && prod.props.Stone) || ''}`.toLowerCase(); return AMBER_COLORS.find(c => hay.includes(c)) || ''; }

// Deterministic index from a string — used to vary copy per SKU so 94 product
// pages don't share identical "About" paragraphs (avoids near-duplicate demotion).
function pick(seed, arr) { let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0; return arr[h % arr.length]; }

// Unique-ish "About this piece" block (~55-75 words of genuine, varied copy)
// lifting product pages above the thin-content threshold without boilerplate dupes.
const CAT_INTRO = {
  rings: [
    'Designed for everyday wear, this ring pairs the warmth of natural amber with a hand-finished band.',
    'This ring frames a single piece of natural amber, sized to sit comfortably and catch the light as you move.',
    'A ring built around one warm cabochon of amber, finished by hand so no two pieces are exactly alike.'
  ],
  earrings: [
    'These earrings carry the glow of natural amber close to the face, light enough for all-day wear.',
    'A pair of earrings that let natural amber catch the light with every turn of the head.',
    'Lightweight earrings that pair the honeyed warmth of amber with a secure, comfortable fitting.'
  ],
  pendants: [
    'This pendant centers a single piece of natural amber, ready to layer or wear on its own.',
    'A pendant that lets one warm piece of amber rest at the collarbone, hung on a fine chain.',
    'Worn close to the heart, this pendant turns a fossil of ancient resin into an everyday piece.'
  ],
  bracelets: [
    'This bracelet wraps the wrist in the warm tones of natural amber, finished for comfortable daily wear.',
    'A bracelet that brings the glow of amber to the wrist, sized to move with you.',
    'Natural amber set into a bracelet made to be worn and layered, from day to evening.'
  ],
  chains: [
    'A finished chain made to carry your favorite amber pendant, or to be worn on its own.',
    'This chain is crafted to pair with amber pendants and sit smoothly against the skin.'
  ]
};
const COLOR_LINE = {
  honey: 'Its honey tone is the classic face of Baltic amber — warm, golden and translucent.',
  cognac: 'The cognac shade runs deep and warm, like late sunlight held inside the stone.',
  cherry: 'Its cherry-red depth gives the piece a grounded, dramatic character.',
  green: 'The green hue links it to nature and renewal, one of amber\'s rarer moods.',
  blue: 'Rare blue amber lends a sense of mystery and depth few stones can match.',
  butterscotch: 'The soft, opaque butterscotch tone feels calm and creamy against the skin.',
  mosaic: 'Its mosaic pattern layers several amber tones into one lively surface.',
  raw: 'Left raw and unpolished, the amber keeps the texture of the resin as it was found.'
};
const CRAFT_LINE = [
  'Each piece is handcrafted in Bali and shipped worldwide.',
  'Made by hand in our Bali workshop, it arrives ready to gift.',
  'Handcrafted in Bali from genuine Baltic amber, then finished by hand.'
];
function aboutBlock(p) {
  const seed = p.name + p.cat;
  const intro = pick(seed, CAT_INTRO[p.cat] || CAT_INTRO.pendants);
  const col = amberColor(p);
  const COLOR_FALLBACK = [
    'Every piece of natural amber carries its own inclusions and tone, so yours is one of a kind.',
    'No two pieces of natural amber are alike — the color and tiny inclusions make each one unique.',
    'Formed from resin millions of years old, each amber cabochon has a tone and pattern all its own.',
    'The warm, translucent color comes from the amber itself, so every piece has its own character.'
  ];
  const colLine = COLOR_LINE[col] || pick(seed + (p.material || '') + 'f', COLOR_FALLBACK);
  const metal = String((p.props && p.props.Metal) || '').toLowerCase();
  const metalLine = /silver|925/.test(metal) ? ' It is set in 925 sterling silver, hallmarked for lasting wear.'
    : /gold/.test(metal) ? ' It is finished in warm gold-tone metal to echo the amber.' : '';
  const craft = pick(seed + 'c', CRAFT_LINE);
  const body = `${intro} ${colLine}${metalLine} ${craft}`;
  return `<div class="pp-about"><h2 class="pp-about-h">About this piece</h2><p>${esc(body)}</p>`
    + `<p class="pp-about-care">Genuine Baltic amber · keep away from perfume and direct heat, and wipe with a soft cloth to preserve its glow.</p></div>`;
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
  const imgAbs    = absImg(img);
  const sku       = 'AMB-' + String(p.id != null ? p.id : slug).padStart(4, '0');
  const stone     = (props && props.Stone) ? props.Stone : '';
  const dispName  = displayName(p);
  // Title includes the jewelry type (Ring/Earrings/…) for category CTR, ≤60 chars.
  const typeWord  = TYPE_NOUN[cat] || '';
  const titleName = (!typeWord || dispName.endsWith(typeWord)) ? dispName : `${dispName} ${typeWord}`;
  let title = `${titleName} — AMBERRA Handcrafted Amber Jewelry`;
  if (title.length > 60) title = `${titleName} — AMBERRA`;
  if (title.length > 60) title = titleName.slice(0, 57).trim() + '…';
  // Meta description ≤155 chars; drop shipping boilerplate that always overflowed.
  let metaDesc = `${desc}${stone ? ' ' + stone + '.' : ''} Handcrafted in Bali.`;
  if (metaDesc.length > 155) metaDesc = metaDesc.slice(0, 152).replace(/\s+\S*$/, '') + '…';

  // Only EN pages exist — advertise en + x-default, not 14 languages that 404.
  const hreflangTags = `<link rel="alternate" hreflang="en" href="${canonical}">`;

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type':    'Product',
    name,
    sku,
    description: desc,
    image:       imgAbs ? [imgAbs] : [],
    brand:       { '@type': 'Brand', name: 'AMBERRA' },
    material,
    color:       amberColor(p) ? amberColor(p).charAt(0).toUpperCase() + amberColor(p).slice(1) + ' Amber' : 'Amber',
    additionalProperty: Object.entries(props || {}).map(([k, v]) => ({ '@type': 'PropertyValue', name: k, value: String(v) })),
    category:    catLabel,
    url:         canonical,
    offers: {
      '@type':        'Offer',
      price:          String(price),
      priceCurrency:  'USD',
      availability:   'https://schema.org/InStock',
      itemCondition:  'https://schema.org/NewCondition',
      url:            canonical,
      priceValidUntil: String(new Date().getFullYear() + 1) + '-12-31',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'USD' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
          transitTime:  { '@type': 'QuantitativeValue', minValue: 7, maxValue: 14, unitCode: 'DAY' }
        }
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'US',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn'
      },
      seller: { '@type': 'Organization', name: 'AMBERRA', url: SITE }
    }
  }, null, 2);

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Amber Jewelry', item: `${SITE}/amber` },
      { '@type': 'ListItem', position: 3, name: catLabel, item: `${SITE}/${cat}` },
      { '@type': 'ListItem', position: 4, name, item: canonical }
    ]
  }, null, 2);

  const badgeHTML = badge
    ? `<div class="pbadge ${esc(badge)}">${badge === 'bestseller' ? 'Best Seller' : badge === 'limited' ? 'Limited Edition' : 'New'}</div>`
    : '';

  const propsHTML = Object.entries(props || {}).map(([k, v]) =>
    `<div class="pp-prop"><span class="pp-pk">${esc(k)}</span><span class="pp-pv">${esc(v)}</span></div>`
  ).join('');

  // ── Snipcart buy button ──
  const priceStr = Number(price || 0).toFixed(2);
  const shortDesc = (desc || '').slice(0, 160);
  const sizeOpts = sizeOptions(cat);
  const sizeAttr = sizeOpts
    ? `\n    data-item-custom1-name="Size" data-item-custom1-options="${esc(sizeOpts)}" data-item-custom1-required="true"`
    : '';
  const buyBtn = `<button class="pp-cta snipcart-add-item"
    data-item-id="${esc(slug)}"
    data-item-name="${esc(name)}"
    data-item-price="${priceStr}"
    data-item-url="${canonical}"
    data-item-description="${esc(shortDesc)}"
    data-item-image="${esc(imgAbs)}"
    data-item-categories="${esc(catLabel)}"${sizeAttr}>Add to Cart — $${price}</button>`;

  // ── "You May Also Like" — interlink product pages (same category first) ──
  const related = Array.isArray(p._related) ? p._related : [];
  const relatedHTML = related.length ? `
<section class="pp-related">
  <h2 class="pp-related-head">You May Also Like</h2>
  <div class="pp-related-grid">
    ${related.map(r => `<a class="pp-rel-card" href="/products/${esc(r.slug)}">
      <div class="pp-rel-img"><img src="${esc(absImg(r.img))}" alt="${esc(displayName(r))} — AMBERRA amber jewelry" loading="lazy" width="300" height="400"></div>
      <div class="pp-rel-name">${esc(displayName(r))}</div>
      <div class="pp-rel-price">$${r.price}</div>
    </a>`).join('')}
  </div>
</section>` : '';

  return `<!DOCTYPE html>
<html lang="en" translate="no">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(metaDesc)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="author" content="AMBERRA">
<link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
<link rel="canonical" href="${canonical}">
${hreflangTags}
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="AMBERRA">
<meta property="og:title" content="${esc(dispName)} — AMBERRA">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(imgAbs)}">
<meta property="og:url" content="${canonical}">
<meta property="product:price:amount" content="${price}">
<meta property="product:price:currency" content="USD">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(dispName)} — AMBERRA">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(imgAbs)}">
<script type="application/ld+json">
${schema}
</script>
<script type="application/ld+json">
${breadcrumbSchema}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Cormorant+SC:wght@300;400;500&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css?v=20260801c">
<link rel="preconnect" href="https://app.snipcart.com">
<link rel="preconnect" href="https://cdn.snipcart.com">
<link rel="stylesheet" href="https://cdn.snipcart.com/themes/${SNIPCART_VER}/default/snipcart.css">
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
.pp-material{font:300 13px/1.6 var(--sans);color:var(--stone);font-style:italic;margin:0 0 24px}
.pp-about{margin:0 0 28px}
.pp-about-h{font:400 11px/1 var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--stone);margin:0 0 12px}
.pp-about p{font:300 14px/1.75 var(--sans);color:var(--gray);margin:0 0 12px}
.pp-about-care{font-size:12px !important;color:var(--stone) !important;font-style:italic}
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
.pp-related{max-width:1100px;margin:0 auto;padding:0 32px 60px}
.pp-related-head{font:300 13px/1 var(--sans);letter-spacing:.2em;text-transform:uppercase;color:var(--stone);text-align:center;margin:0 0 32px}
.pp-related-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
.pp-rel-card{text-decoration:none;display:block}
.pp-rel-img{position:relative;background:var(--silk);overflow:hidden;aspect-ratio:3/4;margin-bottom:12px}
.pp-rel-img img{width:100%;height:100%;object-fit:cover;transition:transform .6s ease}
.pp-rel-card:hover .pp-rel-img img{transform:scale(1.05)}
.pp-rel-name{font:400 14px/1.3 var(--serif);color:var(--charcoal);margin:0 0 4px}
.pp-rel-price{font:300 12px/1 var(--sans);color:var(--gray)}
@media(max-width:760px){.pp-wrap{grid-template-columns:1fr;gap:32px;padding:32px 20px 80px}.pp-info{position:static}.pp-name{font-size:28px}.pp-related-grid{grid-template-columns:repeat(2,1fr)}}
</style>
</head>
<body class="page-light">
<nav class="pp-nav">
  <a class="pp-nav-back" href="/shop">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="15 18 9 12 15 6"/></svg>
    Shop All
  </a>
  <a class="pp-nav-logo" href="/">AMBERRA</a>
  <a class="pp-nav-cart snipcart-checkout" href="#" style="font:300 11px/1 var(--sans);letter-spacing:.15em;text-transform:uppercase;color:var(--gray);text-decoration:none">
    Cart (<span class="snipcart-items-count">0</span>)
  </a>
</nav>

<main class="pp-wrap">
  <div class="pp-img-wrap">
    <img src="${esc(imgAbs)}" alt="${esc(dispName)} — AMBERRA handcrafted amber jewelry" loading="eager" width="600" height="800">
  </div>

  <div class="pp-info">
    <div class="pp-breadcrumb">
      <a href="/">Home</a> &rsaquo; <a href="/amber">Amber Jewelry</a> &rsaquo; <a href="/shop?cat=${esc(cat)}">${esc(catLabel)}</a> &rsaquo; ${esc(name)}
    </div>
    <div class="pp-cat">${esc(catLabel)}</div>
    ${badgeHTML ? `<div class="pp-badge-wrap">${badgeHTML}</div>` : ''}
    <h1 class="pp-name">${esc(dispName)}</h1>
    <div class="pp-price">$${price}</div>
    <hr class="pp-divider">
    <p class="pp-desc">${esc(desc)}</p>
    <p class="pp-material">${esc(material)}</p>
    ${aboutBlock(p)}
    ${amberColor(p) ? `<p class="pp-colorhub"><a href="/amber/${amberColor(p)}" style="color:#B8941E;text-decoration:none;border-bottom:1px solid currentColor">Explore all ${amberColor(p)} amber →</a></p>` : ''}
    ${propsHTML ? `<div class="pp-props">${propsHTML}</div>` : ''}
    ${buyBtn}
    <a class="pp-cta-ghost" href="/shop?cat=${esc(cat)}">View All ${esc(catLabel)}</a>
  </div>
</main>
${relatedHTML}
<footer class="pp-footer">
  <p>Each AMBERRA piece is handcrafted in Bali using natural amber. Free worldwide shipping on orders over $200.</p>
  <p><a href="/shop">Browse the full collection</a> &nbsp;·&nbsp; <a href="/our-story">Our Story</a> &nbsp;·&nbsp; <a href="/contact">Contact</a></p>
</footer>

<div hidden id="snipcart" data-api-key="${SNIPCART_KEY}" data-currency="usd"></div>
<script async src="https://cdn.snipcart.com/themes/${SNIPCART_VER}/default/snipcart.js"></script>
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

// ── data sources ──────────────────────────────────────────────────────────────
// Must stay byte-for-byte aligned with generate-categories.js so product page
// filenames match the /products/<slug> links emitted on category/hub pages.

function normalizeAirtable(records) {
  return records.map(rec => {
    const f = rec.fields;
    const props = {};
    if (f.Stone)      props.Stone      = f.Stone;
    if (f.Metal)      props.Metal      = f.Metal;
    if (f.Collection) props.Collection = f.Collection;
    if (f.Closure)    props.Closure    = f.Closure;
    if (f.Chain)      props.Chain      = f.Chain;
    return {
      name:     f.Name || '',
      cat:      (f.Category || '').toLowerCase(),
      price:    f.Price || 0,
      badge:    f.Badge || null,
      img:      f.Image || '',
      material: f.Material || '',
      desc:     f.Description || '',
      props,
    };
  });
}

function loadLocalProducts() {
  // /tmp for local dev; data/products.json is the committed source used on Vercel build
  const p = fs.existsSync('/tmp/products.json') ? '/tmp/products.json'
          : path.join(__dirname, '..', 'data', 'products.json');
  if (!fs.existsSync(p)) throw new Error('No products.json (checked /tmp and data/)');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

async function loadProducts() {
  if (PAT) {
    try {
      console.log('📦 Fetching products from Airtable…');
      const records = await fetchProducts();
      console.log(`✓  ${records.length} products fetched from Airtable`);
      return normalizeAirtable(records);
    } catch (err) {
      console.warn(`⚠  Airtable fetch failed (${err.message}) — falling back to /tmp/products.json`);
    }
  }
  const local = loadLocalProducts();
  console.log(`✓  ${local.length} products loaded from /tmp/products.json`);
  return local;
}

// Identical duplicate-name suffix rule to generate-categories.js::assignSlugs.
function assignSlugs(products) {
  const seen = [];
  for (const p of products) {
    if (!p.name) continue;
    let slug = toSlug(p.name);
    if (seen.includes(slug)) slug = slug + '-' + seen.length;
    seen.push(slug);
    p.slug = slug;
  }
  return products;
}

// ── /shop static grid (crawlable) ───────────────────────────────────────────
// Googlebot sees a real product list with /products/<slug> links; shop.js
// re-renders #prod-grid for users on load. Injected idempotently via markers.

function staticShopCard(p) {
  const name = displayName(p);
  const badge = p.badge
    ? `<div class="pbadge ${esc(p.badge)}">${p.badge === 'bestseller' ? 'Best Seller' : p.badge === 'limited' ? 'Limited' : 'New'}</div>`
    : '';
  return `<a class="pc" href="/products/${esc(p.slug)}" style="text-decoration:none;color:inherit">
      <div class="pc-inner">
        <div class="pc-img" style="position:relative">${badge}<img src="${esc(absImg(p.img))}" alt="${esc(name)} — AMBERRA amber jewelry" loading="lazy" width="400" height="400"></div>
        <div class="pc-label">
          <span class="pcat">${esc((p.cat || '').toUpperCase())}</span>
          <h3 class="pname">${esc(name)}</h3>
          <p class="pmaterial">${esc(p.material || '')}</p>
          <div class="pfoot"><span class="pprice">$${p.price}</span></div>
        </div>
      </div>
    </a>`;
}

function injectStaticGrid(relFile, products) {
  const p = path.join(__dirname, '..', relFile);
  if (!fs.existsSync(p)) return;
  const html = fs.readFileSync(p, 'utf8');
  const si = html.indexOf('<!-- STATIC_GRID_START');
  const ei = html.indexOf('<!-- STATIC_GRID_END -->');
  if (si === -1 || ei === -1) return;
  const startClose = html.indexOf('-->', si) + 3;
  const list  = products.filter(x => x.slug);
  const cards = list.map(staticShopCard).join('\n    ');
  const out   = html.slice(0, startClose) + '\n    ' + cards + '\n    ' + html.slice(ei);
  fs.writeFileSync(p, out, 'utf8');
  console.log(`✓  ${relFile} static grid injected (${list.length} cards)`);
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  let products;
  try {
    products = await loadProducts();
  } catch (err) {
    console.error('❌ No product source available:', err.message);
    process.exit(0); // non-fatal — deploy continues without product pages
  }

  assignSlugs(products);

  // Mark products whose name is shared by another SKU — their pages get a
  // stone-qualified title/H1 so they don't cannibalise each other.
  const nameCounts = {};
  for (const p of products) {
    if (!p.name) continue;
    const k = p.name.toLowerCase();
    nameCounts[k] = (nameCounts[k] || 0) + 1;
  }
  for (const p of products) {
    if (p.name && nameCounts[p.name.toLowerCase()] > 1) p.dup = true;
  }

  // Related products for "You May Also Like": same category first, then pad.
  const withSlug = products.filter(p => p.slug);
  for (const p of withSlug) {
    const same = withSlug.filter(q => q !== p && q.cat === p.cat).slice(0, 4);
    if (same.length < 4) {
      const pad = withSlug.filter(q => q !== p && q.cat !== p.cat && !same.includes(q)).slice(0, 4 - same.length);
      p._related = same.concat(pad);
    } else {
      p._related = same;
    }
  }

  const outDir = path.join(__dirname, '../products');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const slugs   = [];
  const written = new Set();

  for (const p of products) {
    if (!p.slug) continue;
    const html = productHTML(p, p.slug);
    fs.writeFileSync(path.join(outDir, `${p.slug}.html`), html, 'utf8');
    slugs.push(p.slug);
    written.add(`${p.slug}.html`);
  }

  console.log(`✓  ${slugs.length} product pages written to /products/`);

  // Inject crawlable static grid into /shop and /catalog
  injectStaticGrid('shop.html', products);
  injectStaticGrid('catalog.html', products);

  // Orphan cleanup — remove stale product pages no longer backed by a product.
  let removed = 0;
  for (const file of fs.readdirSync(outDir)) {
    if (file.endsWith('.html') && !written.has(file)) {
      fs.unlinkSync(path.join(outDir, file));
      removed++;
    }
  }
  if (removed) console.log(`✓  ${removed} orphan product page(s) removed`);

  // Update sitemap
  const updatedSitemap = buildSitemap(slugs);
  fs.writeFileSync(path.join(__dirname, '../sitemap.xml'), updatedSitemap, 'utf8');
  console.log(`✓  sitemap.xml updated (${slugs.length} product URLs added)`);
}

main().catch(err => {
  console.error('❌ Build script error:', err);
  process.exit(0); // non-fatal
});
