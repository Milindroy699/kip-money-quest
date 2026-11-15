/**
 * Trophies tab: the Trophy Room (achievements on cabinet shelves), your stats, and the card deck.
 * Every trophy and card is earned by learning: no luck, no loot boxes.
 */
import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { CARDS, pathFor, trackFor } from '@/content';
import { nextTrophy } from '@/engagement/achievements';
import { displayStreak, MAX_FREEZES } from '@/engagement/streak';
import { useAchievements } from '@/engagement/useAchievements';
import { AssetCard } from '@/game/cards/AssetCard';
import { useGame } from '@/state/game';
import { Backdrop } from '@/ui/Backdrop';
import { Screen, StatBar } from '@/ui/components';
import { Segmented } from '@/ui/Slider';
import { space, type } from '@/ui/theme';
import { TrophyCabinet } from '@/ui/TrophyCabinet';

type Filter = 'all' | 'asset' | 'strategy';

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export default function Trophies() {
  const g = useGame();
  const owned = g.cards;
  const streak = displayStreak(g.streak, g.today());
  const finiq = g.finIQ();
  const statuses = useAchievements();
  const next = nextTrophy(statuses);
  const [filter, setFilter] = useState<Filter>('all');
  // Light status bar text on the dark Trophy Room; back to dark when you leave the tab.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );
  const list = CARDS.filter((c) => filter === 'all' || c.kind === filter).sort((a, b) => Number(owned.includes(b.id)) - Number(owned.includes(a.id)) || a.world - b.world);

  const stats: { emoji: string; value: string; label: string }[] = [
    { emoji: '🔥', value: plural(g.streak.longest, 'day'), label: 'Best streak' },
    { emoji: '📘', value: `${Object.keys(g.lessons).length}/${pathFor(trackFor(g.profile.ageBand)).length}`, label: 'Lessons' },
    { emoji: '🃏', value: `${owned.length}/${CARDS.length}`, label: 'Cards' },
    { emoji: '🏃', value: `${g.runs.count}`, label: 'Kip Runs' },
    { emoji: '⭐', value: `${g.xp}`, label: 'Total XP' },
    { emoji: '🛡️', value: `${g.streak.freezes}/${MAX_FREEZES}`, label: 'Freezes' },
  ];

  return (
    <Backdrop art="trophyRoom" scrim="dark">
      <Screen style={{ backgroundColor: 'transparent' }}>
        <StatBar streak={streak} coins={g.coins} finiq={finiq} />
        <FlatList
          data={list}
          keyExtractor={(c) => c.id}
          numColumns={2}
          columnWrapperStyle={{ gap: space(1.5) }}
          contentContainerStyle={{ padding: space(2.5), gap: space(1.5), paddingBottom: space(12) }}
          ListHeaderComponent={
            <View style={{ gap: space(1.5), marginBottom: space(1) }}>
              <Text style={[type.title, { color: '#fff' }]}>Trophies</Text>
              {next ? (
                <Text style={[type.small, { color: '#DCE3EE' }]}>
                  Next up: {next.achievement.emoji} {next.achievement.title}. {next.achievement.how}.
                </Text>
              ) : (
                <Text style={[type.small, { color: '#DCE3EE' }]}>Every trophy earned. Legend.</Text>
              )}
              <TrophyCabinet statuses={statuses} />

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(1) }}>
                {stats.map((s) => (
                  <View key={s.label} style={{ flexBasis: '30%', flexGrow: 1, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, paddingVertical: space(1.25), paddingHorizontal: space(1.25), gap: 2 }}>
                    <Text style={{ fontSize: 18 }}>{s.emoji}</Text>
                    <Text style={[type.bodyBold, { fontSize: 17 }]} numberOfLines={1} adjustsFontSizeToFit>
                      {s.value}
                    </Text>
                    <Text style={type.tiny}>{s.label}</Text>
                  </View>
                ))}
              </View>

              <Text style={[type.title, { color: '#fff', marginTop: space(1) }]}>
                My Deck · {owned.length} / {CARDS.length}
              </Text>
              <Text style={[type.small, { color: '#DCE3EE' }]}>Every product and strategy is a card. Unlock them by mastering lessons. No luck, no loot boxes.</Text>
              <Pressable testID="cards-portfolio" onPress={() => router.push('/portfolio')} accessibilityRole="button" accessibilityLabel="Invest coins in your cards">
                <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: space(1.5), flexDirection: 'row', alignItems: 'center', gap: space(1) }}>
                  <Text style={{ fontSize: 22 }}>📈</Text>
                  <Text style={[type.bodyBold, { flex: 1 }]}>Invest coins in your cards</Text>
                  <Text style={[type.bodyBold, { color: '#1F9A63' }]}>Practice Portfolio ›</Text>
                </View>
              </Pressable>
              <Segmented
                options={[
                  { id: 'all', label: 'All' },
                  { id: 'asset', label: 'Assets' },
                  { id: 'strategy', label: 'Strategies' },
                ]}
                value={filter}
                onChange={setFilter}
              />
            </View>
          }
          renderItem={({ item }) => {
            const has = owned.includes(item.id);
            return (
              <Pressable style={{ flex: 1 }} onPress={() => has && router.push(`/card/${item.id}`)} accessibilityRole="button" accessibilityLabel={has ? item.name : `Locked card, unlocks in World ${item.world}`}>
                <AssetCard card={item} compact locked={!has} />
              </Pressable>
            );
          }}
        />
      </Screen>
    </Backdrop>
  );
}
