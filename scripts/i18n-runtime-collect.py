#!/usr/bin/env python3
"""Collect strings rendered by JS (cards, drawer, cart, modals) on EN pages into
data/i18n/runtime-strings.json so build-i18n extract adds them to the source.
Needs a local static server: python3 -m http.server 8791 --bind 127.0.0.1"""
from __future__ import annotations

import json
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
BASE = "http://127.0.0.1:8791"
PAGES = ["/index.html", "/shop.html", "/rings.html", "/products/amber-blossom-ring.html", "/journal.html",
         "/wholesale.html", "/contact.html", "/our-story.html", "/stores.html", "/tryon.html", "/services.html"]
ACTIONS = ["typeof openDrawer==='function'&&openDrawer(1)", "typeof closeDrawer==='function'&&closeDrawer()",
           "typeof openCart==='function'&&openCart()", "typeof closeCart==='function'&&closeCart()",
           "typeof openReq==='function'&&openReq('Ring')", "typeof openSrv==='function'&&openSrv()",
           "typeof addToCart==='function'&&addToCart(1)", "typeof openCart==='function'&&openCart()"]
COLLECT = """() => { const out = new Set(); const c = window.AmbI18nCore;
  c.walk(document.body, (el, s) => out.add(s.key), n => out.add(c.norm(c.textOf(n)).trim()));
  document.querySelectorAll('[title],[alt],[placeholder],[aria-label]').forEach(el => c.ATTRS.forEach(a => {
    const v = el.getAttribute(a); if (v && c.translatable(v)) out.add(c.norm(v).trim()); }));
  return [...out]; }"""


def main() -> None:
    core = (ROOT / "i18n-core.js").read_text("utf-8")
    found: set[str] = set()
    with sync_playwright() as p:
        b = p.chromium.launch()
        for url in PAGES:
            pg = b.new_page(viewport={"width": 1440, "height": 900})
            pg.add_init_script("localStorage.setItem('amb_lang','en')")
            pg.goto(BASE + url, wait_until="load", timeout=40000)
            pg.wait_for_timeout(2500)
            pg.add_script_tag(content=core)
            found.update(pg.evaluate(COLLECT))
            for act in ACTIONS:
                try:
                    pg.evaluate(f"() => {{ try {{ {act} }} catch (e) {{}} }}")
                    pg.wait_for_timeout(500)
                    found.update(pg.evaluate(COLLECT))
                except Exception:
                    pass
            pg.close()
        b.close()
    src = json.loads((ROOT / "data/i18n/source.json").read_text("utf-8"))
    new = sorted(k for k in found if k and k not in src)
    (ROOT / "data/i18n/runtime-strings.json").write_text(json.dumps(new, ensure_ascii=False, indent=1), "utf-8")
    print(f"runtime strings: {len(found)} seen, {len(new)} new")


if __name__ == "__main__":
    main()
