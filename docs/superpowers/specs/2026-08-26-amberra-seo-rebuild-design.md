# Amberra — SEO-переделка под ВЧ-ключи — Design Spec

Дата: 2026-08-26
Статус: на согласовании

## Цель
Переделать сайт Amberra так, чтобы он честно ранжировался под высокочастотные коммерческие ключи ювелирного рынка (приоритет US → UK → DACH/France), а не только под нишевый «baltic amber».

## Решения (зафиксированы)
1. **Каталог расширяется**: 925 серебро + полудрагоценные камни + балтийский янтарь. Янтарь — якорь-история (Bali + Baltic), не единственный товар. Причина: большие ВЧ-двери (handmade/artisan/silver jewelry) недостижимы на чисто янтарном каталоге.
2. **Позиционирование**: handcrafted-in-Bali artisan jewelry, средне-премиум $150–500. Незанятая клетка (подтверждено конкурентным анализом AU+US: только John Hardy $500+, без янтаря).
3. **Рынки**: US основной (объём ×10–25 к AU), затем UK, затем DACH/France.
4. **«Bali» — бренд-история и E-E-A-T, не поисковый ключ** (объём 590–880 мал).

## Данные спроса (Google Keyword Planner, US)
- sterling silver promise rings 49500 (LOW) — золотая возможность
- sterling silver rings 74000 (HIGH), sterling silver earrings 33100 (MED)
- handmade jewelry 33100 (MED), artisan jewelry 18100, silver jewelry 18100, gemstone jewelry 14800, ethical jewelry 14800 (LOW)
- sterling silver handmade jewelry 4400 (LOW) — победный для DR0
- amber jewelry 8100, amber ring 1900, amber earrings 1300, amber bracelet 1300, amber pendant 720, sterling silver amber ring 590
- UK: silver jewellery 8100, handmade jewellery 2400, amber jewellery 1900

## Архитектура (3 кластера + Journal)

### Кластер Silver — пиллар `/sterling-silver-handmade-jewelry` (4400, LOW)
Спицы: `/sterling-silver-promise-rings` (49500 LOW, запускать первым), `/rings` (переписать), `/earrings` (переписать), `/gemstone-jewelry` (при запуске камней).

### Кластер Amber — пиллар `/amber-jewelry` (8100)
Спицы: `/amber-rings` (1900), `/amber-earrings` (1300), `/bracelets`, `/pendants`, мост `/sterling-silver-amber-jewelry` (усилить существующий).

### Кластер Brand/E-E-A-T — пиллар `/artisan-jewelry` (18100 + ethical 14800)
Главное место для истории «designed in Bali / Baltic amber sourcing / сертификаты».

### Кластер Journal (informational, вход для DR0)
`/journal/how-to-tell-if-amber-is-real` (P0), amber-colors-guide, amber-meaning, amber-jewelry-care, ring-size-guide, baltic-amber-benefits.

## URL-карта
**Создать**: /sterling-silver-handmade-jewelry, /sterling-silver-promise-rings, /amber-jewelry, /amber-rings, /amber-earrings, /artisan-jewelry, /gemstone-jewelry + 6 journal-статей.
**301**: /bali-jewelry→/artisan-jewelry; /shop/{rings,earrings,bracelets,pendants}→/{...} (убить дубли); /collections/{solar,sacred,botanica}→/amber-jewelry; /amber/{color}→/amber-rings#{color}.
**Усилить**: /sterling-silver-amber-jewelry, /rings, /earrings, /bracelets, /pendants (title/H1/schema/SEO-абзац).
**Canonical**: на товарных дублях (-1, -25, -27) на основной URL.

## Технические разрывы (из аудита, закрыть при переделке)
1. Дубли shop/ vs top-level — 301 + консолидация. (seo-technical 61/100)
2. Title'ы амбер-брендовые → переписать под спрос (handmade/artisan/silver + тип изделия).
3. hreflang: только en+x-default → добавить en-US/en-GB (US spelling canonical, UK alternate; UK-дубли только при активном UK-продвижении, пока YAGNI).
4. Schema: priceCurrency только USD → мультивалютные Offer (USD/GBP/EUR) + shipping/return для GB/EU; добавить AggregateRating когда будут отзывы; availability — механизм обновления.
5. Sitemap: убрать priority/changefreq, реальные lastmod, включить все страницы; исправить /products редирект-коллизию.

## Контент (из аудита seo-content 58/100)
1. Проверить journal/balinese-*.html на остатки Ubud-нарратива (критично).
2. Товарные описания 80→300–400 слов: размеры, техника, конкретика камня, ключи органично.
3. Категорийный контент 400–500 слов на /rings, /earrings и др. под ключи.
4. E-E-A-T: имена мастеров, регион Baltic sourcing, верификация сертификата; first-person абзацы Jane в 2–3 journal-статьях.

## Приоритет запуска
- **P0 (неделя 1–2)**: /sterling-silver-promise-rings, /amber-jewelry, /sterling-silver-handmade-jewelry, усилить /sterling-silver-amber-jewelry; переписать /rings /earrings; /amber-rings; /journal/how-to-tell-if-amber-is-real.
- **P1 (месяц 2–3)**: /artisan-jewelry, /amber-earrings, /bracelets /pendants, journal (colors, ring-size).
- **P2 (месяц 4+)**: /gemstone-jewelry (после запуска ассортимента камней), color×type страницы.

## Ограничения / открытые вопросы
- Расширение каталога (реальные изделия серебро+камни) — производственный вопрос, вне SEO-скоупа; SEO-страницы /gemstone-jewelry запускать после появления товара.
- Мультивалютность требует решения по ценам GBP/EUR (пока статический HTML → массив Offer).
- Отзывы для AggregateRating собирать приоритетно (нельзя выдумывать).

## Что НЕ делаем (YAGNI)
- fine jewelry (Tiffany/Cartier territory), boho (конфликт с luxury), demi-fine отдельной страницей (Mejuri занял, вплетаем в мета).
- UK-дубли страниц сейчас — только hreflang на пиллары.
- FAQPage schema (не даёт SERP-фичи с мая 2026).
