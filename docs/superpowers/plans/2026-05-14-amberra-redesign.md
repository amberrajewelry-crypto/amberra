# Amberra Homepage Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign homepage to Bvlgari-level luxury: 60px nav, editorial hero, WebGL displacement morph scroll, white+gold product showcase.

**Architecture:** Vanilla HTML/CSS/JS. Existing fluid-bg.js (Three.js) stays fixed. New displacement-morph.js handles editorial scroll transitions. Sections rewritten in index.html, styles updated in style.css, reveal logic updated in app.js.

**Tech Stack:** HTML/CSS/JS, Three.js 0.177.0, Motion One v12, Cormorant Garamond + Jost (Google Fonts), Vercel deploy.

**Spec:** `docs/superpowers/specs/2026-05-14-amberra-redesign-design.md`

**Key files map:**
```
index.html          — rewrite all sections (nav, hero, editorial, products, about, founder, journal, contact, footer)
style.css           — update nav, hero, add new sections, global typography
app.js              — update nav logic, reveal, remove ticker/wholesale JS
fluid-bg.js         — unchanged
displacement-morph.js — NEW: WebGL scroll-driven image transitions
```

---

### Task 1: Global Typography & CSS Variables

**Files:**
- Modify: `style.css` (lines 1-15, CSS variables + global resets)

- [ ] **Step 1: Update CSS variables**

Add new variables and update existing ones in `:root`:

```css
:root {
  --white:#FFFFFF; --cream:#FAF8F5; --silk:#F2EEE8; --mist:#E8E4DC;
  --stone:#C8C4BC; --gray:#8C8880; --charcoal:#3C3830; --black:#2A2520;
  --amber:#C9A832; --amber2:#B8941E; --amber3:#D4B84A; --gold:#E8D080;
  --serif:'Cormorant Garamond',serif; --sans:'Jost',Futura,sans-serif;
  --nav-h:60px;
  /* new */
  --bg-dark:#060200;
  --bg-light:#FAF8F5;
  --ease-enter:cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-exit:cubic-bezier(0.4, 0.0, 1, 1);
  --ease-standard:cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

- [ ] **Step 2: Remove custom cursor from body**

In `style.css`, find the `body` rule with `cursor: url(data:image/svg+xml...)` and remove the entire cursor property. Keep everything else.

- [ ] **Step 3: Add global typography utility classes**

Append to `style.css`:

```css
/* === REDESIGN: Global typography === */
.label{font-family:var(--sans);font-size:11px;font-weight:300;letter-spacing:0.18em;text-transform:uppercase}
.heading-hero{font-family:var(--serif);font-size:clamp(36px,5vw,72px);font-weight:300;letter-spacing:-0.02em;line-height:1.05}
.heading-section{font-family:var(--serif);font-size:clamp(28px,3.5vw,52px);font-weight:300;letter-spacing:-0.01em;line-height:1.1}
.body-text{font-family:var(--sans);font-size:15px;font-weight:300;line-height:1.7}
.cta-link{font-family:var(--sans);font-size:11px;font-weight:300;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none;color:inherit;border-bottom:1px solid currentColor;padding-bottom:2px;transition:opacity 0.2s var(--ease-standard)}
.cta-link:hover{opacity:0.7}
.cta-gold{color:var(--amber)}
```

- [ ] **Step 4: Verify in browser**

Run: `open https://www.amberrajewelry.com` (or local preview)
Expected: no visual change yet (classes not applied), but `--nav-h` reduced to 60px may shift body padding — verify nav still works.

- [ ] **Step 5: Commit**

```bash
cd ~/amberra && git add style.css && git commit -m "redesign: global typography classes, CSS vars, remove custom cursor"
```

---

### Task 2: Nav — 60px Ultra-Minimal

**Files:**
- Modify: `index.html` (nav-shell section, ~lines 100-180)
- Modify: `style.css` (nav styles, ~lines 20-96)
- Modify: `app.js` (nav scroll logic)

- [ ] **Step 1: Rewrite nav HTML in index.html**

Replace the entire `#nav-shell` contents with:

