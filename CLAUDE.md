# AMBERRA — Инструкции для Claude

## Deploy
```
npx vercel deploy --prod
```
Папка: `/Users/vladimir/amberra/`. Сайт: https://www.amberrajewelry.com

---

## Карта CSS/JS файлов — ЧИТАТЬ ПЕРВЫМ

| Страница | CSS | JS |
|---|---|---|
| index.html | **style.css** | app.js |
| shop.html | **style.css** | app.js + shop.js |
| journal.html | **style.css** | app.js |
| our-story.html | **style.css** | app.js |
| stores.html | **style.css** | app.js + Leaflet |
| about.html | amberra.css | amberra-nav.js + amberra.js |
| catalog.html | amberra.css | amberra-nav.js + amberra.js |
| contact.html | amberra.css | amberra-nav.js + amberra.js |
| tryon.html | amberra.css | amberra-nav.js + amberra.js |

**Правило:** index/shop/journal/stores → `style.css`. about/catalog/contact/tryon → `amberra.css`.

---

## CSS переменные (style.css)
```
--white:#FFFFFF  --cream:#FAF8F5  --silk:#F2EEE8  --mist:#E8E4DC
--stone:#C8C4BC  --gray:#8C8880   --charcoal:#3C3830  --black:#2A2520
--amber:#C9A832  --amber2:#B8941E --amber3:#D4B84A    --gold:#E8D080
--serif:'Cormorant Garamond',serif  --sans:'Montserrat',Arial,sans-serif
--nav-h:110px
```

---

## Структура index.html (секции)
```
#nav-shell → fixed header 110px (style.css: position:fixed + body{padding-top:var(--nav-h)})
#hero → fullscreen видео + текстовый слайд (.hfs slideshow, 2 слайда, без автоплея)
.ticker → бегущая строка
#colls → сетка 4 коллекции
#ed → editorial: .ed-model-wrap (фото) + .ed-text (текст)
#catalog → фильтруемый каталог, fac(cat)
#journal → 9 статей
#tryon-sec → виртуальная примерка
#about → о бренде
#wholesale → 3 тира (Bronze/Silver/Gold)
#contact → форма запроса
footer → логотип + соцсети (SVG иконки) + колонки ссылок
```

---

## Переводы
- **app.js** — TR объект, 15 языков: en, ru, zh, id, fr, de, es, pt, ar, ja, ko, it, tr, hi, ka
- **amberra.js** — свой TR объект, те же 15 языков (для about/catalog/contact/tryon)
- `setLang(lang)` применяет через `[data-i18n]` атрибуты
- Арабский: `setLang` автоматически ставит `dir="rtl"` при lang==='ar'

---

## Продукты
- 94 шт в Airtable: base `apprPtQw98iLfe0rF`, table `tblg9KjmXRv9u0dzv`
- API: `/api/products.js` (Vercel serverless → Airtable)
- Поля: Name, Category, Price, Badge, Image, Material, Description, Stone, Metal, Collection, Closure, Chain
- Категории: rings(20), earrings(45), pendants(8), bracelets(19), chains(2)
- Локальные картинки: `images/rings/`, `images/earrings/`, `images/pendants/`, `images/bracelets/`

---

## Key JS функции (app.js)
- `openDrawer(id)` / `closeDrawer()` — панель продукта, прячет nav-shell (nav-hidden)
- `openCart()` / `closeCart()` — корзина
- `openSrv()` / `closeSrv()` — модал Services
- `openReq(name?)` / `closeReq()` — модал Request a Piece
- `setLang(lang)` — переключение языка + re-render продуктов
- `fac(cat)` — фильтр каталога по категории
- `s(id)` — плавный скролл к секции
- `addToCart(id)` / `addToCartFromDrawer()` — добавление в корзину

## Key JS функции (shop.js)
- `buildSizeSelector(p)` — генерирует HTML выбора размера по категории:
  - rings: US размеры 5–9 с EU эквивалентами
  - bracelets: XS(15см)–XL(19см)
  - pendants/chains: длины 40–60см с шагом 5
  - earrings: "One Size · Fits All"
- `selSz(el)` — выбор размера (класс .sel)
- `getSelectedSize()` — возвращает выбранный размер для корзины
- `getJewelPos(cat,mw,mh)` — авто-позиция украшения в try-on:
  - earrings → ухо (68% ширины, 34% высоты)
  - rings → палец (30%, 76%)
  - bracelets → запястье (40%, 80%)
  - default/pendants → шея (50%, 60%)
- `openDrawer(id)` — вызывает `buildSizeSelector(p)`, записывает в `#d-size`

---

## Важные файлы и детали

