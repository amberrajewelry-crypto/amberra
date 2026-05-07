// scripts/generate-categories.js
// Generates static category pages: /rings, /earrings, /pendants, /bracelets, /chains
// Reads from Airtable at Vercel build time (same pattern as generate-products.js)
// Can also run locally: node scripts/generate-categories.js (reads /tmp/products.json if no PAT)

const fs   = require('fs');
const path = require('path');

const BASE_ID = 'apprPtQw98iLfe0rF';
const TABLE_ID = 'tblg9KjmXRv9u0dzv';
const PAT     = process.env.AIRTABLE_PAT;
const SITE    = 'https://www.amberrajewelry.com';
const TODAY   = new Date().toISOString().slice(0, 10);

const CATS = {
  rings:     { slug: 'rings',     label: 'Rings',     h1: 'Amber Rings',     desc: 'Handcrafted Baltic amber rings in sterling silver and gold. Each ring is unique — shaped by Balinese artisans in Ubud.',   metaTitle: 'Amber Rings | Handcrafted Baltic Amber | AMBERRA', metaDesc: 'Shop AMBERRA amber rings — handcrafted in Bali from natural Baltic amber and 925 sterling silver. Free worldwide shipping over $200.' },
  earrings:  { slug: 'earrings',  label: 'Earrings',  h1: 'Amber Earrings',  desc: 'Drop earrings, studs and hoops handcrafted from natural Baltic amber and sterling silver in the workshops of Ubud, Bali.', metaTitle: 'Amber Earrings | Handcrafted in Bali | AMBERRA',    metaDesc: 'Natural Baltic amber earrings handcrafted in Bali. Drop earrings, studs, filigree designs. 925 sterling silver. Free worldwide shipping over $200.' },
  pendants:  { slug: 'pendants',  label: 'Pendants',  h1: 'Amber Pendants',  desc: 'Pendant necklaces featuring natural Baltic amber in hand-forged silver settings. Unique pieces handcrafted in Bali.',    metaTitle: 'Amber Pendants & Necklaces | AMBERRA',             metaDesc: 'Baltic amber pendant necklaces handcrafted by Balinese artisans. Sterling silver settings, unique designs. Free worldwide shipping over $200.' },
  bracelets: { slug: 'bracelets', label: 'Bracelets', h1: 'Amber Bracelets', desc: 'Amber bracelets handcrafted in Bali — from delicate beaded designs to bold cuff bracelets in natural Baltic amber.',   metaTitle: 'Amber Bracelets | Handcrafted in Bali | AMBERRA',   metaDesc: 'Natural Baltic amber bracelets handcrafted in Ubud, Bali. Beaded, link and cuff styles in 925 sterling silver. Free worldwide shipping over $200.' },
  chains:    { slug: 'chains',    label: 'Chains',    h1: 'Silver Chains',   desc: 'Sterling silver chains handcrafted in Bali — wear alone or pair with any AMBERRA pendant.',                               metaTitle: 'Sterling Silver Chains | AMBERRA',                 metaDesc: 'Handcrafted sterling silver chains from Bali. Cable and link styles, perfect with AMBERRA amber pendants. Free worldwide shipping over $200.' },
};

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function cardHTML(p) {
  const badgeHTML = p.badge
    ? `<span class="pbadge ${esc(p.badge)}">${p.badge === 'bestseller' ? 'Bestseller' : p.badge === 'limited' ? 'Limited' : 'New'}</span>`
    : '';
  const img = p.img || '';
  const imgTag = img
    ? `<img src="${esc(img)}" alt="${esc(p.name)} — AMBERRA ${esc(p.cat)}" loading="lazy">`
    : `<div style="width:100%;height:100%;background:var(--mist)"></div>`;
  return `
    <div class="pc" onclick="openDrawer(${p.id})">
      <div class="pc-inner">
        <div class="pc-img">
          ${badgeHTML}
          <button class="pc-wish" onclick="event.stopPropagation();toggleWish(${p.id},this)" aria-label="Add to wishlist">
            <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </button>
          ${imgTag}
        </div>
        <div class="pc-label">
          <span class="pcat">${esc(p.cat)}</span>
          <span class="pname">${esc(p.name)}</span>
          <div class="pfoot"><span class="pprice">$${p.price}</span></div>
        </div>
      </div>
    </div>`;
}

