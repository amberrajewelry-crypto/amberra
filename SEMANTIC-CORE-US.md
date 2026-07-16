# AMBERRA — Семантическое ядро под рынок US (Google, English)

Составлено: 2026-07-13. Источник данных: валидированная семантика конкурентов
(House of Amber DR26, SilverRush DR41, Amber Artisans, Amber SOS, Peora, Green River,
SilverAmber, RB Amber) + расширения выдачи Google US (autocomplete/related/PAA) +
инвентарь amberrajewelry.com (109 URL, 79 товаров).

> **Объёмы запросов даны ТИРАМИ (H/M/L) — качественная оценка по конкуренции в SERP и
> логике спроса, НЕ измеренные числа.** Точные volume/KD подключим через Google Ads
> Keyword Planner или DataForSEO, когда будет доступ (сейчас: Ahrefs Insufficient plan,
> Google Ads не инициализирован). H=высокий, M=средний, L=низкий/лонгтейл.

---

## 0. Позиционирование ядра

Amberra = **luxury × genuine Baltic amber × handcrafted in Bali × 925 sterling silver**.
Три угла, которые НЕ занял ни один конкурент (включая бенчмарк House of Amber):
1. **Bali / Balinese handcrafted** — гео-нарратив происхождения работы.
2. **Designer / slow-made / artisan** — авторский дизайн (у HoA только имена-дизайнеры).
3. **Этика и происхождение** (сертификат подлинности + устойчивость).

Обязательный к покрытию **trust-кластер** (без него не входят в consideration-set):
`genuine / authentic / certified / natural / real Baltic amber`, `925 sterling silver`,
`Certificate of Authenticity`, `handmade, one-of-a-kind`.

**Стоп-зона:** teething / baby / детский янтарь — FDA-риск в US + конфликт с luxury. Не брать.
Wellness/healing (succinic acid) брать только в регистре «meaning/energy», без медицинских
заявлений (иначе бренд падает в дёшево-эзотерический сегмент, где сидят Amber SOS / RB Amber).

---

## 1. Архитектура ядра (hub → spoke)

```
HOME (brand hub)
├── TYPE hubs:  /rings  /earrings  /pendants(+necklaces)  /bracelets  /chains
│     └── COLOR × TYPE spokes (НОВОЕ):  cognac / cherry / green / honey / butter / raw ...
├── GIFT / OCCASION hub  (НОВОЕ)
├── FOR WOMEN / MEN  (аудитория)
└── JOURNAL (информационный кластер — точка входа для DR 0)
      authenticity · gemstone · color guides · meaning · care · buying · sizing
```

Приоритеты: **P0** = делать первым (разблокировка + голова), **P1** = основной рост,
**P2** = добор/лонгтейл.

---

## 2. КОММЕРЧЕСКИЕ кластеры

### 2.1 Brand / Head hub — P0 → `/` (home)
| Запрос | Тир | Статус |
|--------|-----|--------|
| amber jewelry | H | покрыто |
| baltic amber jewelry | H | покрыто |
| genuine baltic amber jewelry | M | усилить trust |
| bali jewelry / balinese jewelry | M | покрыто (дифференциатор) |
| amber jewelry online / buy amber jewelry | M | добавить transactional-сигнал |

### 2.2 TYPE hubs — P0 → категории (⚠ сначала починить сиротство каталога!)
> Категории сейчас дают 0 ссылок на `/products/` — до фикса SSR-сетки ранжирования не будет.

**Rings /rings**
| amber ring · amber rings (H) · baltic amber ring (M) · sterling silver amber ring (M) · amber ring for women (M) · adjustable amber ring (M) · amber statement/cocktail ring (L) · large/chunky amber ring (L) |

**Earrings /earrings**
| amber earrings (H) · amber earrings sterling silver (M) · baltic amber earrings (M) · amber stud earrings (M) · amber drop/dangle earrings (M) · amber teardrop earrings (L) |

**Pendants + Necklaces /pendants**
| amber necklace (H) · amber pendant (M) · baltic amber necklace (M) · amber pendant necklace (M) · sterling silver amber pendant (L) · amber pendant silver (L) |

**Bracelets /bracelets**
| amber bracelet (M) · baltic amber bracelet (M) · amber cuff (L) · amber bangle (L) · amber bead bracelet (L) |

