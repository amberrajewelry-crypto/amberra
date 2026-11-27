import fallbackProducts from '../data/products.json';
import NORM_LIST from '../data/img-norm.json';

const IMG_EXTRAS = {
  'Morning Dew': ['/images/earrings/morning-dew-2.jpg'], // leaf_eye_butter_rg
};

// ponytail: mirror of generate-products.js assignSlugs/toSlug — keep in sync so
// live cards link to the same /products/<slug> pages as the static HTML.
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
// Airtable still holds dead-host URLs (amberra-jewelry.com/img/NUM.jpg); every one has a local
// /images/products/NUM.webp (same mapping as scripts/generate-products.js absImg).
// ponytail: assumes the webp exists; add an existence list if new Airtable images skip the export.
const OLD_IMG = /^https?:\/\/(?:www\.)?amberra-?jewelry\.com\/img\/(\d+)\.(?:jpe?g|png)$/i;
// Airtable also holds relative local paths ("images/earrings/IMG_9622.JPG"): the jpg/png originals
// are not deployed (404) and relative URLs break on nested pages; every one has a .webp sibling.
const LOCAL_IMG = /^\/?(images\/.+)\.(?:jpe?g|png)$/i;
export function normImg(u) {
  const s = String(u || '');
  const m = s.match(OLD_IMG);
  if (m) return `/images/products/${m[1]}.webp?v=10`;
  const l = s.match(LOCAL_IMG);
  return l ? `/${l[1]}.webp` : u;
}

// Normalized photos (transparent bg, centered, same fill) live at "<name>-n.webp" — see scripts/img-norm.js
const NORM = new Set(NORM_LIST);
const NORM_RE = /^(.*?\/)?(images\/[^?#"]+?)\.(?:webp|jpe?g|png)(?:\?[^#"]*)?$/i;
function nimg(u) {
  const m = String(u || '').match(NORM_RE);
  if (!m || !NORM.has(m[2] + '.webp')) return u;
  return (m[1] || '/') + m[2] + '-n.webp';
}

function normImgs(products) {
  for (const p of products) {
    p.img = nimg(normImg(p.img));
    if (Array.isArray(p.imgs)) p.imgs = p.imgs.map((u) => nimg(normImg(u)));
  }
  return products;
}

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

  const BASE_ID = 'apprPtQw98iLfe0rF';
  const TABLE_ID = 'tblg9KjmXRv9u0dzv';
  const PAT = process.env.AIRTABLE_PAT;

  if (!PAT) {
    return res.status(500).json({ error: 'AIRTABLE_PAT not configured' });
  }

  try {
    let records = [];
    let offset = null;

    do {
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?pageSize=100${offset ? '&offset=' + offset : ''}`;
      const r = await fetch(url, {
        headers: { 'Authorization': `Bearer ${PAT}` }
      });
      if (!r.ok) break; // Airtable error (e.g. 429 monthly limit) — fall back below
      const data = await r.json();
      records = records.concat(data.records || []);
      offset = data.offset || null;
    } while (offset);

    // Never leave the catalog empty: if Airtable returned nothing, serve the bundled snapshot.
    if (!records.length) {
      res.setHeader('X-Data-Source', 'fallback');
      return res.status(200).json(assignSlugs(normImgs(fallbackProducts)));
    }

    const products = records.map((rec, i) => {
      const f = rec.fields;
      const props = {};
      if (f.Stone)      props.Stone = f.Stone;
      if (f.Metal)      props.Metal = f.Metal;
      if (f.Collection) props.Collection = f.Collection;
      if (f.Closure)    props.Closure = f.Closure;
      if (f.Chain)      props.Chain = f.Chain;

      return {
        id: i + 1,
        name: f.Name || '',
        cat: f.Category || '',
        price: f.Price || 0,
        badge: f.Badge || null,
        img: f.Image || '',
        imgs: [f.Image, ...(IMG_EXTRAS[f.Name] || [])].filter(Boolean),
        material: f.Material || '',
        desc: f.Description || '',
        props
      };
    });

    assignSlugs(normImgs(products));
    res.status(200).json(products);
  } catch (err) {
    // On any failure, still serve products from the bundled snapshot rather than an empty catalog.
    res.setHeader('X-Data-Source', 'fallback-error');
    res.status(200).json(assignSlugs(normImgs(fallbackProducts)));
  }
}
