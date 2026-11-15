/**
 * Market Duel. Same goal brief, same market years, two portfolios of 5 chips.
 * - ?vs=dash: offline, against Dash's all-in bets.
 * - ?create=1: start an online duel and share its code with a friend (needs an account).
 * - ?code=XXXXXX: join a friend's duel.
 * Scores are recomputed on this phone from the seed and both sides' chips.
 */
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCard } from '@/content';
import { CHIPS, chipCount, dashChips, DUEL_DECK, duelDebrief, newDuelSeed, playDuel, setupDuel, type Chips } from '@/duel/engine';
import { Character } from '@/mascot/Character';
import type { AssetClass } from '@/sim/assets';
import { handleFor } from '@/social/handle';
import { createDuel, joinDuel, newDuelCode, normaliseCode, submitChips, watchDuel, type OnlineDuel } from '@/social/duels';
import { useGame, type Reward } from '@/state/game';
import { Backdrop } from '@/ui/Backdrop';
import { ArtCaption, Button, Card, ComebackNote, HypotheticalLabel } from '@/ui/components';
import { colors, formatINR, radius, space, type } from '@/ui/theme';

type Phase = 'loading' | 'brief' | 'build' | 'waiting' | 'reveal' | 'result' | 'error';

const CARD_OF: Record<AssetClass, string> = { savings: 'savings', fd: 'fd', govBond: 'govBond', indexFund: 'indexFund', gold: 'gold', stock: 'stock', reit: 'reit', crypto: 'crypto' } as Record<AssetClass, string>;

