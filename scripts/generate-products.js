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
  u = /^https?:/.test(u) ? u : `${SITE}/${u.replace(/^\//, '')}`;
  // Bust immutable CDN cache when product webp content changes (bg-removed → transparent). Bump on re-export.
  if (/\/images\/products\/\d+\.webp$/.test(u)) u += '?v=7';
  return u;
}
// Duplicate-name SKUs get their jewelry type appended so links/titles are distinct.
function displayName(prod) { const n = TYPE_NOUN[prod.cat] || ''; return (prod.dup && n) ? `${prod.name} ${n}` : prod.name; }

// For a local /images/*.{jpg,png} URL, return its .webp sibling absolute URL — but
// only if that .webp actually exists on disk. Lets the static grid ship webp (light)
// instead of the heavy original, which the client-side render already loads on top.
function webpSibling(absUrl) {
  const rel = String(absUrl).replace(/^https?:\/\/[^/]+\//, '').split('?')[0];
  if (!/^images\/.+\.(jpe?g|png)$/i.test(rel)) return null;
  const webpRel = rel.replace(/\.(jpe?g|png)$/i, '.webp');
  return fs.existsSync(path.join(__dirname, '..', webpRel)) ? `${SITE}/${webpRel}?v=3` : null;
}

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
    'A ring built around one warm cabochon of amber, finished by hand so no two pieces are exactly alike.',
    'A hand-forged silver band cradles a single amber stone — quiet enough for every day, warm enough to notice.',
    'This ring makes an easy promise or anniversary piece: one warm stone, a hand-shaped band, nothing mass-produced.',
    'Sculpted around a natural amber cabochon, the band is finished by hand so it sits close and comfortable.'
  ],
  earrings: [
    'These earrings carry the glow of natural amber close to the face, light enough for all-day wear.',
    'A pair of earrings that let natural amber catch the light with every turn of the head.',
    'Lightweight earrings that pair the honeyed warmth of amber with a secure, comfortable fitting.',
    'Hand-forged in sterling silver, these earrings frame natural amber for a warm, everyday glow.',
    'Light on the ear and warm in tone, this pair brings natural Baltic amber into daily wear.',
    'A pair made one at a time, letting the amber colour lead and the silver stay quietly in support.'
  ],
  pendants: [
    'This pendant centers a single piece of natural amber, ready to layer or wear on its own.',
    'A pendant that lets one warm piece of amber rest at the collarbone, hung on a fine chain.',
    'Worn close to the heart, this pendant turns a fossil of ancient resin into an everyday piece.',
    'One warm amber cabochon in hand-worked silver, easy to layer or wear alone.',
    'A pendant sized to sit at the collarbone, framing natural amber in quiet sterling silver.',
    'This pendant carries a single stone of Baltic amber, ready to pair with any AMBERRA chain.'
  ],
  bracelets: [
    'This bracelet wraps the wrist in the warm tones of natural amber, finished for comfortable daily wear.',
    'A bracelet that brings the glow of amber to the wrist, sized to move with you.',
    'Natural amber set into a bracelet made to be worn and layered, from day to evening.',
    'Warm amber and hand-worked silver wrap the wrist, light enough to forget you are wearing it.',
    'A bracelet built to layer with a watch or bangles, centred on natural Baltic amber.',
    'This piece sets natural amber along the wrist, hand-finished to sit and move comfortably.'
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
  'Each piece is handcrafted and shipped worldwide.',
  'Made by hand by our artisans, it arrives ready to gift.',
  'Handcrafted from genuine Baltic amber, then finished by hand.',
  'Worked by hand from start to finish, it ships worldwide with a certificate of authenticity.',
  'Finished by hand and boxed ready to gift, with free tracked shipping over $200.',
  'One of a kind, hand-finished by our silversmiths and shipped worldwide.',
  'Hand-set and polished by our artisans, it arrives gift-ready with tracked delivery.'
];
function aboutBlock(p) {
  const seed = p.name + p.cat;
  const intro = pick(seed, CAT_INTRO[p.cat] || CAT_INTRO.pendants);
  const col = amberColor(p);
  const COLOR_FALLBACK = [
    'Every piece of natural amber carries its own inclusions and tone, so yours is one of a kind.',
    'No two pieces of natural amber are alike — the color and tiny inclusions make each one unique.',
    'Formed from resin millions of years old, each amber cabochon has a tone and pattern all its own.',
    'The warm, translucent color comes from the amber itself, so every piece has its own character.',
    'Held to the light, the amber glows from within — a depth no dyed or pressed stone can imitate.',
    'Tiny natural inclusions trapped in the resin are the fingerprint of genuine Baltic amber.',
    'The stone shifts from gold to honey as the light moves, the way only natural amber does.',
    'Each cabochon is cut from a single piece of raw Baltic amber, so its tone is entirely its own.'
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
  const { name, cat, price, img, material, props, badge } = p;
  // Strip marketing clichés from Airtable descriptions (no "modern woman" filler).
  const desc = (p.desc || '')
    .replace(/,?\s*crafted for the modern woman\.?/gi, '.')
    .replace(/,?\s*for the modern woman\.?/gi, '.')
    .replace(/\s*\.\s*\./g, '.').trim();
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
  // Meta description target 120–160: richer tail lifts short descs into range, cap trims long.
  let metaDesc = `${desc}${stone ? ' ' + stone + '.' : ''} Handmade in 925 sterling silver with natural Baltic amber.`;
  if (metaDesc.length < 120) metaDesc += ' Ships worldwide.';
  if (metaDesc.length > 160) metaDesc = metaDesc.slice(0, 157).replace(/\s+\S*$/, '') + '…';

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
    mpn:         sku,
    color:       amberColor(p) ? amberColor(p).charAt(0).toUpperCase() + amberColor(p).slice(1) + ' Amber' : 'Natural Amber',
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
        shippingDestination: [
          { '@type': 'DefinedRegion', addressCountry: 'US' },
          { '@type': 'DefinedRegion', addressCountry: 'GB' },
          { '@type': 'DefinedRegion', addressCountry: 'AU' },
          { '@type': 'DefinedRegion', addressCountry: 'CA' },
          { '@type': 'DefinedRegion', addressCountry: 'DE' }
        ],
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
      { '@type': 'ListItem', position: 2, name: catLabel, item: `${SITE}/${cat}` },
      { '@type': 'ListItem', position: 3, name, item: canonical }
    ]
  }, null, 2);

  const badgeHTML = badge
    ? `<div class="pbadge ${esc(badge)}">${badge === 'bestseller' ? 'Best Seller' : badge === 'limited' ? 'Limited Edition' : 'New'}</div>`
    : '';

  const propsHTML = Object.entries(props || {}).map(([k, v]) =>
    `<div class="pp-prop"><span class="pp-pk">${esc(k)}</span><span class="pp-pv">${esc(v)}</span></div>`
  ).join('');

  // Buy CTA → real add-to-cart into amb_cart (same store app.js drawer uses),
  // then hand off to /shop which opens the drawer with ?added=1.
  const buyBtn = `<button class="pp-cta" type="button"
    onclick="ppAddCart(this)"
    data-id="${esc(slug)}"
    data-name="${esc(name)}"
    data-img="${esc(imgAbs)}"
    data-material="${esc(material)}"
    data-price="${esc(String(price))}">Add to Cart — <span class="pp-cta-price" data-usd="${price}">$${price}</span></button>`;

  // ── "You May Also Like" — interlink product pages (same category first) ──
  const related = Array.isArray(p._related) ? p._related : [];
  const relatedHTML = related.length ? `
<section class="pp-related">
  <h2 class="pp-related-head">You May Also Like</h2>
  <div class="pp-related-grid">
    ${related.map(r => `<a class="pp-rel-card" href="/products/${esc(r.slug)}">
      <div class="pp-rel-img"><img src="${esc(absImg(r.img))}" alt="${esc(displayName(r))} — AMBERRA amber jewelry" loading="lazy" width="300" height="400"></div>
      <div class="pp-rel-name">${esc(displayName(r))}</div>
      <div class="pp-rel-price" data-usd="${r.price}">$${r.price}</div>
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
<link rel="stylesheet" href="/style.css?v=20260830">
<style>
.pp-nav{position:sticky;top:0;background:var(--white);border-bottom:1px solid var(--mist);z-index:100}
.pp-nav-bar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:16px 32px 12px;gap:20px}
.pp-nav-util{display:flex;gap:28px;align-items:center}
.pp-nav-util a{font:400 13px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--black);text-decoration:none;white-space:nowrap;transition:color .2s}
.pp-nav-util a:hover{color:var(--amber-ink)}
.pp-nav-logo{justify-self:center;text-align:center;text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:5px}
.pp-nav-logo .lm{font:600 40px/1 var(--serif);letter-spacing:.18em;color:var(--black)}
.pp-nav-logo .ls{font:400 12px/1 var(--sans);letter-spacing:.44em;color:var(--black)}
.pp-nav-r{display:flex;gap:18px;align-items:center;justify-self:end}
.pp-nav-r a{color:var(--black);display:flex;align-items:center}
.pp-nav-menu{display:flex;gap:28px;justify-content:center;align-items:center;padding:0 32px 14px;flex-wrap:wrap}
.pp-nav-menu a{font:500 14px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--black);text-decoration:none;white-space:nowrap;transition:color .2s}
.pp-nav-menu a:hover,.pp-nav-menu a.on{color:var(--amber-ink)}
.pp-nav-div{width:1px;height:15px;background:var(--mist);margin:0 4px}
@media(max-width:760px){
  .pp-nav-bar{grid-template-columns:1fr auto 1fr;padding:14px 16px 10px}
  .pp-nav-util{display:none}
  .pp-nav-logo{justify-self:center}
  .pp-nav-logo .lm{font-size:26px;letter-spacing:.12em}
  .pp-nav-menu{gap:20px;overflow-x:auto;flex-wrap:nowrap;justify-content:flex-start;padding:0 16px 12px;scrollbar-width:none}
  .pp-nav-menu::-webkit-scrollbar{display:none}
}
.pp-wrap{max-width:1180px;margin:0 auto;padding:24px 32px 48px;display:grid;grid-template-columns:1.05fr 1fr;gap:52px;align-items:start}
.pp-img-wrap{position:relative;background:#fff;overflow:hidden;aspect-ratio:4/5;max-height:calc(100vh - 160px)}
.pp-img-wrap img{width:100%;height:100%;object-fit:contain;padding:18px;transition:transform .7s ease}
.pp-img-wrap:hover img{transform:scale(1.04)}
.pp-info{position:sticky;top:150px}
.pp-breadcrumb{font:400 12px/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--black);margin-bottom:14px}
.pp-breadcrumb a{color:var(--black);text-decoration:none}
.pp-breadcrumb a:hover{color:var(--amber-ink)}
.pp-cat{font:400 12px/1 var(--sans);letter-spacing:.2em;text-transform:uppercase;color:var(--amber-ink);margin-bottom:8px}
.pp-name{font:400 34px/1.1 var(--serif);color:var(--black);margin:0 0 10px}
.pp-price{font:400 25px/1 var(--serif);color:var(--black);margin:0 0 14px}
.pp-divider{border:none;border-top:1px solid var(--mist);margin:14px 0}
.pp-desc{font:400 16px/1.6 var(--sans);color:var(--black);margin:0 0 14px}
.pp-material{font:400 15px/1.5 var(--sans);color:var(--black);font-style:italic;margin:0 0 14px}
.pp-about{margin:0 0 16px}
.pp-about-h{font:400 12px/1 var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--black);margin:0 0 8px}
.pp-about p{font:400 15px/1.6 var(--sans);color:var(--black);margin:0 0 8px}
.pp-about-care{font-size:13.5px !important;color:var(--black) !important;font-style:italic}
.pp-props{display:flex;flex-direction:column;gap:0;margin-bottom:16px}
.pp-prop{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--silk)}
.pp-pk{font:400 11.5px/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--black)}
.pp-pv{font:400 14.5px/1 var(--sans);color:var(--black)}
.pp-badge-wrap{margin-bottom:10px}
.pp-cta{display:block;width:100%;padding:15px;background:var(--charcoal);color:var(--white);font:400 12.5px/1 var(--sans);letter-spacing:.18em;text-transform:uppercase;text-align:center;border:none;cursor:pointer;transition:background .2s}
.pp-cta:hover{background:var(--amber)}
.pp-cta-ghost{display:block;width:100%;padding:13px;background:transparent;color:var(--black);font:400 12.5px/1 var(--sans);letter-spacing:.15em;text-transform:uppercase;text-align:center;text-decoration:none;border:1px solid var(--mist);margin-top:8px;transition:border-color .2s,color .2s}
.pp-cta-ghost:hover{border-color:var(--black);color:var(--black)}
.pp-footer{text-align:center;padding:32px 32px 48px;border-top:1px solid var(--mist);margin-top:32px}
.pp-footer p{font:400 15px/1.7 var(--sans);color:var(--black);max-width:480px;margin:0 auto 16px}
.pp-footer a{color:var(--amber-ink);text-decoration:none}
.pp-related{max-width:1180px;margin:0 auto;padding:0 32px 48px}
.pp-related-head{font:400 14px/1 var(--sans);letter-spacing:.2em;text-transform:uppercase;color:var(--black);text-align:center;margin:0 0 24px}
.pp-related-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
.pp-rel-card{text-decoration:none;display:block}
.pp-rel-img{position:relative;background:#fff;overflow:hidden;aspect-ratio:1/1;margin-bottom:12px}
.pp-rel-img img{width:100%;height:100%;object-fit:contain;padding:10px;transition:transform .6s ease}
.pp-rel-card:hover .pp-rel-img img{transform:scale(1.05)}
.pp-rel-name{font:400 16px/1.3 var(--serif);color:var(--black);margin:0 0 4px}
.pp-rel-price{font:400 13.5px/1 var(--sans);color:var(--black)}
.pp-trust{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;margin-top:14px;background:var(--mist);border:1px solid var(--mist)}
.pp-trust-item{display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:10px 14px;background:var(--cream);text-decoration:none;transition:background .2s}
.pp-trust-item:hover{background:var(--white)}
.pp-trust-ic{width:20px;height:20px;color:var(--amber);stroke-width:1.4;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round}
.pp-trust-t{font:500 12.5px/1.3 var(--sans);letter-spacing:.03em;color:var(--black)}
.pp-trust-s{font:400 12.5px/1.4 var(--sans);color:var(--black)}
.pp-trust-item:hover .pp-trust-t{color:var(--amber-ink)}
@media(max-width:760px){.pp-wrap{grid-template-columns:1fr;gap:28px;padding:24px 20px 60px}.pp-info{position:static}.pp-img-wrap{max-height:none;aspect-ratio:4/5}.pp-name{font-size:28px}.pp-related-grid{grid-template-columns:repeat(2,1fr)}}
</style>
</head>
<body class="page-light">
<nav class="pp-nav">
  <div class="pp-nav-bar">
    <div class="pp-nav-util">
      <a href="/services">Services</a>
      <a href="/contact">Contact Us</a>
    </div>
    <a class="pp-nav-logo" href="/"><span class="lm">AMBERRA</span><span class="ls">Jewelry</span></a>
    <div class="pp-nav-r">
      <a href="/shop" aria-label="Cart">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.4a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/></svg>
      </a>
    </div>
  </div>
  <div class="pp-nav-menu">
    <a href="/shop">Collections</a>
    <a href="/rings"${cat === 'rings' ? ' class="on"' : ''}>Rings</a>
    <a href="/earrings"${cat === 'earrings' ? ' class="on"' : ''}>Earrings</a>
    <a href="/pendants"${cat === 'pendants' ? ' class="on"' : ''}>Pendants</a>
    <a href="/bracelets"${cat === 'bracelets' ? ' class="on"' : ''}>Bracelets</a>
    <span class="pp-nav-div"></span>
    <a href="/our-story">Our Story</a>
    <a href="/wholesale">Wholesale</a>
    <a href="/journal">Journal</a>
  </div>
</nav>

<main class="pp-wrap">
  <div class="pp-img-wrap">
    <img src="${esc(imgAbs)}" alt="${esc(dispName)} — AMBERRA handcrafted amber jewelry" loading="eager" width="600" height="800">
  </div>

  <div class="pp-info">
    <div class="pp-breadcrumb">
      <a href="/">Home</a> &rsaquo; <a href="/${esc(cat)}">${esc(catLabel)}</a> &rsaquo; ${esc(name)}
    </div>
    <div class="pp-cat">${esc(catLabel)}</div>
    ${badgeHTML ? `<div class="pp-badge-wrap">${badgeHTML}</div>` : ''}
    <h1 class="pp-name">${esc(dispName)}</h1>
    <div class="pp-price" data-usd="${price}">$${price}</div>
    <hr class="pp-divider">
    <p class="pp-desc">${esc(desc)}</p>
    <p class="pp-material">${esc(material)}</p>
    ${aboutBlock(p)}
    ${amberColor(p) ? `<p class="pp-colorhub"><a href="/amber/${amberColor(p)}" style="color:#8A6D0F;text-decoration:none;border-bottom:1px solid currentColor">Explore all ${amberColor(p)} amber →</a></p>` : ''}
    ${propsHTML ? `<div class="pp-props">${propsHTML}</div>` : ''}
    ${buyBtn}
    <a class="pp-cta-ghost" href="/shop?cat=${esc(cat)}">View All ${esc(catLabel)}</a>
    <div class="pp-trust">
      <a class="pp-trust-item" href="/faq">
        <svg class="pp-trust-ic" viewBox="0 0 24 24"><circle cx="12" cy="9" r="5.5"/><path d="M9 9l2 2 4-4"/><path d="M8.5 14L7 21l5-2.4L17 21l-1.5-7"/></svg>
        <span class="pp-trust-t">Certificate of Authenticity</span>
        <span class="pp-trust-s">Natural Baltic amber</span>
      </a>
      <a class="pp-trust-item" href="/our-story">
        <svg class="pp-trust-ic" viewBox="0 0 24 24"><path d="M12 21s-6.5-5.5-6.5-10.5A6.5 6.5 0 0 1 18.5 10.5C18.5 15.5 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.2"/></svg>
        <span class="pp-trust-t">Handcrafted</span>
        <span class="pp-trust-s">Made by hand by our artisans</span>
      </a>
      <a class="pp-trust-item" href="/faq">
        <svg class="pp-trust-ic" viewBox="0 0 24 24"><path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18M9 3l-3 6 6 12 6-12-3-6"/></svg>
        <span class="pp-trust-t">Nickel-free 925 Silver</span>
        <span class="pp-trust-s">Hypoallergenic metals</span>
      </a>
      <a class="pp-trust-item" href="/shipping">
        <svg class="pp-trust-ic" viewBox="0 0 24 24"><path d="M4 10a8 8 0 1 1 1 5"/><path d="M1 7l3 3 3-3"/></svg>
        <span class="pp-trust-t">14-Day Returns</span>
        <span class="pp-trust-s">Free shipping over $200</span>
      </a>
    </div>
  </div>
</main>
${relatedHTML}
<footer class="pp-footer">
  <p>Each AMBERRA piece is handcrafted using natural amber. Free worldwide shipping on orders over $200.</p>
  <p><a href="/shop">Browse the full collection</a> &nbsp;·&nbsp; <a href="/our-story">Our Story</a> &nbsp;·&nbsp; <a href="/faq">Client Care</a> &nbsp;·&nbsp; <a href="/contact">Contact</a></p>
</footer>

<script defer src="/currency.js?v=20260811h"></script>
<script>
// Add to cart from a product landing page into the same amb_cart store the
// index/shop drawer reads, then hand off to /shop which opens the drawer.
function ppAddCart(btn){
  try{
    var id=btn.dataset.id||'';   // product slug — string id for dedup
    var name=btn.dataset.name||'';
    var img=btn.dataset.img||'';
    var material=btn.dataset.material||'';
    var price=Number(btn.dataset.price)||0;
    var cart=JSON.parse(localStorage.getItem('amb_cart')||'[]');
    var ex=cart.find(function(x){return x.id===id;});
    if(ex){ex.qty=(ex.qty||1)+1;}
    else{cart.push({id:id,name:name,img:img,material:material,price:price,size:'',qty:1});}
    localStorage.setItem('amb_cart',JSON.stringify(cart));
  }catch(e){}
  // ?added=1 makes app.js openCart() on load, so the buyer sees their item.
  location.href='/shop?added=1';
}
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
  </url>`).join('\n');

  return stripped.replace('</urlset>', `${productEntries}\n</urlset>`);
}

// ── data sources ──────────────────────────────────────────────────────────────
// Must stay byte-for-byte aligned with generate-categories.js so product page
// filenames match the /products/<slug> links emitted on category/hub pages.

// Data-hygiene applied at the single Airtable→snapshot write point, so a future
// SYNC_AIRTABLE=1 can never re-introduce the bugs cleaned up on 2026-08-27:
// double-encoded &amp;, inconsistent metal wording, generic "Amber", duplicate names.
// Both generators read the resulting clean snapshot, so slugs stay consistent.
const CAT_NOUN = { rings: 'Ring', earrings: 'Earrings', pendants: 'Pendant', bracelets: 'Bracelet', chains: 'Chain' };
function normMaterial(m) {
  return String(m || '')
    .replace(/&amp;/g, '&')
    .replace(/·\s*925 Silver\b/g, '· 925 Sterling Silver')
    .replace(/·\s*Sterling Silver\b/g, '· 925 Sterling Silver')
    .replace(/·\s*Silver\b/g, '· 925 Sterling Silver')
    .replace(/\bOxidized Silver\b/g, 'Oxidized 925 Sterling Silver')
    .replace(/925 925/g, '925')
    .replace(/^Natural Amber\b/, 'Natural Baltic Amber');
}
function normMetal(m) {
  return String(m || '').replace(/&amp;/g, '&').replace(/\b925 Silver\b/g, '925 Sterling Silver');
}
// Duplicate display names (a themed "family" sold as ring + earrings + bracelet…)
// get disambiguated by their category noun, then by amber color as a fallback.
function uniquifyNames(products) {
  const groups = {};
  products.forEach(p => { const k = (p.name || '').toLowerCase().trim(); (groups[k] = groups[k] || []).push(p); });
  Object.values(groups).forEach(g => {
    if (g.length < 2) return;
    const seen = new Set();
    g.forEach(p => {
      let nn = `${p.name} ${CAT_NOUN[p.cat] || ''}`.trim();
      if (seen.has(nn.toLowerCase())) {
        const col = ((p.props && p.props.Stone) || '').replace(/Natural |Baltic |Amber|·.*/g, '').trim();
        nn = `${p.name} ${CAT_NOUN[p.cat] || ''} ${col}`.trim();
      }
      seen.add(nn.toLowerCase());
      p.name = nn;
    });
  });
  return products;
}

function normalizeAirtable(records) {
  const mapped = records.map(rec => {
    const f = rec.fields;
    const props = {};
    if (f.Stone)      props.Stone      = f.Stone;
    if (f.Metal)      props.Metal      = normMetal(f.Metal);
    if (f.Collection) props.Collection = f.Collection;
    if (f.Closure)    props.Closure    = f.Closure;
    if (f.Chain)      props.Chain      = f.Chain;
    return {
      name:     f.Name || '',
      cat:      (f.Category || '').toLowerCase(),
      price:    f.Price || 0,
      badge:    f.Badge || null,
      img:      f.Image || '',
      material: normMaterial(f.Material || ''),
      desc:     f.Description || '',
      props,
    };
  });
  return uniquifyNames(mapped);
}

function loadLocalProducts() {
  // /tmp for local dev; data/products.json is the committed source used on Vercel build
  const p = fs.existsSync('/tmp/products.json') ? '/tmp/products.json'
          : path.join(__dirname, '..', 'data', 'products.json');
  if (!fs.existsSync(p)) throw new Error('No products.json (checked /tmp and data/)');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

async function loadProducts() {
  // Hit Airtable ONLY on an explicit catalog sync (SYNC_AIRTABLE=1), never on every
  // deploy. Vercel rebuilds on each push; fetching every time burned the monthly
  // Airtable API quota (429 PUBLIC_API_BILLING_LIMIT_EXCEEDED). Normal builds use the
  // committed data/products.json snapshot (0 API calls). Refresh catalog:
  //   SYNC_AIRTABLE=1 npm run build   → updates data/products.json → commit to publish.
  if (PAT && process.env.SYNC_AIRTABLE) {
    try {
      console.log('📦 Fetching products from Airtable (SYNC_AIRTABLE)…');
      const records = normalizeAirtable(await fetchProducts());
      console.log(`✓  ${records.length} products fetched from Airtable`);
      const snap = path.join(__dirname, '..', 'data', 'products.json');
      fs.writeFileSync(snap, JSON.stringify(records, null, 2), 'utf8');
      console.log('✓  snapshot written → data/products.json (commit to publish)');
      return records;
    } catch (err) {
      console.warn(`⚠  Airtable sync failed (${err.message}) — using committed snapshot`);
    }
  }
  const local = loadLocalProducts();
  console.log(`✓  ${local.length} products from committed snapshot (set SYNC_AIRTABLE=1 to refresh from Airtable)`);
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
  return `<a class="pc" data-cat="${esc(p.cat)}" href="/products/${esc(p.slug)}" style="text-decoration:none;color:inherit">
      <div class="pc-inner">
        <div class="pc-img" style="position:relative">${badge}${(() => {
          const orig = absImg(p.img), webp = webpSibling(orig);
          const a = `alt="${esc(name)} — AMBERRA amber jewelry" loading="lazy" width="400" height="400"`;
          return webp
            ? `<img src="${esc(webp)}" onerror="this.onerror=null;this.src='${esc(orig)}'" ${a}>`
            : `<img src="${esc(orig)}" ${a}>`;
        })()}</div>
        <div class="pc-label">
          <span class="pcat">${esc((p.cat || '').toUpperCase())}</span>
          <h3 class="pname">${esc(name)}</h3>
          <p class="pmaterial">${esc(p.material || '')}</p>
          <div class="pfoot"><span class="pprice" data-usd="${p.price}">$${p.price}</span></div>
        </div>
      </div>
    </a>`;
}

// ── index.html bestsellers (curated top 8, crawlable) ──────────────────────
function injectBestsellers(relFile, products) {
  const p = path.join(__dirname, '..', relFile);
  if (!fs.existsSync(p)) return;
  const html = fs.readFileSync(p, 'utf8');
  const si = html.indexOf('<!-- BS_START');
  const ei = html.indexOf('<!-- BS_END -->');
  if (si === -1 || ei === -1) return;
  const startClose = html.indexOf('-->', si) + 3;
  const withSlug = products.filter(x => x.slug);
  // Curated, category-balanced order: each row = earrings · bracelet · ring. All transparent-bg.
  const CURATED = [
    ['earrings', 'All-Seeing Eye'], ['bracelets', 'Empire of the Sun'], ['rings', 'All-Seeing Eye'],
    ['earrings', 'Amber Blossom'],  ['bracelets', 'Four Blessing'],     ['rings', 'Amber Clover Ring'],
  ];
  const pick = (cat, name) => withSlug.find(x => x.cat === cat && x.name === name);
  const list = CURATED.map(([c, n]) => pick(c, n)).filter(Boolean);
  const have = new Set(list);
  for (const x of withSlug) { if (list.length >= 6) break; if (!have.has(x)) list.push(x); } // fallback pad
  const cards = list.map(staticShopCard).join('\n      ');
  const out = html.slice(0, startClose) + '\n      ' + cards + '\n    ' + html.slice(ei);
  fs.writeFileSync(p, out, 'utf8');
  console.log(`✓  ${relFile} bestsellers injected (${list.length} cards)`);
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
  injectBestsellers('index.html', products);

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
