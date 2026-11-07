/**
 * Kip, Dash and The Melt, rendered from the processed 3D art in assets/characters.
 * Every screen uses this one component, so swapping art never touches screens.
 */
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { bustFor, fullBodyFor } from '../art';
import { ANIMS, type SpriteAnimation } from '../art/anims';
import { KIP_WAVE_FRAMES } from '../art/kipWave';
import type { MoodT, SpeakerT } from '../content/schema';
import { colors, type } from '../ui/theme';

export interface CharacterProps {
  name: SpeakerT;
  mood?: MoodT;
  size?: number;
  /** "bust" shows the face close-up for expressions; "full" shows the whole body. */
  pose?: 'bust' | 'full';
  /** Kip's shell growth rings (one per streak week), shown as a badge. */
  rings?: number;
  animate?: boolean;
}

const LABELS: Record<SpeakerT, string> = { kip: 'Kip the tortoise', dash: 'Dash the hare', melt: 'The Melt' };

function useBob(animate: boolean) {
  const [y] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!animate) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: -4, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animate, y]);
  return y;
}

/**
 * Real animation (cut from the Veo clips) for a speaker's mood, where we have one.
 * Dash: talking loop, or a one-shot reaction that ends on a calm pose. The Melt: chuckling, or laughing.
 */
function animationFor(name: SpeakerT, mood: MoodT, pose: 'bust' | 'full'): SpriteAnimation | null {
  if (pose !== 'bust') return null;
  if (name === 'dash') return { happy: ANIMS.dashTalk, talk: ANIMS.dashTalk, cheer: ANIMS.dashExcited, worry: ANIMS.dashPanicked, think: ANIMS.dashSheepish }[mood];
  if (name === 'melt') return mood === 'cheer' ? ANIMS.meltLaugh : ANIMS.meltTalk;
  return null;
}

export function Character({ name, mood = 'happy', size = 160, pose = 'bust', rings = 0, animate = true }: CharacterProps) {
  const anim = animate ? animationFor(name, mood, pose) : null;
  const y = useBob(animate && !anim);
  // Wide clips (The Melt's fog) get a wider box at the same height, so they aren't shrunk.
  if (anim) return <AnimatedSprite anim={anim} width={size * Math.max(1, anim.aspect)} height={size} label={LABELS[name]} />;
  const source = pose === 'full' ? fullBodyFor(name) : bustFor(name, mood);
  return (
    <Animated.View style={{ width: size, height: size, transform: [{ translateY: y }] }} accessible accessibilityRole="image" accessibilityLabel={LABELS[name]}>
      <Image source={source} style={{ width: size, height: size }} contentFit="contain" transition={120} />
      {name === 'kip' && rings > 0 ? <RingBadge rings={rings} /> : null}
    </Animated.View>
  );
}

function RingBadge({ rings }: { rings: number }) {
  return (
    <View
      style={{ position: 'absolute', right: 0, bottom: 4, backgroundColor: colors.shell, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 2, borderColor: '#fff' }}
      accessibilityLabel={`${rings} growth rings`}>
      <Text style={[type.tiny, { color: colors.ink, fontWeight: '800' }]}>◎ {rings}</Text>
    </View>
  );
}

/**
 * Plays a sprite animation: loops, or plays once and holds the last frame.
 * With Reduce Motion on it shows one still frame (the settled pose).
 */
export function AnimatedSprite({ anim, width, height, label }: { anim: SpriteAnimation; width: number; height: number; label: string }) {
  const reduceMotion = useReducedMotion();
  const [state, setState] = useState({ anim, frame: 0 });
  if (state.anim !== anim) setState({ anim, frame: 0 }); // new clip (e.g. mood change): start over
  const count = anim.frames.length;
  const playing = !reduceMotion && (anim.loop || state.frame < count - 1);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setState((st) => (st.anim !== anim ? st : { anim, frame: st.frame + 1 < count ? st.frame + 1 : anim.loop ? 0 : st.frame }));
    }, 1000 / anim.fps);
    return () => clearInterval(id);
  }, [anim, count, playing]);
  const frame = reduceMotion ? (anim.loop ? 0 : count - 1) : Math.min(state.frame, count - 1);
  return (
    <View style={{ width, height }} accessible accessibilityRole="image" accessibilityLabel={label}>
      <Image source={anim.frames[frame]} style={{ width, height }} contentFit="contain" cachePolicy="memory" />
    </View>
  );
}

const KIP_WAVE: SpriteAnimation = { frames: KIP_WAVE_FRAMES, fps: 12, loop: false, aspect: 0.89 };
const KIP_WAVE_LOOP: SpriteAnimation = { ...KIP_WAVE, loop: true };

/** Kip waving hello: plays the wave sprite once, then holds the last (smiling) frame. */
export function KipWave({ size = 200, loop = false }: { size?: number; loop?: boolean }) {
  return <AnimatedSprite anim={loop ? KIP_WAVE_LOOP : KIP_WAVE} width={size * 0.89} height={size} label="Kip waving hello" />;
}

