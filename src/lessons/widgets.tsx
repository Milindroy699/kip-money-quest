/** Interactive concept widgets. Each calls `onDone` once the player has explored enough. */
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { getCard } from '../content';
import type { StepT } from '../content/schema';
import { customersFor, STARS, type Fit } from './bazaar';
import { Character } from '../mascot/Character';
import {
  ASSETS,
  createRng,
  DEFAULT_INFLATION,
  futureValue,
  inflatePrice,
  interruptedSipSeries,
  monthlyReturns,
  normal,
  realReturn,
  realValue,
  runLumpSum,
  runSip,
  simpleInterestValue,
  sipFutureValue,
  sipSeries,
  teachingPath,
  type MarketShape,
} from '../sim';
import { Card, HypotheticalLabel } from '../ui/components';
import { LineChart, type ChartSeries } from '../ui/LineChart';
import { Segmented, Slider } from '../ui/Slider';
import { colors, formatINR, radius, space, type } from '../ui/theme';
import { AllocationWidget, FortDefenseWidget, HedgeWidget, RebalanceRushWidget, RebalanceWidget } from './widgets/world5';
import { ArbitrageWidget, FarmerHedgeWidget, IntentWidget, LeverageWidget } from './widgets/world6';
import { TimeframeWidget, TradeCostsWidget } from './widgets/world7';
import { CandlesWidget, PayoffWidget, RatioCalcWidget, RatioDetectiveWidget } from './widgets/world8';
import { PaycheckWidget, RetirementWidget, StartupsWidget } from './widgets/world9';

type ConceptStep = Extract<StepT, { type: 'concept' }>;

const num = (v: unknown, fallback: number) => (typeof v === 'number' ? v : fallback);
const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback);

export function ConceptWidget({ step, onDone }: { step: ConceptStep; onDone: () => void }) {
  switch (step.widget) {
    case 'barter':
      return <BarterWidget onDone={onDone} />;
    case 'reveal':
      return <RevealWidget items={step.items ?? []} onDone={onDone} />;
    case 'inflationShrink':
      return <InflationWidget params={step.params ?? {}} onDone={onDone} />;
    case 'realReturn':
      return <RealReturnWidget params={step.params ?? {}} onDone={onDone} />;
    case 'compoundChart':
      return <CompoundWidget params={step.params ?? {}} onDone={onDone} />;
    case 'sipVsLump':
      return <SipVsLumpWidget onDone={onDone} />;
    case 'riskLadder':
      return <RiskLadderWidget onDone={onDone} />;
    case 'lossOdds':
      return <LossOddsWidget onDone={onDone} />;
    case 'liquidity':
      return <LiquidityWidget onDone={onDone} />;
    case 'rateSeesaw':
      return <RateSeesawWidget onDone={onDone} />;
    case 'ownSlice':
      return <OwnSliceWidget onDone={onDone} />;
    case 'basket':
      return <BasketWidget onDone={onDone} />;
    case 'feeDrag':
      return <FeeDragWidget onDone={onDone} />;
    case 'bazaar':
      return <BazaarWidget params={step.params ?? {}} onDone={onDone} />;
    case 'allocation':
      return <AllocationWidget onDone={onDone} />;
    case 'fortDefense':
      return <FortDefenseWidget params={step.params ?? {}} onDone={onDone} />;
    case 'rebalance':
      return <RebalanceWidget onDone={onDone} />;
    case 'rebalanceRush':
      return <RebalanceRushWidget onDone={onDone} />;
    case 'hedge':
      return <HedgeWidget onDone={onDone} />;
    case 'intent':
      return <IntentWidget params={step.params ?? {}} onDone={onDone} />;
    case 'arbitrage':
      return <ArbitrageWidget onDone={onDone} />;
    case 'leverage':
      return <LeverageWidget onDone={onDone} />;
    case 'farmerHedge':
      return <FarmerHedgeWidget onDone={onDone} />;
    case 'tradeCosts':
      return <TradeCostsWidget onDone={onDone} />;
    case 'timeframe':
      return <TimeframeWidget onDone={onDone} />;
    case 'ratioCalc':
      return <RatioCalcWidget onDone={onDone} />;
    case 'ratioDetective':
      return <RatioDetectiveWidget params={step.params ?? {}} onDone={onDone} />;
    case 'candles':
      return <CandlesWidget onDone={onDone} />;
    case 'payoff':
      return <PayoffWidget params={step.params ?? {}} onDone={onDone} />;
    case 'paycheck':
      return <PaycheckWidget onDone={onDone} />;
    case 'retirement':
      return <RetirementWidget onDone={onDone} />;
    case 'startups':
      return <StartupsWidget onDone={onDone} />;
  }
}

// ---- Barter ---------------------------------------------------------------------

const VILLAGERS = [
  { id: 'ravi', name: 'Ravi', has: '🏏', wants: '🐔' },
  { id: 'meena', name: 'Meena', has: '🐔', wants: '🥭' },
  { id: 'asha', name: 'Asha', has: '📚', wants: '🏏' },
  { id: 'imran', name: 'Imran', has: '🥛', wants: '📚' },
];

