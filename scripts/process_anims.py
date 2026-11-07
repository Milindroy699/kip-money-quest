"""
Cuts the green- and magenta-screen Veo character clips into app-ready sprite animations.

  python3 scripts/process_anims.py <scratch-dir>      (needs ffmpeg, numpy, scipy, Pillow)

For each clip in CLIPS: extract frames at full resolution, key out the green screen, keep the
character (plus nearby coins, drops and fog), crop every frame to one shared box so the character
doesn't jump, then write assets/characters/<name>/NN.webp and the registry src/art/anims.ts.

Three keyers:
- magenta (Kip's map walks): shared with the campus sprites, see scripts/keying.py.
- solid  (Dash): alpha from how green a pixel is relative to its brightness, so the floor shadow
  disappears too; green spill is clamped.
- fog    (The Melt): each pixel is unmixed as a*Lavender + (1-a)*Green, which recovers the
  semi-transparent wisps in their true colour instead of teal.
"""
import json
import os
import subprocess
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

from keying import erase_sparkle, key_magenta

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = f"{ROOT}/design/source-art/characters"
OUT = f"{ROOT}/assets/characters"
SCRATCH = sys.argv[1]

# Frame numbers are 0-based at the clip's 24 fps. "xfade" blends the last N output frames into the
# frames just before the loop start, hiding the seam. "fade" softens edges the character touches.
CLIPS = {
    "dash_run": dict(src="dash/Dash_run_loop.mp4", keyer="solid", frames=(18, 33, 1), height=360, loop=True, fps=24,
                     about="one full stride seen from behind (Kip Run cameo)"),
    "melt_chase": dict(src="the-melt/Melt_chase_loop.mp4", keyer="fog", frames=(2, 49, 2), width=480, loop=True, fps=12,
                       about="calm to tendrils-out; the runner picks frames by how close The Melt is"),
    "melt_talk": dict(src="the-melt/Melt_chuckling.mp4", keyer="fog", crop=(0, 240, 455, 580), frames=(18, 88, 2), xfade=3,
                      height=400, loop=True, fps=12, about="chuckling loop for lesson stories"),
    "melt_laugh": dict(src="the-melt/Melt_laugh_one_shot.mp4", keyer="fog", frames=(26, 96, 2), width=440, loop=False, fps=12,
                       fade=dict(edges=24), about="one-shot laugh, ends on a sleepy grin (caught screen)"),
    "dash_talk": dict(src="dash/Dash_talking.mp4", keyer="solid", frames=(38, 77, 2), height=420, loop=True, fps=12,
                      fade=dict(top=18, bottom=70), about="talking loop for lesson stories"),
    "dash_excited": dict(src="dash/Dash_excited.mp4", keyer="solid", frames=(11, 96, 2), height=420, loop=False, fps=12,
                         fade=dict(top=18, bottom=70), about="gasps at his phone, points (cheer)"),
    # Kip on the campus map (design/source-art/Campus). Veo framed the first ~3 s as a square
    # with black side bars, then zoomed in, so only that steady stretch is used.
    "kip_map_up": dict(pinkless=True, src="../Campus/kip_walk_up.mp4", keyer="magenta", crop=(284, 4, 994, 716), frames=(20, 44, 1), xfade=2,
                       height=240, loop=True, fps=24, about="walking away up the map, seen from behind (one stride)"),
    "kip_map_down": dict(pinkless=True, src="../Campus/kip_walk_down.mp4", keyer="magenta", crop=(284, 4, 994, 716), frames=(49, 70, 1), xfade=2,
                         height=240, loop=True, fps=24, about="walking down the map towards the camera, turned slightly right"),
    "kip_map_side": dict(pinkless=True, src="../Campus/kip_walk_side.mp4", keyer="magenta", crop=(284, 4, 994, 716), frames=(36, 59, 1), xfade=2,
                         height=240, loop=True, fps=24, about="walking right across the map (mirror for left)"),
    "kip_map_idle": dict(pinkless=True, src="../Campus/kip_map_idle.mp4", keyer="magenta", crop=(284, 4, 994, 716), frames=(12, 75, 2), xfade=2,
                         height=240, loop=True, fps=12, about="standing at a building: looks around, adjusts his glasses, waves"),
    # Ambient loops for the map. These clips widen out from a square over a few seconds; only the
    # stretch before dark edges creep in is used. The fountain also zooms slowly, so it's held steady.
    "fx_flag": dict(src="../Campus/fx_flag_flutter.mp4", keyer="magenta", crop=(284, 4, 994, 716), frames=(1, 23, 1), xfade=1,
                    height=160, loop=True, fps=24, about="campus pennant flag waving"),
    "fx_fountain": dict(src="../Campus/fx_fountain.mp4", keyer="magenta", crop=(284, 4, 994, 716), frames=(2, 26, 1), xfade=2,
                        steady=True, width=220, loop=True, fps=24, about="small sandstone fountain on a grass disc"),
    "fx_seagulls": dict(src="../Campus/fx_seagulls.mp4", keyer="magenta", crop=(284, 4, 994, 716), frames=(18, 68, 2), xfade=2,
                        reach=80, sparkle=False, width=240, loop=True, fps=12, about="two gulls circling (Quest Island sky)"),
    "dash_sheepish": dict(src="dash/Dash_Sheepish.mp4", keyer="solid", frames=(0, 96, 2), height=420, loop=False, fps=12,
                          fade=dict(top=18, bottom=70), about="ears droop, rubs his head (think)"),
    "dash_panicked": dict(src="dash/Dash_panicked.mp4", keyer="solid", frames=(1, 96, 2), height=420, loop=False, fps=12,
                          fade=dict(top=18, bottom=70), about="prices crash, frantic tapping (worry)"),
}