function schemaJSON(cat, products) {
  const items = products.slice(0, 10).map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Product',
      name: p.name,
      description: p.desc || '',
      brand: { '@type': 'Brand', name: 'AMBERRA' },
      image: p.img ? [p.img] : [],
      offers: { '@type': 'Offer', priceCurrency: 'USD', price: String(p.price), availability: 'https://schema.org/InStock', url: `${SITE}/${cat.slug}` }
    }
  }));
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', '@id': `${SITE}/${cat.slug}#webpage`, url: `${SITE}/${cat.slug}`, name: cat.metaTitle, description: cat.metaDesc, breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Home', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE}/shop` }, { '@type': 'ListItem', position: 3, name: cat.label, item: `${SITE}/${cat.slug}` } ] } },
      { '@type': 'ItemList', '@id': `${SITE}/${cat.slug}#products`, name: `AMBERRA ${cat.label}`, itemListElement: items }
    ]
  }, null, 2);
}

function pageHTML(cat, products) {
  const cards = products.map(p => cardHTML(p)).join('\n');
  const schema = schemaJSON(cat, products);
  const count  = products.length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PJ5682RJ');</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(cat.metaTitle)}</title>
<meta name="description" content="${esc(cat.metaDesc)}">
<meta name="robots" content="index, follow">
<meta name="author" content="AMBERRA">
<link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
<link rel="canonical" href="${SITE}/${cat.slug}">
<link rel="alternate" hreflang="en" href="${SITE}/${cat.slug}">
<link rel="alternate" hreflang="x-default" href="${SITE}/${cat.slug}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="AMBERRA">
<meta property="og:title" content="${esc(cat.metaTitle)}">
<meta property="og:description" content="${esc(cat.metaDesc)}">
<meta property="og:url" content="${SITE}/${cat.slug}">
<meta property="og:image" content="${SITE}/images/og-cover.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(cat.metaTitle)}">
<meta name="twitter:image" content="${SITE}/images/og-cover.jpg">
<script type="application/ld+json">${schema}</script>
<script src="https://js-de.sentry-cdn.com/4685202527800b7a5362a10c52b9ba1b.min.js" crossorigin="anonymous" async></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Cormorant+SC:wght@300;400;500&family=Montserrat:wght@300;400;500&display=swap" rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Cormorant+SC:wght@300;400;500&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet"></noscript>
<link rel="stylesheet" href="/style.css?v=20260331">
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PJ5682RJ" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<canvas id="particles-canvas"></canvas>

<!-- ══ MOBILE NAV ════════════════════════════════════════════════════════ -->
<div class="mob-nav-overlay" id="mob-nav-overlay" onclick="closeMobNav()"></div>
<div class="mob-nav-drawer" id="mob-nav-drawer">
  <div class="mob-nav-head"><span class="mob-nav-logo">AMBERRA</span><button class="mob-nav-close" onclick="closeMobNav()">✕</button></div>
  <div class="mob-nav-links">
    <a class="mob-nav-link" href="/">Home</a>
    <a class="mob-nav-link" href="/shop">Shop All</a>
    <a class="mob-nav-link" href="/rings">Rings</a>
    <a class="mob-nav-link" href="/earrings">Earrings</a>
    <a class="mob-nav-link" href="/pendants">Pendants</a>
    <a class="mob-nav-link" href="/bracelets">Bracelets</a>
    <a class="mob-nav-link" href="/journal">Journal</a>
    <a class="mob-nav-link" href="/#about">Our Story</a>
    <a class="mob-nav-link amber" href="/#wholesale">Wholesale</a>
  </div>
  <div class="mob-nav-foot"><div class="mob-nav-utils">
    <button class="mob-nav-util" onclick="closeMobNav();openAcc()">My Account</button>
    <button class="mob-nav-util" onclick="closeMobNav();openSrv()">Services</button>
    <button class="mob-nav-util" onclick="closeMobNav();openReq()">Contact</button>
  </div></div>
</div>

<!-- ══ NAV ════════════════════════════════════════════════════════════════ -->
<div id="nav-shell" class="solid">
  <div class="nav-logo-bar">
    <div class="nav-lb-l">
      <button class="mob-menu-btn" onclick="openMobNav()"><svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
      <button class="nav-util-link keep" onclick="openSrv()"><span>Services</span></button>
      <button class="nav-util-link" onclick="openReq()"><span>Contact Us</span></button>
      <div class="nav-search-wrap"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input class="nav-search-inp" type="text" placeholder="Search"></div>
    </div>
    <a class="nav-logo" href="/"><span class="nav-logo-main">AMBERRA</span><span class="nav-logo-sub">Jewelry</span></a>
    <div class="nav-lb-r">
      <button class="nav-ico-btn" onclick="toggleWishView()"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg><span class="nav-badge" id="wish-badge">0</span></button>
      <button class="nav-ico-btn" onclick="openAcc()"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></button>
      <a class="nav-ico-btn" href="/stores"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></a>
      <button class="nav-ico-btn" onclick="openCart()"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg><span class="nav-badge" id="cart-badge">0</span></button>
    </div>
  </div>
  <div class="nav-main">
    <a class="nl" href="/our-story">Our Story</a>
    <a class="nl act" href="/${cat.slug}">${cat.label}</a>
    <a class="nl" href="/rings">Rings</a>
    <a class="nl" href="/earrings">Earrings</a>
    <a class="nl" href="/pendants">Pendants</a>
    <a class="nl" href="/bracelets">Bracelets</a>
    <span class="nav-divider"></span>
    <a class="nl" href="/#wholesale">Wholesale</a>
    <a class="nl" href="/journal">Journal</a>
  </div>
</div>

<!-- ══ CATEGORY HEADER ════════════════════════════════════════════════════ -->
<section id="cat-hero">
  <div class="cat-hero-inner">
    <span class="s-lbl">The Collection</span>
    <h1 class="cat-h1">${esc(cat.h1)}</h1>
    <p class="cat-sub">${esc(cat.desc)}</p>
    <p class="cat-count">${count} pieces</p>
  </div>
</section>

<!-- ══ BREADCRUMB ══════════════════════════════════════════════════════════ -->
<nav class="cat-breadcrumb" aria-label="Breadcrumb">
  <a href="/">Home</a> <span>/</span> <a href="/shop">Shop</a> <span>/</span> <span>${esc(cat.label)}</span>
</nav>

<!-- ══ PRODUCT GRID ════════════════════════════════════════════════════════ -->
<section id="catalog">
  <div class="prod-grid" id="prod-grid">
    ${cards}
  </div>
</section>

<!-- ══ FOOTER ════════════════════════════════════════════════════════════ -->
<footer>
  <div class="ft">
    <div>
      <div class="fb">AMBERRA</div>
      <p class="fd">Natural Baltic amber jewelry,<br>handcrafted in Bali with sacred intention.<br>Each piece is unique — like its wearer.</p>
      <div class="fs">
        <a href="https://instagram.com/amberra.jewelry" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>
        <a href="https://wa.me/6287853867120" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>
      </div>
    </div>
    <div>
      <span class="fc-t">Shop</span>
      <ul class="fc-l">
        <li><a href="/rings">Rings</a></li>
        <li><a href="/earrings">Earrings</a></li>
        <li><a href="/pendants">Pendants</a></li>
        <li><a href="/bracelets">Bracelets</a></li>
        <li><a href="/shop">All Jewelry</a></li>
      </ul>
    </div>
    <div>
      <span class="fc-t">Company</span>
      <ul class="fc-l">
        <li><a href="/our-story">Our Story</a></li>
        <li><a href="/journal">Journal</a></li>
        <li><a href="/stores">Stores</a></li>
        <li><a href="/#wholesale">Wholesale</a></li>
      </ul>
    </div>
    <div>
      <span class="fc-t">Support</span>
      <ul class="fc-l">
        <li><a href="javascript:openReq()">Contact Us</a></li>
        <li><a href="javascript:openSrv()">Services</a></li>
        <li><a href="/our-story">Care Guide</a></li>
      </ul>
    </div>
  </div>
  <div class="ft-bot">
    <span>© 2026 AMBERRA. All rights reserved.</span>
    <div class="ft-legal">
      <a href="javascript:openLegal('privacy')">Privacy Policy</a>
      <a href="javascript:openLegal('terms')">Terms of Service</a>
      <a href="javascript:openLegal('returns')">Returns</a>
    </div>
  </div>
</footer>

<!-- Shared modals from app.js (cart, drawer, services, etc.) are loaded via JS -->
<script src="/app.js" defer></script>
<script src="/shop.js" defer></script>
</body>
</html>`;
}

async function fetchFromAirtable() {
  let records = [];
  let offset  = null;
  do {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?pageSize=100${offset ? '&offset=' + offset : ''}`;
    const r   = await fetch(url, { headers: { Authorization: `Bearer ${PAT}` } });
    if (!r.ok) throw new Error(`Airtable ${r.status}: ${await r.text()}`);
    const data = await r.json();
    records    = records.concat(data.records || []);
    offset     = data.offset || null;
  } while (offset);

  return records.map((rec, i) => {
    const f = rec.fields;
    return {
      id:       i + 1,
      name:     f.Name || '',
      cat:      (f.Category || '').toLowerCase(),
      price:    f.Price || 0,
      badge:    f.Badge || null,
      img:      f.Image || '',
      desc:     f.Description || '',
      material: f.Material || '',
    };
  });
}

