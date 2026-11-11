# Amberra Homepage Redesign — Design Spec

**Date:** 2026-05-14
**Goal:** Поднять визуал до уровня Bvlgari и выше. Scroll-driven displacement morph, ultra-minimal nav, Bvlgari-style typography, white+gold palette.

---

## Design Decisions

| Решение | Выбор |
|---------|-------|
| Scroll effect | WebGL displacement morph (liquid amber) |
| Nav | 60px ultra-minimal, лого центр, hamburger слева |
| Hero | Fluid WebGL canvas (fixed) + editorial overlay bottom-left |
| Fluid canvas | Fixed на весь viewport, z-index:1, остаётся везде |
| Editorial scroll | 4 full-viewport экрана с displacement morph между ними |
| Product showcase | Горизонтальный scroll, white+gold palette |
| Displacement params | Подбираются на прототипе, fallback: CSS crossfade |
| Убрано | Ticker, Wholesale (с главной), custom cursor, bold text |

---

## Color System

### Dark sections (nav, hero, editorial scroll, about, contact, footer)
```css
--bg-dark: #060200;
--text-primary: #FFFFFF;
--text-secondary: rgba(255,255,255,0.6);
--text-muted: rgba(255,255,255,0.5);
--amber: #C9A832;
--amber-subtle: rgba(201,168,50,0.15);
```

### Light sections (product showcase, founder, journal)
```css
--bg-light: #FAF8F5;       /* cream */
--bg-card: #F2EEE8;         /* silk */
--bg-mist: #E8E4DC;         /* mist */
--text-dark: #2A2520;        /* charcoal */
--text-dark-secondary: rgba(42,37,32,0.6);
--amber: #C9A832;            /* same gold everywhere */
```

