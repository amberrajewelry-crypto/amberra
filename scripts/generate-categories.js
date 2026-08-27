// scripts/generate-categories.js
// Generates static catalog pages from Airtable (Vercel build) OR /tmp/products.json (local).
// Amber-only core: /amber hub + type hubs (/rings…) + color pages (/amber/{color}).
// Each landing carries unique intro + FAQ (FAQPage) + internal linking. Cards link to /products/{slug}.

const fs = require('fs');
const path = require('path');

const BASE_ID = 'apprPtQw98iLfe0rF';
const TABLE_ID = 'tblg9KjmXRv9u0dzv';
const PAT = process.env.AIRTABLE_PAT;
const SITE = 'https://www.amberrajewelry.com';
const TODAY = new Date().toISOString().slice(0, 10);
const CSSVER = '20260811i';
const MIN_SKU = 3; // thin-content guard for color pages

// Local webp product images — upgrade Airtable's /img/NUM.jpg → /images/products/NUM.webp (matches generate-products absImg).
const _WEBP_NUMS = new Set((() => { try { return fs.readdirSync(path.join(__dirname, '..', 'images', 'products')).map(f => (f.match(/(\d+)\.webp/) || [])[1]).filter(Boolean); } catch { return []; } })());
function absImg(img) {
 if (!img) return '';
 let u = String(img);
 u = u.replace(/^https?:\/\/(www\.)?amberra-jewelry\.com\//i, 'https://www.amberrajewelry.com/');
 const m = u.match(/\/img\/(\d+)\.(?:jpe?g|png)/i);
 if (m && _WEBP_NUMS.has(m[1])) u = u.replace(/\/img\/(\d+)\.(?:jpe?g|png)/i, `/images/products/${m[1]}.webp`);
 return /^https?:/.test(u) ? u : `${SITE}/${u.replace(/^\//, '')}`;
}

// ── content maps (methodology: data × template) ──────────────────────────────

const TYPES = {
 rings: { label: 'Rings', h1: 'Handmade Sterling Silver Rings with Baltic Amber',
 metaTitle: 'Handmade Sterling Silver Rings with Baltic Amber | AMBERRA',
 metaDesc: 'Handmade Baltic amber rings in 925 sterling silver, shaped by hand by our artisans. Cherry, cognac, green & honey amber. Free worldwide shipping over $200.',
 intro: [
 'Amber rings from AMBERRA are cut from genuine Baltic amber and set by hand in 925 sterling silver. Every stone is natural — no two are alike, from deep cherry and cognac to green, honey and rare blue amber.',
 'Choose a bold cocktail silhouette or a fine everyday band. Each ring ships with a certificate of authenticity and is available in US ring sizes 5–9.'
 ],
 faq: [
 ['Are AMBERRA amber rings real Baltic amber?', 'Yes, every AMBERRA amber ring is set with genuine natural Baltic amber, the fossilised conifer resin known to gemologists as succinite, formed around 40 million years ago in the Baltic region. Each ring is hand-set in solid 925 sterling silver by our silversmiths, and ships with a certificate of authenticity. Because the stone is natural rather than pressed or dyed, every ring is one of a kind, with its own color and inclusions. To verify amber yourself, note that real amber is warm to the touch, floats in salt water, and is far lighter than glass.'],
 ['What ring sizes do you offer?', 'AMBERRA amber rings are available in US ring sizes 5 to 9, covering most adult finger sizes. Each product page includes a size guide to help you choose, and you can contact us if you need guidance or custom sizing. Because natural Baltic amber is remarkably light, even bold cocktail styles wear comfortably all day. Every ring is hand-set in 925 sterling silver by our artisans, and arrives with a certificate of authenticity. If you are unsure of your size, measure a ring you already own and compare it to the guide.'],
 ['How do I care for an amber ring?', 'To care for an amber ring, avoid perfume, heat and ultrasonic cleaners, since amber is a soft, organic stone that can be damaged by chemicals and vibration. Wipe it gently with a soft cloth and store it separately from harder gemstones and metals that could scratch its surface. Put your ring on last, after applying lotion and hairspray, and take it off before showering, swimming or sleeping. The 925 sterling silver setting can darken slowly with air; a soft cloth restores its shine. Cared for simply, an amber ring keeps its warm glow for decades.']
 ] },
 earrings: { label: 'Earrings', h1: 'Handmade Sterling Silver Earrings with Baltic Amber',
 metaTitle: 'Handmade Sterling Silver Earrings with Baltic Amber | AMBERRA',
 metaDesc: 'Natural Baltic amber earrings handcrafted — drops, studs, hoops & filigree in 925 silver. Cherry, cognac & honey amber. Free shipping over $200.',
 intro: [
 'Our amber earrings pair natural Baltic amber with hand-forged 925 sterling silver — from light everyday studs to statement drops. Colors range across cherry, cognac, honey, green and blue amber.',
 'Lightweight and comfortable, each pair is made one at a time by our artisans and arrives with a certificate of authenticity.'
 ],
 faq: [
 ['Are the earrings sterling silver?', 'Yes, AMBERRA earrings are made from solid 925 sterling silver, with some pieces finished in 18k gold plating over sterling. The hooks and posts are hypoallergenic sterling silver, which makes them a gentle choice for sensitive ears that react to base-metal jewelry. Sterling silver is one of the traditional metals for Baltic amber, cool and neutral in tone so it frames the warm stone rather than competing with it. Every pair is hand-forged one at a time by our artisans and arrives with a certificate of authenticity covering both the amber and the metal.'],
 ['Is the amber natural?', 'Yes, every AMBERRA earring uses natural Baltic amber, the fossilised conifer resin known as succinite that formed around 40 million years ago in the Baltic region. Color and inclusions vary from pair to pair because the stone is genuine, never pressed, reconstituted or dyed. That natural variation means no two pairs are exactly alike, from deep cherry and cognac to golden honey, green and rare blue amber. To recognize real amber, note that it is warm to the touch, light in weight, and often carries tiny natural bubbles or inclusions. Each pair ships with a certificate of authenticity.']
 ] },
 pendants: { label: 'Pendants', h1: 'Handmade Sterling Silver Pendants with Baltic Amber',
 metaTitle: 'Sterling Silver Amber Pendants & Necklaces, Handmade | AMBERRA',
 metaDesc: 'Baltic amber pendants and necklaces handcrafted in 925 sterling silver. Cherry, cognac, green & blue amber. Pair with a silver chain. Free shipping over $200.',
 intro: [
 'Amber pendant necklaces from AMBERRA frame a single natural Baltic amber cabochon in hand-worked sterling silver. Wear one alone or layered; pair with any AMBERRA silver chain.',
 'Each pendant is one of a kind, cut from genuine Baltic amber and finished by hand.'
 ],
 faq: [
 ['Do pendants come with a chain?', 'Some AMBERRA pendants include a matching chain, while others are sold as the pendant alone so you can choose your own length and style. Where a chain is not included, pair the pendant with any AMBERRA sterling silver chain from our Chains collection to build your own necklace. Our chains come in cable and link styles and lengths from 40 to 60 cm: a shorter chain keeps the amber high on the collarbone, while a longer one lets it fall for a layered look. Match the chain metal tone to the pendant setting for a seamless finish.'],
 ['What amber colors are available?', 'AMBERRA amber pendants are available in a full spectrum of natural Baltic amber tones, including cherry, cognac, honey, green, butterscotch and rare blue amber, depending on the individual piece. Every color is natural to the stone rather than dyed or artificially treated, so each pendant is one of a kind, cut from genuine Baltic amber and finished by hand. The tone of amber depends on how the resin formed and how light passes through it, which is why shades range from clear golden honey to deep translucent cherry and opaque creamy butterscotch.']
 ] },
 bracelets: { label: 'Bracelets', h1: 'Handmade Sterling Silver Bracelets with Baltic Amber',
 metaTitle: 'Handmade Sterling Silver Bracelets with Amber | AMBERRA',
 metaDesc: 'Natural Baltic amber bracelets handcrafted — beaded, link and cuff styles in 925 sterling silver. Cherry, cognac & multi-amber. Free shipping over $200.',
 intro: [
 'From delicate beaded strands to bold silver cuffs, our amber bracelets use natural Baltic amber set in 925 sterling silver. Multi-color (mosaic) amber is a signature.',
 'Every bracelet is handmade and ships with a certificate of authenticity.'
 ],
 faq: [
 ['What bracelet sizes are available?', 'Most AMBERRA bracelets fit wrists of about 15 to 19 cm, and beaded styles are adjustable for extra give. To find your size, wrap a soft tape measure snugly around your wrist and add a little room for comfort, then check the sizing note on each product page. Because natural Baltic amber is remarkably light, even bold cuff and link bracelets wear comfortably all day. Every bracelet is hand-set in 925 sterling silver by our artisans and ships with a certificate of authenticity. Contact us if you need guidance or a custom length for a wrist outside this range.'],
 ['Is multi-color amber natural?', 'Yes, multi-color or mosaic amber combines pieces of natural Baltic amber in different tones, arranged by hand rather than dyed or artificially colored. Each fragment is genuine succinite, the fossilised conifer resin that formed around 40 million years ago, and its cherry, cognac, honey and green shades all come from how the resin aged and formed naturally. Because a mosaic is assembled by hand from individually chosen fragments, no two pieces are ever exactly alike, which makes every mosaic bracelet genuinely one of a kind. Each piece is set in 925 sterling silver and arrives with a certificate of authenticity.']
 ] },
 chains: { label: 'Chains', h1: 'Sterling Silver Chains',
 metaTitle: 'Sterling Silver Chains — Handcrafted | AMBERRA',
 metaDesc: 'Handcrafted 925 sterling silver chains — cable and link styles, perfect with any AMBERRA amber pendant. Free worldwide shipping over $200.',
 intro: [
 'Handcrafted 925 sterling silver chains to wear alone or with any AMBERRA amber pendant. Cable and link styles in several lengths.',
 'Made by the same artisans behind our amber collections.'
 ],
 faq: [
 ['Which chain suits an amber pendant?', 'Cable and link chains in 925 sterling silver, ranging from 40 to 60 cm, work with most AMBERRA amber pendants. The right choice depends on scale and length: a finer cable chain suits delicate pendants and everyday layering, while a heavier link chain balances a larger amber cabochon and can be worn on its own. Shorter chains around 40 to 45 cm keep the pendant high on the collarbone, 50 cm is the classic everyday length, and 55 to 60 cm lets it fall lower. For a seamless look, match the chain metal tone to your pendant setting. All chains are handcrafted.']
 ] },
};

// stone-string → color key
const COLOR_MATCH = [
 ['cherry','cherry'], ['honey','honey'], ['cognac','cognac'], ['green','green'],
 ['blue','blue'], ['butterscotch','butterscotch'], ['butter','butterscotch'],
 ['mosaic','mosaic'], ['multi','mosaic'], ['raw','raw'],
];
function colorOf(stone) {
 const s = String(stone || '').toLowerCase();
 for (const [needle, key] of COLOR_MATCH) if (s.includes(needle)) return key;
 return null;
}

const COLORS = {
 cherry: { label: 'Cherry Amber', h1: 'Cherry Amber Jewelry',
 metaTitle: 'Cherry Amber Jewelry in Sterling Silver — Bali | AMBERRA',
 metaDesc: 'Handmade cherry amber jewelry in 925 sterling silver. Deep red natural Baltic amber rings, earrings & pendants, handcrafted. Free shipping over $200.',
 intro: [
 'Cherry amber is natural Baltic amber in its deepest red-to-cognac tones — warm, translucent and richly colored. AMBERRA sets it by hand in 925 sterling silver.',
 'Genuine cherry deepens with age; each piece is one of a kind and arrives with a certificate of authenticity.'
 ],
 faq: [
 ['Is cherry amber real amber?', 'Yes, cherry amber is genuine natural Baltic amber in its deepest red-to-mahogany tones, not glass, plastic or bakelite. It is the same fossilised conifer resin known as succinite, formed around 40 million years ago in the Baltic region, and its rich color develops as it oxidises and darkens over time. Held to strong light, real cherry stays translucent and glows red rather than looking flat and black. You can also recognize genuine amber because it is warm and light in the hand, floats in salt water, and carries faint natural inclusions. AMBERRA certifies every piece as authentic.'],
 ['Is cherry amber dyed?', 'AMBERRA cherry amber is naturally dark Baltic amber, so its deep red color comes from the stone itself and from age rather than from dye. The rich, wine-like hue develops as amber is exposed to oxygen over decades and centuries, its surface slowly oxidising from gold toward cognac and finally cherry, which is why so much genuinely antique jewelry carries these tones. Some sellers deepen pale stones with heat treatment or pass off red glass as cherry, but our stones are naturally dark, certified genuine, and one of a kind, each set by hand in 925 sterling silver.']
 ] },
 honey: { label: 'Honey Amber', h1: 'Honey Amber Jewelry',
 metaTitle: 'Honey Amber Jewelry in Sterling Silver — Bali | AMBERRA',
 metaDesc: 'Handmade honey amber jewelry in 925 sterling silver — warm golden Baltic amber rings, earrings & pendants, handcrafted. Free shipping over $200.',
 intro: [
 'Honey amber is the classic warm-gold Baltic amber — clear, glowing and timeless. AMBERRA hand-sets it in 925 sterling silver.',
 'Each honey piece is natural and unique, finished by our artisans.'
 ],
 faq: [
 ['What is honey amber?', 'Honey amber is natural Baltic amber in a warm golden, translucent tone, the most classic amber color and the shade most people picture when they think of amber. It is the same fossilised conifer resin known as succinite, formed around 40 million years ago in the Baltic region, and it owes its clarity to resin that hardened with few trapped bubbles, letting light pass straight through. Honey stones often preserve faint natural inclusions of ancient bark or plant fiber. Because it flatters every skin tone and reads as both classic and contemporary, honey is an ideal first amber, hand-set by AMBERRA in 925 sterling silver.']
 ] },
 cognac: { label: 'Cognac Amber', h1: 'Cognac Amber Jewelry',
 metaTitle: 'Cognac Amber Jewelry in Sterling Silver — Bali | AMBERRA',
 metaDesc: 'Handmade cognac amber jewelry in 925 sterling silver — rich brown-gold natural Baltic amber, handcrafted. Free worldwide shipping over $200.',
 intro: [
 'Cognac amber is deep brown-gold natural Baltic amber, warmer and darker than honey. AMBERRA sets it by hand in 925 sterling silver.',
 'Every cognac amber piece is genuine and one of a kind, with a certificate of authenticity.'
 ],
 faq: [
 ['How is cognac amber different from honey amber?', 'Cognac amber is a deeper brown-gold, warmer and darker than honey amber, which is lighter and more clearly golden. Both are genuine natural Baltic amber, the fossilised conifer resin known as succinite that formed around 40 million years ago in the Baltic region; the difference in tone comes from how each stone formed and oxidised over time. Cognac sits between honey and cherry, gradually deepening as its surface reacts with air, and each stone shows its own gradient of brown and gold. It is one of the most wearable amber tones, rich enough to feel luxurious yet neutral enough for everyday, set by hand in 925 sterling silver.']
 ] },
 green: { label: 'Green Amber', h1: 'Green Amber Jewelry',
 metaTitle: 'Green Amber Jewelry in Sterling Silver — Bali | AMBERRA',
 metaDesc: 'Handmade green amber jewelry in 925 sterling silver — natural Baltic amber with green tones, handcrafted. Free worldwide shipping over $200.',
 intro: [
 'Green amber is natural Baltic amber with cool green depths — distinctive and eye-catching against sterling silver.',
 'AMBERRA green amber is genuine and hand-finished; each piece is unique.'
 ],
 faq: [
 ['Is green amber natural?', 'Yes, AMBERRA green amber is genuine natural Baltic amber, the fossilised conifer resin known as succinite that formed around 40 million years ago in the Baltic region. Its cool green depth is not a dye: the effect appears when translucent amber is set over a darker backing that draws out its green undertones, or where fine plant and mineral inclusions scatter light toward the green end of the spectrum. Because genuine green tones are far rarer than honey or cognac, each green piece is produced in small numbers, certified authentic and set individually by hand in 925 sterling silver, making every one a distinctive, one-of-a-kind piece.']
 ] },
 blue: { label: 'Blue Amber', h1: 'Blue Amber Jewelry',
 metaTitle: 'Blue Amber Jewelry in Sterling Silver — Bali | AMBERRA',
 metaDesc: 'Handmade blue amber jewelry in 925 sterling silver — rare natural blue amber, handcrafted. A collector favorite. Free worldwide shipping over $200.',
 intro: [
 'Blue amber is among the rarest natural amber, shifting blue under daylight. AMBERRA sets each rare stone by hand in 925 sterling silver.',
 'Because blue amber is scarce, pieces are limited and each is one of a kind with a certificate of authenticity.'
 ],
 faq: [
 ['Why is blue amber so rare?', 'Blue amber is among the rarest amber in the world because its blue is not pigment but a natural optical effect that forms only under specific conditions. The body of the stone stays golden, while trace compounds formed as the resin fossilised absorb ultraviolet light and re-emit it as a luminous blue, strongest in sunlight and daylight. Only a small fraction of mined Baltic amber shows this fluorescence, which is why untreated blue stones sit among the most sought-after fossil resins on earth. Because supply is so limited, AMBERRA blue pieces are made in small numbers, each certified natural and unique.']
 ] },
 butterscotch: { label: 'Butterscotch Amber', h1: 'Butterscotch Amber Jewelry',
 metaTitle: 'Butterscotch Amber Jewelry in Sterling Silver — Bali | AMBERRA',
 metaDesc: 'Handmade butterscotch amber jewelry in 925 sterling silver — creamy opaque natural Baltic amber, handcrafted. Free worldwide shipping over $200.',
 intro: [
 'Butterscotch amber is creamy, opaque natural Baltic amber — soft, buttery and warm. AMBERRA sets it by hand in 925 sterling silver.',
 'Each butterscotch piece is genuine and unique, made by our artisans.'
 ],
 faq: [
 ['What is butterscotch amber?', 'Butterscotch amber, sometimes called butter amber, is natural Baltic amber that is creamy and opaque rather than clear and translucent. It is the same fossilised conifer resin known as succinite that formed around 40 million years ago in the Baltic region, and its soft, milky warmth comes from countless microscopic air bubbles trapped in the resin. Where clear honey amber transmits light, these bubbles scatter it, producing a gentle, buttery glow, and the denser the bubbles the deeper the butterscotch tone. The look is soft, antique and quietly luxurious, which is why AMBERRA sets it by hand in 925 sterling silver for elegant everyday pieces.']
 ] },
 mosaic: { label: 'Multi-Color Amber', h1: 'Multi-Color Amber Jewelry',
 metaTitle: 'Multi-Color (Mosaic) Amber Jewelry in Sterling Silver | AMBERRA',
 metaDesc: 'Handmade multi-color mosaic amber jewelry in 925 sterling silver — natural Baltic amber of many tones, handcrafted. Free shipping over $200.',
 intro: [
 'Mosaic amber combines natural Baltic amber of many tones — cherry, cognac, honey and green — in one striking piece, set in 925 sterling silver.',
 'Every mosaic piece is a one-off arrangement of genuine amber, handmade.'
 ],
 faq: [
 ['Is mosaic amber dyed?', 'No, mosaic or multi-color amber uses genuine natural Baltic amber of different tones combined by hand, never dyed or artificially colored stone. Every fragment is authentic succinite, the fossilised conifer resin that formed around 40 million years ago, and its cherry, cognac, honey and green shades all come from how each piece aged and formed naturally over that long history. Because each mosaic is assembled by hand from individually chosen fragments, no two pieces can ever match exactly, so a mosaic bracelet or pendant is genuinely one of a kind. AMBERRA sets every mosaic in 925 sterling silver and includes a certificate of authenticity.']
 ] },
 raw: { label: 'Raw Amber', h1: 'Raw Amber Jewelry',
 metaTitle: 'Raw Amber Jewelry in Sterling Silver — Bali | AMBERRA',
 metaDesc: 'Handmade raw amber jewelry in 925 sterling silver — unpolished natural Baltic amber, handcrafted. Organic and one of a kind. Free shipping over $200.',
 intro: [
 'Raw amber keeps the natural, unpolished surface of Baltic amber — organic and earthy, set in 925 sterling silver.',
 'Each raw amber piece is genuine and unique, finished by hand.'
 ],
 faq: [
 ['What is raw amber?', 'Raw amber is natural Baltic amber left unpolished, keeping its organic texture and natural surface rather than being shaped into a smooth cabochon. It is the same fossilised conifer resin known as succinite that formed around 40 million years ago in the Baltic region, shown much as it is found: matte, textured and full of character. The weathered outer crust is the stone oxidised skin, formed over millions of years and usually a shade darker than the translucent resin beneath. Leaving it unpolished preserves the amber as a Baltic gatherer would have found it, and AMBERRA sets each raw piece by hand in 925 sterling silver.']
 ] },
};

const HUB = {
 h1: 'Handmade Baltic Amber Jewelry',
 metaTitle: 'Baltic Amber Jewelry in Sterling Silver — Bali | AMBERRA',
 metaDesc: 'Handmade Baltic amber jewelry in 925 sterling silver — rings, earrings, pendants & bracelets in cherry, cognac, honey, green & blue amber. Handcrafted.',
 intro: [
 'AMBERRA is a handcrafted jewelry house, designed in Bali. Every piece pairs genuine Baltic amber — a 40-million-year-old fossil resin — with 925 sterling silver, shaped one at a time by our artisans.',
 'Explore amber by type — rings, earrings, pendants, bracelets and chains — or by color, from deep cherry and cognac to golden honey, green and rare blue amber. Each piece is one of a kind and arrives with a certificate of authenticity.'
 ],
 faq: [
 ['What is Baltic amber?', 'Baltic amber, known to gemologists as succinite, is fossilised tree resin roughly 40 million years old, formed from ancient conifer forests that grew around the Baltic Sea and the wider Baltic region including Poland, Lithuania and Latvia. Over millions of years the resin hardened and mineralised into the warm, glowing stone used in jewelry today. It is prized for its rich color, its light weight, and the tiny natural inclusions of air, plant matter or occasionally insects that prove its origin. AMBERRA works only with authentic natural Baltic amber, never pressed, reconstituted or dyed substitutes, setting each stone by hand in 925 sterling silver.'],
 ['How do I know AMBERRA amber is real?', 'Every AMBERRA piece uses genuine natural Baltic amber and ships with a certificate of authenticity, so authenticity is guaranteed with each order. You can also confirm real amber yourself using the simple tests jewelers rely on: genuine amber floats in salt water, feels warm to the touch rather than cold like glass, becomes electrostatic and attracts light objects when rubbed, and smells faintly of pine or resin when warmed. Real amber is also noticeably lighter than glass or plastic and usually contains natural bubbles or inclusions. Our journal explains these at-home tests in more detail if you would like to verify amber yourself.'],
 ['What metal do you use?', 'AMBERRA sets its Baltic amber primarily in solid 925 sterling silver, the international standard for fine jewelry at 92.5 percent pure silver, with selected pieces finished in 18k gold plating over sterling. We never use plated base metal. Sterling silver is durable, hypoallergenic and neutral in tone, so it protects the soft amber stone and lets its warm color lead. All settings, including the hooks and posts on earrings, are hand-forged by our artisans, which is why no two pieces are identical. Each order includes a certificate of authenticity covering both the amber and the metal.'],
 ['Do you ship to the US?', 'Yes, AMBERRA ships worldwide, including to the United States, and shipping is free on orders over $200. Every order is tracked from our studio, so you can follow your piece on its way. Because each item is handcrafted with natural Baltic amber and 925 sterling silver, orders are prepared individually and boxed with a certificate of authenticity, ready to wear or to give. Whether you are ordering a ring, earrings, a pendant or a bracelet, delivery is available internationally with tracking. If you have questions about your destination or delivery, our team is happy to help before you order.']
 ]
};

// Metal-cut landing (targets "sterling silver amber jewelry/ring"). Distinct
// from /amber (material/color focus) — this page's angle is the 925 silver.
const SILVER = {
 slug: 'sterling-silver-amber-jewelry',
 label: 'Sterling Silver Amber',
 h1: 'Sterling Silver Amber Jewelry',
 metaTitle: 'Sterling Silver Amber Jewelry — 925 Silver, Handcrafted | AMBERRA',
 metaDesc: 'Baltic amber in solid 925 sterling silver — rings, earrings, pendants & bracelets, handcrafted. Hypoallergenic silver. Free shipping over $200.',
 intro: [
 'Every AMBERRA piece pairs natural Baltic amber with solid 925 sterling silver — never plated base metal. The warm glow of the stone and the cool shine of hand-worked metal are a classic combination, durable enough to wear every day.',
 'Our silver is 92.5% pure (the “925” hallmark), the international standard for fine jewelry. It is nickel-free and hypoallergenic, hand-forged by our artisans, and finished to hold each amber cabochon securely.'
 ],
 faq: [
 ['Is AMBERRA jewelry solid sterling silver?', 'Yes, all AMBERRA settings are solid 925 sterling silver, meaning 92.5 percent pure silver, the international standard for fine jewelry. Some pieces add 18k gold plating over sterling for a warmer look, but none use plated base metal beneath. Sterling silver alloys pure silver with a small amount of other metal for strength, since pure silver alone is too soft to hold a stone securely. Because our sterling is nickel-free, it is hypoallergenic and safe for sensitive skin. Every setting is hand-forged by our artisans, and each order includes a certificate of authenticity covering both the amber and the metal.'],
 ['Is sterling silver good for amber?', 'Yes, sterling silver is one of the best and most traditional metals for Baltic amber. It is strong, hypoallergenic and neutral in cool tone, so it protects the soft, organic amber stone while letting its warm color lead rather than competing with it. Jewelers have paired 925 sterling silver with Baltic amber for centuries, because its bright, white lustre frames the cherry, cognac and honey tones beautifully. It is also durable enough for daily wear and gentle on sensitive skin. AMBERRA hand-forges every setting to cradle each amber cabochon securely by hand.'],
 ['Will sterling silver tarnish?', 'Sterling silver can darken slowly over time as it naturally reacts with air and moisture, forming a patina. This is normal and easily reversed: simply wipe the metal with a soft cloth and store your jewelry dry, ideally in a soft pouch with an anti-tarnish strip. Worn regularly, sterling silver actually tarnishes less, because the oils of your skin and the friction of wear help keep it bright. Because amber is a soft, organic stone, avoid dipping AMBERRA pieces in silver-cleaning solutions or using ultrasonic machines, which can dull or crack the amber. Polish the silver separately with a proper silver cloth.'],
 ['Is the silver hallmarked?', 'AMBERRA silver meets the 925 sterling standard, which means it is 92.5 percent pure silver, the internationally recognized benchmark for fine jewelry. This is the same 925 mark used to identify genuine sterling silver worldwide. Rather than relying on a stamp alone, each order includes a certificate of authenticity covering both the natural Baltic amber and the sterling silver metal, so you have written assurance of what you are buying. Our silver is nickel-free and hypoallergenic, hand-forged by our artisans and finished to hold each amber cabochon securely. Every piece ships with free worldwide shipping over $200.']
 ]
};

// Handmade/craft landing (targets "handmade sterling silver jewelry" 4400 LOW).
// Angle: the hand process — distinct from SILVER (metal properties) and HUB (amber material).
const HANDMADE = {
 slug: 'handmade-sterling-silver-jewelry',
 label: 'Handmade Sterling Silver',
 h1: 'Handmade Sterling Silver Jewelry',
 metaTitle: 'Handmade Sterling Silver Jewelry — Artisan-Made | AMBERRA',
 metaDesc: 'Handmade sterling silver jewelry shaped one at a time by our artisans — rings, earrings, pendants & bracelets in 925 silver with natural Baltic amber. Free shipping over $200.',
 intro: [
 'Every AMBERRA piece is handmade — forged, set and finished one at a time by our artisans rather than stamped out by machine. That is why no two are quite alike, and why each carries the small, human marks of the hand that made it.',
 'Our craft is solid 925 sterling silver paired with natural Baltic amber, across rings, earrings, pendants, bracelets and chains. Every piece ships with a certificate of authenticity.'
 ],
 faq: [
 ['What does “handmade” mean at AMBERRA?', 'At AMBERRA, handmade means each piece is shaped by hand by our artisans from start to finish — the silver is forged, the setting is built, the amber is set and the whole piece is polished individually, never cast in bulk or assembled from machine-stamped parts. Because a person makes every decision along the way, small natural variations are part of each piece rather than flaws, and no two are ever exactly identical. This is slower than factory production, but it is what gives handmade jewelry its character and why each item can carry a certificate of authenticity for both the amber and the 925 sterling silver.'],
 ['Is handmade jewelry worth it over mass-produced?', 'Handmade jewelry is made and checked by a person at every step, so the finish, the setting and the fit of the stone are judged by eye rather than by a machine tolerance. That usually means better-set stones, more careful polishing and a piece that is genuinely one of a kind, since natural Baltic amber and hand-forging both introduce variation no production line reproduces. Handmade pieces also tend to be more repairable and to age into heirlooms rather than being replaced. Every AMBERRA piece is worked by hand by our artisans in 925 sterling silver and arrives with a certificate of authenticity.'],
 ['Can I request a custom or bespoke piece?', 'Yes, because we work by hand rather than from a fixed production line, we can often adjust a design, a size or an amber color, or make a bespoke piece to order. Ring sizes run US 5 to 9 as standard and chains from 40 to 60 cm, but if you need something outside those ranges or want to commission a one-off, contact us and our artisans will advise on what is possible and how long it will take. Custom work is quoted individually and, like every AMBERRA piece, is made in solid 925 sterling silver with natural Baltic amber and ships with a certificate of authenticity.'],
 ['Is the silver real sterling?', 'Yes, every AMBERRA piece is made in solid 925 sterling silver — 92.5 percent pure silver, the international standard for fine jewelry — never plated base metal, with some pieces finished in 18k gold over sterling. Because our sterling is nickel-free it is hypoallergenic and gentle on sensitive skin. Each setting is hand-forged by our artisans to hold its amber cabochon securely, and every order includes a certificate of authenticity covering both the natural Baltic amber and the sterling silver. Worn regularly and wiped with a soft cloth, the silver keeps its bright lustre for decades.']
 ]
};

// Brand / E-E-A-T landing (targets "artisan jewelry" 18100 + "handmade jewelry" 33100).
// Angle: who we are and how we work — informational/brand, not a metal or craft-technique cut.
const ARTISAN = {
 slug: 'artisan-jewelry',
 label: 'Artisan Jewelry',
 h1: 'Artisan Jewelry, Made by Real Hands',
 metaTitle: 'Artisan Jewelry — Handmade by Our Makers | AMBERRA',
 metaDesc: 'Artisan jewelry from a small independent studio — natural Baltic amber and 925 sterling silver, designed in Bali and made by hand, one piece at a time. Free shipping over $200.',
 intro: [
 'AMBERRA is artisan jewelry in the true sense: a small independent studio, not a factory brand. Every design is drawn by hand, and every piece is made by the same makers who have worked silver and amber for years — not stamped out on a production line.',
 'We work in two honest materials, natural Baltic amber and solid 925 sterling silver, designed in Bali and finished by hand. Because a person makes each piece, no two are identical, and every order arrives with a certificate of authenticity.'
 ],
 faq: [
 ['What is artisan jewelry?', 'Artisan jewelry is jewelry designed and made by skilled makers by hand, in small numbers, rather than mass-produced by machine in a factory. An artisan piece is shaped, set and finished individually, so each one carries small natural variations and the character of the person who made it. It usually uses genuine materials — at AMBERRA, natural Baltic amber and solid 925 sterling silver — rather than plated base metal or imitation stones. Buying artisan jewelry means owning something closer to a one-of-a-kind object than an identical unit, and it directly supports the makers keeping traditional handcraft alive. Every AMBERRA piece is handmade and ships with a certificate of authenticity.'],
 ['Who makes AMBERRA jewelry?', 'AMBERRA is a small independent studio, and every piece is made by our own makers — the silversmiths and setters who shape the metal, cut the settings and place each amber stone by hand. We are not a marketplace reseller badging factory stock; the people who design the jewelry work directly with the people who make it. Our designs are drawn in Bali, where the studio was founded, and each piece is worked by hand from solid 925 sterling silver and natural Baltic amber. That direct, small-team way of working is why our pieces are consistent in quality yet each individually unique, and why every order can carry a certificate of authenticity for both the amber and the silver.'],
 ['How is artisan jewelry different from mass-produced?', 'Mass-produced jewelry is cast or stamped in large identical batches by machine, often in plated base metal with pressed or synthetic stones, and finished for speed. Artisan jewelry like AMBERRA is the opposite: each piece is made and inspected by a person, in solid 925 sterling silver with genuine natural Baltic amber, so the setting, polish and fit of the stone are judged by eye. That means better-set stones, real materials, and pieces that are repairable and age into heirlooms rather than being thrown away. It also means each item is genuinely one of a kind, because both natural amber and the human hand introduce variation no factory line reproduces.'],
 ['Is AMBERRA jewelry ethical and sustainable?', 'AMBERRA works in a small-batch way rather than mass production, which means far less waste than factory jewelry built for volume. We use genuine natural Baltic amber — a natural fossil resin, not a mined crystal or a lab imitation — and solid, long-lasting 925 sterling silver rather than disposable plated metal, so pieces are built to last and be repaired rather than replaced. Buying directly from an independent studio also means your purchase supports the makers keeping a traditional craft alive, instead of an anonymous factory. Every piece is handmade in small numbers and ships with a certificate of authenticity.']
 ]
};

// Amber-first ring spoke (targets "amber rings" 1900). Same 20 rings as /rings,
// but framed by the stone rather than the metal — /rings leads on "sterling silver
// rings" (74000), this leads on "amber rings". Differentiated copy + self-canonical.
const AMBER_RINGS = {
 slug: 'amber-rings',
 label: 'Amber Rings',
 h1: 'Amber Rings in Sterling Silver',
 metaTitle: 'Amber Rings — Natural Baltic Amber in 925 Silver | AMBERRA',
 metaDesc: 'Natural Baltic amber rings, hand-set in 925 sterling silver by our artisans. Cherry, cognac, green & honey amber. US sizes 5–9. Free worldwide shipping over $200.',
 intro: [
 'An amber ring is the most personal way to wear Baltic amber — a single natural stone, warm against the skin, framed in hand-worked 925 sterling silver. Because the amber is genuine, no two AMBERRA rings are the same: the color runs from deep cherry and cognac to golden honey, green and rare blue.',
 'Choose a bold cocktail stone or a fine everyday band. Every ring is set by hand by our artisans, comes in US sizes 5–9, and ships with a certificate of authenticity.'
 ],
 faq: [
 ['Are AMBERRA amber rings genuine Baltic amber?', 'Yes, every AMBERRA amber ring is set with genuine natural Baltic amber — the fossilised conifer resin gemologists call succinite, formed around 40 million years ago in the Baltic region — hand-set in solid 925 sterling silver. Because the stone is natural rather than pressed or dyed, every ring is one of a kind, with its own color and inclusions, and each ships with a certificate of authenticity. To check amber yourself, note that it is warm to the touch, floats in salt water, and is far lighter than glass.'],
 ['What amber colors do the rings come in?', 'AMBERRA amber rings are cut from the full natural spectrum of Baltic amber, from deep cherry and cognac through golden honey to green and rare blue amber, depending on the individual stone. Every tone is natural to the resin rather than dyed or heat-forced, which is why each ring is genuinely one of a kind. Cherry and cognac read rich and formal, honey is the timeless classic, and green and blue are the rarest and most collectible. Each ring is hand-set in 925 sterling silver.'],
 ['What ring sizes are available?', 'AMBERRA amber rings come in US ring sizes 5 to 9, which covers most adult finger sizes, and every product page includes a size guide. Because natural Baltic amber is remarkably light, even a bold cocktail stone wears comfortably all day. If you need a size outside this range or custom sizing, contact us — because we work by hand, we can often accommodate it. Every ring is hand-set in 925 sterling silver and arrives with a certificate of authenticity.'],
 ['How do I care for an amber ring?', 'Avoid perfume, heat and ultrasonic cleaners, since amber is a soft, organic stone that chemicals and vibration can damage. Wipe the ring gently with a soft cloth and store it apart from harder gemstones that could scratch it. Put the ring on last, after lotion and hairspray, and take it off before showering, swimming or sleeping. The 925 sterling silver setting darkens slowly with air; a soft silver cloth restores its shine. Cared for simply, an amber ring keeps its warm glow for decades.']
 ]
};

// deep content sections (unique per page; distributed so nothing repeats) — H2 + paragraphs
const SECTIONS = {
 'amber-rings': [
 ['What Makes an Amber Ring Special', [
 'A gemstone ring is usually about the mineral — its cut, its clarity, its fire. An amber ring is different: amber is not a mined crystal but fossilised tree resin, warm and organic, that formed in ancient forests around 40 million years ago. Wearing one is closer to wearing a piece of deep time than a faceted stone, and it sits warm against the skin rather than cold like quartz or glass.',
 'That organic nature is exactly why an amber ring feels personal. Each stone carries its own color, its own faint inclusions, its own way of catching light — so your ring is not one of a production run but the only one shaped around that particular piece of amber.'
 ]],
 ['Choosing Your Amber Color', [
 'The single biggest choice in an amber ring is color, and it is entirely natural to the stone. Cherry and cognac are the deepest, most saturated tones — dramatic on the hand and flattering as a formal or statement ring. Honey is the classic warm gold most people picture when they think of amber: versatile, timeless and easy to wear every day. Green and blue amber are the rarest, prized by collectors for how they shift under different light.',
 'Because every stone is genuine, the exact shade of the ring you receive is unique to it. If you have a specific tone in mind, tell us — our artisans set each ring by hand and can often match a color preference to an available stone.'
 ]],
 ['Set by Hand in 925 Sterling Silver', [
 'Every AMBERRA amber ring is set in solid 925 sterling silver — 92.5% pure, nickel-free and hypoallergenic — never plated base metal. Our artisans cut each bezel to the exact outline of its irregular amber cabochon, so the stone is held securely and the silver frames rather than competes with the warm resin.',
 'Sterling silver has been the traditional partner for Baltic amber for centuries: its cool, bright lustre is the ideal foil for cherry, cognac and honey tones. Each setting is forged and finished by hand, which is why no two rings — even in the same design — are ever quite identical.'
 ]]
 ],
 silver: [
 ['Why 925 Sterling Silver?', [
 'Sterling silver is an alloy of 92.5% pure silver with 7.5% other metals — usually copper — added for strength. Pure silver alone is too soft to hold a stone; the “925” standard keeps the bright, white lustre of silver while making it durable enough for daily wear. It is the metal jewelers have paired with Baltic amber for centuries.',
 'Because our sterling is nickel-free, it is hypoallergenic and safe for sensitive skin. Its neutral cool tone is the perfect foil for amber: it never competes with the stone, it frames it, letting the warm cherry, cognac and honey tones lead.'
 ]],
 ['Hand-Forged by Our Artisans', [
 'AMBERRA silver is worked entirely by hand by our artisans. Each setting is forged, shaped and polished to cradle a single amber cabochon securely — filigree, granulation and bezel work that a casting machine cannot reproduce. This is why no two AMBERRA pieces are identical.',
 'Silversmithing by hand is a living tradition. The same hands that shape our amber rings and pendants have worked silver for a lifetime, and every finished piece carries that craft.'
 ]],
 ['Caring for Silver & Amber Together', [
 'Sterling silver darkens slowly as it reacts with air — a natural patina that wipes away with a soft silver cloth. But amber is a soft, organic stone, so never soak an AMBERRA piece in a silver-dip solution or clean it with ultrasonic machines: these can dull or crack the amber.',
 'To care for both at once, wipe gently with a dry, soft cloth, keep pieces away from perfume, heat and household chemicals, and store each item separately in a soft pouch. Worn often and kept dry, sterling silver actually tarnishes less — the oils of your skin help keep it bright.'
 ]]
 ],
 handmade: [
 ['What Makes Jewelry Truly Handmade', [
 'Handmade is a word that gets used loosely, so it is worth being precise. An AMBERRA piece is made by a person from raw silver and a single amber stone: the metal is drawn and forged, the setting is built up by hand, the stone is fitted and the surface is finished by eye. Nothing is cast in a mould by the hundred or clicked together from pre-stamped parts.',
 'The proof is in the object. Look closely and you see the tiny asymmetries of hand-work — a bezel that hugs the exact shape of one irregular amber cabochon, a solder seam placed by judgement, a polish that follows the form. These are not defects; they are the signature of a maker, and they are impossible to mass-produce.'
 ]],
 ['The Techniques Behind Each Piece', [
 'Our artisans work in the old silversmithing techniques: filigree, where fine silver threads are twisted and soldered into lace; granulation, where tiny beads of silver are fused to the surface; and hand-cut bezels shaped to each stone. Every join is soldered by hand and every surface is filed and burnished rather than machine-buffed.',
 'This is why a single ring or pendant can take hours of concentrated work. The reward is a piece with depth and texture — light catches the granules and filigree the way it never does on flat, cast metal.'
 ]],
 ['One of a Kind, By Design', [
 'Two things make every AMBERRA piece unique. First, natural Baltic amber: no two stones share the same color, clarity or inclusions, so each setting is built around its own stone. Second, the hand of the maker: even the same design, made twice, comes out with its own small differences.',
 'That is the quiet luxury of handmade jewelry. You are not wearing one of ten thousand identical units — you are wearing the only one exactly like it, backed by a certificate of authenticity for both the amber and the 925 sterling silver.'
 ]]
 ],
 artisan: [
 ['The Mark of an Artisan Piece', [
 'An artisan piece announces itself quietly. The stone sits in a setting cut to its own outline rather than a standard mould; the surface is finished by hand, so it holds a warmth that machine-buffing never quite gives; and the back is as considered as the front. These are the tells of a maker, not a mould.',
 'We think jewelry should be judged the way a maker judges it — by how the parts meet, how the stone is held, how it feels in the hand. That is a standard you can only reach when a person, not a machine, has the final say on every piece.'
 ]],
 ['A Small Studio, Not a Factory', [
 'AMBERRA is independent and deliberately small. We are not a marketplace storefront reselling anonymous factory stock under our name; the people who draw the designs work alongside the people who cut the silver and set the amber. That closeness is the whole point — nothing is briefed out to a line that never sees the finished piece.',
 'Working small has a cost: we make in modest numbers and some pieces sell out. But it is the only way we know to keep quality honest and to keep the craft, and the makers, at the centre of the brand rather than at the end of a supply chain.'
 ]],
 ['Designed in Bali', [
 'AMBERRA was founded in Bali, and that is where our designs still begin — sketched by hand before a single piece is made. Bali is a place with a deep, living relationship to craft and to the sea, and that sensibility runs through the work: warm, organic, unhurried.',
 'The amber itself travels much further. It is genuine Baltic amber, fossil resin from the forests that grew around the Baltic Sea some 40 million years ago — a material with its own long story, brought together with hand-worked 925 sterling silver.'
 ]],
 ['Honest Materials, Built to Last', [
 'We use two materials and no shortcuts: natural Baltic amber, never pressed reconstitute or dyed imitation, and solid 925 sterling silver, never plated base metal. Real materials cost more and demand more skill to work, but they are what let a piece be repaired, re-polished and handed on rather than thrown away.',
 'That is also why we send a certificate of authenticity with every order, covering both the amber and the silver. You should know exactly what you are wearing — and be able to keep it for a lifetime.'
 ]]
 ],
 hub: [
 ['What Is Baltic Amber?', [
 'Baltic amber, known to gemologists as succinite, is fossilised resin from ancient conifer forests that grew around the Baltic Sea some 40 million years ago. Over millennia the resin hardened, mineralised and was carried by rivers and seas into the deposits mined today. It is remarkably light, warm to the touch, and glows from within — qualities no glass or plastic imitation can match.',
 'Genuine Baltic amber often holds tiny inclusions — trapped air, plant matter, occasionally an insect — small proofs of its natural origin. AMBERRA works only with authentic Baltic amber, never copal (young resin) or pressed and dyed substitutes.'
 ]],
 ['A Spectrum of Natural Color', [
 'Amber is not a single color. Depending on how the resin formed and how light passes through it, a stone can be deep cherry red, warm cognac, golden honey, cool green, rare blue, creamy butterscotch, or a mosaic of many tones at once. Every color in the AMBERRA collection is natural to the stone.',
 'Explore by color to find the tone that suits you — from the everyday warmth of honey and cognac to the collector rarity of blue amber.'
 ]],
 ['Designed in Bali, Crafted by Hand', [
 'Every AMBERRA piece is designed in Bali and made by hand by our artisans, who shape, set and finish each design one at a time. This is slow, human work — filigree, granulation and hand-forged settings that a factory line cannot reproduce. It is why no two pieces are ever identical.'
 ]],
 ['925 Sterling Silver & Gold', [
 'We set our amber in 925 sterling silver — 92.5% pure silver, the international standard for fine jewelry — with selected pieces finished in 18k or 24k gold plating. Sterling silver is durable, hypoallergenic and the perfect cool counterpoint to amber’s warmth.'
 ]],
 ['Guaranteed Authentic', [
 'Every order ships with a certificate of authenticity confirming natural Baltic amber and 925 sterling silver, with free worldwide shipping over $200. If you would like to verify amber yourself, our journal explains the simple at-home tests jewelers use.'
 ]],
 ['The Story of Baltic Amber', [
 'For thousands of years amber travelled the ancient "Amber Road" from the Baltic coast to the Mediterranean, prized by Greeks, Romans and Egyptians who believed it carried the warmth and light of the sun. The Greek word for amber, elektron, gave us the word electricity — rub amber and it draws light objects to it, an effect the ancients thought magical.',
 'That long history is part of why amber still feels different from other gemstones. It is not mined crystal but preserved life — a fragment of a forest that stood 40 million years ago, now warmed against your skin.'
 ]],
 ['How to Care for Amber Jewelry', [
 'Amber is organic and soft compared to hard gemstones, so a little care keeps it beautiful for a lifetime. Put your jewelry on last, after perfume, hairspray and lotion, and take it off before showering, swimming or sleeping. Wipe it with a soft, slightly damp cloth — never ultrasonic cleaners, solvents or hot water.',
 'Store amber separately from harder stones and metals that could scratch it, ideally in a soft pouch. Worn regularly, amber stays lustrous; its warmth actually deepens gently with age.'
 ]],
 ['Why Choose AMBERRA', [
 'AMBERRA is not a marketplace reseller. We are a single studio, working directly with the silversmiths who make every piece. That means honest materials — real Baltic amber, real 925 sterling silver — a certificate with every order, and designs you will not find on mass-market sites. Each purchase supports our artisans keeping a centuries-old craft alive.'
 ]],
 ['Baltic Amber vs Other World Ambers', [
 'Amber is found in several places — the Dominican Republic, Mexico, Myanmar and elsewhere — but Baltic amber is the most prized for jewelry. It is the oldest widely used amber and the only kind with a high content of succinic acid, which is why gemologists call it succinite. That composition gives Baltic amber its particular warmth, durability and depth of color.',
 'Younger resins such as copal are often sold as amber but are only thousands, not millions, of years old; they stay softer and can craze or cloud with time. Every AMBERRA piece uses true Baltic amber, never copal, pressed reconstitute or dyed imitation — so what you buy keeps its beauty for generations.'
 ]],
 ['Amber as a Meaningful Gift', [
 'For centuries amber has been given as a token of warmth, protection and lasting affection — a fragment of sunlight to carry with you. Because each stone is unique and quietly luxurious, amber jewelry makes a gift that feels personal rather than mass-produced, suitable for birthdays, anniversaries, weddings or simply as a keepsake.',
 'Every AMBERRA order arrives boxed with its certificate of authenticity, ready to give. If you are unsure which color or piece to choose, our team is happy to help you select something to suit the person you have in mind.'
 ]],
 ['Styling Your Amber Jewelry', [
 'Amber’s warm, honeyed tones flatter every skin tone and sit beautifully against both neutral and jewel-colored wardrobes. Set in cool 925 sterling silver, it reads modern and understated; against gold-plated settings it turns rich and vintage. Layer a pendant over knitwear in winter, or let amber studs warm a linen shirt in summer.',
 'Because amber is so light, you can wear even statement pieces comfortably all day. Mix tones freely — a cherry ring with honey earrings, or a mosaic bracelet against raw amber — since every shade shares the same natural origin.'
 ]]
 ],
 cherry: [
 ['What Is Cherry Amber?', [
 'Cherry amber is natural Baltic amber in its deepest red-to-mahogany tones. The rich color develops as amber oxidises and darkens over time, which is why antique amber often carries these warm, wine-like hues. Held to the light, genuine cherry amber stays translucent, glowing red rather than flat black.'
 ]],
 ['How to Wear Cherry Amber', [
 'Cherry’s depth reads as elegant and dressy. Against 925 sterling silver it turns cool and modern; against gold-plated settings it warms into something vintage and rich. A cherry ring or pendant makes a natural statement piece, while studs keep the color subtle.'
 ]],
 ['Is Cherry Amber Real or Treated?', [
 'Some sellers deepen pale amber with heat treatment; others sell red glass or bakelite as "cherry amber". AMBERRA cherry amber is naturally dark Baltic amber, certified genuine. Real cherry stones are warm and light in the hand, carries faint natural inclusions, and glows red under strong light — plastic does not.'
 ]],
 ['Why Aged Amber Turns Cherry', [
 'The deep red of this shade is largely a story of time. As amber is exposed to oxygen over decades and centuries, its surface slowly oxidises and darkens from gold toward cognac and finally cherry. This is why so much genuinely antique amber carries these rich tones, and why cherry amber feels heirloom even when newly set.'
 ]],
 ['Cherry Amber as a Gift', [
 'Its jewel-like depth makes cherry a memorable gift — striking enough to feel special, classic enough to wear for years. A cherry pendant or ring in 925 sterling silver arrives boxed with its certificate of authenticity, ready to give.'
 ]]
 ],
 honey: [
 ['What Is Honey Amber?', [
 'Honey amber is the classic golden Baltic amber — clear, warm and glowing, the color most people picture when they think of amber. It flatters every skin tone and pairs effortlessly with 925 sterling silver for everyday wear.'
 ]],
 ['Styling & Care', [
 'Because honey amber is bright and versatile, it works from daytime to evening. Keep it away from perfume, hairspray and heat, wipe with a soft cloth, and store it separately from harder gemstones to protect its surface.'
 ]],
 ['The Most Versatile Amber', [
 'If you are buying your first amber, honey is the natural place to start. Its clear golden warmth flatters every skin tone, reads as both classic and contemporary, and pairs with everything from jeans to eveningwear. Set in 925 sterling silver, honey earrings or a pendant become pieces you reach for again and again.'
 ]],
 ['The Science of Golden Amber', [
 'Honey owes its clarity to resin that fossilised with few trapped bubbles, letting light pass straight through. As succinite, Baltic amber is unusually rich in succinic acid, and honey stones often preserve faint inclusions of ancient conifer bark or plant fiber — tiny time capsules from the Eocene forests that produced the resin some 40 million years ago.'
 ]]
 ],
 cognac: [
 ['What Is Cognac Amber?', [
 'Cognac amber sits between honey and cherry — a deep brown-gold with real warmth and clarity. It is one of the most wearable amber tones, rich enough to feel luxurious yet neutral enough for everyday.'
 ]],
 ['Styling Cognac Amber', [
 'Cognac’s brown-gold depth pairs beautifully with both silver and gold-plated settings and complements autumnal and neutral wardrobes. A cognac amber ring or bracelet adds warmth without shouting.'
 ]],
 ['Cognac Amber, Naturally', [
 'Cognac is one of the most common natural tones of genuine Baltic amber, which makes it both approachable and unmistakably authentic. Each stone shows its own gradient of brown and gold, sometimes with faint natural inclusions — small marks of a stone that formed over millions of years rather than in a mould.'
 ]],
 ['How Cognac Amber Deepens', [
 'The brown-gold of cognac is the result of gradual surface oxidation — the same slow reaction that, taken further, produces cherry red. Each stone carries its own gradient because oxidation depends on how the resin lay in the ground over millions of years. The internal flow-lines and occasional inclusions visible in a cognac cabochon are signatures no moulded imitation can reproduce.'
 ]]
 ],
 green: [
 ['What Is Green Amber?', [
 'Green amber is natural Baltic amber showing cool green depths, usually seen when translucent amber is set over a dark backing that draws out its green undertones. The effect is striking and unusual against sterling silver.'
 ]],
 ['Is Green Amber Natural?', [
 'AMBERRA green amber is genuine Baltic amber — the green comes from the stone and its setting, not from dye. As with all our amber, each green piece is certified and one of a kind.'
 ]],
 ['Styling Green Amber', [
 'Green amber’s cool, unexpected depth makes it a natural conversation piece. It stands out against 925 sterling silver and pairs well with green, teal and earth-toned outfits. Choose a bold green ring or pendant when you want something distinctive rather than expected.'
 ]],
 ['Where Green Tones Come From', [
 'Green is one of the scarcer natural expressions of Baltic amber. The cool depth appears when translucent succinite is backed by darker material or carries fine plant and mineral inclusions that scatter light toward the green end of the spectrum. Because genuine green tones are far rarer than honey or cognac, each green piece is produced in small numbers and set individually in 925 silver.'
 ]]
 ],
 blue: [
 ['What Is Blue Amber?', [
 'Blue amber is among the rarest amber in the world. In daylight its surface fluoresces a soft blue, while the body of the stone stays golden — a natural optical effect caused by the way the resin scatters light. True blue amber is scarce, which is why it is prized by collectors.'
 ]],
 ['A Collector’s Choice', [
 'Because supply is so limited, AMBERRA blue amber pieces are made in small numbers and each is unique. Every one is certified natural Baltic amber and set by hand in 925 sterling silver.'
 ]],
 ['How Blue Amber Gets Its Color', [
 'Blue amber is not blue like a sapphire. The body of the stone is golden; the blue appears only as light strikes its surface and is scattered back to the eye, glowing strongest under sunlight and UV. This rare fluorescence, combined with scarce supply, is why it commands a premium among collectors worldwide.'
 ]],
 ['The Rarest Fluorescence in Amber', [
 'The blue itself is not pigment — it is fluorescence. Trace aromatic hydrocarbons formed as the resin fossilised absorb ultraviolet light and re-emit it as a luminous blue, strongest in sunlight. Only a small fraction of mined Baltic amber shows this effect, which is why untreated blue stones sit among the most sought-after fossil resins on earth.'
 ]]
 ],
 butterscotch: [
 ['What Is Butterscotch Amber?', [
 'Butterscotch amber — sometimes called "butter" amber — is natural Baltic amber that is creamy and opaque rather than clear. Its soft, milky warmth comes from countless microscopic air bubbles trapped in the resin. The look is gentle, antique and quietly luxurious.'
 ]],
 ['Styling Butterscotch Amber', [
 'The muted, buttery tone flatters warm and neutral palettes and reads as understated and timeless. Set in 925 sterling silver, butterscotch makes elegant everyday earrings and pendants.'
 ]],
 ['Butterscotch & Antique Style', [
 'Opaque "butter" amber has been treasured for generations and carries a distinctly vintage, heirloom feeling. Its soft, creamy surface hides the microscopic bubbles that scatter light and give the stone its glow. For anyone drawn to antique and old-world jewelry, butterscotch is the natural choice.'
 ]],
 ['Why Butterscotch Is Opaque', [
 'The creamy opacity of butterscotch comes from countless microscopic air bubbles suspended in the succinite. Where clear honey amber transmits light, these bubbles scatter it, producing a soft, milky glow. The denser the bubbles, the deeper the butterscotch — an entirely natural clouding that was once reserved for ceremonial and royal pieces.'
 ]]
 ],
 mosaic: [
 ['What Is Mosaic Amber?', [
 'Mosaic (multi-color) amber brings together natural Baltic amber of many tones — cherry, cognac, honey and green — arranged by hand in a single piece. Each mosaic is a one-off composition, impossible to repeat exactly.'
 ]],
 ['Handmade, Never Dyed', [
 'Our mosaic pieces use genuine amber of different natural colors, not dyed stone. The result is a rich, layered look set in 925 sterling silver — one of the most distinctive styles AMBERRA makes.'
 ]],
 ['One of a Kind by Design', [
 'Because each mosaic is assembled by hand from individually chosen amber fragments, no two pieces can ever match exactly. That is the appeal: a mosaic amber bracelet or pendant is genuinely unique, a small composition of cherry, cognac, honey and green tones that exists nowhere else.'
 ]],
 ['A Gallery of Natural Tones', [
 'Every color in a mosaic piece — cherry, cognac, honey, green — is genuine Baltic amber that oxidised and formed differently across its 40-million-year history, then was matched by hand for balance. Nothing is dyed. A single mosaic effectively gathers the whole natural range of amber into one composition, which is why no two can repeat.'
 ]]
 ],
 raw: [
 ['What Is Raw Amber?', [
 'Raw amber keeps the natural, unpolished surface of Baltic amber rather than a smooth cabochon. Organic and earthy, it shows the stone much as it is found — matte, textured and full of character.'
 ]],
 ['Wearing Raw Amber', [
 'Raw amber suits a natural, bohemian look and pairs beautifully with hand-forged 925 sterling silver. As with all AMBERRA amber, each raw piece is genuine and one of a kind.'
 ]],
 ['Raw Amber & Natural Living', [
 'Leaving amber unpolished keeps it closest to how it is found — honest, textured and elemental. For anyone who values natural materials and a grounded, earthy aesthetic, it offers all the warmth and history of Baltic amber without the polished formality. Each piece keeps the stone’s own surface and character.'
 ]],
 ['The Weathered Skin of Raw Amber', [
 'The matte crust on raw pieces is the oxidised outer skin, formed over millions of years and usually a shade darker than the translucent resin beneath. Leaving it unpolished preserves the stone much as a Baltic gatherer would have found it on the shore — texture, color and provenance intact — rather than grinding it into a uniform cabochon.'
 ]]
 ],
 rings: [
 ['The Craft Behind Our Amber Rings', [
 'Each AMBERRA amber ring begins with a single natural Baltic amber cabochon, chosen for color and clarity, then set into a hand-forged 925 sterling silver band by our artisans. Filigree, granulation and open settings are all done by hand, so every ring is unique.'
 ]],
 ['Choosing & Sizing Your Ring', [
 'Amber rings are available in US sizes 5–9. Because amber is light, even bold cocktail styles wear comfortably. Consider a deep cherry or cognac stone for a statement piece, or honey and butterscotch for everyday. Keep your ring away from heat and chemicals and wipe it with a soft cloth.'
 ]],
 ['Amber Ring Styles', [
 'Our amber rings span several silhouettes: bold cocktail and statement rings built around a large cabochon, fine everyday bands with a smaller stone, and open or filigree settings that let light through the amber. Multi-color mosaic and raw amber styles offer a more organic, bohemian look.'
 ]],
 ['A Ring That Lasts', [
 'Set in 925 sterling silver and made by hand, an AMBERRA amber ring is built to be worn. Take it off before washing your hands with harsh soap, gardening or applying lotion, and store it separately from harder rings. Cared for simply, it keeps its glow for decades and can darken beautifully with age.'
 ]],
 ['Amber Rings vs Gemstone Rings', [
 'Where a diamond or sapphire is prized for hardness and sparkle, amber offers something different: warmth, color and a direct connection to the natural world. It is a fossil, not a cut crystal — light, glowing and alive with tiny inclusions. That makes an amber ring feel personal and organic rather than formal, a piece you wear for its character rather than its carat weight.',
 'Amber is also softer than most gemstones, which is part of its charm and the reason it is set protectively in sterling silver. Worn with a little care, it ages gracefully, deepening in tone rather than wearing out.'
 ]],
 ['A Meaningful Ring to Give', [
 'An amber ring makes an unexpected and personal gift — for an engagement alternative, an anniversary, or simply to mark a moment. Because each stone is one of a kind, the ring you give exists nowhere else. Choose a deep cherry cabochon for drama, honey or cognac for everyday warmth, and we will box it with its certificate of authenticity, ready to present.'
 ]]
 ],
 earrings: [
 ['Handmade Amber Earrings', [
 'From light studs to sculptural drops, our amber earrings pair natural Baltic amber with hypoallergenic 925 sterling silver hooks and posts. Each pair is made one at a time, so color and inclusions vary naturally from piece to piece.'
 ]],
 ['Studs, Drops & Hoops', [
 'Our amber earrings come in every silhouette. Studs place a single warm cabochon close to the ear for quiet, everyday elegance. Drops and dangles catch the light and lengthen the neckline, ideal for evening. Hoops and filigree designs frame the amber in openwork sterling silver. Whichever you choose, the stone is natural Baltic amber, so no two pairs are identical.'
 ]],
 ['Colors & Comfort', [
 'Amber is one of the lightest gemstones, so even large drops stay comfortable all day. Choose cherry or cognac for depth, honey for classic warmth, or rare blue amber for something collectible.'
 ]],
 ['Hypoallergenic by Design', [
 'Because our posts, hooks and settings are 925 sterling silver — some with 18k gold plating — AMBERRA earrings suit sensitive ears that react to base-metal jewelry. Sterling silver is one of the gentlest metals for piercings, and amber itself is a natural, non-metallic material, making the pairing an easy choice for all-day wear.'
 ]],
 ['Caring for Amber Earrings', [
 'Put earrings on last, after perfume and hairspray, and take them off before showering, swimming or sleeping. Wipe the amber with a soft, slightly damp cloth — never solvents or ultrasonic cleaners — and store your pair in a soft pouch away from harder stones. Simple care keeps both the silver bright and the amber glowing for years.'
 ]]
 ],
 pendants: [
 ['Amber Pendants & Necklaces', [
 'An AMBERRA pendant frames a single natural Baltic amber stone in hand-worked sterling silver, designed to sit beautifully whether worn alone or layered. For amber necklace styles, our pendants pair with any AMBERRA silver chain.'
 ]],
 ['Choosing a Pendant Length', [
 'The right chain length shapes how a pendant sits. Shorter chains around 40–45 cm keep the amber high on the collarbone, flattering open necklines; 50 cm is the classic everyday length; 55–60 cm lets a pendant fall lower for a relaxed, layered look. Consider your neckline and how you like to wear it, and match the chain’s metal tone to the pendant’s setting.'
 ]],
 ['Layering Amber Pendants', [
 'Amber’s warm glow lends itself to layering. Pair a longer amber pendant with a shorter fine chain, or mix amber tones — a honey drop above a cherry cabochon — for depth. Because amber is so light, several layered pieces stay comfortable, and the natural variation between stones keeps the look organic rather than matched.'
 ]],
 ['The Meaning of Amber Pendants', [
 'Worn close to the heart, an amber pendant has long carried associations of warmth, protection and vitality — amber was believed by ancient cultures to hold the captured light of the sun. That symbolism, combined with the fact that each stone is millions of years old, makes an amber pendant a quietly meaningful piece to wear or to give.'
 ]],
 ['Caring for Amber Pendants', [
 'Remove your pendant before showering or swimming, and keep it away from perfume and heat. Clean the amber with a soft, damp cloth and polish the silver separately with a proper silver cloth. Store the pendant flat or hanging so the chain does not tangle, and it will stay lustrous for a lifetime.'
 ]]
 ],
 bracelets: [
 ['Handmade Amber Bracelets', [
 'Our amber bracelets range from delicate beaded strands to bold silver cuffs, all using natural Baltic amber set in 925 sterling silver. Multi-color mosaic amber is a signature of the collection.'
 ]],
 ['Beaded, Link & Cuff Styles', [
 'Beaded amber bracelets string natural amber into a soft, flexible strand that catches the light with every movement — the most classic amber style. Link bracelets alternate amber cabochons with worked sterling silver for structure. Cuffs make a bolder statement, wrapping a single striking stone in hand-forged silver. Mosaic amber, blending several natural tones, is especially at home in a bracelet.'
 ]],
 ['Finding Your Bracelet Size', [
 'Most AMBERRA bracelets fit wrists of about 15–19 cm, with beaded styles offering some natural give. To find your size, wrap a soft tape measure snugly around your wrist and add a little room for comfort. Each product page notes its fit; contact us if you need guidance or a custom length.'
 ]],
 ['Caring for Amber Bracelets', [
 'A bracelet sees more daily contact than most jewelry, so treat amber gently: remove it before washing up, showering or exercising, and keep it clear of perfume and lotion. Wipe with a soft cloth and store flat in a pouch, away from harder bracelets that could scratch the surface. Cared for simply, amber keeps its warm glow for years.'
 ]]
 ],
 chains: [
 ['Sterling Silver Chains for Amber', [
 'Handcrafted 925 sterling silver chains, made by the same artisans behind our amber collections. Wear one alone or pair it with any AMBERRA amber pendant to build your own necklace.'
 ]],
 ['Chain Styles & Lengths', [
 'Our chains come in cable and link styles and several lengths, from 40 cm chokers to 60 cm long chains. A finer cable chain suits delicate pendants and everyday layering; a heavier link chain balances a larger amber cabochon and can be worn on its own. Choosing the right weight and length lets a chain either disappear behind the amber or stand as jewelry in its own right.'
 ]],
 ['Matching a Chain to Your Pendant', [
 'For a seamless look, match the chain’s finish to your pendant’s setting — cool sterling silver with silver settings, gold-plated chains with gold accents. Scale matters too: pair a fine chain with a small pendant, a sturdier link with a statement stone, so the two feel balanced rather than mismatched.'
 ]],
 ['Caring for Sterling Silver', [
 'Sterling silver naturally tarnishes over time as it reacts with air — this is normal and easily reversed. Polish your chain gently with a proper silver cloth, avoid harsh dips that can pit the metal, and store it in a dry pouch, ideally with an anti-tarnish strip. Worn regularly, silver actually stays brighter, as the friction of wear keeps it polished.'
 ]]
 ]
};
function sectionsHTML(arr) {
 if (!arr || !arr.length) return '';
 return `<section class="cat-content">` + arr.map(([h2, paras]) =>
 `<div class="cat-block"><h2>${esc(h2)}</h2>${paras.map(p => `<p>${esc(p)}</p>`).join('')}</div>`
 ).join('') + `</section>`;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function esc(str) {
 return String(str || '')
 .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
 .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// MUST match generate-products.js so cards link to real product pages
function toSlug(name) {
 return String(name || '').toLowerCase()
 .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
 .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
 .replace(/[ùúûü]/g, 'u').replace(/ñ/g, 'n')
 .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
 .replace(/-+/g, '-').replace(/^-|-$/g, '');
}
function assignSlugs(products) {
 const seen = [];
 for (const p of products) {
 if (!p.name) continue;
 let slug = toSlug(p.name);
 if (seen.includes(slug)) slug = slug + '-' + seen.length;
 seen.push(slug);
 p.slug = slug;
 }
 return products;
}

function introHTML(paras) {
 // paras[0] is already rendered large as .cat-sub in the hero — skip it here to
 // avoid showing the lead paragraph twice. Render the remaining paragraphs only.
 const rest = (paras || []).slice(1);
 if (!rest.length) return '';
 return `<div class="cat-intro">${rest.map(p => `<p>${esc(p)}</p>`).join('')}</div>`;
}
function faqBlock(faq) {
 if (!faq || !faq.length) return '';
 const items = faq.map(([q, a]) =>
 `<details class="faq-item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
 return `<section class="cat-faq"><h2>Frequently Asked Questions</h2>${items}</section>`;
}
function faqSchema(faq) {
 if (!faq || !faq.length) return null;
 return {
 '@type': 'FAQPage',
 mainEntity: faq.map(([q, a]) => ({
 '@type': 'Question', name: q,
 acceptedAnswer: { '@type': 'Answer', text: a }
 }))
 };
}
function linksBlock(title, links) {
 if (!links.length) return '';
 const a = links.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join('');
 return `<nav class="cat-links" aria-label="${esc(title)}"><span class="cat-links-t">${esc(title)}</span><div class="cat-links-row">${a}</div></nav>`;
}

function cardHTML(p) {
 const badgeHTML = p.badge
 ? `<span class="pbadge ${esc(p.badge)}">${p.badge === 'bestseller' ? 'Bestseller' : p.badge === 'limited' ? 'Limited' : 'New'}</span>`
 : '';
 const img = absImg(p.img) || '';
 const imgTag = img
 ? `<img src="${esc(img)}" alt="${esc(p.name)} — AMBERRA ${esc(p.cat)}" loading="lazy" width="400" height="400">`
 : `<div style="width:100%;height:100%;background:var(--mist)"></div>`;
 return `
 <div class="pc"${p.slug ? ` onclick="location.href='/products/${esc(p.slug)}'"` : ` onclick="openDrawer(${p.id})"`}>
 <div class="pc-inner">
 <div class="pc-img">
 ${badgeHTML}
 <button class="pc-wish" onclick="event.stopPropagation();toggleWish(${p.id},this)" aria-label="Add to wishlist">
 <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
 </button>
 ${imgTag}
 </div>
 <div class="pc-label" style="opacity:1;max-height:none;overflow:visible">
 <span class="pcat">${esc(p.cat)}</span>
 ${p.slug
 ? `<a class="pname" href="/products/${esc(p.slug)}" onclick="event.stopPropagation()">${esc(p.name)}</a>`
 : `<span class="pname">${esc(p.name)}</span>`}
 <span class="pmaterial">${esc(p.material || '')}</span>
 <div class="pfoot">
 <span class="pprice" data-usd="${p.price}">$${p.price}</span>
 ${p.slug ? `<a class="pc-view" href="/products/${esc(p.slug)}" onclick="event.stopPropagation()">View</a>` : ''}
 </div>
 </div>
 </div>
 </div>`;
}

function absUrl(u) {
 if (!u) return '';
 return /^https?:/.test(u) ? u : `${SITE}/${String(u).replace(/^\//, '')}`;
}

function itemListSchema(id, name, url, products) {
 const items = products.slice(0, 10).map((p, i) => {
 const purl = p.slug ? `${SITE}/products/${p.slug}` : url;
 return {
 '@type': 'ListItem', position: i + 1,
 url: purl,
 item: {
 '@type': 'Product', name: p.name, description: p.desc || '',
 url: purl,
 brand: { '@type': 'Brand', name: 'AMBERRA' },
 image: p.img ? [absImg(p.img)] : [],
 offers: { '@type': 'Offer', priceCurrency: 'USD', price: String(p.price), availability: 'https://schema.org/InStock', url: purl }
 }
 };
 });
 return { '@type': 'ItemList', '@id': `${id}#products`, name, itemListElement: items };
}

function breadcrumb(trail) {
 return { '@type': 'BreadcrumbList', itemListElement: trail.map((t, i) => ({
 '@type': 'ListItem', position: i + 1, name: t.name, item: t.url })) };
}

// ── page shell (head + nav + footer shared) ──────────────────────────────────

function navHTML(activeSlug) {
 const nl = (slug, label) => `<a class="nl${activeSlug === slug ? ' act' : ''}" href="/${slug}">${label}</a>`;
 return `<div id="nav-shell" class="solid">
 <div class="nav-logo-bar">
 <div class="nav-lb-l">
 <button class="mob-menu-btn" aria-label="Open menu" onclick="openMobNav()"><svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
 <button class="nav-util-link keep" onclick="openSrv()"><span>Services</span></button>
 <button class="nav-util-link" onclick="openReq()"><span>Contact Us</span></button>
 </div>
 <a class="nav-logo" href="/"><span class="nav-logo-main">AMBERRA</span><span class="nav-logo-sub">Jewelry</span></a>
 <div class="nav-lb-r">
 <button class="nav-ico-btn" aria-label="Wishlist" onclick="toggleWishView()"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg><span class="nav-badge" id="wish-badge">0</span></button>
 <button class="nav-ico-btn" aria-label="Account" onclick="openAcc()"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></button>
 <a class="nav-ico-btn" aria-label="Store locations" href="/stores"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></a>
 <button class="nav-ico-btn" aria-label="Cart" onclick="openCart()"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg><span class="nav-badge" id="cart-badge">0</span></button>
 </div>
 </div>
 <div class="nav-main">
 <a class="nl" href="/shop">Collections</a>
 ${nl('rings','Rings')} ${nl('earrings','Earrings')} ${nl('pendants','Pendants')} ${nl('bracelets','Bracelets')}
 <span class="nav-divider"></span>
 <a class="nl" href="/our-story">Our Story</a>
 <a class="nl" href="/wholesale">Wholesale</a>
 <a class="nl" href="/journal">Journal</a>
 </div>
</div>`;
}

function footerHTML() {
 return `<footer>
 <div class="ft ft-5">
 <div>
 <div class="fb">AMBERRA</div>
 <p class="fd">Natural Baltic amber jewelry,<br>handcrafted by our artisans.<br>Each piece is unique — like its wearer.</p>
 <div class="fs">
 <a href="https://instagram.com/amberra.jewelry" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>
 <a href="https://wa.me/6287853867120" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>
 </div>
 </div>
 <div><span class="fc-t">Shop</span><ul class="fc-l">
 <li><a href="/rings">Rings</a></li><li><a href="/earrings">Earrings</a></li>
 <li><a href="/pendants">Pendants</a></li><li><a href="/bracelets">Bracelets</a></li>
 <li><a href="/handmade-sterling-silver-jewelry">Handmade Silver</a></li>
 <li><a href="/artisan-jewelry">Artisan Jewelry</a></li>
 <li><a href="/sterling-silver-amber-jewelry">Sterling Silver Amber</a></li>
 <li><a href="/shop">All Jewelry</a></li>
 </ul></div>
 <div><span class="fc-t">Collections</span><ul class="fc-l">
 <li><a href="/collections/solar">The Solar Collection</a></li>
 <li><a href="/collections/sacred">The Sacred Collection</a></li>
 <li><a href="/collections/botanica">The Botanica Collection</a></li>
 </ul></div>
 <div><span class="fc-t">Company</span><ul class="fc-l">
 <li><a href="/our-story">Our Story</a></li><li><a href="/journal">Journal</a></li>
 <li><a href="/stores">Stores</a></li><li><a href="/#wholesale">Wholesale</a></li>
 </ul></div>
 <div><span class="fc-t">Support</span><ul class="fc-l">
 <li><a href="javascript:openReq()">Contact Us</a></li>
 <li><a href="javascript:openSrv()">Services</a></li>
 <li><a href="/our-story">Care Guide</a></li>
 </ul></div>
 </div>
 <div class="ft-bot">
 <span>© 2026 AMBERRA. All rights reserved.</span>
 <div class="ft-legal">
 <a href="javascript:openLegal('privacy')">Privacy Policy</a>
 <a href="javascript:openLegal('terms')">Terms of Service</a>
 <a href="javascript:openLegal('returns')">Returns</a>
 </div>
 </div>
</footer>`;
}

// Per-category OG image (clean brand webp). Falls back to og-cover.webp.
const OG_BY_SLUG = { rings: '/images/hero-ring.webp', amber: '/images/amber-drop.webp', 'sterling-silver-amber-jewelry': '/images/amber-drop.webp' };
function ogFor(slug) { return `${SITE}${OG_BY_SLUG[slug] || '/images/og-cover.webp'}`; }

function shell({ metaTitle, metaDesc, canonical, schema, activeSlug, ogImage }, mainHTML) {
 return `<!DOCTYPE html>
<html lang="en">
<head>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PJ5682RJ');</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(metaTitle)}</title>
<meta name="description" content="${esc(metaDesc)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="author" content="AMBERRA">
<link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16.png">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="${canonical}">
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="AMBERRA">
<meta property="og:title" content="${esc(metaTitle)}">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage || SITE + '/images/og-cover.webp'}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>
<script src="https://js-de.sentry-cdn.com/4685202527800b7a5362a10c52b9ba1b.min.js" crossorigin="anonymous" async></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Cormorant+SC:wght@300;400;500&family=Montserrat:wght@300;400;500&display=swap" rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Cormorant+SC:wght@300;400;500&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet"></noscript>
<link rel="stylesheet" href="/style.css?v=20260827e">
</head>
<body class="page-light">
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PJ5682RJ" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<canvas id="particles-canvas"></canvas>
<div class="mob-nav-overlay" id="mob-nav-overlay" onclick="closeMobNav()"></div>
<div class="mob-nav-drawer" id="mob-nav-drawer">
 <div class="mob-nav-head"><span class="mob-nav-logo">AMBERRA</span><button class="mob-nav-close" onclick="closeMobNav()">✕</button></div>
 <div class="mob-nav-links">
 <a class="mob-nav-link" href="/">Home</a>
 <a class="mob-nav-link" href="/amber">Amber Jewelry</a>
 <a class="mob-nav-link" href="/rings">Rings</a><a class="mob-nav-link" href="/earrings">Earrings</a>
 <a class="mob-nav-link" href="/pendants">Pendants</a><a class="mob-nav-link" href="/bracelets">Bracelets</a>
 <a class="mob-nav-link" href="/journal">Journal</a><a class="mob-nav-link" href="/our-story">Our Story</a>
 </div>
 <div class="mob-nav-foot"><div class="mob-nav-utils">
 <button class="mob-nav-util" onclick="closeMobNav();openAcc()">My Account</button>
 <button class="mob-nav-util" onclick="closeMobNav();openSrv()">Services</button>
 <button class="mob-nav-util" onclick="closeMobNav();openReq()">Contact</button>
 </div></div>
</div>
${navHTML(activeSlug)}
<main>
${mainHTML}
</main>
${footerHTML()}
<script src="/currency.js?v=20260811h" defer></script>
<script src="/app.js?v=20260822a" defer></script>
<script src="/shop.js?v=20260811i" defer></script>
</body>
</html>`;
}

// ── page builders ────────────────────────────────────────────────────────────

function catBody({ kicker, h1, sub, count, intro, sections, links, grid, faq, bcName }) {
 return `<nav class="cat-breadcrumb" aria-label="Breadcrumb">
 <a href="/">Home</a> <span>/</span> <a href="/shop">Shop</a> <span>/</span> <span>${esc(bcName || h1)}</span>
</nav>
<section id="cat-hero"><div class="cat-hero-inner">
 <span class="s-lbl">${esc(kicker)}</span>
 <h1 class="cat-h1">${esc(h1)}</h1>
 <p class="cat-sub">${esc(sub)}</p>
 <p class="cat-count">${count} pieces</p>
</div></section>
${intro || ''}
<section id="catalog"><div class="prod-grid" id="prod-grid">${grid}</div></section>
${sections || ''}
${faq || ''}
${links || ''}`;
}

function typePage(slug, cat, products) {
 const url = `${SITE}/${slug}`;
 const links = linksBlock('Shop amber by color',
 Object.keys(COLORS).map(c => [`/amber/${c}`, COLORS[c].label]).concat([['/amber', 'All Amber Jewelry'], [`/${SILVER.slug}`, 'Sterling Silver Amber']]));
 const schema = { '@context': 'https://schema.org', '@graph': [
 { '@type': 'CollectionPage', '@id': `${url}#webpage`, url, isPartOf: { '@id': `${SITE}/#website` }, inLanguage: 'en', publisher: { '@id': `${SITE}/#organization` }, name: cat.metaTitle, description: cat.metaDesc,
 breadcrumb: breadcrumb([{name:'Home',url:SITE},{name:'Amber',url:`${SITE}/amber`},{name:cat.label,url}]) },
 itemListSchema(url, `AMBERRA ${cat.label}`, url, products),
 faqSchema(cat.faq) ].filter(Boolean) };
 const main = catBody({ kicker:'The Collection', h1:cat.h1, sub:cat.intro[0], count:products.length,
 intro: introHTML(cat.intro), sections: sectionsHTML(SECTIONS[slug]), links, grid: products.map(cardHTML).join('\n'), faq: faqBlock(cat.faq) });
 return shell({ metaTitle:cat.metaTitle, metaDesc:cat.metaDesc, canonical:url, schema, activeSlug:slug, ogImage: ogFor(slug) }, main);
}

function colorPage(colorKey, color, products) {
 const url = `${SITE}/amber/${colorKey}`;
 const links = linksBlock('Shop amber by type',
 Object.keys(TYPES).map(t => [`/${t}`, TYPES[t].label]).concat([['/amber', 'All Amber Jewelry'], [`/${SILVER.slug}`, 'Sterling Silver Amber']]));
 const schema = { '@context': 'https://schema.org', '@graph': [
 { '@type': 'CollectionPage', '@id': `${url}#webpage`, url, isPartOf: { '@id': `${SITE}/#website` }, inLanguage: 'en', publisher: { '@id': `${SITE}/#organization` }, name: color.metaTitle, description: color.metaDesc,
 breadcrumb: breadcrumb([{name:'Home',url:SITE},{name:'Amber',url:`${SITE}/amber`},{name:color.label,url}]) },
 itemListSchema(url, `AMBERRA ${color.label}`, url, products),
 faqSchema(color.faq) ].filter(Boolean) };
 const main = catBody({ kicker:'Amber by Color', h1:color.h1, sub:color.intro[0], count:products.length,
 intro: introHTML(color.intro), sections: sectionsHTML(SECTIONS[colorKey]), links, grid: products.map(cardHTML).join('\n'), faq: faqBlock(color.faq) });
 return shell({ metaTitle:color.metaTitle, metaDesc:color.metaDesc, canonical:url, schema, activeSlug:'amber', ogImage: ogFor('amber') }, main);
}

// The four all-catalog landing pages (/amber, /sterling-silver-amber-jewelry,
// /handmade-sterling-silver-jewelry, /artisan-jewelry) show the same 94 products.
// Order each grid differently — leading with the categories most on-theme — so the
// rendered HTML is not byte-identical across pages (reduces near-duplicate signal).
// JS Array.sort is stable, so within a category the source order is preserved.
const PILLAR_ORDER = {
 amber:    ['bracelets', 'pendants', 'earrings', 'rings', 'chains'],
 silver:   ['rings', 'earrings', 'bracelets', 'pendants', 'chains'],
 handmade: ['pendants', 'rings', 'earrings', 'bracelets', 'chains'],
 artisan:  ['earrings', 'rings', 'pendants', 'bracelets', 'chains'],
};
function orderBy(products, key) {
 const r = Object.fromEntries((PILLAR_ORDER[key] || []).map((c, i) => [c, i]));
 return [...products].sort((a, b) => (r[a.cat] ?? 9) - (r[b.cat] ?? 9));
}

function hubPage(products, colorCounts) {
 const url = `${SITE}/amber`;
 const typeLinks = linksBlock('Shop amber by type',
 Object.keys(TYPES).map(t => [`/${t}`, TYPES[t].label]).concat([[`/${SILVER.slug}`, 'Sterling Silver Amber']]));
 const colorLinks = linksBlock('Shop amber by color',
 Object.keys(COLORS).filter(c => (colorCounts[c] || 0) >= MIN_SKU).map(c => [`/amber/${c}`, COLORS[c].label]));
 const schema = { '@context': 'https://schema.org', '@graph': [
 { '@type': 'CollectionPage', '@id': `${url}#webpage`, url, isPartOf: { '@id': `${SITE}/#website` }, inLanguage: 'en', publisher: { '@id': `${SITE}/#organization` }, name: HUB.metaTitle, description: HUB.metaDesc,
 about: [
 { '@type': 'Thing', name: 'Baltic amber', sameAs: 'https://en.wikipedia.org/wiki/Baltic_amber' },
 { '@type': 'Thing', name: 'Amber', sameAs: 'https://en.wikipedia.org/wiki/Amber' }
 ],
 breadcrumb: breadcrumb([{name:'Home',url:SITE},{name:'Amber',url}]) },
 itemListSchema(url, 'AMBERRA Baltic Amber Jewelry', url, products),
 faqSchema(HUB.faq) ].filter(Boolean) };
 const main = catBody({ kicker:'Baltic Amber', h1:HUB.h1, sub:HUB.intro[0], count:products.length,
 intro: introHTML(HUB.intro), sections: sectionsHTML(SECTIONS.hub), links: typeLinks + colorLinks, grid: orderBy(products, 'amber').map(cardHTML).join('\n'), faq: faqBlock(HUB.faq) });
 return shell({ metaTitle:HUB.metaTitle, metaDesc:HUB.metaDesc, canonical:url, schema, activeSlug:'amber', ogImage: ogFor('amber') }, main);
}

function metalPage(products) {
 const url = `${SITE}/${SILVER.slug}`;
 const links = linksBlock('Shop amber by type',
 Object.keys(TYPES).map(t => [`/${t}`, TYPES[t].label]).concat([['/amber', 'All Amber Jewelry']]));
 const schema = { '@context': 'https://schema.org', '@graph': [
 { '@type': 'CollectionPage', '@id': `${url}#webpage`, url, isPartOf: { '@id': `${SITE}/#website` }, inLanguage: 'en', publisher: { '@id': `${SITE}/#organization` }, name: SILVER.metaTitle, description: SILVER.metaDesc,
 breadcrumb: breadcrumb([{name:'Home',url:SITE},{name:'Amber',url:`${SITE}/amber`},{name:SILVER.label,url}]) },
 itemListSchema(url, `AMBERRA ${SILVER.label} Jewelry`, url, products),
 faqSchema(SILVER.faq) ].filter(Boolean) };
 const main = catBody({ kicker:'925 Sterling Silver', h1:SILVER.h1, sub:SILVER.intro[0], count:products.length,
 intro: introHTML(SILVER.intro), sections: sectionsHTML(SECTIONS.silver), links, grid: orderBy(products, 'silver').map(cardHTML).join('\n'), faq: faqBlock(SILVER.faq) });
 return shell({ metaTitle:SILVER.metaTitle, metaDesc:SILVER.metaDesc, canonical:url, schema, activeSlug:'amber', ogImage: ogFor(SILVER.slug) }, main);
}

function pillarPage(products) {
 const url = `${SITE}/${HANDMADE.slug}`;
 const links = linksBlock('Shop by type',
 Object.keys(TYPES).map(t => [`/${t}`, TYPES[t].label])
 .concat([['/amber', 'All Amber Jewelry'], [`/${SILVER.slug}`, 'Sterling Silver Amber']]));
 const schema = { '@context': 'https://schema.org', '@graph': [
 { '@type': 'CollectionPage', '@id': `${url}#webpage`, url, isPartOf: { '@id': `${SITE}/#website` }, inLanguage: 'en', publisher: { '@id': `${SITE}/#organization` }, name: HANDMADE.metaTitle, description: HANDMADE.metaDesc,
 breadcrumb: breadcrumb([{name:'Home',url:SITE},{name:'Shop',url:`${SITE}/shop`},{name:HANDMADE.label,url}]) },
 itemListSchema(url, `AMBERRA ${HANDMADE.label} Jewelry`, url, products),
 faqSchema(HANDMADE.faq) ].filter(Boolean) };
 const main = catBody({ kicker:'Handmade · 925 Sterling Silver', h1:HANDMADE.h1, sub:HANDMADE.intro[0], count:products.length,
 intro: introHTML(HANDMADE.intro), sections: sectionsHTML(SECTIONS.handmade), links, grid: orderBy(products, 'handmade').map(cardHTML).join('\n'), faq: faqBlock(HANDMADE.faq) });
 return shell({ metaTitle:HANDMADE.metaTitle, metaDesc:HANDMADE.metaDesc, canonical:url, schema, activeSlug:'shop', ogImage: ogFor(HANDMADE.slug) }, main);
}

function artisanPage(products) {
 const url = `${SITE}/${ARTISAN.slug}`;
 const links = linksBlock('Explore the collection',
 Object.keys(TYPES).map(t => [`/${t}`, TYPES[t].label])
 .concat([['/amber', 'All Amber Jewelry'], [`/${HANDMADE.slug}`, 'Handmade Sterling Silver']]));
 const schema = { '@context': 'https://schema.org', '@graph': [
 { '@type': 'CollectionPage', '@id': `${url}#webpage`, url, isPartOf: { '@id': `${SITE}/#website` }, inLanguage: 'en', publisher: { '@id': `${SITE}/#organization` }, name: ARTISAN.metaTitle, description: ARTISAN.metaDesc,
 breadcrumb: breadcrumb([{name:'Home',url:SITE},{name:'Shop',url:`${SITE}/shop`},{name:ARTISAN.label,url}]) },
 itemListSchema(url, `AMBERRA ${ARTISAN.label}`, url, products),
 faqSchema(ARTISAN.faq) ].filter(Boolean) };
 const main = catBody({ kicker:'Independent Studio · Handmade', h1:ARTISAN.h1, sub:ARTISAN.intro[0], count:products.length,
 intro: introHTML(ARTISAN.intro), sections: sectionsHTML(SECTIONS.artisan), links, grid: orderBy(products, 'artisan').map(cardHTML).join('\n'), faq: faqBlock(ARTISAN.faq) });
 return shell({ metaTitle:ARTISAN.metaTitle, metaDesc:ARTISAN.metaDesc, canonical:url, schema, activeSlug:'shop', ogImage: ogFor(ARTISAN.slug) }, main);
}

function amberRingsPage(products) {
 const url = `${SITE}/${AMBER_RINGS.slug}`;
 const links = linksBlock('Shop amber by color',
 Object.keys(COLORS).map(c => [`/amber/${c}`, COLORS[c].label])
 .concat([['/amber', 'All Amber Jewelry'], ['/rings', 'All Silver Rings'], [`/${SILVER.slug}`, 'Sterling Silver Amber']]));
 const schema = { '@context': 'https://schema.org', '@graph': [
 { '@type': 'CollectionPage', '@id': `${url}#webpage`, url, isPartOf: { '@id': `${SITE}/#website` }, inLanguage: 'en', publisher: { '@id': `${SITE}/#organization` }, name: AMBER_RINGS.metaTitle, description: AMBER_RINGS.metaDesc,
 breadcrumb: breadcrumb([{name:'Home',url:SITE},{name:'Amber',url:`${SITE}/amber`},{name:AMBER_RINGS.label,url}]) },
 itemListSchema(url, `AMBERRA ${AMBER_RINGS.label}`, url, products),
 faqSchema(AMBER_RINGS.faq) ].filter(Boolean) };
 const main = catBody({ kicker:'Baltic Amber · 925 Sterling Silver', h1:AMBER_RINGS.h1, sub:AMBER_RINGS.intro[0], count:products.length,
 intro: introHTML(AMBER_RINGS.intro), sections: sectionsHTML(SECTIONS['amber-rings']), links, grid: products.map(cardHTML).join('\n'), faq: faqBlock(AMBER_RINGS.faq) });
 return shell({ metaTitle:AMBER_RINGS.metaTitle, metaDesc:AMBER_RINGS.metaDesc, canonical:url, schema, activeSlug:'amber', ogImage: ogFor('rings') }, main);
}

// ── data sources ─────────────────────────────────────────────────────────────

async function fetchFromAirtable() {
 let records = [], offset = null;
 do {
 const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?pageSize=100${offset ? '&offset=' + offset : ''}`;
 const r = await fetch(url, { headers: { Authorization: `Bearer ${PAT}` } });
 if (!r.ok) throw new Error(`Airtable ${r.status}: ${await r.text()}`);
 const data = await r.json();
 records = records.concat(data.records || []);
 offset = data.offset || null;
 } while (offset);
 return records.map((rec, i) => {
 const f = rec.fields;
 return { id: i + 1, name: f.Name || '', cat: (f.Category || '').toLowerCase(),
 price: f.Price || 0, badge: f.Badge || null, img: f.Image || '',
 desc: f.Description || '', material: f.Material || '', stone: f.Stone || '' };
 });
}
function loadLocalProducts() {
 // /tmp for local dev; data/products.json is the committed source used on Vercel build
 const p = fs.existsSync('/tmp/products.json') ? '/tmp/products.json'
 : path.join(__dirname, '..', 'data', 'products.json');
 if (!fs.existsSync(p)) throw new Error('No products.json (checked /tmp and data/)');
 const items = JSON.parse(fs.readFileSync(p, 'utf8'));
 // Surface stone from props.Stone so colorOf() works on the local source too
 // (Airtable path exposes stone top-level; local JSON nests it under props).
 for (const it of items) {
 if (!it.stone && it.props && it.props.Stone) it.stone = it.props.Stone;
 }
 return items;
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
 let products;
 // Airtable only on explicit sync (SYNC_AIRTABLE=1). generate-products.js owns the
 // snapshot refresh; here we just read data/products.json on normal deploys so the
 // build stops burning Airtable API quota (429 billing limit). See generate-products.js.
 if (PAT && process.env.SYNC_AIRTABLE) {
 try { console.log('Fetching products from Airtable (SYNC_AIRTABLE)…'); products = await fetchFromAirtable(); }
 catch (err) { console.warn(`⚠ Airtable fetch failed (${err.message}) — falling back to local products.json`); products = loadLocalProducts(); }
 } else { console.log('Using committed products.json snapshot (set SYNC_AIRTABLE=1 to refresh)'); products = loadLocalProducts(); }
 console.log(`${products.length} products loaded`);

 assignSlugs(products);
 for (const p of products) p.color = colorOf(p.stone);
 const colorCounts = {};
 for (const p of products) if (p.color) colorCounts[p.color] = (colorCounts[p.color] || 0) + 1;

 const ROOT = path.join(__dirname, '..');
 const written = [];

 // 1) type hubs
 for (const [slug, cat] of Object.entries(TYPES)) {
 const items = products.filter(p => p.cat === slug);
 if (!items.length) { console.log(` skip ${slug} — 0 products`); continue; }
 fs.writeFileSync(path.join(ROOT, `${slug}.html`), typePage(slug, cat, items), 'utf8');
 written.push(`/${slug}`); console.log(` ✓ ${slug}.html (${items.length})`);
 }

 // 2) /amber hub
 fs.writeFileSync(path.join(ROOT, 'amber.html'), hubPage(products, colorCounts), 'utf8');
 written.push('/amber'); console.log(` ✓ amber.html (${products.length})`);

 // 2b) /sterling-silver-amber-jewelry — metal-cut landing (all pieces are 925)
 fs.writeFileSync(path.join(ROOT, `${SILVER.slug}.html`), metalPage(products), 'utf8');
 written.push(`/${SILVER.slug}`); console.log(` ✓ ${SILVER.slug}.html (${products.length})`);

 // 2c) /handmade-sterling-silver-jewelry — craft-angle pillar (ss handmade 4400 LOW)
 fs.writeFileSync(path.join(ROOT, `${HANDMADE.slug}.html`), pillarPage(products), 'utf8');
 written.push(`/${HANDMADE.slug}`); console.log(` ✓ ${HANDMADE.slug}.html (${products.length})`);

 // 2d) /artisan-jewelry — brand/E-E-A-T pillar (artisan 18100 / handmade 33100)
 fs.writeFileSync(path.join(ROOT, `${ARTISAN.slug}.html`), artisanPage(products), 'utf8');
 written.push(`/${ARTISAN.slug}`); console.log(` ✓ ${ARTISAN.slug}.html (${products.length})`);

 // 2e) /amber-rings — amber-first ring spoke (amber rings 1900)
 const ringItems = products.filter(p => p.cat === 'rings');
 if (ringItems.length) {
 fs.writeFileSync(path.join(ROOT, `${AMBER_RINGS.slug}.html`), amberRingsPage(ringItems), 'utf8');
 written.push(`/${AMBER_RINGS.slug}`); console.log(` ✓ ${AMBER_RINGS.slug}.html (${ringItems.length})`);
 }

 // 3) color pages (guarded ≥ MIN_SKU)
 const amberDir = path.join(ROOT, 'amber');
 if (!fs.existsSync(amberDir)) fs.mkdirSync(amberDir);
 for (const [key, color] of Object.entries(COLORS)) {
 const items = products.filter(p => p.color === key);
 if (items.length < MIN_SKU) { console.log(` skip amber/${key} — ${items.length}<${MIN_SKU} SKU`); continue; }
 fs.writeFileSync(path.join(amberDir, `${key}.html`), colorPage(key, color, items), 'utf8');
 written.push(`/amber/${key}`); console.log(` ✓ amber/${key}.html (${items.length})`);
 }

 // 4) sitemap — refresh catalog landing URLs
 const smPath = path.join(ROOT, 'sitemap.xml');
 if (fs.existsSync(smPath)) {
 let sm = fs.readFileSync(smPath, 'utf8');
 // strip previous landing entries (types + /amber + /amber/*)
 sm = sm.replace(/<url>\s*<loc>[^<]*(\/amber-rings|\/rings|\/earrings|\/pendants|\/bracelets|\/chains|\/handmade-sterling-silver-jewelry|\/sterling-silver-amber-jewelry|\/artisan-jewelry|\/amber(\/[a-z-]+)?)<\/loc>[\s\S]*?<\/url>\s*/g, '');
 const entries = written.map(u => ` <url>\n <loc>${SITE}${u}</loc>\n <lastmod>${TODAY}</lastmod>\n </url>`).join('\n');
 sm = sm.replace('</urlset>', `${entries}\n</urlset>`);
 fs.writeFileSync(smPath, sm, 'utf8');
 console.log(` ✓ sitemap.xml (+${written.length} landing URLs)`);
 }
 console.log(`Done: ${written.length} landing pages.`);
}

main().catch(err => { console.error('Error:', err.message); process.exit(0); });
