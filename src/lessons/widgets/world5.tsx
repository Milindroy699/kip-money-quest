/** World 5, Portfolio Fort: allocation, Fort Defense, rebalancing and hedging. */
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { emptyFort, fortSize, resolveWave, SLOTS, START_HP, TOWERS, WAVES, waveList, type Fort, type Tower } from '../../games/fort';
import { ASSET_INFO, ASSETS_ORDER, buy, driftTwin, grow, offBy, onTarget, RUSH, sell, settleCash, startMix, TARGET, total, worstDrop, yearsFor, type Asset, type MarketYear, type Mix } from '../../games/rebalance';
import { ASSETS } from '../../sim';
import { Card, HypotheticalLabel } from '../../ui/components';
import { Segmented, Slider } from '../../ui/Slider';
import { colors, formatINR, radius, space, type } from '../../ui/theme';

const pct = (x: number) => `${x >= 0 ? '+' : ''}${Math.round(x * 100)}%`;

// ---- Allocation: the mix dial --------------------------------------------------------

export function AllocationWidget({ onDone }: { onDone: () => void }) {
  const [share, setShare] = useState(50);
  const [seen, setSeen] = useState<Set<number>>(new Set([50]));
  useEffect(() => {
    if (seen.has(0) && seen.has(100) && seen.size >= 3) onDone();
  }, [seen, onDone]);
  const w = share / 100;
  const typical = w * ASSETS.indexFund.expectedReturn + (1 - w) * ASSETS.fd.expectedReturn;
  const bad = w * (ASSETS.indexFund.expectedReturn - 1.65 * ASSETS.indexFund.volatility) + (1 - w) * ASSETS.fd.expectedReturn;
  return (
    <View style={{ gap: space(2) }}>
      <Card style={{ gap: space(1) }}>
        <View style={{ flexDirection: 'row', height: 22, borderRadius: 11, overflow: 'hidden' }}>
          <View style={{ flex: 100 - share, backgroundColor: colors.kip }} />
          <View style={{ flex: share, backgroundColor: colors.dash }} />
        </View>
        <Text style={type.small}>
          🔒 FD {100 - share}% · 📊 Index fund {share}%
        </Text>
        <Text style={type.bodyBold}>Typical year: {pct(typical)}</Text>
        <Text style={[type.bodyBold, { color: bad < 0 ? colors.error : colors.kipDark }]}>A bad year (1 in 20): {pct(bad)}</Text>
        <Text style={type.small}>{share <= 20 ? 'Calm, but it may not beat inflation by much.' : share >= 80 ? 'Fastest growth, and the deepest bad years. Fine for a goal 7+ years away.' : 'A middle path: some growth, a cushion for bad years.'}</Text>
      </Card>
      <Slider
        min={0}
        max={100}
        value={share}
        step={10}
        onChange={(v) => {
          setShare(v);
          setSeen((p) => new Set(p).add(v));
        }}
        label="Turn the mix dial"
        accessibilityLabel="Share in the index fund"
        testID="allocation-slider"
      />
      <HypotheticalLabel />
    </View>
  );
}

// ---- Fort Defense ------------------------------------------------------------------

const TOWER_ORDER: Tower[] = ['shares', 'bonds', 'gold', 'cash', 'hedge'];

