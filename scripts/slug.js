// scripts/slug.js — single source of product slugs for all build generators.
// api/products.js keeps an ESM copy; predeploy-check fails if the two ever diverge.
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

module.exports = { toSlug, assignSlugs };
