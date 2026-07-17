// scripts/generate-categories.js
// Generates static catalog pages from Airtable (Vercel build) OR /tmp/products.json (local).
// Amber-only core: /amber hub + type hubs (/rings…) + color pages (/amber/{color}).
// Each landing carries unique intro + FAQ (FAQPage) + internal linking. Cards link to /products/{slug}.

const fs   = require('fs');
const path = require('path');

const BASE_ID  = 'apprPtQw98iLfe0rF';
const TABLE_ID = 'tblg9KjmXRv9u0dzv';
const PAT      = process.env.AIRTABLE_PAT;
const SITE     = 'https://www.amberrajewelry.com';
const TODAY    = new Date().toISOString().slice(0, 10);
const CSSVER   = '20260714a';
const MIN_SKU  = 3; // thin-content guard for color pages

// ── content maps (methodology: data × template) ──────────────────────────────

const TYPES = {
  rings:     { label: 'Rings',     h1: 'Amber Rings',
    metaTitle: 'Amber Rings in Sterling Silver — Handcrafted in Bali | AMBERRA',
    metaDesc: 'Handmade Baltic amber rings in 925 sterling silver, shaped by Balinese artisans. Cherry, cognac, green & honey amber. Free worldwide shipping over $200.',
    intro: [
      'Amber rings from AMBERRA are cut from genuine Baltic amber and set by hand in 925 sterling silver in our Ubud workshop. Every stone is natural — no two are alike, from deep cherry and cognac to green, honey and rare blue amber.',
      'Choose a bold cocktail silhouette or a fine everyday band. Each ring ships with a certificate of authenticity and is available in US ring sizes 5–9.'
    ],
    faq: [
      ['Are AMBERRA amber rings real Baltic amber?', 'Yes. Every ring uses natural Baltic amber (succinite), hand-set in 925 sterling silver, with a certificate of authenticity.'],
      ['What ring sizes do you offer?', 'US sizes 5 to 9. Each product page includes a size guide; contact us for custom sizing.'],
      ['How do I care for an amber ring?', 'Avoid perfume, heat and ultrasonic cleaners. Wipe with a soft cloth and store separately from harder stones.']
    ] },
  earrings:  { label: 'Earrings',  h1: 'Amber Earrings',
    metaTitle: 'Amber Earrings in Sterling Silver — Handcrafted in Bali | AMBERRA',
    metaDesc: 'Natural Baltic amber earrings handcrafted in Bali — drops, studs, hoops and filigree in 925 sterling silver. Cherry, cognac & honey amber. Free shipping over $200.',
    intro: [
      'Our amber earrings pair natural Baltic amber with hand-forged 925 sterling silver — from light everyday studs to statement drops. Colours range across cherry, cognac, honey, green and blue amber.',
      'Lightweight and comfortable, each pair is made one at a time by Balinese silversmiths and arrives with a certificate of authenticity.'
    ],
    faq: [
      ['Are the earrings sterling silver?', 'Yes — 925 sterling silver, some with 18k gold plating. Hooks and posts are hypoallergenic sterling.'],
      ['Is the amber natural?', 'Every piece uses natural Baltic amber. Colour and inclusions vary because the stone is genuine, not pressed or dyed.']
    ] },
  pendants:  { label: 'Pendants',  h1: 'Amber Pendants & Necklaces',
    metaTitle: 'Amber Pendants & Necklaces in Sterling Silver | AMBERRA',
    metaDesc: 'Baltic amber pendants and necklaces handcrafted in Bali in 925 sterling silver. Cherry, cognac, green & blue amber. Pair with a silver chain. Free shipping over $200.',
    intro: [
      'Amber pendant necklaces from AMBERRA frame a single natural Baltic amber cabochon in hand-worked sterling silver. Wear one alone or layered; pair with any AMBERRA silver chain.',
      'Each pendant is one of a kind, cut from genuine Baltic amber and finished by hand in Ubud, Bali.'
    ],
    faq: [
      ['Do pendants come with a chain?', 'Some include a chain; where not, pair with an AMBERRA sterling silver chain (see Chains).'],
      ['What amber colours are available?', 'Cherry, cognac, honey, green, butterscotch and rare blue amber, depending on the piece.']
    ] },
  bracelets: { label: 'Bracelets', h1: 'Amber Bracelets',
    metaTitle: 'Amber Bracelets in Sterling Silver — Handcrafted in Bali | AMBERRA',
    metaDesc: 'Natural Baltic amber bracelets handcrafted in Ubud, Bali — beaded, link and cuff styles in 925 sterling silver. Cherry, cognac & multi-amber. Free shipping over $200.',
    intro: [
      'From delicate beaded strands to bold silver cuffs, our amber bracelets use natural Baltic amber set in 925 sterling silver. Multi-colour (mosaic) amber is a signature.',
      'Every bracelet is handmade in Bali and ships with a certificate of authenticity.'
    ],
    faq: [
      ['What bracelet sizes are available?', 'Most fit 15–19 cm; beaded styles are adjustable. See each product page for sizing.'],
      ['Is multi-colour amber natural?', 'Yes — mosaic amber combines natural Baltic amber of different tones, not dyed stone.']
    ] },
  chains:    { label: 'Chains',    h1: 'Sterling Silver Chains',
    metaTitle: 'Sterling Silver Chains — Handcrafted in Bali | AMBERRA',
    metaDesc: 'Handcrafted 925 sterling silver chains from Bali — cable and link styles, perfect with any AMBERRA amber pendant. Free worldwide shipping over $200.',
    intro: [
      'Handcrafted 925 sterling silver chains to wear alone or with any AMBERRA amber pendant. Cable and link styles in several lengths.',
      'Made by the same Balinese silversmiths behind our amber collections.'
    ],
    faq: [
      ['Which chain suits an amber pendant?', 'Cable and link chains 40–60 cm work with most AMBERRA pendants. Match the metal tone to your pendant setting.']
    ] },
};