LAVENDER_D = -55.0  # G - (R+B)/2 of The Melt's body colour


def sparkle_box(w, h):
    """Veo's watermark sparkle, bottom-right of every frame."""
    sx, sy = w / 640, h / 360
    return int(545 * sx), int(270 * sy), int(625 * sx), int(335 * sy)


def greenness(a):
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    return (G - np.maximum(R, B)) / np.maximum(G, 1)


def key_solid(a, scale):
    g = greenness(a)
    alpha = np.clip((0.42 - g) / 0.24, 0, 1)
    out = a.copy()
    R, G, B = out[..., 0], out[..., 1], out[..., 2]
    out[..., 1] = np.minimum(G, np.maximum(np.maximum(R, B), G * alpha))
    solid = ndimage.binary_erosion(ndimage.binary_fill_holes(alpha > 0.5), iterations=max(1, round(3 * scale)))
    alpha = np.where(solid, 1.0, alpha)
    return out, alpha


def key_fog(a, scale):
    g = greenness(a)
    bgmask = g > 0.45
    Bg = np.median(a[bgmask], axis=0) if bgmask.sum() > 500 else np.array([20, 150, 70], np.float32)
    dB = Bg[1] - (Bg[0] + Bg[2]) / 2
    d = a[..., 1] - (a[..., 0] + a[..., 2]) / 2
    alpha = np.clip((dB - d) / (dB - LAVENDER_D), 0, 1)
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    gold = (R > G) & (G > B) & (R - B > 60)  # coins stay solid
    alpha = np.where(gold, np.maximum(alpha, np.clip((0.42 - g) / 0.24, 0, 1)), alpha)
    core = alpha > 0.85
    # Fill only holes that aren't background (eyes, teeth); gaps between tendrils stay see-through.
    solid = ndimage.binary_erosion(core | (ndimage.binary_fill_holes(core) & (d < 8)), iterations=max(1, round(2 * scale)))
    alpha = np.where(solid, 1.0, alpha)
    F = np.where(solid[..., None], a, (a - (1 - alpha[..., None]) * Bg) / np.maximum(alpha, 1e-3)[..., None])
    F = np.clip(F, 0, 255)
    F[..., 1] = np.where(solid, F[..., 1], np.minimum(F[..., 1], (F[..., 0] + F[..., 2]) / 2 + 8))
    # Faint fog: unmixing is noisy there (it drifts pink), so tint it with the body's own lavender.
    body = np.median(a[solid & ~gold], axis=0) if (solid & ~gold).sum() > 200 else np.array([150, 135, 225], np.float32)
    w = np.clip((alpha - 0.35) / 0.5, 0, 1)[..., None]
    F = np.where(solid[..., None], F, body * (1 - w) + F * w)
    alpha = np.where(alpha < 0.06, 0, alpha)
    return F, alpha