```html
<header id="nav-shell" style="position:fixed;top:0;left:0;right:0;z-index:900;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 48px;background:transparent;transition:background 0.2s var(--ease-standard)">
  <button id="nav-menu-btn" onclick="openMenu()" style="background:none;border:none;color:#fff;cursor:pointer;display:flex;align-items:center;gap:8px" aria-label="Menu">
    <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><line y1="1" x2="18" y2="1" stroke="currentColor" stroke-width="1.5"/><line y1="6" x2="18" y2="6" stroke="currentColor" stroke-width="1.5"/><line y1="11" x2="18" y2="11" stroke="currentColor" stroke-width="1.5"/></svg>
    <span class="label" style="color:#fff;opacity:0.8">MENU</span>
  </button>
  <a href="/" class="nav-logo" style="font-family:var(--serif);font-size:22px;font-weight:300;letter-spacing:0.2em;color:#fff;text-decoration:none">AMBERRA</a>
  <div style="display:flex;align-items:center;gap:20px">
    <button onclick="openSearch()" aria-label="Search" style="background:none;border:none;color:#fff;opacity:0.6;cursor:pointer;transition:opacity 0.2s"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
    <button onclick="openWish()" aria-label="Wishlist" style="background:none;border:none;color:#fff;opacity:0.6;cursor:pointer;transition:opacity 0.2s"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
    <button onclick="openAcc()" aria-label="Account" style="background:none;border:none;color:#fff;opacity:0.6;cursor:pointer;transition:opacity 0.2s"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></button>
    <button onclick="openCart()" aria-label="Cart" style="background:none;border:none;color:#fff;opacity:0.6;cursor:pointer;transition:opacity 0.2s;position:relative"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><span id="cart-count" style="display:none;position:absolute;top:-4px;right:-6px;background:var(--amber);color:#000;font-size:9px;width:16px;height:16px;border-radius:50%;text-align:center;line-height:16px"></span></button>
  </div>
</header>
```

- [ ] **Step 2: Update nav CSS in style.css**

Find and replace all `#nav-shell` related CSS (lines ~20-96). Replace with:

```css
/* === REDESIGN: Nav 60px === */
#nav-shell{position:fixed;top:0;left:0;right:0;z-index:900;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 48px;background:transparent}
#nav-shell button:hover{opacity:1!important}
#nav-shell.nav-hidden{transform:translateY(-100%);transition:transform 0.3s var(--ease-exit)}
@media(max-width:768px){#nav-shell{padding:0 20px}}
```

- [ ] **Step 3: Update body padding-top**

Change `body { padding-top: var(--nav-h) }` — since `--nav-h` is now 60px, this auto-adjusts. Verify the rule exists; if it uses a hardcoded value, change to `var(--nav-h)`.

- [ ] **Step 4: Remove old nav scroll behavior from app.js**

In `app.js`, find `updateNavSolid` function (~line 614). Replace scroll-based `.solid` logic:

```js
// Remove: scroll > 80 → .solid class
// Nav stays transparent always — no changes on scroll
```

Remove the scroll listener that adds/removes `.solid`. Keep `nav-hidden` logic for drawer/cart.

- [ ] **Step 5: Create fullscreen menu overlay**

Add to `index.html` after `#nav-shell`:

```html
<div id="menu-overlay" style="display:none;position:fixed;inset:0;z-index:950;background:rgba(6,2,0,0.95);color:#fff;padding:120px 48px 48px">
  <button onclick="closeMenu()" style="position:absolute;top:20px;right:48px;background:none;border:none;color:#fff;font-size:24px;cursor:pointer" aria-label="Close">&times;</button>
  <nav style="display:flex;flex-direction:column;gap:24px">
    <a href="/shop?cat=rings" class="label" style="color:#fff;text-decoration:none;font-size:14px;letter-spacing:0.14em;opacity:0.8">RINGS</a>
    <a href="/shop?cat=earrings" class="label" style="color:#fff;text-decoration:none;font-size:14px;letter-spacing:0.14em;opacity:0.8">EARRINGS</a>
    <a href="/shop?cat=pendants" class="label" style="color:#fff;text-decoration:none;font-size:14px;letter-spacing:0.14em;opacity:0.8">PENDANTS</a>
    <a href="/shop?cat=bracelets" class="label" style="color:#fff;text-decoration:none;font-size:14px;letter-spacing:0.14em;opacity:0.8">BRACELETS</a>
    <a href="/shop?cat=chains" class="label" style="color:#fff;text-decoration:none;font-size:14px;letter-spacing:0.14em;opacity:0.8">CHAINS</a>
    <div style="height:1px;background:rgba(201,168,50,0.15);margin:8px 0"></div>
    <a href="/journal" class="label" style="color:#fff;text-decoration:none;font-size:14px;letter-spacing:0.14em;opacity:0.6">JOURNAL</a>
    <a href="/our-story" class="label" style="color:#fff;text-decoration:none;font-size:14px;letter-spacing:0.14em;opacity:0.6">OUR STORY</a>
  </nav>
</div>
```

Add to `app.js`:

```js
function openMenu(){document.getElementById('menu-overlay').style.display='block';document.body.style.overflow='hidden'}
function closeMenu(){document.getElementById('menu-overlay').style.display='none';document.body.style.overflow=''}
```

- [ ] **Step 6: Test nav in browser**

Verify: 60px height, logo centered, hamburger left, icons right, menu overlay opens/closes, no changes on scroll.

- [ ] **Step 7: Commit**

```bash
cd ~/amberra && git add index.html style.css app.js && git commit -m "redesign: 60px ultra-minimal nav with fullscreen menu overlay"
```

---

