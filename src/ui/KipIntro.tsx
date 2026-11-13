/**
 * The opening moment: the native splash (a still Kip on cream) comes alive. Kip jumps, throws
 * his arms up and waves a big "Hii!" (his Veo clip, with its voice and chime), coins pop out as
 * he lands, a bubble greets the player by name with one line that fits them, and a loader fills
 * while the app gets ready underneath. About 4 seconds; tap anywhere to skip. With Reduce Motion
 * on it's a calm, still hello that fades after a moment.
 */
import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, type SharedValue, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { PROPS } from '../art';
import { ANIMS } from '../art/anims';
import { playSfx } from '../audio/sound';
import { INTRO_LOADING, introLines } from '../engagement/intro';
import { displayStreak, streakStatus } from '../engagement/streak';
import { useGame } from '../state/game';
import { goalOf, goalShort } from './FutureYou';
import { colors, radius, shadow, type } from './theme';

const SPLASH = require('../../assets/images/splash-icon.png');
// The native splash (iOS) fits splash-icon.png (582×840) into an imageWidth × imageWidth box
// (200, app.json), centred on the screen. Our copy sits in the same box, so nothing jumps.
const BOX = 200;
// Kip's half-height in that box (the art is 786 px tall in an 840 px image drawn 200 pt tall).
const KIP_HALF = 93.6;
// The "Hii!" clip lined up on the splash Kip: once he has landed (feet at 512 of the frame's
// 520 px, 433 px tall, legs centred at x 220) he is exactly the splash Kip's size and stands on
// the same spot. The clip opens mid-jump, so the still Kip seems to leap up out of the splash.
const HI = ANIMS.kipHi;
const HI_SCALE = 187.1 / 433;
const HI_H = 520 * HI_SCALE;
const HI_W = HI_H * HI.aspect;
const HI_TOP = 193.6 - 512 * HI_SCALE;
const HI_LEFT = 100.25 - 220.5 * HI_SCALE;
/** Kip grows to this size as he jumps out of the splash. */
const GROW = 1.32;

/** How long the intro plays before it fades (Reduce Motion: REDUCED_MS). */
export const INTRO_MS = 3900;
const REDUCED_MS = 1500;
/** The clip (and its sound) starts here; everything else is timed from the clip. */
const HOP_AT = 280;
const frameAt = (frame: number) => HOP_AT + (frame * 1000) / HI.fps;
const LANDS_AT = frameAt(9);
/** The bubble pops as he says "Hii!" (his mouth opens around frame 22, the voice a little after). */
const BUBBLE_AT = frameAt(24);
const TITLE_AT = 650;
const LINE_AT = frameAt(36);
const FADE_MS = 320;
const COINS = 8;
/** Longest we hold the splash pose waiting for the clip's frames; after that Kip hops as a still. */
const MAX_WAIT_MS = 2500;

const clock = () => Date.now();

