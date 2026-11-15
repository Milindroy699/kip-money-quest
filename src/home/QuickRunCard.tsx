/**
 * Kip Run's own spot on Home: a little scene of Kip striding away from The Melt over the Money
 * Town skyline, and one tap straight into a 2-minute Inflation Chase (no picker). When today's
 * streak deposit isn't in yet, it says a run counts.
 */
import { Image } from 'expo-image';
import { router, useIsFocused } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { BACKGROUNDS, PROPS } from '../art';
import { ANIMS, type SpriteAnimation } from '../art/anims';
import { AnimatedSprite } from '../mascot/Character';
import { colors, radius, shadow, space, type } from '../ui/theme';

const still = (a: SpriteAnimation): SpriteAnimation => ({ ...a, loop: false, frames: [a.frames[0]] });
const KIP_STILL = still(ANIMS.kipMapSide);
const MELT_STILL = still(ANIMS.meltChase);

export function QuickRunCard({ streakOpen, best, runsLeft }: { streakOpen: boolean; best: number; runsLeft: number }) {
  // Only move while Home is on screen (tabs stay mounted).
  const focused = useIsFocused();
  const reduce = useReducedMotion();
  const moving = focused && !reduce;
  const line = streakOpen ? 'One run counts as today’s Knowledge SIP deposit.' : runsLeft > 0 ? `${runsLeft} coin run${runsLeft === 1 ? '' : 's'} left today` : 'Practice runs are free all day';

  return (
    <Pressable
      testID="quick-run"
      onPress={() => router.push({ pathname: '/run/[mode]', params: { mode: 'inflation', quick: '1' } })}
      accessibilityRole="button"
      accessibilityLabel={`Quick Kip Run, 2 minutes. Outrun The Melt. ${line}.${best ? ` Your best: ${best}.` : ''} Play.`}
      style={({ pressed }) => pressed && { transform: [{ scale: 0.98 }] }}>
      <View style={styles.card}>
        {/* Oversized and anchored top-left, so the art's watermark sparkle (bottom-right corner) stays out of view. */}
        <Image source={BACKGROUNDS.moneyTown} style={{ position: 'absolute', left: 0, top: 0, width: '116%', height: '122%' }} contentFit="cover" contentPosition="bottom" accessible={false} />
        <View style={[StyleSheet.absoluteFill, { backgroundImage: 'linear-gradient(90deg, rgba(30,42,58,0.88) 0%, rgba(30,42,58,0.55) 48%, rgba(30,42,58,0) 78%)' }]} pointerEvents="none" />
        {/* the road, with lane dashes */}
        <View style={styles.road}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.dash} />
          ))}
        </View>

        {/* The Melt chasing from the right, Kip striding left toward the button */}
        <View style={{ position: 'absolute', right: -26, bottom: 6 }} pointerEvents="none">
          <AnimatedSprite anim={moving ? ANIMS.meltChase : MELT_STILL} width={96} height={60} label="The Melt" />
        </View>
        <View style={{ position: 'absolute', right: 58, bottom: 12, transform: [{ scaleX: -1 }] }} pointerEvents="none">
          <AnimatedSprite anim={moving ? ANIMS.kipMapSide : KIP_STILL} width={108} height={108 / ANIMS.kipMapSide.aspect} label="Kip running" />
        </View>
        {/* Coins on the road ahead of Kip (never over him or the text). */}
        <Image source={PROPS.coin} style={[styles.coin, { right: 176, bottom: 9, width: 20, height: 20 }]} contentFit="contain" accessible={false} />
        <Image source={PROPS.coin} style={[styles.coin, { right: 204, bottom: 7, width: 17, height: 17 }]} contentFit="contain" accessible={false} />

        <View style={{ maxWidth: '58%', gap: 4 }}>
          <View style={styles.tag}>
            <Text style={[type.tiny, { color: colors.ink, fontWeight: '900', letterSpacing: 0.8 }]}>⚡ QUICK RUN · 2 MIN</Text>
          </View>
          <Text style={[type.h2, { color: '#fff', fontSize: 22 }]}>Outrun The Melt</Text>
          <Text style={[type.small, { color: 'rgba(255,255,255,0.9)' }]} numberOfLines={2}>
            {line}
          </Text>
          {best ? <Text style={[type.tiny, { color: colors.coin, fontWeight: '800' }]}>🏅 Your best: {best}</Text> : null}
          <View style={styles.play}>
            <Text style={[type.bodyBold, { color: '#fff' }]}>Play ▶</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 176, borderRadius: radius.xl, overflow: 'hidden', padding: space(2), justifyContent: 'center', backgroundColor: colors.ink, ...shadow },
  road: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 30, backgroundColor: 'rgba(244,222,182,0.92)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderTopWidth: 2, borderColor: 'rgba(199,158,110,0.8)' },
  dash: { width: 22, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.9)' },
  coin: { position: 'absolute', width: 24, height: 24 },
  tag: { alignSelf: 'flex-start', backgroundColor: colors.coin, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  play: { alignSelf: 'flex-start', marginTop: 6, backgroundColor: colors.kip, borderRadius: radius.pill, paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 3, borderColor: colors.kipDark },
});
