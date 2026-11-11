# AMBERRA — МАСТЕР-ЯДРО (US / Google) + перелинковка

Данные: Google Keyword Planner, US, июль 2026 (реальные объёмы). Полные CSV:
`keyword-data-us.csv` (amber), `keyword-data-adjacent-us.csv`, `keyword-data-handmade-us.csv`.
Идентичность: **Handcrafted jewelry house из Бали — амбер-флагман + тёплые камни (citrine/carnelian/tiger eye).**
Конкуренция в таблицах = РЕКЛАМНАЯ (paid), НЕ органическая сложность. LOW = легче органика/меньше рекламодателей.

Легенда приоритета: **P0** винный+ценный (строим первым) · **P1** стоун-расширение · **P2** кросс/добор.

---

## СЛОЙ 0 — ХАБ (главная): «Handcrafted Jewelry, made in Bali»

| Ключ | US/мес | comp | Prio | Страница |
|------|-------:|:----:|:----:|----------|
| handmade jewelry | 40 500 | HIGH | P1 | `/` (H2/бренд, голову держит Etsy — не биться в лоб) |
| **handcrafted jewelry** | **27 100** | **LOW** | **P0** | `/` H1/title — главный хаб-термин, берётся |
| artisan jewelry | 18 100 | HIGH | P1 | `/` LSI |
| sterling silver handmade jewelry | 3 600 | MED | P0 | `/` H2 + `/collections/sterling-silver` |
| handcrafted fine jewelry | 2 900 | MED | P1 | `/` H2 |
| handmade jewelry for women | 210 | HIGH | P2 | LSI |

Хаб линкует ВНИЗ на все стоун-хабы и топ-инфо. Title-хаб: `Handcrafted Jewelry Made in Bali — Amber & Gemstones in 925 Silver | AMBERRA`.

---

## СЛОЙ 1 — AMBER (флагман, ДНК бренда)

### Amber коммерция (тип)
| Ключ | US/мес | comp | Prio | Страница |
|------|-------:|:----:|:----:|----------|
| amber jewelry | 8 100 | HIGH | P0 | `/amber` (стоун-хаб) |
| baltic amber jewelry | 6 600 | HIGH | P0 | `/amber` H1 |
| amber necklace | 4 400 | HIGH | P0 | `/amber/necklaces` (⚠ часть спроса teething — не брать детское) |
| amber ring | 1 900 | HIGH | P0 | `/amber/rings` |
| amber earrings | 1 300 | HIGH | P0 | `/amber/earrings` |
| amber bracelet | 1 300 | HIGH | P0 | `/amber/bracelets` |
| amber pendant | 720 | HIGH | P0 | `/amber/pendants` |
| sterling silver amber ring | 590 | HIGH | P1 | `/amber/rings` H2 |
| amber brooch | 720 | LOW | P0 | `/amber/brooches` (LOW — лёгкая) |

### Amber цвет (winnable long-tail, товар есть)
| Ключ | US/мес | comp | Prio | Страница |
|------|-------:|:----:|:----:|----------|
| **cherry amber** | **3 600** | **LOW** | **P0** | `/amber/cherry` ⭐ |
| blue amber jewelry | 720 | HIGH | P1 | `/amber/blue` |
| butterscotch amber | 390 | HIGH | P1 | `/amber/butterscotch` |
| green amber jewelry | 320 | HIGH | P1 | `/amber/green` |
| honey amber | 320 | LOW | P0 | `/amber/honey` |
| raw amber ring | 70 | MED | P2 | H2 в `/amber/rings` |
| cognac amber ring | 10 | — | P2 | H2 (низкий объём, но товар есть) |