export function KipIntro({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const { width: W, height: H } = useWindowDimensions();
  const total = reduce ? REDUCED_MS : INTRO_MS;

  const name = useGame((s) => s.profile.name);
  const onboarded = useGame((s) => s.profile.onboarded);
  const goal = useGame((s) => s.profile.goal);
  const targetAge = useGame((s) => s.profile.targetAge);
  const streak = useGame((s) => s.streak);
  const [lines] = useState(() => {
    const now = new Date(clock());
    const today = useGame.getState().today();
    return introLines({
      name,
      onboarded,
      streak: displayStreak(streak, today),
      doneToday: streakStatus(streak, today) === 'done-today',
      goal: goal ? `${goalOf(goal).emoji} ${goalShort(goal, targetAge)}` : null,
      hour: now.getHours(),
      day: Math.floor(clock() / 86_400_000),
    });
  });

  const [frame, setFrame] = useState(0);
  const [waving, setWaving] = useState(false);
  // loading: frames still on their way (the screen looks exactly like the splash); clip: play
  // the Veo clip; still: no clip (Reduce Motion, or frames too slow), so the still Kip hops.
  const [phase, setPhase] = useState<'loading' | 'clip' | 'still'>(reduce ? 'still' : 'loading');
  const started = phase !== 'loading';
  const last = HI.frames.length - 1;
  const [typed, setTyped] = useState(reduce ? lines.line.length : 0);
  if (reduce && frame !== last) setFrame(last); // Reduce Motion: the settled, smiling pose
  const [caption, setCaption] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [startedAt] = useState(clock);

  const hop = useSharedValue(0);
  const jump = useSharedValue(0);
  const grow = useSharedValue(reduce ? 1 : 0);
  const still = useSharedValue(1);
  const glow = useSharedValue(reduce ? 1 : 0);
  const burst = useSharedValue(0);
  const bubble = useSharedValue(reduce ? 1 : 0);
  const title = useSharedValue(reduce ? 1 : 0);
  const fill = useSharedValue(0);
  const fade = useSharedValue(1);

  // Hide the native splash once our copy of it is on screen (fallback: shortly after mount).
  useEffect(() => {
    const id = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 400);
    return () => clearTimeout(id);
  }, []);

  // Load the clip's frames before playing it, so Kip never vanishes waiting for a frame.
  useEffect(() => {
    if (reduce) return;
    let live = true;
    Asset.loadAsync(HI.frames)
      .then(() => live && setPhase((p) => (p === 'loading' ? 'clip' : p)))
      .catch(() => live && setPhase((p) => (p === 'loading' ? 'still' : p)));
    const id = setTimeout(() => setPhase((p) => (p === 'loading' ? 'still' : p)), MAX_WAIT_MS);
    return () => {
      live = false;
      clearTimeout(id);
    };
  }, [reduce]);

  // The choreography: hop and wave, glow and coins, the bubble, the title, the loader.
  useEffect(() => {
    if (!started) return;
    fill.set(withTiming(1, { duration: total - FADE_MS, easing: Easing.inOut(Easing.cubic) }));
    if (reduce) return;
    const clip = phase === 'clip';
    const timers = [
      setTimeout(() => {
        playSfx('kipHi');
        grow.set(withSpring(1, { damping: 12, stiffness: 120 }));
        if (clip) {
          setWaving(true);
          still.set(withTiming(0, { duration: 70 }));
        } else {
          jump.set(withSequence(withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }), withSpring(0, { damping: 9, stiffness: 160 })));
        }
      }, HOP_AT),
      // A little squash as he lands.
      setTimeout(() => hop.set(withSequence(withTiming(1, { duration: 90 }), withSpring(0, { damping: 8, stiffness: 220 }))), LANDS_AT),
    ];
    glow.set(withDelay(HOP_AT + 120, withSpring(1, { damping: 14 })));
    burst.set(withDelay(LANDS_AT, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) })));
    bubble.set(withDelay(BUBBLE_AT, withSpring(1, { damping: 11, stiffness: 160 })));
    title.set(withDelay(TITLE_AT, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) })));
    return () => timers.forEach(clearTimeout);
  }, [started, phase, reduce, total, fill, still, hop, jump, grow, glow, burst, bubble, title]);

  // Clip frames, swapped in place (never a blank frame) and timed by the clock, so the picture
  // stays in step with the sound even if a frame is late.
  useEffect(() => {
    if (!waving) return;
    const start = clock();
    const id = setInterval(() => {
      const f = Math.min(Math.floor(((clock() - start) * HI.fps) / 1000), last);
      setFrame(f);
      if (f >= last) clearInterval(id);
    }, 1000 / HI.fps);
    return () => clearInterval(id);
  }, [waving, last]);

  // Kip's line types itself out after the "Hii!".
  useEffect(() => {
    if (reduce || !started) return;
    let typer: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      typer = setInterval(() => setTyped((n) => (n >= lines.line.length ? n : n + 2)), 22);
    }, LINE_AT);
    return () => {
      clearTimeout(start);
      clearInterval(typer);
    };
  }, [reduce, started, lines.line.length]);

  // Loader captions, then fade out and hand over to the app.
  useEffect(() => {
    if (!started) return;
    const step = (total - FADE_MS) / INTRO_LOADING.length;
    const captions = INTRO_LOADING.slice(1).map((_, i) => setTimeout(() => setCaption(i + 1), step * (i + 1)));
    const end = setTimeout(() => setLeaving(true), total - FADE_MS);
    return () => {
      captions.forEach(clearTimeout);
      clearTimeout(end);
    };
  }, [started, total]);

  useEffect(() => {
    if (!leaving) return;
    fade.set(withTiming(0, { duration: FADE_MS, easing: Easing.in(Easing.quad) }));
    const id = setTimeout(onDone, FADE_MS);
    return () => clearTimeout(id);
  }, [leaving, fade, onDone]);

  const left = (W - BOX) / 2;
  const top = (H - BOX) / 2;
  const kipCenterY = H / 2;
  const kipTop = kipCenterY - KIP_HALF * GROW;
  const kipBottom = kipCenterY + KIP_HALF * GROW;
  const bubbleW = Math.min(W - 40, 310);

  const rootStyle = useAnimatedStyle(() => ({ opacity: fade.get() }));
  const kipStyle = useAnimatedStyle(() => ({ transform: [{ translateY: 6 * hop.get() - 28 * jump.get() }, { scaleX: 1 + (GROW - 1) * grow.get() + 0.05 * hop.get() + 0.05 * (1 - fade.get()) }, { scaleY: 1 + (GROW - 1) * grow.get() - 0.05 * hop.get() + 0.05 * (1 - fade.get()) }] }));
  const stillStyle = useAnimatedStyle(() => ({ opacity: still.get() }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.9 * glow.get(), transform: [{ scale: 0.55 + 0.45 * glow.get() }] }));
  const bubbleStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, bubble.get() * 1.5), transform: [{ scale: 0.4 + 0.6 * bubble.get() }] }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: title.get(), transform: [{ translateY: 14 * (1 - title.get()) }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.get() * 100}%` }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, rootStyle]} pointerEvents={leaving ? 'none' : 'auto'}>
      <Pressable
        testID="kip-intro"
        style={StyleSheet.absoluteFill}
        onPress={() => {
          if (clock() - startedAt > 500) setLeaving(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Kip waves: ${lines.hi} ${lines.line} Loading Kip: Money Quest. Tap to skip.`}>
        {/* Soft glow and a burst of coins behind Kip */}
        <Animated.View style={[styles.glow, { left: W / 2 - 150, top: kipCenterY - 150 }, glowStyle]} />
        {Array.from({ length: COINS }, (_, i) => (
          <BurstCoin key={i} i={i} burst={burst} cx={W / 2} cy={kipCenterY - 10} />
        ))}

        {/* Kip: the splash still, then the "Hii!" clip lined up on top of it */}
        <Animated.View style={[{ position: 'absolute', left, top, width: BOX, height: BOX }, kipStyle]}>
          <Image source={HI.frames[frame]} style={{ position: 'absolute', left: HI_LEFT, top: HI_TOP, width: HI_W, height: HI_H }} contentFit="contain" cachePolicy="memory" accessible={false} />
          <Animated.View style={[StyleSheet.absoluteFill, stillStyle]}>
            <Image source={SPLASH} style={{ width: BOX, height: BOX }} contentFit="contain" onLoad={() => SplashScreen.hideAsync().catch(() => {})} accessible={false} />
          </Animated.View>
        </Animated.View>

        {/* "Hii!" bubble above Kip's head */}
        <Animated.View style={[styles.bubble, { width: bubbleW, left: (W - bubbleW) / 2 + 14, bottom: H - kipTop + 24, transformOrigin: '30% 100%' }, bubbleStyle]}>
          <Text style={[type.hero, { fontSize: 30, textAlign: 'center' }]}>{lines.hi}</Text>
          <Text style={[type.body, { fontSize: 16, lineHeight: 22, textAlign: 'center', color: colors.inkSoft }]}>
            {lines.line.slice(0, typed)}
            <Text style={{ color: 'transparent' }}>{lines.line.slice(typed)}</Text>
          </Text>
          <View style={styles.tail} />
        </Animated.View>

        {/* Title and loader under Kip's feet */}
        <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: kipBottom + 22, alignItems: 'center', gap: 6 }, titleStyle]}>
          <Text style={styles.word}>
            Kip<Text style={{ color: colors.shellDark }}>:</Text> Money Quest
          </Text>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, fillStyle]} />
          </View>
          <Text style={[type.tiny, { color: colors.inkSoft }]}>{INTRO_LOADING[caption]}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/** One coin flying out from behind Kip, then settling into a slow drift. */
