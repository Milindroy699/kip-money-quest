/**
 * Chart Surfer screen (World 8). Same loop as Kip Run: the game steps on the JS thread at display
 * rate, each frame is recorded into an SkPicture, and the HUD is plain React Native refreshed
 * ~10× a second. Tap to jump; when a read opens, swipe up or down (or tap the buttons).
 */
import { Canvas, createPicture, FilterMode, matchFont, MipmapMode, PaintStyle, Picture, Skia, TileMode, useImage, vec, type SkCanvas, type SkFont, type SkImage, type SkPaint } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, PanResponder, Platform, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { KIP, PROPS } from '../../art';
import { playSfx, startMusic, stopMusic } from '../../audio/sound';
import { createSurf, jumpHeight, priceAt, SETUP_COPY, stepSurf, SURF, SURF_BEHIND, surfAnswer, surfAutopilot, surfJump, surfResult, type Dir, type Setup, type SurfResult, type SurfState } from '../../games/chartSurfer';
import { Character } from '../../mascot/Character';
import { Coin } from '../../ui/components';
import { colors, radius, type } from '../../ui/theme';

const BG_TOP = '#141B33';
const BG_BOTTOM = '#27315A';
const UP = '#34D399';
const DOWN = '#F87171';
const MA_COLOR = '#A78BFA';
const LEVEL_COLOR: Record<Setup['kind'], string> = { support: UP, doubleBottom: UP, resistance: DOWN, headShoulders: '#FBBF24', trend: MA_COLOR };

const paints = new Map<string, SkPaint>();
function fill(color: string, alpha = 1): SkPaint {
  const key = `f${color}${alpha}`;
  let p = paints.get(key);
  if (!p) {
    p = Skia.Paint();
    p.setAntiAlias(true);
    p.setColor(Skia.Color(color));
    p.setAlphaf(alpha);
    paints.set(key, p);
  }
  return p;
}
function stroke(color: string, width: number, alpha = 1, dash?: number[]): SkPaint {
  const key = `s${color}${alpha}${dash?.join(',') ?? ''}`;
  let p = paints.get(key);
  if (!p) {
    p = fill(color, alpha).copy();
    p.setStyle(PaintStyle.Stroke);
    if (dash) p.setPathEffect(Skia.PathEffect.MakeDash(dash, 0));
    paints.set(key, p);
  }
  p.setStrokeWidth(width);
  return p;
}

interface Sprites {
  kip?: SkImage | null;
  coin?: SkImage | null;
  tip?: SkImage | null;
}

interface View2D {
  /** Gradient paints, made once per screen size (not per frame). */
  bgPaint: SkPaint;
  fogPaint: SkPaint;
  W: number;
  H: number;
  kipX: number;
  candleW: number;
  top: number;
  bottom: number;
  /** Kip's height in px. */
  u: number;
}

/** Vertical scale, eased between frames so the chart doesn't jitter. */
interface Scale {
  lo: number;
  hi: number;
}

function drawSprite(canvas: SkCanvas, img: SkImage, x: number, bottom: number, width: number) {
  const h = (width * img.height()) / img.width();
  canvas.drawImageRectOptions(img, Skia.XYWHRect(0, 0, img.width(), img.height()), Skia.XYWHRect(x - width / 2, bottom - h, width, h), FilterMode.Linear, MipmapMode.None, null);
}

function text(canvas: SkCanvas, font: SkFont, str: string, x: number, y: number, size: number, color: string) {
  const scale = size / 34;
  const w = font.measureText(str).width * scale;
  canvas.save();
  canvas.translate(x - w / 2, y);
  canvas.scale(scale, scale);
  canvas.drawText(str, 0, 0, fill(color), font);
  canvas.restore();
}

