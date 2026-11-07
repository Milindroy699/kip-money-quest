/**
 * Kip Run screen: the game loop runs on the JS thread at display rate, the frame is recorded
 * into an SkPicture and handed to the canvas through a shared value (no React re-render per
 * frame). The HUD is plain React Native, refreshed ~10× a second.
 */
import { Canvas, createPicture, matchFont, Picture, Skia, useImage } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, PanResponder, Platform, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { playSfx, startMusic, stopMusic } from '../../audio/sound';
import { BACKGROUNDS, KIP, MELT, PROPS } from '../../art';
import { ANIMS } from '../../art/anims';
import { KIP_RUN_FRAMES } from '../../art/kipRun';
import { Character } from '../../mascot/Character';
import { Coin } from '../../ui/components';
import { colors, radius, type } from '../../ui/theme';
import { applyInput, autopilot, createRun, KIP_TIPS, KIP_TIPS_RISK, type GateQuestion, type Loadout, MELT_DANGER_GAP, step, summarise, TF_INFO, TF_STAGE_TIPS, TF_STAGES, type RunMode, type RunResult, type RunState, type TfStage } from './engine';
import { drawFrame, makeView, type Sprites } from './render';
import { tauntFor } from './taunts';
import { useSkiaImages } from './useSkiaImages';

const TUTORIAL_TIPS: [number, string][] = [
  [0.5, 'Swipe ← → to switch lanes and grab coins.'],
  [7, 'Swipe ↑ to jump FEE booths.'],
  [13, 'Swipe ↓ to slide under SALE signs.'],
  [19, 'Steer into the green INVEST gate to bank your coins!'],
];

interface Hud {
  /** Risk Lanes: invested coins per risk level. */
  holdings: { safe: number; balanced: number; wild: number };
  question: { text: string; options: string[] } | null;
  pocket: number;
  banked: number;
  progress: number;
  danger: boolean;
  snowball: number;
  /** Time Tracks: the current stage. */
  stage: TfStage;
}

