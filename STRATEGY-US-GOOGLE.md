# СТРАТЕГИЯ ПОСТРОЕНИЯ ИДЕАЛЬНОГО SEO-САЙТА — AMBERRA под GOOGLE (US)

Аналог METHODOLOGY.md (Tbili/Сфера), пересобранный под **Google / US / English / e-commerce / luxury jewelry**.
Данные: конкурентный анализ (House of Amber DR26 бенчмарк), SEMANTIC-CORE-US.md, аудит, SPEC-US-ONLINE.md.
Ключевое отличие от образца: **Яндекс→Google, Wordstat→Keyword Planner, ПФ-накрутка→честный engagement+CRO,
YMYL-аппарат→e-commerce trust**. Принципы-первоисточники перенесены 1:1.

---

## ПРИНЦИПЫ (Google-редакция)

1. **Каждый заголовок = реальный запрос** из Google Keyword Planner/SERP, не «красиво придумано».
2. **Фундамент → масштаб**: ~15 материнских страниц на старте → сотни color×type×attribute через 3–6 мес.
3. **Для нового домена (DR0) в Google 2026 решают:** релевантность + Helpful Content (реальный опыт) +
   структурные данные + внутренняя перелинковка. Ссылки — вторичны, но нужен минимум качественных.
   ⚠ Google-специфика: click-сигналы (NavBoost) есть, но их НЕЛЬЗЯ «накрутить» как Яндекс-ПФ — только
   заработать честным UX. Никаких ботов/эмуляции.
4. **E-commerce-факторы Google** (аналог YMYL-надстройки): Product structured data, реальные отзывы
   (Reviews system), Merchant Center free listings, прозрачные цены/доставка/возврат, secure checkout.
5. **Programmatic через данные Airtable/JSON**: добавил товар/цвет → страница сгенерировалась, без вёрстки.
6. **Защита от Helpful Content Update**: страница генерируется только с уникальным контентом и реальным
   товаром (гард ≥3 SKU + уникальный intro), никаких тонких doorway-комбинаций.

---

## ШАГ 1 — Исследование ниши (Google US) — ВЫПОЛНЕНО

**Рынок:** «amber jewelry» в US — специалисты + маркетплейсы. Голову коммерч. запросов держат
**Amazon/Etsy/eBay/NOVICA** (не биться в лоб), но их **НЕТ в информационных** — там блоги DR5–30 (дверь для DR0).

**Конкуренты (DR):** House of Amber **26** (премиум-бенчмарк, но DR = PR/туризм/офлайн, в органике US слаб),
SilverRush **41** (масс, 6000+ SKU — семантический голдмайн), Amber Artisans 15, Peora 14, Amber SOS 7
(346 отзывов), Ana Silver 7, Green River/SilverAmber/RB Amber 4–15. **Amberra 0.**

**Вывод:** ниша пробиваема. Стратегия — не объём SKU (проиграем), а **контент-first + color×type +
review-звёзды + Bali-artisan angle** в органике, где премиум-дома не воюют.

**Инструменты:** Google Keyword Planner / DataForSEO (объёмы), Google SERP + Trends, Ahrefs free DR,
ручной обход конкурентов. Выход: этот раздел + SEMANTIC-CORE-US.md.

---

## ШАГ 2 — Семантическое ядро (Keyword-Planner-факт)

**Формула масштабирования (заменяет Сид×Гео×Сущность):**
> **СИД × ТИП × ЦВЕТ/АТРИБУТ**
> - Сид = «amber jewelry», «baltic amber»
> - Тип = ring / earrings / pendant-necklace / bracelet
> - Цвет = cognac / cherry / green / honey / butterscotch / raw / milky / blue
> - Атрибут = sterling silver / gold-plated / adjustable / genuine / for women / gift

