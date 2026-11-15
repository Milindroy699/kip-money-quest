"""
Turns the campus / Quest Island art in design/source-art/Campus into app assets, and writes the
registry src/campus/sprites.ts.

  python3 scripts/process_campus.py          (needs numpy, scipy, Pillow)
  ONLY=deco,badges python3 scripts/process_campus.py              # just some parts
  ONLY=buildings PLACES=w1,w9 python3 scripts/process_campus.py   # just some buildings
  ONLY=registry python3 scripts/process_campus.py                 # only rewrite src/campus/sprites.ts

- Buildings (B1): keyed off magenta, trimmed, saved as assets/campus/<look>/<place>[_locked].webp.
  A missing _locked version is made from the open one (faded and greyed).
- Decorations (B3): each 2×3 sheet is split into six sprites.
- Hero badges (A6), ground tiles (B2, made seamless) and the two Home backdrops (A5). The backdrops
  go to assets/backgrounds and are registered by hand in src/art/index.ts (homeCampus, homeIsland).
- The Gemini / Veo sparkle in the bottom-right corner is removed everywhere.
Kip's map walks (B4) are cut by scripts/process_anims.py.
"""
import os

import numpy as np
from PIL import Image
from scipy import ndimage

from keying import drop_specks, erase_sparkle, key_magenta

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = f"{ROOT}/design/source-art/Campus"
OUT = f"{ROOT}/assets/campus"

PLACES = ["gate", "w1", "w2", "w3", "w4", "w5", "w6", "w7", "w8", "w9", "track", "library", "bank", "lab", "arena"]
FILES = {
    "campus": {
        "gate": "campus_gate", "w1": "campus_w1_melt_lab", "w2": "campus_w2_snow_dome", "w3": "campus_w3_climbing_wall",
        "w4": "campus_w4_bazaar", "w5": "campus_w5_fort_hall", "w6": "campus_w6_debate_hall", "w7": "campus_w7_clock_tower",
        "w8": "campus_w8_analyst_hq", "w9": "campus_w9_convocation",
    },
    "island": {
        "gate": "island_gate", "w1": "island_w1_melt_marsh", "w2": "island_w2_snowball_peak", "w3": "island_w3_risk_ridge",
        "w4": "island_w4_harbour", "w5": "island_w5_fort_rock", "w6": "island_w6_doors_cave", "w7": "island_w7_clock_falls",
        "w8": "island_w8_observatory", "w9": "island_w9_lighthouse",
    },
}
for look in FILES:
    for spot in ["track", "library", "bank", "lab", "arena"]:
        FILES[look][spot] = f"{look}_spot_{spot}"
GLOW = {"island_spot_track", "island_spot_arena", "island_w9_lighthouse"}  # a pink lens glow, or the lamp's halo

DECO = {
    "campus": ("deco_campus_sheet", ["neem", "gulmohar", "banyan"], ["lamp", "bench", "chai"]),
    "island": ("deco_island_sheet", ["palm", "palms", "rock"], ["sign", "bridge", "campfire"]),
}
BADGES = {"campus": "hero_badge_campus", "island": "Kip_badge1"}
TILES = ["tile_campus_lawn", "tile_campus_path", "tile_island_grass", "tile_island_sand", "tile_island_water"]
# Market_style is the campus Home backdrop (town, then the road up to the gate); bg_home_campus.jpg came out as an island scene.
HOMES = {"bg_home_campus": "Market_style", "bg_home_island": "bg_home_island"}

BUILDING_PX = 440  # longest side; a building is about a third of the screen width on the map
DECO_PX = 240
BADGE_PX = 240


def load(name):
    return np.asarray(Image.open(f"{SRC}/{name}.jpg").convert("RGB")).astype(np.float32)


