/** World 6, Three Doors: intent, arbitrage, leverage and hedging. */
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Animated, PanResponder, Pressable, Text, View } from 'react-native';

import { ARB, arbProfit, arbTicks, gapOf } from '../../games/arbitrage';
import { DOORS, SCENARIOS, type Door } from '../../games/intent';
import { shuffle } from '../../sim/rng';
import { Card, HypotheticalLabel } from '../../ui/components';
import { Segmented, Slider } from '../../ui/Slider';
import { colors, formatINR, formatINRChange, radius, space, type } from '../../ui/theme';

// ---- Intent Detective -----------------------------------------------------------------

const DOOR_ORDER: Door[] = ['arbitrage', 'speculation', 'hedging'];
/** How far (px) a card must be dragged towards a door to post it there. */
const SWIPE = 70;

/** Which door a drag points at: left, up (the middle door) or right. */
function doorFor(dx: number, dy: number): Door | null {
  if (-dy > SWIPE && -dy > Math.abs(dx)) return 'speculation';
  if (Math.abs(dx) > SWIPE) return dx < 0 ? 'arbitrage' : 'hedging';
  return null;
}

export function IntentWidget({ params, onDone }: { params: Record<string, unknown>; onDone: () => void }) {
  const rounds = typeof params.rounds === 'number' ? params.rounds : 5;
  const [order] = useState(() => shuffle(Math.random, SCENARIOS).slice(0, rounds));
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<Door | null>(null);
  const [right, setRight] = useState(0);
  const [hover, setHover] = useState<Door | null>(null);
  const [drag] = useState(() => new Animated.ValueXY());
  const finished = i >= order.length;
  useEffect(() => {
    if (finished) onDone();
  }, [finished, onDone]);

  const choose = (d: Door) => {
    if (pick || finished) return;
    const correct = d === order[i].door;
    Haptics.notificationAsync(correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
    setPick(d);
    if (correct) setRight((r) => r + 1);
  };
  // A swipe lands here (the swipe handler is created once, so it can't see the current case).
  const [swiped, setSwiped] = useState<Door | null>(null);
  if (swiped) {
    setSwiped(null);
    if (!pick && !finished) {
      setPick(swiped);
      if (swiped === order[i].door) setRight((r) => r + 1);
    }
  }
  const [responder] = useState(() => {
    const springBack = () => Animated.spring(drag, { toValue: { x: 0, y: 0 }, useNativeDriver: true, friction: 6 }).start();
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,
      onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 6 || g.dy < -6,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => {
        drag.setValue({ x: g.dx, y: Math.min(g.dy, 20) });
        setHover(doorFor(g.dx, g.dy));
      },
      onPanResponderRelease: (_, g) => {
        const d = doorFor(g.dx, g.dy);
        setHover(null);
        if (!d) return springBack();
        const to = d === 'speculation' ? { x: 0, y: -260 } : { x: d === 'arbitrage' ? -260 : 260, y: -160 };
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        Animated.timing(drag, { toValue: to, duration: 160, useNativeDriver: true }).start(() => setSwiped(d));
      },
      onPanResponderTerminate: () => {
        setHover(null);
        springBack();
      },
    });
  });

  if (finished) {
    return (
      <Card style={{ alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 40 }}>🕵️</Text>
        <Text style={type.title}>
          {right} / {order.length} doors right
        </Text>
        <Text style={[type.small, { textAlign: 'center' }]}>Before any trade, ask: am I reducing a risk (hedging), betting on a direction (speculation), or catching a price gap (arbitrage)?</Text>
      </Card>
    );
  }
  const s = order[i];
  return (
    <View style={{ gap: space(1.5) }}>
      <Text style={type.tiny}>
        CASE {i + 1} OF {order.length} · ✅ {right}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {DOOR_ORDER.map((d) => {
          const chosen = pick === d;
          const correct = pick && d === s.door;
          const lit = hover === d;
          return (
            <Pressable
              key={d}
              testID={`door-${d}`}
              disabled={!!pick}
              accessibilityRole="button"
              accessibilityLabel={`${DOORS[d].name}: ${DOORS[d].short}`}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                choose(d);
              }}
              style={{
                flex: 1,
                alignItems: 'center',
                gap: 4,
                paddingVertical: space(1.5),
                borderRadius: radius.md,
                borderWidth: 2.5,
                borderColor: correct ? colors.kip : chosen ? colors.error : lit ? colors.ink : colors.line,
                backgroundColor: lit ? colors.kipLight : colors.surface,
                transform: [{ scale: lit ? 1.06 : 1 }],
              }}>
              <Text style={{ fontSize: 28 }}>🚪</Text>
              <Text style={{ fontSize: 18 }}>{DOORS[d].emoji}</Text>
              <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>{DOORS[d].name}</Text>
            </Pressable>
          );
        })}
      </View>
      {pick ? (
        <Card style={{ gap: 6, borderColor: pick === s.door ? colors.kip : colors.error }}>
          <Text style={type.small}>{s.text}</Text>
          <Text style={type.bodyBold}>{pick === s.door ? '✅ Right door!' : `It’s ${DOORS[s.door].name}.`}</Text>
          <Text style={type.small}>{s.why}</Text>
          <Pressable
            testID="door-next"
            onPress={() => {
              drag.setValue({ x: 0, y: 0 });
              setPick(null);
              setI((n) => n + 1);
            }}
            style={{ alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.ink }}>
            <Text style={[type.small, { color: '#fff', fontWeight: '800' }]}>Next case ›</Text>
          </Pressable>
        </Card>
      ) : (
        <>
          <Animated.View
            {...responder.panHandlers}
            testID="intent-card"
            accessibilityHint="Swipe left for arbitrage, up for speculation, right for hedging, or tap a door"
            style={{
              transform: [
                { translateX: drag.x },
                { translateY: drag.y },
                { rotate: drag.x.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-10deg', '0deg', '10deg'] }) },
              ],
            }}>
            <Card style={{ gap: 8, borderColor: hover ? colors.ink : colors.line, borderWidth: 2, minHeight: 130, justifyContent: 'center' }}>
              <Text style={[type.tiny, { color: colors.kipDark }]}>📁 CASE FILE</Text>
              <Text style={type.body}>{s.text}</Text>
            </Card>
          </Animated.View>
          <Text style={[type.small, { textAlign: 'center', color: colors.ink }]}>Swipe the case to its door: ← Arbitrage · ↑ Speculation · Hedging →</Text>
          <Text style={type.tiny}>{DOOR_ORDER.map((d) => `${DOORS[d].name}: ${DOORS[d].short}.`).join(' ')}</Text>
        </>
      )}
    </View>
  );
}