export function FortDefenseWidget({ params, onDone }: { params: Record<string, unknown>; onDone: () => void }) {
  const count = typeof params.waves === 'number' ? params.waves : 5;
  const [seed] = useState(() => Math.floor(Math.random() * 1e9));
  const waves = useMemo(() => waveList(seed, count), [seed, count]);
  const [fort, setFort] = useState<Fort>(emptyFort);
  const [phase, setPhase] = useState<'build' | 'fight' | 'after' | 'done'>('build');
  const [wave, setWave] = useState(0);
  const [hp, setHp] = useState(START_HP);
  const [growth, setGrowth] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    if (phase === 'done') onDone();
  }, [phase, onDone]);

  const add = (t: Tower) => {
    if (fortSize(fort) >= SLOTS) return;
    Haptics.selectionAsync().catch(() => {});
    setFort((f) => ({ ...f, [t]: f[t] + 1 }));
  };
  const remove = (t: Tower) => {
    if (phase === 'after' && moved) return;
    setFort((f) => ({ ...f, [t]: Math.max(f[t] - 1, 0) }));
    if (phase === 'after') setMoved(true);
  };
  const fight = (index: number) => {
    const r = resolveWave(fort, waves[index]);
    const left = hp - r.damage;
    Haptics.impactAsync(r.damage > 15 ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setHp(Math.max(left, 0));
    setGrowth((g) => g + r.growth);
    setLog([`${WAVES[waves[index]].emoji} ${WAVES[waves[index]].name}: −${r.damage} walls, +${r.growth} growth`, ...r.lines]);
    if (left <= 0 || index + 1 >= waves.length) setPhase('done');
    else {
      setPhase('after');
      setMoved(false);
    }
  };
  const placed = TOWER_ORDER.flatMap((t) => Array(fort[t]).fill(t) as Tower[]);
  const full = fortSize(fort) === SLOTS;
  const fell = hp <= 0;

  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 30 }}>🏰</Text>
          <View style={{ flex: 1 }}>
            <View style={{ height: 12, borderRadius: 6, backgroundColor: colors.line }}>
              <View style={{ height: 12, borderRadius: 6, width: `${Math.max(hp, 0)}%`, backgroundColor: hp > 50 ? colors.kip : hp > 25 ? colors.dash : colors.error }} />
            </View>
            <Text style={type.tiny}>
              Walls {Math.max(hp, 0)}/{START_HP} · Growth {growth} · Wave {Math.min(wave + (phase === 'build' ? 0 : 1), waves.length)}/{waves.length}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {Array.from({ length: SLOTS }, (_, i) => (
            <Pressable key={i} disabled={!placed[i] || phase === 'fight' || phase === 'done'} onPress={() => placed[i] && remove(placed[i])} accessibilityRole="button" accessibilityLabel={placed[i] ? `Remove ${TOWERS[placed[i]].name}` : 'Empty slot'} style={{ flex: 1, aspectRatio: 1, borderRadius: radius.md, borderWidth: 2, borderStyle: placed[i] ? 'solid' : 'dashed', borderColor: placed[i] ? colors.ink : colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
              <Text style={{ fontSize: 22 }}>{placed[i] ? TOWERS[placed[i]].emoji : '·'}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {phase === 'build' || (phase === 'after' && !full) ? (
        <View style={{ gap: 6 }}>
          <Text style={type.small}>{phase === 'build' ? 'Place 5 towers. Tap a slot to remove one.' : 'Rebalance: add one tower back.'}</Text>
          {TOWER_ORDER.map((t) => (
            <Pressable key={t} testID={`fort-${t}`} onPress={() => add(t)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: space(1.25), borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 2, borderColor: fort[t] ? colors.kip : colors.line }}>
              <Text style={{ fontSize: 24 }}>{TOWERS[t].emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={type.bodyBold}>
                  {TOWERS[t].name} {fort[t] ? `×${fort[t]}` : ''}
                </Text>
                <Text style={type.tiny}>{TOWERS[t].note}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      {log.length ? (
        <Card style={{ gap: 4, borderColor: colors.shell }}>
          {log.map((l, i) => (
            <Text key={i} style={i === 0 ? type.bodyBold : type.small}>
              {l}
            </Text>
          ))}
        </Card>
      ) : null}

      {phase === 'build' && full ? (
        <Pressable testID="fort-start" onPress={() => setPhase('fight')} style={{ padding: space(1.5), borderRadius: radius.md, backgroundColor: colors.ink, alignItems: 'center' }}>
          <Text style={[type.bodyBold, { color: '#fff' }]}>Raise the drawbridge ›</Text>
        </Pressable>
      ) : null}
      {phase === 'fight' || (phase === 'after' && full) ? (
        <View style={{ gap: 6 }}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderColor: colors.error }}>
            <Text style={{ fontSize: 30 }}>{WAVES[waves[wave + (phase === 'after' ? 1 : 0)]].emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={type.bodyBold}>Next: {WAVES[waves[wave + (phase === 'after' ? 1 : 0)]].name}</Text>
              <Text style={type.small}>{WAVES[waves[wave + (phase === 'after' ? 1 : 0)]].text}</Text>
            </View>
          </Card>
          {phase === 'after' ? <Text style={type.tiny}>{moved ? 'Rebalanced.' : 'You may move one tower before the next wave: tap a slot, then add a tower.'}</Text> : null}
          <Pressable
            testID="fort-fight"
            onPress={() => {
              const index = phase === 'after' ? wave + 1 : wave;
              setWave(index);
              fight(index);
            }}
            style={{ padding: space(1.5), borderRadius: radius.md, backgroundColor: colors.error, alignItems: 'center' }}>
            <Text style={[type.bodyBold, { color: '#fff' }]}>Defend! ⚔️</Text>
          </Pressable>
        </View>
      ) : null}

      {phase === 'done' ? (
        <Card style={{ alignItems: 'center', gap: 6, borderColor: fell ? colors.error : colors.kip }}>
          <Text style={{ fontSize: 40 }}>{fell ? '🏚️' : '🏰'}</Text>
          <Text style={type.title}>{fell ? 'The fort fell' : 'The fort stands!'}</Text>
          <Text style={[type.small, { textAlign: 'center' }]}>
            {fell
              ? 'Too much in one kind of tower. In real life that means selling at the bottom. Mix towers so no single monster can break you.'
              : `Walls ${hp}, growth ${growth}. A mixed fort survives the bad waves and still grows.`}
          </Text>
        </Card>
      ) : null}
    </View>
  );
}

// ---- Rebalancing -------------------------------------------------------------------

export function RebalanceWidget({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [rebalanced, setRebalanced] = useState<boolean | null>(null);
  useEffect(() => {
    if (step === 2) onDone();
  }, [step, onDone]);
  // Start 50/50; a boom (+30% shares, FD +7%), then a crash (−30% shares, FD +7%).
  const afterBoom = { shares: 65, fd: 53.5 };
  const total = afterBoom.shares + afterBoom.fd;
  const drift = afterBoom.shares * 0.7 + afterBoom.fd * 1.07;
  const rebal = (total / 2) * 0.7 + (total / 2) * 1.07;
  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ gap: 6 }}>
        <Text style={type.bodyBold}>You start with ₹100: 50 in shares, 50 in an FD (a 50/50 plan).</Text>
        {step >= 1 ? (
          <Text style={type.small}>
            🎆 A boom year! Shares +30%. Now you have {formatINR(afterBoom.shares)} in shares and {formatINR(afterBoom.fd)} in the FD: {Math.round((afterBoom.shares / total) * 100)}% shares. Your plan has drifted.
          </Text>
        ) : null}
        {step === 2 ? (
          <>
            <Text style={type.small}>👺 Then a crash: shares −30%.</Text>
            <Text style={[type.bodyBold, { color: rebalanced ? colors.kipDark : colors.ink }]}>
              {rebalanced ? `You rebalanced: ${formatINR(rebal)}` : `You left it: ${formatINR(drift)}`}
            </Text>
            <Text style={type.small}>
              {rebalanced ? `Selling some shares after the boom (selling high) left ${formatINR(rebal - drift)} more after the crash.` : `Rebalancing would have left ${formatINR(rebal - drift)} more. It's a rule that makes you sell high and buy low.`}
            </Text>
          </>
        ) : null}
      </Card>
      {step === 0 ? (
        <Pressable testID="rebalance-next" onPress={() => setStep(1)} style={{ padding: space(1.5), borderRadius: radius.md, backgroundColor: colors.ink, alignItems: 'center' }}>
          <Text style={[type.bodyBold, { color: '#fff' }]}>Play year 1 ›</Text>
        </Pressable>
      ) : null}
      {step === 1 ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { label: 'Rebalance to 50/50', v: true },
            { label: 'Leave it', v: false },
          ].map((o) => (
            <Pressable
              key={o.label}
              testID={o.v ? 'rebalance-yes' : 'rebalance-no'}
              onPress={() => {
                setRebalanced(o.v);
                setStep(2);
              }}
              style={{ flex: 1, padding: space(1.5), borderRadius: radius.md, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', backgroundColor: colors.surface }}>
              <Text style={type.bodyBold}>{o.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <HypotheticalLabel />
    </View>
  );
}

// ---- Hedging: crash insurance ---------------------------------------------------------

const YEARS = [
  { id: 'good', label: 'Good year +15%', move: 0.15 },
  { id: 'flat', label: 'Flat year', move: 0 },
  { id: 'crash', label: 'Crash −30%', move: -0.3 },
] as const;

export function HedgeWidget({ onDone }: { onDone: () => void }) {
  const [year, setYear] = useState<(typeof YEARS)[number]['id']>('good');
  const [insured, setInsured] = useState<'no' | 'yes'>('no');
  const [seen, setSeen] = useState<Set<string>>(new Set(['good-no']));
  useEffect(() => {
    if (seen.has('crash-yes') && seen.has('crash-no')) onDone();
  }, [seen, onDone]);
  const y = YEARS.find((x) => x.id === year)!;
  const start = 10000;
  const premium = 300;
  const plain = start * (1 + y.move);
  const protectedValue = Math.max(plain, start * 0.9) - premium;
  const value = insured === 'yes' ? protectedValue : plain;
  const mark = (yr: string, ins: string) => setSeen((p) => new Set(p).add(`${yr}-${ins}`));
  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ gap: 6 }}>
        <Text style={type.bodyBold}>₹10,000 of shares. Crash insurance (a protective put) costs ₹300 a year and stops losses below ₹9,000.</Text>
        <Segmented
          options={[
            { id: 'no', label: 'No insurance' },
            { id: 'yes', label: 'Insured' },
          ]}
          value={insured}
          onChange={(v) => {
            setInsured(v);
            mark(year, v);
          }}
        />
        <Segmented
          options={YEARS.map((x) => ({ id: x.id, label: x.label }))}
          value={year}
          onChange={(v) => {
            setYear(v);
            mark(v, insured);
          }}
        />
        <Text style={[type.hero, { textAlign: 'center', color: value >= start ? colors.kipDark : colors.error }]}>{formatINR(value)}</Text>
        <Text style={[type.small, { textAlign: 'center' }]}>
          {insured === 'yes'
            ? y.move < -0.1
              ? 'The insurance paid out: your loss stopped at ₹9,000, minus the ₹300 cost.'
              : 'Nothing bad happened, so you paid ₹300 for peace of mind, like any insurance.'
            : y.move < 0
              ? 'No insurance: you took the full fall.'
              : 'No insurance cost, and you kept the whole gain.'}
        </Text>
      </Card>
      <HypotheticalLabel />
    </View>
  );
}

// ---- Rebalance Rush --------------------------------------------------------------------

type RushRound = { year: MarketYear; onPlan: boolean; soldHigh: boolean; boughtLow: boolean };

export function RebalanceRushWidget({ onDone }: { onDone: () => void }) {
  const [seed] = useState(() => Math.floor(Math.random() * 1e9));
  const years = useMemo(() => yearsFor(seed), [seed]);
  const [phase, setPhase] = useState<'intro' | 'market' | 'rush' | 'result' | 'done'>('intro');
  const [round, setRound] = useState(0);
  const [mix, setMix] = useState<Mix>(startMix);
  const [values, setValues] = useState<number[]>([RUSH.start]);
  const [left, setLeft] = useState(RUSH.seconds);
  const [rounds, setRounds] = useState<RushRound[]>([]);
  const [trades, setTrades] = useState({ sold: new Set<Asset>(), bought: new Set<Asset>() });
  useEffect(() => {
    if (phase === 'done') onDone();
  }, [phase, onDone]);
  // The market moves, then the clock starts.
  useEffect(() => {
    if (phase !== 'market') return;
    const id = setTimeout(() => setPhase('rush'), 1400);
    return () => clearTimeout(id);
  }, [phase]);
  useEffect(() => {
    if (phase !== 'rush') return;
    const id = setInterval(() => setLeft((s) => Math.max(s - 0.1, 0)), 100);
    return () => clearInterval(id);
  }, [phase]);

  const year = years[round];
  const finishRound = (m: Mix, ok: boolean) => {
    const settled = settleCash(m);
    setMix(settled);
    setValues((v) => [...v, total(settled)]);
    const r = year.returns;
    // Selling what just rose (or buying what just fell) is the point of the rule.
    const soldHigh = [...trades.sold].some((a) => r[a] > 0.1);
    const boughtLow = [...trades.bought].some((a) => r[a] < -0.05);
    setRounds((x) => [...x, { year, onPlan: ok, soldHigh, boughtLow }]);
    Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
    setPhase('result');
  };
  // End the round as soon as the mix is back on plan, or when the clock runs out (adjusting state during render).
  // Leftover cash goes back in first, so the verdict matches the mix the player then sees.
  if (phase === 'rush' && (onTarget(mix) || left <= 0)) finishRound(mix, onTarget(settleCash(mix)));

  const start = () => {
    setMix((m) => grow(m, years[round]));
    setTrades({ sold: new Set(), bought: new Set() });
    setLeft(RUSH.seconds);
    setPhase('market');
  };

  if (phase === 'intro') {
    return (
      <Card style={{ gap: space(1) }}>
        <Text style={type.h2}>⏱️ Rebalance Rush</Text>
        <Text style={type.body}>Your plan: 60% shares, 30% bonds, 10% gold. Each year the market knocks it off plan. You get {RUSH.seconds} seconds to sell what grew and buy what shrank.</Text>
        <Text style={type.small}>Each tap moves 5% of your money. A twin who never rebalances lives the same six years.</Text>
        <Pressable testID="rush-start" onPress={start} style={{ padding: space(1.5), borderRadius: radius.md, backgroundColor: colors.ink, alignItems: 'center' }}>
          <Text style={[type.bodyBold, { color: '#fff' }]}>Start year 1 ›</Text>
        </Pressable>
      </Card>
    );
  }

  if (phase === 'done') {
    const twin = driftTwin(years);
    const mine = total(mix);
    const twinEnd = twin.values[twin.values.length - 1];
    const myDrop = worstDrop(values);
    const twinDrop = worstDrop(twin.values);
    const onPlan = rounds.filter((r) => r.onPlan).length;
    const sellHigh = rounds.filter((r) => r.soldHigh || r.boughtLow).length;
    return (
      <View style={{ gap: space(1.5) }}>
        <Card style={{ alignItems: 'center', gap: 4, borderColor: colors.kip }}>
          <Text style={{ fontSize: 36 }}>⚖️</Text>
          <Text style={type.title}>
            On plan {onPlan} of {rounds.length} years
          </Text>
          <Text style={type.small}>{sellHigh ? `${sellHigh} times you sold after a jump or bought after a fall: sell high, buy low, by rule.` : 'Rebalancing makes you sell what jumped and buy what fell.'}</Text>
        </Card>
        <Card style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={type.tiny}> </Text>
            <Text style={[type.tiny, { width: 90, textAlign: 'right' }]}>YOU</Text>
            <Text style={[type.tiny, { width: 90, textAlign: 'right' }]}>DRIFT TWIN</Text>
          </View>
          <CompareRow label="Final value" a={formatINR(mine)} b={formatINR(twinEnd)} />
          <CompareRow label="Worst drop" a={`−${Math.round(myDrop * 100)}%`} b={`−${Math.round(twinDrop * 100)}%`} />
          <CompareRow label="Most in shares" a="about 60%" b={`${Math.round(twin.peakShares * 100)}%`} />
          <Text style={type.small}>
            {myDrop <= twinDrop
              ? 'Rebalancing kept the risk you chose, so your worst fall was gentler.'
              : 'This time the twin fell less. Rebalancing is about keeping your plan, not about winning every year.'}{' '}
            {mine >= twinEnd ? `You also ended ${formatINR(mine - twinEnd)} ahead.` : `The twin ended ${formatINR(twinEnd - mine)} ahead: when shares keep rising, a drifting mix earns more, with more risk.`}
          </Text>
        </Card>
        <HypotheticalLabel />
      </View>
    );
  }

  const t = total(mix);
  const lastRound = rounds[rounds.length - 1];
  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ gap: 6, borderColor: phase === 'market' ? colors.dash : colors.line }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={type.tiny}>
            YEAR {round + 1} OF {RUSH.rounds}
          </Text>
          <Text style={type.number}>{formatINR(t)}</Text>
        </View>
        <Text style={type.h2}>
          {year.emoji} {year.name}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {ASSETS_ORDER.map((a) => (
            <Text key={a} style={[type.tiny, { color: year.returns[a] >= 0 ? colors.kipDark : colors.error, fontWeight: '800' }]}>
              {ASSET_INFO[a].emoji} {year.returns[a] >= 0 ? '+' : '−'}
              {Math.abs(Math.round(year.returns[a] * 100))}%
            </Text>
          ))}
        </View>
        {phase === 'rush' ? (
          <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.line, overflow: 'hidden' }}>
            <View style={{ height: 8, width: `${(left / RUSH.seconds) * 100}%`, backgroundColor: left < 3 ? colors.error : colors.dash }} />
          </View>
        ) : null}
      </Card>

      {ASSETS_ORDER.map((a) => {
        const w = mix[a] / t;
        const off = offBy(mix, a);
        const ok = Math.abs(off) <= RUSH.tolerance * 100;
        return (
          <Card key={a} style={{ gap: 6, paddingVertical: space(1.25) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 22 }}>{ASSET_INFO[a].emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={type.bodyBold}>
                  {ASSET_INFO[a].name} {Math.round(w * 100)}%{' '}
                  <Text style={[type.small, { color: ok ? colors.kipDark : colors.error }]}>
                    {ok ? '✓' : off > 0 ? `${off} over` : `${-off} under`} · plan {Math.round(TARGET[a] * 100)}%
                  </Text>
                </Text>
                <View style={{ height: 10, borderRadius: 5, backgroundColor: colors.line, marginTop: 4 }}>
                  <View style={{ height: 10, borderRadius: 5, width: `${Math.min(w, 1) * 100}%`, backgroundColor: ok ? colors.kip : colors.dash }} />
                  <View style={{ position: 'absolute', left: `${TARGET[a] * 100}%`, top: -3, width: 3, height: 16, borderRadius: 2, backgroundColor: colors.ink }} />
                </View>
              </View>
              {phase === 'rush' ? (
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <RushButton
                    testID={`rush-sell-${a}`}
                    label="Sell"
                    disabled={mix[a] <= 0}
                    onPress={() => {
                      setMix((m) => sell(m, a));
                      setTrades((x) => ({ ...x, sold: new Set(x.sold).add(a) }));
                    }}
                  />
                  <RushButton
                    testID={`rush-buy-${a}`}
                    label="Buy"
                    disabled={mix.cash <= 1}
                    onPress={() => {
                      setMix((m) => buy(m, a));
                      setTrades((x) => ({ ...x, bought: new Set(x.bought).add(a) }));
                    }}
                  />
                </View>
              ) : null}
            </View>
          </Card>
        );
      })}
      {phase === 'rush' ? (
        <Text style={[type.bodyBold, { textAlign: 'center' }]}>{mix.cash > 1 ? `💵 ${formatINR(mix.cash)} waiting to be placed` : 'Sell what’s over, buy what’s under.'}</Text>
      ) : null}

      {phase === 'result' && lastRound ? (
        <Card style={{ gap: 6, borderColor: lastRound.onPlan ? colors.kip : colors.dash }}>
          <Text style={type.bodyBold}>{lastRound.onPlan ? '✅ Back on plan.' : '⏱️ Time’s up: still off plan.'}</Text>
          <Text style={type.small}>
            {lastRound.soldHigh
              ? 'You sold something that had just jumped: selling high.'
              : lastRound.boughtLow
                ? 'You bought something that had just fallen: buying low.'
                : lastRound.onPlan
                  ? 'Small drift this year, so little to do. Fewer trades, fewer costs.'
                  : 'Leftover cash went back in as it was. The drift carries into next year.'}
          </Text>
          <Pressable
            testID="rush-next"
            onPress={() => {
              if (round + 1 >= RUSH.rounds) setPhase('done');
              else {
                setRound((n) => n + 1);
                setMix((m) => grow(m, years[round + 1]));
                setTrades({ sold: new Set(), bought: new Set() });
                setLeft(RUSH.seconds);
                setPhase('market');
              }
            }}
            style={{ alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.ink }}>
            <Text style={[type.small, { color: '#fff', fontWeight: '800' }]}>{round + 1 >= RUSH.rounds ? 'See how you did ›' : `Year ${round + 2} ›`}</Text>
          </Pressable>
        </Card>
      ) : null}
    </View>
  );
}

function RushButton({ label, onPress, disabled, testID }: { label: string; onPress: () => void; disabled?: boolean; testID: string }) {
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      accessibilityRole="button"
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => ({ paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.md, borderWidth: 2, borderColor: disabled ? colors.line : colors.ink, backgroundColor: pressed ? colors.kipLight : colors.surface, opacity: disabled ? 0.4 : 1 })}>
      <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>{label}</Text>
    </Pressable>
  );
}

function CompareRow({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={[type.small, { flex: 1 }]}>{label}</Text>
      <Text style={[type.bodyBold, { width: 90, textAlign: 'right' }]}>{a}</Text>
      <Text style={[type.bodyBold, { width: 90, textAlign: 'right', color: colors.inkSoft }]}>{b}</Text>
    </View>
  );
}