### Task 3: Hero — Editorial Overlay

**Files:**
- Modify: `index.html` (hero section, ~lines 335-365)
- Modify: `style.css` (hero styles)
- Modify: `app.js` (remove slideshow logic)

- [ ] **Step 1: Rewrite hero HTML**

Replace `<section id="hero">` and its contents with:

```html
<section id="hero" style="position:relative;height:100vh;z-index:2;display:flex;align-items:flex-end">
  <h1 style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Handcrafted Baltic Amber Jewelry — Rings, Earrings, Pendants & Bracelets</h1>
  <div id="hero-content" style="padding:0 48px 80px;max-width:600px">
    <span class="label hero-fade" style="color:#fff;opacity:0;display:block;margin-bottom:12px;color:rgba(255,255,255,0.5)">BALTIC AMBER JEWELRY</span>
    <h2 class="heading-hero hero-fade" style="color:#fff;opacity:0" data-i18n="hero_h">Born from<br>Ancient Earth</h2>
    <p class="body-text hero-fade" style="color:rgba(255,255,255,0.6);opacity:0;margin-top:16px" data-i18n="hero_p">Forty million years of nature's patience,<br>shaped by artisan hands in Bali.</p>
    <a href="/shop" class="cta-link hero-fade" style="color:rgba(255,255,255,0.8);opacity:0;margin-top:24px;display:inline-block" data-i18n="hero_cta">DISCOVER THE COLLECTION</a>
  </div>
  <div id="scroll-hint" style="position:absolute;bottom:32px;left:50%;transform:translateX(-50%);width:1px;height:40px;background:rgba(255,255,255,0.3);opacity:0.3"></div>
</section>
```

- [ ] **Step 2: Add hero CSS**

```css
/* === REDESIGN: Hero === */
#hero{position:relative;height:100vh;z-index:2;display:flex;align-items:flex-end}
@media(max-width:768px){#hero-content{padding:0 20px 60px!important}}
@keyframes scrollHint{0%,100%{transform:translateX(-50%) translateY(0);opacity:0.3}50%{transform:translateX(-50%) translateY(10px);opacity:0.1}}
#scroll-hint{animation:scrollHint 2s var(--ease-standard) infinite}
@keyframes heroFadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.hero-fade.on{animation:heroFadeIn 0.4s var(--ease-enter) forwards}
.hero-fade:nth-child(1).on{animation-delay:0.2s}
.hero-fade:nth-child(2).on{animation-delay:0.4s}
.hero-fade:nth-child(3).on{animation-delay:0.6s}
.hero-fade:nth-child(4).on{animation-delay:0.8s}
```

- [ ] **Step 3: Add hero animation trigger in app.js**

Replace old slideshow logic (`hfsIn`/`hfsOut` related code) with:

```js
// Hero fade-in on load
window.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    document.querySelectorAll('.hero-fade').forEach(el=>el.classList.add('on'))
  },200)
})
```

- [ ] **Step 4: Remove old hero slideshow CSS and JS**

In `style.css`: remove `.h-slide`, `.h-slide-1`, `.h-slide-2`, `.h-s2-wrap`, `.h-s2-text`, `.h-s2-model`, `@keyframes hfsIn`, `@keyframes hfsOut` and related rules.

In `app.js`: remove slideshow switching logic (interval, slide classes).

- [ ] **Step 5: Remove ticker HTML and CSS**

In `index.html`: remove `<div class="ticker">` section entirely.
In `style.css`: remove `.ticker`, `@keyframes ticker` rules.

- [ ] **Step 6: Test hero in browser**

Verify: fluid canvas behind, text bottom-left, sequential fade-in animation, scroll hint animates, no slideshow.

- [ ] **Step 7: Commit**

```bash
cd ~/amberra && git add index.html style.css app.js && git commit -m "redesign: hero editorial overlay with sequential fade-in, remove slideshow and ticker"
```

---

### Task 4: Editorial Scroll — HTML + CSS (without displacement morph)

**Files:**
- Modify: `index.html` (add editorial section after hero)
- Modify: `style.css` (editorial styles)

- [ ] **Step 1: Add editorial HTML after hero**

Insert after `</section><!-- hero -->` and before the next section:

