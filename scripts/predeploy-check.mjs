#!/usr/bin/env node
/**
 * Amberra pre-deploy check — строгие ворота перед `vercel deploy --prod`.
 * Ловит ровно те грабли, что уже били: рассинхрон cache-buster, старые CTA,
 * BE-орфографию, SEO-дыры (og/schema), битые локальные ссылки на ассеты.
 *
 * Usage: node scripts/predeploy-check.js            # проверить весь сайт
 *        node scripts/predeploy-check.js --strict    # exit 1 при любом WARN
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const STRICT = process.argv.includes('--strict');
const ROOT = process.cwd();
const html = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

// SEO-критичные страницы, у которых обязаны быть og:image + JSON-LD
const SEO_PAGES = ['index', 'shop', 'journal', 'our-story', 'stores', 'about', 'catalog', 'contact', 'tryon'];

// 1. Cache-buster: все локальные css/js должны быть на ОДНОЙ версии
const verMap = new Map(); // asset -> Set(versions)
for (const f of html) {
  const src = readFileSync(join(ROOT, f), 'utf8');
  const re = /(?:src|href)="((?:\.?\/)?(?:js\/)?[\w-]+\.(?:css|js))\?v=([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) {
    const [, asset, ver] = m;
    if (!verMap.has(asset)) verMap.set(asset, new Set());
    verMap.get(asset).add(ver);
  }
  // локальный css/js без ?v= — риск вечного кеша
  const noVer = /(?:src|href)="((?:\.?\/)?(?:js\/)?[\w-]+\.(?:css|js))"/g;
  let n;
  while ((n = noVer.exec(src))) err(`${f}: ${n[1]} без ?v= (cache-buster) — вечный кеш`);
}
for (const [asset, vers] of verMap) {
  if (vers.size > 1) err(`cache-buster рассинхрон: ${asset} имеет версии [${[...vers].join(', ')}] — часть страниц на старом ассете`);
}

// 2. Старые/разнобойные CTA (после блока A должны исчезнуть)
const DEAD_CTA = ['Book a Consultation', 'Request a Personal Consultation', 'Request Partnership'];
// 3. BE-орфография (сайт .com → AE); Wikipedia-URL легитимен
const BE_WORDS = [/\bjewellery\b/gi, /\bcolour\b/g, /\bfibre\b/g];
for (const f of html) {
  const src = readFileSync(join(ROOT, f), 'utf8');
  for (const cta of DEAD_CTA) if (src.includes(cta)) err(`${f}: устаревший CTA "${cta}" (блок A)`);
  for (const re of BE_WORDS) {
    const hits = (src.match(re) || []).filter((h) => !src.includes(`wiki/${h[0].toUpperCase()}${h.slice(1)}`));
    // отфильтровать Wikipedia-URL по контексту строки
    const lines = src.split('\n');
    for (let i = 0; i < lines.length; i++) {
      // AU/UK-лендинг и ссылки на него (анкор /amber-jewellery-australia, hreflang en-AU) — BE намеренно
      const beOk = f === 'amber-jewellery-australia.html' || /amber-jewellery-australia|en-AU/i.test(lines[i]);
      if (re.test(lines[i]) && !/wiki\/Jewellery|wikipedia/i.test(lines[i]) && !beOk)
        warn(`${f}:${i + 1}: BE-орфография "${lines[i].match(re)?.[0]}"`);
      re.lastIndex = 0;
    }
  }
}

// 4. SEO-дыры: og:image + JSON-LD на ключевых страницах
for (const p of SEO_PAGES) {
  const f = `${p}.html`;
  if (!existsSync(join(ROOT, f))) continue;
  const src = readFileSync(join(ROOT, f), 'utf8');
  if (!/<title>[^<]{10,70}<\/title>/.test(src)) warn(`${f}: title вне 10–70 символов`);
  if (!/name="description"/.test(src)) err(`${f}: нет meta description`);
  if (!/rel="canonical"/.test(src)) err(`${f}: нет canonical`);
  if (!/og:image/.test(src)) warn(`${f}: нет og:image (плохое превью в соцсетях/мессенджерах)`);
  if (!/application\/ld\+json/.test(src)) warn(`${f}: нет JSON-LD schema`);
}

// 5. Битые локальные ссылки на ассеты (css/js/images) внутри HTML
for (const f of html) {
  const src = readFileSync(join(ROOT, f), 'utf8');
  const re = /(?:src|href)="((?:\.?\/)?(?:images|js|css)\/[\w\-./]+\.(?:css|js|png|jpe?g|webp|svg|mp4))(?:\?[^"]*)?"/g;
  let m;
  while ((m = re.exec(src))) {
    const path = m[1].replace(/^\.?\//, '');
    if (!existsSync(join(ROOT, path))) err(`${f}: битая ссылка на ${path}`);
  }
}

// вывод
console.log(`\nAmberra pre-deploy check — ${html.length} HTML\n${'─'.repeat(50)}`);
if (warns.length) { console.log(`\n⚠  WARN (${warns.length}):`); warns.forEach((w) => console.log('  ' + w)); }
if (errors.length) { console.log(`\n✖  ERROR (${errors.length}):`); errors.forEach((e) => console.log('  ' + e)); }
if (!errors.length && !warns.length) console.log('\n✓  чисто — можно деплоить');
else if (!errors.length) console.log(`\n✓  ошибок нет (${warns.length} warn)`);

const fail = errors.length > 0 || (STRICT && warns.length > 0);
process.exit(fail ? 1 : 0);