**Chains /chains** — слабый коммерческий интент под бренд (`sterling silver chains` L).
Рекомендация: не тратить SEO-ресурс, держать как сопутствующую страницу.

### 2.3 COLOR × TYPE — P1 — ГЛАВНАЯ НЕДОИСПОЛЬЗОВАННАЯ ЖИЛА → НОВЫЕ collection-страницы
Все конкуренты таргетят цвет; House of Amber строит title-формулу `{type} in {color} amber`.
**У Amberra товары по цветам ЕСТЬ, посадочных страниц НЕТ.** Создаём коллекции + color×type спокы.
Приоритет по цветам с ≥3 SKU в ассортименте (cognac, cherry, green, butter, honey, raw, blue):

| Цвет | Ядро запросов | Тир | SKU есть |
|------|---------------|-----|----------|
| **Cognac** | cognac amber ring · cognac amber jewelry · cognac amber necklace/earrings · large/adjustable cognac amber ring | M | да (basket-weave-cognac, cognac-link, cognac-teardrop) |
| **Cherry** | cherry amber ring · cherry amber jewelry · cherry amber necklace · cherry amber sterling silver | M | да (cherry-amber-bracelet, halo-cherry) |
| **Green** | green amber jewelry · green amber ring · green amber earrings · raw green amber ring | M | да (basket-weave-green, halo-green, iris-green) |
| **Honey** | honey amber ring · honey amber jewelry · honey amber necklace | L-M | да (honey-bead) |
| **Butterscotch** | butterscotch amber · butterscotch amber necklace/set · butter amber ring | M | да (basket-weave-butter, halo-butter, round-stud-butter) |
| **Raw / untreated** | raw amber ring · raw amber jewelry · adjustable raw amber ring · untreated baltic amber | M | да (raw-amber-cuff, raw-triangle, raw-oval) |
| **Blue (rare)** | blue amber ring · blue amber jewelry (редкий, низкая конкуренция) | L | да (blue-shell, halo-blue, round-stud-blue, iris-blue) |
| **Multicolor** | multicolor amber jewelry · rainbow amber | L | да (multicolor-code, rainbow-code) |
| Milky/White | milky amber · white amber (мало SKU) | L | слабо |

Title-шаблон (эталон HoA/SilverRush): **`{Color} Amber {Type} in Sterling Silver | Handcrafted | AMBERRA`**

### 2.4 Аудитория / пол — P2
| amber jewelry for women (M, покрыто журналом) · amber jewelry set / gift set (L) · **men's amber ring / men's amber jewelry** (L, ДЫРА — заходить только если ассортимент поддержит) |

### 2.5 Gift / Occasion — P2 → gift-hub + сезонные спокы
| amber jewelry gift (M, есть gift-guide) · amber gift for her (L) · anniversary amber gift (L) · amber jewelry for mom / mother's day (L) · valentine's amber gift (L) · christmas amber gift (L) |
Конкуренты (HoA) держат все поводы одним абзацем — разворот в отдельные лендинги = лёгкий трафик.

### 2.6 Модификаторы-усилители (вплетать в title/H1, не всегда отдельные страницы)
`sterling silver / 925` (в ~100% title конкурентов) · `genuine · authentic · certified · natural · real` ·
`handmade · handcrafted` · `adjustable` (ключ для колец) · `gold-plated / vermeil` ·
`baltic` (гео-якорь) · `one-of-a-kind · unique`. Бренд-угол: `bali · balinese · handcrafted in Bali`.

---

## 3. ИНФОРМАЦИОННЫЙ кластер — P1 (главная дверь для DR 0: маркетплейсов тут НЕТ) → `/journal`

Выдача по инфо-запросам = блоги DR 5–30. Новый домен реально заходит. Каждая статья с FAQ-schema,
внутренними ссылками на цвет/тип-коллекции.