```html
<section id="editorial">
  <div class="ed-screen" style="background-image:url('/images/editorial/amber-raw.webp')">
    <div class="ed-overlay"></div>
    <div class="ed-text rv">
      <h2 class="heading-section" style="color:#fff" data-i18n="ed1_h">Forty million years in the making</h2>
    </div>
  </div>
  <div class="ed-gap"></div>
  <div class="ed-screen" style="background-image:url('/images/editorial/artisan-hands.webp')">
    <div class="ed-overlay"></div>
    <div class="ed-text rv">
      <h2 class="heading-section" style="color:#fff" data-i18n="ed2_h">Shaped by artisan hands</h2>
    </div>
  </div>
  <div class="ed-gap"></div>
  <div class="ed-screen" style="background-image:url('/images/editorial/product-hero.webp')">
    <div class="ed-overlay"></div>
    <div class="ed-text rv">
      <h2 class="heading-section" style="color:#fff" data-i18n="ed3_h">Where nature meets craft</h2>
    </div>
  </div>
  <div class="ed-gap"></div>
  <div class="ed-screen" style="background-image:url('/images/editorial/model-editorial.webp')">
    <div class="ed-overlay"></div>
    <div class="ed-text rv">
      <h2 class="heading-section" style="color:#fff" data-i18n="ed4_h">Wear your story</h2>
      <a href="/shop" class="cta-link" style="color:rgba(255,255,255,0.8);margin-top:24px;display:inline-block" data-i18n="ed4_cta">EXPLORE THE COLLECTION</a>
    </div>
  </div>
</section>
```

**Note:** Images `/images/editorial/*.webp` need to be sourced/created. Use placeholder dark images for prototype; replace with real editorial photography later.

- [ ] **Step 2: Add editorial CSS**

```css
/* === REDESIGN: Editorial Scroll === */
#editorial{position:relative;z-index:2}
.ed-screen{height:100vh;position:relative;background-size:cover;background-position:center;display:flex;align-items:flex-end}
.ed-overlay{position:absolute;inset:0;background:linear-gradient(transparent 40%,rgba(0,0,0,0.6))}
.ed-text{position:relative;z-index:1;padding:0 48px 80px;max-width:600px}
.ed-gap{height:80px;position:relative;z-index:0}
@media(max-width:768px){.ed-text{padding:0 20px 60px}}
```

- [ ] **Step 3: Create placeholder editorial images**

```bash
cd ~/amberra && mkdir -p images/editorial
# Create 4 dark placeholder images (1920x1080 dark gradient)
for f in amber-raw artisan-hands product-hero model-editorial; do
  convert -size 1920x1080 gradient:'#1a0800-#060200' "images/editorial/$f.webp" 2>/dev/null || \
  python3 -c "
from PIL import Image
img=Image.new('RGB',(1920,1080),(10,2,0))
img.save('images/editorial/$f.webp')
" 2>/dev/null || echo "Create $f.webp manually — dark 1920x1080"
done
```

If neither ImageMagick nor Pillow are available, create dark placeholder images manually or use existing dark photos from the site.

- [ ] **Step 4: Test editorial section**

Verify: 4 full-viewport screens with gradient overlay, text bottom-left, gaps between screens show fluid canvas.

- [ ] **Step 5: Commit**

```bash
cd ~/amberra && git add index.html style.css images/editorial/ && git commit -m "redesign: editorial scroll section with 4 screens, gaps for fluid canvas"
```

---

### Task 5: Displacement Morph Prototype

**Files:**
- Create: `displacement-morph.js`
- Modify: `index.html` (add canvas + script)

- [ ] **Step 1: Create displacement-morph.js**

```js
// displacement-morph.js — WebGL scroll-driven image transitions
import * as THREE from 'https://esm.sh/three@0.177.0'

const NOISE_SCALE = 4.0
const DISP_INTENSITY = 0.4

const vertexShader = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}`

const fragmentShader = `
uniform sampler2D uTex1;
uniform sampler2D uTex2;
uniform float uProgress;
uniform float uTime;
varying vec2 vUv;

// Simplex noise hash
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1;i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;
  i=mod289(i);vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m;m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}

void main(){
  float disp = snoise(vUv * ${NOISE_SCALE.toFixed(1)} + uTime * 0.1);
  float strength = ${DISP_INTENSITY.toFixed(1)} * (1.0 - abs(uProgress * 2.0 - 1.0));
  vec2 distortedUv = vUv + vec2(disp * strength);
  vec4 t1 = texture2D(uTex1, distortedUv);
  vec4 t2 = texture2D(uTex2, distortedUv);
  gl_FragColor = mix(t1, t2, uProgress);
}`