def keep_character(alpha, scale, reach):
    """Keeps the largest shape plus anything within `reach` px of it (coins, drops); drops specks."""
    lab, n = ndimage.label(alpha > 0.3)
    if n == 0:
        return alpha
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    main = lab == 1 + int(np.argmax(sizes))
    near = ndimage.distance_transform_edt(~main) <= reach * scale
    keep_ids = [i + 1 for i in range(n) if sizes[i] >= 12 * scale * scale]
    keep = np.isin(lab, keep_ids) & near
    keep = ndimage.binary_dilation(keep | main, iterations=max(1, round(3 * scale)))
    return np.where(keep, alpha, 0)


def fade_edges(alpha, fade, scale):
    h, w = alpha.shape
    ramp = lambda n: np.arange(n) / max(n, 1)
    if not fade:
        return alpha
    a = alpha.copy()
    e = fade.get("edges", 0)
    top, bottom = fade.get("top", e), fade.get("bottom", e)
    left = right = e
    if top:
        n = round(top * scale); a[:n] *= ramp(n)[:, None]
    if bottom:
        n = round(bottom * scale); a[h - n:] *= ramp(n)[::-1][:, None]
    if left:
        n = round(left * scale); a[:, :n] *= ramp(n)[None, :]
    if right:
        n = round(right * scale); a[:, w - n:] *= ramp(n)[::-1][None, :]
    return a


def extract(name, src):
    d = f"{SCRATCH}/{name}"
    os.makedirs(d, exist_ok=True)
    if not os.path.exists(f"{d}/f_000.png"):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{SRC}/{src}", "-start_number", "0", f"{d}/f_%03d.png"], check=True)
    return d


def keyed_frame(d, i, spec):
    a = np.asarray(Image.open(f"{d}/f_{i:03d}.png").convert("RGB")).astype(np.float32)
    H, W = a.shape[:2]
    x0, y0, x1, y1 = sparkle_box(W, H)
    scale = W / 640
    if spec.get("crop"):
        cx0, cy0, cx1, cy1 = spec["crop"]
        a = a[cy0:cy1, cx0:cx1].copy()
        x0, x1, y0, y1 = x0 - cx0, x1 - cx0, y0 - cy0, y1 - cy0
    if spec["keyer"] == "magenta":
        F, alpha = key_magenta(erase_sparkle(a) if spec.get("sparkle", True) else a, pinkless=spec.get("pinkless", False))
    else:
        F, alpha = (key_fog if spec["keyer"] == "fog" else key_solid)(a, scale)
    alpha[max(y0, 0):max(y1, 0), max(x0, 0):max(x1, 0)] = 0
    alpha = keep_character(alpha, scale, spec.get("reach", {"fog": 60, "magenta": 12}.get(spec["keyer"], 50)))
    alpha = fade_edges(alpha, spec.get("fade"), scale)
    return np.dstack([F, alpha * 255]).astype(np.float32)


def blend(a, b, w):
    """Premultiplied blend of two RGBA float frames."""
    pa, pb = a[..., :3] * a[..., 3:4], b[..., :3] * b[..., 3:4]
    al = a[..., 3:4] * (1 - w) + b[..., 3:4] * w
    rgb = (pa * (1 - w) + pb * w) / np.maximum(al, 1e-3)
    return np.dstack([rgb, al])


def subject_box(f):
    ys, xs = np.where(f[..., 3] > 128)
    return xs.min(), ys.min(), xs.max(), ys.max()


def steady(f, ref):
    """Undoes a slow camera zoom: rescales the frame so the subject keeps the first frame's width,
    standing on the same spot."""
    x0, _, x1, y1 = subject_box(f)
    ref_w, ref_cx, ref_bottom = ref
    s = ref_w / max(x1 - x0, 1)
    H, W = f.shape[:2]
    im = Image.fromarray(np.clip(f, 0, 255).astype(np.uint8), "RGBA").resize((round(W * s), round(H * s)), Image.LANCZOS)
    canvas = Image.new("RGBA", (W, H))
    canvas.paste(im, (round(ref_cx - (x0 + x1) / 2 * s), round(ref_bottom - y1 * s)))
    return np.asarray(canvas).astype(np.float32)


