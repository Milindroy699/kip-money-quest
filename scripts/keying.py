"""
Magenta-screen keying shared by process_campus.py (building sprites, decorations, badges) and
process_anims.py (Kip's map walks). Needs numpy and scipy.

The backdrop is never one flat colour (Nano Banana and Veo add gradients, vignettes and a soft
shadow), so pixels are judged by how magenta they are rather than by distance to one colour:

    magentaness = (min(R, B) - G) / max(R, B)

It is about 0.6–0.9 on the backdrop and its shadow, and 0.3 or less on the art. That includes
purple art like the Melt Marsh pool, which is about 0.26.
"""
import numpy as np
from scipy import ndimage


def magentaness(a):
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    return (np.minimum(R, B) - G) / np.maximum(np.maximum(R, B), 1)


def key_magenta(a, glow=False, pinkless=False):
    """a: H×W×3 float32 (0–255). Returns (rgb float32, alpha 0–1).

    glow: also remove a soft pink lens glow that reaches in from a corner (a few island sprites).
    pinkless: the art has no pink or purple at all (Kip), so any pinkish pixel is backdrop seen
        through something, such as the glass of his glasses, and is made see-through.
    """
    m = magentaness(a)
    border = np.concatenate([m[:6].ravel(), m[-6:].ravel(), m[:, :6].ravel(), m[:, -6:].ravel()])
    border = border[border > 0.3]  # the backdrop only: ignore black video bars, glows and art touching the edge
    # This magenta or more: backdrop.
    hi = float(np.clip(np.percentile(border, 2) - 0.04, 0.45, 0.85)) if border.size > 50 else 0.6
    lo = min(hi - 0.28, 0.3)  # this or less: solid art
    alpha = np.clip((hi - m) / (hi - lo), 0, 1)

    if glow:
        R, G, B = a[..., 0], a[..., 1], a[..., 2]
        pinkish = (np.minimum(R, B) - G > 12) & (R > 170) & (B > 160)
        lab, _ = ndimage.label(pinkish)
        edge_ids = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
        alpha = np.where(np.isin(lab, edge_ids[edge_ids > 0]), 0, alpha)

    # Holes are the backdrop showing through (gaps between leaves and roots, under an arm, inside a
    # badge ring) unless purple art surrounds them: then they are highlights in the Melt pool or fog.
    solid = alpha > 0.5
    holes = ndimage.binary_fill_holes(solid) & ~solid
    lab, n = ndimage.label(holes)
    if n:
        # Judge by the solid art a few pixels out, not the soft edge right next to the hole.
        ring = ndimage.grey_dilation(lab, size=15) * ((alpha > 0.9) & (lab == 0))
        around = ndimage.median(m, ring, range(1, n + 1))
        fill = np.isin(lab, [i + 1 for i in range(n) if around[i] > 0.05])
        alpha = np.where(fill, 1.0, alpha)
    alpha = np.where(alpha > 0.85, 1.0, alpha)
    if pinkless:
        pinkish = np.minimum(a[..., 0], a[..., 2]) - a[..., 1] > 20
        alpha = np.where(pinkish, np.minimum(alpha, np.clip((0.22 - m) / 0.2, 0, 1)), alpha)

    # Soft edges: un-mix the local backdrop colour so no pink fringe is left.
    bgmask = (alpha == 0).astype(np.float32)
    if bgmask.sum() > 100:
        den = ndimage.gaussian_filter(bgmask, 12)
        num = np.stack([ndimage.gaussian_filter(a[..., c] * bgmask, 12) for c in range(3)], -1)
        fallback = np.median(a[bgmask > 0], axis=0)
        bg = np.where(den[..., None] > 1e-3, num / np.maximum(den, 1e-3)[..., None], fallback)
    else:
        bg = np.broadcast_to(np.array([255, 0, 255], np.float32), a.shape)
    edge = (alpha > 0) & (alpha < 1) if not pinkless else alpha > 0
    al = np.maximum(alpha, 0.08)[..., None]
    F = np.where(edge[..., None], np.clip((a - (1 - al) * bg) / al, 0, 255), a).astype(np.float32)
    # Whatever tint survives on the edge: no more magenta than neutral.
    excess = np.clip(np.minimum(F[..., 0], F[..., 2]) - F[..., 1] - 10, 0, None) * edge
    F[..., 0] -= excess
    F[..., 2] -= excess
    return F, alpha


def erase_sparkle(a):
    """Paints the backdrop over the little four-point sparkle in the bottom-right corner, for sheets
    where it sits close enough to an object to join it. On magenta it shows as a light pink star."""
    h, w = a.shape[:2]
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    y0, x0 = int(h * 0.7), int(w * 0.7)
    bgG = np.median(G[y0:, x0:][(R[y0:, x0:] > 200) & (B[y0:, x0:] > 200)])
    pink = (R > 225) & (B > 225) & (G > bgG + 25)
    pink[:y0] = False
    pink[:, :x0] = False
    lab, n = ndimage.label(ndimage.binary_dilation(pink, iterations=2))
    if not n:
        return a
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    star = ndimage.binary_dilation(lab == 1 + int(np.argmax(sizes)), iterations=3) & (R > 200) & (B > 200)
    out = a.copy()
    out[star] = np.median(a[y0:, x0:][(R[y0:, x0:] > 200) & (B[y0:, x0:] > 200) & (G[y0:, x0:] <= bgG + 5)], axis=0)
    return out


def drop_specks(alpha, min_area, keep_near=0):
    """Keeps the largest shape, plus other shapes of at least min_area pixels (or any size within
    keep_near px of the largest). Removes the Veo / Gemini sparkle and stray specks."""
    lab, n = ndimage.label(alpha > 0.3)
    if n <= 1:
        return alpha
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    main = 1 + int(np.argmax(sizes))
    keep = {main} | {i + 1 for i in range(n) if sizes[i] >= min_area}
    if keep_near:
        near = ndimage.distance_transform_edt(lab != main) <= keep_near
        keep |= set(np.unique(lab[near & (lab > 0)]).tolist())
    mask = ndimage.binary_dilation(np.isin(lab, list(keep)), iterations=3)
    return np.where(mask, alpha, 0)
