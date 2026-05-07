#!/usr/bin/env python3
"""
Visual and Mobile SEO analysis script for amberrajewelry.com
Captures screenshots, extracts DOM data, and analyzes visual issues.
"""

import json
import os
import sys

try:
    from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
except ImportError:
    print("Error: playwright required. Install with: pip install playwright && playwright install chromium")
    sys.exit(1)

URL = "https://www.amberrajewelry.com"
OUTPUT_DIR = "/Users/vladimir/amberra/screenshots"

VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "mobile":  {"width": 375,  "height": 812},
}

os.makedirs(OUTPUT_DIR, exist_ok=True)

results = {}

with sync_playwright() as p:
    for vp_name, vp in VIEWPORTS.items():
        print(f"\n--- Capturing {vp_name} ({vp['width']}x{vp['height']}) ---")

        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport=vp,
            device_scale_factor=2 if vp_name == "mobile" else 1,
            user_agent=(
                "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) "
                "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
                if vp_name == "mobile" else
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ),
        )
        page = context.new_page()

        try:
            page.goto(URL, wait_until="networkidle", timeout=45000)
            page.wait_for_timeout(2000)
        except PlaywrightTimeout:
            print(f"  WARNING: Page load timed out, proceeding with partial content")

        # Screenshot
        shot_path = os.path.join(OUTPUT_DIR, f"amberra_{vp_name}.png")
        page.screenshot(path=shot_path, full_page=False)
        print(f"  Screenshot saved: {shot_path}")

        # DOM Analysis
        data = page.evaluate("""() => {
            const getVisible = (el) => {
                const rect = el.getBoundingClientRect();
                return rect.top < window.innerHeight && rect.bottom > 0 && rect.width > 0 && rect.height > 0;
            };

            // H1
            const h1Els = [...document.querySelectorAll('h1')];
            const h1s = h1Els.map(el => ({
                text: el.innerText?.trim().slice(0, 200),
                visible: getVisible(el),
                rect: JSON.stringify(el.getBoundingClientRect())
            }));

            // H2
            const h2Els = [...document.querySelectorAll('h2')];
            const h2s = h2Els.slice(0, 5).map(el => ({
                text: el.innerText?.trim().slice(0, 150),
                visible: getVisible(el)
            }));

            // CTAs (buttons and prominent links)
            const ctaEls = [...document.querySelectorAll('a, button')];
            const ctas = ctaEls
                .filter(el => {
                    const txt = el.innerText?.trim().toLowerCase();
                    return txt && (
                        txt.includes('shop') || txt.includes('buy') || txt.includes('explore') ||
                        txt.includes('discover') || txt.includes('view') || txt.includes('collection') ||
                        txt.includes('get') || txt.includes('order') || txt.includes('book') ||
                        txt.includes('learn') || txt.includes('start') || txt.includes('jewelry') ||
                        txt.includes('ring') || txt.includes('necklace') || txt.includes('bracelet')
                    );
                })
                .slice(0, 10)
                .map(el => ({
                    tag: el.tagName,
                    text: el.innerText?.trim().slice(0, 80),
                    href: el.getAttribute('href'),
                    visible_above_fold: getVisible(el),
                    rect: (() => {
                        const r = el.getBoundingClientRect();
                        return { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) };
                    })()
                }));

            // Navigation
            const navEl = document.querySelector('nav, [role="navigation"], header');
            const navLinks = navEl ? [...navEl.querySelectorAll('a')].slice(0, 10).map(a => ({
                text: a.innerText?.trim(),
                href: a.getAttribute('href'),
                visible: getVisible(a)
            })) : [];

            // Images without alt text
            const allImgs = [...document.querySelectorAll('img')];
            const imgsNoAlt = allImgs.filter(img => !img.alt || img.alt.trim() === '').map(img => ({
                src: img.src?.slice(0, 100),
                width: img.naturalWidth,
                height: img.naturalHeight
            }));
            const imgsWithAlt = allImgs.filter(img => img.alt && img.alt.trim() !== '').length;

            // Hero section
            const hero = document.querySelector('[class*="hero"], [class*="banner"], [class*="Hero"], [class*="Banner"], section:first-of-type, .homepage-hero');
            const heroInfo = hero ? {
                tag: hero.tagName,
                className: hero.className?.slice(0, 80),
                text: hero.innerText?.trim().slice(0, 300),
                hasImage: !!hero.querySelector('img'),
                visible: getVisible(hero)
            } : null;

            // Check for horizontal overflow (CLS / layout issues)
            const bodyWidth = document.body.scrollWidth;
            const viewportWidth = window.innerWidth;
            const hasHorizontalScroll = bodyWidth > viewportWidth;

            // Font sizes of key text elements
            const bodyFont = window.getComputedStyle(document.body).fontSize;
            const h1Font = h1Els.length > 0 ? window.getComputedStyle(h1Els[0]).fontSize : null;

            // Page title and meta
            const title = document.title;
            const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
            const metaViewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content');
            const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');

            // Check touch targets (mobile)
            const smallTouchTargets = [...document.querySelectorAll('a, button')]
                .filter(el => {
                    const r = el.getBoundingClientRect();
                    return getVisible(el) && (r.width < 48 || r.height < 48) && el.innerText?.trim();
                })
                .slice(0, 8)
                .map(el => ({
                    tag: el.tagName,
                    text: el.innerText?.trim().slice(0, 50),
                    width: Math.round(el.getBoundingClientRect().width),
                    height: Math.round(el.getBoundingClientRect().height)
                }));

            // Structured data
            const ldJson = [...document.querySelectorAll('script[type="application/ld+json"]')]
                .map(s => { try { return JSON.parse(s.textContent); } catch(e) { return null; } })
                .filter(Boolean);

            return {
                title,
                metaDesc,
                metaViewport,
                canonical,
                h1s,
                h2s,
                ctas,
                navLinks,
                heroInfo,
                imgsNoAlt,
                imgsNoAltCount: imgsNoAlt.length,
                totalImgs: allImgs.length,
                imgsWithAlt,
                hasHorizontalScroll,
                bodyScrollWidth: bodyWidth,
                viewportWidth,
                bodyFont,
                h1Font,
                smallTouchTargets,
                smallTouchTargetCount: smallTouchTargets.length,
                ldJson,
                ldJsonCount: ldJson.length
            };
        }""")

        results[vp_name] = data
        print(f"  Title: {data.get('title', 'N/A')}")
        print(f"  H1s found: {len(data.get('h1s', []))}")
        print(f"  Horizontal scroll: {data.get('hasHorizontalScroll')}")
        print(f"  Images without alt: {data.get('imgsNoAltCount', 0)} / {data.get('totalImgs', 0)}")
        print(f"  Small touch targets: {data.get('smallTouchTargetCount', 0)}")

        browser.close()

# Save full analysis data
report_path = os.path.join(OUTPUT_DIR, "analysis_data.json")
with open(report_path, "w") as f:
    json.dump(results, f, indent=2, default=str)

print(f"\n\nFull data saved to: {report_path}")
print("DONE")