// stone-string → colour key
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
    metaDesc: 'Handmade cherry amber jewelry in 925 sterling silver. Deep red natural Baltic amber rings, earrings & pendants, handcrafted in Bali. Free shipping over $200.',
    intro: [
      'Cherry amber is natural Baltic amber in its deepest red-to-cognac tones — warm, translucent and richly coloured. AMBERRA sets it by hand in 925 sterling silver.',
      'Genuine cherry amber deepens with age; each piece is one of a kind and arrives with a certificate of authenticity.'
    ],
    faq: [
      ['Is cherry amber real amber?', 'Yes — cherry amber is natural Baltic amber in deep red tones, not glass or plastic. AMBERRA certifies every piece.'],
      ['Is cherry amber dyed?', 'Our cherry amber is naturally dark Baltic amber; colour comes from the stone and age, not dye.']
    ] },
  honey: { label: 'Honey Amber', h1: 'Honey Amber Jewelry',
    metaTitle: 'Honey Amber Jewelry in Sterling Silver — Bali | AMBERRA',
    metaDesc: 'Handmade honey amber jewelry in 925 sterling silver — warm golden Baltic amber rings, earrings & pendants, handcrafted in Bali. Free shipping over $200.',
    intro: [
      'Honey amber is the classic warm-gold Baltic amber — clear, glowing and timeless. AMBERRA hand-sets it in 925 sterling silver.',
      'Each honey amber piece is natural and unique, finished by Balinese artisans in Ubud.'
    ],
    faq: [
      ['What is honey amber?', 'Honey amber is natural Baltic amber in a warm golden, translucent tone — the most classic amber colour.']
    ] },
  cognac: { label: 'Cognac Amber', h1: 'Cognac Amber Jewelry',
    metaTitle: 'Cognac Amber Jewelry in Sterling Silver — Bali | AMBERRA',
    metaDesc: 'Handmade cognac amber jewelry in 925 sterling silver — rich brown-gold natural Baltic amber, handcrafted in Bali. Free worldwide shipping over $200.',
    intro: [
      'Cognac amber is deep brown-gold natural Baltic amber, warmer and darker than honey. AMBERRA sets it by hand in 925 sterling silver.',
      'Every cognac amber piece is genuine and one of a kind, with a certificate of authenticity.'
    ],
    faq: [
      ['How is cognac amber different from honey amber?', 'Cognac amber is a deeper brown-gold; honey amber is lighter and more golden. Both are natural Baltic amber.']
    ] },
  green: { label: 'Green Amber', h1: 'Green Amber Jewelry',
    metaTitle: 'Green Amber Jewelry in Sterling Silver — Bali | AMBERRA',
    metaDesc: 'Handmade green amber jewelry in 925 sterling silver — natural Baltic amber with green tones, handcrafted in Bali. Free worldwide shipping over $200.',
    intro: [
      'Green amber is natural Baltic amber with cool green depths — distinctive and eye-catching against sterling silver.',
      'AMBERRA green amber is genuine and hand-finished in Bali; each piece is unique.'
    ],
    faq: [
      ['Is green amber natural?', 'Yes — AMBERRA green amber is natural Baltic amber; its green depth comes from the stone set over a dark backing, not dye.']
    ] },
  blue: { label: 'Blue Amber', h1: 'Blue Amber Jewelry',
    metaTitle: 'Blue Amber Jewelry in Sterling Silver — Bali | AMBERRA',
    metaDesc: 'Handmade blue amber jewelry in 925 sterling silver — rare natural blue amber, handcrafted in Bali. A collector favourite. Free worldwide shipping over $200.',
    intro: [
      'Blue amber is among the rarest natural amber, shifting blue under daylight. AMBERRA sets each rare stone by hand in 925 sterling silver.',
      'Because blue amber is scarce, pieces are limited and each is one of a kind with a certificate of authenticity.'
    ],
    faq: [
      ['Why is blue amber so rare?', 'Blue amber forms only in specific conditions and fluoresces blue in daylight — far scarcer than golden amber, hence its collector value.']
    ] },
  butterscotch: { label: 'Butterscotch Amber', h1: 'Butterscotch Amber Jewelry',
    metaTitle: 'Butterscotch Amber Jewelry in Sterling Silver — Bali | AMBERRA',
    metaDesc: 'Handmade butterscotch amber jewelry in 925 sterling silver — creamy opaque natural Baltic amber, handcrafted in Bali. Free worldwide shipping over $200.',
    intro: [
      'Butterscotch amber is creamy, opaque natural Baltic amber — soft, buttery and warm. AMBERRA sets it by hand in 925 sterling silver.',
      'Each butterscotch piece is genuine and unique, made by Balinese artisans.'
    ],
    faq: [
      ['What is butterscotch amber?', 'Butterscotch (or "butter") amber is natural Baltic amber that is creamy and opaque rather than translucent.']
    ] },
  mosaic: { label: 'Multi-Colour Amber', h1: 'Multi-Colour Amber Jewelry',
    metaTitle: 'Multi-Colour (Mosaic) Amber Jewelry in Sterling Silver | AMBERRA',
    metaDesc: 'Handmade multi-colour mosaic amber jewelry in 925 sterling silver — natural Baltic amber of many tones, handcrafted in Bali. Free shipping over $200.',
    intro: [
      'Mosaic amber combines natural Baltic amber of many tones — cherry, cognac, honey and green — in one striking piece, set in 925 sterling silver.',
      'Every mosaic piece is a one-off arrangement of genuine amber, handmade in Bali.'
    ],
    faq: [
      ['Is mosaic amber dyed?', 'No — mosaic (multi-colour) amber uses natural Baltic amber of different tones combined by hand, not dyed stone.']
    ] },
  raw: { label: 'Raw Amber', h1: 'Raw Amber Jewelry',
    metaTitle: 'Raw Amber Jewelry in Sterling Silver — Bali | AMBERRA',
    metaDesc: 'Handmade raw amber jewelry in 925 sterling silver — unpolished natural Baltic amber, handcrafted in Bali. Organic and one of a kind. Free shipping over $200.',
    intro: [
      'Raw amber keeps the natural, unpolished surface of Baltic amber — organic and earthy, set in 925 sterling silver.',
      'Each raw amber piece is genuine and unique, finished by hand in Bali.'
    ],
    faq: [
      ['What is raw amber?', 'Raw amber is natural Baltic amber left unpolished, keeping its organic texture rather than a smooth cabochon.']
    ] },
};

