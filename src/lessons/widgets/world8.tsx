/** World 8, Analyst HQ: ratios, Ratio Detective, reading charts and the Payoff Puzzle. */
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { LEGS, payoff, PRICES, PUZZLES, sameShape, type Leg } from '../../games/payoff';
import { CASES } from '../../games/ratios';
import { Character } from '../../mascot/Character';
import { createRng, normal } from '../../sim/rng';
import { LineChart } from '../../ui/LineChart';
import { Card, HypotheticalLabel } from '../../ui/components';
import { Slider } from '../../ui/Slider';
import { colors, formatINRChange, radius, space, type } from '../../ui/theme';

// ---- Ratio calculator ------------------------------------------------------------------

export function RatioCalcWidget({ onDone }: { onDone: () => void }) {
  const [price, setPrice] = useState(200);
  const [seen, setSeen] = useState({ low: false, high: false });
  useEffect(() => {
    if (seen.low && seen.high) onDone();
  }, [seen, onDone]);
  const eps = 10; // ₹10 crore profit / 1 crore shares
  const book = 80;
  const pe = price / eps;
  const pb = price / book;
  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ gap: 6 }}>
        <Text style={type.small}>🍪 Sunrise Foods earns ₹10 crore a year and has 1 crore shares: ₹10 of profit per share (EPS). Its net assets are ₹80 a share.</Text>
        <Text style={type.bodyBold}>Share price: ₹{price}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Card style={{ flex: 1, alignItems: 'center', padding: space(1) }}>
            <Text style={type.tiny}>P/E</Text>
            <Text style={type.title}>{pe.toFixed(0)}</Text>
          </Card>
          <Card style={{ flex: 1, alignItems: 'center', padding: space(1) }}>
            <Text style={type.tiny}>P/B</Text>
            <Text style={type.title}>{pb.toFixed(1)}</Text>
          </Card>
        </View>
        <Text style={type.small}>
          You pay ₹{pe.toFixed(0)} for every ₹1 of yearly profit. If profits never grew, it would take {pe.toFixed(0)} years to earn back the price.{' '}
          {pe >= 50 ? 'Buyers expect huge growth. If it doesn’t come, the price can fall hard.' : pe <= 10 ? 'Cheap, or the market expects profits to shrink. Find out which.' : 'In the range many steady companies trade at.'}
        </Text>
      </Card>
      <Slider
        min={50}
        max={800}
        value={price}
        step={10}
        onChange={(v) => {
          setPrice(v);
          setSeen((p) => ({ low: p.low || v <= 100, high: p.high || v >= 500 }));
        }}
        label="Move the share price"
        accessibilityLabel="Share price"
        testID="price-slider"
      />
    </View>
  );
}

// ---- Ratio Detective -------------------------------------------------------------------

export function RatioDetectiveWidget({ params, onDone }: { params: Record<string, unknown>; onDone: () => void }) {
  const ids = typeof params.cases === 'string' ? params.cases.split(',') : null;
  const cases = ids ? CASES.filter((c) => ids.includes(c.id)) : CASES;
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const finished = i >= cases.length;
  useEffect(() => {
    if (finished) onDone();
  }, [finished, onDone]);
  if (finished) {
    return (
      <Card style={{ alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 40 }}>🔎</Text>
        <Text style={type.title}>
          {right} / {cases.length} cases cracked
        </Text>
        <Text style={[type.small, { textAlign: 'center' }]}>No single ratio tells the story. Read price, debt, profitability and growth together.</Text>
      </Card>
    );
  }
  const c = cases[i];
  return (
    <View style={{ gap: space(1.5) }}>
      <Text style={type.tiny}>
        CASE FILE {i + 1} OF {cases.length}
      </Text>
      <Text style={type.h2}>{c.question}</Text>
      {c.companies.map((co, k) => {
        const chosen = pick === k;
        const correct = pick !== null && k === c.answer;
        return (
          <Pressable
            key={co.name}
            testID={`suspect-${k}`}
            disabled={pick !== null}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setPick(k);
              if (k === c.answer) setRight((r) => r + 1);
            }}
            style={{ padding: space(1.5), borderRadius: radius.md, borderWidth: 2.5, borderColor: correct ? colors.kip : chosen ? colors.error : colors.line, backgroundColor: colors.surface, gap: 4 }}>
            <Text style={type.bodyBold}>
              {co.emoji} {co.name}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Stat label="P/E" value={String(co.pe)} />
              <Stat label="Debt/Equity" value={co.de.toFixed(1)} />
              <Stat label="ROE" value={`${co.roe}%`} />
              <Stat label="Profit growth" value={`${co.growth > 0 ? '+' : ''}${co.growth}%`} />
            </View>
          </Pressable>
        );
      })}
      {pick === null ? (
        i === 0 ? (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Character name="dash" mood="cheer" size={44} animate={false} />
            <Text style={[type.small, { flex: 1 }]}>Dash: “Everyone’s talking about the AI one. It can’t be overpriced!”</Text>
          </View>
        ) : null
      ) : (
        <Card style={{ gap: 6, borderColor: pick === c.answer ? colors.kip : colors.error }}>
          <Text style={type.bodyBold}>{pick === c.answer ? '✅ Case closed.' : `The file points to ${c.companies[c.answer].name}.`}</Text>
          <Text style={type.small}>{c.why}</Text>
          <Pressable
            testID="case-next"
            onPress={() => {
              setPick(null);
              setI((n) => n + 1);
            }}
            style={{ alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.ink }}>
            <Text style={[type.small, { color: '#fff', fontWeight: '800' }]}>Next file ›</Text>
          </Pressable>
        </Card>
      )}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={type.tiny}>{label}</Text>
      <Text style={[type.bodyBold, { fontVariant: ['tabular-nums'] }]}>{value}</Text>
    </View>
  );
}