### Amber информация (дверь DR0 — маркетплейсов нет)
| Ключ | US/мес | comp | Prio | Страница |
|------|-------:|:----:|:----:|----------|
| **amber meaning** | **5 400** | **LOW** | **P0** | `/journal/amber-meaning` ⭐⭐ крупнейший инфо |
| amber prices | 1 000 | LOW | P0 | `/journal/amber-price-guide` |
| how to tell if amber is real *(+7 вариантов ×590)* | ~2 000 | LOW | P0 | `/journal/how-to-tell-if-amber-is-real` |
| baltic amber benefits | 320 | HIGH | P1 | `/journal/amber-benefits` (без health-claims) |
| amber colors (cognac/cherry/green…) | сумма | — | P0 | `/journal/amber-colors-guide` (линкует на цвет-коллекции) |

---

## СЛОЙ 2 — ТЁПЛЫЕ КАМНИ (спутники, ×объём)

### Citrine (110k — ноябрьский birthstone; голова giant-locked, берём long-tail)
| Ключ | US/мес | comp | Prio | Страница |
|------|-------:|:----:|:----:|----------|
| citrine jewelry | 110 000 | HIGH | P1 | `/citrine` (хаб; голову не ждём быстро) |
| citrine ring | 8 100 | HIGH | P1 | `/citrine/rings` |
| citrine necklace | 3 600 | HIGH | P1 | `/citrine/necklaces` |
| citrine bracelet | 2 900 | HIGH | P1 | `/citrine/bracelets` |
| citrine earrings | 1 900 | HIGH | P1 | `/citrine/earrings` |
| citrine pendant | 880 | HIGH | P2 | `/citrine/pendants` |
| citrine ring sterling silver | 720 | HIGH | P1 | H2 в `/citrine/rings` |
| citrine cocktail ring | 210 | HIGH | P2 | H2 |
| raw citrine ring | 170 | HIGH | P2 | H2 (отстройка: polished, не raw) |

### Carnelian (22k)
| Ключ | US/мес | comp | Prio | Страница |
|------|-------:|:----:|:----:|----------|
| carnelian jewelry | 22 200 | HIGH | P1 | `/carnelian` |
| carnelian necklace | 2 900 | HIGH | P1 | `/carnelian/necklaces` |
| carnelian ring | 2 400 | HIGH | P1 | `/carnelian/rings` |
| carnelian bracelet | 1 900 | HIGH | P1 | `/carnelian/bracelets` |
| carnelian earrings | 590 | HIGH | P2 | `/carnelian/earrings` |
| carnelian pendant | 480 | HIGH | P2 | `/carnelian/pendants` |

### Tiger Eye (27k — bracelet-heavy)
| Ключ | US/мес | comp | Prio | Страница |
|------|-------:|:----:|:----:|----------|
| tiger eye jewelry | 27 100 | HIGH | P1 | `/tiger-eye` |
| tiger eye bracelet | 8 100 | HIGH | P1 | `/tiger-eye/bracelets` ⭐ |
| tiger eye ring | 2 900 | HIGH | P1 | `/tiger-eye/rings` |
| tiger eye necklace | 2 900 | HIGH | P1 | `/tiger-eye/necklaces` |
| tiger eye earrings | 1 600 | HIGH | P2 | `/tiger-eye/earrings` |

---

## СЛОЙ 3 — КРОСС/ТИП-ХАБЫ и OCCASION (P2, giant-locked голова → long-tail + перелинковка)

| Ключ | US/мес | comp | Страница |
|------|-------:|:----:|----------|
| sterling silver ring | 74 000 | HIGH | `/rings` тип-хаб (H2/бренд; голова недостижима — держим для перелинковки) |
| gemstone jewelry | 14 800 | HIGH | `/gemstone-jewelry` кросс-хаб |
| birthstone jewelry | 14 800 | HIGH | `/birthstone` (citrine=Nov, garnet=Jan…) |
| gemstone ring | 9 900 | HIGH | `/rings` |
| cocktail ring | 8 100 | HIGH | `/rings` (statement/cocktail H2) |
| statement ring | 5 400 | HIGH | `/rings` |

Тип-хабы (`/rings /earrings /necklaces /bracelets /pendants /brooches`) — кросс-каменные витрины: линкуют на все stone×type спокы.

---

## АРХИТЕКТУРА URL (двухосевая: STONE × TYPE)