function loadLocalProducts() {
  // fallback: read from cached API response
  const localPath = '/tmp/products.json';
  if (!fs.existsSync(localPath)) throw new Error('No local products.json at /tmp/products.json');
  return JSON.parse(fs.readFileSync(localPath, 'utf8'));
}

async function main() {
  let products;
  if (PAT) {
    console.log('Fetching products from Airtable…');
    products = await fetchFromAirtable();
  } else {
    console.log('No AIRTABLE_PAT — using local /tmp/products.json');
    products = loadLocalProducts();
  }
  console.log(`${products.length} products loaded`);

  const ROOT = path.join(__dirname, '..');

  for (const [catKey, cat] of Object.entries(CATS)) {
    const catProducts = products.filter(p => p.cat === catKey);
    if (catProducts.length === 0) {
      console.log(`  skip ${catKey} — 0 products`);
      continue;
    }
    const html     = pageHTML(cat, catProducts);
    const outPath  = path.join(ROOT, `${catKey}.html`);
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`  ✓ ${catKey}.html — ${catProducts.length} products`);
  }

  // Update sitemap: add category URLs
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    let sitemap = fs.readFileSync(sitemapPath, 'utf8');
    // Remove existing category entries
    sitemap = sitemap.replace(/<url>\s*<loc>[^<]*(\/rings|\/earrings|\/pendants|\/bracelets|\/chains)<\/loc>[\s\S]*?<\/url>/g, '');
    const catEntries = Object.keys(CATS).map(slug => `  <url>
    <loc>${SITE}/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n');
    sitemap = sitemap.replace('</urlset>', `${catEntries}\n</urlset>`);
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log('  ✓ sitemap.xml updated with category URLs');
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(0); // non-fatal for Vercel
});
