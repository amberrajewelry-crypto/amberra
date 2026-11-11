#!/usr/bin/env node
// Sets sitemap <lastmod> to the date a page's CONTENT last changed, not the build date.
// State: data/lastmod.json {url: {hash, date}} — commit it after running locally.
// Hash ignores ?v= cache-busters and ISO dates, so version bumps don't fake freshness.
// Usage: node scripts/sitemap-lastmod.mjs [--seed-rev <git-rev>]
//   --seed-rev: first run only — pages identical to <rev> keep their current sitemap date.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const SITE = 'https://www.amberrajewelry.com';
const SITEMAP = 'sitemap.xml';
const STATE = 'data/lastmod.json';
const TODAY = new Date().toISOString().slice(0, 10);

export const normalize = html => html
  .replace(/\?v=[\w.-]+/g, '')
  .replace(/\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?/g, '');
const hash = s => createHash('sha1').update(normalize(s)).digest('hex');

export function fileFor(loc) {
  const p = loc.replace(SITE, '').replace(/^\/|\/$/g, '');
  if (!p) return 'index.html';
  return existsSync(`${p}.html`) ? `${p}.html` : `${p}/index.html`;
}

function main() {
  const seedIdx = process.argv.indexOf('--seed-rev');
  const seedRev = seedIdx > 0 ? process.argv[seedIdx + 1] : null;
  const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : {};
  let changed = 0;

  const sm = readFileSync(SITEMAP, 'utf8').replace(
    /<url>\s*<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]*)<\/lastmod>)?/g,
    (m, loc, oldDate) => {
      const file = fileFor(loc);
      if (!existsSync(file)) return m;
      const h = hash(readFileSync(file, 'utf8'));
      let entry = state[loc];
      if (!entry && seedRev) {
        try {
          const old = execFileSync('git', ['show', `${seedRev}:${file}`], { encoding: 'utf8', maxBuffer: 64 << 20 });
          if (hash(old) === h && oldDate) entry = { hash: h, date: oldDate };
        } catch { /* file absent at seed rev → treat as new */ }
      }
      if (!entry || entry.hash !== h) { entry = { hash: h, date: TODAY }; changed++; }
      state[loc] = entry;
      return `<url>\n    <loc>${loc}</loc>\n    <lastmod>${entry.date}</lastmod>`;
    });

  writeFileSync(SITEMAP, sm);
  writeFileSync(STATE, JSON.stringify(state, null, 1) + '\n');
  console.log(`✓ sitemap lastmod: ${changed} page(s) dated ${TODAY}, ${Object.keys(state).length} tracked`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