```
/                         Handcrafted Jewelry hub
├─ /amber                 стоун-хаб (флагман)
│   ├─ /amber/rings /earrings /necklaces /bracelets /pendants /brooches   (stone×type)
│   └─ /amber/cherry /honey /green /butterscotch /blue                    (stone×color)
├─ /citrine  → /citrine/rings …
├─ /carnelian → /carnelian/rings …
├─ /tiger-eye → /tiger-eye/bracelets …
├─ ТИП-ХАБЫ (кросс-камень): /rings /earrings /necklaces /bracelets /pendants /brooches
├─ КРОСС: /gemstone-jewelry /birthstone /sterling-silver
└─ /journal  (amber-meaning, amber-price-guide, how-to-tell-if-amber-is-real, amber-colors-guide, amber-benefits, citrine-meaning …)
```

---

## ПЕРЕЛИНКОВКА (перелинковка — правила + матрица)

**Правила (из методологии, ≥5 внутр. ссылок/страница, анкор = точный ключ целевой):**
1. **Хаб → стоун-хабы:** главная линкует на `/amber /citrine /carnelian /tiger-eye` анкором «{stone} jewelry».
2. **Стоун-хаб ↕ свои спокы:** `/amber` → `/amber/rings` («amber rings»), `/amber/cherry` («cherry amber»), и обратно вверх («baltic amber jewelry»).
3. **Стоун-хаб → своя инфо-статья:** `/amber` → `/journal/amber-meaning` («amber meaning»), `/journal/amber-price-guide` («amber prices»).
4. **Инфо → коммерция (ключевой поток трафика):** `/journal/amber-meaning` (5 400) и `/journal/amber-colors-guide` → линкуют на `/amber`, `/amber/cherry`, `/amber/rings` коммерческими анкорами. Инфо приводит трафик (DR0), перелинковка передаёт его на продажные страницы.
5. **Тип-хаб ↔ stone×type:** `/rings` → `/amber/rings /citrine/rings /carnelian/rings /tiger-eye/rings` («amber rings», «citrine ring» …).
6. **Кросс-камень «warm gemstones» блок:** каждый стоун-хаб внизу — «Explore warm gemstones» → на 3 других камня (тематическая близость, распределяет вес).
7. **Товар → вверх + related:** карточка → стоун-хаб + тип-хаб (кликабельные крошки) + 4–6 «You may also like» того же камня/типа.
8. **Хаб handcrafted → топ-инфо:** главная → `/journal/how-to-tell-if-amber-is-real`, `/amber-meaning` (E-E-A-T + удержание).
9. **Breadcrumbs везде:** Home › {Stone|Type} › {Product} (BreadcrumbList schema).

**Матрица (кто→кому, анкор):**
| Источник | Цель | Анкор |
|----------|------|-------|
| `/` | `/amber` `/citrine` `/carnelian` `/tiger-eye` | «{stone} jewelry» |
| `/` | `/journal/amber-meaning` | «what amber means» |
| `/amber` | `/amber/{type}` ×6 | «amber {type}» |
| `/amber` | `/amber/cherry` `/honey`… | «cherry amber» … |
| `/amber` | `/journal/amber-meaning` `/amber-price-guide` | «amber meaning» / «amber prices» |
| `/journal/amber-meaning` | `/amber` `/amber/cherry` `/amber/rings` | «shop amber jewelry» / «cherry amber rings» |
| `/journal/amber-colors-guide` | `/amber/cherry /honey /green /butterscotch /blue` | «{color} amber» |
| `/rings` | `/amber/rings /citrine/rings /carnelian/rings /tiger-eye/rings` | «{stone} ring(s)» |
| `/amber` (низ) | `/citrine /carnelian /tiger-eye` | «{stone} jewelry» (warm gemstones) |
| товар | стоун-хаб + тип-хаб + 4-6 related | крошки + «{stone} {type}» |

---

