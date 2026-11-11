---
name: audit-amberra
description: Run a strict quality audit of the Amberra site — readability/contrast, copy consistency (CTA + spelling), SEO completeness, cache-buster sync, webp coverage, and broken links. Use when the user wants to check the site, find problems, verify quality, or "довести до идеала".
---

# Audit Amberra (strict quality pass)

Systematic check across every page. Run the automated gate first, then the deeper manual/agent checks.

## 1. Automated gate (fast, run first)
```bash
node scripts/predeploy-check.mjs
```
Covers: cache-buster desync, dead CTAs, BE spelling, missing og:image/JSON-LD, broken asset links.

## 2. Readability & contrast (the fragile part)
The homepage uses a dark WebGL fluid bg (`.page-home` → light text); internal pages are white
(`body:not(.page-home)` → dark text). This two-context split has broken twice (white-on-white,
dark-on-dark). Screenshots HANG on the animated canvas — use computed contrast instead.

Spawn the **a11y-contrast-reviewer** subagent, or run computed-style checks via chrome-devtools
`evaluate_script` (never `take_screenshot` on the homepage). WCAG AA: 4.5 normal / 3.0 large text.

## 3. Copy consistency
Spawn the **copy-consistency-reviewer** subagent to sweep all 26 HTML + the two TR objects
(`app.js`, `amberra.js`, 15 languages each) for: CTA label drift, spelling (AE vs BE), product
naming taxonomy, and duplicated/contradictory microcopy.

## 4. Manual spot-checks
```bash
# CTA taxonomy (should be a small, disciplined set)
grep -rhoE '(Book an Appointment|Request (a|This) Piece|Become a Partner|Add to Cart)' *.html | sort | uniq -c
# webp coverage of content <img> (og:image excluded — stays jpg)
grep -rhoE '<img[^>]+src="[^"]+\.(jpg|jpeg|png)' *.html | wc -l
# SEO per page
for f in index shop journal our-story stores about catalog contact tryon; do
  printf "%-11s og:%s jsonld:%s\n" "$f" \
    "$(grep -c og:image "$f.html")" "$(grep -c 'ld+json' "$f.html")"; done
```

## 5. Report
Group findings P0 (breaks the site / hides work), P1 (SEO/quality gaps), P2 (polish).
Give the owner absolute numbers and the next concrete fix — no filler, no self-grading.
