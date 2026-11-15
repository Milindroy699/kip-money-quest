/** World 7, Time Tracks: trading costs, and the same market played fast and slow. */
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { holdPath, SCALP, scalpResult, scalpTicks } from '../../games/timeframe';
import { LineChart } from '../../ui/LineChart';
import { Card, HypotheticalLabel } from '../../ui/components';
import { Slider } from '../../ui/Slider';
import { colors, formatINR, formatINRChange, radius, space, type } from '../../ui/theme';

// ---- Trading costs ---------------------------------------------------------------------

/** Brokerage, exchange charges, STT and spread for one buy-and-sell, as a share of the trade (illustrative). */
const ROUND_TRIP = 0.002;

export function TradeCostsWidget({ onDone }: { onDone: () => void }) {
  const [trips, setTrips] = useState(2);
  const [seen, setSeen] = useState({ few: true, many: false });
  useEffect(() => {
    if (seen.few && seen.many) onDone();
  }, [seen, onDone]);
  const stake = 100000;
  // Each round trip skims costs off whatever the money is worth then; spread them over the year.
  const gross = 0.12;
  const net = (1 + gross) * (1 - ROUND_TRIP) ** trips - 1;
  const costs = stake * (1 + gross) - stake * (1 + net);
  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ gap: 6 }}>
        <Text style={type.small}>₹1,00,000 in shares that rise 12% this year. Every buy-and-sell costs about 0.2% in brokerage, taxes and spread.</Text>
        <Text style={type.bodyBold}>
          {trips} round {trips === 1 ? 'trip' : 'trips'} a year
        </Text>
        <Text style={[type.hero, { color: net < 0 ? colors.error : colors.kipDark }]}>
          {net >= 0 ? '+' : ''}
          {(net * 100).toFixed(1)}%
        </Text>
        <Text style={type.small}>Costs paid: {formatINR(costs)}. You also pay tax at the higher short-term rate on gains from shares held under a year.</Text>
        <Text style={type.small}>{trips >= 100 ? 'A trade most days: the costs ate the whole year’s gain, before any bad trades.' : trips >= 25 ? 'Weekly trading: costs alone take a big bite.' : 'Few trades: costs barely matter.'}</Text>
      </Card>
      <Slider
        min={1}
        max={250}
        value={trips}
        step={1}
        onChange={(v) => {
          setTrips(v);
          setSeen((p) => ({ ...p, many: p.many || v >= 100 }));
        }}
        label="How often do you trade?"
        accessibilityLabel="Round trips a year"
        testID="trades-slider"
      />
      <HypotheticalLabel extra="Real costs vary by broker and product." />
    </View>
  );
}

// ---- Timeframe Racer -------------------------------------------------------------------

