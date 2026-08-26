# Amberra SEO-переделка — P0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Оптимизировать существующий янтарный каталог Amberra под коммерческие ключи (US/UK), закрыть технические SEO-разрывы (дубли, Ubud-нарратив, hreflang, мультивалюта, sitemap) — всё, что строится кодом на текущих 94 товарах.

**Architecture:** Страницы генерируются `scripts/generate-categories.js` (config-объекты TYPES/COLORS/HUB/SILVER × page-функции) и `scripts/generate-products.js`. Правим конфиги и шаблоны, пересобираем, проверяем grep/build. Редиректы — `vercel.json`.

**Tech Stack:** Node (генераторы), статический HTML, Vercel (cleanUrls:true, trailingSlash:false), Schema.org JSON-LD.

**Scope note:** P0 — только то, что строится на текущем каталоге. Пиллары под promise rings (49500 LOW), plain silver (18100), gemstone (14800), artisan/handmade-silver — гейтятся на расширение ассортимента → отдельные планы P1/P2. Здесь их НЕТ намеренно (иначе тонкие страницы без товара).

**Build command (используется в проверках):** `node scripts/generate-categories.js` и `node scripts/generate-products.js`. Данные берутся из `data/products.json` (без Airtable, если не задан SYNC_AIRTABLE).

---

### Task 1: Убрать Ubud-нарратив из генератора категорий

Правда-якорь (из решения владельца): «designed in Bali, crafted by hand by our artisans». «Ubud workshop / in Ubud, Bali» — реанимировать нельзя.

**Files:**
- Modify: `scripts/generate-categories.js` (TYPES intro/faq, L34–85 и любые др. вхождения)

- [ ] **Step 1: Найти все вхождения Ubud в генераторе**

Run: `grep -n -i "ubud" scripts/generate-categories.js`
Expected: несколько совпадений в TYPES.intro и TYPES.faq.

- [ ] **Step 2: Заменить формулировки**

Заменить по файлу (сохранив смысл, убрав Ubud):
- `in our Ubud workshop` → `in our Bali studio`
- `by our silversmiths in Ubud, Bali` → `by our artisans in Bali`
- `hand in Ubud, Bali` → `hand in Bali`
- `finished by hand in Ubud, Bali` → `finished by hand in Bali`
- `in our Ubud workshop and arrives` → `in our Bali studio and arrives`
- любое оставшееся `Ubud` → удалить/переписать на `Bali`

Применить точечными правками (каждая строка уникальна) или:
Run: `perl -0777 -i -pe 's/\bin our Ubud workshop\b/in our Bali studio/g; s/\bin Ubud, Bali\b/in Bali/g; s/\bsilversmiths in Ubud\b/silversmiths in Bali/g; s/\bUbud workshop\b/Bali studio/g;' scripts/generate-categories.js`

- [ ] **Step 3: Проверить, что Ubud не осталось**

Run: `grep -c -i "ubud" scripts/generate-categories.js`
Expected: `0`

- [ ] **Step 4: Проверить остальные генераторы и journal**

Run: `grep -rli "ubud" scripts/ *.js journal/ 2>/dev/null`
Expected: пусто. Если journal/balinese-*.html или generate-products.js содержат — вычистить тем же способом (Bali studio / crafted by hand).

- [ ] **Step 5: Пересобрать и проверить, что Ubud не попал в HTML**

