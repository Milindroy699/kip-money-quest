/** Collectible asset/strategy card with a rarity frame and readable stat bars. */
import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { MENTORS } from '../../art';
import { CARD_ART } from '../../art/cards';
import type { CardT } from '../../content/schema';
import { colors, shadow, type } from '../../ui/theme';

const STAT_LABELS: [keyof NonNullable<CardT['stats']>, string][] = [
  ['return', 'Return'],
  ['risk', 'Risk'],
  ['liquidity', 'Liquidity'],
  ['lockIn', 'Lock-in'],
  ['complexity', 'Complexity'],
];

const STAT_COLORS: Record<string, string> = {
  return: colors.kip,
  risk: colors.dash,
  liquidity: '#3B9EFF',
  lockIn: colors.melt,
  complexity: colors.ink,
};

export function StatBars({ stats, compact }: { stats: NonNullable<CardT['stats']>; compact?: boolean }) {
  return (
    <View style={{ gap: compact ? 3 : 6 }}>
      {STAT_LABELS.map(([key, label]) => (
        <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} accessibilityLabel={`${label} ${stats[key]} out of 5`}>
          <Text style={[type.tiny, { width: compact ? 62 : 82, color: colors.inkSoft, fontSize: compact ? 10 : 12 }]}>{label}</Text>
          <View style={{ flexDirection: 'row', gap: 2, flex: 1 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={{ flex: 1, height: compact ? 5 : 8, borderRadius: 3, backgroundColor: i <= stats[key] ? STAT_COLORS[key] : colors.line }} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const RARITY_STARS = { common: 1, rare: 2, epic: 3, legendary: 4 } as const;

export function AssetCard({ card, locked, compact, isNew }: { card: CardT; locked?: boolean; compact?: boolean; isNew?: boolean }) {
  const frame = colors.rarity[card.rarity];
  const art = CARD_ART[card.id] ?? MENTORS[card.id];
  const stage = compact ? 92 : 150;
  if (locked) {
    return (
      <View style={{ borderRadius: 20, padding: 3, backgroundColor: '#3A4558' }}>
        <View style={{ borderRadius: 17, backgroundColor: '#232C3B', minHeight: compact ? 196 : 280, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 }}>
          <View style={{ width: stage * 0.8, height: stage * 0.8, borderRadius: stage, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}>
            {art ? (
              <Image source={art} style={{ width: stage * 0.7, height: stage * 0.7, opacity: 0.5 }} contentFit="contain" tintColor="#0B1420" accessible={false} />
            ) : (
              <Text style={{ fontSize: compact ? 34 : 48, opacity: 0.18 }}>{card.emoji}</Text>
            )}
          </View>
          <Text style={[type.tiny, { color: '#C9D1DE', fontWeight: '800' }]}>🔒 {'★'.repeat(RARITY_STARS[card.rarity])}</Text>
          <Text style={[type.tiny, { color: '#9AA6B8', textAlign: 'center' }]}>Unlocks in World {card.world}</Text>
        </View>
      </View>
    );
  }
  return (
    // A thick frame in the rarity colour, a header band, the art on a glowing stage, then the stats.
    <View style={{ borderRadius: 20, padding: 3, backgroundColor: frame, ...shadow, shadowOpacity: 0.18 }}>
      <View style={{ borderRadius: 17, backgroundColor: colors.surface, overflow: 'hidden' }}>
        <View style={{ backgroundColor: frame, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: compact ? 8 : 12, paddingTop: 3, paddingBottom: 5 }}>
          <Text style={[type.tiny, { color: '#fff', fontWeight: '900', letterSpacing: 0.8, fontSize: compact ? 10 : 12 }]}>
            {card.rarity.toUpperCase()} {'★'.repeat(RARITY_STARS[card.rarity])}
          </Text>
          <Text style={[type.tiny, { color: '#fff', fontWeight: '700', fontSize: compact ? 10 : 12 }]}>{card.kind === 'strategy' ? '🧭 Strategy' : '💼 Asset'}</Text>
        </View>
        <View style={{ height: stage, alignItems: 'center', justifyContent: 'center', backgroundColor: frame + '1F' }}>
          <View style={{ position: 'absolute', width: stage * 0.95, height: stage * 0.95, borderRadius: stage, backgroundColor: frame, opacity: 0.16 }} />
          <View style={{ position: 'absolute', width: stage * 0.62, height: stage * 0.62, borderRadius: stage, backgroundColor: '#fff', opacity: 0.55 }} />
          {art ? (
            <Image source={art} style={{ width: '92%', height: '92%' }} contentFit="contain" accessibilityLabel={card.mentor ?? card.name} />
          ) : (
            <Text style={{ fontSize: compact ? 44 : 68 }}>{card.emoji}</Text>
          )}
          {isNew ? (
            <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: colors.dash, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 2, borderColor: '#fff' }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>NEW</Text>
            </View>
          ) : null}
        </View>
        <View style={{ padding: compact ? 9 : 14, gap: compact ? 6 : 8 }}>
          <Text style={[compact ? type.bodyBold : type.h2]} numberOfLines={1} adjustsFontSizeToFit>
            {card.name}
          </Text>
          {!compact ? <Text style={type.small}>{card.oneLiner}</Text> : null}
          {card.stats ? (
            <StatBars stats={card.stats} compact={compact} />
          ) : (
            <View style={{ gap: 4 }}>
              {(card.traits ?? []).slice(0, compact ? 2 : 3).map((t) => (
                <Text key={t} style={[type.tiny, { color: colors.inkSoft }]} numberOfLines={compact ? 2 : undefined}>
                  • {t}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
