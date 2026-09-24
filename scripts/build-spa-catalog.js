#!/usr/bin/env node
// Unifies the amberra.css SPA catalog (about/catalog/contact/tryon + amberra.js)
// onto the single source of truth data/products.json (94 products).
// Replaces the legacy inline `const products=[...]` (24 Bali-legacy items) and
// empties `const PROD_I18N={...}` so tp() falls back to English names.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/products.json'), 'utf8'));

// SPA filter tabs are: all|rings|earrings|pendants|bracelets|necklaces.
// products.json uses `chains`; chains are worn as necklaces → map for the filter.
const CAT_MAP = { chains: 'necklaces' };

const spa = P.map(p => ({
  id: p.id,
  name: p.name,
  cat: CAT_MAP[p.cat] || p.cat,
  material: p.material,
  price: p.price,
  badge: p.badge || null,
  desc: p.desc || '',
  img: p.img,
  props: p.props || {},
}));

const productsLiteral = 'const products=' + JSON.stringify(spa) + ';';
const prodI18nLiteral = 'const PROD_I18N={};';

const TARGETS = ['catalog.html', 'about.html', 'contact.html', 'tryon.html'];

let report = [];
for (const file of TARGETS) {
  const fp = path.join(ROOT, file);
  const lines = fs.readFileSync(fp, 'utf8').split('\n');

  // --- replace products array (multi-line: `const products=[` … line `];`) ---
  const pi = lines.findIndex(l => l.includes('const products=['));
  if (pi === -1) { report.push(`${file}: SKIP (no products array)`); continue; }
  let pe = -1;
  for (let i = pi; i < lines.length; i++) { if (lines[i].trim() === '];') { pe = i; break; } }
  if (pe === -1) throw new Error(`${file}: products array close '];' not found`);
  const oldCount = lines.slice(pi, pe + 1).join('').match(/\bid:\d+/g)?.length || 0;
  lines.splice(pi, pe - pi + 1, productsLiteral);

  // --- empty PROD_I18N (single line `const PROD_I18N={…};`) ---
  const j = lines.findIndex(l => l.startsWith('const PROD_I18N='));
  if (j !== -1) lines[j] = prodI18nLiteral;

  fs.writeFileSync(fp, lines.join('\n'));
  report.push(`${file}: ${oldCount} → ${spa.length} товаров, PROD_I18N ${j !== -1 ? 'обнулён' : '—'}`);
}

const catCount = {};
spa.forEach(p => catCount[p.cat] = (catCount[p.cat] || 0) + 1);
console.log(report.join('\n'));
console.log('категории SPA:', JSON.stringify(catCount));
