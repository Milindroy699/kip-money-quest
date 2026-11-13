/**
 * "For you today" as a swipeable row of picture cards: each one a coloured card with its map
 * building (or Kip), a short line, and a button that does the thing. The next card peeks in from
 * the right, and dots show where you are.
 */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { KIP } from '../art';
import { spriteFor } from '../campus/art';
import type { SkinId } from '../campus/skins';
import type { TodayArt, TodayNudge } from '../engagement/today';
import { colors, radius, shadow, space, type } from '../ui/theme';

const GUTTER = space(2.5);
const GAP = space(1.5);
const PEEK = 34;

const THEMES: Record<TodayNudge['tone'], { bg: string; ink: string; soft: string; button: string; buttonInk: string }> = {
  green: { bg: 'linear-gradient(135deg, #3CCB8B 0%, #1F9A63 100%)', ink: '#fff', soft: 'rgba(255,255,255,0.9)', button: '#fff', buttonInk: colors.kipDark },
  gold: { bg: 'linear-gradient(135deg, #FFD66B 0%, #F2B544 55%, #E09A22 100%)', ink: colors.ink, soft: 'rgba(30,42,58,0.8)', button: colors.ink, buttonInk: '#fff' },
  purple: { bg: 'linear-gradient(135deg, #A47BFF 0%, #6D3FD6 100%)', ink: '#fff', soft: 'rgba(255,255,255,0.9)', button: '#fff', buttonInk: colors.meltDark },
  plain: { bg: 'linear-gradient(135deg, #34465F 0%, #1E2A3A 100%)', ink: '#fff', soft: 'rgba(255,255,255,0.85)', button: colors.coin, buttonInk: colors.ink },
};

function artFor(art: TodayArt, skin: SkinId): { source: number; aspect: number } | null {
  if (art === 'kipThink') return { source: KIP.think, aspect: 0.94 };
  if (art === 'kipSleepy') return { source: KIP.sleepy, aspect: 0.96 };
  const sprite = spriteFor(skin, art === 'map' ? 'gate' : art);
  return sprite ? { source: sprite.src, aspect: sprite.aspect } : null;
}

export function NudgeCarousel({ nudges, skin, onTurnOnReminders }: { nudges: TodayNudge[]; skin: SkinId; onTurnOnReminders: () => void }) {
  const { width } = useWindowDimensions();
  const single = nudges.length === 1;
  const cardW = single ? width - GUTTER * 2 : width - GUTTER * 2 - PEEK;
  const [page, setPage] = useState(0);

  return (
    <View style={{ gap: space(1) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={styles.heading}>For you today</Text>
        {nudges.length > 1 ? <Text style={[type.tiny, { color: colors.inkSoft }]}>Swipe for more ›</Text> : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardW + GAP}
        decelerationRate="fast"
        disableIntervalMomentum
        // Bleed to the screen edges so cards slide in from the side, not out of a box.
        style={{ marginHorizontal: -GUTTER }}
        contentContainerStyle={{ paddingHorizontal: GUTTER, gap: GAP }}
        onScroll={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / (cardW + GAP)))}
        scrollEventThrottle={32}>
        {nudges.map((n) => (
          <NudgeCard key={n.id} nudge={n} width={cardW} skin={skin} onTurnOnReminders={onTurnOnReminders} />
        ))}
      </ScrollView>
      {nudges.length > 1 ? (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {nudges.map((n, i) => (
            <View key={n.id} style={{ width: i === page ? 18 : 7, height: 7, borderRadius: 4, backgroundColor: i === page ? colors.ink : 'rgba(30,42,58,0.25)' }} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function NudgeCard({ nudge: n, width, skin, onTurnOnReminders }: { nudge: TodayNudge; width: number; skin: SkinId; onTurnOnReminders: () => void }) {
  const theme = THEMES[n.tone];
  const art = artFor(n.art, skin);
  const onPress = () => {
    if (n.action.kind === 'reminders') onTurnOnReminders();
    else if (n.action.kind === 'campus') router.navigate({ pathname: '/campus', params: { focus: n.action.focus } });
    else router.push(n.action.href);
  };
  return (
    <Pressable testID={`nudge-${n.id}`} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${n.title}. ${n.text} ${n.cta}.`} style={({ pressed }) => [{ width }, pressed && { transform: [{ scale: 0.98 }] }]}>
      <View style={[styles.card, { backgroundImage: theme.bg }]}>
        {/* soft light circles for depth */}
        <View style={[styles.bubble, { width: 180, height: 180, right: -50, top: -60 }]} />
        <View style={[styles.bubble, { width: 110, height: 110, right: 40, bottom: -60 }]} />
        {art ? <Image source={art.source} style={[styles.art, { width: 112, height: Math.min(112 / art.aspect, 124) }]} contentFit="contain" accessible={false} /> : null}
        <View style={{ flex: 1, paddingRight: art ? 104 : 0, gap: 4 }}>
          <Text style={{ fontSize: 22 }}>{n.emoji}</Text>
          <Text style={[type.bodyBold, { color: theme.ink, fontSize: 18, lineHeight: 22 }]} numberOfLines={2}>
            {n.title}
          </Text>
          <Text style={[type.small, { color: theme.soft }]} numberOfLines={3}>
            {n.text}
          </Text>
        </View>
        <View style={[styles.cta, { backgroundColor: theme.button }]}>
          <Text style={[type.small, { color: theme.buttonInk, fontWeight: '900' }]}>{n.cta} ›</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heading: { ...type.h2, fontSize: 18 },
  card: { minHeight: 188, borderRadius: radius.xl, padding: space(2), overflow: 'hidden', gap: space(1.5), ...shadow },
  bubble: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)' },
  art: { position: 'absolute', right: 6, top: 18 },
  cta: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9 },
});