**Кластеры (полностью в SEMANTIC-CORE-US.md):**
- Brand/Head (home): amber jewelry, baltic amber jewelry, bali jewelry
- Type (категории): amber ring/earrings/necklace/bracelet + модификаторы
- **Color×Type (P1 — главная жила): cognac amber ring, green amber jewelry, cherry amber, raw amber ring…**
- Gift/occasion, for-women/men (добор)
- Информационный (journal): real/fake, care, meaning, color guide, gemstone, benefits
- Бренд-дифференциатор: balinese amber, handcrafted in Bali, certificate of authenticity

**Приоритизация:** P0 (голова + фикс каталога), P1 (color×type + P0-инфо), P2 (хвост).
**Объёмы:** тир H/M/L (оценка); точные US volume/KD дошить через Keyword Planner/DataForSEO.

---

## ШАГ 3 — Конкурентные вакуумы (найдены)

1. **Color×type лендинги** — все дома таргетят цвет, но держат как JS-фильтр без контента. У Amberra
   товары по цветам ЕСТЬ, посадочных НЕТ → создать уникализированные страницы (обходим фильтры конкурентов).
2. **Review-звёзды в SERP** — ни SilverRush(41), ни House of Amber(26) не дают Product review schema →
   Amberra может обогнать по CTR даже лидеров, повесив AggregateRating.
3. **Информационный кластер** — маркетплейсов там нет; дом-конкуренты покрывают неполно.
4. **Bali-artisan + Baltic amber + этика** — свободный позиционный угол (никто не занял, включая HoA).
5. **Gift/occasion как отдельные лендинги** — конкуренты держат одним абзацем, не разворачивают.

**УТП (одно предложение):** «Genuine Baltic amber, handcrafted by Balinese artisans in 925 sterling
silver — each piece with a Certificate of Authenticity.»

---

## ШАГ 4 — Архитектура посадочных под топ-запросы

**Материнские страницы (Фундамент, Месяц 0):**

| # | URL | Тип | Целевой ключ |
|---|-----|-----|--------------|
| 1 | `/` | Brand hub | baltic amber jewelry / amber jewelry |
| 2 | `/rings` | Type hub | amber ring / amber rings |
| 3 | `/earrings` | Type hub | amber earrings |
| 4 | `/pendants` | Type hub | amber necklace / amber pendant |
| 5 | `/bracelets` | Type hub | amber bracelet |
| 6 | `/bali-jewelry` | Angle hub | bali / balinese jewelry |
| 7 | `/journal/how-to-tell-if-amber-is-real` | Info P0 | how to tell if amber is real |
| 8 | `/journal/amber-jewelry-care` | Info P0 | how to clean amber jewelry |
| 9 | `/journal/amber-colors-guide` | Info P0 | amber colors / cognac vs cherry vs green |
| 10 | `/journal/amber-meaning` | Info P0 | amber ring meaning / symbolism |
| 11 | `/shipping-returns` | Service/trust | (не SEO, но обязателен для e-comm) |
| 12 | `/size-guide` | Service | amber ring size guide (US) |
| 13 | `/our-story` | E-E-A-T | founder/artisan (Experience) |
| 14 | `/contact` · 15 `/wholesale` | Service | — |

**Правила:** каждая SEO-посадочная — лонгрид с H2-блоками по подключам (тип-хаб 800–1200 слов + сетка
товаров; инфо-статья 1200–1800 слов + FAQ). Служебные (11–15) — вне топ-ключа, но обязательны.
Кластеры распределяются как H2 внутри посадочных (вся широта ядра покрыта уже на старте).

**НЕ делаем на старте:** не льём 300+ color×type сразу; не плодим тонкие combo без SKU.

---

## ШАГ 5 — On-page SEO (12 правил, Google-редакция)

1. **Title** 50–60 симв, ключ в первых 30. Формула: `{Color/Attr} Amber {Type} in Sterling Silver | AMBERRA`
   (год не нужен для ювелирки; вместо цены/УТП — trust/материал).
2. **Description** 140–160, ключ + LSI + триггер (Certificate of Authenticity, handcrafted in Bali, free shipping).
3. **Один H1**, точный ключ, H1 ≠ Title.
4. **H2 = реальные ключи** из ядра (не «красивые»).
5. **H3** — хвост внутри H2.
6. **Плотность ключа 1–2% + LSI** (succinite, Baltic, cabochon, 925, cognac/cherry) — естественно; Google
   семантичен, не переспамливать.
