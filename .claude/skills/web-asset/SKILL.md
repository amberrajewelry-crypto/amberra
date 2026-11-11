---
name: web-asset
description: How to prepare images and video for the Amberra site so they stream fast and never break. Background knowledge — apply automatically whenever adding, replacing, or optimizing any image or video asset on this project.
user-invocable: false
---

# Web asset discipline (Amberra)

Rules baked from real failures on this project. Follow them for every media asset.

## Video (About section, hero, etc.)
Web video MUST be encoded faststart (moov atom BEFORE mdat) or it won't progressively play —
symptom: poster/frame shows but video never starts and "eats bandwidth" (browser downloads the
whole file before frame 1).

```bash
ffmpeg -i in.mp4 -vf scale=1280:-2 -c:v libx264 -crf 23 -preset slow \
  -movflags +faststart -an -pix_fmt yuv420p out.mp4
```
- `-movflags +faststart` → moov first (streams immediately, HTTP 206 + accept-ranges)
- `-an` → drop audio if the `<video>` is `muted`
- `-crf 23` ~2–4 Mbps; scale to container. Gives ~3–4 MB instead of 20 MB.
- Verify atom order: `ffprobe -v trace -i out.mp4 2>&1 | grep -E "type:.(moov|mdat)"` — moov must come first.
- Always ship a `poster=` frame (`ffmpeg -ss N -frames:v 1`) + lazy-load via IntersectionObserver + retry `play()` on `canplay`/`loadeddata`.

## Images
Serve WebP with a safe fallback — never touch Airtable image URLs, rewrite at render time.
- `cwebp -q 82 in.jpg -o out.webp` (tool at `/opt/homebrew/bin/cwebp`).
- Local catalog images: use the `wsrc(p)` helper (rewrites `/images/*.jpg|png` → `.webp`) and `wimg(el,src)`
  for `.src=` assignments — both already in `app.js` and `shop.js`, with `onerror` fallback to the original.
- **Exception:** `og:image` / `twitter:image` stay JPG/PNG — social/messenger crawlers don't reliably render WebP previews.

## Cache-buster (critical)
Any asset change (image swap counts if referenced with `?v=`, and every css/js edit) requires bumping
`?v=` across ALL html or returning visitors see stale content. Use `node scripts/cache-bust.mjs`
then `node scripts/predeploy-check.js` to confirm no version desync remains.

## Screenshots of the homepage
`#fluid-canvas` runs an animated WebGL background — Page.captureScreenshot HANGS on it. To audit
visuals, stop `requestAnimationFrame` first or use programmatic computed-style checks via
`evaluate_script` instead of screenshots.