const HUB = {
  h1: 'Handmade Baltic Amber Jewelry',
  metaTitle: 'Handmade Baltic Amber Jewelry in Sterling Silver — Bali | AMBERRA',
  metaDesc: 'Handmade Baltic amber jewelry in 925 sterling silver — rings, earrings, pendants & bracelets in cherry, cognac, honey, green & blue amber. Handcrafted in Bali.',
  intro: [
    'AMBERRA is a handcrafted jewelry house in Ubud, Bali. Every piece pairs genuine Baltic amber — a 40-million-year-old fossil resin — with 925 sterling silver, shaped one at a time by Balinese silversmiths.',
    'Explore amber by type — rings, earrings, pendants, bracelets and chains — or by colour, from deep cherry and cognac to golden honey, green and rare blue amber. Each piece is one of a kind and arrives with a certificate of authenticity.'
  ],
  faq: [
    ['What is Baltic amber?', 'Baltic amber (succinite) is fossilised tree resin roughly 40 million years old, prized for its warm colour and light weight.'],
    ['How do I know AMBERRA amber is real?', 'Every piece uses natural Baltic amber and ships with a certificate of authenticity. See our guide on telling real amber from fake.'],
    ['What metal do you use?', 'Primarily 925 sterling silver, some pieces with 18k gold plating, all handcrafted in Bali.'],
    ['Do you ship to the US?', 'Yes — worldwide shipping, free over $200.']
  ]
};

// Metal-cut landing (targets "sterling silver amber jewelry/ring"). Distinct
// from /amber (material/colour focus) — this page's angle is the 925 silver.
const SILVER = {
  slug: 'sterling-silver-amber-jewelry',
  label: 'Sterling Silver Amber',
  h1: 'Sterling Silver Amber Jewelry',
  metaTitle: 'Sterling Silver Amber Jewelry — 925 Silver, Handcrafted | AMBERRA',
  metaDesc: 'Baltic amber set in solid 925 sterling silver — rings, earrings, pendants & bracelets, handcrafted in Bali. Hypoallergenic, hallmarked silver. Free shipping over $200.',
  intro: [
    'Every AMBERRA piece pairs natural Baltic amber with solid 925 sterling silver — never plated base metal. The warm glow of amber and the cool shine of hand-worked silver are a classic combination, and sterling is durable enough to wear every day.',
    'Our silver is 92.5% pure (the “925” hallmark), the international standard for fine jewelry. It is nickel-free and hypoallergenic, hand-forged by Balinese silversmiths in our Ubud workshop, and finished to hold each amber cabochon securely.'
  ],
  faq: [
    ['Is AMBERRA jewelry solid sterling silver?', 'Yes — all settings are solid 925 sterling silver (92.5% pure). Some pieces add 18k gold plating over sterling; none use plated base metal.'],
    ['Is sterling silver good for amber?', 'Yes. Sterling silver is strong, hypoallergenic and neutral in tone, so it protects the soft amber stone and lets its colour lead. It is the traditional metal for Baltic amber.'],
    ['Will sterling silver tarnish?', 'Sterling can darken slowly with air and moisture. Wipe with a soft cloth and store dry; avoid dipping amber pieces in silver-cleaning solutions, which can harm the stone.'],
    ['Is the silver hallmarked?', 'Our silver meets the 925 sterling standard. Each order includes a certificate of authenticity covering both the amber and the metal.']
  ]
};