export function RunnerScene({
  mode,
  durationSec,
  seed,
  tutorial,
  autopilot: autoplay = false,
  showButtons = false,
  questions,
  loadout,
  dashTier = 0,
  onFinish,
}: {
  mode: RunMode;
  durationSec: number;
  seed: number;
  tutorial?: boolean;
  /** Kip plays himself (accessible fallback so lessons are never blocked; pays no coins). */
  autopilot?: boolean;
  /** On-screen ◀ ▲ ▼ ▶ buttons (also turned on automatically when a screen reader is running). */
  showButtons?: boolean;
  /** Answer Gate questions for this run. */
  questions?: GateQuestion[];
  /** Equipped card power-up. */
  loadout?: Loadout;
  /** Dash's difficulty tier, from the player's dodges so far (see dashTierFor). */
  dashTier?: number;
  onFinish: (result: RunResult) => void;
}) {
  const [screenReader, setScreenReader] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReader).catch(() => {});
  }, []);
  const buttons = !autoplay && (showButtons || screenReader);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hud, setHud] = useState<Hud>({ holdings: { safe: 0, balanced: 0, wild: 0 }, question: null, pocket: 0, banked: 0, progress: 0, danger: false, snowball: 0, stage: 'scalp' });
  const [tip, setTip] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ text: string; color: string } | null>(null);
  const [taunt, setTaunt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const picture = useSharedValue(createPicture(() => {}, { width: 1, height: 1 }));
  const [run] = useState<RunState>(() => createRun({ mode, durationSec, seed, tutorial, questions, loadout, dashTier }));
  const font = useMemo(() => matchFont({ fontFamily: Platform.select({ ios: 'Helvetica Neue', default: 'sans-serif' }), fontSize: 34, fontWeight: 'bold' }), []);
  const runFrames = useSkiaImages(KIP_RUN_FRAMES);
  const meltChase = useSkiaImages(ANIMS.meltChase.frames);
  const dashRun = useSkiaImages(ANIMS.dashRun.frames);
  // 3D art for the track; the renderer falls back to vector shapes until each image loads.
  const sprites: Sprites = {
    kip: useImage(KIP.back),
    kipRun: runFrames,
    coin: useImage(PROPS.coin),
    investGate: useImage(PROPS.investGate),
    sipGate: useImage(PROPS.sipGate),
    billboard: useImage(PROPS.billboard),
    hotTip: useImage(PROPS.hotTip),
    feeToll: useImage(PROPS.feeToll),
    cashOut: useImage(PROPS.cashOut),
    melt: useImage(MELT.reaching),
    meltChase,
    dashRun,
    sky: useImage(mode === 'inflation' ? BACKGROUNDS.moneyTown : mode === 'risk' ? BACKGROUNDS.riskRidge : mode === 'timeframe' ? BACKGROUNDS.timeTracks : BACKGROUNDS.snowballValley),
  };
  const spritesRef = useRef(sprites);
  useEffect(() => {
    spritesRef.current = sprites;
  });
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);
  const startedRef = useRef(false);

  // 3-2-1 countdown
  useEffect(() => {
    if (countdown <= 0) {
      startedRef.current = true;
      startMusic();
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 600);
    return () => clearTimeout(id);
  }, [countdown]);

  // Game loop
  useEffect(() => {
    if (!size.w) return;
    const view = makeView(size.w, size.h);
    let raf = 0;
    let last = 0;
    let hudAcc = 0;
    let paused = AppState.currentState !== 'active';
    const seenTips = new Set<string>();
    let tipTimer: ReturnType<typeof setTimeout> | undefined;
    let flashTimer: ReturnType<typeof setTimeout> | undefined;
    let tauntTimer: ReturnType<typeof setTimeout> | undefined;
    let lastCoinHaptic = 0;
    let nextTutorialTip = 0;
    let finished = false;

    const showTip = (text: string) => {
      setTip(text);
      clearTimeout(tipTimer);
      tipTimer = setTimeout(() => setTip(null), 2600);
    };
    const showFlash = (text: string, color: string) => {
      setFlash({ text, color });
      clearTimeout(flashTimer);
      flashTimer = setTimeout(() => setFlash(null), 900);
    };
    const showTaunt = (text: string) => {
      setTaunt(text);
      clearTimeout(tauntTimer);
      tauntTimer = setTimeout(() => setTaunt(null), 1800);
    };

    const render = (t: number) => {
      const s = run;
      picture.value = createPicture((canvas) => drawFrame(canvas, view, s, t, font, spritesRef.current), Skia.XYWHRect(0, 0, view.W, view.H));
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const s = run;
      const dt = last ? (now - last) / 1000 : 0;
      last = now;
      const started = startedRef.current;
      if (!paused && started && !s.over) {
        if (autoplay) autopilot(s);
        step(s, dt);
      }

      for (const e of s.events.splice(0)) {
        if (e.kind === 'stage' && e.stage) {
          // Time Tracks: every stage gets its own explanation, every run.
          showTip(TF_STAGE_TIPS[e.stage]);
          if (e.stage !== 'scalp') {
            playSfx('bank', 0.5);
            showFlash(`${TF_INFO[e.stage].emoji} ${TF_INFO[e.stage].label}`, TF_INFO[e.stage].color);
          }
          continue;
        }
        const tipText = (s.config.mode === 'risk' ? KIP_TIPS_RISK[e.kind] : undefined) ?? KIP_TIPS[e.kind];
        // Kip explains Dash's traps while you're still learning them, then lets you play.
        const teaching = e.kind !== 'dashDrop' || (s.config.dashTier ?? 0) <= 1;
        if (tipText && teaching && !seenTips.has(e.kind)) {
          seenTips.add(e.kind);
          showTip(tipText);
        }
        switch (e.kind) {
          case 'coin':
            playSfx('coin', 0.7);
            if (now - lastCoinHaptic > 120) {
              lastCoinHaptic = now;
              Haptics.selectionAsync().catch(() => {});
            }
            break;
          case 'bank':
            playSfx('bank');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            showFlash(`BANKED +${e.amount}`, colors.kip);
            break;
          case 'answerRight':
            playSfx('correct');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            showFlash(`RIGHT! +${e.amount} BANKED`, colors.kip);
            break;
          case 'answerWrong':
            playSfx('wrong');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
            showFlash('NOT QUITE: THE MELT GAINS', colors.melt);
            break;
          case 'shield':
            playSfx('shield');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            showFlash('🛡️ FD SHIELD', colors.kipDark);
            break;
          case 'autoBank':
            playSfx('bank', 0.6);
            showFlash(`SIP AUTO-BANK +${e.amount}`, '#14B8A6');
            break;
          case 'impulse':
          case 'hotTip':
          case 'fee':
            playSfx('hit');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
            showFlash(e.kind === 'fee' ? `FEE −${e.amount}` : e.kind === 'impulse' ? `IMPULSE BUY −${e.amount}` : `HOT TIP −${e.amount}`, colors.error);
            break;
          case 'cashOut':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            showFlash('+15 … snowball reset!', colors.dash);
            break;
          case 'meltBite':
            playSfx('melt', 0.6);
            break;
          case 'swingUp':
            playSfx('correct', 0.6);
            showFlash(`🔥 WILD +${e.amount}%`, colors.kipDark);
            break;
          case 'swingDown':
            playSfx('wrong', 0.6);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            showFlash(`🔥 WILD −${e.amount}%`, colors.error);
            break;
          case 'emergency':
            playSfx('hit', 0.6);
            showFlash(`📱 SURPRISE EXPENSE −${e.amount}`, colors.dash);
            break;
          case 'emergencyShort':
            playSfx('hit');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            showFlash(`📱 SOLD IN A HURRY −${e.amount}`, colors.error);
            break;
          case 'tradeFee':
            playSfx('hit', 0.4);
            showFlash(`FEE −${e.amount}`, colors.error);
            break;
          case 'bell':
            playSfx('bank');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            showFlash(`🔔 3:30 SQUARED OFF ${(e.amount ?? 0) >= 0 ? '+' : '−'}${Math.abs(e.amount ?? 0)}`, colors.shellDark);
            break;
          case 'gapDown':
            playSfx('hit');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
            showFlash(`🌙 NEWS GAP −${e.amount}`, '#4F46E5');
            break;
          case 'dividend':
            playSfx('coin');
            showFlash(`DIVIDEND +${e.amount}`, colors.kipDark);
            break;
          case 'growth':
            playSfx('bank', 0.4);
            showFlash(`📈 COMPOUNDED +${e.amount}`, colors.kipDark);
            break;
          case 'dashOvertake':
            // Dash sprints past Kip and gloats (cosmetic: the slip's own cost is already shown).
            if (e.reason) showTaunt(tauntFor(e.reason, s.overtakes - 1));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            break;
          case 'caught':
            playSfx('melt');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
            break;
        }
      }

      if (tutorial && started && nextTutorialTip < TUTORIAL_TIPS.length && s.time >= TUTORIAL_TIPS[nextTutorialTip][0]) {
        showTip(TUTORIAL_TIPS[nextTutorialTip][1]);
        nextTutorialTip++;
      }

      render(now / 1000);

      hudAcc += dt;
      if (hudAcc > 0.1) {
        hudAcc = 0;
        setHud({
          holdings: { safe: Math.round(s.holdings.safe), balanced: Math.round(s.holdings.balanced), wild: Math.round(s.holdings.wild) },
          question: s.question, pocket: Math.round(s.pocket), banked: Math.round(s.banked), progress: s.time / s.config.durationSec, danger: s.meltGap < MELT_DANGER_GAP && s.pocket > 0.5, snowball: s.snowball, stage: s.tf.stage });
      }

      if (s.over && !finished) {
        finished = true;
        stopMusic();
        setTimeout(() => onFinishRef.current(summarise(s)), 700);
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
      clearTimeout(tipTimer);
      clearTimeout(flashTimer);
    };
  }, [size, font, picture, tutorial, run, autoplay]);

  const [responder] = useState(() => {
    const gesture = { consumed: false };
    const fire = (dx: number, dy: number) => {
      if (gesture.consumed || Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      gesture.consumed = true;
      if (Math.abs(dx) > Math.abs(dy)) applyInput(run, dx > 0 ? 'right' : 'left');
      else applyInput(run, dy < 0 ? 'jump' : 'slide');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        gesture.consumed = false;
      },
      onPanResponderMove: (_, g) => fire(g.dx, g.dy),
      onPanResponderRelease: (_, g) => fire(g.dx, g.dy),
    });
  });

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.cream }}
      onLayout={(e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      {...responder.panHandlers}
      accessibilityLabel={autoplay ? 'Kip Run. Kip is playing by himself.' : 'Kip Run game. Swipe left or right to change lanes, up to jump, down to slide, or use the buttons at the bottom.'}>
      {size.w > 0 ? (
        <Canvas style={StyleSheet.absoluteFill}>
          <Picture picture={picture} />
        </Canvas>
      ) : null}

      {/* HUD */}
      <View style={styles.hudTop} pointerEvents="none">
        <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(30,42,58,0.15)', overflow: 'hidden' }}>
          <View style={{ height: 6, width: `${Math.min(hud.progress, 1) * 100}%`, backgroundColor: colors.ink }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <View style={[styles.pill, { backgroundColor: colors.meltLight, borderColor: colors.melt }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[type.small, { color: colors.meltDark, fontWeight: '800' }]}>Idle</Text>
              <Coin size={14} />
              <Text style={[type.small, { color: colors.meltDark, fontWeight: '800' }]}>{hud.pocket}</Text>
            </View>
          </View>
          {mode === 'snowball' ? (
            <View style={[styles.pill, { backgroundColor: '#fff', borderColor: '#9DB9CF' }]}>
              <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>⛄ ×{Math.min(Math.pow(1.04, hud.snowball), 3).toFixed(2)}</Text>
            </View>
          ) : null}
          {mode === 'risk' ? (
            // Risk Lanes: what's invested at each level, so swings are visible as they happen.
            <View style={[styles.pill, { backgroundColor: '#fff', borderColor: colors.line, flexDirection: 'row', gap: 8 }]} accessibilityLabel={`Invested: safe ${hud.holdings.safe}, balanced ${hud.holdings.balanced}, wild ${hud.holdings.wild}`}>
              <Text style={[type.small, { color: '#1F9A63', fontWeight: '800' }]}>🛡️ {hud.holdings.safe}</Text>
              <Text style={[type.small, { color: '#B7791F', fontWeight: '800' }]}>⚖️ {hud.holdings.balanced}</Text>
              <Text style={[type.small, { color: '#C53030', fontWeight: '800' }]}>🔥 {hud.holdings.wild}</Text>
            </View>
          ) : (
            <View style={[styles.pill, { backgroundColor: colors.kipLight, borderColor: colors.kip }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[type.small, { color: colors.kipDark, fontWeight: '800' }]}>Banked</Text>
                <Coin size={14} />
                <Text style={[type.small, { color: colors.kipDark, fontWeight: '800' }]}>{hud.banked}</Text>
              </View>
            </View>
          )}
        </View>
        {mode === 'timeframe' ? (
          // Time Tracks: which speed you're on, out of the four.
          <View style={[styles.pill, { marginTop: 8, alignSelf: 'center', flexDirection: 'row', gap: 6, backgroundColor: '#fff', borderColor: TF_INFO[hud.stage].color }]} accessibilityLabel={`Stage: ${TF_INFO[hud.stage].label}`}>
            {TF_STAGES.map((st) => (
              <Text key={st} style={[type.tiny, { color: st === hud.stage ? TF_INFO[st].color : colors.inkMuted, fontWeight: st === hud.stage ? '800' : '600' }]}>
                {TF_INFO[st].emoji}
                {st === hud.stage ? ` ${TF_INFO[st].label}` : ''}
              </Text>
            ))}
          </View>
        ) : null}
        {autoplay ? (
          // In the HUD's flow (not pinned), so questions and tips stack below it instead of under it.
          <View style={[styles.pill, styles.autoPill]}>
            <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>🐢 Kip is playing · practice run, no coins</Text>
          </View>
        ) : null}
        {hud.danger ? (
          <View style={[styles.pill, { alignSelf: 'center', marginTop: 8, backgroundColor: colors.melt, borderColor: colors.meltDark }]}>
            <Text style={[type.small, { color: '#fff', fontWeight: '800' }]}>The Melt is eating your idle coins!</Text>
          </View>
        ) : null}
        {hud.question ? (
          <View style={styles.question} accessibilityLiveRegion="polite">
            <Text style={[type.small, { color: colors.ink, fontWeight: '800', textAlign: 'center' }]}>❓ {hud.question.text}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              {hud.question.options.map((o, i) => (
                <View key={o} style={styles.answerChip}>
                  <Text style={[type.tiny, { color: colors.meltDark, fontWeight: '800' }]}>{['◀ ', '▲ ', '▶ '][i]}</Text>
                  <Text style={[type.tiny, { color: colors.ink, fontWeight: '700' }]} numberOfLines={1}>
                    {o}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
        {taunt ? (
          <View style={styles.taunt} pointerEvents="none" accessibilityLiveRegion="polite" accessibilityLabel={`Dash: ${taunt}`}>
            <Character name="dash" mood="cheer" size={40} animate={false} />
            <Text style={[type.small, { color: '#fff', flex: 1, fontWeight: '800' }]}>{taunt}</Text>
          </View>
        ) : null}
        {tip ? (
          <View style={styles.tip}>
            <Character name="kip" mood="talk" size={40} animate={false} />
            <Text style={[type.small, { color: colors.ink, flex: 1, fontWeight: '700' }]}>{tip}</Text>
          </View>
        ) : null}
      </View>

      {flash ? (
        <View style={styles.flash} pointerEvents="none">
          <Text style={[type.title, { color: flash.color, textShadowColor: '#fff', textShadowRadius: 6 }]}>{flash.text}</Text>
        </View>
      ) : null}

      {buttons ? (
        <View style={styles.buttonRow}>
          {(
            [
              ['left', '◀', 'Move left'],
              ['jump', '▲', 'Jump'],
              ['slide', '▼', 'Slide'],
              ['right', '▶', 'Move right'],
            ] as const
          ).map(([input, glyph, label]) => (
            <Pressable
              key={input}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => {
                applyInput(run, input);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              }}
              style={({ pressed }) => [styles.controlButton, pressed && { transform: [{ scale: 0.94 }] }]}>
              <Text style={[type.title, { color: colors.ink }]}>{glyph}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {countdown > 0 ? (
        <View style={styles.countdown} pointerEvents="none">
          <Text style={[type.hero, { fontSize: 72, color: colors.ink }]}>{countdown}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hudTop: { position: 'absolute', top: 12, left: 16, right: 16 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 2 },
  tip: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.md,
    paddingRight: 12,
    borderWidth: 2,
    borderColor: colors.line,
  },
  flash: { position: 'absolute', top: '38%', left: 0, right: 0, alignItems: 'center' },
  taunt: {
    marginTop: 10,
    alignSelf: 'flex-end',
    maxWidth: '86%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dash,
    borderRadius: radius.md,
    paddingRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  question: { marginTop: 10, backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: radius.md, padding: 10, borderWidth: 2, borderColor: colors.melt },
  answerChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.meltLight, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 4 },
  autoPill: { marginTop: 8, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: colors.line },
  buttonRow: { position: 'absolute', bottom: 28, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  controlButton: {
    width: 72,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdown: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,248,236,0.35)' },
});