// ---- Arbitrage Rush -------------------------------------------------------------------

export function ArbitrageWidget({ onDone }: { onDone: () => void }) {
  const [seed] = useState(() => Math.floor(Math.random() * 1e9));
  const ticks = useMemo(() => arbTicks(seed), [seed]);
  const [t, setT] = useState(-1);
  const [trades, setTrades] = useState<{ at: number; profit: number }[]>([]);
  const running = t >= 0 && t < ARB.ticks;
  const over = t >= ARB.ticks + ARB.delayTicks;
  useEffect(() => {
    if (!running && !(t >= ARB.ticks && !over)) return;
    const id = setInterval(() => setT((x) => x + 1), 750);
    return () => clearInterval(id);
  }, [running, t, over]);
  useEffect(() => {
    if (over) onDone();
  }, [over, onDone]);
  const now = ticks[Math.max(0, Math.min(t, ticks.length - 1))];
  const gap = gapOf(now);
  const fees = ARB.feeEachSide * 2;
  const settled = trades.filter((x) => t >= x.at + ARB.delayTicks);
  const total = settled.reduce((s, x) => s + x.profit, 0);
  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={type.tiny}>EXCHANGE A · BUY</Text>
            <Text style={type.h2}>{formatINR(now.a)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={type.tiny}>EXCHANGE B · SELL</Text>
            <Text style={type.h2}>{formatINR(now.b)}</Text>
          </View>
        </View>
        <Text style={[type.bodyBold, { textAlign: 'center', color: gap > fees ? colors.kipDark : gap > 0 ? colors.dash : colors.error }]}>
          Gap {(gap * 100).toFixed(2)}% · fees {(fees * 100).toFixed(1)}%
        </Text>
        <Text style={[type.tiny, { textAlign: 'center' }]}>
          Coins take {ARB.delayTicks} ticks to move from A to B. The gap can close on the way.
          {t >= 0 ? ` Tick ${Math.min(t + 1, ARB.ticks)}/${ARB.ticks}` : ''}
        </Text>
      </Card>
      {t < 0 ? (
        <Pressable testID="arb-start" onPress={() => setT(0)} style={{ padding: space(1.5), borderRadius: radius.md, backgroundColor: colors.ink, alignItems: 'center' }}>
          <Text style={[type.bodyBold, { color: '#fff' }]}>Open the exchanges ›</Text>
        </Pressable>
      ) : running ? (
        <Pressable
          testID="arb-trade"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setTrades((x) => [...x, { at: t, profit: arbProfit(ticks, t) }]);
          }}
          style={{ padding: space(2), borderRadius: radius.md, backgroundColor: colors.kip, alignItems: 'center' }}>
          <Text style={[type.bodyBold, { color: '#fff' }]}>⚖️ Buy on A, sell on B (₹1,00,000)</Text>
        </Pressable>
      ) : null}
      <Card style={{ gap: 4 }}>
        <Text style={type.bodyBold}>
          Profit so far: <Text style={{ color: total >= 0 ? colors.kipDark : colors.error }}>{formatINRChange(total)}</Text>
        </Text>
        {trades
          .slice(-4)
          .reverse()
          .map((x) => (
            <Text key={x.at} style={type.small}>
              Tick {x.at + 1}: {t >= x.at + ARB.delayTicks ? formatINRChange(x.profit) : 'coins in transit…'}
            </Text>
          ))}
        {over ? (
          <Text style={type.small}>
            {trades.length === 0
              ? 'You didn’t trade. Often that’s wise: most gaps are smaller than the fees.'
              : total >= 0
                ? 'You only struck when the gap beat the fees, and it held long enough. That’s how arbitrage works, and why it’s so competitive.'
                : 'Small gaps lose to fees, and gaps often close while coins are in transit. "Free money" rarely is.'}
          </Text>
        ) : null}
      </Card>
      <HypotheticalLabel extra="A simulated market. Crypto prices in India are unregulated and very volatile." />
    </View>
  );
}

