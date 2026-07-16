# AMBERRA — ДЕТАЛЬНЫЙ ПЛАН УЛУЧШЕНИЯ САЙТА
_14.07.2026. Phase 2 (Plan) + Phase 3 (Tasks). Основа: `STRATEGY.md`, `MASTER-CORE.md`, замер прода 14.07._

## Базлайн прода (замер 14.07)
| Есть | Нет / сломано |
|---|---|
| Organization schema на главной | AggregateRating (0), FAQPage (0) |
| Product+Offer, Breadcrumb, hreflang 15 langs | srcset (0), webp почти нет (2) |
| sitemap 109 (79 товаров / 15 статей / 5 катег.) | каталог сиротский: /rings = 20 openDrawer, 0 ссылок /products (fix в коде, ждёт деплой) |
| cart-хуки (addToCart) на главной | карточка товара = «Request This Piece» → редирект /shop (нет Add to Cart, нет размера) |
| title главной уже «Handcrafted Bali Jewelry» | 79 товаров в sitemap vs 94 в Airtable (15 теряются) |

---

## Структура: 6 воркстримов, гейты по волнам

```
WS-A Технический фундамент ─┐
WS-F Schema ────────────────┼─→ ВОЛНА 0 (фундамент, можно параллельно)
WS-B Каталог/коммерция ─────┘
                             ↓ (гейт: индексируемый каталог + schema готовы)
WS-C Контент/SEO ───────────┐
WS-D Trust/E-E-A-T ─────────┼─→ ВОЛНА 1 (рост)
WS-E Media/перф ────────────┘
                             ↓ (гейт: сиды в топ-20 по GSC)
                        ВОЛНА 2 (масштаб programmatic)
```

---

## ВОЛНА 0 — ФУНДАМЕНТ (можно вести A+F+B параллельно)

### WS-A. Технический фундамент
- [x] **A1. Фикс сиротства каталога.** Карточка → `<a href="/products/{slug}">`. Slug-паритет с generate-products (юнит-тест зелёный). `Files: scripts/generate-categories.js, style.css`. **Ждёт деплой.**
- [ ] **A2. Дырка sitemap 79 vs 94.** Найти почему 15 товаров не попадают (дубли slug / пустое Name / фильтр Category). `Acceptance: sitemap = число реальных товаров. Verify: node build + grep -c /products/ sitemap.xml. Files: scripts/generate-products.js`
- [ ] **A3. Тип-хабы под новые камни.** Сейчас категории только rings/earrings/pendants/bracelets/chains. Нужны stone-хабы (см. WS-C). Тех-часть: генератор должен поддержать вложенные `/amber/rings` (stone×type). `Acceptance: генератор пишет /{stone}/{type}.html. Files: scripts/generate-categories.js`
- [ ] **A4. Внутренняя перелинковка в шаблонах.** В футер/тело категорий добавить блок ссылок по матрице (MASTER-CORE §Перелинковка), ≥5 внутр. ссылок/страница. `Verify: curl | grep -c 'href="/' ≥5 на каждой`

### WS-F. Schema (быстрый CTR/AI-рычаг)
- [ ] **F1. AggregateRating на карточках** — ТОЛЬКО с реальными отзывами (зависит от WS-D2). Пока отзывов нет — не ставить (фабрикация запрещена). Гейт на D2.
- [ ] **F2. FAQPage на коллекциях и инфо-статьях.** 4–6 реальных Q&A. `Acceptance: Rich Results Test зелёный. Verify: Playwright → validator. Files: генераторы + шаблоны`
- [ ] **F3. Organization → JewelryStore + sameAs** на главной (соцсети, адрес Бали). `Files: index.html`
- [ ] **F4. BreadcrumbList** на всех сгенерированных (частично есть) — довести до 100%.

### WS-B. Каталог / коммерция
- [ ] **B1. Решение по чекауту** (Ask владельца): Snipcart (реком.) / Shopify Buy Button. Блокер для B2.
- [ ] **B2. Карточка товара: Add to Cart + размер вместо «Request This Piece».** US-размеры колец (логика есть в shop.js), `size` в Product schema, secure-checkout бейджи. `Files: scripts/generate-products.js, shop.js`
- [ ] **B3. Related / «You may also like»** на карточке (4–6 того же камня/типа) — внутр. вес + удержание. `Files: scripts/generate-products.js`
- [ ] **B4. Кликабельные крошки на карточке** (Home › Stone › Type › Product). `Files: scripts/generate-products.js`

**Чекпоинт Волны 0:** `curl` — 0 сиротских товаров, крошки/related на карточках, FAQPage валиден, checkout работает, sitemap = реальному числу.

---