export function initDisplacementMorph() {
  const canvas = document.getElementById('morph-canvas')
  if (!canvas) return null

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const loader = new THREE.TextureLoader()

  const uniforms = {
    uTex1: { value: null },
    uTex2: { value: null },
    uProgress: { value: 0 },
    uTime: { value: 0 }
  }

  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  scene.add(mesh)

  const textures = []
  const images = [
    '/images/editorial/amber-raw.webp',
    '/images/editorial/artisan-hands.webp',
    '/images/editorial/product-hero.webp',
    '/images/editorial/model-editorial.webp'
  ]

  const loaded = images.map(src => new Promise(resolve => {
    loader.load(src, tex => { tex.minFilter = THREE.LinearFilter; textures.push(tex); resolve() })
  }))

  let active = false
  let currentPair = 0
  let raf = null

  function render() {
    uniforms.uTime.value = performance.now() * 0.001
    renderer.render(scene, camera)
    if (active) raf = requestAnimationFrame(render)
  }

  function show(pairIndex, progress) {
    if (pairIndex < 0 || pairIndex >= textures.length - 1) return
    uniforms.uTex1.value = textures[pairIndex]
    uniforms.uTex2.value = textures[pairIndex + 1]
    uniforms.uProgress.value = Math.max(0, Math.min(1, progress))
    currentPair = pairIndex
    canvas.style.opacity = '1'
    if (!active) { active = true; render() }
  }

  function hide() {
    canvas.style.opacity = '0'
    active = false
    if (raf) cancelAnimationFrame(raf)
  }

  function resize() {
    renderer.setSize(innerWidth, innerHeight)
  }

  window.addEventListener('resize', resize)

  return Promise.all(loaded).then(() => ({ show, hide, textures }))
}
```

- [ ] **Step 2: Add morph canvas to index.html**

Insert before `<script type="module" src="/fluid-bg.js">`:

```html
<canvas id="morph-canvas" style="position:fixed;inset:0;z-index:3;pointer-events:none;opacity:0;transition:opacity 0.3s"></canvas>
<script type="module" src="/displacement-morph.js"></script>
```

- [ ] **Step 3: Add scroll-driven morph logic to app.js**

```js
// Displacement morph scroll controller
import('/displacement-morph.js').then(m => {
  m.initDisplacementMorph().then(morph => {
    if (!morph) return
    const screens = document.querySelectorAll('.ed-screen')
    const gaps = document.querySelectorAll('.ed-gap')
    if (screens.length < 2) return

    function onScroll() {
      let found = false
      gaps.forEach((gap, i) => {
        if (i >= screens.length - 1) return
        const rect = gap.getBoundingClientRect()
        const viewH = innerHeight
        // Transition zone: from 200px before gap top to 200px after gap bottom
        const start = rect.top - viewH * 0.3
        const end = rect.bottom + viewH * 0.3
        if (start < 0 && end > 0) {
          const progress = Math.abs(start) / (Math.abs(start) + end)
          morph.show(i, progress)
          found = true
        }
      })
      if (!found) morph.hide()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
  })
})
```

- [ ] **Step 4: Test displacement morph**

Scroll through editorial section. Between screens, displacement morph should activate with noise distortion. If effect is not harmonious with fluid canvas — adjust `NOISE_SCALE` (2-8) and `DISP_INTENSITY` (0.2-0.8) in displacement-morph.js.

- [ ] **Step 5: Add reduced-motion fallback**

In `style.css`:

```css
@media(prefers-reduced-motion:reduce){
  .hero-fade.on{animation:none!important;opacity:1!important}
  #scroll-hint{animation:none!important}
  #morph-canvas{display:none!important}
  .ed-screen{scroll-snap-align:start}
}
```

- [ ] **Step 6: Commit**

```bash
cd ~/amberra && git add displacement-morph.js index.html style.css app.js && git commit -m "redesign: WebGL displacement morph prototype for editorial scroll"
```

---

### Task 6: Product Showcase (white + gold)

**Files:**
- Modify: `index.html` (replace hidden #bestsellers)
- Modify: `style.css` (product showcase styles)

- [ ] **Step 1: Replace #bestsellers HTML**

Remove `<section id="bestsellers" style="display:none">` and replace with:

```html
<section id="products" style="background:var(--cream);padding:120px 0">
  <div style="display:flex;justify-content:space-between;align-items:center;padding:0 48px;margin-bottom:32px">
    <span class="label" style="color:var(--amber)">OUR PIECES</span>
    <a href="/shop" class="cta-link cta-gold">VIEW ALL</a>
  </div>
  <div id="prod-scroll" class="prod-scroll">
    <!-- Populated by JS from Airtable -->
  </div>
  <div class="prod-progress" style="margin:24px 48px 0"><div class="prod-progress-fill"></div></div>
</section>
```

- [ ] **Step 2: Add product showcase CSS**

```css
/* === REDESIGN: Product Showcase === */
#products{position:relative;z-index:2}
.prod-scroll{display:flex;gap:0;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 48px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.prod-scroll::-webkit-scrollbar{display:none}
.prod-card{flex:0 0 320px;scroll-snap-align:start;cursor:pointer;transition:transform 0.6s var(--ease-standard)}
.prod-card:hover{transform:scale(1.03)}
.prod-card img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block}
.prod-card-info{padding:16px 12px}
.prod-card-name{font-family:var(--serif);font-size:16px;font-weight:300;color:var(--black)}
.prod-card-cta{font-family:var(--sans);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--amber);border-bottom:1px solid var(--amber);padding-bottom:2px;text-decoration:none;display:inline-block;margin-top:8px}
.prod-progress{position:relative;height:1px;background:rgba(42,37,32,0.1)}
.prod-progress-fill{height:1px;background:var(--amber);width:0%;transition:width 0.1s linear}
@media(max-width:768px){
  .prod-card{flex:0 0 80vw}
  .prod-scroll{padding:0 20px}
  .prod-progress{margin:24px 20px 0!important}
}
```

- [ ] **Step 3: Add JS to populate products and track scroll progress**

Add to `app.js`:

```js
// Product showcase — populate from existing product data
function buildProductShowcase() {
  const container = document.getElementById('prod-scroll')
  if (!container || !window.PRODUCTS) return
  // Pick first 8 products with images
  const items = window.PRODUCTS.filter(p => p.Image).slice(0, 8)
  container.innerHTML = items.map(p => `
    <div class="prod-card" onclick="openDrawer('${p.id}')">
      <img src="${p.Image}" alt="${p.Name}" loading="lazy" width="320" height="427">
      <div class="prod-card-info">
        <div class="prod-card-name">${p.Name}</div>
        <span class="prod-card-cta">DISCOVER</span>
      </div>
    </div>
  `).join('')

  // Progress bar
  const bar = document.querySelector('.prod-progress-fill')
  if (bar) {
    container.addEventListener('scroll', () => {
      const pct = container.scrollLeft / (container.scrollWidth - container.clientWidth) * 100
      bar.style.width = pct + '%'
    }, { passive: true })
  }
}
```

Call `buildProductShowcase()` after products load from Airtable.

- [ ] **Step 4: Test product showcase**

Verify: cream background, gold labels, horizontal scroll, progress bar fills amber, no arrows/dots, hover scale works.

- [ ] **Step 5: Commit**

```bash
cd ~/amberra && git add index.html style.css app.js && git commit -m "redesign: product showcase with horizontal scroll, white+gold palette"
```

---

### Task 7: About (Cinematic) + Founder Strip

**Files:**
- Modify: `index.html` (about + founder sections)
- Modify: `style.css`

- [ ] **Step 1: Rewrite about section HTML**

Replace current `#about` section:

```html
<section id="about" style="position:relative;height:100vh;z-index:2;display:flex;align-items:flex-end;overflow:hidden">
  <video autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" poster="/images/about-poster.webp">
    <source src="/images/about-video.mp4" type="video/mp4">
  </video>
  <div style="position:absolute;inset:0;background:linear-gradient(transparent 40%,rgba(0,0,0,0.6))"></div>
  <div style="position:relative;z-index:1;padding:0 48px 80px;max-width:600px" class="rv">
    <h2 class="heading-section" style="color:#fff" data-i18n="about_h">Amber Alive for Forty Million Years</h2>
    <div style="display:flex;gap:32px;margin-top:20px">
      <span class="label" style="color:rgba(255,255,255,0.6)">40M+ YEARS</span>
      <span class="label" style="color:rgba(255,255,255,0.6)">94 PIECES</span>
      <span class="label" style="color:rgba(255,255,255,0.6)">3 COUNTRIES</span>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Rewrite founder strip HTML**

Replace current `.founder-strip`:

```html
<section class="founder-strip" style="background:var(--cream);padding:48px;display:flex;align-items:center;gap:24px;position:relative;z-index:2">
  <img src="/images/jane.webp" alt="Jane Sakhvadze" width="80" height="80" style="border-radius:50%;object-fit:cover" loading="lazy">
  <div>
    <div style="font-family:var(--serif);font-size:18px;font-weight:300;color:var(--amber)" data-i18n="founder_name">Jane Sakhvadze</div>
    <div style="font-family:var(--sans);font-size:14px;font-weight:300;font-style:italic;opacity:0.7;margin-top:4px;color:var(--black)" data-i18n="founder_role">Founder & Creative Director</div>
  </div>
  <div style="flex:1"></div>
  <a href="/our-story#founder" class="cta-link cta-gold" data-i18n="founder_cta">MEET JANE</a>
</section>
```

- [ ] **Step 3: Add responsive CSS**

```css
/* === REDESIGN: About cinematic === */
@media(max-width:768px){
  #about>div:last-child{padding:0 20px 60px!important}
  .founder-strip{flex-direction:column!important;text-align:center;gap:16px!important;padding:48px 20px!important}
  .founder-strip>div:nth-child(3){display:none}
}
```

- [ ] **Step 4: Test about + founder**

Verify: about = full-bleed video with overlay, text bottom-left, stats row. Founder = cream strip, photo + name (gold) + CTA.

- [ ] **Step 5: Commit**

```bash
cd ~/amberra && git add index.html style.css && git commit -m "redesign: cinematic about section + simplified founder strip"
```

---

### Task 8: Journal (3-Card Grid)

**Files:**
- Modify: `index.html` (journal section)
- Modify: `style.css`

- [ ] **Step 1: Rewrite journal section HTML**

Replace current `#journal` slider with:

