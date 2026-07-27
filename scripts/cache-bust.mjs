#!/usr/bin/env node
// Cache-buster sync: выставляет единый ?v=TAG на все локальные css/js во всех HTML.
// Usage: node scripts/cache-bust.mjs [TAG]  (по умолчанию — сегодняшняя дата + буква)
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const TAG = process.argv[2] || new Date().toISOString().slice(0,10).replace(/-/g,'') + 'a';
const ASSETS = /(?:src|href)="([a-zA-Z0-9_\-./]+\.(?:css|js))(\?v=[^"]*)?"/g;
// только локальные ассеты проекта (не CDN, не сторонние)
const LOCAL = /^(?:\.?\/)?(?:js\/)?[a-zA-Z0-9_\-]+\.(?:css|js)$/;

let changed = 0, files = 0;
for (const f of readdirSync('.').filter(n => n.endsWith('.html'))) {
  const src = readFileSync(f, 'utf8');
  let hits = 0;
  const out = src.replace(ASSETS, (m, path, ver) => {
    if (!LOCAL.test(path)) return m;              // пропускаем CDN/сторонние
    hits++;
    return m.replace(/(?:src|href)="[^"]*"/, `${m.match(/^(src|href)/)[0]}="${path}?v=${TAG}"`);
  });
  if (out !== src) { writeFileSync(f, out); changed += hits; files++; }
}
console.log(`cache-bust → v=${TAG}: обновлено ${changed} ссылок в ${files} файлах`);
