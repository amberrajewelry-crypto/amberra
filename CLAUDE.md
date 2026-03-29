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
