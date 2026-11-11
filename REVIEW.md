# REVIEW.md — ревью PR Amberra (www.amberrajewelry.com)

Смотреть только дифф PR. Три прохода, в отчёте — по разделам.

## 1. Баги
- CSS не в том файле: index/shop/journal/stores → style.css; about/catalog/contact/tryon → amberra.css.
- Новый ключ перевода есть во всех 15 языках и в обоих TR (app.js и amberra.js); для ar — dir="rtl".
- Правка в products/ или sitemap.xml руками — перезатрётся сборкой; править scripts/generate-products.js.
- Новая картинка в коммите, а не untracked (git-деплой её потеряет).
- Мобилка 375px: нет горизонтального скролла; grid-элементам min-width:0.
- Header остаётся position:fixed; на model.png нет mix-blend-mode и mask-image.

## 2. Безопасность
- AIRTABLE_PAT, RESEND_API_KEY, TURNSTILE_SECRET — только в api/ через process.env, не в клиентском JS и не в коммите.
- api/contact.js: Turnstile-проверка и экранирование ввода не ослаблены.
- Новый внешний домен (скрипт, шрифт, API) добавлен в CSP в vercel.json, а не CSP ослаблен целиком.

## 3. Сверка с задачей и планом
- Сделано ровно то, что просил Владимир; оплата, язык и позиционирование (handmade sterling silver) не тронуты без команды.
- Тексты без «Ubud/Bali workshop»: «designed in Bali, crafted by our artisans».
- `npm run build` прогнан, превью Vercel зелёное.

## Мелочи (не больше 5)
- alt у новых картинок; loading="lazy" ниже первого экрана.
- Цвета через переменные --amber/--cream и т. п., а не новые hex.
- Забытые console.log.

## Не докладывать
- Sentry DSN и PostHog key в коде — публичные по устройству.
- Старые проблемы вне диффа, форматирование, вкусовщину по дизайну.