7. **Первый абзац:** ключ в 1-м предложении + ответ в первых 200 симв → **AI Overviews / featured snippet**.
8. **Alt** с ключом (+ реальное описание изделия).
9. **ЧПУ** англ-слаги (есть).
10. **Перелинковка:** анкор = точный ключ целевой; ≥5 внутренних ссылок (критично — чинит сиротство).
11. **FAQ + FAQPage schema** — ⚠ Google убрал FAQ rich-сниппет 05.2026; держим для **AI/LLM-цитирования**
    и удержания, не ради звёзд.
12. **JSON-LD:** Product+Offer(USD, availability)+**AggregateRating/Review** / Article / BreadcrumbList /
    Organization(JewelryStore). + **Google Merchant Center free listings** (см. Шаг 7).

**Стоп-лист AI-фраз:** «timeless elegance», «unique atmosphere», «exquisite», «100% guarantee»,
«perfect for any occasion» → конкретика (цвет янтаря, проба, размер, гарантия сроком, происхождение).

---

## ШАГ 6 — Engagement/CRO механики (замена ПФ-Яндекс; честный UX под Google)

1. **Quiz «Find Your Amber»** (цвет/тип/повод, 5 шагов, прогресс-бар) — вовлечение + конверсия + время.
2. **Ring-size / gift-finder** интерактив.
3. **Sticky CTA** на мобиле (Add to Cart / WhatsApp).
4. **Progress-bar чтения** в статьях журнала.
5. **WhatsApp/чат-виджет** (уже есть).
6. **Reviews-блок** с фото (UGC) + AggregateRating.
7. **Внутренняя перелинковка** осмысленными анкорами.
8. **Скорость:** inline critical CSS, WebP/AVIF+srcset, defer JS, **INP < 200ms, LCP < 2.5s, CLS < 0.1**.
9. **Mobile-first.**

**Аналитика (замена Я.Метрики):** **GA4 + Google Search Console** обязательны. События: scroll_25/50/75/100,
view_item, add_to_cart, begin_checkout, quiz_complete. Merchant Center для Shopping.
⚠ Никакой эмуляции поведения/ботов — Google это карает; растим сигналы только реальным UX.

---

## ШАГ 7 — E-E-A-T + доверие (e-commerce версия, НЕ YMYL)

Ювелирка — не YMYL, юр-аппарат (ИНН/законы/дисклеймер/автор-юрист) НЕ применяется. Вместо него:

**Trust-элементы (сквозные):**
1. **Certificate of Authenticity** (номерной) на каждой карточке — «genuine Baltic amber».
2. **Founder / artisan story** (Experience по E-E-A-T): кто, где на Бали, как делает — фото/видео мастерской.
3. **Реальные отзывы** (Judge.me) + Review/AggregateRating schema.
4. **Прозрачность:** материалы (Baltic amber + 925 + вес), цена USD открыто, shipping/returns, гарантия 1 год.
5. **Secure checkout** (Snipcart/Stripe) + trust-бейджи.
6. **Organization/JewelryStore schema** + sameAs (соцсети) + foundingLocation (Ubud, Bali).

**Google-специфика e-commerce:**
- **Merchant Center free listings** — товары бесплатно в Google Shopping tab (огромный доп-канал для US-магазина).
- **Product review snippets** — звёзды в органике.
- **Return/shipping policy** размечены — Google их учитывает в merchant-выдаче.

---

## ШАГ 8 — Programmatic-архитектура (расширяем существующий генератор)

**У Amberra УЖЕ есть движок:** `scripts/generate-products.js` (Airtable→/products) +
`generate-categories.js` (категории). Расширяем, не строим заново.