def remove_sparkle(a):
    """Clones over the little four-point sparkle in the bottom-right corner."""
    h, w = a.shape[:2]
    L = a.mean(axis=2)
    diff = ndimage.gaussian_filter(L - ndimage.gaussian_filter(L, 10), 3)
    y0, x0 = int(h * 0.82), int(w * 0.8)
    region = diff[y0:, x0:]
    cy, cx = np.unravel_index(np.argmax(region), region.shape)
    cy, cx = cy + y0, cx + x0
    r = max(18, round(min(h, w) * 0.03))
    out = a.copy()
    ys, xs = slice(max(cy - r, 0), min(cy + r, h)), slice(max(cx - r, 0), min(cx + r, w))
    src = a[ys, slice(xs.start - 3 * r, xs.stop - 3 * r)]
    yy, xx = np.mgrid[ys, xs]
    wgt = np.clip(1.4 - np.hypot(yy - cy, xx - cx) / r, 0, 1)[..., None]
    out[ys, xs] = src * wgt + a[ys, xs] * (1 - wgt)
    return out


def rgba(F, alpha):
    return Image.fromarray(np.dstack([np.clip(F, 0, 255), alpha * 255]).astype(np.uint8), "RGBA")


def trim(img, pad=4):
    a = np.asarray(img)[:, :, 3]
    ys, xs = np.where(a > 8)
    return img.crop((max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad + 1, img.width), min(ys.max() + pad + 1, img.height)))


def save(img, path, maxdim):
    img = trim(img)
    s = min(1, maxdim / max(img.size))
    if s < 1:
        img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "WEBP", quality=84, method=6)
    return img.size


def faded(img):
    """Stand-in for a missing 'under construction' sprite: mostly grey, a little darker."""
    a = np.asarray(img).astype(np.float32)
    grey = a[..., :3] @ np.array([0.3, 0.59, 0.11], np.float32)
    rgb = a[..., :3] * 0.25 + grey[..., None] * 0.75
    rgb = rgb * 0.85 + np.array([20, 18, 30], np.float32) * 0.15
    return Image.fromarray(np.dstack([rgb, a[..., 3]]).astype(np.uint8), "RGBA")


def cut(name):
    F, alpha = key_magenta(load(name), glow=any(name.startswith(g) for g in GLOW))
    return rgba(F, drop_specks(alpha, min_area=6000, keep_near=10))


