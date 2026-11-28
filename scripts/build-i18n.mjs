#!/usr/bin/env node
// Build translated copies of the site: /ru/, /de/, /fr/, /es/ from the English
// pages + translation memory data/i18n/<lang>.json (keys from i18n-core.js).
//   node scripts/build-i18n.mjs extract   → data/i18n/source.json (all EN segments)
//   node scripts/build-i18n.mjs build     → <lang>/**.html + hreflang/switcher on EN pages
//   node scripts/build-i18n.mjs check     → coverage per language (missing keys)
// EN pages are only rewritten in place on Vercel (VERCEL=1) or with --en, so the
// repo's tracked sources stay clean locally.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parseHTML } = require('linkedom');
const core = require('../i18n-core.js');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE = 'https://www.amberrajewelry.com';
export const LANGS = ['ru', 'de', 'fr', 'es', 'it', 'pt', 'tr', 'ar', 'zh', 'ja', 'ko', 'id', 'hi', 'ka'];
const NAMES = { en: 'English', ru: 'Русский', de: 'Deutsch', fr: 'Français', es: 'Español', it: 'Italiano', pt: 'Português', tr: 'Türkçe', ar: 'العربية', zh: '中文', ja: '日本語', ko: '한국어', id: 'Bahasa Indonesia', hi: 'हिन्दी', ka: 'ქართული' };
const DIRS = ['products', 'journal', 'collections', 'amber', 'shop'];
const EXCLUDE = new Set(['about.html', 'catalog.html', 'demo-fluid.html', 'scroll-scrub.html',
  'index-mobile.html', 'index-raw.html', 'index-redirect.html']);
const I18N_DIR = path.join(ROOT, 'data', 'i18n');
const META_SEL = ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]',
  'meta[name="twitter:title"]', 'meta[name="twitter:description"]', 'meta[property="og:image:alt"]'];

function pages() {
  const out = fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && !EXCLUDE.has(f) && !/^google[0-9a-f]+\.html$/.test(f));
  for (const d of DIRS) {
    const dir = path.join(ROOT, d);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.html')) out.push(`${d}/${f}`);
  }
  return out.sort();
}
// file → clean URL path ('index.html' → '/', 'shop/rings.html' → '/shop/rings')
const urlPath = f => (f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, '').replace(/\/index$/, ''));

function load(file) {
  return parseHTML(fs.readFileSync(path.join(ROOT, file), 'utf8')).document;
}
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = s => esc(s).replace(/"/g, '&quot;');

// Visit every translatable unit of a document.
function visit(doc, { seg, text, attr }) {
  const title = doc.querySelector('title');
  if (title && core.translatable(title.textContent)) attr(title, '#text', core.norm(title.textContent).trim());
  for (const sel of META_SEL) for (const m of doc.querySelectorAll(sel)) {
    const v = m.getAttribute('content');
    if (v && core.translatable(v)) attr(m, 'content', core.norm(v).trim());
  }
  const body = doc.body;
  if (!body) return;
  for (const el of body.querySelectorAll('[title],[alt],[placeholder],[aria-label]')) {
    for (const a of core.ATTRS) {
      const v = el.getAttribute(a);
      if (v && core.translatable(v)) attr(el, a, core.norm(v).trim());
    }
  }
  core.walk(body, seg, text);
}

function extract() {
  const src = {};
  const add = (k, file) => { if (!k) return; (src[k] ||= []).includes(file) || src[k].push(file); };
  for (const f of pages()) {
    visit(load(f), {
      seg: (el, s) => add(s.key, f),
      text: n => add(core.norm(core.textOf(n)).trim(), f),
      attr: (el, a, v) => add(v, f),
    });
  }
  // dynamic content rendered by JS (drawer, cards, quick view) comes from these
  const prods = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'products.json'), 'utf8'));
  const list = Array.isArray(prods) ? prods : prods.products || [];
  for (const p of list) for (const k of ['material', 'desc', 'description', 'stone', 'metal', 'closure', 'chain', 'collection']) {
    const v = p[k];
    if (typeof v === 'string' && core.translatable(v)) add(core.norm(v).trim(), 'data/products.json');
  }
  const extra = path.join(I18N_DIR, 'runtime-strings.json'); // collected from rendered pages
  if (fs.existsSync(extra)) for (const k of JSON.parse(fs.readFileSync(extra, 'utf8'))) add(k, 'runtime');
  fs.mkdirSync(I18N_DIR, { recursive: true });
  fs.writeFileSync(path.join(I18N_DIR, 'source.json'), JSON.stringify(src, null, 1));
  const words = Object.keys(src).reduce((n, k) => n + k.split(/\s+/).length, 0);
  console.log(`✓ ${Object.keys(src).length} segments, ~${words} words from ${pages().length} pages`);
}

