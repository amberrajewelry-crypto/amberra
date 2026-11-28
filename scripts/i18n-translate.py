#!/usr/bin/env python3
"""Fill translation memory data/i18n/<lang>.json for every key in source.json.

Usage: python3 scripts/i18n-translate.py ru [--threads 2]
Uses the local `claude -p` (subscription), never a paid API. Only missing or
invalid keys are sent; results are validated (same <n> placeholders) and merged.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tempfile
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / "data" / "i18n"
BATCH_WORDS = 1500
BATCH_ITEMS = 110
CALL_TIMEOUT_S = 900
MAX_ROUNDS = 3
PH = re.compile(r"</?\d+/?>")

LANG_NAMES = {"ru": "Russian", "de": "German", "fr": "French", "es": "Spanish (neutral, international)"}
GLOSSARY = {
    "ru": "Baltic amber=балтийский янтарь; 925 sterling silver=серебро 925 пробы; Rings=Кольца; "
          "Earrings=Серьги; Pendants=Подвески; Bracelets=Браслеты; Chains=Цепочки; Collections=Коллекции; "
          "Journal=Журнал; Wholesale=Оптовикам; Our Story=О нас; handmade=ручной работы; "
          "designed in Bali, crafted by our artisans=дизайн создан на Бали, изготовлено нашими мастерами. "
          "Address the customer with «вы» (lowercase).",
    "de": "Baltic amber=Baltischer Bernstein; 925 sterling silver=925er Sterlingsilber; Rings=Ringe; "
          "Earrings=Ohrringe; Pendants=Anhänger; Bracelets=Armbänder; Chains=Ketten; Journal=Journal; "
          "Wholesale=Großhandel; Our Story=Unsere Geschichte; handmade=handgefertigt; "
          "designed in Bali, crafted by our artisans=entworfen auf Bali, gefertigt von unseren Kunsthandwerkern. "
          "Address the customer with «Sie».",
    "fr": "Baltic amber=ambre de la Baltique; 925 sterling silver=argent sterling 925; Rings=Bagues; "
          "Earrings=Boucles d'oreilles; Pendants=Pendentifs; Bracelets=Bracelets; Chains=Chaînes; "
          "Journal=Journal; Wholesale=Vente en gros; Our Story=Notre histoire; handmade=fait main; "
          "designed in Bali, crafted by our artisans=conçu à Bali, façonné par nos artisans. Use «vous».",
    "es": "Baltic amber=ámbar báltico; 925 sterling silver=plata de ley 925; Rings=Anillos; "
          "Earrings=Pendientes; Pendants=Colgantes; Bracelets=Pulseras; Chains=Cadenas; Journal=Revista; "
          "Wholesale=Venta mayorista; Our Story=Nuestra historia; handmade=hecho a mano; "
          "designed in Bali, crafted by our artisans=diseñado en Bali, elaborado por nuestros artesanos. Use «tú».",
}

PROMPT = """You are the senior localization editor of AMBERRA, a luxury handmade jewelry brand
(natural Baltic amber set in 925 sterling silver; "designed in Bali, crafted by our artisans").
Translate each English UI/marketing string into {lang_name}. Tone: refined, calm, luxury (like Bulgari/Cartier
sites), natural native phrasing, never literal machine style. Fix nothing factual; add nothing.

Hard rules:
- Placeholders like <0>, </0>, <3/> are markup. Keep EVERY placeholder exactly once, same numbers, properly
  nested; move them only if word order requires. Never add new ones.
- Keep unchanged: the brand AMBERRA, names of specific pieces and collections (e.g. "Amber Blossom Ring",
  "Solar", "Botanica", "Sacred"), emails, URLs, @handles, prices, currency codes, size codes (US 7, EU 54),
  SKU-like codes, WhatsApp, Instagram.
- Keep capitalization style (ALL CAPS stays caps; Title Case navigation becomes the target language's normal
  menu casing).
- Glossary (use consistently): {glossary}

Input: JSON object id → English. Output: ONLY a JSON object id → translation, same ids, no commentary,
no code fences.

{payload}
"""

lock = threading.Lock()


def load(p: Path) -> dict:
    return json.loads(p.read_text("utf-8")) if p.exists() else {}


def valid(src: str, dst: object) -> bool:
    return isinstance(dst, str) and bool(dst.strip()) and sorted(PH.findall(src)) == sorted(PH.findall(dst))


def batches(keys: list[str]) -> list[list[str]]:
    out, cur, words = [], [], 0
    for k in keys:
        w = len(k.split())
        if cur and (words + w > BATCH_WORDS or len(cur) >= BATCH_ITEMS):
            out.append(cur)
            cur, words = [], 0
        cur.append(k)
        words += w
    if cur:
        out.append(cur)
    return out


def call_claude(prompt: str) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        r = subprocess.run(
            ["claude", "-p", "--output-format", "text", "--allowedTools", ""],
            input=prompt, capture_output=True, text=True, timeout=CALL_TIMEOUT_S, cwd=tmp,
        )
    return r.stdout


def parse_json(text: str) -> dict:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text)
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end < 0:
        return {}
    try:
        return json.loads(text[start:end + 1])
    except json.JSONDecodeError:
        return {}


def run_batch(lang: str, keys: list[str], out_path: Path, idx: int, total: int) -> int:
    payload = json.dumps({str(i): k for i, k in enumerate(keys)}, ensure_ascii=False, indent=0)
    prompt = PROMPT.format(lang_name=LANG_NAMES[lang], glossary=GLOSSARY[lang], payload=payload)
    try:
        res = parse_json(call_claude(prompt))
    except subprocess.TimeoutExpired:
        res = {}
    good = {k: res.get(str(i)) for i, k in enumerate(keys) if valid(k, res.get(str(i)))}
    with lock:
        d = load(out_path)
        d.update(good)
        out_path.write_text(json.dumps(d, ensure_ascii=False, indent=1, sort_keys=True), "utf-8")
    print(f"[{lang}] batch {idx}/{total}: {len(good)}/{len(keys)}", flush=True)
    return len(good)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("lang", choices=sorted(LANG_NAMES))
    ap.add_argument("--threads", type=int, default=2)
    a = ap.parse_args()
    src = load(I18N / "source.json")
    out_path = I18N / f"{a.lang}.json"
    for rnd in range(1, MAX_ROUNDS + 1):
        d = load(out_path)
        todo = [k for k in src if not valid(k, d.get(k))]
        if not todo:
            break
        bs = batches(todo)
        print(f"[{a.lang}] round {rnd}: {len(todo)} keys in {len(bs)} batches", flush=True)
        with ThreadPoolExecutor(a.threads) as ex:
            list(ex.map(lambda t: run_batch(a.lang, t[1], out_path, t[0] + 1, len(bs)), enumerate(bs)))
    d = load(out_path)
    left = [k for k in src if not valid(k, d.get(k))]
    print(f"[{a.lang}] done: {len(src) - len(left)}/{len(src)}", flush=True)
    return 0 if not left else 1


if __name__ == "__main__":
    sys.exit(main())
