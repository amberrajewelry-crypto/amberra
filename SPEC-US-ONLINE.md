# SPEC: Amberra — US Online-First SEO/e-commerce сайт

Статус: DRAFT (Phase 1 — Specify). Ждёт апрув владельца перед Plan → Tasks → Implement.
Основано на: METHODOLOGY.md (адаптировано RU-YMYL → US-jewelry), SEMANTIC-CORE-US.md,
конкурентном анализе (House of Amber DR26 бенчмарк), аудите сайта.

---

## 1. Objective

Вывести **amberrajewelry.com** в топ Google **US** по коммерческим и информационным
запросам ниши «amber jewelry» и превратить сайт в **полноценный онлайн-магазин** (online-first).

- **Кто пользователь:** US-онлайн-покупатель — self-purchase (женщины 28–50, ценят
  аутентичность/ручную работу/историю камня) + gift-покупатель. НЕ турист-сувенир (это ЦА
  офлайн-бенчмарка House of Amber — с ним НЕ конкурируем на его поле).
- **Где выигрываем:** органика Google US — там HoA слаб (его DR26 = PR/туризм/офлайн, не контент).
  Заходим через content-first + color×type programmatic + trust/reviews + Bali-artisan angle.
- **НЕ YMYL:** ювелирка — весь юридический E-E-A-T-аппарат методологии (ИНН/ОГРН/законы/
  дисклеймеры/автор-юрист) НЕ применяется. Заменяется e-commerce trust-сигналами.
- **Success (см. §9):** индексируемый каталог, рост позиций по P0/P1-ядру, звёзды в SERP,
  работающий checkout USD.

---

## 2. Tech Stack / Архитектура (as-is, строим на этом)

- **Static-generation на Vercel**, репо `~/amberra` @ `redesign/bvlgari-level`.
- **Build:** `node scripts/generate-products.js && node scripts/generate-categories.js`.
  - `generate-products.js` — тянет товары из **Airtable** (BASE `apprPtQw98iLfe0rF`,
    TABLE `tblg9KjmXRv9u0dzv`, `AIRTABLE_PAT` env) → статические `/products/{slug}` + hreflang (15 langs).
  - `generate-categories.js` — генерирует категорийные страницы (⚠ здесь баг сиротства).
- Vanilla HTML/CSS/JS: `amberra.css`, `amberra.js`, `amberra-nav.js`, `currency.js`, `lang.js`.
- `vercel.json`: cleanUrls, trailingSlash=false, security headers, redirects (/about→/our-story, /ru→/).
- Деплой: `npx vercel deploy --prod --scope amberrajewelry-cryptos-projects` — **делает ВЛАДЕЛЕЦ** (бот не деплоит).

## 3. Commands
```
Build:   node scripts/generate-products.js && node scripts/generate-categories.js
Preview: (статика; локальный http-server из корня репо)
Deploy:  npx vercel deploy --prod --scope amberrajewelry-cryptos-projects   # только владелец
Verify:  curl -sL https://www.amberrajewelry.com/<path>  # проверка на проде после деплоя
```

## 4. Project Structure (ключевое)
```
scripts/generate-products.js     — генератор карточек (Airtable → /products)
scripts/generate-categories.js   — генератор категорий  ← ФИКС сиротства + расширить на color×type
data/ (создать)                  — seeds/colors/attributes JSON для programmatic-множителя
templates/ (создать/выделить)    — шаблоны category / collection / article
*.html                           — статические страницы (hubs, service)
journal/                         — статьи (инфо-кластер)
products/                        — сгенерированные карточки
```

## 5. Адаптированная методология (9 шагов → Amberra)

| Шаг | Adapted |
|-----|---------|
| 1 Ниша | Google Ads Keyword Planner/DataForSEO + Google US SERP (не Wordstat). Конкуренты разобраны ✓ |
| 2 Ядро | Сид × **Тип × Цвет/Атрибут** (гео убрано). Ядро = SEMANTIC-CORE-US.md; объёмы дошить |
| 3 Вакуумы | color×type лендинги, review-звёзды, инфо-кластер, Bali-artisan angle ✓ |
| 4 Посадочные | Type-хабы + color×type коллекции + инфо-пилары + service. Каждая — реальный ключ ядра |
| 5 On-page 12 | Перенос с правками: FAQPage — для AI/LLM (Google убрал rich-сниппет 05.2026); Title-формула с атрибутом/trust; Product+Offer+AggregateRating |
| 6 ПФ→CRO | GA4 (не Метрика): sticky CTA, quiz «find your amber»/ring-size/gift-finder, progress-bar в журнале, WhatsApp-виджет, скролл-цели. Честный UX |
| 7 E-E-A-T | НЕ YMYL: Certificate of Authenticity, genuine-amber доказательство, founder/artisan (Experience), reviews, shipping/returns, secure checkout, прозрачность материалов |
| 8 Programmatic | Расширить `generate-categories.js`: Тип × Цвет × [Металл/Стиль]. Гард тонкости: combo не генерить без ≥3 SKU + уник. intro |
| 9 Волны | Фундамент → масштаб color×type×attribute на сидах в топ-20; Google thin-content контроль |