## ON-PAGE (шаблоны, из методологии)
- **Title:** `{Color/Attr} {Stone} {Type} in Sterling Silver — Handcrafted in Bali | AMBERRA` (50-60, ключ в первых 30).
- **H1** ≠ Title, точный ключ. **H2** = реальные ключи ядра (из таблиц). Lead: ключ в 1-м предложении + ответ в 200 симв (AI Overviews).
- **Schema:** Product+Offer(USD)+AggregateRating / Article / BreadcrumbList / Organization(JewelryStore). FAQ+FAQPage (для AI/LLM).
- Плотность 1-2% + LSI (925, cabochon, succinite для amber, quartz для citrine). Стоп-фразы AI — по списку STRATEGY-US-GOOGLE.md.

## КОНТЕНТ-МАСШТАБ vs КОНКУРЕНТЫ (замер 14.07 — планки, чтобы перегнать)

Замерено sitemap+word-count по 9 конкурентам. Вывод: ширину SKU (peora 6165, silverrush ~7000) не догоняем и НЕ гонимся — это тонкие дубли, Google их бьёт. Выигрываем ГЛУБИНОЙ+EDUCATION+TRUST, где у всех дыры (ambersos 10 статей; amberartisans/modernartisans/peora блога 0).

**Как стоят конкуренты (URL / товары / коллекции / статьи / слов-категория / слов-карточка / слов-статья):**
- Amberra сейчас: ~109 / ~94 / сиротские / 15 / мало / мало / —
- gardensofthesun (DR31, наш двойник Bali): 1276 / 857 / 170 / **179** / ~1200 / 910 / 630
- hawkhouse (DR27, чемпион глубины): 877 / 653 / 113 / 76 / **2650** / **3050** / **3540**
- mimosa (DR34): 907 / 554 / 194 / 99 / 1340 / 1830 / 1310
- ambersos (amber, лучший по глубине среди янтарных): 687 / 620 / 23 / 10 / 785 / 725 / 1165
- peora (широкий, пустой): 6337 / 6165 / 114 / **0** / 2210 / 880 / —

**ПЛАНКИ AMBERRA (обязательный минимум на странице, иначе не превзойти):**
1. Коллекция (stone-хаб + stone×type + color): уникальный SEO-текст **1500–2000 слов** + FAQ 4–6 Q (FAQPage schema). Планка hawkhouse/peora, но с блогом, которого у них нет.
2. Карточка товара: **500–800 слов** уникального описания + provenance/сертификат Baltic amber + виджет отзывов. Объединяем глубину hawkhouse + trust houseofamber (никто не даёт оба).
3. Блог/journal: **40–50 статей старт → 100+**. Формат-победитель «{Stone}: Meaning, Properties, Care & Everyday Uses» ×4 камня + «real vs fake amber», «amber care», «color guide», «certificate». Обгон ambersos ×5.
4. Общий объём: цель **900–1200 URL** за счёт коллекций+статей+глубоких карточек, НЕ пустых SKU.
5. Фичи-gap (ни у кого разом): FAQ на категориях + отзывы на коллекциях + единый Gemstone Meaning/Care хаб с перелинковкой + сторителлинг «Handcrafted in Bali / 925» на каждой коллекции + тематический фокус «warm stones» (amber+citrine+carnelian+tiger eye — такого дома в US нет).

## ПРИОРИТЕТ ВОЛН
- **Волна 0 (P0):** хаб `handcrafted jewelry` + `/amber` хаб + amber type-спокы (фикс сиротства) + P0-инфо (`amber-meaning` 5 400, `amber-prices`, `how-to-tell`, `amber-colors`) + `cherry amber`/`honey amber` + `amber brooch`. Перелинковка 1-9.
- **Волна 1 (P1):** `/citrine` + citrine type-спокы, `/carnelian`, `/tiger-eye` (+ tiger eye bracelet 8100) + amber остальные цвета + reviews-schema.
- **Волна 2 (P2):** кросс-хабы (gemstone/birthstone/statement/cocktail), occasion/gift, sterling-silver.
- Масштабируем stone×type×color **только на сидах в топ-20** (GSC).