export function TimeframeWidget({ onDone }: { onDone: () => void }) {
  const [seed] = useState(() => Math.floor(Math.random() * 1e9));
  const prices = useMemo(() => scalpTicks(seed), [seed]);
  const hold = useMemo(() => holdPath(seed), [seed]);
  const [phase, setPhase] = useState<'intro' | 'scalp' | 'scalped' | 'hold'>('intro');
  const [t, setT] = useState(0);
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [trips, setTrips] = useState<[number, number][]>([]);
  const [month, setMonth] = useState(0);

  useEffect(() => {
    if (phase !== 'scalp') return;
    const id = setInterval(() => setT((x) => x + 1), 450);
    return () => clearInterval(id);
  }, [phase]);
  // The session ends: close any open trade at the last price. (Adjusting state during render.)
  if (phase === 'scalp' && t >= SCALP.ticks - 1) {
    setPhase('scalped');
    if (openAt !== null) {
      setTrips((x) => [...x, [openAt, SCALP.ticks - 1]]);
      setOpenAt(null);
    }
  }
  useEffect(() => {
    if (phase === 'hold' && month >= 60) onDone();
  }, [phase, month, onDone]);

  const result = scalpResult(prices, trips);
  const now = Math.min(t, SCALP.ticks - 1);
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  const pad = (hi - lo) * 0.15 + 0.1;

  if (phase === 'intro') {
    return (
      <Card style={{ gap: space(1) }}>
        <Text style={type.h2}>⚡ Round 1: Scalping</Text>
        <Text style={type.body}>The price ticks every half-second. Tap Buy, then Sell, as often as you like. Every trade pays a {SCALP.costPerTrade * 100}% cost.</Text>
        <Text style={type.small}>Round 2 is the same market, held for 5 years.</Text>
        <Pressable testID="scalp-start" onPress={() => setPhase('scalp')} style={{ padding: space(1.5), borderRadius: radius.md, backgroundColor: colors.ink, alignItems: 'center' }}>
          <Text style={[type.bodyBold, { color: '#fff' }]}>Start the clock ›</Text>
        </Pressable>
      </Card>
    );
  }

  if (phase === 'hold') {
    const value = hold[month];
    return (
      <View style={{ gap: space(1.5) }}>
        <Card style={{ gap: 6 }}>
          <Text style={type.h2}>🐢 Round 2: Long term</Text>
          <LineChart
            series={[{ id: 'hold', label: 'Index fund, held', color: colors.kip, points: hold.map((y, x) => ({ x, y })) }]}
            selectedX={month}
            xMax={60}
            height={170}
            formatY={(v) => formatINR(v)}
            formatX={(v) => (v === 0 ? 'Now' : `${v / 12} yrs`)}
          />
          <Text style={type.bodyBold}>
            Scalping: {formatINRChange(result.net)} after {formatINR(result.costs)} in costs and {result.trades} taps.
          </Text>
          <Text style={type.bodyBold}>
            Holding: {formatINRChange(value - SCALP.stake)} with 1 tap{month >= 60 ? '' : ' (so far)'}.
          </Text>
          {month >= 60 ? <Text style={type.small}>Short horizons are mostly noise plus costs. Long horizons let the market’s slow upward drift compound, and you get your evenings back.</Text> : null}
        </Card>
        <Slider min={0} max={60} value={month} step={1} onChange={setMonth} label="Fast-forward the months" accessibilityLabel="Months held" testID="hold-slider" />
        <HypotheticalLabel />
      </View>
    );
  }

  const live = openAt !== null ? (prices[now] / prices[openAt] - 1) * 100 : null;
  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ gap: 6 }}>
        <Text style={type.tiny}>
          TICK {now + 1} OF {SCALP.ticks} · {trips.length * 2 + (openAt !== null ? 1 : 0)} TRADES
        </Text>
        <LineChart
          series={[{ id: 'p', label: 'Price', color: colors.dash, points: prices.map((y, x) => ({ x, y })) }]}
          selectedX={now}
          xMax={SCALP.ticks - 1}
          height={150}
          yRange={[lo - pad, hi + pad]}
          formatY={(v) => `₹${v.toFixed(2)}`}
          formatX={(v) => (v === 0 ? '9:15' : '9:33')}
        />
        <Text style={type.small}>{live === null ? 'Not holding.' : `Holding since ₹${prices[openAt!].toFixed(2)}: ${live >= 0 ? '+' : ''}${live.toFixed(2)}% before costs.`}</Text>
      </Card>
      {phase === 'scalp' ? (
        <Pressable
          testID="scalp-trade"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            if (openAt === null) setOpenAt(now);
            else {
              if (now > openAt) setTrips((x) => [...x, [openAt, now]]);
              setOpenAt(null);
            }
          }}
          style={{ padding: space(2), borderRadius: radius.md, backgroundColor: openAt === null ? colors.kip : colors.dash, alignItems: 'center' }}>
          <Text style={[type.h2, { color: '#fff' }]}>{openAt === null ? 'BUY' : 'SELL'}</Text>
        </Pressable>
      ) : (
        <Card style={{ gap: 6, borderColor: result.net >= 0 ? colors.kip : colors.error }}>
          <Text style={type.bodyBold}>
            Result: {formatINRChange(result.net)} on {formatINR(SCALP.stake)}
          </Text>
          <Text style={type.small}>{result.trades === 0 ? 'No trades, no costs. Now see the same money held for years.' : `You paid ${formatINR(result.costs)} in costs across ${result.trades} trades. Most tiny moves are noise; the costs are certain.`}</Text>
          <Pressable testID="hold-start" onPress={() => setPhase('hold')} style={{ alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.ink }}>
            <Text style={[type.small, { color: '#fff', fontWeight: '800' }]}>Round 2: hold for 5 years ›</Text>
          </Pressable>
        </Card>
      )}
    </View>
  );
}