```html
<section id="journal" style="background:var(--cream);padding:120px 48px;position:relative;z-index:2">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:40px">
    <span class="label" style="color:var(--amber)">JOURNAL</span>
    <a href="/journal" class="cta-link cta-gold">VIEW ALL STORIES</a>
  </div>
  <div class="journal-grid">
    <a href="/journal/amber-origins" class="journal-card rv">
      <img src="/images/journal/amber-origins.webp" alt="The Origins of Baltic Amber" loading="lazy" width="480" height="360">
      <h3 style="font-family:var(--serif);font-size:20px;font-weight:300;color:var(--black);margin-top:16px">The Origins of Baltic Amber</h3>
      <time class="label" style="color:var(--gray);margin-top:8px;display:block">MARCH 2026</time>
    </a>
    <a href="/journal/bali-craftsmanship" class="journal-card rv">
      <img src="/images/journal/bali-craft.webp" alt="Bali Craftsmanship" loading="lazy" width="480" height="360">
      <h3 style="font-family:var(--serif);font-size:20px;font-weight:300;color:var(--black);margin-top:16px">The Art of Bali Craftsmanship</h3>
      <time class="label" style="color:var(--gray);margin-top:8px;display:block">FEBRUARY 2026</time>
    </a>
    <a href="/journal/caring-for-amber" class="journal-card rv">
      <img src="/images/journal/amber-care.webp" alt="Caring for Amber" loading="lazy" width="480" height="360">
      <h3 style="font-family:var(--serif);font-size:20px;font-weight:300;color:var(--black);margin-top:16px">How to Care for Your Amber</h3>
      <time class="label" style="color:var(--gray);margin-top:8px;display:block">JANUARY 2026</time>
    </a>
  </div>
</section>
```

- [ ] **Step 2: Add journal CSS**

```css
/* === REDESIGN: Journal 3-card grid === */
.journal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
.journal-card{text-decoration:none;transition:transform 0.6s var(--ease-standard)}
.journal-card:hover{transform:scale(1.03)}
.journal-card img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
@media(max-width:768px){
  #journal{padding:80px 20px!important}
  .journal-grid{grid-template-columns:1fr;gap:40px}
}
```

- [ ] **Step 3: Remove old journal slider JS**

In `app.js`: remove journal slider logic (arrows, dots, progress bar, slide counter, prev/next functions). Search for references to `#journal` slider elements.

- [ ] **Step 4: Test journal**

Verify: cream bg, 3 cards in grid, hover scale, gold labels, responsive single column on mobile.

- [ ] **Step 5: Commit**

```bash
cd ~/amberra && git add index.html style.css app.js && git commit -m "redesign: journal 3-card grid, remove slider"
```

---

### Task 9: Contact + Footer

**Files:**
- Modify: `index.html` (contact + footer)
- Modify: `style.css`

- [ ] **Step 1: Rewrite contact section**

```html
<section id="contact" style="background:var(--bg-dark);padding:160px 48px;text-align:center;position:relative;z-index:2">
  <h2 class="heading-section" style="color:#fff" data-i18n="contact_h">Request a Personal Consultation</h2>
  <p class="body-text" style="color:rgba(255,255,255,0.6);margin-top:16px;max-width:400px;margin-left:auto;margin-right:auto" data-i18n="contact_p">Let us guide you to the perfect piece.</p>
  <a href="#" onclick="openReq();return false" class="cta-link" style="color:var(--amber);margin-top:32px;display:inline-block" data-i18n="contact_cta">REQUEST A PIECE</a>
</section>
```

- [ ] **Step 2: Rewrite footer**