// deep content sections (unique per page; distributed so nothing repeats) — H2 + paragraphs
const SECTIONS = {
  silver: [
    ['Why 925 Sterling Silver?', [
      'Sterling silver is an alloy of 92.5% pure silver with 7.5% other metals — usually copper — added for strength. Pure silver alone is too soft to hold a stone; the “925” standard keeps the bright, white lustre of silver while making it durable enough for daily wear. It is the metal jewelers have paired with Baltic amber for centuries.',
      'Because our sterling is nickel-free, it is hypoallergenic and safe for sensitive skin. Its neutral cool tone is the perfect foil for amber: it never competes with the stone, it frames it, letting the warm cherry, cognac and honey tones lead.'
    ]],
    ['Hand-Forged in Ubud', [
      'AMBERRA silver is worked entirely by hand by Balinese silversmiths in our Ubud workshop. Each setting is forged, shaped and polished to cradle a single amber cabochon securely — filigree, granulation and bezel work that a casting machine cannot reproduce. This is why no two AMBERRA pieces are identical.',
      'Balinese silversmithing is a living tradition passed down through generations. The same hands that shape our amber rings and pendants have worked silver for a lifetime, and every finished piece carries that craft.'
    ]],
    ['Caring for Silver & Amber Together', [
      'Sterling silver darkens slowly as it reacts with air — a natural patina that wipes away with a soft silver cloth. But amber is a soft, organic stone, so never soak an AMBERRA piece in a silver-dip solution or clean it with ultrasonic machines: these can dull or crack the amber.',
      'To care for both at once, wipe gently with a dry, soft cloth, keep pieces away from perfume, heat and household chemicals, and store each item separately in a soft pouch. Worn often and kept dry, sterling silver actually tarnishes less — the oils of your skin help keep it bright.'
    ]]
  ],
  hub: [
    ['What Is Baltic Amber?', [
      'Baltic amber, known to gemologists as succinite, is fossilised resin from ancient conifer forests that grew around the Baltic Sea some 40 million years ago. Over millennia the resin hardened, mineralised and was carried by rivers and seas into the deposits mined today. It is remarkably light, warm to the touch, and glows from within — qualities no glass or plastic imitation can match.',
      'Genuine Baltic amber often holds tiny inclusions — trapped air, plant matter, occasionally an insect — small proofs of its natural origin. AMBERRA works only with authentic Baltic amber, never copal (young resin) or pressed and dyed substitutes.'
    ]],
    ['A Spectrum of Natural Colour', [
      'Amber is not a single colour. Depending on how the resin formed and how light passes through it, a stone can be deep cherry red, warm cognac, golden honey, cool green, rare blue, creamy butterscotch, or a mosaic of many tones at once. Every colour in the AMBERRA collection is natural to the stone.',
      'Explore by colour to find the tone that suits you — from the everyday warmth of honey and cognac to the collector rarity of blue amber.'
    ]],
    ['Handcrafted in Ubud, Bali', [
      'Every AMBERRA piece is made by hand in our Ubud workshop, where Balinese silversmiths shape, set and finish each design one at a time. This is slow, human work — filigree, granulation and hand-forged settings that a factory line cannot reproduce. It is why no two pieces are ever identical.'
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
      'AMBERRA is not a marketplace reseller. We are a single workshop in Ubud, Bali, working directly with the silversmiths who make every piece. That means honest materials — real Baltic amber, real 925 sterling silver — a certificate with every order, and designs you will not find on mass-market sites. Each purchase supports Balinese artisans keeping a centuries-old craft alive.'
    ]],
    ['Baltic Amber vs Other World Ambers', [
      'Amber is found in several places — the Dominican Republic, Mexico, Myanmar and elsewhere — but Baltic amber is the most prized for jewelry. It is the oldest widely used amber and the only kind with a high content of succinic acid, which is why gemologists call it succinite. That composition gives Baltic amber its particular warmth, durability and depth of colour.',
      'Younger resins such as copal are often sold as amber but are only thousands, not millions, of years old; they stay softer and can craze or cloud with time. Every AMBERRA piece uses true Baltic amber, never copal, pressed reconstitute or dyed imitation — so what you buy keeps its beauty for generations.'
    ]],
    ['Amber as a Meaningful Gift', [
      'For centuries amber has been given as a token of warmth, protection and lasting affection — a fragment of sunlight to carry with you. Because each stone is unique and quietly luxurious, amber jewelry makes a gift that feels personal rather than mass-produced, suitable for birthdays, anniversaries, weddings or simply as a keepsake.',
      'Every AMBERRA order arrives boxed with its certificate of authenticity, ready to give. If you are unsure which colour or piece to choose, our team is happy to help you select something to suit the person you have in mind.'
    ]],
    ['Styling Your Amber Jewelry', [
      'Amber’s warm, honeyed tones flatter every skin tone and sit beautifully against both neutral and jewel-coloured wardrobes. Set in cool 925 sterling silver, it reads modern and understated; against gold-plated settings it turns rich and vintage. Layer a pendant over knitwear in winter, or let amber studs warm a linen shirt in summer.',
      'Because amber is so light, you can wear even statement pieces comfortably all day. Mix tones freely — a cherry ring with honey earrings, or a mosaic bracelet against raw amber — since every shade shares the same natural origin.'
    ]]
  ],
  cherry: [
    ['What Is Cherry Amber?', [
      'Cherry amber is natural Baltic amber in its deepest red-to-mahogany tones. The rich colour develops as amber oxidises and darkens over time, which is why antique amber often carries these warm, wine-like hues. Held to the light, genuine cherry amber stays translucent, glowing red rather than flat black.'
    ]],
    ['How to Wear Cherry Amber', [
      'Cherry’s depth reads as elegant and dressy. Against 925 sterling silver it turns cool and modern; against gold-plated settings it warms into something vintage and rich. A cherry amber ring or pendant makes a natural statement piece, while studs keep the colour subtle.'
    ]],
    ['Is Cherry Amber Real or Treated?', [
      'Some sellers deepen pale amber with heat treatment; others sell red glass or bakelite as "cherry amber". AMBERRA cherry amber is naturally dark Baltic amber, certified genuine. Real cherry amber is warm and light in the hand, carries faint natural inclusions, and glows red under strong light — plastic does not.'
    ]],
    ['Why Aged Amber Turns Cherry', [
      'The deep red of cherry amber is largely a story of time. As amber is exposed to oxygen over decades and centuries, its surface slowly oxidises and darkens from gold toward cognac and finally cherry. This is why so much genuinely antique amber carries these rich tones, and why cherry amber feels heirloom even when newly set.'
    ]],
    ['Cherry Amber as a Gift', [
      'Its jewel-like depth makes cherry amber a memorable gift — striking enough to feel special, classic enough to wear for years. A cherry amber pendant or ring in 925 sterling silver arrives boxed with its certificate of authenticity, ready to give.'
    ]]
  ],
  honey: [
    ['What Is Honey Amber?', [
      'Honey amber is the classic golden Baltic amber — clear, warm and glowing, the colour most people picture when they think of amber. It flatters every skin tone and pairs effortlessly with 925 sterling silver for everyday wear.'
    ]],
    ['Styling & Care', [
      'Because honey amber is bright and versatile, it works from daytime to evening. Keep it away from perfume, hairspray and heat, wipe with a soft cloth, and store it separately from harder gemstones to protect its surface.'
    ]],
    ['The Most Versatile Amber', [
      'If you are buying your first amber, honey is the natural place to start. Its clear golden warmth flatters every skin tone, reads as both classic and contemporary, and pairs with everything from jeans to eveningwear. Set in 925 sterling silver, honey amber earrings or a pendant become pieces you reach for again and again.'
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
      'Green amber’s cool, unexpected depth makes it a natural conversation piece. It stands out against 925 sterling silver and pairs well with green, teal and earth-toned outfits. Choose a bold green amber ring or pendant when you want something distinctive rather than expected.'
    ]]
  ],
  blue: [
    ['What Is Blue Amber?', [
      'Blue amber is among the rarest amber in the world. In daylight its surface fluoresces a soft blue, while the body of the stone stays golden — a natural optical effect caused by the way the resin scatters light. True blue amber is scarce, which is why it is prized by collectors.'
    ]],
    ['A Collector’s Choice', [
      'Because supply is so limited, AMBERRA blue amber pieces are made in small numbers and each is unique. Every one is certified natural Baltic amber and set by hand in 925 sterling silver.'
    ]],
    ['How Blue Amber Gets Its Colour', [
      'Blue amber is not blue like a sapphire. The body of the stone is golden; the blue appears only as light strikes its surface and is scattered back to the eye, glowing strongest under sunlight and UV. This rare fluorescence, combined with scarce supply, is why blue amber commands a premium among collectors worldwide.'
    ]]
  ],
  butterscotch: [
    ['What Is Butterscotch Amber?', [
      'Butterscotch amber — sometimes called "butter" amber — is natural Baltic amber that is creamy and opaque rather than clear. Its soft, milky warmth comes from countless microscopic air bubbles trapped in the resin. The look is gentle, antique and quietly luxurious.'
    ]],
    ['Styling Butterscotch Amber', [
      'The muted, buttery tone flatters warm and neutral palettes and reads as understated and timeless. Set in 925 sterling silver, butterscotch amber makes elegant everyday earrings and pendants.'
    ]],
    ['Butterscotch & Antique Style', [
      'Opaque "butter" amber has been treasured for generations and carries a distinctly vintage, heirloom feeling. Its soft, creamy surface hides the microscopic bubbles that scatter light and give the stone its glow. For anyone drawn to antique and old-world jewelry, butterscotch amber is the natural choice.'
    ]]
  ],
  mosaic: [
    ['What Is Mosaic Amber?', [
      'Mosaic (multi-colour) amber brings together natural Baltic amber of many tones — cherry, cognac, honey and green — arranged by hand in a single piece. Each mosaic is a one-off composition, impossible to repeat exactly.'
    ]],
    ['Handmade, Never Dyed', [
      'Our mosaic pieces use genuine amber of different natural colours, not dyed stone. The result is a rich, layered look set in 925 sterling silver — one of the most distinctive styles AMBERRA makes.'
    ]],
    ['One of a Kind by Design', [
      'Because each mosaic is assembled by hand from individually chosen amber fragments, no two pieces can ever match exactly. That is the appeal: a mosaic amber bracelet or pendant is genuinely unique, a small composition of cherry, cognac, honey and green tones that exists nowhere else.'
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
      'Leaving amber unpolished keeps it closest to how it is found — honest, textured and elemental. For anyone who values natural materials and a grounded, earthy aesthetic, raw amber offers all the warmth and history of Baltic amber without the polished formality. Each piece keeps the stone’s own surface and character.'
    ]]
  ],
  rings: [
    ['The Craft Behind Our Amber Rings', [
      'Each AMBERRA amber ring begins with a single natural Baltic amber cabochon, chosen for colour and clarity, then set into a hand-forged 925 sterling silver band by our Ubud silversmiths. Filigree, granulation and open settings are all done by hand, so every ring is unique.'
    ]],
    ['Choosing & Sizing Your Ring', [
      'Amber rings are available in US sizes 5–9. Because amber is light, even bold cocktail styles wear comfortably. Consider a deep cherry or cognac stone for a statement piece, or honey and butterscotch for everyday. Keep your ring away from heat and chemicals and wipe it with a soft cloth.'
    ]],
    ['Amber Ring Styles', [
      'Our amber rings span several silhouettes: bold cocktail and statement rings built around a large cabochon, fine everyday bands with a smaller stone, and open or filigree settings that let light through the amber. Multi-colour mosaic and raw amber styles offer a more organic, bohemian look.'
    ]],
    ['A Ring That Lasts', [
      'Set in 925 sterling silver and made by hand, an AMBERRA amber ring is built to be worn. Take it off before washing your hands with harsh soap, gardening or applying lotion, and store it separately from harder rings. Cared for simply, it keeps its glow for decades and can darken beautifully with age.'
    ]],
    ['Amber Rings vs Gemstone Rings', [
      'Where a diamond or sapphire is prized for hardness and sparkle, amber offers something different: warmth, colour and a direct connection to the natural world. It is a fossil, not a cut crystal — light, glowing and alive with tiny inclusions. That makes an amber ring feel personal and organic rather than formal, a piece you wear for its character rather than its carat weight.',
      'Amber is also softer than most gemstones, which is part of its charm and the reason it is set protectively in sterling silver. Worn with a little care, it ages gracefully, deepening in tone rather than wearing out.'
    ]],
    ['A Meaningful Ring to Give', [
      'An amber ring makes an unexpected and personal gift — for an engagement alternative, an anniversary, or simply to mark a moment. Because each stone is one of a kind, the ring you give exists nowhere else. Choose a deep cherry cabochon for drama, honey or cognac for everyday warmth, and we will box it with its certificate of authenticity, ready to present.'
    ]]
  ],
  earrings: [
    ['Handmade Amber Earrings', [
      'From light studs to sculptural drops, our amber earrings pair natural Baltic amber with hypoallergenic 925 sterling silver hooks and posts. Each pair is made one at a time, so colour and inclusions vary naturally from piece to piece.'
    ]],
    ['Studs, Drops & Hoops', [
      'Our amber earrings come in every silhouette. Studs place a single warm cabochon close to the ear for quiet, everyday elegance. Drops and dangles catch the light and lengthen the neckline, ideal for evening. Hoops and filigree designs frame the amber in openwork sterling silver. Whichever you choose, the stone is natural Baltic amber, so no two pairs are identical.'
    ]],
    ['Colours & Comfort', [
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
      'Our amber bracelets range from delicate beaded strands to bold silver cuffs, all using natural Baltic amber set in 925 sterling silver. Multi-colour mosaic amber is a signature of the collection.'
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
      'Handcrafted 925 sterling silver chains, made by the same Balinese silversmiths behind our amber collections. Wear one alone or pair it with any AMBERRA amber pendant to build your own necklace.'
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
  return `<div class="cat-intro">${paras.map(p => `<p>${esc(p)}</p>`).join('')}</div>`;
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
  const img = p.img || '';
  const imgTag = img
    ? `<img src="${esc(img)}" alt="${esc(p.name)} — AMBERRA ${esc(p.cat)}" loading="lazy">`
    : `<div style="width:100%;height:100%;background:var(--mist)"></div>`;
  return `
    <div class="pc" onclick="openDrawer(${p.id})">
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
            <span class="pprice">$${p.price}</span>
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
        image: p.img ? [absUrl(p.img)] : [],
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
      <button class="mob-menu-btn" onclick="openMobNav()"><svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
      <button class="nav-util-link keep" onclick="openSrv()"><span>Services</span></button>
      <button class="nav-util-link" onclick="openReq()"><span>Contact Us</span></button>
    </div>
    <a class="nav-logo" href="/"><span class="nav-logo-main">AMBERRA</span><span class="nav-logo-sub">Jewelry</span></a>
    <div class="nav-lb-r">
      <button class="nav-ico-btn" onclick="toggleWishView()"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg><span class="nav-badge" id="wish-badge">0</span></button>
      <button class="nav-ico-btn" onclick="openAcc()"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></button>
      <a class="nav-ico-btn" href="/stores"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></a>
      <button class="nav-ico-btn" onclick="openCart()"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg><span class="nav-badge" id="cart-badge">0</span></button>
    </div>
  </div>
  <div class="nav-main">
    <a class="nl${activeSlug === 'amber' ? ' act' : ''}" href="/amber">Amber</a>
    ${nl('rings','Rings')} ${nl('earrings','Earrings')} ${nl('pendants','Pendants')} ${nl('bracelets','Bracelets')}
    <span class="nav-divider"></span>
    <a class="nl" href="/our-story">Our Story</a>
    <a class="nl" href="/journal">Journal</a>
  </div>
</div>`;
}

function footerHTML() {
  return `<footer>
  <div class="ft">
    <div>
      <div class="fb">AMBERRA</div>
      <p class="fd">Natural Baltic amber jewelry,<br>handcrafted in Bali with sacred intention.<br>Each piece is unique — like its wearer.</p>
    </div>
    <div><span class="fc-t">Shop Amber</span><ul class="fc-l">
      <li><a href="/amber">All Amber Jewelry</a></li>
      <li><a href="/rings">Amber Rings</a></li><li><a href="/earrings">Amber Earrings</a></li>
      <li><a href="/pendants">Amber Pendants</a></li><li><a href="/bracelets">Amber Bracelets</a></li>
    </ul></div>
    <div><span class="fc-t">By Colour</span><ul class="fc-l">
      <li><a href="/amber/cherry">Cherry Amber</a></li><li><a href="/amber/cognac">Cognac Amber</a></li>
      <li><a href="/amber/honey">Honey Amber</a></li><li><a href="/amber/green">Green Amber</a></li>
      <li><a href="/amber/blue">Blue Amber</a></li>
    </ul></div>
    <div><span class="fc-t">Company</span><ul class="fc-l">
      <li><a href="/our-story">Our Story</a></li><li><a href="/journal">Journal</a></li>
      <li><a href="/stores">Stores</a></li><li><a href="/#wholesale">Wholesale</a></li>
    </ul></div>
  </div>
  <div class="ft-bot"><span>© 2026 AMBERRA. All rights reserved.</span></div>
</footer>`;
}

function shell({ metaTitle, metaDesc, canonical, schema, activeSlug }, mainHTML) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PJ5682RJ');</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(metaTitle)}</title>
<meta name="description" content="${esc(metaDesc)}">
<meta name="robots" content="index, follow">
<meta name="author" content="AMBERRA">
<link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="${canonical}">
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="AMBERRA">
<meta property="og:title" content="${esc(metaTitle)}">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}/images/og-cover.jpg">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>
<script src="https://js-de.sentry-cdn.com/4685202527800b7a5362a10c52b9ba1b.min.js" crossorigin="anonymous" async></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Cormorant+SC:wght@300;400;500&family=Montserrat:wght@300;400;500&display=swap" rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Cormorant+SC:wght@300;400;500&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet"></noscript>
<link rel="stylesheet" href="/style.css?v=${CSSVER}">
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
</div>
${navHTML(activeSlug)}
${mainHTML}
${footerHTML()}
<script src="/app.js" defer></script>
<script src="/shop.js" defer></script>
</body>
</html>`;
}

// ── page builders ────────────────────────────────────────────────────────────

function catBody({ kicker, h1, sub, count, intro, sections, links, grid, faq }) {
  return `<section id="cat-hero"><div class="cat-hero-inner">
  <span class="s-lbl">${esc(kicker)}</span>
  <h1 class="cat-h1">${esc(h1)}</h1>
  <p class="cat-sub">${esc(sub)}</p>
  <p class="cat-count">${count} pieces</p>
</div></section>
${intro || ''}
${links || ''}
<section id="catalog"><div class="prod-grid" id="prod-grid">${grid}</div></section>
${sections || ''}
${faq || ''}`;
}

function typePage(slug, cat, products) {
  const url = `${SITE}/${slug}`;
  const links = linksBlock('Shop amber by colour',
    Object.keys(COLORS).map(c => [`/amber/${c}`, COLORS[c].label]).concat([['/amber', 'All Amber Jewelry'], [`/${SILVER.slug}`, 'Sterling Silver Amber']]));
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': `${url}#webpage`, url, name: cat.metaTitle, description: cat.metaDesc,
      breadcrumb: breadcrumb([{name:'Home',url:SITE},{name:'Amber',url:`${SITE}/amber`},{name:cat.label,url}]) },
    itemListSchema(url, `AMBERRA ${cat.label}`, url, products),
    faqSchema(cat.faq) ].filter(Boolean) };
  const main = catBody({ kicker:'The Collection', h1:cat.h1, sub:cat.intro[0], count:products.length,
    intro: introHTML(cat.intro), sections: sectionsHTML(SECTIONS[slug]), links, grid: products.map(cardHTML).join('\n'), faq: faqBlock(cat.faq) });
  return shell({ metaTitle:cat.metaTitle, metaDesc:cat.metaDesc, canonical:url, schema, activeSlug:slug }, main);
}

