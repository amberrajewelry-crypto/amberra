# Amberra SEO v2 — Definitive Plan

Дата: 2026-08-26
Статус: на согласовании (заменяет 2026-08-26-amberra-seo-rebuild-design.md — тот amber-якорный, устарел)
Ограничения (зафиксированы владельцем): оплата **USD**, язык **English only**. Не менять.

---

## 0. Стратегия (снимает конфликт «объём vs защитимость»)

Amberra = **handmade sterling silver** бренд; янтарь — фирменная фича и ров. Все 94 изделия — 925 серебро ручной работы.

Главный принцип: **бить сначала в защитимый long-tail (LOW-конкуренция + точный товарный фит), головы — вторичный аспирационный upside, а не цель дня-один.** Generic «silver jewelry» — переполнено (Pandora/NAJO/Etsy), рва нет. Ров Amberra = пересечение **handmade sterling silver × amber × Bali**. Янтарь НЕ хоронить — это единственная незанятая клетка (John Hardy $500+ без янтаря).

### Тиринг ключей
| Tier | Что | Когда | Пример |
|---|---|---|---|
| **T1 — winnable** | long-tail LOW + точный фит | строим первым | sterling silver handmade jewelry 4400 LOW, handmade silver rings 390, sterling silver amber ring 590, amber rings 1900, baltic amber jewelry |
| **T2 — aspirational heads** | HIGH-головы, нужен авторитет | 6–18 мес, через off-page | sterling silver rings 74000, handmade jewelry 33100, silver jewelry 18100, artisan jewelry 18100 |
| **T3 — gated на товар** | нет SKU сейчас | после расширения | promise rings 49500 (нужны simple adjustable-бэнды), gemstone 14800 |

---

## 1. Одна страница = один primary (анти-каннибализация)

Строгое владение: никакие две страницы не делят primary. Home ≠ пиллар.

| URL | PRIMARY (владеет) | Secondary (LSI, не отдельные страницы) | Интент |
|---|---|---|---|
| `/` | handmade sterling silver jewelry (бренд-хаб) | amberra, artisan jewellery | Brand/Nav |
| `/handmade-sterling-silver-jewelry` | **sterling silver handmade jewelry** (4400 LOW) | handmade silver jewelry, artisan sterling silver | Commercial catalog |
| `/artisan-jewelry` | **artisan jewelry** (18100) + handmade jewelry (33100) | handcrafted jewelry, ethical jewelry | Brand/Informational (E-E-A-T, история Бали) |
| `/rings` | **sterling silver rings** (74000, T2) | handmade silver rings, amber rings | Transactional |
| `/earrings` | **sterling silver earrings** (33100, T2) | handmade silver earrings, amber earrings | Transactional |
| `/bracelets` | sterling silver bracelets | silver bangles, amber bracelets | Transactional |
| `/pendants` | sterling silver pendants & necklaces | amber pendant | Transactional |
| `/chains` | sterling silver chains | — | Transactional |
| `/amber-jewelry` | **amber jewelry** (8100, co-primary ров) | baltic amber jewelry, sterling silver amber | Commercial |
| `/promise-rings` | sterling silver promise rings (49500, **T3 — только при товаре**) | — | Transactional |

Разведение `/handmade-sterling-silver-jewelry` (commercial) и `/artisan-jewelry` (brand/story) — по **интенту**, не каннибалят (разные SERP).

---

## 2. Архитектура (blended silver + amber)

```
/  ← бренд-хаб (не конкурентная landing, корень)

ПИЛЛАРЫ
/handmade-sterling-silver-jewelry  ← T1 commercial (ss handmade 4400 LOW) — каталог-хаб
/artisan-jewelry                   ← T2 brand/E-E-A-T (artisan 18100 / handmade 33100) — история Бали

КАТЕГОРИИ (по типу, primary=head T2, реально берут long-tail T1)
/rings /earrings /bracelets /pendants /chains

РОВ (co-primary, НЕ вторично-задвинуто)
/amber-jewelry  ← amber jewelry 8100 (+ якоря amber rings/earrings, мост sterling-silver-amber)

JOURNAL (инфо → коммерция, топикал-авторитет)
/journal/sterling-silver-jewelry-care · /ring-size-guide · /what-is-artisan-jewelry
/handmade-vs-mass-produced-jewelry · /how-to-tell-if-amber-is-real · /baltic-amber-guide

ТОВАРЫ /products/{slug}

GATED (T3, при товаре): /promise-rings, /gemstone-jewelry
```

