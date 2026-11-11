# AMBERRA — АУДИТ САЙТА (что есть / чего нет)
_Замер прода amberrajewelry.com 14.07.2026 (curl + schema + функционал). Ассортимент = 100% янтарь._

## ЕСТЬ (работает)
**Страницы:** 14 top-level + 79 карточек + 15 статей (sitemap 109).
- Тип-хабы = «Amber {Type}»: `/rings /earrings /pendants /bracelets /chains` (карточки сиротские — fix ждёт деплой)
- `/shop /catalog /journal /our-story /stores /contact /wholesale /tryon /bali-jewelry /shipping`
- 79 карточек: Product+Offer+MerchantReturnPolicy schema, hreflang 15 языков

**Функционал (app-оболочка главной + категорий, app.js/shop.js):** корзина, хуки чекаута, wishlist, поиск (SearchAction), валюта USD, 15 языков (i18n), try-on, селектор размера в drawer.

**Schema:** Organization/LocalBusiness (адрес/гео/контакт), WebSite+SearchAction, Product+Offer, BreadcrumbList, CollectionPage, ItemList.

## НЕТ / СЛОМАНО
| Проблема | Деталь |
|---|---|
| Хабы ядра отсутствуют | `/amber`, `/necklaces`, `/brooches`, все цвет-страницы `/amber/{color}`, `/sterling-silver-amber-jewelry`, `/collections/*` — все 404 |
| Карточки оторваны | нет Add to Cart / размера / отзывов / языка — только «Request This Piece» → /shop; не грузят app.js/shop.js (только Sentry). Остаток lookbook |
| Каталог сиротский | `/rings` = 20 openDrawer, 0 ссылок `/products` (fix в коде, ждёт деплой) |
| Отзывы / AggregateRating | нет нигде → нет звёзд в SERP |
| FAQPage | нет нигде |
| Инфо-двери ядра | нет amber-meaning / how-to-tell / amber-colors-guide; текущие 15 статей = коммерческий bali/amber long-tail |
| Служебные | `/size-guide /returns /booking /account /search` = 404 (функции в app, отдельных страниц нет) |
| Медиа | webp/srcset почти нет |
| Товар | прод sitemap 79 vs Airtable/локально 94 → 15 изделий не задеплоены/не в индексе |

## GAP vs CORE-FINAL
Существует ~6 из ~24 базовых (корень + 5 тип-хабов, сиротские). Нет ~18: `/amber` хаб, 8 цвет-страниц, `/necklaces`, `/brooches`, металл-срез, ~7 коллекций, цвет×тип.

**Вывод:** богатая app-оболочка (корзина/15 языков/try-on) есть, но SEO-каркас и связность — нет: карточки оторваны от коммерции и каталога, цвет/хаб-структура физически отсутствует, нет отзывов и инфо-дверей.
