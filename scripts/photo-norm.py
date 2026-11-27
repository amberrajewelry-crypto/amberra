#!/usr/bin/env python3
"""Product photo -> site style: ISNet cutout, 80% longest side, weight scale, 1000px transparent webp.

Usage: python3 scripts/photo-norm.py images/rings/new.webp [...]
Writes <name>-m.webp next to each source and adds it to data/img-norm.json (generators + api pick it up).
Needs: pip install onnxruntime pillow numpy; model ~/.u2net/isnet-general-use.onnx (rembg's ISNet).
New filenames are mandatory: /images/* is served immutable for a year.
"""
import json, os, sys
import numpy as np, onnxruntime as ort
from PIL import Image

CANVAS, FILL = 1000, 0.80                    # longest side of the piece = 80% of the square
REF_COV, GAMMA, K_MIN = 0.12, 0.2, 0.72      # dense pieces shrink: k=(0.12/coverage)^0.2, floor 0.72
MODEL = os.path.expanduser('~/.u2net/isnet-general-use.onnx')
LIST = 'data/img-norm.json'
_sess = None


def isnet_mask(rgb: Image.Image) -> Image.Image:
    global _sess
    _sess = _sess or ort.InferenceSession(MODEL)
    x = np.asarray(rgb.resize((1024, 1024), Image.LANCZOS)).astype(np.float32)
    x = (x / max(x.max(), 1e-6) - 0.5).transpose(2, 0, 1)[None]
    p = _sess.run(None, {'input_image': x})[0][0, 0]
    p = (p - p.min()) / (p.max() - p.min() + 1e-8)
    return Image.fromarray((p * 255).astype(np.uint8)).resize(rgb.size, Image.LANCZOS)


def normalize(src: str) -> Image.Image:
    im = Image.open(src).convert('RGBA')
    flat = Image.alpha_composite(Image.new('RGBA', im.size, (255, 255, 255, 255)), im).convert('RGB')
    # intersect with existing alpha: a pre-cut photo only loses leftovers, never gains background
    a = np.minimum(np.asarray(im.getchannel('A')), np.asarray(isnet_mask(flat)))
    im.putalpha(Image.fromarray(a))
    ys, xs = np.where(a > 60)
    sub = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    s = CANVAS * FILL / max(sub.size)
    sub = sub.resize((max(1, round(sub.width * s)), max(1, round(sub.height * s))), Image.LANCZOS)
    c = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
    c.paste(sub, ((CANVAS - sub.width) // 2, (CANVAS - sub.height) // 2), sub)
    cov = (np.asarray(c.getchannel('A')) > 60).mean()
    k = max(K_MIN, min(1.0, (REF_COV / cov) ** GAMMA))
    if k < 1:
        t = c.resize((round(CANVAS * k),) * 2, Image.LANCZOS)
        c = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
        c.paste(t, ((CANVAS - t.width) // 2,) * 2, t)
    return c


def main(paths: list[str]) -> None:
    done = set(json.load(open(LIST)))
    for src in paths:
        base = os.path.splitext(src)[0]
        normalize(src).save(base + '-m.webp', 'WEBP', quality=86, method=4)
        done.add(base + '.webp')
        print('ok', base + '-m.webp')
    json.dump(sorted(done), open(LIST, 'w'), indent=0)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