// ---- Candles, support and moving averages ----------------------------------------------

interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
}

function candlesFor(seed: number, n = 24): Candle[] {
  const rng = createRng(seed);
  let p = 100;
  return Array.from({ length: n }, (_, i) => {
    const open = p;
    // A dip towards a floor around 92, then a recovery: a pattern worth spotting, not a promise.
    const drift = i < 10 ? -0.008 : i < 14 ? 0 : 0.009;
    const close = Math.max(open * (1 + drift + 0.018 * normal(rng)), 92 + rng() * 1.5);
    const high = Math.max(open, close) * (1 + rng() * 0.012);
    const low = Math.max(Math.min(open, close) * (1 - rng() * 0.012), 91.5);
    p = close;
    return { open, close, high, low };
  });
}

export function CandlesWidget({ onDone }: { onDone: () => void }) {
  const [seed] = useState(() => Math.floor(Math.random() * 1e9));
  const candles = useMemo(() => candlesFor(seed), [seed]);
  const [showSupport, setShowSupport] = useState(false);
  const [showAvg, setShowAvg] = useState(false);
  const [seen, setSeen] = useState({ support: false, avg: false });
  useEffect(() => {
    if (seen.support && seen.avg) onDone();
  }, [seen, onDone]);
  const H = 170;
  const hi = Math.max(...candles.map((c) => c.high));
  const lo = Math.min(...candles.map((c) => c.low));
  const y = (v: number) => ((hi - v) / (hi - lo)) * (H - 8) + 4;
  const support = Math.min(...candles.map((c) => c.low)) + 0.3;
  const avg = candles.map((_, i) => {
    const w = candles.slice(Math.max(0, i - 4), i + 1);
    return w.reduce((s, c) => s + c.close, 0) / w.length;
  });
  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ gap: 6 }}>
        <View style={{ height: H, flexDirection: 'row' }}>
          {candles.map((c, i) => {
            const up = c.close >= c.open;
            return (
              <View key={i} style={{ flex: 1, height: H }}>
                <View style={{ position: 'absolute', left: '45%', width: 1.5, top: y(c.high), height: Math.max(y(c.low) - y(c.high), 1), backgroundColor: colors.inkSoft }} />
                <View style={{ position: 'absolute', left: '18%', right: '18%', top: y(Math.max(c.open, c.close)), height: Math.max(Math.abs(y(c.open) - y(c.close)), 2), borderRadius: 2, backgroundColor: up ? colors.kip : colors.error }} />
                {showAvg ? <View style={{ position: 'absolute', left: '30%', width: 6, height: 6, borderRadius: 3, top: y(avg[i]) - 3, backgroundColor: colors.melt }} /> : null}
              </View>
            );
          })}
          {showSupport ? <View style={{ position: 'absolute', left: 0, right: 0, top: y(support), borderTopWidth: 2, borderStyle: 'dashed', borderColor: colors.shellDark }} /> : null}
        </View>
        <Text style={type.tiny}>Each candle is one day: 🟩 closed higher than it opened, 🟥 closed lower. The thin wick shows the day’s high and low.</Text>
        {showSupport ? <Text style={type.small}>Support (dashed): buyers kept stepping in around ₹{Math.round(support)}, so the price bounced there.</Text> : null}
        {showAvg ? <Text style={type.small}>5-day average (purple dots): smooths out the daily noise to show the trend.</Text> : null}
      </Card>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Toggle
          label="Support line"
          on={showSupport}
          testID="toggle-support"
          onPress={() => {
            setShowSupport((v) => !v);
            setSeen((p) => ({ ...p, support: true }));
          }}
        />
        <Toggle
          label="Moving average"
          on={showAvg}
          testID="toggle-avg"
          onPress={() => {
            setShowAvg((v) => !v);
            setSeen((p) => ({ ...p, avg: true }));
          }}
        />
      </View>
      <HypotheticalLabel extra="Patterns describe the past. They don’t promise what comes next." />
    </View>
  );
}