function BarterWidget({ onDone }: { onDone: () => void }) {
  const [holding, setHolding] = useState('🥭');
  const [trades, setTrades] = useState(0);
  const [message, setMessage] = useState('You have 🥭. You want 🏏.');
  const done = holding === '🏏';

  const tryTrade = (v: (typeof VILLAGERS)[number]) => {
    if (done) return;
    if (v.wants === holding) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setHolding(v.has);
      setTrades((t) => t + 1);
      if (v.has === '🏏') {
        setMessage('Got the bat! 🎉');
        onDone();
      } else setMessage(`${v.name} swapped! Now you have ${v.has}.`);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setMessage(`${v.name} wants ${v.wants}, not ${holding}. No deal.`);
    }
  };

  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ alignItems: 'center', paddingVertical: space(1.5) }}>
        <Text style={type.small}>You’re holding</Text>
        <Text style={{ fontSize: 48 }}>{holding}</Text>
        <Text style={[type.bodyBold, { textAlign: 'center' }]}>{message}</Text>
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(1) }}>
        {VILLAGERS.map((v) => (
          <Pressable key={v.id} onPress={() => tryTrade(v)} style={{ width: '48%' }} accessibilityRole="button" accessibilityLabel={`${v.name} has ${v.has} and wants ${v.wants}`}>
            <Card style={{ padding: space(1.5), alignItems: 'center' }}>
              <Text style={type.bodyBold}>{v.name}</Text>
              <Text style={[type.small, { marginTop: 4 }]}>
                Has {v.has} · Wants {v.wants}
              </Text>
            </Card>
          </Pressable>
        ))}
      </View>
      {done ? (
        <Card style={{ backgroundColor: colors.kipLight, borderColor: colors.kip }}>
          <Text style={type.bodyBold}>That took {trades} trades and lots of asking around.</Text>
          <Text style={[type.body, { marginTop: 4 }]}>With money: sell your mangoes for ₹200 to anyone, then buy the bat. One step. 🪙</Text>
        </Card>
      ) : null}
    </View>
  );
}

// ---- Reveal ---------------------------------------------------------------------