function drawFrame(canvas: SkCanvas, v: View2D, s: SurfState, sc: Scale, t: number, font: SkFont, sprites: Sprites) {
  const c = s.course;
  const py = (p: number) => v.top + ((sc.hi - p) / (sc.hi - sc.lo)) * (v.bottom - v.top);
  const px = (i: number) => v.kipX + (i - s.pos) * v.candleW;

  // Night sky and a faint grid.
  canvas.drawRect(Skia.XYWHRect(0, 0, v.W, v.H), v.bgPaint);
  for (let k = 0; k <= 5; k++) {
    const y = v.top + ((v.bottom - v.top) * k) / 5;
    canvas.drawLine(0, y, v.W, y, stroke('#FFFFFF', 1, 0.06));
  }
  const first = Math.max(0, Math.floor(s.pos - SURF_BEHIND - 1));
  for (let i = Math.ceil(first / 4) * 4; i <= s.pos; i += 4) canvas.drawLine(px(i), v.top - 20, px(i), v.bottom + 20, stroke('#FFFFFF', 1, 0.04));

  // Levels: support, resistance, necklines, from where they formed out into the future.
  for (const st of c.setups) {
    if (st.kind === 'trend' || st.from > s.pos || st.at + 8 < s.pos) continue;
    const y = py(st.level);
    canvas.drawLine(px(st.from), y, v.W, y, stroke(LEVEL_COLOR[st.kind], 2, 0.9, [10, 7]));
    text(canvas, font, SETUP_COPY[st.kind].name.toUpperCase(), Math.max(px(st.from) + 60, 70), y - 8, 12, LEVEL_COLOR[st.kind]);
  }

  // Candles (the past only).
  const last = Math.min(Math.floor(s.pos), c.candles.length - 1);
  const bodyW = v.candleW * 0.56;
  for (let i = first; i <= last; i++) {
    const k = c.candles[i];
    const x = px(i);
    const up = k.c >= k.o;
    canvas.drawLine(x, py(k.h), x, py(k.l), stroke(up ? UP : DOWN, 1.5, 0.7));
    const y1 = py(Math.max(k.o, k.c));
    const y2 = py(Math.min(k.o, k.c));
    canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - bodyW / 2, y1, bodyW, Math.max(y2 - y1, 2)), 2, 2), fill(up ? UP : DOWN, 0.55));
  }

  // The moving average: a rail.
  const rail = Skia.PathBuilder.Make();
  rail.moveTo(px(first), py(c.ma[first]));
  for (let i = first + 1; i <= last; i++) rail.lineTo(px(i), py(c.ma[i]));
  canvas.drawPath(rail.build(), stroke(MA_COLOR, 4, 0.85));

  // The price line Kip rides, up to now.
  const line = Skia.PathBuilder.Make();
  line.moveTo(px(first), py(c.candles[first].c));
  for (let i = first + 1; i <= last; i++) line.lineTo(px(i), py(c.candles[i].c));
  const kipY = py(priceAt(c, s.pos));
  line.lineTo(v.kipX, kipY);
  canvas.drawPath(line.build(), stroke('#FFFFFF', 3.5, 0.95));

  // The future is fog.
  canvas.drawRect(Skia.XYWHRect(v.kipX + 6, 0, v.W - v.kipX, v.H), v.fogPaint);
  for (let k = 0; k < 3; k++) text(canvas, font, '?', v.kipX + v.candleW * (2.2 + k * 2.1), v.top + 60 + ((k * 97 + Math.floor(s.pos) * 13) % 140), 30, 'rgba(255,255,255,0.22)');

  // Items ride in at board height (or jump height), relative to Kip.
  const board = kipY - 6;
  const jumpPx = v.u * 1.1;
  for (const it of c.items) {
    if (it.done) continue;
    const x = px(it.at);
    if (x < v.kipX - 10 || x > v.W + 30) continue;
    const y = board - 0.35 * v.u - (it.lift ? jumpPx * 0.85 : 0);
    if (it.kind === 'coin') {
      const spin = Math.max(Math.abs(Math.cos(t * 4 + it.at)), 0.25);
      canvas.save();
      canvas.translate(x, 0);
      canvas.scale(spin, 1);
      if (sprites.coin) drawSprite(canvas, sprites.coin, 0, y + 0.17 * v.u, 0.34 * v.u);
      else canvas.drawCircle(0, y, 0.15 * v.u, fill(colors.coin));
      canvas.restore();
    } else if (it.kind === 'tip') {
      const r = 0.3 * v.u;
      canvas.drawCircle(x, board - r, r, fill(colors.dash, 0.9));
      text(canvas, font, 'HOT TIP', x, board - r + 4, 11, '#FFFFFF');
    } else {
      // An overnight news gap: a break in the wave with a warning flag.
      canvas.drawRect(Skia.XYWHRect(x - v.candleW * 0.35, board - 2, v.candleW * 0.7, v.H - board), fill('#0B1022', 0.85));
      canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - 34, board - 0.9 * v.u, 68, 22), 6, 6), fill('#4F46E5'));
      text(canvas, font, 'NEWS GAP', x, board - 0.9 * v.u + 15, 11, '#FFFFFF');
    }
  }

  // Kip on his board.
  const lift = jumpHeight(s) * jumpPx;
  const ky = board - lift;
  const tilt = Math.max(-14, Math.min(14, ((priceAt(c, s.pos - 0.3) - priceAt(c, s.pos + 0.05)) / (sc.hi - sc.lo)) * 400));
  canvas.save();
  canvas.translate(v.kipX, ky);
  canvas.rotate(tilt, 0, 0);
  canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(-0.42 * v.u, -2, 0.84 * v.u, 0.12 * v.u), 0.06 * v.u, 0.06 * v.u), fill(colors.dash));
  canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(-0.42 * v.u, -2, 0.84 * v.u, 0.12 * v.u), 0.06 * v.u, 0.06 * v.u), stroke('#FFFFFF', 2, 0.7));
  if (sprites.kip) drawSprite(canvas, sprites.kip, 0, 0, 0.62 * v.u);
  else canvas.drawCircle(0, -0.35 * v.u, 0.3 * v.u, fill(colors.kip));
  canvas.restore();
  // Spray behind the board.
  if (!lift) for (let k = 0; k < 4; k++) canvas.drawCircle(v.kipX - 0.45 * v.u - k * 7, board + 2 - ((t * 60 + k * 9) % 14), 2.4 - k * 0.4, fill('#FFFFFF', 0.6 - k * 0.12));
}

