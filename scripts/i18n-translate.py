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

LANG_NAMES = {"ru": "Russian", "de": "German", "fr": "French", "es": "Spanish (neutral, international)", "it": "Italian", "pt": "Portuguese (Brazilian)",
              "tr": "Turkish", "ar": "Arabic (Modern Standard)", "zh": "Simplified Chinese", "ja": "Japanese",
              "ko": "Korean", "id": "Indonesian", "hi": "Hindi", "ka": "Georgian"}
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

DEFAULT_GLOSSARY = ("Use the standard terms of luxury jewelry retail in this language for: Baltic amber, 925 sterling "
                    "silver, Rings, Earrings, Pendants, Bracelets, Chains, Collections, Journal, Wholesale, Our Story, "
                    "handmade; 'designed in Bali, crafted by our artisans' must keep both facts. Polite formal address.")

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
- Keep EVERY number from the source as digits (925, 18k, 92.5%, 30 seconds, 14th century -> digits, not words or
  Roman numerals); never drop a number.
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


NUM = re.compile(r"\d{1,3}(?:[ ,.\u00a0\u202f\u2009]\d{3})+(?!\d)|\d+(?:[.,]\d+)?")


def numbers(s: str) -> list[str]:
    """Digit runs with separators removed: '10,000' == '10 000', '92.5' -> '925'."""
    return sorted(re.sub(r"\D", "", m) for m in NUM.findall(PH.sub(" ", s)))


def valid(src: str, dst: object) -> bool:
    if not (isinstance(dst, str) and dst.strip()):
        return False
    if sorted(PH.findall(src)) != sorted(PH.findall(dst)):
        return False
    have = numbers(dst)
    # CJK myriads: 4000万 = 40 million, 1万 = 10,000 (zh 万/萬, ja 万, ko 만)
    for m in re.finditer(r"(\d+(?:[.,]\d+)?)\s*(?:万|萬|만)", PH.sub(" ", dst)):
        x = float(m.group(1).replace(",", "."))
        have += [str(int(x * 10000)), str(int(x / 100)) if x % 100 == 0 else ""]
    return all(n in have for n in numbers(src))


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
    prompt = PROMPT.format(lang_name=LANG_NAMES[lang], glossary=GLOSSARY.get(lang, DEFAULT_GLOSSARY), payload=payload)
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


REVIEW_PROMPT = """You are a native {lang_name} copy editor proofreading the website of AMBERRA, a luxury handmade
jewelry brand (natural Baltic amber in 925 sterling silver; "designed in Bali, crafted by our artisans").
For each pair, compare the English source with the {lang_name} translation. Flag ONLY real problems:
wrong meaning, omitted or added facts, grammar/spelling/agreement errors, wrong or inconsistent terminology
(glossary: {glossary}), untranslated English words that should be translated, unnatural machine-like phrasing,
wrong register. Product and collection names stay in English by design — not an error.
Placeholders <0>, </0>, <3/> must stay exactly as in the source.
Return ONLY a JSON object id → corrected full translation, containing ONLY the ids you changed
(empty object {{}} if all are good). No commentary, no code fences.

{payload}
"""
REVIEW_LOG = I18N / "review-log.jsonl"


def review_batch(lang: str, keys: list[str], out_path: Path, idx: int, total: int) -> int:
    d = load(out_path)
    pairs = {str(i): {"en": k, "tr": d[k]} for i, k in enumerate(keys)}
    prompt = REVIEW_PROMPT.format(lang_name=LANG_NAMES[lang], glossary=GLOSSARY.get(lang, DEFAULT_GLOSSARY),
                                  payload=json.dumps(pairs, ensure_ascii=False, indent=0))
    try:
        res = parse_json(call_claude(prompt))
    except subprocess.TimeoutExpired:
        res = {}
    fixed = {}
    for i, k in enumerate(keys):
        v = res.get(str(i))
        if v and v != d[k] and valid(k, v):
            fixed[k] = v
    with lock:
        cur = load(out_path)
        cur.update(fixed)
        out_path.write_text(json.dumps(cur, ensure_ascii=False, indent=1, sort_keys=True), "utf-8")
        with REVIEW_LOG.open("a", encoding="utf-8") as log:
            for k, v in fixed.items():
                log.write(json.dumps({"lang": lang, "en": k, "old": d[k], "new": v}, ensure_ascii=False) + "\n")
    print(f"[{lang}] review {idx}/{total}: fixed {len(fixed)}/{len(keys)}", flush=True)
    return len(fixed)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("lang", choices=sorted(LANG_NAMES))
    ap.add_argument("--threads", type=int, default=2)
    ap.add_argument("--review", action="store_true", help="second pass: native editor fixes real errors only")
    a = ap.parse_args()
    src = load(I18N / "source.json")
    out_path = I18N / f"{a.lang}.json"
    if a.review:
        d = load(out_path)
        keys = [k for k in src if valid(k, d.get(k))]
        bs = batches(keys)
        with ThreadPoolExecutor(a.threads) as ex:
            n = sum(ex.map(lambda t: review_batch(a.lang, t[1], out_path, t[0] + 1, len(bs)), enumerate(bs)))
        print(f"[{a.lang}] review done: {n} fixes", flush=True)
        return 0
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
