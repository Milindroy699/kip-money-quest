"""
Cuts the card and trophy art (docs/prompts/cards-and-trophies.md) into app assets, and writes the
registries src/art/cards.ts and src/art/trophies.ts.

  python3 scripts/process_collectibles.py        (needs numpy, scipy, Pillow)

- Cards:    design/source-art/cards/card_<id>.jpg      -> assets/cards/<id>.webp     (CARD_ART)
- Trophies: design/source-art/trophies/trophy_<id>.jpg -> assets/trophies/<id>.webp  (TROPHY_ART)
- Backdrop: design/source-art/cards/bg_trophy_room.jpg -> assets/backgrounds/bg_trophy_room.jpg
Everything is keyed off magenta with scripts/keying.py; the corner sparkle is removed and any magenta
tint left on the art (reflections, glass) is neutralised.
"""
import os

import numpy as np
from PIL import Image

from keying import drop_specks, erase_sparkle, key_magenta

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = f"{ROOT}/design/source-art"
OUT = f"{ROOT}/assets"

# A few trophy files came out showing a different trophy than their name; this maps each trophy to
# the file that actually shows it. Trophies without a matching picture keep their emoji.
TROPHY_FILES = {
    "first-lesson": "trophy_first-lesson",
    "money-town": "trophy_fort1",  # bronze gate arch
    "snowball": "trophy_snowball",
    "bazaar": "trophy_melt",  # silver market stall
    "fort": "trophy_fort",
    "launch": "trophy_launch",
    "streak-3": "trophy_risk",  # bronze flame
    "streak-7": "trophy_streak-7",
    "streak-30": "trophy_streak-30",
    "perfect-5": "trophy_bazaar",  # five silver stars in an arc
    "boss": "trophy_streak-3",  # silver crown
    "boss-5": "trophy_boss-5",
    "cards-5": "trophy_cards-5",
    "cards-12": "trophy_cards-12",
    "cards-all": "trophy_cards-all",
    "finiq-saver": "trophy_finiq-saver",
    "finiq-investor": "trophy_finiq-investor",
    "finiq-compounder": "trophy_finiq-compounder",
    "run-1": "trophy_run-1",
    "run-25": "trophy_run-25",
    "dividend": "trophy_dividend",
    "invest": "trophy_invest",
    "duel-1": "trophy_duel-1",
    "duel-10": "trophy_duel-10",
}
# Made later as _v2 files (trophy_melt and trophy_risk are in use above as other trophies).
for _tid in ("melt", "risk"):
    if os.path.exists(f"{SRC}/trophies/trophy_{_tid}_v2.jpg"):
        TROPHY_FILES[_tid] = f"trophy_{_tid}_v2"


def cut(path, maxdim):
    a = np.asarray(Image.open(path).convert("RGB")).astype(np.float32)
    F, alpha = key_magenta(erase_sparkle(a), glow=True)
    alpha = drop_specks(alpha, min_area=3000, keep_near=24)
    # None of this art is pink by design, so any magenta tint is backdrop light bouncing off a plinth or
    # showing through glass (the magnifier lens, the hourglass): pull it back to neutral.
    excess = np.clip(np.minimum(F[..., 0], F[..., 2]) - F[..., 1], 0, None)[..., None]
    F = F.copy()
    F[..., [0, 2]] -= excess * 0.9
    img = Image.fromarray(np.dstack([np.clip(F, 0, 255), alpha * 255]).astype(np.uint8), "RGBA")
    ys, xs = np.where(np.asarray(img)[:, :, 3] > 8)
    img = img.crop((max(xs.min() - 4, 0), max(ys.min() - 4, 0), min(xs.max() + 5, img.width), min(ys.max() + 5, img.height)))
    s = min(1, maxdim / max(img.size))
    if s < 1:
        img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    return img


def save(img, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "WEBP", quality=84, method=6)


def main():
    cards = sorted(f[5:-4] for f in os.listdir(f"{SRC}/cards") if f.startswith("card_") and f.endswith(".jpg"))
    for cid in cards:
        save(cut(f"{SRC}/cards/card_{cid}.jpg", 360), f"{OUT}/cards/{cid}.webp")
    print("cards:", len(cards))
    for tid, name in TROPHY_FILES.items():
        save(cut(f"{SRC}/trophies/{name}.jpg", 220), f"{OUT}/trophies/{tid}.webp")
    print("trophies:", len(TROPHY_FILES))
    bg = f"{SRC}/cards/bg_trophy_room.jpg"
    if os.path.exists(bg):
        a = np.asarray(Image.open(bg).convert("RGB")).astype(np.float32)
        Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(f"{OUT}/backgrounds/bg_trophy_room.jpg", "JPEG", quality=80, optimize=True, progressive=True)
        print("backdrop: bg_trophy_room.jpg")

    lines = [
        "/**",
        " * Card illustrations, by card id. Cut from design/source-art/cards by scripts/process_collectibles.py",
        " * (prompts: docs/prompts/cards-and-trophies.md). Generated file; a card without art shows its emoji.",
        " */",
        "export const CARD_ART: Partial<Record<string, number>> = {",
    ]
    lines += [f"  {cid}: require('../../assets/cards/{cid}.webp')," for cid in cards]
    lines += ["};", ""]
    open(f"{ROOT}/src/art/cards.ts", "w").write("\n".join(lines))
    lines = [
        "/**",
        " * Trophy figurines for the Trophy Room, by achievement id. Cut from design/source-art/trophies by",
        " * scripts/process_collectibles.py. Generated file; a trophy without art shows its emoji.",
        " */",
        "export const TROPHY_ART: Partial<Record<string, number>> = {",
    ]
    lines += [f"  '{tid}': require('../../assets/trophies/{tid}.webp')," for tid in TROPHY_FILES]
    lines += ["};", ""]
    open(f"{ROOT}/src/art/trophies.ts", "w").write("\n".join(lines))
    kb = sum(os.path.getsize(os.path.join(d, f)) for sub in ("cards", "trophies") for d, _, fs in os.walk(f"{OUT}/{sub}") for f in fs) // 1024
    print(f"wrote src/art/cards.ts and src/art/trophies.ts ({kb} KB of art)")


if __name__ == "__main__":
    main()