export function ChartSurferScene({ seed, autopilot: autoplay = false, showButtons = false, onFinish }: { seed: number; autopilot?: boolean; showButtons?: boolean; onFinish: (r: SurfResult) => void }) {
  const [screenReader, setScreenReader] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReader).catch(() => {});
  }, []);
  const buttons = !autoplay && (showButtons || screenReader);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [game] = useState<SurfState>(() => createSurf(seed));
  const [hud, setHud] = useState({ coins: 0, progress: 0, read: null as Setup | null, readLeft: 0, right: 0, reads: 0 });
  const [toast, setToast] = useState<{ text: string; color: string } | null>(null);
  const [countdown, setCountdown] = useState(3);
  const picture = useSharedValue(createPicture(() => {}, { width: 1, height: 1 }));
  const font = useMemo(() => matchFont({ fontFamily: Platform.select({ ios: 'Helvetica Neue', default: 'sans-serif' }), fontSize: 34, fontWeight: 'bold' }), []);
  const sprites: Sprites = { kip: useImage(KIP.side), coin: useImage(PROPS.coin) };
  const spritesRef = useRef(sprites);
  useEffect(() => {
    spritesRef.current = sprites;
  });
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);
  const startedRef = useRef(false);

  useEffect(() => {
    if (countdown <= 0) {
      startedRef.current = true;
      startMusic();
      return;
    }
    const id = setTimeout(() => setCountdown((n) => n - 1), 600);
    return () => clearTimeout(id);
  }, [countdown]);

  useEffect(() => {
    if (!size.w) return;
    const kipX = size.w * 0.64;
    const bgPaint = Skia.Paint();
    bgPaint.setShader(Skia.Shader.MakeLinearGradient(vec(0, 0), vec(0, size.h), [Skia.Color(BG_TOP), Skia.Color(BG_BOTTOM)], null, TileMode.Clamp));
    const fogPaint = Skia.Paint();
    fogPaint.setShader(Skia.Shader.MakeLinearGradient(vec(kipX + 6, 0), vec(size.w, 0), [Skia.Color('rgba(39,49,90,0)'), Skia.Color('rgba(200,205,235,0.32)')], null, TileMode.Clamp));
    const v: View2D = { bgPaint, fogPaint, W: size.w, H: size.h, kipX, candleW: size.w / 23, top: size.h * 0.24, bottom: size.h * 0.8, u: Math.min(size.w * 0.2, 90) };
    const scale: Scale = { lo: 0, hi: 0 };
    let raf = 0;
    let last = 0;
    let hudAcc = 0;
    let paused = AppState.currentState !== 'active';
    let toastTimer: ReturnType<typeof setTimeout> | undefined;
    let finished = false;
    const showToast = (t: string, color: string, ms = 1400) => {
      setToast({ text: t, color });
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => setToast(null), ms);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const s = game;
      const dt = last ? (now - last) / 1000 : 0;
      last = now;
      if (!paused && startedRef.current && !s.over) {
        if (autoplay) surfAutopilot(s);
        stepSurf(s, dt);
      }
      for (const e of s.events.splice(0)) {
        switch (e.kind) {
          case 'coin':
            playSfx('coin', 0.6);
            break;
          case 'jump':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            break;
          case 'tipHit':
          case 'gapHit':
            playSfx('hit');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
            showToast(e.kind === 'tipHit' ? `HOT TIP −${e.amount}` : `NEWS GAP −${e.amount}`, colors.error, 900);
            break;
          case 'readOpen':
            playSfx('bank', 0.6);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            break;
          case 'readRight':
            playSfx('correct');
            showToast(`Textbook read! +${e.amount}`, colors.kip);
            break;
          case 'readWrong':
            playSfx('wrong', 0.7);
            showToast(e.setup ? `Textbook says ${e.setup.textbook === 'up' ? 'UP' : 'DOWN'}` : 'Not the textbook read', colors.dash);
            break;
          case 'readMissed':
            showToast('No call made', colors.inkMuted);
            break;
          case 'outcome':
            if (e.setup) {
              const held = e.setup.actual === e.setup.textbook;
              showToast(held ? `✅ The ${SETUP_COPY[e.setup.kind].name.toLowerCase()} held` : `❌ It failed: the market went ${e.setup.actual}`, held ? colors.kip : '#FBBF24', 2200);
            }
            break;
        }
      }
      // Ease the vertical scale towards what's on screen.
      const c = s.course;
      const from = Math.max(0, Math.floor(s.pos - SURF_BEHIND));
      const to = Math.min(Math.ceil(s.pos), c.candles.length - 1);
      let lo = Infinity;
      let hi = -Infinity;
      for (let i = from; i <= to; i++) {
        lo = Math.min(lo, c.candles[i].l, c.ma[i]);
        hi = Math.max(hi, c.candles[i].h, c.ma[i]);
      }
      const pad = (hi - lo) * 0.25 + 0.6;
      const k = scale.hi ? Math.min(1, dt * 2.5) : 1;
      scale.lo += (lo - pad - scale.lo) * k;
      scale.hi += (hi + pad - scale.hi) * k;
      picture.value = createPicture((canvas) => drawFrame(canvas, v, s, scale, now / 1000, font, spritesRef.current), Skia.XYWHRect(0, 0, v.W, v.H));

      hudAcc += dt;
      if (hudAcc > 0.1) {
        hudAcc = 0;
        setHud({ coins: s.coins, progress: s.pos / c.candles.length, read: s.read, readLeft: s.readLeft, right: s.reads.filter((r) => r.answer === r.setup.textbook).length, reads: s.reads.length });
      }
      if (s.over && !finished) {
        finished = true;
        stopMusic();
        setTimeout(() => onFinishRef.current(surfResult(s)), 800);
      }
    };
    raf = requestAnimationFrame(frame);
    const sub = AppState.addEventListener('change', (state) => {
      paused = state !== 'active';
      last = 0;
    });
    return () => {
      stopMusic();
      cancelAnimationFrame(raf);
      sub.remove();
      clearTimeout(toastTimer);
    };
  }, [size, font, picture, game, autoplay]);

  const answer = (dir: Dir) => {
    surfAnswer(game, dir);
    Haptics.selectionAsync().catch(() => {});
  };
  // Tap = jump; while a read is open, a vertical swipe answers it.
  const [responder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, g) => {
        if (game.read && Math.abs(g.dy) > 30 && Math.abs(g.dy) > Math.abs(g.dx)) {
          surfAnswer(game, g.dy < 0 ? 'up' : 'down');
          Haptics.selectionAsync().catch(() => {});
        } else if (!game.read) surfJump(game);
      },
    }),
  );

  return (
    <View
      style={{ flex: 1, backgroundColor: BG_TOP }}
      onLayout={(e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      {...(autoplay ? {} : responder.panHandlers)}
      accessibilityLabel={autoplay ? 'Chart Surfer. Kip is playing by himself.' : 'Chart Surfer. Tap to jump. When a read opens, swipe up or down, or use the buttons.'}>
      {size.w > 0 ? (
        <Canvas style={StyleSheet.absoluteFill}>
          <Picture picture={picture} />
        </Canvas>
      ) : null}

      <View style={styles.hudTop} pointerEvents="box-none">
        <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
          <View style={{ height: 6, width: `${Math.min(hud.progress, 1) * 100}%`, backgroundColor: '#FFFFFF' }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }} pointerEvents="none">
          <View style={[styles.pill, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            <Coin size={14} />
            <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>{hud.coins}</Text>
          </View>
          <View style={styles.pill}>
            <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>
              🔎 Reads {hud.right}/{hud.reads}
            </Text>
          </View>
        </View>
        {autoplay ? (
          <View style={[styles.pill, { alignSelf: 'center', marginTop: 8 }]} pointerEvents="none">
            <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>🐢 Kip is playing · practice, no coins</Text>
          </View>
        ) : null}
        {hud.read ? (
          <View style={styles.read} accessibilityLiveRegion="polite">
            <Text style={[type.tiny, { color: '#C4B5FD' }]}>📈 READ THE CHART · {SETUP_COPY[hud.read.kind].name.toUpperCase()}</Text>
            <Text style={[type.bodyBold, { color: '#FFFFFF' }]}>{SETUP_COPY[hud.read.kind].question}</Text>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
              <View style={{ height: 4, width: `${(hud.readLeft / SURF.readWindow) * 100}%`, backgroundColor: '#C4B5FD' }} />
            </View>
            {!autoplay ? (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable testID="surf-up" accessibilityRole="button" onPress={() => answer('up')} style={[styles.answer, { borderColor: UP }]}>
                  <Text style={[type.bodyBold, { color: UP }]}>{SETUP_COPY[hud.read.kind].up}</Text>
                </Pressable>
                <Pressable testID="surf-down" accessibilityRole="button" onPress={() => answer('down')} style={[styles.answer, { borderColor: DOWN }]}>
                  <Text style={[type.bodyBold, { color: DOWN }]}>{SETUP_COPY[hud.read.kind].down}</Text>
                </Pressable>
              </View>
            ) : null}
            <Text style={[type.tiny, { color: '#C7CCE6' }]}>Swipe ↑ or ↓, or tap. The chart is paused while you think.</Text>
          </View>
        ) : null}
      </View>

      {toast ? (
        <View style={styles.toast} pointerEvents="none">
          <Text style={[type.h2, { color: toast.color, textAlign: 'center', textShadowColor: '#000', textShadowRadius: 6 }]}>{toast.text}</Text>
        </View>
      ) : null}

      {buttons && !hud.read ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Jump" onPress={() => surfJump(game)} style={styles.jumpButton}>
          <Text style={[type.title, { color: colors.ink }]}>▲ Jump</Text>
        </Pressable>
      ) : null}

      {countdown > 0 ? (
        <View style={styles.countdown} pointerEvents="none">
          <Character name="kip" mood="cheer" size={90} animate={false} />
          <Text style={[type.hero, { fontSize: 64, color: '#FFFFFF' }]}>{countdown}</Text>
          <Text style={[type.bodyBold, { color: '#FFFFFF', textAlign: 'center', paddingHorizontal: 24 }]}>Tap to jump coins, hot tips and news gaps. Read the chart when it pauses.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hudTop: { position: 'absolute', top: 12, left: 16, right: 16 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.92)' },
  read: { marginTop: 10, gap: 8, padding: 12, borderRadius: radius.md, backgroundColor: 'rgba(20,27,51,0.94)', borderWidth: 2, borderColor: '#7C6CF0' },
  answer: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: radius.md, borderWidth: 2.5, backgroundColor: 'rgba(255,255,255,0.06)' },
  toast: { position: 'absolute', top: '40%', left: 16, right: 16, alignItems: 'center' },
  jumpButton: { position: 'absolute', bottom: 28, alignSelf: 'center', paddingHorizontal: 28, paddingVertical: 14, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.92)' },
  countdown: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(20,27,51,0.55)' },
});