---

## 3. Объём текста по типам страниц (пропорция, не стена)

| Тип | Видимый текст | Где | Правило |
|---|---|---|---|
| Home | 300–500 слов | короткие блоки | showcase, не эссе; текст не выше товара |
| Пиллар | 1200–1800 слов | intro 150 + разделы под сеткой | глубина топика, не вода |
| Категория | 500–800 слов | intro ~150 над сеткой + 400–600 ПОД сеткой | SEO-копия ниже товара, UX первым |
| Товар | 250–400 слов | уникально на SKU | размеры, техника, камень |
| Journal | 1200–1800 слов | статья | 1 тема, таблицы/списки |

Принцип: **контент служит пользователю; ключевые SEO-абзацы — под товарной сеткой, не над ней.** Никаких «портянок» на первом экране.

---

## 4. Анти-переспам / over-optimization (жёсткие правила)

1. **Primary ровно 1 раз** в: title, H1, первые 100 слов, один H2, slug. Больше — нет.
2. **Плотность primary 0.8–1.5%, НИКОГДА >2.5%.** Остальное — LSI-варианты: `sterling silver / 925 silver / handcrafted silver / artisan-made`.
3. **Title = primary + 1 модификатор + бренд.** Запрещён стакинг («Silver Rings Silver Ring Buy Silver Jewelry»).
4. **Анкоры внутренних ссылок разнообразить** — не 100% exact-match; вперемешку брендовые/частичные/дескриптивные.
5. **Никаких** hidden text, doorway-страниц, повторяющегося boilerplate между категориями.
6. **Meta description — под CTR** (выгода + дифференциатор), не набивка ключей.
7. **Товарные описания уникальны на SKU**, primary один раз естественно.
8. H1 — человеческий, не «amber rings sterling silver rings handmade rings».

## 5. Уникальность контента (анти-AI-boilerplate)

Никаких общих шаблонных абзацев между страницами (штраф за sameness, что нашёл seo-content). Каждая категория/товар — своя копия. Контроль: **n-gram overlap между любыми двумя категориями < 30%**. Journal — first-person опыт Jane (E-E-A-T Experience), не безличный ИИ-текст.

---

## 6. Внутренняя перелинковка (с разнообразием анкоров)
- Home → оба пиллара + `/amber-jewelry` + топ-категории (анкоры варьировать).
- `/handmade-sterling-silver-jewelry` → все категории + `/amber-jewelry`.
- `/artisan-jewelry` → категории + журнал + крафт-товары (главный E-E-A-T якорь Бали здесь).
- Категории ↔ между собой, → товары, → свой пиллар, амбер-сабсет → `/amber-jewelry`.
- Journal → коммерческие (care→категории, ring-size→rings).
- Каждый товар → родительская категория + пиллар + 3–4 related.

## 7. Товарный фит — гейт ПЕРЕД работой
Прежде чем вешать silver-head рамку — **визуальный аудит каталога**: читается как «sterling silver jewelry» или как «amber jewelry»? Если фото амбер-доминантны, silver-головы дают частичный мисматч → primary держать на `handmade sterling silver + amber`. **/promise-rings НЕ создавать**, пока нет promise-SKU (простые adjustable-бэнды $40–90). Проверить в Airtable наличие.