function colorPage(colorKey, color, products) {
  const url = `${SITE}/amber/${colorKey}`;
  const links = linksBlock('Shop amber by type',
    Object.keys(TYPES).map(t => [`/${t}`, TYPES[t].label]).concat([['/amber', 'All Amber Jewelry'], [`/${SILVER.slug}`, 'Sterling Silver Amber']]));
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': `${url}#webpage`, url, name: color.metaTitle, description: color.metaDesc,
      breadcrumb: breadcrumb([{name:'Home',url:SITE},{name:'Amber',url:`${SITE}/amber`},{name:color.label,url}]) },
    itemListSchema(url, `AMBERRA ${color.label}`, url, products),
    faqSchema(color.faq) ].filter(Boolean) };
  const main = catBody({ kicker:'Amber by Colour', h1:color.h1, sub:color.intro[0], count:products.length,
    intro: introHTML(color.intro), sections: sectionsHTML(SECTIONS[colorKey]), links, grid: products.map(cardHTML).join('\n'), faq: faqBlock(color.faq) });
  return shell({ metaTitle:color.metaTitle, metaDesc:color.metaDesc, canonical:url, schema, activeSlug:'amber' }, main);
}

function hubPage(products, colorCounts) {
  const url = `${SITE}/amber`;
  const typeLinks = linksBlock('Shop amber by type',
    Object.keys(TYPES).map(t => [`/${t}`, TYPES[t].label]).concat([[`/${SILVER.slug}`, 'Sterling Silver Amber']]));
  const colorLinks = linksBlock('Shop amber by colour',
    Object.keys(COLORS).filter(c => (colorCounts[c] || 0) >= MIN_SKU).map(c => [`/amber/${c}`, COLORS[c].label]));
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': `${url}#webpage`, url, name: HUB.metaTitle, description: HUB.metaDesc,
      breadcrumb: breadcrumb([{name:'Home',url:SITE},{name:'Amber',url}]) },
    itemListSchema(url, 'AMBERRA Baltic Amber Jewelry', url, products),
    faqSchema(HUB.faq) ].filter(Boolean) };
  const main = catBody({ kicker:'Baltic Amber', h1:HUB.h1, sub:HUB.intro[0], count:products.length,
    intro: introHTML(HUB.intro), sections: sectionsHTML(SECTIONS.hub), links: typeLinks + colorLinks, grid: products.map(cardHTML).join('\n'), faq: faqBlock(HUB.faq) });
  return shell({ metaTitle:HUB.metaTitle, metaDesc:HUB.metaDesc, canonical:url, schema, activeSlug:'amber' }, main);
}