export default function Duel() {
  const params = useLocalSearchParams<{ vs?: string; create?: string; code?: string }>();
  const insets = useSafeAreaInsets();
  const account = useGame((s) => s.account);
  const completeDuel = useGame((s) => s.completeDuel);
  const online = params.vs !== 'dash';
  const me = useMemo(() => (account ? { uid: account.uid, handle: handleFor(account.uid) } : null), [account]);

  const [seed, setSeed] = useState<number | null>(() => (online ? null : newDuelSeed('dash')));
  const [code, setCode] = useState<string | null>(null);
  const [side, setSide] = useState<'a' | 'b'>('a');
  const [duel, setDuel] = useState<OnlineDuel | null>(null);
  const [phase, setPhase] = useState<Phase>(online ? 'loading' : 'brief');
  const [error, setError] = useState<string | null>(null);
  const [chips, setChips] = useState<Chips>({});
  const [year, setYear] = useState(0);
  const [reward, setReward] = useState<Reward | null>(null);

  // Online: create or join, then follow the duel live until both sides have picked.
  useEffect(() => {
    if (!online) return;
    if (!me || !account?.cloud) {
      queueMicrotask(() => {
        setError('Duels with friends need an account. Save your progress in You › Account first.');
        setPhase('error');
      });
      return;
    }
    let unsubscribe = () => {};
    let cancelled = false;
    const follow = (c: string) => {
      unsubscribe = watchDuel(
        c,
        (d) => {
          if (!cancelled && d) setDuel(d);
        },
        () => !cancelled && setError('Lost the connection to this duel.'),
      );
    };
    (async () => {
      try {
        if (params.code) {
          const c = normaliseCode(params.code);
          const joined = await joinDuel(c, me);
          if (cancelled) return;
          if (joined === 'notFound' || joined === 'full' || joined === 'yours') {
            setError({ notFound: 'No duel with that code.', full: 'That duel already has two players.', yours: 'That’s your own duel. Send the code to a friend!' }[joined]);
            setPhase('error');
            return;
          }
          setCode(c);
          setSide('b');
          setSeed(joined.seed);
          setDuel(joined);
          setPhase('brief');
          follow(c);
        } else {
          const c = newDuelCode();
          const s = newDuelSeed(me.uid);
          await createDuel(c, s, me);
          if (cancelled) return;
          setCode(c);
          setSide('a');
          setSeed(s);
          setPhase('brief');
          follow(c);
        }
      } catch {
        if (!cancelled) {
          setError('Couldn’t reach the duel server. Check the connection and try again.');
          setPhase('error');
        }
      }
    })();
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [online, me, account?.cloud, params.code]);

  const setup = useMemo(() => (seed === null ? null : setupDuel(seed)), [seed]);
  const opponent = online ? (side === 'a' ? duel?.b : duel?.a) : null;
  const opponentChips = opponent?.chips ?? null;
  const theirChips: Chips | null = useMemo(() => (online ? opponentChips : seed !== null ? dashChips(seed) : null), [online, opponentChips, seed]);
  const theirName = online ? (opponent?.handle ?? 'Waiting for a friend') : 'Dash';

  // Waiting → reveal as soon as the friend's chips arrive.
  if (phase === 'waiting' && theirChips) {
    setPhase('reveal');
    setYear(0);
  }

  // Year-by-year reveal; when the last year is shown, the result (and its reward) lands once.
  useEffect(() => {
    if (phase !== 'reveal' || !setup || !theirChips || chipCount(chips) !== CHIPS) return;
    let y = 0;
    const id = setInterval(() => {
      y += 1;
      if (y > setup.brief.years) {
        clearInterval(id);
        const a = playDuel(setup, chips).score.total;
        const b = playDuel(setup, theirChips).score.total;
        setReward(completeDuel(a > b ? 'win' : a < b ? 'lose' : 'draw'));
        setPhase('result');
        return;
      }
      Haptics.selectionAsync().catch(() => {});
      setYear(y);
    }, 1300);
    return () => clearInterval(id);
  }, [phase, setup, chips, theirChips, completeDuel]);

  const mine = setup && chipCount(chips) === CHIPS ? playDuel(setup, chips) : null;
  const theirs = setup && theirChips ? playDuel(setup, theirChips) : null;
  const outcome = mine && theirs ? (mine.score.total > theirs.score.total ? 'win' : mine.score.total < theirs.score.total ? 'lose' : 'draw') : null;

  const lockIn = async () => {
    if (!setup || chipCount(chips) !== CHIPS) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (online && code && me) {
      try {
        await submitChips(code, side, { uid: me.uid, handle: me.handle, chips: null }, chips);
      } catch {
        setError('Couldn’t send your portfolio. Check the connection and try again.');
        return;
      }
      if (!theirChips) {
        setPhase('waiting');
        return;
      }
    }
    setYear(0);
    setPhase('reveal');
  };

  const add = (a: AssetClass) => {
    if (chipCount(chips) >= CHIPS) return;
    Haptics.selectionAsync().catch(() => {});
    setChips((c) => ({ ...c, [a]: (c[a] ?? 0) + 1 }));
  };
  const remove = (a: AssetClass) => setChips((c) => ({ ...c, [a]: Math.max((c[a] ?? 0) - 1, 0) }));

  return (
    <Backdrop art="nightMarket" scrim="dark">
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ padding: space(2.5), paddingTop: insets.top + space(1.5), paddingBottom: insets.bottom + space(4), gap: space(2) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[type.title, { color: '#fff' }]}>Market Duel</Text>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}>
            <Text style={{ fontSize: 26, color: '#DCE3EE' }}>✕</Text>
          </Pressable>
        </View>

        {phase === 'loading' ? <ActivityIndicator color="#fff" /> : null}
        {phase === 'error' ? (
          <Card style={{ gap: space(1) }}>
            <Text style={type.bodyBold}>{error}</Text>
            <Button title="Back" variant="secondary" onPress={() => router.back()} />
          </Card>
        ) : null}

        {setup && (phase === 'brief' || phase === 'build' || phase === 'waiting') ? (
          <Card style={{ gap: 6 }}>
            <Text style={type.tiny}>THE BRIEF · {setup.brief.years} YEARS · SAME FOR BOTH PLAYERS</Text>
            <Text style={type.h2}>{setup.brief.title}</Text>
            <Text style={type.body}>{setup.brief.story}</Text>
            <Text style={type.small}>Score: reaching the goal (60) + a calm ride (25) + cash when needed (15). Beating the goal by more earns nothing extra.</Text>
          </Card>
        ) : null}

        {phase === 'brief' && setup ? (
          <>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5) }}>
              {online ? <Text style={{ fontSize: 40 }}>🧑‍🤝‍🧑</Text> : <Character name="dash" mood="happy" size={80} />}
              <View style={{ flex: 1 }}>
                <Text style={type.bodyBold}>Opponent: {theirName}</Text>
                <Text style={type.small}>{online ? (side === 'a' ? `Share code ${code} with a friend. They play the same market.` : 'Your friend picked already, or will soon. Same market, your choices.') : 'Dash loves going all-in on the exciting stuff.'}</Text>
              </View>
            </Card>
            {online && side === 'a' && code ? (
              <Button
                title={`Share code ${code}`}
                variant="secondary"
                onPress={() => Share.share({ message: `Duel me in Kip: Money Quest! Open Market Duel and enter code ${code}.` }).catch(() => {})}
              />
            ) : null}
            <Button testID="duel-build" title="Build my portfolio" onPress={() => setPhase('build')} />
          </>
        ) : null}

        {phase === 'build' && setup ? (
          <>
            <Card style={{ gap: space(1) }}>
              <Text style={type.bodyBold}>
                Place your {CHIPS} chips · {chipCount(chips)}/{CHIPS}
              </Text>
              <Text style={type.small}>Each chip is 20% of your money. Tap a product to add a chip; tap a chip to take it back.</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {Array.from({ length: CHIPS }, (_, i) => {
                  const placed = (Object.entries(chips) as [AssetClass, number][]).flatMap(([a, n]) => Array(n).fill(a) as AssetClass[]);
                  const a = placed[i];
                  return (
                    <Pressable key={i} disabled={!a} onPress={() => a && remove(a)} accessibilityRole="button" accessibilityLabel={a ? `Remove ${getCard(CARD_OF[a])?.name}` : 'Empty chip'} style={{ flex: 1, aspectRatio: 1, borderRadius: radius.md, borderWidth: 2, borderStyle: a ? 'solid' : 'dashed', borderColor: a ? colors.kip : colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: a ? colors.kipLight : colors.surface }}>
                      <Text style={{ fontSize: 22 }}>{a ? getCard(CARD_OF[a])?.emoji : '·'}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {DUEL_DECK.map((a) => {
                const card = getCard(CARD_OF[a]);
                const n = chips[a] ?? 0;
                return (
                  <Pressable key={a} testID={`duel-add-${a}`} onPress={() => add(a)} accessibilityRole="button" accessibilityLabel={`Add a chip to ${card?.name}`} style={{ width: '48%', padding: space(1.25), borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 2, borderColor: n ? colors.kip : colors.line, gap: 2 }}>
                    <Text style={type.bodyBold}>
                      {card?.emoji} {card?.name} {n ? `×${n}` : ''}
                    </Text>
                    <Text style={type.tiny}>
                      Return {'●'.repeat(card?.stats?.return ?? 1)} · Risk {'●'.repeat(card?.stats?.risk ?? 1)} · Cash {'●'.repeat(card?.stats?.liquidity ?? 1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {error ? <ArtCaption>{error}</ArtCaption> : null}
            <Button testID="duel-lock" title="Lock in my portfolio" disabled={chipCount(chips) !== CHIPS} onPress={lockIn} />
          </>
        ) : null}

        {phase === 'waiting' ? (
          <Card style={{ alignItems: 'center', gap: space(1) }}>
            <ActivityIndicator color={colors.ink} />
            <Text style={type.bodyBold}>Waiting for your friend to pick…</Text>
            <Text style={[type.small, { textAlign: 'center' }]}>You can close this. Open Market Duel with code {code} later to see the result.</Text>
          </Card>
        ) : null}

        {(phase === 'reveal' || phase === 'result') && setup && mine && theirs ? (
          <>
            <Card style={{ gap: space(1) }}>
              <Text style={type.tiny}>
                {setup.brief.title.toUpperCase()} · YEAR {Math.min(year, setup.brief.years)} OF {setup.brief.years}
              </Text>
              {setup.events.slice(0, year).map((e, i) => (
                <Text key={i} style={type.small}>
                  Year {i + 1}: <Text style={type.bodyBold}>{e.title}</Text>
                </Text>
              ))}
              {[
                { label: 'You', values: mine.values, color: colors.kip },
                { label: theirName, values: theirs.values, color: colors.dash },
              ].map((row) => {
                const v = row.values[Math.min(year, row.values.length - 1)];
                const max = Math.max(...mine.values, ...theirs.values);
                return (
                  <View key={row.label} style={{ gap: 4 }}>
                    <Text style={type.small}>
                      {row.label}: <Text style={type.bodyBold}>{formatINR(v)}</Text>
                    </Text>
                    <View style={{ height: 12, borderRadius: 6, backgroundColor: colors.line }}>
                      <View style={{ height: 12, borderRadius: 6, width: `${(v / max) * 100}%`, backgroundColor: row.color }} />
                    </View>
                  </View>
                );
              })}
            </Card>
            {phase === 'result' ? (
              <>
                <Card style={{ alignItems: 'center', gap: 6, borderColor: outcome === 'win' ? colors.kip : outcome === 'lose' ? colors.error : colors.shell }}>
                  <Text style={{ fontSize: 40 }}>{outcome === 'win' ? '🏆' : outcome === 'lose' ? '🐰' : '🤝'}</Text>
                  <Text style={type.title}>{outcome === 'win' ? 'You win!' : outcome === 'lose' ? `${theirName} wins` : 'A draw'}</Text>
                  <Text style={type.bodyBold}>
                    {mine.score.total} – {theirs.score.total}
                  </Text>
                  {reward ? <Text style={type.small}>{reward.practice ? `+${reward.xp} XP (today’s coin duels are used up)` : `+${reward.coins} coins · +${reward.xp} XP`}</Text> : null}
                </Card>
                <ComebackNote coins={reward?.comeback} />
                <Card style={{ gap: 6 }}>
                  <Text style={type.bodyBold}>Kip’s debrief</Text>
                  {duelDebrief(setup, mine, theirs).map((l) => (
                    <Text key={l} style={type.small}>
                      • {l}
                    </Text>
                  ))}
                </Card>
                <Button testID="duel-done" title="Done" onPress={() => router.back()} />
              </>
            ) : null}
          </>
        ) : null}
        <HypotheticalLabel extra="A simulated market for learning." />
      </ScrollView>
    </Backdrop>
  );
}