function BurstCoin({ i, burst, cx, cy }: { i: number; burst: SharedValue<number>; cx: number; cy: number }) {
  const angle = (i / COINS) * Math.PI * 2 + 0.35;
  const dist = 120 + (i % 3) * 22;
  const size = 22 + (i % 3) * 6;
  const style = useAnimatedStyle(() => {
    const b = burst.get();
    return {
      opacity: b < 0.05 ? 0 : Math.min(1, b * 3) * (1 - 0.35 * b),
      transform: [{ translateX: Math.cos(angle) * dist * b }, { translateY: Math.sin(angle) * dist * 0.85 * b - 10 * b }, { rotate: `${(i % 2 ? 1 : -1) * 220 * b}deg` }, { scale: 0.4 + 0.6 * b }],
    };
  });
  return (
    <Animated.View style={[{ position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size }, style]} pointerEvents="none">
      <Image source={PROPS.coin} style={{ width: size, height: size }} contentFit="contain" accessible={false} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.cream, zIndex: 100, elevation: 100 },
  glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: colors.kipLight },
  bubble: { position: 'absolute', backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: 12, paddingHorizontal: 16, gap: 4, borderWidth: 2, borderColor: colors.line, ...shadow },
  tail: { position: 'absolute', bottom: -10, left: '30%', width: 20, height: 20, backgroundColor: colors.surface, transform: [{ rotate: '45deg' }], borderRightWidth: 2, borderBottomWidth: 2, borderColor: colors.line },
  word: { fontFamily: type.hero.fontFamily, fontSize: 28, fontWeight: '900', color: colors.kipDark, letterSpacing: -0.4 },
  track: { width: 180, height: 10, borderRadius: 5, backgroundColor: colors.line, overflow: 'hidden', marginTop: 6 },
  fill: { height: 10, borderRadius: 5, backgroundColor: colors.kip },
});