function dict(lang) {
  const f = path.join(I18N_DIR, `${lang}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
}

// Rebuild a segment element from a translated placeholder string, reusing the
// original inline nodes (same algorithm as the browser runtime i18n.js).
function applySeg(el, s, v) {
  const tree = core.parse(v);
  if (!tree) return false;
  const doc = el.ownerDocument, used = new Set();
  const build = nodes => {
    const out = [];
    for (const n of nodes) {
      if (n.t !== undefined) { out.push(doc.createTextNode(n.t)); continue; }
      const p = s.parts[n.i];
      if (!p || used.has(n.i)) return null;
      used.add(n.i);
      if (!n.atom) {
        const inner = build(n.kids);
        if (!inner) return null;
        while (p.firstChild) p.removeChild(p.firstChild);
        inner.forEach(x => p.appendChild(x));
      }
      out.push(p);
    }
    return out;
  };
  const nodes = build(tree.kids);
  if (!nodes) return false;
  if (s.lead) nodes.unshift(doc.createTextNode(' '));
  if (s.trail) nodes.push(doc.createTextNode(' '));
  while (el.firstChild) el.removeChild(el.firstChild);
  nodes.forEach(x => el.appendChild(x));
  return true;
}

const PAGE_SET = new Set();
const DYN = new Set(); // keys inside [data-i18n]: app.js rewrites them after load
const VER = (process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now())).slice(0, 8);
function localizeHref(href, lang) {
  if (!href) return href;
  let h = href, abs = false;
  if (h.startsWith(SITE)) { h = h.slice(SITE.length) || '/'; abs = true; }
  if (!h.startsWith('/') || h.startsWith('//')) return href;
  const m = h.match(/^([^?#]*)(.*)$/);
  const p = m[1].replace(/\.html$/, '').replace(/\/$/, '') || '/';
  if (!PAGE_SET.has(p)) return href;
  const out = `/${lang}${p === '/' ? '' : p}${m[2]}`;
  return abs ? SITE + out : out;
}

function hreflangBlock(p) {
  const u = l => `${SITE}${l === 'en' ? '' : '/' + l}${p === '/' ? (l === 'en' ? '/' : '') : p}`;
  return ['en', ...LANGS].map(l => `<link rel="alternate" hreflang="${l}" href="${u(l)}">`).join('')
    + `<link rel="alternate" hreflang="x-default" href="${u('en')}">`;
}

function switcher(p, cur) {
  const u = l => `${l === 'en' ? '' : '/' + l}${p === '/' ? (l === 'en' ? '/' : '') : p}`;
  const a = ['en', ...LANGS].map(l => l === cur
    ? `<span aria-current="true">${NAMES[l]}</span>`
    : `<a href="${u(l)}" hreflang="${l}" lang="${l}" onclick="document.cookie='amb_lang=${l};path=/;max-age=31536000;samesite=lax'">${NAMES[l]}</a>`).join('');
  return `<nav class="amb-langs" translate="no" aria-label="Language">${a}</nav>`;
}
const SWITCH_CSS = '<style>.amb-langs{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 18px;padding:18px 16px 26px;font:400 12px/1.6 Montserrat,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}.amb-langs a,.amb-langs span{color:inherit;text-decoration:none;opacity:.7}.amb-langs a:hover{opacity:1;text-decoration:underline}.amb-langs span{opacity:1;border-bottom:1px solid currentColor}</style>';

function decorate(doc, p, lang) {
  const head = doc.head;
  for (const l of doc.querySelectorAll('link[rel="alternate"][hreflang]')) l.remove();
  doc.documentElement.setAttribute('lang', lang);
  if (lang === 'ar') doc.documentElement.setAttribute('dir', 'rtl');
  // invisible SEO: og:locale (+ alternates) and JSON-LD inLanguage follow the page language
  const LOC = { en: 'en_US', ru: 'ru_RU', de: 'de_DE', fr: 'fr_FR', es: 'es_ES', it: 'it_IT', pt: 'pt_BR', tr: 'tr_TR',
    ar: 'ar_AE', zh: 'zh_CN', ja: 'ja_JP', ko: 'ko_KR', id: 'id_ID', hi: 'hi_IN', ka: 'ka_GE' };
  for (const m of doc.querySelectorAll('meta[property="og:locale"],meta[property="og:locale:alternate"]')) m.remove();
  head.insertAdjacentHTML('beforeend', `<meta property="og:locale" content="${LOC[lang]}">`
    + ['en', ...LANGS].filter(l => l !== lang).map(l => `<meta property="og:locale:alternate" content="${LOC[l]}">`).join(''));
  if (lang !== 'en') for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) {
    s.textContent = s.textContent.replace(/("inLanguage"\s*:\s*)"en(?:-[A-Z]{2})?"/g, `$1"${lang}"`);
  }
  const pin = `<script>try{localStorage.setItem('amb_lang','${lang}')}catch(e){}</script>`;
  head.insertAdjacentHTML('afterbegin', pin);
  head.insertAdjacentHTML('beforeend', hreflangBlock(p) + SWITCH_CSS);
  const foot = doc.querySelector('footer') || doc.body;
  foot.insertAdjacentHTML('beforeend', switcher(p, lang));
}

function build() {
  const files = pages();
  for (const f of files) PAGE_SET.add(urlPath(f));
  const onVercel = process.env.VERCEL === '1' || process.argv.includes('--en');
  const report = [];
  for (const lang of LANGS) {
    const d = dict(lang);
    let hit = 0, miss = 0;
    for (const f of files) {
      const doc = load(f), p = urlPath(f);
      const segs = [], texts = [], attrs = [];
      visit(doc, { seg: (el, s) => segs.push([el, s]), text: n => texts.push(n), attr: (el, a, v) => attrs.push([el, a, v]) });
      for (const [el, a, v] of attrs) {
        const t = core.lookup(d, v);
        if (!t) { miss++; continue; }
        hit++;
        if (a === '#text') el.textContent = t; else el.setAttribute(a, t);
      }
      for (const [el, s] of segs) {
        if (el.closest && el.closest('[data-i18n],[data-i18n-ph]')) DYN.add(s.key);
        const t = core.lookup(d, s.key);
        if (t && applySeg(el, s, t)) hit++; else miss++;
      }
      for (const n of texts) {
        const raw = core.textOf(n), k = core.norm(raw).trim(), t = core.lookup(d, k);
        if (!t) { miss++; continue; }
        hit++;
        n.nodeValue = (/^\s/.test(raw) ? ' ' : '') + t + (/\s$/.test(raw) ? ' ' : '');
      }
      // JSON-LD: translate string values that exist in the memory (descriptions, FAQ, breadcrumbs)
      for (const sc of doc.querySelectorAll('script[type="application/ld+json"]')) {
        try {
          const tr = v => (typeof v === 'string' ? (core.lookup(d, core.norm(v).trim()) || v)
            : Array.isArray(v) ? v.map(tr) : v && typeof v === 'object'
              ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, (k === 'url' || k === '@id' || k === 'item') && typeof x === 'string' && !/#(organization|website|logo)$/.test(x) ? localizeHref(x, lang) : /^(@context|@type|@id|url|image|logo|sku|gtin|mpn|priceCurrency|price|email|telephone|sameAs|contentUrl)$/.test(k) ? x : tr(x)])) : v);
          sc.textContent = JSON.stringify(tr(JSON.parse(sc.textContent)));
        } catch (e) { if (process.env.I18N_DEBUG) console.error("ld+json", f, e.message); }
      }
      for (const a of doc.querySelectorAll('a[href]')) a.setAttribute('href', localizeHref(a.getAttribute('href'), lang));
      const canon = `${SITE}/${lang}${p === '/' ? '' : p}`;
      const c = doc.querySelector('link[rel="canonical"]');
      if (c) c.setAttribute('href', canon);
      const og = doc.querySelector('meta[property="og:url"]');
      if (og) og.setAttribute('content', canon);
      decorate(doc, p, lang);
      const body = doc.body;
      doc.documentElement.setAttribute('data-i18nv', VER);
      body.insertAdjacentHTML('beforeend', `<script src="/i18n-core.js?v=${VER}" defer></script><script src="/i18n.js?v=${VER}" defer></script>`);
      const out = path.join(ROOT, lang, f);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, doc.toString());
    }
    report.push(`${lang}: ${hit}/${hit + miss} units (${(100 * hit / Math.max(hit + miss, 1)).toFixed(1)}%)`);
    // slim runtime dictionary: only what JS renders after load
    const src = JSON.parse(fs.readFileSync(path.join(I18N_DIR, 'source.json'), 'utf8'));
    const rt = {};
    for (const [k, where] of Object.entries(src)) {
      if (where.includes('data/products.json') || where.includes('runtime') || where.length >= 20 || DYN.has(k) || (k.length <= 60 && !/<\d/.test(k))) {
        const t = core.lookup(d, k);
        if (t) rt[k] = t;
      }
    }
    // inline parts of translated segments ('<0>Home</0> <1>Shop</1>' → Home, Shop):
    // app.js rewrites single [data-i18n] links with its own partial tables, so the
    // runtime layer must know each part on its own.
    const leaf = s => (/<\/?\d+\/?>/.test(s) ? null : s.trim());
    for (const [k, v] of Object.entries(d)) {
      if (!/<\d+>/.test(k) || !core.lookup(d, k)) continue;
      const a = core.parse(k), b = core.parse(v);
      if (!a || !b) continue;
      const map = new Map();
      const grab = (n, into) => n.kids.forEach(c => { if (c.i !== undefined && !c.atom) { into.set(c.i, c.kids.map(x => (x.t !== undefined ? x.t : '<n>')).join('')); grab(c, into); } });
      const ma = new Map(), mb = new Map();
      grab(a, ma); grab(b, mb);
      for (const [i, en] of ma) {
        const e = leaf(en), t = leaf(mb.get(i) || '');
        if (e && t && !e.includes('<n>') && !t.includes('<n>') && core.translatable(e) && !(e in rt)) map.set(e, t);
      }
      for (const [e, t] of map) rt[e] = t;
    }
    fs.mkdirSync(path.join(ROOT, 'i18n'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'i18n', `${lang}.json`), JSON.stringify(rt));
  }
  const routes = fs.readFileSync(path.join(ROOT, 'middleware.js'), 'utf8');
  const missingRoutes = [...PAGE_SET].filter(p => !/^\/(products|journal|collections|amber|shop)\//.test(p) && !routes.includes(`'${p}'`));
  if (missingRoutes.length) console.warn('⚠  middleware.js ROOT_PAGES lacks: ' + missingRoutes.join(' '));
  const sm = path.join(ROOT, 'sitemap.xml');
  if (onVercel && fs.existsSync(sm)) {
    const urls = [...PAGE_SET].flatMap(p => LANGS.map(l => `<url><loc>${SITE}/${l}${p === '/' ? '' : p}</loc></url>`)).join('\n');
    fs.writeFileSync(sm, fs.readFileSync(sm, 'utf8').replace('</urlset>', urls + '\n</urlset>'));
  }
  if (onVercel) for (const f of files) {
    const doc = load(f);
    decorate(doc, urlPath(f), 'en');
    fs.writeFileSync(path.join(ROOT, f), doc.toString());
  }
  console.log(`✓ i18n: ${files.length} pages × ${LANGS.length} langs${onVercel ? ' + EN hreflang' : ''}\n  ` + report.join('\n  '));
}

function check() {
  const src = JSON.parse(fs.readFileSync(path.join(I18N_DIR, 'source.json'), 'utf8'));
  let bad = 0;
  for (const lang of LANGS) {
    const d = dict(lang);
    const missing = Object.keys(src).filter(k => !core.lookup(d, k));
    if (missing.length) bad++;
    console.log(`${lang}: ${Object.keys(src).length - missing.length}/${Object.keys(src).length}` + (missing.length ? `  missing e.g. ${JSON.stringify(missing.slice(0, 3))}` : ' ✓'));
  }
  process.exitCode = bad ? 1 : 0;
}

const cmd = process.argv[2] || 'build';
({ extract, build, check })[cmd]();