## 8. Off-page / Authority / E-E-A-T (движок, которого не было)
Головы T2 без авторитета не берутся. Обязательный трек параллельно on-page:
- **Отзывы**: подключить Judge.me/Trustpilot → сбор → `AggregateRating` schema (звёзды в SERP, CTR).
- **Digital PR**: gifting fashion/jewelry-редакторам, HARO/Qwoted, питчи истории «Baltic amber + Bali craft».
- **Беклинки**: артизан/ethical/handmade-директории, гест-посты, marketplace-присутствие (Etsy) → рост брендовых запросов.
- **Author entity**: реальная bio Jane Sakhvadze, first-person в journal, `knowsAbout`, sameAs соцсети.
- **Brand signals**: единый NAP, соцсети, консистентность.

## 9. Замер / baseline (без него нельзя оценить)
- **До правок** снять GSC baseline: позиции/клики/показы по текущим URL (CLAUDE.md: Supermetrics ds_id=GW).
- Трек целевых ключей еженедельно, primary-позиция на страницу.
- Метрики успеха по фазам (см. §13).

## 10. Технический слой (USD/English зафиксированы)
- Убить дубли `/shop/*` → 301; canonical на дубли товаров (`-1`,`-25`).
- Переписать title/H1 по §1 + §4 (без переспама).
- Schema: Product/Offer **USD, один Offer**; BreadcrumbList; Organization/Website; `speakable` на топ-journal. AggregateRating — по §8.
- Ubud: **факт-чек реального места производства**, затем убрать/переписать в «crafted by hand in Bali» только если правда.
- Sitemap: реальный lastmod, без priority/changefreq, все страницы.
- **НЕ делаем**: мультивалюта, hreflang языковых вариантов, переводы.

---

## 11. Фазы

**P0 — winnable + фундамент (макс. ROI сейчас):**
- Товарный фит-аудит (§7) + GSC baseline (§9).
- `/handmade-sterling-silver-jewelry` пиллар (ss handmade 4400 LOW).
- `/amber-jewelry` (8100, ров).
- Переписать `/rings` `/earrings` (primary head, реально берут long-tail `handmade silver / sterling silver amber [type]`).
- Техчистка: shop/-дубли 301, canonical, sitemap, Ubud (после факт-чека), title/H1 без переспама.

**P1 — авторитет + широта:**
- `/artisan-jewelry` пиллар (33100/18100, история Бали, E-E-A-T).
- Off-page движок (§8): отзывы→AggregateRating, digital PR, беклинки.
- Journal (6 статей, first-person).
- Утолщение контента категорий/товаров (уникально, §5).

**P2 — расширение (gated на товар):**
- `/promise-rings` (49500 LOW) — только после promise-SKU.
- `/gemstone-jewelry` (14800) — после gemstone-SKU.
- Масштаб отзывов.

---

## 12. Риски и митигации
| Риск | Митигация |
|---|---|
| Головы T2 не ранжируются (HIGH, DR низкий) | primary-фокус на T1 long-tail; off-page движок §8; head как upside |
| promise rings — интент-мисматч | T3, гейт на реальные SKU (§7) |
| Каннибализация пилларов | одна-страница-один-primary §1, разведение по интенту |
| Переспам-штраф | правила §4, плотность <2.5%, LSI |
| AI-boilerplate штраф | уникальность §5, n-gram <30%, first-person |
| Янтарь-мисматч под silver-головы | фит-гейт §7, primary держит amber-модификатор |
| Нет отзывов → нет звёзд/доверия | §8 сбор отзывов приоритетно |

## 13. Метрики успеха (что даёт 10/10-исполнение)
- 60 дней: T1-ключи (ss handmade jewelry, handmade silver rings/earrings, sterling silver amber ring, amber rings) — в топ-20; ≥1 в топ-10.
- 90 дней: `/amber-jewelry` топ-10 по «baltic amber jewelry»; рост брендовых запросов.
- 6 мес: категории в топ-20 по head-модификаторам; первые звёзды (AggregateRating) в SERP; ≥10 качественных беклинков.
- Baseline→дельта клики/показы GSC растёт мес-к-мес.

## 14. Зафиксировано / YAGNI
- **Locked**: USD (один Offer), English only.
- **YAGNI**: мультивалюта, hreflang-переводы, fine/boho/demi-fine страницы, FAQPage schema, promise/gemstone до появления товара.