### images/model.png
- Девушка с янтарными серьгами (openart AI-фото)
- PNG имеет белые градиентные края — CSS в style.css использует `transform:scale(1.5)` чтобы края уходили за overflow:hidden контейнера
- `.ed-model-wrap img { transform:scale(1.5); }` + hover `scale(1.6)` в style.css
- НЕ использовать mix-blend-mode (дало артефакты) и mask-image (давал белый туман)

### images/amber-drop.jpg
- Иконка янтарной капли для Try-On FAB кнопки
- Класс `.tryon-fab-drop` в style.css

### Footer соцсети
- SVG иконки: Instagram (rect+circle), WhatsApp (path), Pinterest (p-shape)
- Класс `.fs` в style.css: `display:flex; gap:20px; align-items:center`

### Header (nav-shell)
- `position:fixed` в style.css (sticky ненадёжен с overflow-x:hidden на body)
- `body { padding-top: var(--nav-h) }` компенсирует fixed позицию
- `#nav-shell.nav-hidden { transform:translateY(-100%) }` — скрывается при открытии drawer/cart

### Размеры в drawer (shop.html)
- `<div id="d-size"></div>` между d-props и d-btns
- CSS классы: `.d-size`, `.d-size-head`, `.d-size-lbl`, `.d-size-eu`, `.sz-btns`, `.sz-btn`, `.sz-btn.sel`, `.sz-onesize` — все в style.css

---

## Интеграции
- **Sentry DSN**: `4685202527800b7a5362a10c52b9ba1b`
- **PostHog key**: `phc_UqL7ychAdg6sU0vOBr2z8ACypL6NgvRUKQ9u9If99Il`
- **Vercel**: cleanUrls:true, trailingSlash:false
- **GitHub**: amberrajewelry-crypto

---

## Что НЕ делать
- Не редактировать `amberra.css` для правок в index.html / shop.html
- Не использовать `mix-blend-mode:multiply` на model.png (артефакты с волосами)
- Не использовать `mask-image` на `.ed-model-wrap` (белый туман по краям)
- Не использовать `position:sticky` для header (слетает при overflow-x:hidden)

## Длинные сессии (Claude Academy, урок 1)

- План до правок: оплата, учёт изделий, заставка, всё в общих компонентах. Сначала список файлов и репо, которые будут затронуты; правки после одобрения.
- «Готово» только после проверки: npm run build без ошибок. Результат проверки — в выводе; не прошло — чинить, а не сдавать.
- Параллельные окна: каждое в своём git worktree (claude --worktree), чужую ветку и рабочую копию не трогать.
- Сжатие: /compact с указанием «сохрани решения по фото и учёту, номера PR».
- Ушёл не туда: откат (Esc Esc / «откати последнее»), а не правка поверх.
- Мониторинг: /loop — превью PR каждые 5 мин до зелёного билда.

## Работа с Claude (Claude Academy)

- Цель: правка видна на Vercel-превью PR, каталог грузит изделия из Airtable, 15 языков переключаются.
- Держится всегда: бренд handmade sterling silver («designed in Bali, crafted by our artisans»); оплату и язык без команды не менять.
- Проверка (прогнано 06.11 в worktree):
  - `npm run build` → без токена: «⚠  AIRTABLE_PAT not set — skipping product page generation», exit 0.
    С AIRTABLE_PAT не прогнано: токен — секрет окружения, читать запрещено. Ждать на превью: «✓  N product pages written to /products/».
  - `for f in app.js shop.js amberra.js amberra-nav.js currency.js api/*.js; do node --check $f; done` → пустой вывод, exit 0.
- Откат одной командой: `npx vercel promote <URL предыдущего прод-деплоя>` — только по команде Владимира.
- Окружения: локально и Vercel-превью — свободно; прод (`vercel deploy --prod`, promote, rollback) — только по команде «деплой/выкатывай».

### Что Claude делает неправильно
- Вместо ручной правки сгенерированных страниц (products/, категорийные лендинги) — правь генератор: сборка Vercel перезатирает ручное.
- Вместо деплоя с незакоммиченными картинками — коммить ассеты: git-деплой теряет untracked-файлы.
- Вместо массовой правки по двусмысленной фразе («верни как было») — 2 превью на выбор или точный git-откат к задеплоенному.
- Вместо одной механики «как у Bvlgari» — сначала открой эталон и сверь весь макет страницы.
- Вместо PNG-рендера на `<img>` для «3D» — реальная 3D-модель в браузере.
- Вместо «Ubud/Bali workshop» и ритуалов в текстах — «designed in Bali, crafted by our artisans».
- Вместо проверки, что CSS-эффект есть в коде, — проверь, что он виден на экране (тень с альфой .08 не видна).
