import fallbackProducts from '../data/products.json';

const IMG_EXTRAS = {
  'Morning Dew': ['/images/earrings/morning-dew-2.jpg'], // leaf_eye_butter_rg
};

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
      return res.status(200).json(fallbackProducts);
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

    res.status(200).json(products);
  } catch (err) {
    // On any failure, still serve products from the bundled snapshot rather than an empty catalog.
    res.setHeader('X-Data-Source', 'fallback-error');
    res.status(200).json(fallbackProducts);
  }
}