| Под-кластер | Ключевые запросы | Тир | Статус Amberra |
|-------------|------------------|-----|----------------|
| **A. Authenticity / real-fake** (P0-info) | how to tell if amber is real · real vs fake amber · salt water/float test · UV blacklight test · hot needle/scent test · how do I know my baltic amber is real | H | частично (`genuine-balinese-amber`) — нужна отдельная статья под тест |
| **B. Gemstone properties** | what is baltic amber · is amber a gemstone/stone · amber Mohs hardness (2–2.5) · how old is baltic amber (40–50M) · amber with insect inclusions value | M | ДЫРА |
| **C. Color guides** | amber colors explained · cognac vs cherry vs green amber · rarest amber color · is green amber natural or dyed · what is butterscotch amber · why is amber milky | M | ДЫРА (сильно линкует в 2.3) |
| **D. Meaning / symbolism** | amber ring meaning · amber symbolism · what does amber represent · amber stone of protection | M | частично (`spiritual-jewelry-bali`) — нужна чистая статья |
| **E. Benefits (осторожно)** | baltic amber benefits · succinic acid amber · amber energy/meaning | M | ДЫРА — только «meaning/energy», без health-claims |
| **F. Care** | how to clean amber jewelry · amber jewelry care · can amber get wet · does amber darken · storing amber | M | ДЫРА |
| **G. Buying / price** | where to buy authentic baltic amber · baltic amber price/cost guide · how much does amber cost | M | покрыто (`price`, `buy`) |
| **H. Sizing** | amber ring size guide · US ring sizes · how to measure ring size | L | ДЫРА (важно для US-конверсии) |

**Уже есть (не дублировать):** amber rings for women, baltic amber rings, amber earrings,
amber bracelets for women, amber pendant necklace, collection guide, gift guide 2026, genuine/how-to-buy,
price guide, where to buy, bali silver rings, balinese jewelry guide, how to style, spiritual/meaning, wholesale.

---

## 4. Бренд-дифференциатор — P2 (низкая конкуренция, определяет бренд)
`handcrafted bali amber · balinese amber jewelry · bali silver rings · artisan amber jewelry ·
slow-made / designer amber · certificate of authenticity amber · ethically sourced amber`.

---

## 5. Дорожная карта внедрения (по приоритету)

**Phase 0 — Разблокировка (без неё ядро мёртво):**
- Отрендерить SSR-сетку кликабельных `<a href="/products/{slug}">` на всех категориях и /shop.
- Кликабельные хлебные крошки + related-товары на карточках.
- Устранить дубль /shop vs /catalog (301 или уникализация интента).

**Phase 1 — Основной рост:**
- COLOR × TYPE collection-страницы (2.3) — cognac, cherry, green, butter, raw в первую очередь (SKU есть).
- Инфо-статьи P0: real/fake test (A), care (F), color guide (C), meaning (D), benefits-meaning (E).
- Уникальный SEO-текст 50–80 слов на каждой категории (эталон — вводный абзац SilverRush).
- Review + AggregateRating schema (звёзды в SERP — обгон даже HoA по CTR).

**Phase 2 — Добор:**
- Gift/occasion лендинги (2.5), for-women/men (2.4), sizing-гайд (H) с US-размерами.
- Organization/JewelryStore schema на главную.
- webp/avif + srcset.

**Phase 3 — Лонгтейл/бренд:**
- Бренд-дифференциатор (раздел 4), gemstone-properties (B), sizing по фасетам.

---

## 6. Title/H1 паттерны (из эталонов конкурентов, адаптировано под Amberra)

```
Категория тип:   Amber Rings in Sterling Silver — Handcrafted in Bali | AMBERRA
Категория цвет:  Cognac Amber Rings | Genuine Baltic Amber & 925 Silver | AMBERRA
Карточка товара: {Poetic name} — Genuine Baltic Amber {Color} .925 Silver Ring, Adjustable | AMBERRA
Инфо-статья:     How to Tell If Amber Is Real: 5 At-Home Tests (2026 Guide) | AMBERRA Journal
Meta-desc кат.:  Shop handcrafted {color} Baltic amber {type} in 925 sterling silver, made in Bali.
                 Certificate of authenticity. Ships worldwide. {N} unique pieces.
```

---

## 7. Что нужно для точных объёмов (следующий шаг по данным)
- Google Ads Keyword Planner: инициализировать (`google_ads_initialize` — нужны developer_token +
  OAuth client/secret/refresh) → реальные US volume + competition по всему ядру.
- Либо DataForSEO MCP (volume/KD/SERP) — требует auth.
- После получения: проставить точные volume/KD в таблицы, отсортировать спокы по (volume × достижимость).