def seamless(a, band=0.16):
    """Cross-fades the tile with a copy of itself shifted by half, so its edges wrap."""
    h, w = a.shape[:2]
    rolled = np.roll(np.roll(a, h // 2, 0), w // 2, 1)
    dy = np.minimum(np.arange(h), h - 1 - np.arange(h)) / h
    dx = np.minimum(np.arange(w), w - 1 - np.arange(w)) / w
    t = np.clip((np.minimum(dy[:, None], dx[None, :]) - 0.02) / band, 0, 1)
    t = (t * t * (3 - 2 * t))[..., None]
    return a * t + rolled * (1 - t)


def sheet_parts(name, top_names, bottom_names):
    F, alpha = key_magenta(erase_sparkle(load(name)))
    lab, n = ndimage.label(alpha > 0.3)
    boxes = []
    for i, sl in enumerate(ndimage.find_objects(lab)):
        if (lab[sl] == i + 1).sum() > 8000:
            boxes.append((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop, i + 1))
    H = alpha.shape[0]
    top = sorted([b for b in boxes if (b[1] + b[3]) / 2 < H * 0.5], key=lambda b: b[0])
    bottom = sorted([b for b in boxes if (b[1] + b[3]) / 2 >= H * 0.5], key=lambda b: b[0])
    assert len(top) == len(top_names) and len(bottom) == len(bottom_names), (name, len(top), len(bottom))
    out = {}
    for names, row in ((top_names, top), (bottom_names, bottom)):
        for n_, (x0, y0, x1, y1, idx) in zip(names, row):
            near = ndimage.binary_dilation(lab == idx, iterations=4)
            a_ = np.where(near, alpha, 0)
            out[n_] = rgba(F, a_).crop((max(x0 - 6, 0), max(y0 - 6, 0), x1 + 6, y1 + 6))
    return out


def main():
    only = os.environ.get("ONLY", "buildings,deco,badges,tiles,homes").split(",")
    made_locked = []
    if "buildings" in only:
        for look, files in FILES.items():
            for place in PLACES:
                if os.environ.get("PLACES") and place not in os.environ["PLACES"].split(","):
                    continue
                name = files[place]
                img = cut(name)
                size = save(img, f"{OUT}/{look}/{place}.webp", BUILDING_PX)
                if os.path.exists(f"{SRC}/{name}_locked.jpg"):
                    locked = cut(f"{name}_locked")
                else:
                    locked = faded(img)
                    made_locked.append(name)
                save(locked, f"{OUT}/{look}/{place}_locked.webp", BUILDING_PX)
                print(f"{look:7s} {place:8s} {size}")
    if "deco" in only:
        for look, (name, top, bottom) in DECO.items():
            for part, img in sheet_parts(name, top, bottom).items():
                save(img, f"{OUT}/{look}/deco_{part}.webp", DECO_PX)
    if "badges" in only:
        for look, name in BADGES.items():
            F, alpha = key_magenta(load(name))
            save(rgba(F, drop_specks(alpha, 6000)), f"{OUT}/{look}/hero_badge.webp", BADGE_PX)
    if "tiles" in only:
        for name in TILES:
            a = seamless(remove_sparkle(load(name)))
            im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize((512, 512), Image.LANCZOS)
            im.save(f"{OUT}/{name}.jpg", "JPEG", quality=84, optimize=True, progressive=True)
    if "homes" in only:
        for out_name, name in HOMES.items():
            im = Image.fromarray(np.clip(remove_sparkle(load(name)), 0, 255).astype(np.uint8))
            im.save(f"{ROOT}/assets/backgrounds/{out_name}.jpg", "JPEG", quality=80, optimize=True, progressive=True)
    write_registry()
    if made_locked:
        print("no _locked art, made a faded one for:", ", ".join(made_locked))
    kb = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(OUT) for f in fs) // 1024
    print(f"assets/campus: {kb} KB")


def camel(s):
    a, *rest = s.split("_")
    return a + "".join(r.title() for r in rest)


def aspect(path):
    w, h = Image.open(path).size
    return w / h


def write_registry():
    L = [
        "/**",
        " * Campus and Quest Island art, cut from design/source-art/Campus.",
        " * Generated by scripts/process_campus.py — re-run it after changing the art; don't edit by hand.",
        " */",
        "export interface Sprite {",
        "  src: number;",
        "  /** Width ÷ height. */",
        "  aspect: number;",
        "}",
        "",
        "export const BUILDING_SPRITES = {",
    ]
    for look in FILES:
        L.append(f"  {look}: {{")
        for place in PLACES:
            for key in (place, f"{place}_locked"):
                L.append(f"    {key}: {{ src: require('../../assets/campus/{look}/{key}.webp'), aspect: {aspect(f'{OUT}/{look}/{key}.webp'):.3f} }},")
        L.append("  },")
    L += ["} satisfies Record<string, Record<string, Sprite>>;", "", "export const DECO_SPRITES = {"]
    for look, (_, top, bottom) in DECO.items():
        L.append(f"  {look}: {{")
        for key in top + bottom:
            L.append(f"    {key}: {{ src: require('../../assets/campus/{look}/deco_{key}.webp'), aspect: {aspect(f'{OUT}/{look}/deco_{key}.webp'):.3f} }},")
        L.append("  },")
    L += ["} satisfies Record<string, Record<string, Sprite>>;", "", "/** The raised centre button in the tab bar. */", "export const HERO_BADGES = {"]
    for look in BADGES:
        L.append(f"  {look}: require('../../assets/campus/{look}/hero_badge.webp'),")
    L += ["};", "", "/** Seamless ground tiles, 512 px. */", "export const GROUND_TILES = {"]
    for name in TILES:
        L.append(f"  {camel(name[5:])}: require('../../assets/campus/{name}.jpg'),")
    L += ["};", ""]
    with open(f"{ROOT}/src/campus/sprites.ts", "w") as f:
        f.write("\n".join(L))
    print("wrote src/campus/sprites.ts")


if __name__ == "__main__":
    main()