function RevealWidget({ items, onDone }: { items: NonNullable<ConceptStep['items']>; onDone: () => void }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  useEffect(() => {
    if (items.length > 0 && open.size === items.length) onDone();
  }, [open, items.length, onDone]);
  return (
    <View style={{ gap: space(1.25) }}>
      {items.map((item, i) => {
        const isOpen = open.has(i);
        return (
          <Pressable
            key={item.title}
            accessibilityRole="button"
            accessibilityState={{ expanded: isOpen }}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setOpen((s) => new Set(s).add(i));
            }}>
            <Card style={{ flexDirection: 'row', gap: space(1.5), alignItems: 'flex-start', borderColor: isOpen ? colors.kip : colors.line, padding: space(2) }}>
              <Text style={{ fontSize: 30 }}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={type.bodyBold}>{item.title}</Text>
                {isOpen ? <Text style={[type.body, { marginTop: 4 }]}>{item.text}</Text> : <Text style={[type.small, { marginTop: 2 }]}>Tap to reveal</Text>}
              </View>
            </Card>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---- Inflation ------------------------------------------------------------------

function InflationWidget({ params, onDone }: { params: Record<string, unknown>; onDone: () => void }) {
  const price = num(params.price, 20);
  const inflation = num(params.inflation, DEFAULT_INFLATION);
  const maxYears = num(params.maxYears, 40);
  const item = str(params.item, 'chai');
  const [years, setYears] = useState(0);
  const fired = useRef(false);
  const future = inflatePrice(price, inflation, years);
  const buys = realValue(1000, inflation, years);
  const bagScale = Math.sqrt(buys / 1000);

  useEffect(() => {
    if (!fired.current && years >= Math.min(20, maxYears * 0.5)) {
      fired.current = true;
      onDone();
    }
  }, [years, maxYears, onDone]);

  return (
    <View style={{ gap: space(2) }}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 44 }}>☕</Text>
          <Text style={type.small}>{item} price</Text>
          <Text style={[type.title, { color: colors.melt }]}>₹{Math.round(future)}</Text>
          <Text style={type.tiny}>today ₹{price}</Text>
        </View>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <View style={{ height: 64, justifyContent: 'center' }}>
            <Text style={{ fontSize: 52 * bagScale + 8 }}>💰</Text>
          </View>
          <Text style={type.small}>₹1,000 buys</Text>
          <Text style={[type.title, { color: colors.ink }]}>₹{Math.round(buys)}</Text>
          <Text style={type.tiny}>of today’s stuff</Text>
        </View>
        <View style={{ position: 'absolute', right: -10, bottom: -10, opacity: Math.min(years / maxYears + 0.2, 0.9) }} pointerEvents="none">
          <Character name="melt" size={56 + years * 1.2} animate={false} />
        </View>
      </Card>
      <Slider testID="concept-slider" min={0} max={maxYears} value={years} onChange={setYears} label={`Years from now: ${years}`} color={colors.melt} />
      <HypotheticalLabel extra={`Assumes ${Math.round(inflation * 100)}% inflation every year.`} />
    </View>
  );
}

// ---- Real return ------------------------------------------------------------------

const PRODUCTS = [
  { id: 'cash', label: 'Cash', rate: 0 },
  { id: 'savings', label: 'Savings 3%', rate: 0.03 },
  { id: 'fd', label: 'FD 7%', rate: 0.07 },
] as const;

function RealReturnWidget({ params, onDone }: { params: Record<string, unknown>; onDone: () => void }) {
  const inflation = num(params.inflation, DEFAULT_INFLATION);
  const years = num(params.years, 10);
  const amount = num(params.amount, 10000);
  const [product, setProduct] = useState<(typeof PRODUCTS)[number]['id']>('savings');
  const [seen, setSeen] = useState<Set<string>>(new Set(['savings']));
  const p = PRODUCTS.find((x) => x.id === product)!;
  const nominal = futureValue(amount, p.rate, years);
  const real = realValue(nominal, inflation, years);
  const rr = realReturn(p.rate, inflation);
  const ahead = real >= amount;

  useEffect(() => {
    if (seen.size >= 2) onDone();
  }, [seen, onDone]);

  const max = Math.max(nominal, amount) * 1.05;
  const bar = (value: number, color: string, label: string) => (
    <View style={{ flex: 1, alignItems: 'center', gap: 6 }}>
      <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>{formatINR(value)}</Text>
      <View style={{ height: 140, width: 44, justifyContent: 'flex-end' }}>
        <View style={{ height: (value / max) * 140, backgroundColor: color, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
      </View>
      <Text style={[type.tiny, { textAlign: 'center' }]}>{label}</Text>
    </View>
  );

  return (
    <View style={{ gap: space(2) }}>
      <Segmented
        options={PRODUCTS.map((x) => ({ id: x.id, label: x.label }))}
        value={product}
        onChange={(id) => {
          setProduct(id);
          setSeen((s) => new Set(s).add(id));
        }}
      />
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          {bar(amount, colors.inkMuted, 'You put in today')}
          {bar(nominal, colors.kip, `Balance in ${years} yrs`)}
          {bar(real, colors.melt, "What it buys in today's money")}
        </View>
        <View style={{ marginTop: space(2), padding: space(1.5), borderRadius: radius.md, backgroundColor: ahead ? colors.kipLight : colors.meltLight }}>
          <Text style={type.bodyBold}>
            Real return ≈ {(rr * 100).toFixed(1)}% a year {ahead ? '✅ ahead of The Melt' : '🫠 The Melt wins'}
          </Text>
          <Text style={[type.small, { marginTop: 2 }]}>
            {Math.round(p.rate * 100)}% interest − {Math.round(inflation * 100)}% inflation
          </Text>
        </View>
      </Card>
      <HypotheticalLabel />
    </View>
  );
}

// ---- Compounding charts -----------------------------------------------------------

function CompoundWidget({ params, onDone }: { params: Record<string, unknown>; onDone: () => void }) {
  const mode = str(params.mode, 'kipVsDash');
  const rate = num(params.rate, 0.12);
  const monthly = num(params.monthly, 500);
  const amount = num(params.amount, 10000);
  const inflation = num(params.inflation, DEFAULT_INFLATION);
  const everyYears = num(params.everyYears, 4);
  const isAge = mode === 'startEarly';
  const xMin = isAge ? 15 : 0;
  const xMax = isAge ? 60 : num(params.maxYears, mode === 'kipVsDash' ? 40 : 30);
  const [x, setX] = useState(isAge ? 20 : mode === 'simpleVsCompound' ? 1 : 3);
  const [todaysMoney, setTodaysMoney] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (!fired.current && (x - xMin) / (xMax - xMin) >= 0.6) {
      fired.current = true;
      onDone();
    }
  }, [x, xMin, xMax, onDone]);

  const series: ChartSeries[] = useMemo(() => {
    const years = Array.from({ length: xMax - xMin + 1 }, (_, i) => i);
    const deflate = (v: number, y: number) => (todaysMoney ? v / Math.pow(1 + inflation, y) : v);
    switch (mode) {
      case 'simpleVsCompound':
        return [
          { id: 'compound', label: 'Compound interest', color: colors.kip, points: years.map((y) => ({ x: y, y: futureValue(amount, rate, y) })) },
          { id: 'simple', label: 'Simple interest', color: colors.dash, points: years.map((y) => ({ x: y, y: simpleInterestValue(amount, rate, y) })) },
        ];
      case 'startEarly':
        return [
          { id: 'early', label: 'Start at 15', color: colors.kip, points: years.map((i) => ({ x: i, y: sipFutureValue(monthly, rate, i) })) },
          { id: 'late', label: 'Start at 25', color: colors.dash, points: years.map((i) => ({ x: i, y: i < 10 ? 0 : sipFutureValue(monthly, rate, i - 10) })) },
        ];
      case 'withdrawals':
        return [
          { id: 'steady', label: 'Kip: steady SIP', color: colors.kip, points: sipSeries(monthly, rate, xMax).map((p) => ({ x: p.year, y: p.value })) },
          { id: 'inout', label: `Dash: cashes out every ${everyYears} yrs`, color: colors.dash, points: interruptedSipSeries(monthly, rate, xMax, everyYears).map((p) => ({ x: p.year, y: p.value })) },
        ];
      default: {
        const kip = years.map((y) => ({ x: y, y: deflate(sipFutureValue(monthly, rate, y), y) }));
        const dash = years.map((y) => ({ x: y, y: deflate(monthly * 12 * y, y) }));
        const dashReal = years.map((y) => ({ x: y, y: (monthly * 12 * y) / Math.pow(1 + inflation, y) }));
        return [
          { id: 'kip', label: 'Kip: monthly SIP', color: colors.kip, points: kip },
          {
            id: 'dash',
            label: todaysMoney ? "Dash: cash (today's money)" : 'Dash: cash in a drawer',
            color: colors.dash,
            points: dash,
            ...(todaysMoney ? {} : { bandTo: dashReal, bandColor: colors.melt }),
          },
        ];
      }
    }
  }, [mode, xMax, xMin, amount, rate, monthly, inflation, everyYears, todaysMoney]);

  const xi = x - xMin;
  const label = isAge ? `Age: ${x}` : `Years: ${x}`;
  const invested =
    mode === 'kipVsDash' || mode === 'withdrawals' ? `Each has put in ${formatINR(monthly * 12 * xi)}` : mode === 'startEarly' ? `Put in: ${formatINR(monthly * 12 * xi)} vs ${formatINR(monthly * 12 * Math.max(xi - 10, 0))}` : `Started with ${formatINR(amount)}`;

  return (
    <View style={{ gap: space(1.5) }}>
      {mode === 'kipVsDash' ? (
        <Segmented
          options={[
            { id: 'future', label: 'Future rupees' },
            { id: 'today', label: "Today's money" },
          ]}
          value={todaysMoney ? 'today' : 'future'}
          onChange={(v) => setTodaysMoney(v === 'today')}
        />
      ) : null}
      <Card style={{ paddingHorizontal: space(1.5) }}>
        <LineChart series={series} selectedX={xi} xMax={xMax - xMin} formatY={formatINR} formatX={(v) => (isAge ? `${v + xMin}` : `${v}y`)} />
        {mode === 'kipVsDash' && !todaysMoney ? (
          <Text style={[type.tiny, { marginTop: 6 }]}>🟪 Purple band = what The Melt (inflation) eats from Dash’s cash.</Text>
        ) : null}
      </Card>
      <Slider testID="concept-slider" min={xMin} max={xMax} value={x} onChange={setX} label={label} />
      <Text style={[type.small, { textAlign: 'center' }]}>{invested}</Text>
      <HypotheticalLabel extra={`Hypothetical ${Math.round(rate * 100)}% a year${mode === 'kipVsDash' ? `, ${Math.round(inflation * 100)}% inflation` : ''}.`} />
    </View>
  );
}

// ---- Lump sum vs SIP --------------------------------------------------------------

const SHAPES: { id: MarketShape; label: string }[] = [
  { id: 'rising', label: 'Steady rise' },
  { id: 'choppy', label: 'Choppy' },
  { id: 'falling-then-recovering', label: 'Dip, then recover' },
];

function SipVsLumpWidget({ onDone }: { onDone: () => void }) {
  const [shape, setShape] = useState<MarketShape>('rising');
  const [seen, setSeen] = useState<Set<MarketShape>>(new Set(['rising']));
  const prices = useMemo(() => teachingPath(shape, 12), [shape]);
  const sip = runSip(prices, 1000);
  const lump = runLumpSum(prices, sip.invested);
  const sipWins = sip.finalValue > lump.finalValue;
  const [grow] = useState(() => new Animated.Value(0));

  useEffect(() => {
    grow.setValue(0);
    Animated.spring(grow, { toValue: 1, useNativeDriver: false, friction: 7 }).start();
  }, [shape, grow]);
  useEffect(() => {
    if (seen.size >= 2) onDone();
  }, [seen, onDone]);

  const max = Math.max(sip.finalValue, lump.finalValue, sip.invested) * 1.1;
  const bar = (value: number, color: string, labelText: string, winner: boolean) => (
    <View style={{ flex: 1, alignItems: 'center', gap: 6 }}>
      <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>
        {formatINR(value)} {winner ? '🏆' : ''}
      </Text>
      <View style={{ height: 120, width: 56, justifyContent: 'flex-end' }}>
        <Animated.View style={{ height: grow.interpolate({ inputRange: [0, 1], outputRange: [0, (value / max) * 120] }), backgroundColor: color, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
      </View>
      <Text style={type.tiny}>{labelText}</Text>
    </View>
  );

  return (
    <View style={{ gap: space(1.5) }}>
      <Segmented
        options={SHAPES}
        value={shape}
        onChange={(s) => {
          setShape(s);
          setSeen((prev) => new Set(prev).add(s));
        }}
      />
      <Card style={{ paddingHorizontal: space(1.5) }}>
        <Text style={[type.small, { marginBottom: 6 }]}>Price over 12 months</Text>
        <LineChart
          height={110}
          series={[{ id: 'price', label: 'Price', color: colors.ink, points: prices.map((p, i) => ({ x: i, y: p })), hideMarker: true }]}
          selectedX={12}
          xMax={12}
          formatY={(v) => `₹${Math.round(v)}`}
          formatX={(v) => `M${v}`}
        />
      </Card>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          {bar(sip.invested, colors.inkMuted, 'Put in', false)}
          {bar(lump.finalValue, colors.dash, 'Lump sum', !sipWins)}
          {bar(sip.finalValue, colors.kip, 'SIP ₹1,000/mo', sipWins)}
        </View>
        <Text style={[type.bodyBold, { marginTop: space(1.5), textAlign: 'center' }]}>
          {sipWins ? 'SIP wins: it bought more units while prices were low.' : 'Lump sum wins: all the money rode the rise from day one.'}
        </Text>
      </Card>
      <HypotheticalLabel extra="Illustrative price paths." />
    </View>
  );
}

// ---- Risk ladder ------------------------------------------------------------------

const LADDER = [
  { id: 'savings', label: 'Savings', emoji: '🏦' },
  { id: 'fd', label: 'Fixed deposit', emoji: '🔒' },
  { id: 'govBond', label: 'Govt bond', emoji: '🏛️' },
  { id: 'indexFund', label: 'Index fund', emoji: '📊' },
  { id: 'stock', label: 'One company’s shares', emoji: '📈' },
  { id: 'crypto', label: 'Crypto', emoji: '🪙' },
] as const;

/** Climb the ladder: expected return rises, and so does the range of what one year can do. */
function RiskLadderWidget({ onDone }: { onDone: () => void }) {
  const [rung, setRung] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  useEffect(() => {
    if (seen.size >= 3 && seen.has(LADDER.length - 1)) onDone();
  }, [seen, onDone]);
  const item = LADDER[rung];
  const a = ASSETS[item.id];
  // A "bad year" and a "good year": roughly 1 year in 20 is worse / better than these.
  const bad = Math.max(a.expectedReturn - 1.65 * a.volatility, -0.8); // you can't lose more than everything
  const good = a.expectedReturn + 1.65 * a.volatility;
  const lo = -1.0;
  const hi = 1.4;
  const pos = (x: number) => `${((Math.min(Math.max(x, lo), hi) - lo) / (hi - lo)) * 100}%` as const;
  const pct = (x: number) => `${x >= 0 ? '+' : ''}${Math.round(x * 100)}%`;
  return (
    <View style={{ gap: space(2) }}>
      <Card style={{ gap: space(1.5) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 30 }}>{item.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={type.tiny}>RUNG {rung + 1} OF {LADDER.length}</Text>
            <Text style={type.h2}>{item.label}</Text>
          </View>
        </View>
        <Text style={type.bodyBold}>Typical year: {pct(a.expectedReturn)}</Text>
        <View style={{ height: 34, justifyContent: 'center' }} accessibilityLabel={`Bad year ${pct(bad)}, good year ${pct(good)}`}>
          <View style={{ height: 4, backgroundColor: colors.line, borderRadius: 2 }} />
          <View style={{ position: 'absolute', left: pos(bad), right: `${100 - parseFloat(pos(good))}%`, height: 14, borderRadius: 7, backgroundColor: rung >= 4 ? colors.error : rung >= 3 ? colors.dash : colors.kip, opacity: 0.85 }} />
          <View style={{ position: 'absolute', left: pos(0), width: 2, height: 30, backgroundColor: colors.ink }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[type.small, { color: bad < 0 ? colors.error : colors.ink, fontWeight: '800' }]}>Bad year {pct(bad)}</Text>
          <Text style={[type.small, { color: colors.kipDark, fontWeight: '800' }]}>Good year {pct(good)}</Text>
        </View>
        <Text style={type.small}>
          {rung <= 1 ? 'Steady and predictable. Grows slowly.' : rung === 2 ? 'Small wobbles. A bit more return.' : rung === 3 ? 'Real ups and downs, but the whole market tends to grow.' : rung === 4 ? 'One company can soar, or go bust.' : 'Can double or halve in a year. Very hard to predict.'}
        </Text>
      </Card>
      <Slider
        min={0}
        max={LADDER.length - 1}
        value={rung}
        step={1}
        onChange={(v) => {
          setRung(v);
          setSeen((prev) => new Set(prev).add(v));
        }}
        label="Climb the risk ladder"
        accessibilityLabel="Risk ladder rung"
        testID="risk-ladder-slider"
      />
      <HypotheticalLabel extra="Bad and good years are rough 1-in-20 outcomes." />
    </View>
  );
}

// ---- How long can you wait? ------------------------------------------------------

/** Chance an index fund ends below what you put in after N years, by simulation (same every time). */
function lossOddsByYear(maxYears: number, paths = 1500): number[] {
  const rng = createRng(20261101);
  const losses = new Array(maxYears + 1).fill(0);
  for (let p = 0; p < paths; p++) {
    const returns = monthlyReturns(ASSETS.indexFund, maxYears * 12, rng);
    let v = 1;
    returns.forEach((r, i) => {
      v *= 1 + r;
      if ((i + 1) % 12 === 0 && v < 1) losses[(i + 1) / 12] += 1;
    });
  }
  return losses.map((n) => n / paths);
}

function LossOddsWidget({ onDone }: { onDone: () => void }) {
  const odds = useMemo(() => lossOddsByYear(15), []);
  const [years, setYears] = useState(1);
  const [seen, setSeen] = useState<Set<number>>(new Set([1]));
  useEffect(() => {
    if (seen.size >= 3 && [...seen].some((y) => y >= 7)) onDone();
  }, [seen, onDone]);
  const chance = odds[years];
  return (
    <View style={{ gap: space(2) }}>
      <Card style={{ gap: space(1), alignItems: 'center' }}>
        <Text style={type.small}>Index fund, held for {years} year{years === 1 ? '' : 's'}</Text>
        <Text style={[type.hero, { color: chance > 0.2 ? colors.error : chance > 0.08 ? colors.dash : colors.kipDark }]}>{Math.round(chance * 100)}%</Text>
        <Text style={[type.bodyBold, { textAlign: 'center' }]}>chance of ending with less than you put in</Text>
        <Text style={[type.small, { textAlign: 'center' }]}>
          {years <= 2 ? 'Short time, big chance of a loss. Money you need soon doesn’t belong here.' : years <= 6 ? 'The longer you can wait, the more the bad years get balanced by good ones.' : 'Given enough time, the dips usually get made up. Time is what makes this risk worth taking.'}
        </Text>
      </Card>
      <Slider
        min={1}
        max={15}
        value={years}
        step={1}
        onChange={(v) => {
          setYears(v);
          setSeen((prev) => new Set(prev).add(v));
        }}
        label="How many years can you wait?"
        accessibilityLabel="Years held"
        testID="loss-odds-slider"
      />
      <HypotheticalLabel extra="Simulated from a hypothetical 12% a year with real-world-sized swings." />
    </View>
  );
}

// ---- Liquidity ------------------------------------------------------------------

const POTS = [
  { id: 'savings', emoji: '🏦', name: 'Savings account', time: 'Today', cost: 'Free', verdict: 'good', note: 'Instant and free. This is what an emergency fund is for.' },
  { id: 'fd', emoji: '🔒', name: 'Fixed deposit', time: '1–2 days', cost: 'Small penalty', verdict: 'ok', note: 'You can break it, but you lose a little interest.' },
  { id: 'index', emoji: '📊', name: 'Index fund', time: '2–3 days', cost: 'Might be down 15% right now', verdict: 'ok', note: 'You can sell, but if the market just fell you lock in the loss.' },
  { id: 'ppf', emoji: '🛡️', name: 'PPF', time: 'Locked', cost: 'Can’t until year 7', verdict: 'bad', note: 'Great for long goals, useless for a surprise bill.' },
  { id: 'elss', emoji: '🧾', name: 'ELSS fund', time: 'Locked', cost: 'Can’t for 3 years', verdict: 'bad', note: 'The tax saving comes with a 3-year lock.' },
] as const;

/** A surprise ₹4,000 bill, due today: where can the money come from? */
function LiquidityWidget({ onDone }: { onDone: () => void }) {
  const [tried, setTried] = useState<string[]>([]);
  useEffect(() => {
    if (tried.length >= 3) onDone();
  }, [tried, onDone]);
  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ backgroundColor: colors.meltLight, borderColor: colors.melt }}>
        <Text style={type.bodyBold}>📱 Your phone screen cracks. Repair: ₹4,000, needed today.</Text>
        <Text style={type.small}>Tap where you’d take the money from.</Text>
      </Card>
      {POTS.map((p) => {
        const open = tried.includes(p.id);
        const tone = p.verdict === 'good' ? colors.kip : p.verdict === 'ok' ? colors.dash : colors.error;
        return (
          <Pressable
            key={p.id}
            testID={`liquidity-${p.id}`}
            accessibilityRole="button"
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setTried((t) => (t.includes(p.id) ? t : [...t, p.id]));
            }}>
            <Card style={{ borderColor: open ? tone : colors.line, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 22 }}>{p.emoji}</Text>
                <Text style={[type.bodyBold, { flex: 1 }]}>{p.name}</Text>
                {open ? <Text style={[type.small, { color: tone, fontWeight: '800' }]}>{p.verdict === 'good' ? '✅' : p.verdict === 'ok' ? '⚠️' : '⛔'} {p.time}</Text> : <Text style={type.small}>Tap</Text>}
              </View>
              {open ? (
                <Text style={type.small}>
                  {p.cost}. {p.note}
                </Text>
              ) : null}
            </Card>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---- Bonds: the rate seesaw -------------------------------------------------------

/** Price of a 10-year, ₹1,000 bond paying 7% a year when new bonds pay `rate`. */
function bondPrice(rate: number, coupon = 0.07, years = 10, face = 1000): number {
  let price = 0;
  for (let t = 1; t <= years; t++) price += (face * coupon) / Math.pow(1 + rate, t);
  return price + face / Math.pow(1 + rate, years);
}

function RateSeesawWidget({ onDone }: { onDone: () => void }) {
  const [ratePct, setRatePct] = useState(7);
  const [seen, setSeen] = useState({ high: false, low: false });
  useEffect(() => {
    if (seen.high && seen.low) onDone();
  }, [seen, onDone]);
  const price = bondPrice(ratePct / 100);
  const tilt = (ratePct - 7) * 4; // degrees
  return (
    <View style={{ gap: space(2) }}>
      <Card style={{ gap: space(1.5), alignItems: 'center' }}>
        <Text style={[type.small, { textAlign: 'center' }]}>Your bond: ₹1,000, pays 7% (₹70) a year for 10 years</Text>
        <View style={{ height: 150, width: '100%', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6 }} accessibilityLabel={`New bonds pay ${ratePct}%. Your bond is worth ${formatINR(price)}.`}>
          {/* Rates on the left, price on the right: when one goes up, the other goes down. */}
          <View style={{ width: '86%', height: 10, borderRadius: 5, backgroundColor: colors.ink, transform: [{ rotate: `${tilt}deg` }], flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ marginTop: -46, alignItems: 'center' }}>
              <Text style={{ fontSize: 26 }}>📈</Text>
              <Text style={[type.tiny, { color: colors.ink, fontWeight: '800' }]}>Rates {ratePct}%</Text>
            </View>
            <View style={{ marginTop: -46, alignItems: 'center' }}>
              <Text style={{ fontSize: 26 }}>📜</Text>
              <Text style={[type.tiny, { color: colors.ink, fontWeight: '800' }]}>Price</Text>
            </View>
          </View>
          <View style={{ width: 0, height: 0, borderLeftWidth: 16, borderRightWidth: 16, borderBottomWidth: 26, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: colors.shell, marginTop: 2 }} />
        </View>
        <Text style={[type.hero, { color: price >= 1000 ? colors.kipDark : colors.error }]}>{formatINR(price)}</Text>
        <Text style={[type.small, { textAlign: 'center' }]}>
          {ratePct > 7
            ? 'New bonds pay more than yours, so nobody pays full price for your 7% bond. Its price falls.'
            : ratePct < 7
              ? 'New bonds pay less, so your 7% bond is in demand. Its price rises.'
              : 'Rates match your bond, so it’s worth about what you paid.'}
        </Text>
      </Card>
      <Slider
        min={4}
        max={11}
        value={ratePct}
        step={1}
        onChange={(v) => {
          setRatePct(v);
          setSeen((p) => ({ high: p.high || v >= 9, low: p.low || v <= 5 }));
        }}
        label="What do new bonds pay?"
        accessibilityLabel="Interest rate on new bonds"
        testID="rate-seesaw-slider"
      />
      <HypotheticalLabel />
    </View>
  );
}

// ---- Stocks: own a slice -----------------------------------------------------------

const YEARS = [
  { id: 'great', label: 'Great year', profit: 4000, valueX: 1.4, note: 'Customers love the new samosas. Profit and value jump.' },
  { id: 'bad', label: 'Bad year', profit: 200, valueX: 0.8, note: 'Rain all season. Tiny profit, and the business is worth less.' },
  { id: 'bust', label: 'Goes bust', profit: 0, valueX: 0, note: 'A big chain opens next door. The stall closes and the shares are worth nothing.' },
] as const;

function OwnSliceWidget({ onDone }: { onDone: () => void }) {
  const [shares, setShares] = useState(10);
  const [year, setYear] = useState<(typeof YEARS)[number]['id']>('great');
  const [seen, setSeen] = useState<Set<string>>(new Set(['great']));
  useEffect(() => {
    if (seen.size >= 3) onDone();
  }, [seen, onDone]);
  const y = YEARS.find((x) => x.id === year)!;
  const own = shares / 100;
  const value = shares * 100 * y.valueX;
  return (
    <View style={{ gap: space(2) }}>
      <Card style={{ gap: 8 }}>
        <Text style={type.bodyBold}>☕ Meena’s Chai: 100 shares, ₹100 each</Text>
        <Text style={type.small}>
          You own {shares} shares = {Math.round(own * 100)}% of the business, for {formatINR(shares * 100)}.
        </Text>
        <Segmented
          options={YEARS.map((x) => ({ id: x.id, label: x.label }))}
          value={year}
          onChange={(id) => {
            setYear(id);
            setSeen((p) => new Set(p).add(id));
          }}
        />
        <Text style={type.small}>{y.note}</Text>
        <View style={{ flexDirection: 'row', gap: space(1) }}>
          <View style={{ flex: 1, padding: space(1), borderRadius: radius.md, backgroundColor: colors.cream }}>
            <Text style={type.tiny}>Your share of profit</Text>
            <Text style={type.bodyBold}>{formatINR(y.profit * own)}</Text>
          </View>
          <View style={{ flex: 1, padding: space(1), borderRadius: radius.md, backgroundColor: value >= shares * 100 ? colors.kipLight : colors.meltLight }}>
            <Text style={type.tiny}>Your shares are worth</Text>
            <Text style={type.bodyBold}>{formatINR(value)}</Text>
          </View>
        </View>
      </Card>
      <Slider min={1} max={50} value={shares} step={1} onChange={setShares} label="How many shares do you buy?" accessibilityLabel="Shares bought" testID="own-slice-slider" />
    </View>
  );
}

// ---- Mutual funds: basket builder ---------------------------------------------------

/** One year for baskets of `size` companies: share of baskets losing over 30%, and the worst one. */
function basketYear(size: number, baskets = 400) {
  const rng = createRng(4242 + size);
  const results: number[] = [];
  for (let b = 0; b < baskets; b++) {
    let sum = 0;
    for (let c = 0; c < size; c++) {
      const bust = rng() < 0.03;
      sum += bust ? -1 : Math.max(0.12 + 0.35 * normal(rng), -0.95);
    }
    results.push(sum / size);
  }
  results.sort((a, b) => a - b);
  return { bigLoss: results.filter((r) => r < -0.3).length / baskets, worst: results[0], typical: results[Math.floor(baskets / 2)] };
}

function BasketWidget({ onDone }: { onDone: () => void }) {
  const stats = useMemo(() => ({ 1: basketYear(1), 5: basketYear(5), 50: basketYear(50) }), []);
  const [size, setSize] = useState<'1' | '5' | '50'>('1');
  const [seen, setSeen] = useState<Set<string>>(new Set(['1']));
  useEffect(() => {
    if (seen.has('1') && seen.has('50')) onDone();
  }, [seen, onDone]);
  const st = stats[Number(size) as 1 | 5 | 50];
  const pct = (x: number) => `${x >= 0 ? '+' : ''}${Math.round(x * 100)}%`;
  return (
    <View style={{ gap: space(2) }}>
      <Segmented
        options={[
          { id: '1', label: '1 company' },
          { id: '5', label: '5 companies' },
          { id: '50', label: '50 companies' },
        ]}
        value={size}
        onChange={(id) => {
          setSize(id);
          setSeen((p) => new Set(p).add(id));
        }}
      />
      <Card style={{ gap: space(1), alignItems: 'center' }}>
        <Text style={{ fontSize: 30 }}>{size === '1' ? '🥭' : size === '5' ? '🧺' : '🧺🧺🧺'}</Text>
        <Text style={[type.hero, { color: st.bigLoss > 0.15 ? colors.error : st.bigLoss > 0.03 ? colors.dash : colors.kipDark }]}>{Math.round(st.bigLoss * 100)}%</Text>
        <Text style={[type.bodyBold, { textAlign: 'center' }]}>chance of losing more than 30% in a year</Text>
        <Text style={type.small}>
          Typical year {pct(st.typical)} · worst basket {pct(st.worst)}
        </Text>
        <Text style={[type.small, { textAlign: 'center' }]}>
          {size === '1' ? 'One company can go bust. Your whole basket goes with it.' : size === '5' ? 'Better: one bad apple hurts, but doesn’t ruin you.' : 'A mutual fund or index fund holds dozens. One failure barely shows.'}
        </Text>
      </Card>
      <HypotheticalLabel extra="Simulated: each company has a 3% chance of going bust in a year." />
    </View>
  );
}

// ---- Index funds: fee drag ----------------------------------------------------------

function FeeDragWidget({ onDone }: { onDone: () => void }) {
  const [fee, setFee] = useState(0.2);
  const [seen, setSeen] = useState({ high: false });
  useEffect(() => {
    if (seen.high) onDone();
  }, [seen, onDone]);
  const gross = 0.12;
  const cheap = sipFutureValue(1000, gross - 0.002, 20);
  const yours = sipFutureValue(1000, gross - fee / 100, 20);
  return (
    <View style={{ gap: space(2) }}>
      <Card style={{ gap: space(1), alignItems: 'center' }}>
        <Text style={type.small}>₹1,000 a month for 20 years, at a hypothetical 12% before fees</Text>
        <Text style={[type.hero, { color: colors.ink }]}>{formatINR(yours)}</Text>
        <Text style={[type.bodyBold, { color: yours < cheap - 1 ? colors.error : colors.kipDark, textAlign: 'center' }]}>
          {yours < cheap - 1 ? `${formatINR(cheap - yours)} less than a 0.2% fund` : 'A low-cost index fund keeps almost everything'}
        </Text>
        <Text style={[type.small, { textAlign: 'center' }]}>The fee (expense ratio) is taken every year, so it compounds against you.</Text>
      </Card>
      <Slider
        min={0.1}
        max={2}
        value={fee}
        step={0.1}
        onChange={(v) => {
          setFee(Math.round(v * 10) / 10);
          if (v >= 1) setSeen({ high: true });
        }}
        label={`Yearly fee: ${fee.toFixed(1)}%`}
        accessibilityLabel="Yearly fee"
        testID="fee-drag-slider"
      />
      <HypotheticalLabel />
    </View>
  );
}

// ---- Bazaar Bargain ----------------------------------------------------------------

function BazaarWidget({ params, onDone }: { params: Record<string, unknown>; onDone: () => void }) {
  const ids = typeof params.customers === 'string' ? params.customers.split(',') : null;
  const customers = useMemo(() => customersFor(ids, num(params.rounds, ids?.length ?? 3)), [params.customers, params.rounds]); // eslint-disable-line react-hooks/exhaustive-deps
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<{ cardId: string; fit: Fit; why: string } | null>(null);
  const [stars, setStars] = useState(0);
  const finished = round >= customers.length;
  useEffect(() => {
    if (finished) onDone();
  }, [finished, onDone]);
  if (finished) {
    const max = customers.length * 3;
    return (
      <Card style={{ alignItems: 'center', gap: space(1) }}>
        <Text style={{ fontSize: 40 }}>🏪</Text>
        <Text style={type.title}>
          ⭐ {stars} / {max} trust stars
        </Text>
        <Text style={[type.small, { textAlign: 'center' }]}>
          {stars >= max * 0.8 ? 'The whole bazaar trusts your stall. You match products to people.' : stars >= max * 0.5 ? 'Good stall! A few customers wandered over to Dash.' : 'Dash’s stall got busy today. Match the product to the goal, the time and the risk.'}
        </Text>
      </Card>
    );
  }
  const c = customers[round];
  const tone = picked ? (picked.fit === 'best' ? colors.kip : picked.fit === 'ok' ? colors.dash : colors.error) : colors.line;
  return (
    <View style={{ gap: space(1.5) }}>
      <Text style={type.tiny}>
        CUSTOMER {round + 1} OF {customers.length} · ⭐ {stars}
      </Text>
      <Card style={{ flexDirection: 'row', gap: space(1.5), alignItems: 'center' }}>
        <Text style={{ fontSize: 36 }}>{c.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={type.bodyBold}>{c.name}</Text>
          <Text style={type.body}>“{c.ask}”</Text>
        </View>
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {c.options.map((o) => {
          const card = getCard(o.cardId);
          const chosen = picked?.cardId === o.cardId;
          return (
            <Pressable
              key={o.cardId}
              testID={`bazaar-${o.cardId}`}
              disabled={!!picked}
              accessibilityRole="button"
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setPicked(o);
                setStars((s) => s + STARS[o.fit]);
              }}
              style={{ width: '48%', padding: space(1.5), borderRadius: radius.md, borderWidth: 2.5, borderColor: chosen ? tone : colors.line, backgroundColor: colors.surface, opacity: picked && !chosen ? 0.5 : 1, alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 26 }}>{card?.emoji}</Text>
              <Text style={[type.small, { color: colors.ink, fontWeight: '800', textAlign: 'center' }]}>{card?.name}</Text>
            </Pressable>
          );
        })}
      </View>
      {picked ? (
        <Card style={{ borderColor: tone, gap: 6 }}>
          <Text style={type.bodyBold}>{picked.fit === 'best' ? '⭐⭐⭐ Perfect fit!' : picked.fit === 'ok' ? '⭐ It works, but…' : '💨 They walked over to Dash’s stall'}</Text>
          <Text style={type.small}>{picked.why}</Text>
          <Pressable
            testID="bazaar-next"
            accessibilityRole="button"
            onPress={() => {
              setPicked(null);
              setRound((r) => r + 1);
            }}
            style={{ alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.ink }}>
            <Text style={[type.small, { color: '#fff', fontWeight: '800' }]}>{round + 1 < customers.length ? 'Next customer ›' : 'Close the stall ›'}</Text>
          </Pressable>
        </Card>
      ) : null}
    </View>
  );
}