**Структура:**
```
data/
  colors.json       — cognac, cherry, green, honey, butterscotch, raw, milky, blue (+ intro-тексты, ready)
  attributes.json   — sterling-silver, gold-plated, adjustable, for-women, gift
templates/
  collection.html   — шаблон color×type / attribute-коллекции с {{плейсхолдерами}}
generate-categories.js  — ФИКС сиротства (сетка <a href="/products/">) + генерация:
                          Тип × Цвет  (если ≥3 SKU этого цвета+типа)
                          Тип × Атрибут (выборочно)
                          + пересборка sitemap.xml
```

**Что генерит:**
- Тип-хаб с кликабельной сеткой товаров (чинит CRITICAL-сиротство).
- Color×Type коллекция (`/collections/cognac-amber-rings`) — только если `ready:true` + ≥3 SKU + уник. intro 50–80 слов.
- Пересборка `sitemap.xml` + hreflang.

**Защита от тонких страниц:** combo без ≥3 реальных SKU НЕ генерится; каждая коллекция — уникальный
вводный блок (история цвета, характер камня, ценовой диапазон) + FAQ; минимум контента соблюдён.

---

## ШАГ 9 — Календарь запуска волнами

| Волна | Когда | Что | Страниц |
|-------|-------|-----|---------|
| Фундамент | Месяц 0 | Фикс сиротства + 6 type/angle-хабов + 4 P0-статьи + 5 service + checkout + schema | ~15 + каталог |
| Волна 1 | +1 мес (после индексации) | Color×Type коллекции (SKU есть: cognac/cherry/green/butter/raw) + reviews-schema | +15–25 |
| Волна 2 | +2 мес | Инфо-кластер (gemstone/benefits/buying) + gift/occasion + for-women/men | +20–30 |
| Волна 3 | +3–4 мес (траст) | Расширение color×type×attribute на сидах в топ-20 + лонгтейл | +50–100 |
| Волна 4 | +5–6 мес | Полная programmatic-сетка + бренд-дифференциатор | +100–200 |

**Правило множения:** масштабируем combo **только на сидах/типах, уже в топ-20** GSC. Сид на 30-й — ждём.
**После волны:** пауза 2–3 недели на индексацию, контроль в GSC (Coverage, нет ли «Crawled — not indexed» /
thin-content), затем следующая волна.

---

## ЧЕК-ЛИСТ ПЕРЕД ПУБЛИКАЦИЕЙ СТРАНИЦЫ (Google)

- [ ] Title 50–60, ключ в первых 30
- [ ] Description 140–160 с ключом и trust-триггером
- [ ] Один H1 с точным ключом (≠ Title)
- [ ] Каждый H2 = реальная фраза ядра
- [ ] Плотность 1–2% + LSI, без переспама
- [ ] Lead: ключ в 1-м предложении + ответ в 200 симв (AI Overviews)
- [ ] FAQ + FAQPage schema (для AI/LLM)
- [ ] JSON-LD: Product+Offer+AggregateRating / Article / BreadcrumbList / Organization
- [ ] Alt у изображений с ключом; WebP/AVIF + srcset
- [ ] ≥5 внутренних ссылок с анкором-ключом (нет сиротства)
- [ ] Trust: certificate/reviews/shipping (для карточек/категорий)
- [ ] Merchant Center feed обновлён (для товаров)
- [ ] Lighthouse mobile ≥ 90; INP<200ms, LCP<2.5s, CLS<0.1
- [ ] Стоп-фразы AI отсутствуют
- [ ] Проверка на проде curl -L после деплоя

---

## ФИНАЛЬНЫЙ ПРИНЦИП

> Amberra встаёт в топ Google не потому что «красивый», а потому что **каждый заголовок построен из
> реального запроса пользователя US**, каждая страница закрывает конкретный интент (купить cognac amber
> ring / понять real vs fake), а structured data + reviews + Merchant Center дают видимость в органике,
> Shopping и AI Overviews одновременно.
>
> Честный engagement (quiz, скорость, reviews) удерживает пользователя и растит click-сигналы БЕЗ накрутки;
> e-commerce-trust (сертификат, отзывы, прозрачность) закрывает доверие; programmatic-множитель на базе
> Airtable масштабирует на сотни color×type страниц — с гарантией уникальности каждой.

КОНЕЦ.