### Rules
- Gold (#C9A832) = labels, CTA underlines, progress lines, founder accent
- No gradients on UI elements
- No drop shadows
- No border-radius on any UI element (buttons, cards, inputs, modals)

---

## Typography

### Fonts
- **Primary:** Cormorant Garamond, weight 300 only (never 400, 500, 600)
- **Secondary:** Jost, weight 300-400 only (never 600, 700)
- **No bold anywhere**

### Scale
```css
/* Hero headline */
font-family: var(--serif);
font-size: clamp(36px, 5vw, 72px);
font-weight: 300;
letter-spacing: -0.02em;
line-height: 1.05;

/* Section heading (H2) */
font-size: clamp(28px, 3.5vw, 52px);
font-weight: 300;
letter-spacing: -0.01em;
line-height: 1.1;

/* Label (ALL CAPS) */
font-family: var(--sans);
font-size: 11px;
font-weight: 300;
letter-spacing: 0.18em;
text-transform: uppercase;

/* Body */
font-family: var(--sans);
font-size: 15px;
font-weight: 300;
line-height: 1.7;

/* CTA (ALL CAPS, underline) */
font-family: var(--sans);
font-size: 11px;
font-weight: 300;
letter-spacing: 0.18em;
text-transform: uppercase;
border-bottom: 1px solid currentColor;
padding-bottom: 2px;
/* hover: underline width 0→100%, 0.3s */
```

---

## Motion

### Easing
```css
--ease-enter: cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-exit: cubic-bezier(0.4, 0.0, 1, 1);
--ease-standard: cubic-bezier(0.25, 0.1, 0.25, 1);
```

### Durations
- Fade in/out: 0.4s
- Color/border transitions: 0.2s
- Hover scale: 0.6s
- CTA underline: 0.3s
- Scroll reveal: 0.4s + translateY(20px→0)

### Rules
- No bounces, no springs, no overshoot
- No animations > 0.8s
- `prefers-reduced-motion`: all motion → simple opacity fade
- Image hover: scale(1.03) only, 0.6s ease

---

## Sections (top to bottom)

### 1. Nav (60px ultra-minimal)

```
[☰ MENU]          [AMBERRA]          [🔍 ♡ 👤 🛒]
```

- Height: 60px, position: fixed, background: transparent
- No changes on scroll (no shadow, no solid bg, no shrink)
- Logo: Cormorant 300, 22px, ls:0.2em, centered
- "MENU": Jost 300, 11px, ls:0.18em, uppercase, left
- Icons: SVG 18px, opacity 0.6, hover → 1.0, transition 0.2s
- Hamburger → full-screen dark overlay (collections + links, white text)
- z-index: 100
- Mobile: same structure, padding 20px

### 2. Hero (fluid canvas + editorial overlay)

- Fluid WebGL canvas: position fixed, full viewport, z-index:1 (unchanged)
- Hero content: z-index:2, height:100vh, position:relative
- Text bottom-left, 48px from edges (20px mobile):
  - Label: "BALTIC AMBER JEWELRY" — Jost, muted
  - Heading: "Born from Ancient Earth" — Cormorant, hero scale
  - Body: 1-2 lines — Jost, secondary
  - CTA: "DISCOVER THE COLLECTION" — underline CTA
- Entry animation (sequential):
  - Label: fade 0.4s, delay 0.2s
  - Heading: fade + translateY(20→0), delay 0.4s
  - Body: fade 0.4s, delay 0.6s
  - CTA: fade 0.4s, delay 0.8s
  - Easing: --ease-enter
- Scroll hint: thin vertical line center-bottom, 40px, translateY loop, opacity 0.3
- Remove: clip-path slideshow (slide 2), simplify to single static screen

### 3. Editorial Scroll (displacement morph) — NEW

4 full-viewport screens, stacked vertically. Fluid canvas visible in gaps.

| # | Image | Text | CTA |
|---|-------|------|-----|
| 1 | Raw amber macro | "Forty million years in the making" | — |
| 2 | Artisan hands (Bali) | "Shaped by artisan hands" | — |
| 3 | Product on dark bg | "Where nature meets craft" | — |
| 4 | Model wearing jewelry | "Wear your story" | EXPLORE THE COLLECTION |

Per screen:
- height: 100vh, position: relative
- Image: object-fit:cover, full-bleed
- Overlay: linear-gradient(transparent 40%, rgba(0,0,0,0.6))
- Text: bottom-left, 48px from edges
- Heading: Cormorant 300, section heading scale
- Scroll reveal: fade + translateY(20px), 0.4s

Displacement morph (WebGL):
- Separate canvas, z-index:3, position:fixed, pointer-events:none
- Transitions between screens 1→2, 2→3, 3→4
- Scroll progress 0→1 per transition controls:
  - mix(texture1, texture2, progress)
  - displacement = noise * (1.0 - abs(progress * 2.0 - 1.0))
  - Noise: Perlin/Simplex, scale ~4.0, amber-tinted
- Gap between screens: 50-100px (fluid canvas visible)
- **Parameters tuned on prototype, fallback: CSS crossfade if not harmonious**
- Mobile: CSS crossfade fallback if GPU weak
- prefers-reduced-motion: simple opacity crossfade

### 4. Product Showcase — NEW (replaces hidden #bestsellers)

- Background: --bg-light (#FAF8F5)
- Padding: 120px top/bottom
- Header: "OUR PIECES" label (gold) left + "VIEW ALL" CTA (gold underline) right
- Horizontal scroll: 6-8 cards, scroll-snap-type: x mandatory
- Card: 320px desktop / 260px mobile
  - Photo: aspect-ratio 3:4, object-fit:cover, no gaps between cards
  - Hover: scale(1.03), 0.6s
  - Name: Cormorant 300, 16px, charcoal
  - CTA: "DISCOVER" — 10px, gold, underline
  - No prices on homepage
- Progress: 1px line, bg opacity 0.1, fill amber on scroll
- No arrows, no dots
- Mobile: one card ~80vw, swipe

### 5. About (cinematic)

- Full-bleed video (about-video.mp4), autoplay muted loop, object-fit:cover, 100vh
- Gradient overlay: linear-gradient(transparent 40%, rgba(0,0,0,0.6))
- Text bottom-left, 48px:
  - Heading: "Amber Alive for Forty Million Years" — Cormorant 300, section scale
  - Stats row: "40M+ years · 94 pieces · 3 countries" — Jost 300, 11px, ls:0.18em, opacity 0.6
- White text on dark video

### 6. Founder Strip

- Background: --bg-light (#FAF8F5)
- Photo Jane: 80px circle
- Name: Cormorant 300, gold accent
- Quote: Jost 300, italic, opacity 0.7
- CTA: "Meet Jane" — gold underline → /our-story#founder
- Padding: 48px vertical

### 7. Journal (3 cards grid)

- Background: --bg-light (#FAF8F5)
- Label: "JOURNAL" — Jost 11px, ls:0.18em, gold
- 3 cards in CSS grid (3 col desktop, 1 col mobile)
- Card: photo aspect-ratio 4:3 + title (Cormorant 300) + date (Jost, opacity 0.5)
- Hover: scale(1.03), 0.6s
- CTA: "VIEW ALL STORIES" — gold underline
- Padding: 120px top/bottom

### 8. Contact

- Background: #060200
- Heading: "Request a Personal Consultation" — Cormorant 300, white, centered
- CTA: gold underline
- Padding: 160px top/bottom
- Minimal: 3 lines of text max

### 9. Footer

- Background: #060200
- Logo: Cormorant 300, 28px, centered, gold
- Social icons: SVG, opacity 0.4, hover → 0.8
- Columns: uppercase labels (Jost 11px, ls:0.18em, gold), links white opacity 0.6
- Separator: 1px solid rgba(201,168,50,0.15)
- Padding: 160px top, 80px bottom

---

## Anti-Patterns (NEVER do)

- No border-radius on UI elements
- No drop shadows
- No gradients on UI elements
- No bold text (weight > 400)
- No centered hero text (always left-aligned, except Contact/Footer)
- No bright accent colors besides gold
- No emoji as icons (SVG only)
- No decorative icons
- No animations > 0.8s
- No sticky nav that changes on scroll
- No custom cursor
- No ticker/marquee on homepage

---

## Technical Stack (unchanged)

- Vanilla HTML/CSS/JS
- Three.js (fluid canvas + displacement morph)
- Motion One (scroll-linked animations)
- Cormorant Garamond + Jost (Google Fonts)
- Vercel deploy

---

## Implementation Order

1. Nav (60px ultra-minimal)
2. Hero (editorial overlay + entry animation)
3. Editorial scroll (displacement morph prototype)
4. Product showcase (horizontal scroll, white+gold)
5. About (cinematic full-bleed)
6. Founder strip (simplify)
7. Journal (3-card grid)
8. Contact (minimal)
9. Footer (breathing)
10. Global: typography weight 300, CTA style, remove anti-patterns