// ---- Leverage --------------------------------------------------------------------------

const MOVES = [
  { id: 'm10', label: '−10%', move: -0.1 },
  { id: 'm5', label: '−5%', move: -0.05 },
  { id: 'p5', label: '+5%', move: 0.05 },
  { id: 'p10', label: '+10%', move: 0.1 },
] as const;

export function LeverageWidget({ onDone }: { onDone: () => void }) {
  const [lev, setLev] = useState(1);
  const [move, setMove] = useState<(typeof MOVES)[number]['id']>('p5');
  const [seen, setSeen] = useState({ big: false, fall: false });
  useEffect(() => {
    if (seen.big && seen.fall) onDone();
  }, [seen, onDone]);
  const m = MOVES.find((x) => x.id === move)!;
  const own = 10000;
  const result = own + own * lev * m.move;
  const wiped = result <= 0;
  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ gap: 6 }}>
        <Text style={type.bodyBold}>
          Your ₹10,000, with {lev}× leverage, controls {formatINR(own * lev)} of the market.
        </Text>
        <Segmented
          options={MOVES.map((x) => ({ id: x.id, label: x.label }))}
          value={move}
          onChange={(v) => {
            setMove(v);
            setSeen((p) => ({ ...p, fall: p.fall || v.startsWith('m') }));
          }}
        />
        <Text style={[type.hero, { textAlign: 'center', color: wiped ? colors.error : result >= own ? colors.kipDark : colors.error }]}>{wiped ? '₹0' : formatINR(result)}</Text>
        <Text style={[type.small, { textAlign: 'center' }]}>
          {wiped
            ? 'Wiped out. With 10× leverage, a 10% fall takes everything: the broker closes your position (a margin call).'
            : lev > 1
              ? `A ${m.label} move became ${m.move * lev > 0 ? '+' : ''}${Math.round(m.move * lev * 100)}% for you. Leverage multiplies gains and losses.`
              : 'No leverage: you gain or lose exactly what the market does.'}
        </Text>
      </Card>
      <Slider
        min={1}
        max={10}
        value={lev}
        step={1}
        onChange={(v) => {
          setLev(v);
          setSeen((p) => ({ ...p, big: p.big || v >= 5 }));
        }}
        label="Leverage"
        accessibilityLabel="Leverage"
        testID="leverage-slider"
      />
    </View>
  );
}

// ---- Hedging: the farmer ---------------------------------------------------------------

const HARVEST = [
  { id: 'glut', label: '₹1,800 (glut)', price: 1800 },
  { id: 'same', label: '₹2,500', price: 2500 },
  { id: 'short', label: '₹3,200 (shortage)', price: 3200 },
] as const;

export function FarmerHedgeWidget({ onDone }: { onDone: () => void }) {
  const [hedged, setHedged] = useState<'no' | 'yes'>('no');
  const [price, setPrice] = useState<(typeof HARVEST)[number]['id']>('same');
  const [seen, setSeen] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (seen.has('yes') && seen.has('no') && seen.has('glut')) onDone();
  }, [seen, onDone]);
  const h = HARVEST.find((x) => x.id === price)!;
  const income = hedged === 'yes' ? 100 * 2500 : 100 * h.price;
  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ gap: 6 }}>
        <Text style={type.bodyBold}>👩‍🌾 Asha will harvest 100 quintals of wheat in 3 months. Today a buyer will fix ₹2,500 a quintal with a futures contract.</Text>
        <Segmented
          options={[
            { id: 'no', label: 'Wait and see' },
            { id: 'yes', label: 'Fix ₹2,500 now' },
          ]}
          value={hedged}
          onChange={(v) => {
            setHedged(v);
            setSeen((p) => new Set(p).add(v));
          }}
        />
        <Text style={type.small}>Price at harvest:</Text>
        <Segmented
          options={HARVEST.map((x) => ({ id: x.id, label: x.label }))}
          value={price}
          onChange={(v) => {
            setPrice(v);
            setSeen((p) => new Set(p).add(v));
          }}
        />
        <Text style={[type.hero, { textAlign: 'center' }]}>{formatINR(income)}</Text>
        <Text style={[type.small, { textAlign: 'center' }]}>
          {hedged === 'yes' ? 'Same income whatever happens. She gave up the chance of a windfall to remove the risk of a disaster.' : h.price < 2500 ? 'A glut: prices crashed and so did her income.' : h.price > 2500 ? 'A shortage: she earned more by waiting. This time.' : 'Prices stayed the same.'}
        </Text>
      </Card>
    </View>
  );
}