## ВОЛНА 1 — РОСТ (C+D+E параллельно после гейта)

### WS-C. Контент / SEO (главный двигатель трафика при DR0)
- [ ] **C1. P0-инфо-двери** (единственный реальный трафик при DR0), глубина 1200–1800 слов + FAQ + перелинковка на коммерцию:
  - `/journal/amber-meaning` (5400/мес) ⭐⭐
  - `/journal/how-to-tell-if-amber-is-real` (~2000)
  - `/journal/amber-colors-guide` → линкует на цвет-коллекции
  - `/journal/amber-price-guide` (1000)
  `Acceptance: ≥1200 слов уник., FAQPage, ≥5 внутр. ссылок. Verify: word-count + Rich Results`
- [ ] **C2. `/amber` стоун-хаб** (флагман, 1800 слов + FAQ) — цель перелинковки от C1. `Files: новый шаблон + генератор`
- [ ] **C3. amber type-спокы** `/amber/{rings,earrings,necklaces,bracelets,pendants,brooches}` — текст 1500 слов + FAQ каждая.
- [ ] **C4. Цвет-коллекции** `/amber/cherry` (3600 LOW⭐), `/amber/honey` (320 LOW) — уник. intro + FAQ.
- [ ] **C5. Перелинковка по матрице 1–9** (MASTER-CORE) на всех новых.

### WS-D. Trust / E-E-A-T
- [ ] **D1. Certificate of Authenticity** — страница + бейдж на карточке + provenance-текст Baltic amber. Angle, которого нет у конкурентов.
- [ ] **D2. Отзывы** (Ask владельца: Judge.me / Loox / форма) → сбор → AggregateRating (разблокирует F1, звёзды в SERP). **Не фабриковать.**
- [ ] **D3. Shipping/Returns + Size Guide** служебные страницы (trust + intent).
- [ ] **D4. Founder/artisan блок** (Experience-сигнал E-E-A-T) на /our-story.

### WS-E. Media / перформанс
- [ ] **E1. webp + srcset** на все изображения (сейчас 2 webp, 0 srcset). `Acceptance: Lighthouse «properly sized/next-gen» зелёный. Files: генераторы + конвертация images/`
- [ ] **E2. Lighthouse mobile ≥90** (LCP/CLS/INP). hero preload, lazy-load ниже сгиба. `Verify: chrome-devtools lighthouse_audit`
- [ ] **E3. Alt с ключом** на всех img (частично есть).

**Чекпоинт Волны 1:** P0-инфо опубликованы (FAQPage), `/amber`+спокы+цвета с текстом под планку, отзывы→звёзды, Lighthouse ≥90, рост impressions инфо-кластера в GSC.

---

## ВОЛНА 2 — МАСШТАБ (гейт: сиды в топ-20 GSC)
- [ ] **G1. Стоун-хабы citrine/carnelian/tiger-eye** + их type-спокы (tiger eye bracelet 8100⭐).
- [ ] **G2. Кросс-хабы** /gemstone-jewelry /birthstone /sterling-silver /rings (statement/cocktail).
- [ ] **G3. Programmatic stone×type×color** — генерить combo ТОЛЬКО при ≥3 SKU + уник. intro (гард тонкости). `Files: data/ JSON + generate-categories.js`
- [ ] **G4. Occasion/gift** лендинги.

---

## Риски и митигация
| Риск | Митигация |
|---|---|
| Тонкий контент при масштабе (Google Helpful Content) | Гард ≥3 SKU + уник. intro; топ-20-гейт перед масштабом |
| Slug-рассинхрон категорий/товаров → 404 | Единый алгоритм toSlug, юнит-тест паритета (сделан) |
| CDN-кеш старого CSS/404 медиа | Бамп `?v=`, `?v=1` на новые медиа |
| Фабрикация отзывов | Только реальные; F1 гейт на D2 |
| Деплой ломает прод | Владелец деплоит; curl-проверка после; бэкап |
| DR0 = медленный рост | Инфо-двери (маркетплейсов нет) + линкабельный контент → органический DR |

## Параллельность
- **Волна 0:** A + F + B параллельно (разные файлы; B2 ждёт B1-решение).
- **Волна 1:** C + D + E параллельно (C — текст, D — trust, E — медиа). F1 ждёт D2.
- **Волна 2:** после GSC-гейта.

## Оценка усилий (порядок)
- Волна 0: A1✓ · A2/A3/A4 ~0.5д · F2/F3/F4 ~0.5д · B2/B3/B4 ~1д (после B1).
- Волна 1: C1–C5 ~3–4д (контент — основное) · D ~1–2д · E ~1д.
- Волна 2: итеративно по сидам.