Run: `node scripts/generate-categories.js && grep -rli "ubud" rings.html earrings.html pendants.html bracelets.html amber.html`
Expected: build OK, grep пусто.

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-categories.js rings.html earrings.html pendants.html bracelets.html chains.html amber.html sterling-silver-amber-jewelry.html amber/
git commit -m "fix(seo): убрать Ubud-нарратив из генератора категорий → Bali studio"
```

---

### Task 2: Переписать title/H1 категорий под спрос (US/UK)

Сейчас title'ы бренд-центричны («Amber Rings in 925 Sterling Silver»). Добавляем demand-модификаторы `handmade` / `sterling silver` в начало, оставаясь честными (товар — янтарь в серебре).

**Files:**
- Modify: `scripts/generate-categories.js` (TYPES.*.metaTitle, .h1)

- [ ] **Step 1: Обновить metaTitle/h1 в TYPES**

Заменить значения (rings/earrings/pendants/bracelets):
```js
rings:     { label:'Rings',     h1:'Handmade Amber Rings in Sterling Silver',
  metaTitle:'Handmade Amber Rings — Sterling Silver, Bali | AMBERRA',
  ...
earrings:  { label:'Earrings',  h1:'Handmade Amber Earrings in Sterling Silver',
  metaTitle:'Handmade Amber Earrings — Sterling Silver | AMBERRA',
  ...
pendants:  { label:'Pendants',  h1:'Amber Pendants & Necklaces in Sterling Silver',
  metaTitle:'Amber Pendant Necklaces — Sterling Silver Handmade | AMBERRA',
  ...
bracelets: { label:'Bracelets', h1:'Handmade Amber Bracelets in Sterling Silver',
  metaTitle:'Handmade Amber Bracelets — Sterling Silver | AMBERRA',
```
(chains оставить.)

- [ ] **Step 2: Пересобрать**

Run: `node scripts/generate-categories.js`
Expected: build OK.

- [ ] **Step 3: Проверить title в HTML**

Run: `grep -h "<title>" rings.html earrings.html bracelets.html pendants.html`
Expected: новые title с «Handmade … Sterling Silver».

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-categories.js rings.html earrings.html pendants.html bracelets.html
git commit -m "feat(seo): title/H1 категорий под спрос (handmade + sterling silver)"
```

---

### Task 3: /amber → пиллар «amber jewelry» (усилить HUB title)

`amber jewelry` (US 8100) — пиллар. HUB уже рендерит `/amber`; усиливаем title/H1/meta и about-схему (baltic amber уже есть).

**Files:**
- Modify: `scripts/generate-categories.js` (HUB config, L184+)

- [ ] **Step 1: Прочитать текущий HUB**

Run: `sed -n '184,205p' scripts/generate-categories.js`
Expected: HUB.metaTitle/h1/metaDesc/intro/faq.

- [ ] **Step 2: Обновить HUB.metaTitle/h1/metaDesc**

```js
HUB = {
  metaTitle:'Amber Jewelry — Handmade Baltic Amber & Sterling Silver | AMBERRA',
  h1:'Baltic Amber Jewelry, Handmade in Sterling Silver',
  metaDesc:'Handmade Baltic amber jewelry in 925 sterling silver — rings, earrings, pendants & bracelets. Designed in Bali, genuine amber, certificate of authenticity. Ships worldwide.',
  ...
```

- [ ] **Step 3: Пересобрать и проверить**

Run: `node scripts/generate-categories.js && grep "<title>" amber.html`
Expected: title с «Amber Jewelry — Handmade Baltic Amber».

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-categories.js amber.html
git commit -m "feat(seo): /amber как пиллар amber jewelry (title/H1/meta)"
```

---

### Task 4: Устранить дубли shop/ и лишние пути (301 в vercel.json)

Дубли `/shop/rings` vs `/rings` и брендовые `/collections/*`, `/bali-jewelry` → редиректим на канонические.

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Прочитать текущие redirects**

Run: `grep -n "redirects\|source\|destination" vercel.json | head -40`
Expected: массив redirects (или его отсутствие).

- [ ] **Step 2: Добавить 301-редиректы**

В массив `redirects` vercel.json добавить (permanent:true = 301):
```json
{ "source": "/shop/rings", "destination": "/rings", "permanent": true },
{ "source": "/shop/earrings", "destination": "/earrings", "permanent": true },
{ "source": "/shop/bracelets", "destination": "/bracelets", "permanent": true },
{ "source": "/shop/pendants", "destination": "/pendants", "permanent": true },
{ "source": "/bali-jewelry", "destination": "/sterling-silver-amber-jewelry", "permanent": true },
{ "source": "/collections/solar", "destination": "/amber", "permanent": true },
{ "source": "/collections/sacred", "destination": "/amber", "permanent": true },
{ "source": "/collections/botanica", "destination": "/amber", "permanent": true }
```
Примечание: `/artisan-jewelry` ещё не существует (P1), поэтому `/bali-jewelry` временно ведём на `/sterling-silver-amber-jewelry`. Перецелить в P1.

- [ ] **Step 3: Проверить валидность JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('vercel.json','utf8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 4: Удалить дубли-файлы shop/ из репозитория (после подтверждения редиректа)**

Run: `ls shop/*.html`
Затем: `git rm shop/rings.html shop/earrings.html shop/bracelets.html shop/pendants.html`
(shop.html-агрегатор оставить, если на него завязан UI; иначе тоже редирект.)

- [ ] **Step 5: Commit**

```bash
git add vercel.json
git commit -m "fix(seo): 301 shop/ и collections/ на канонические, убрать дубли"
```

---

### Task 5: hreflang en-US / en-GB на пиллары и категории

Сейчас только `en` + `x-default`. Добавляем self-referencing hreflang (US canonical, GB alternate на тот же URL — US spelling доминирует, UK-дублей не создаём, YAGNI).

**Files:**
- Modify: `scripts/generate-categories.js` (функция `shell()` — где рендерится `<head>`/canonical)

- [ ] **Step 1: Найти shell() и вставку canonical**

Run: `grep -n "rel=\"canonical\"\|hreflang\|function shell" scripts/generate-categories.js`
Expected: строка с canonical в shell().

- [ ] **Step 2: Рядом с canonical добавить hreflang-блок**

В шаблоне `<head>` после canonical:
```js
`<link rel="alternate" hreflang="en" href="${canonical}">
<link rel="alternate" hreflang="en-US" href="${canonical}">
<link rel="alternate" hreflang="en-GB" href="${canonical}">
<link rel="alternate" hreflang="x-default" href="${canonical}">`
```

- [ ] **Step 3: Пересобрать и проверить**

Run: `node scripts/generate-categories.js && grep -c 'hreflang="en-GB"' amber.html rings.html`
Expected: по 1 на файл.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-categories.js *.html amber/
git commit -m "feat(seo): hreflang en-US/en-GB на категориях и пилларах"
```

---

### Task 6: Мультивалютные Offer в схеме товаров (USD/GBP/EUR)

Сейчас `priceCurrency: USD` + shipping/return только US → ломает UK/EU сниппеты. Добавляем массив `offers` (три валюты) в Product-схему генератора товаров.

**Files:**
- Modify: `scripts/generate-products.js` (сборка Offer/Product JSON-LD)

- [ ] **Step 1: Найти сборку Offer в generate-products.js**

Run: `grep -n "priceCurrency\|Offer\|shippingDetails\|hasMerchantReturnPolicy" scripts/generate-products.js`
Expected: место, где строится один Offer с USD.

- [ ] **Step 2: Заменить одиночный Offer на массив по гео**

Курсы задать константой вверху файла:
```js
const FX = { USD: 1, GBP: 0.79, EUR: 0.92 }; // ponytail: статичные курсы, обновлять вручную при сдвиге >5%
const GEO = [
  { cur:'USD', country:'US' },
  { cur:'GBP', country:'GB' },
  { cur:'EUR', country:'DE' },
];
function offersFor(priceUSD){
  return GEO.map(g => ({
    '@type':'Offer',
    price: Math.round(priceUSD * FX[g.cur]),
    priceCurrency: g.cur,
    availability:'https://schema.org/InStock',
    itemCondition:'https://schema.org/NewCondition',
    priceValidUntil:'2027-12-31',
    shippingDetails:{ '@type':'OfferShippingDetails',
      shippingDestination:{ '@type':'DefinedRegion', addressCountry:g.country } },
    hasMerchantReturnPolicy:{ '@type':'MerchantReturnPolicy',
      applicableCountry:g.country, merchantReturnDays:14,
      returnPolicyCategory:'https://schema.org/MerchantReturnFiniteReturnWindow' }
  }));
}
```
В Product-схеме заменить `offers: {..один..}` на `offers: offersFor(p.price)`.

- [ ] **Step 3: Пересобрать и проверить три валюты**

Run: `node scripts/generate-products.js && grep -o '"priceCurrency":"[A-Z]*"' products/amber-blossom-ring.html | sort -u`
Expected: `"priceCurrency":"EUR"`, `"GBP"`, `"USD"`.

- [ ] **Step 4: Валидировать JSON-LD одного файла**

Run: `node -e "const h=require('fs').readFileSync('products/amber-blossom-ring.html','utf8');const m=[...h.matchAll(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g)];m.forEach(x=>JSON.parse(x[1]));console.log('ld+json valid:',m.length)"`
Expected: `ld+json valid: N` (без ошибок парсинга).

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-products.js products/
git commit -m "feat(seo): мультивалютные Offer USD/GBP/EUR + shipping/return по гео"
```

---

### Task 7: Чистка sitemap (реальные lastmod, без priority/changefreq, все страницы)

**Files:**
- Modify: `scripts/generate-categories.js` (секция sitemap в main(), ~L900) или `sitemap.xml` напрямую если генерится отдельно

- [ ] **Step 1: Найти генерацию sitemap**

Run: `grep -n "sitemap\|priority\|changefreq\|lastmod" scripts/generate-categories.js scripts/*.js`
Expected: место сборки sitemap.xml.

- [ ] **Step 2: Убрать priority/changefreq, проставить сегодняшний lastmod**

В шаблоне `<url>` оставить только `<loc>` и `<lastmod>` (YYYY-MM-DD текущей сборки). Убедиться, что включены все пиллары/категории (`/amber`, `/rings`, `/earrings`, `/pendants`, `/bracelets`, `/sterling-silver-amber-jewelry`, товары, journal).

- [ ] **Step 3: Пересобрать и проверить**

Run: `node scripts/generate-categories.js && grep -c "<url>" sitemap.xml && grep -c "changefreq\|priority" sitemap.xml`
Expected: N url > 0; changefreq/priority = `0`.

- [ ] **Step 4: Валидировать XML**

Run: `xmllint --noout sitemap.xml && echo "xml ok"` (или `python3 -c "import xml.dom.minidom as m;m.parse('sitemap.xml');print('ok')"`)
Expected: `ok`.

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-categories.js sitemap.xml
git commit -m "fix(seo): чистый sitemap — реальный lastmod, без priority/changefreq"
```

---

### Task 8: Расширить категорийный SEO-текст (intro 400+ слов)

Сейчас intro категорий ~60–80 слов. Добавляем второй SEO-блок под ключи (типы, размеры, уход, как выбрать), органично вплетая `handmade`, `sterling silver`, `Baltic amber`.

**Files:**
- Modify: `scripts/generate-categories.js` (TYPES.*.intro — добавить 3–4 абзаца; или SECTIONS[slug])

- [ ] **Step 1: Проверить, как intro/SECTIONS рендерятся**

Run: `grep -n "SECTIONS\|introHTML\|sectionsHTML" scripts/generate-categories.js | head`
Expected: SECTIONS-объект + рендер.

- [ ] **Step 2: Дописать SECTIONS для rings/earrings/bracelets/pendants**

Для каждого типа добавить секцию 400–500 слов (H2 + абзацы): «Types of [amber rings]», «How to choose your size», «Caring for amber & silver», «Why handmade in Bali». Ключи: `handmade amber [type]`, `sterling silver amber [type]`, `Baltic amber`. Без health-claims, без Ubud.

- [ ] **Step 3: Пересобрать, проверить объём текста**

Run: `node scripts/generate-categories.js && node -e "const h=require('fs').readFileSync('rings.html','utf8').replace(/<[^>]+>/g,' ');console.log('words:',h.split(/\s+/).length)"`
Expected: заметный рост (>800 слов на странице).

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-categories.js *.html amber/
git commit -m "feat(seo): расширенный категорийный контент под ключи (400+ слов)"
```

---

## Self-Review (покрытие спека)

| Требование спека | Задача |
|---|---|
| Убить дубли shop/ | Task 4 |
| Title'ы под спрос | Task 2, 3 |
| hreflang en-US/en-GB | Task 5 |
| Мультивалюта Offer | Task 6 |
| Sitemap cleanup | Task 7 |
| Контент категорий | Task 8 |
| Ubud-остатки | Task 1 (найдено в генераторе — критично) |
| amber-jewelry пиллар | Task 3 |

**Гейтнуто на расширение ассортимента (НЕ в P0, отдельные планы):**
- /sterling-silver-promise-rings (49500 LOW) — нужен товар promise rings
- /sterling-silver-handmade-jewelry (4400 LOW), /gemstone-jewelry (14800) — нужен несеребряный… то есть неянтарный silver/gemstone товар
- /artisan-jewelry (18100) — E-E-A-T хаб, можно и без нового товара → кандидат в P1
- AggregateRating — нужен сбор отзывов
- Journal-статьи (how-to-tell-amber-real и др.) — контентный план P1

**Не делаем (YAGNI):** UK-дубли страниц, FAQPage schema, fine/boho/demi-fine страницы.

---

## Execution Handoff

Плейсхолдеров нет; типы/имена функций (offersFor, pillar config) согласованы. Порядок задач: 1 (Ubud — критично) → 2 → 3 → 4 → 5 → 6 → 7 → 8. Каждая задача самодостаточна и коммитится отдельно.
