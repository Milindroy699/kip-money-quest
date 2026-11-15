/**
 * Guided Answer Gates: the run has eased to a stop, so the question gets a calm card at the bottom
 * (the gates stay visible up the road). Pick an answer, see if it was right, then Kip says which
 * gate to run through. Options sit in lane order, so each one lines up with its gate.
 */
import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Character } from '../../mascot/Character';
import { colors, radius, shadow, space, type } from '../../ui/theme';
import type { Lane } from './engine';

export const LANE_GLYPH: Record<Lane, string> = { [-1]: '◀', 0: '▲', 1: '▶' } as Record<Lane, string>;
export const LANE_NAME: Record<Lane, string> = { [-1]: 'LEFT', 0: 'MIDDLE', 1: 'RIGHT' } as Record<Lane, string>;
const LANES: Lane[] = [-1, 0, 1];

export function AskCard({
  question,
  options,
  phase,
  picked,
  correctLane,
  onPick,
  onGo,
  autoGoMs,
}: {
  question: string;
  /** Answers in lane order: left, middle, right. */
  options: string[];
  phase: 'asking' | 'answered';
  picked: Lane | null;
  correctLane: Lane;
  onPick: (lane: Lane) => void;
  onGo: () => void;
  /** Once answered, the run goes on by itself after this long; the Go button fills up meanwhile. */
  autoGoMs: number;
}) {
  const [slide] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.spring(slide, { toValue: 1, useNativeDriver: true, friction: 8, tension: 70 }).start();
  }, [slide]);
  const answered = phase === 'answered';
  const [timer] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!answered) return;
    const anim = Animated.timing(timer, { toValue: 1, duration: autoGoMs, useNativeDriver: false });
    anim.start();
    return () => anim.stop();
  }, [answered, autoGoMs, timer]);
  const right = answered && picked === correctLane;
  const answer = options[correctLane + 1];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <View style={styles.scrim} pointerEvents="none" />
      <Animated.View
        style={[styles.sheet, { opacity: slide, transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }] }]}
        accessibilityViewIsModal
        accessibilityLiveRegion="polite">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(1) }}>
          <Character name="kip" mood={!answered ? 'think' : right ? 'cheer' : 'worry'} size={52} animate={false} />
          <View style={{ flex: 1 }}>
            <Text style={[type.tiny, { color: colors.meltDark, letterSpacing: 1 }]}>{!answered ? '❓ QUESTION GATE · TAKE YOUR TIME' : right ? '✅ NAILED IT!' : '💡 NOT QUITE'}</Text>
            <Text style={[type.h2, { fontSize: 19 }]} accessibilityRole="header">
              {question}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: space(1) }}>
          {LANES.map((lane) => {
            const isRight = lane === correctLane;
            const isPicked = lane === picked;
            const tone = !answered ? 'idle' : isRight ? 'right' : isPicked ? 'wrong' : 'faded';
            return (
              <Pressable
                key={lane}
                testID={`ask-${LANE_NAME[lane].toLowerCase()}`}
                disabled={answered}
                onPress={() => onPick(lane)}
                accessibilityRole="button"
                accessibilityLabel={`${LANE_NAME[lane].toLowerCase()} gate: ${options[lane + 1]}`}
                accessibilityState={{ disabled: answered, selected: isPicked }}
                style={({ pressed }) => [styles.option, TONES[tone], pressed && { transform: [{ scale: 0.96 }] }]}>
                <View style={[styles.glyph, { backgroundColor: tone === 'right' ? colors.kipDark : tone === 'wrong' ? colors.error : colors.meltDark }]}>
                  <Text style={styles.glyphText}>{tone === 'right' ? '✓' : tone === 'wrong' ? '✗' : LANE_GLYPH[lane]}</Text>
                </View>
                <Text style={[type.small, { color: colors.ink, fontWeight: '800', textAlign: 'center' }]} numberOfLines={3}>
                  {options[lane + 1]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {answered ? (
          <View style={{ gap: space(1) }}>
            <Text style={[type.small, { color: colors.ink, textAlign: 'center' }]}>
              {right ? 'Now bank it: ' : `The answer is “${answer}”. Still bank your coins: `}
              <Text style={{ fontWeight: '800', color: colors.kipDark }}>
                run through the {LANE_GLYPH[correctLane]} {LANE_NAME[correctLane]} gate
              </Text>
              .
            </Text>
            <Pressable testID="ask-go" onPress={onGo} accessibilityRole="button" accessibilityLabel={`Go. Run through the ${LANE_NAME[correctLane].toLowerCase()} gate.`} style={({ pressed }) => [styles.go, pressed && { transform: [{ translateY: 2 }] }]}>
              <Animated.View style={[styles.goTimer, { width: timer.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
              <Text style={[type.bodyBold, { color: '#fff' }]}>
                Go {LANE_GLYPH[correctLane]} {correctLane === 0 ? 'straight ahead' : `swipe ${LANE_NAME[correctLane].toLowerCase()}`}
              </Text>
            </Pressable>
          </View>
        ) : (
          <Text style={[type.tiny, { textAlign: 'center' }]}>The run is paused. Tap the answer you think is right.</Text>
        )}
      </Animated.View>
    </View>
  );
}

const TONES = {
  idle: { backgroundColor: '#fff', borderColor: colors.melt },
  right: { backgroundColor: colors.kipLight, borderColor: colors.kip },
  wrong: { backgroundColor: colors.errorLight, borderColor: colors.error },
  faded: { backgroundColor: '#fff', borderColor: colors.line, opacity: 0.55 },
};

const styles = StyleSheet.create({
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(30,42,58,0.28)' },
  sheet: {
    position: 'absolute',
    left: space(1.5),
    right: space(1.5),
    bottom: space(3),
    backgroundColor: colors.cream,
    borderRadius: radius.xl,
    padding: space(2),
    gap: space(1.5),
    borderWidth: 2,
    borderColor: colors.melt,
    ...shadow,
  },
  option: { flex: 1, minHeight: 96, borderRadius: radius.md, borderWidth: 2, borderBottomWidth: 4, padding: space(1), alignItems: 'center', justifyContent: 'center', gap: 6 },
  glyph: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  glyphText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  go: { backgroundColor: colors.kip, borderRadius: radius.pill, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 4, borderColor: colors.kipDark, overflow: 'hidden' },
  goTimer: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.22)' },
});