## 6. On-page правила (адаптированные 12, кратко)
1. Title 50–60, ключ в первых 30, формула `{Attr} {Color} Amber {Type} in Sterling Silver | AMBERRA`
2. Description 140–160 + trust-триггер (certificate, free shipping, handcrafted in Bali)
3. Один H1, точный ключ, H1 ≠ Title. 4. H2 = реальные ключи ядра. 5. H3 = хвост.
6. Плотность ключа 1–2% + LSI (succinite, sterling silver, cabochon, Baltic). 7. Lead: ключ в 1-м предложении + ответ в 200 симв (AI Overviews). 8. Alt с ключом. 9. Англ-слаги (есть).
10. Перелинковка: анкор=ключ, ≥5 ссылок. 11. FAQ + FAQPage schema (AI/LLM-выгода). 12. JSON-LD Product+Offer+AggregateRating / Article / BreadcrumbList / Organization.
Стоп-фразы AI: «timeless elegance», «unique atmosphere», «100% guarantee» → конкретика (камень, проба, размер, гарантия сроком).

## 7. E-commerce (online-first)
- Корзина/чекаут на статике: **рекомендация — Snipcart или Shopify Buy Button** (работают со static, USD). Решение — §11.
- Селектор размеров колец US (5–10 + size guide, `size` в Product schema).
- USD-цены (currency.js уже есть), shipping/returns страница, secure-checkout trust-бейджи.
- Reviews: собрать (Judge.me/Loox/собственные) → AggregateRating/Review schema (звёзды в SERP). НЕ фабриковать.

## 8. Boundaries
- **Always:** реальный ключ в каждом заголовке; уник. контент на каждой странице; тест сборки локально; проверка на проде curl после деплоя; бэкап перед правкой прод-данных.
- **Ask first:** смена e-commerce-платформы; изменения Airtable-схемы; новые зависимости; массовые правки шаблонов, затрагивающие все страницы.
- **Never:** деплой без команды владельца; коммит секретов (AIRTABLE_PAT, токены); фабрикация отзывов/данных; noindex/удаление страниц без прямой команды; teething/детский янтарь (FDA-риск).

## 9. Success Criteria (тестируемо)
1. `/rings /earrings /pendants /bracelets` содержат ≥N кликабельных `<a href="/products/">` (сиротство устранено) — проверка curl.
2. Созданы color×type коллекции для цветов с ≥3 SKU (cognac/cherry/green/butter/raw…), каждая с уник. intro 50–80 слов + FAQ.
3. Инфо-пилары P0 опубликованы (real/fake test, care, color guide, meaning) с FAQPage schema.
4. Каждая карточка: Product+Offer(USD)+AggregateRating, селектор размера US, Add to Cart.
5. Organization/JewelryStore schema на главной; webp/srcset на медиа.
6. Рост позиций по P0/P1-ядру в GSC (замер после индексации волны).
7. Lighthouse mobile ≥ 90.

## 10. Дорожная карта (волны)
- **Фундамент (сейчас):** фикс сиротства (generate-categories.js) + type-хабы с текстом/FAQ + service (shipping/returns, size guide) + Organization schema + checkout MVP.
- **Волна 1:** color×type коллекции (SKU есть) + P0-инфо-статьи + reviews-schema.
- **Волна 2:** gift/occasion, for-women/men, расширение programmatic на работающих сидах.
- **Волна 3:** лонгтейл, бренд-дифференциатор, добор инфо-кластера.

## 11. Open Questions (нужен вход владельца)
1. **Точные US-объёмы:** дать креды Google Ads (developer_token+OAuth) / DataForSEO? Сейчас идём на тир-оценках.
2. **E-commerce платформа для static:** Snipcart (реком.) / Shopify Buy Button / Stripe Payment Links / иное?
3. **Источник отзывов** для review-schema (Judge.me / Loox / собственная форма)?
