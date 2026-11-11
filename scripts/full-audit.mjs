#!/usr/bin/env node
// Full-site consistency & visibility audit across every real HTML page.
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const SKIP = ['.vercel', '.superpowers', 'node_modules', 'graphify-out', '.git'];
const isBackup = p => /_backup|-bak|\.bak/.test(p);

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    if (SKIP.includes(e) || isBackup(e)) continue;
    const fp = join(dir, e);
    const st = statSync(fp);
    if (st.isDirectory()) walk(fp, acc);
    else if (e.endsWith('.html')) acc.push(fp);
  }
  return acc;
}

const files = walk(ROOT).sort();
const BASE = 'https://www.amberrajewelry.com';
const urlOf = fp => {
  let u = fp.replace(ROOT, '/').replace(/index\.html$/, '').replace(/\.html$/, '');
  return u === '/' ? '/' : u.replace(/\/$/, '');
};

const m1 = (h, re) => (h.match(re) || [])[1]?.trim();
const AU_UK = /australia|jewellery-uk|united-kingdom/i; // pages allowed BE spelling

const rows = [];
for (const fp of files) {
  const h = readFileSync(fp, 'utf8');
  const url = urlOf(fp);
  const title = m1(h, /<title[^>]*>([^<]*)<\/title>/i) || '';
  const desc = m1(h, /<meta\s+name=["']description["']\s+content="([^"]*)"/i) || '';
  const canon = m1(h, /<link\s+rel=["']canonical["']\s+href="([^"]*)"/i) || '';
  const h1n = (h.match(/<h1[\s>]/gi) || []).length;
  const og = /og:image/.test(h);
  const jsonld = (h.match(/application\/ld\+json/gi) || []).length;
  const noindex = /noindex/i.test(h);
  const hreflang = (h.match(/hreflang=/gi) || []).length;
  const canonOk = canon === BASE + (url === '/' ? '/' : url) || canon === BASE + url + '/';
  const beSpell = !AU_UK.test(fp) && /\b(jewellery|colour|favourite)\b/i.test(
    h.replace(/<a[^>]*australia[^<]*<\/a>/gi, '').replace(/hreflang=["']en-AU["'][^>]*/gi, '')
  );
  const falseClaim = /Blessing:'|Sacred Spring Ritual|Sun & Moon Ritual|handcrafted with sacred|Bali Temple Necklace|\bUbud\b/i.test(h);
  rows.push({ url, title, desc, titleLen: title.length, descLen: desc.length, canon, canonOk, h1n, og, jsonld, noindex, hreflang, beSpell, falseClaim });
}

// --- aggregate problems ---
const byTitle = {}, byDesc = {};
rows.forEach(r => { if (r.title) (byTitle[r.title] ??= []).push(r.url); if (r.desc) (byDesc[r.desc] ??= []).push(r.url); });
const dupTitles = Object.entries(byTitle).filter(([, u]) => u.length > 1);
const dupDescs = Object.entries(byDesc).filter(([, u]) => u.length > 1);

const P = (label, list) => { if (list.length) { console.log(`\n### ${label} (${list.length})`); list.slice(0, 40).forEach(x => console.log('  ' + x)); if (list.length > 40) console.log(`  … +${list.length - 40}`); } };

console.log(`AUDIT: ${rows.length} страниц\n${'='.repeat(50)}`);
P('НЕТ <title>', rows.filter(r => !r.title).map(r => r.url));
P('title слишком длинный >62', rows.filter(r => r.titleLen > 62).map(r => `${r.url}  (${r.titleLen})`));
P('НЕТ meta description', rows.filter(r => !r.desc).map(r => r.url));
P('desc вне 120-160', rows.filter(r => r.desc && (r.descLen < 110 || r.descLen > 165)).map(r => `${r.url}  (${r.descLen})`));
P('дубли title', dupTitles.map(([t, u]) => `"${t.slice(0, 45)}" ×${u.length}: ${u.slice(0, 4).join(', ')}`));
P('дубли description', dupDescs.map(([, u]) => `×${u.length}: ${u.slice(0, 4).join(', ')}`));
P('canonical отсутствует/не self', rows.filter(r => !r.canonOk).map(r => `${r.url}  [${r.canon || 'нет'}]`));
P('H1 != 1', rows.filter(r => r.h1n !== 1).map(r => `${r.url}  (h1×${r.h1n})`));
P('НЕТ og:image', rows.filter(r => !r.og).map(r => r.url));
P('НЕТ JSON-LD', rows.filter(r => !r.jsonld).map(r => r.url));
P('noindex (проверить намеренность)', rows.filter(r => r.noindex).map(r => r.url));
P('BE-орфография на US-странице', rows.filter(r => r.beSpell).map(r => r.url));
P('ОСТАТОК ложных заявлений', rows.filter(r => r.falseClaim).map(r => r.url));
P('НЕТ hreflang', rows.filter(r => !r.hreflang).map(r => r.url));

console.log(`\n${'='.repeat(50)}\nСВОДКА: title-нет:${rows.filter(r=>!r.title).length} desc-нет:${rows.filter(r=>!r.desc).length} canon-плохо:${rows.filter(r=>!r.canonOk).length} og-нет:${rows.filter(r=>!r.og).length} jsonld-нет:${rows.filter(r=>!r.jsonld).length} H1≠1:${rows.filter(r=>r.h1n!==1).length} дубли-title:${dupTitles.length} ложь:${rows.filter(r=>r.falseClaim).length}`);