```html
<footer style="background:var(--bg-dark);padding:160px 48px 80px;position:relative;z-index:2">
  <div style="border-top:1px solid rgba(201,168,50,0.15);padding-top:80px;display:flex;flex-direction:column;align-items:center;gap:40px">
    <a href="/" style="font-family:var(--serif);font-size:28px;font-weight:300;letter-spacing:0.2em;color:var(--amber);text-decoration:none">AMBERRA</a>
    <div style="display:flex;gap:24px;align-items:center">
      <a href="https://instagram.com/amberra.jewelry" aria-label="Instagram" style="color:#fff;opacity:0.4;transition:opacity 0.2s"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg></a>
      <a href="https://wa.me/message" aria-label="WhatsApp" style="color:#fff;opacity:0.4;transition:opacity 0.2s"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
      <a href="https://pinterest.com/amberrajewelry" aria-label="Pinterest" style="color:#fff;opacity:0.4;transition:opacity 0.2s"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 00-4.373 23.178c-.1-.937-.2-2.375.04-3.4.218-.925 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.024 0 1.518.769 1.518 1.69 0 1.03-.655 2.569-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146A12 12 0 1012 0z"/></svg></a>
    </div>
    <div style="display:flex;gap:80px;margin-top:24px">
      <div>
        <div class="label" style="color:var(--amber);margin-bottom:16px">COLLECTIONS</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <a href="/shop?cat=rings" style="color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;font-weight:300">Rings</a>
          <a href="/shop?cat=earrings" style="color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;font-weight:300">Earrings</a>
          <a href="/shop?cat=pendants" style="color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;font-weight:300">Pendants</a>
          <a href="/shop?cat=bracelets" style="color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;font-weight:300">Bracelets</a>
        </div>
      </div>
      <div>
        <div class="label" style="color:var(--amber);margin-bottom:16px">SERVICES</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <a href="#" onclick="openSrv();return false" style="color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;font-weight:300">Size Guide</a>
          <a href="#" onclick="openSrv();return false" style="color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;font-weight:300">Care Guide</a>
          <a href="#" onclick="openSrv();return false" style="color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;font-weight:300">Certificate</a>
        </div>
      </div>
      <div>
        <div class="label" style="color:var(--amber);margin-bottom:16px">CONTACT</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <a href="mailto:hello@amberrajewelry.com" style="color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;font-weight:300">Email</a>
          <a href="/stores" style="color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;font-weight:300">Stores</a>
          <a href="/our-story" style="color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;font-weight:300">Our Story</a>
        </div>
      </div>
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Add responsive footer CSS**

```css
/* === REDESIGN: Footer === */
footer a:hover{opacity:1!important}
@media(max-width:768px){
  footer{padding:80px 20px 60px!important}
  footer>div>div:last-child{flex-direction:column!important;gap:40px!important;align-items:center;text-align:center}
}
```

- [ ] **Step 4: Remove wholesale section from index.html**

Delete `<section id="wholesale">` and all its contents. Remove related JS (wholesale modal triggers if specific to homepage).

- [ ] **Step 5: Test contact + footer**

Verify: contact = dark bg, centered heading, gold CTA. Footer = gold logo, social icons, 3 columns, breathing space.

- [ ] **Step 6: Commit**

```bash
cd ~/amberra && git add index.html style.css && git commit -m "redesign: minimal contact section + breathing footer, remove wholesale"
```

---

### Task 10: Cleanup — Remove Anti-Patterns

**Files:**
- Modify: `style.css` (global sweep)
- Modify: `index.html` (remove old sections)
- Modify: `app.js` (remove dead code)

- [ ] **Step 1: Remove old editorial section (#ed)**

In `index.html`: remove `<section id="ed">` and contents (replaced by editorial scroll in Task 4).

- [ ] **Step 2: Sweep font-weight in style.css**

Search for `font-weight:500`, `font-weight:600`, `font-weight:700` and replace all with `font-weight:300` (or 400 for Jost body text). Key locations:
- `.nav-logo-main` was `font-weight:600` → change to `300`
- Any heading with weight > 400 → change to 300

```bash
cd ~/amberra && grep -n 'font-weight:[5-9]' style.css
```

Fix each occurrence.

- [ ] **Step 3: Remove border-radius from modals/buttons**

Search for `border-radius` in style.css. Remove from:
- Modal containers (`.srv-modal`, `#req-modal`, `#wise-modal`, etc.)
- Buttons (`.btn`, CTA buttons)
- Cards
Keep border-radius only on: founder photo (circle), cart count badge (circle).

```bash
cd ~/amberra && grep -n 'border-radius' style.css
```

- [ ] **Step 4: Remove old #colls, #catalog, #tryon-sec sections if present in index.html**

These sections were not in the redesign spec. If they exist in index.html, remove them (they belong on separate pages like /shop).

- [ ] **Step 5: Remove dead JS code**

In `app.js`: remove functions related to removed sections:
- Ticker animation code
- Old journal slider (prev/next, dots, counter)
- Wholesale modal triggers specific to homepage
- Old editorial section animations
- `updateNavSolid` scroll color detection (if not removed in Task 2)

- [ ] **Step 6: Final browser test**

Full scroll through homepage:
1. Nav: 60px, transparent, no change on scroll
2. Hero: fluid bg + editorial text, fade-in animation
3. Editorial: 4 screens, displacement morph between them, fluid visible in gaps
4. Products: cream bg, horizontal scroll, gold accents
5. About: full-bleed video, overlay text
6. Founder: cream strip
7. Journal: 3-card grid
8. Contact: dark, centered, gold CTA
9. Footer: breathing, gold logo

Check mobile (375px viewport) for all sections.

- [ ] **Step 7: Commit**

```bash
cd ~/amberra && git add -A && git commit -m "redesign: cleanup anti-patterns, remove dead code and old sections"
```

---

## Post-Implementation

After all 10 tasks:
1. Source real editorial photography for `/images/editorial/` (replace dark placeholders)
2. Tune displacement morph parameters on real images
3. Deploy to Vercel: `cd ~/amberra && npx vercel deploy --prod`
4. Test on production: mobile, desktop, slow 3G
