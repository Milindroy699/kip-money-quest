/**
 * League tab: Market Duel, and the weekly league.
 * - Signed in (cloud): a real league for your tier, under pseudonymous handles (src/social/leagues).
 * - Otherwise: a practice league with seeded rivals, so the loop works before an account.
 */
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BACKGROUNDS } from '@/art';
import { nextLesson, pathFor, trackFor } from '@/content';
import { duelUnlocked as duelOpen, QUIZ_UNLOCK_TEXT, quizUnlocked } from '@/content/unlocks';
import { Character } from '@/mascot/Character';
import { addDays, daysBetween, weekday } from '@/engagement/days';
import { displayStreak, streakMultiplier } from '@/engagement/streak';
import { createRng, hashSeed } from '@/sim/rng';
import { handleFor } from '@/social/handle';
import { DEMOTE, fetchStandings, MIN_FOR_DEMOTION, PROMOTE, TIER_EMOJI, TIERS } from '@/social/leagues';
import { useGame } from '@/state/game';
import { Avatar } from '@/ui/Avatar';
import { Backdrop } from '@/ui/Backdrop';
import { Button, Card, Chip, Screen, StatBar } from '@/ui/components';
import { colors, radius, space, type } from '@/ui/theme';

const RIVALS = ['Aarav', 'Riya', 'Kabir', 'Ananya', 'Vihaan', 'Isha', 'Arjun', 'Meera', 'Zoya', 'Dev', 'Tara', 'Neel', 'Sana', 'Rohan'];

interface Row {
  key: string;
  name: string;
  xp: number;
  you: boolean;
}

