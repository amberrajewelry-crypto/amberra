---
name: deploy-amberra
description: Deploy Amberra to Vercel production the safe way — runs pre-deploy checks, syncs cache-buster, deploys, then verifies the live site. Use when the user asks to deploy Amberra, publish changes, or push to production.
disable-model-invocation: true
---

# Deploy Amberra (safe production deploy)

User-invoked deploy pipeline for the Amberra luxury jewelry site. Never deploy without running the gate first.

## Steps (run in order)

1. **Sync cache-buster** — bump all local css/js to one fresh tag so returning visitors (incl. the owner's browser) don't get stale assets. This is the #1 recurring bug on this project.
   ```bash
   node scripts/cache-bust.mjs
   ```

2. **Pre-deploy gate** — blocks on cache-buster desync, dead CTAs, BE spelling, SEO holes, broken asset links.
   ```bash
   node scripts/predeploy-check.mjs
   ```
   If it exits non-zero, fix the ERRORs before deploying. WARNs are judgment calls.

3. **Commit** (Russian message, per project convention):
   ```bash
   git add -A && git commit -q -m "<краткое описание>

   Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
   ```

4. **Deploy** (Airtable 429 → falls back to products.json, that's expected):
   ```bash
   npx vercel deploy --prod --scope amberrajewelry-cryptos-projects --yes
   ```

5. **Verify on prod** — never claim "done" without curling the live site:
   ```bash
   curl -s https://www.amberrajewelry.com/ -o /tmp/amb.html
   # spot-check the specific change is live (grep for the new copy / version)
   ```

## Notes
- Deploy folder: `/Users/vladimir/amberra/`. Live: https://www.amberrajewelry.com
- CSS map: index/shop/journal/stores/our-story → `style.css`; about/catalog/contact/tryon → `amberra.css`. Editing the wrong file = no visible change.
- 94 products live from Airtable (base `apprPtQw98iLfe0rF`). Monthly API limit can 429 → build falls back to local `products.json`.
- Progress is one-way (CLAUDE.md rule): never roll settings/params back.