function metalPage(products) {
  const url = `${SITE}/${SILVER.slug}`;
  const links = linksBlock('Shop amber by type',
    Object.keys(TYPES).map(t => [`/${t}`, TYPES[t].label]).concat([['/amber', 'All Amber Jewelry']]));
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': `${url}#webpage`, url, name: SILVER.metaTitle, description: SILVER.metaDesc,
      breadcrumb: breadcrumb([{name:'Home',url:SITE},{name:'Amber',url:`${SITE}/amber`},{name:SILVER.label,url}]) },
    itemListSchema(url, `AMBERRA ${SILVER.label} Jewelry`, url, products),
    faqSchema(SILVER.faq) ].filter(Boolean) };
  const main = catBody({ kicker:'925 Sterling Silver', h1:SILVER.h1, sub:SILVER.intro[0], count:products.length,
    intro: introHTML(SILVER.intro), sections: sectionsHTML(SECTIONS.silver), links, grid: products.map(cardHTML).join('\n'), faq: faqBlock(SILVER.faq) });
  return shell({ metaTitle:SILVER.metaTitle, metaDesc:SILVER.metaDesc, canonical:url, schema, activeSlug:'amber' }, main);
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
  const p = '/tmp/products.json';
  if (!fs.existsSync(p)) throw new Error('No local products.json at /tmp/products.json');
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
  if (PAT) { console.log('Fetching products from Airtable…'); products = await fetchFromAirtable(); }
  else     { console.log('No AIRTABLE_PAT — using /tmp/products.json'); products = loadLocalProducts(); }
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
    if (!items.length) { console.log(`  skip ${slug} — 0 products`); continue; }
    fs.writeFileSync(path.join(ROOT, `${slug}.html`), typePage(slug, cat, items), 'utf8');
    written.push(`/${slug}`); console.log(`  ✓ ${slug}.html (${items.length})`);
  }

  // 2) /amber hub
  fs.writeFileSync(path.join(ROOT, 'amber.html'), hubPage(products, colorCounts), 'utf8');
  written.push('/amber'); console.log(`  ✓ amber.html (${products.length})`);

  // 2b) /sterling-silver-amber-jewelry — metal-cut landing (all pieces are 925)
  fs.writeFileSync(path.join(ROOT, `${SILVER.slug}.html`), metalPage(products), 'utf8');
  written.push(`/${SILVER.slug}`); console.log(`  ✓ ${SILVER.slug}.html (${products.length})`);

  // 3) color pages (guarded ≥ MIN_SKU)
  const amberDir = path.join(ROOT, 'amber');
  if (!fs.existsSync(amberDir)) fs.mkdirSync(amberDir);
  for (const [key, color] of Object.entries(COLORS)) {
    const items = products.filter(p => p.color === key);
    if (items.length < MIN_SKU) { console.log(`  skip amber/${key} — ${items.length}<${MIN_SKU} SKU`); continue; }
    fs.writeFileSync(path.join(amberDir, `${key}.html`), colorPage(key, color, items), 'utf8');
    written.push(`/amber/${key}`); console.log(`  ✓ amber/${key}.html (${items.length})`);
  }

  // 4) sitemap — refresh catalog landing URLs
  const smPath = path.join(ROOT, 'sitemap.xml');
  if (fs.existsSync(smPath)) {
    let sm = fs.readFileSync(smPath, 'utf8');
    // strip previous landing entries (types + /amber + /amber/*)
    sm = sm.replace(/<url>\s*<loc>[^<]*(\/rings|\/earrings|\/pendants|\/bracelets|\/chains|\/sterling-silver-amber-jewelry|\/amber(\/[a-z-]+)?)<\/loc>[\s\S]*?<\/url>\s*/g, '');
    const entries = written.map(u => `  <url>\n    <loc>${SITE}${u}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`).join('\n');
    sm = sm.replace('</urlset>', `${entries}\n</urlset>`);
    fs.writeFileSync(smPath, sm, 'utf8');
    console.log(`  ✓ sitemap.xml (+${written.length} landing URLs)`);
  }
  console.log(`Done: ${written.length} landing pages.`);
}

main().catch(err => { console.error('Error:', err.message); process.exit(0); });