function Toggle({ label, on, onPress, testID }: { label: string; on: boolean; onPress: () => void; testID: string }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      onPress={onPress}
      style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.pill, borderWidth: 2, borderColor: on ? colors.kip : colors.line, backgroundColor: on ? colors.kipLight : colors.surface }}>
      <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>
        {on ? '✓ ' : ''}
        {label}
      </Text>
    </Pressable>
  );
}

// ---- Payoff Puzzle ---------------------------------------------------------------------

const LEG_ORDER: Leg[] = ['stock', 'buyPut', 'sellCall', 'buyCall', 'buyPutAtm'];

export function PayoffWidget({ params, onDone }: { params: Record<string, unknown>; onDone: () => void }) {
  const ids = typeof params.puzzles === 'string' ? params.puzzles.split(',') : null;
  const puzzles = ids ? PUZZLES.filter((z) => ids.includes(z.id)) : PUZZLES;
  const [i, setI] = useState(0);
  const [legs, setLegs] = useState<Leg[]>([]);
  const finished = i >= puzzles.length;
  useEffect(() => {
    if (finished) onDone();
  }, [finished, onDone]);
  if (finished) {
    return (
      <Card style={{ alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 40 }}>🧩</Text>
        <Text style={type.title}>All {puzzles.length} shapes built</Text>
        <Text style={[type.small, { textAlign: 'center' }]}>Every options strategy is just a shape: what you make or lose at each price. Know the shape before you trade it.</Text>
      </Card>
    );
  }
  const z = puzzles[i];
  const solved = sameShape(legs, z.target);
  const line = (set: Leg[]) => PRICES.map((p) => ({ x: p - PRICES[0], y: payoff(set, p) }));
  const xMax = PRICES[PRICES.length - 1] - PRICES[0];
  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ gap: 6 }}>
        <Text style={type.tiny}>
          PUZZLE {i + 1} OF {puzzles.length}
        </Text>
        <Text style={type.h2}>{z.name}</Text>
        <Text style={type.small}>{z.goal}</Text>
        <LineChart
          series={[
            { id: 'target', label: 'Target shape', color: colors.inkMuted, points: line(z.target), hideMarker: true },
            ...(legs.length ? [{ id: 'yours', label: 'Your legs', color: solved ? colors.kip : colors.dash, points: line(legs) }] : []),
          ]}
          selectedX={xMax}
          xMax={xMax}
          height={170}
          formatY={(v) => formatINRChange(v)}
          formatX={(v) => `Price ₹${v + PRICES[0]}`}
        />
        <Text style={type.tiny}>Profit or loss at expiry (y) for each share price (x). The flat line in the middle is ₹0.</Text>
      </Card>
      {LEG_ORDER.map((l) => {
        const on = legs.includes(l);
        return (
          <Pressable
            key={l}
            testID={`leg-${l}`}
            disabled={solved}
            accessibilityRole="switch"
            accessibilityState={{ checked: on }}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              const next = on ? legs.filter((x) => x !== l) : [...legs, l];
              setLegs(next);
              if (sameShape(next, z.target)) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: space(1.25), borderRadius: radius.md, borderWidth: 2, borderColor: on ? colors.kip : colors.line, backgroundColor: on ? colors.kipLight : colors.surface }}>
            <Text style={{ fontSize: 22 }}>{LEGS[l].emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>{LEGS[l].name}</Text>
              <Text style={type.tiny}>{LEGS[l].note}</Text>
            </View>
          </Pressable>
        );
      })}
      {solved ? (
        <Card style={{ gap: 6, borderColor: colors.kip }}>
          <Text style={type.bodyBold}>✅ That’s a {z.name.toLowerCase()}.</Text>
          <Pressable
            testID="puzzle-next"
            onPress={() => {
              setLegs([]);
              setI((n) => n + 1);
            }}
            style={{ alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.ink }}>
            <Text style={[type.small, { color: '#fff', fontWeight: '800' }]}>{i + 1 < puzzles.length ? 'Next shape ›' : 'Finish ›'}</Text>
          </Pressable>
        </Card>
      ) : null}
    </View>
  );
}