export default function League() {
  const weekly = useGame((s) => s.weekly);
  const name = useGame((s) => s.profile.name);
  const today = useGame((s) => s.today());
  const coins = useGame((s) => s.coins);
  const streakState = useGame((s) => s.streak);
  const finiq = useGame((s) => s.finIQ());
  const account = useGame((s) => s.account);
  const tier = useGame((s) => s.social.tier);
  const duels = useGame((s) => s.social.duels);
  const lessons = useGame((s) => s.lessons);
  const streak = displayStreak(streakState, today);
  const duelUnlocked = duelOpen(lessons);
  const quizOpen = quizUnlocked(lessons);
  const ageBand = useGame((s) => s.profile.ageBand);
  // Progress toward the duel unlock: every lesson on your path before Risk Ridge, lesson 3.
  const path = pathFor(trackFor(ageBand));
  const unlockPath = path.slice(0, Math.max(path.findIndex((l) => l.id === 'w3-l3'), 0));
  const unlockDone = unlockPath.filter((l) => lessons[l.id]).length;
  const unlockToGo = unlockPath.length - unlockDone;
  const nextUp = nextLesson(lessons, trackFor(ageBand));
  const online = !!account?.cloud;

  const weekStart = addDays(today, -((weekday(today) + 6) % 7));
  const daysIn = daysBetween(weekStart, today) + 1;
  const myXp = weekly.weekStart === weekStart ? weekly.xp : 0;

  // Real league standings (refreshed whenever the tab is shown).
  const [real, setReal] = useState<Row[] | null>(null);
  const [realError, setRealError] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (!account?.cloud) return;
      let cancelled = false;
      fetchStandings(weekStart, tier, 100)
        .then((list) => {
          if (cancelled) return;
          const rows = list.map((s) => ({ key: s.uid, name: s.handle, xp: s.uid === account.uid ? Math.max(s.xp, myXp) : s.xp, you: s.uid === account.uid }));
          if (!rows.some((r) => r.you)) rows.push({ key: account.uid, name: handleFor(account.uid), xp: myXp, you: true });
          setReal(rows.sort((a, b) => b.xp - a.xp));
          setRealError(false);
        })
        .catch(() => !cancelled && setRealError(true));
      return () => {
        cancelled = true;
      };
    }, [account, weekStart, tier, myXp]),
  );

  const practice = useMemo<Row[]>(() => {
    const rng = createRng(hashSeed(weekStart));
    const rivals = RIVALS.map((n) => {
      const pace = 15 + rng() * 55; // XP per day
      const consistency = 0.4 + rng() * 0.6;
      return { key: n, name: n, xp: Math.round(pace * daysIn * consistency), you: false };
    });
    return [...rivals, { key: 'you', name: name || 'You', xp: myXp, you: true }].sort((a, b) => b.xp - a.xp);
  }, [weekStart, daysIn, myXp, name]);

  const table = online && real && !realError ? real : practice;
  const isReal = table === real;
  const demotes = !isReal || table.length >= MIN_FOR_DEMOTION;
  const [code, setCode] = useState('');

  return (
    <Backdrop art="moneyTown" scrim="soft">
      <Screen style={{ backgroundColor: 'transparent' }}>
        <StatBar streak={streak} coins={coins} finiq={finiq} />
        <FlatList
          data={table}
          keyExtractor={(r) => r.key}
          contentContainerStyle={{ padding: space(2.5), gap: 6, paddingBottom: space(12) }}
          ListHeaderComponent={
            <View style={{ gap: space(1.5), marginBottom: space(1.5) }}>
              {/* Market Duel: a banner, so it reads as a game to look forward to, locked or not. */}
              <View style={{ borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#1B1430', borderWidth: 2, borderColor: duelUnlocked ? colors.coin : '#6E5BA8' }}>
                <Image source={BACKGROUNDS.nightMarket} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(16,10,32,0.66)' }]} />
                <View style={{ padding: space(2), gap: space(1.25) }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(1) }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={[type.tiny, { color: colors.coin, fontWeight: '900', letterSpacing: 1 }]}>PLAYER VS PLAYER · 2-MINUTE MATCHES</Text>
                      <Text style={[type.title, { color: '#fff' }]}>⚔️ Market Duel</Text>
                      <Text style={[type.small, { color: '#E4DDF5' }]}>
                        Same goal, same market, two portfolios. Win by reaching the goal calmly, not by gambling.
                        {duels.played ? ` You’ve won ${duels.won} of ${duels.played}.` : ''}
                      </Text>
                    </View>
                    <Character name="dash" mood="cheer" size={88} />
                  </View>
                  {duelUnlocked ? (
                    <>
                      <Button testID="duel-dash" title="Duel Dash" onPress={() => router.push('/duel?vs=dash')} />
                      {online ? (
                        <>
                          <Button title="Duel a friend (get a code)" variant="secondary" onPress={() => router.push('/duel?create=1')} />
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TextInput
                              value={code}
                              onChangeText={(t) => setCode(t.toUpperCase())}
                              placeholder="Friend’s code"
                              placeholderTextColor={colors.inkMuted}
                              autoCapitalize="characters"
                              maxLength={8}
                              style={[type.bodyBold, { flex: 1, borderWidth: 2, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 12, backgroundColor: colors.surface }]}
                            />
                            <Button title="Join" variant="secondary" disabled={code.replace(/[^A-Z0-9]/g, '').length < 6} onPress={() => router.push(`/duel?code=${encodeURIComponent(code)}`)} />
                          </View>
                        </>
                      ) : (
                        <Pressable onPress={() => router.push('/account')} accessibilityRole="button">
                          <Text style={[type.small, { color: colors.coin, fontWeight: '800' }]}>Save your progress to duel friends and join real leagues ›</Text>
                        </Pressable>
                      )}
                    </>
                  ) : (
                    <View style={{ gap: space(1) }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(1) }}>
                        <Text style={[type.tiny, { color: '#1B1430', backgroundColor: colors.coin, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' }]}>🔒 LOCKED</Text>
                        <Text style={[type.small, { color: '#fff', fontWeight: '800', flex: 1 }]}>Opens at Risk Ridge, lesson 3</Text>
                      </View>
                      <View style={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
                        <View style={{ width: `${Math.round((unlockDone / Math.max(unlockPath.length, 1)) * 100)}%`, height: 10, backgroundColor: colors.coin }} />
                      </View>
                      <Text style={[type.tiny, { color: '#E4DDF5' }]}>
                        {unlockToGo} {unlockToGo === 1 ? 'lesson' : 'lessons'} to go. Duels need you to understand risk first.
                      </Text>
                      {nextUp ? <Button title={`Keep learning: ${nextUp.title}`} onPress={() => router.push(`/lesson/${nextUp.id}`)} /> : null}
                    </View>
                  )}
                </View>
              </View>

              {/* Quiz Battle: revision quizzes, solo or 1v1 on one phone. */}
              <Card style={{ gap: space(1), borderColor: quizOpen ? colors.kip : colors.line, borderWidth: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5) }}>
                  <Text style={{ fontSize: 34 }}>🧠</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={type.h2}>Quiz Battle</Text>
                    <Text style={type.small}>{quizOpen ? 'Quiz yourself, or take on a friend on this phone. Questions come from your lessons.' : QUIZ_UNLOCK_TEXT}</Text>
                  </View>
                </View>
                {quizOpen ? (
                  <View style={{ flexDirection: 'row', gap: space(1) }}>
                    <Button testID="league-quiz-solo" title="Just me" style={{ flex: 1 }} onPress={() => router.push('/quiz?mode=solo')} />
                    <Button testID="league-quiz-duo" title="1v1" variant="secondary" style={{ flex: 1 }} onPress={() => router.push('/quiz?mode=duo')} />
                  </View>
                ) : null}
              </Card>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5) }}>
                <Text style={{ fontSize: 40 }}>{TIER_EMOJI[isReal ? tier : 0]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={type.title}>{TIERS[isReal ? tier : 0]} League</Text>
                  <Text style={type.small}>
                    {8 - daysIn} {8 - daysIn === 1 ? 'day' : 'days'} left · Top {PROMOTE} move up
                    {isReal && tier < TIERS.length - 1 ? ` to ${TIERS[tier + 1]}` : ''}
                  </Text>
                </View>
              </View>
              <Card style={{ backgroundColor: '#FFF6DD', borderColor: colors.shell }}>
                <Text style={type.small}>
                  Your XP includes your streak’s compounding boost: <Text style={type.bodyBold}>×{streakMultiplier(Math.max(streak, 1)).toFixed(2)}</Text>. Consistency beats cramming.
                </Text>
              </Card>
              <Chip
                label={
                  isReal
                    ? `Real league · you appear as ${account ? handleFor(account.uid) : ''}, never your real name`
                    : online && realError
                      ? 'Couldn’t load your league, so this is the practice league for now.'
                      : 'Practice league with seeded rivals. Save your progress to join a real one.'
                }
              />
            </View>
          }
          renderItem={({ item, index }) => {
            const zone = index < PROMOTE ? 'up' : demotes && index >= table.length - DEMOTE ? 'down' : 'stay';
            return (
              <View>
                {index === PROMOTE ? <Text style={[type.tiny, { textAlign: 'center', color: colors.kipDark, marginVertical: 4 }]}>▲ PROMOTION ZONE ▲</Text> : null}
                {demotes && index === table.length - DEMOTE && index > PROMOTE ? <Text style={[type.tiny, { textAlign: 'center', color: colors.error, marginVertical: 4 }]}>▼ DEMOTION ZONE ▼</Text> : null}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space(1.5),
                    padding: space(1.5),
                    borderRadius: radius.md,
                    backgroundColor: item.you ? colors.kipLight : zone === 'up' ? '#F2FBF6' : zone === 'down' ? '#FFF4F4' : colors.surface,
                    borderWidth: item.you ? 2.5 : 1,
                    borderColor: item.you ? colors.kip : colors.line,
                  }}>
                  <Text style={[type.number, { width: 28, textAlign: 'center' }]}>{index + 1}</Text>
                  {item.you ? (
                    // Your own picture, on your phone only; other players see initials.
                    <Avatar size={36} />
                  ) : (
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.line, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={[type.bodyBold, { color: colors.ink }]}>{item.name[0]}</Text>
                    </View>
                  )}
                  <Text style={[type.bodyBold, { flex: 1 }]} numberOfLines={1}>
                    {item.you ? `${item.name} (you)` : item.name}
                  </Text>
                  <Text style={type.number}>{item.xp} XP</Text>
                </View>
              </View>
            );
          }}
        />
      </Screen>
    </Backdrop>
  );
}