def process(name, spec):
    d = extract(name, spec["src"])
    start, stop, step = spec["frames"]
    idx = list(range(start, stop, step))
    ref = None
    if spec.get("steady"):
        x0, _, x1, y1 = subject_box(keyed_frame(d, start, spec))
        ref = (x1 - x0, (x0 + x1) / 2, y1)

    def frame(i):
        f = keyed_frame(d, i, spec)
        return steady(f, ref) if ref else f

    frames = [frame(i) for i in idx]
    X = spec.get("xfade", 0)
    for k in range(X):  # last X frames melt into the frames just before the loop start
        j = len(frames) - X + k
        pre = frame(start - (X - k) * step)
        frames[j] = blend(frames[j], pre, (k + 1) / (X + 1))
    # One crop box for the whole animation, so the character never jumps.
    pts = [np.argwhere(f[..., 3] > 10) for f in frames]
    y0 = min(p[:, 0].min() for p in pts); y1 = max(p[:, 0].max() for p in pts)
    x0 = min(p[:, 1].min() for p in pts); x1 = max(p[:, 1].max() for p in pts)
    pad = 6
    out = f"{OUT}/{name}"
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        os.remove(os.path.join(out, f))
    size = None
    for i, f in enumerate(frames):
        im = Image.fromarray(np.clip(f, 0, 255).astype(np.uint8), "RGBA")
        im = im.crop((max(x0 - pad, 0), max(y0 - pad, 0), x1 + pad + 1, y1 + pad + 1))
        s = spec["height"] / im.height if "height" in spec else spec["width"] / im.width
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        im.save(f"{out}/{i:02d}.webp", "WEBP", quality=80, method=6)
        size = im.size
    kb = sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out)) // 1024
    print(f"{name:14s} {len(frames):3d} frames  {size[0]}x{size[1]}  {kb} KB")
    for f in os.listdir(d):  # full-size frames are big; re-extracted on the next run
        os.remove(os.path.join(d, f))
    os.rmdir(d)
    return len(frames), size


def camel(name):
    a, *rest = name.split("_")
    return a + "".join(r.title() for r in rest)


if __name__ == "__main__":
    only = os.environ.get("ONLY")
    results = {}
    for name, spec in CLIPS.items():
        if only and name not in only.split(","):
            n = len(os.listdir(f"{OUT}/{name}"))
            w, h = Image.open(f"{OUT}/{name}/00.webp").size
            results[name] = (n, (w, h))
            continue
        results[name] = process(name, spec)
    lines = [
        "/**",
        " * Character animations cut from the Veo clips in design/source-art/characters and design/source-art/Campus.",
        " * Generated by scripts/process_anims.py — edit CLIPS there, not this file.",
        " */",
        "export interface SpriteAnimation {",
        "  frames: number[];",
        "  fps: number;",
        "  /** Loops forever; otherwise plays once and holds the last frame. */",
        "  loop: boolean;",
        "  /** Frame width ÷ height. */",
        "  aspect: number;",
        "}",
        "",
        "export const ANIMS = {",
    ]
    for name, spec in CLIPS.items():
        n, (w, h) = results[name]
        lines.append(f"  /** {spec['about']} */")
        lines.append(f"  {camel(name)}: {{")
        lines.append(f"    fps: {spec['fps']},")
        lines.append(f"    loop: {json.dumps(spec['loop'])},")
        lines.append(f"    aspect: {w / h:.3f},")
        lines.append("    frames: [")
        for i in range(n):
            lines.append(f"      require('../../assets/characters/{name}/{i:02d}.webp'),")
        lines.append("    ],")
        lines.append("  },")
    lines += ["} satisfies Record<string, SpriteAnimation>;", "", "export type AnimName = keyof typeof ANIMS;", ""]
    open(f"{ROOT}/src/art/anims.ts", "w").write("\n".join(lines))
    print("wrote src/art/anims.ts")
