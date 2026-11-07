/** World 9, Future You: First Paycheck, retirement, and backing startups. */
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { LIFE_EVENTS, PAY, simulatePaycheck, type PaycheckResult } from '../../games/paycheck';
import { startupOdds } from '../../games/startups';
import { Card, HypotheticalLabel } from '../../ui/components';
import { Segmented, Slider } from '../../ui/Slider';
import { colors, formatINR, radius, space, type } from '../../ui/theme';

// ---- First Paycheck --------------------------------------------------------------------

const VERDICT: Record<PaycheckResult['verdict'], { emoji: string; title: string }> = {
  thriving: { emoji: '🌟', title: 'Future You is thriving' },
  okay: { emoji: '🙂', title: 'Future You is okay' },
  struggling: { emoji: '😟', title: 'Future You is struggling' },
};

export function PaycheckWidget({ onDone }: { onDone: () => void }) {
  const [wants, setWants] = useState(30);
  const [sip, setSip] = useState(10);
  const [ef, setEf] = useState(0);
  const [insured, setInsured] = useState<'yes' | 'no'>('no');
  const [result, setResult] = useState<PaycheckResult | null>(null);
  const [tries, setTries] = useState(0);
  useEffect(() => {
    if (tries >= 1) onDone();
  }, [tries, onDone]);
  const needs = 100 - wants - sip - ef;
  const tooLittle = needs < 40;
  const pay = PAY.start;

  if (result) {
    const v = VERDICT[result.verdict];
    return (
      <View style={{ gap: space(1.5) }}>
        <Card style={{ alignItems: 'center', gap: 4, borderColor: result.verdict === 'thriving' ? colors.kip : result.verdict === 'okay' ? colors.shell : colors.error }}>
          <Text style={{ fontSize: 44 }}>{v.emoji}</Text>
          <Text style={type.h2}>{v.title} at 40</Text>
          <Text style={type.hero}>{formatINR(result.netWorth)}</Text>
          <Text style={type.tiny}>NET WORTH: INVESTMENTS + EMERGENCY FUND − DEBT</Text>
        </Card>
        <Card style={{ gap: 6 }}>
          {LIFE_EVENTS.map((e) => {
            const how = result.outcomes[e.age] ?? '';
            return (
              <View key={e.age} style={{ flexDirection: 'row', gap: 8 }}>
                <Text style={{ fontSize: 20 }}>{e.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>
                    Age {e.age}: {e.title}
                  </Text>
                  <Text style={type.tiny}>{how}</Text>
                </View>
              </View>
            );
          })}
          {result.interestPaid > 0 ? (
            <Text style={[type.bodyBold, { color: colors.error }]}>Credit card interest paid along the way: {formatINR(result.interestPaid)}</Text>
          ) : (
            <Text style={[type.bodyBold, { color: colors.kipDark }]}>Not one rupee of card interest. Your buffers did their job.</Text>
          )}
        </Card>
        <Pressable
          testID="paycheck-again"
          onPress={() => setResult(null)}
          style={{ padding: space(1.5), borderRadius: radius.md, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', backgroundColor: colors.surface }}>
          <Text style={type.bodyBold}>Try a different split</Text>
        </Pressable>
        <HypotheticalLabel extra="Assumes 7% raises, 11% a year from SIPs and 36% on card debt." />
      </View>
    );
  }

  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ gap: 6 }}>
        <Text style={type.bodyBold}>You’re 22. Your first take-home pay: {formatINR(pay)} a month.</Text>
        <View style={{ flexDirection: 'row', height: 20, borderRadius: 10, overflow: 'hidden' }}>
          <View style={{ flex: Math.max(needs, 0), backgroundColor: colors.inkSoft }} />
          <View style={{ flex: wants, backgroundColor: colors.dash }} />
          <View style={{ flex: sip, backgroundColor: colors.kip }} />
          <View style={{ flex: ef, backgroundColor: colors.shell }} />
        </View>
        <Text style={type.small}>
          🏠 Needs {needs}% · 🎉 Wants {wants}% · 📈 SIP {sip}% · 🧯 Emergency fund {ef}%
        </Text>
        {tooLittle ? <Text style={[type.small, { color: colors.error }]}>Rent, food and travel need at least 40%. Turn something down.</Text> : null}
      </Card>
      <Slider min={10} max={50} value={wants} step={5} onChange={setWants} label="🎉 Wants: fun, clothes, eating out" accessibilityLabel="Wants" color={colors.dash} testID="pay-wants" />
      <Slider min={0} max={40} value={sip} step={5} onChange={setSip} label="📈 SIP into an index fund" accessibilityLabel="SIP" testID="pay-sip" />
      <Slider min={0} max={30} value={ef} step={5} onChange={setEf} label="🧯 Emergency fund (until it holds 6 months)" accessibilityLabel="Emergency fund" color={colors.shell} testID="pay-ef" />
      <View style={{ gap: 4 }}>
        <Text style={type.small}>🩺 Health insurance (₹1,500 a month)?</Text>
        <Segmented
          options={[
            { id: 'no', label: 'Skip it' },
            { id: 'yes', label: 'Buy cover' },
          ]}
          value={insured}
          onChange={setInsured}
        />
      </View>
      <Pressable
        testID="paycheck-live"
        disabled={tooLittle}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          setResult(simulatePaycheck({ wants: wants / 100, sip: sip / 100, emergency: ef / 100, insured: insured === 'yes' }));
          setTries((n) => n + 1);
        }}
        style={{ padding: space(2), borderRadius: radius.md, backgroundColor: tooLittle ? colors.line : colors.ink, alignItems: 'center' }}>
        <Text style={[type.bodyBold, { color: '#fff' }]}>Live the next 18 years ›</Text>
      </Pressable>
    </View>
  );
}

// ---- Retirement: start early, and the 4% rule ------------------------------------------

function corpusAt60(startAge: number, monthly: number, stepUp: boolean, rate = 0.1): number {
  let value = 0;
  let sip = monthly;
  for (let age = startAge; age < 60; age++) {
    for (let m = 0; m < 12; m++) value = (value + sip) * (1 + rate / 12);
    if (stepUp) sip *= 1.1;
  }
  return value;
}

export function RetirementWidget({ onDone }: { onDone: () => void }) {
  const [start, setStart] = useState(25);
  const [step, setStep] = useState<'flat' | 'up'>('flat');
  const [seen, setSeen] = useState({ early: false, late: false });
  useEffect(() => {
    if (seen.early && seen.late) onDone();
  }, [seen, onDone]);
  const corpus = corpusAt60(start, 5000, step === 'up');
  const today = corpus / 1.06 ** (60 - start);
  const income = (corpus * 0.04) / 12;
  const later = corpusAt60(start + 10, 5000, step === 'up');
  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ gap: 6 }}>
        <Text style={type.small}>A ₹5,000 monthly SIP from age {start} to 60, at a hypothetical 10% a year.</Text>
        <Text style={type.hero}>{formatINR(corpus)}</Text>
        <Text style={type.small}>About {formatINR(today)} in today’s prices, after 6% inflation.</Text>
        <Text style={type.bodyBold}>The 4% rule: take out about 4% a year, and the money should last around 30 years. That’s {formatINR(income)} a month.</Text>
        <Text style={[type.small, { color: colors.error }]}>Waiting 10 more years to start: {formatINR(later)}. Less than half.</Text>
      </Card>
      <Slider
        min={18}
        max={45}
        value={start}
        step={1}
        onChange={(v) => {
          setStart(v);
          setSeen((p) => ({ early: p.early || v <= 22, late: p.late || v >= 35 }));
        }}
        label="Start age"
        accessibilityLabel="Age you start investing"
        testID="retire-age"
      />
      <Segmented
        options={[
          { id: 'flat', label: 'Same ₹5,000 forever' },
          { id: 'up', label: 'Raise it 10% a year' },
        ]}
        value={step}
        onChange={setStep}
      />
      <HypotheticalLabel />
    </View>
  );
}

// ---- Backing startups (PE/VC) ----------------------------------------------------------

export function StartupsWidget({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(1);
  const [seen, setSeen] = useState({ one: true, many: false });
  useEffect(() => {
    if (seen.one && seen.many) onDone();
  }, [seen, onDone]);
  const odds = useMemo(() => startupOdds(n), [n]);
  return (
    <View style={{ gap: space(1.5) }}>
      <Card style={{ gap: 6 }}>
        <Text style={type.small}>Out of every 100 startups: about 60 fail, 25 hand the money back, 11 return 3×, and 4 return 25×.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
          {Array.from({ length: Math.min(n, 40) }, (_, i) => (
            <Text key={i} style={{ fontSize: 16 }}>
              🚀
            </Text>
          ))}
        </View>
        <Text style={type.bodyBold}>
          Backing {n} {n === 1 ? 'startup' : 'startups'}
        </Text>
        <Text style={[type.hero, { color: odds.lossChance > 0.5 ? colors.error : colors.ink }]}>{Math.round(odds.lossChance * 100)}%</Text>
        <Text style={type.small}>chance of losing money overall. {odds.median < 0.05 ? 'Most often, the money is simply gone' : `A typical result: ${odds.median.toFixed(1)}× your money`}, after 7–10 years locked away.</Text>
        <Text style={type.small}>
          {n < 5
            ? 'One or two bets usually lose everything. That’s why venture capital funds back dozens.'
            : n >= 25
              ? 'Many bets: the rare big winner pays for all the failures. Even so, the typical return is modest for 10 locked-up years, so this is a small slice for the wealthy, not a first investment.'
              : 'More bets, fewer total losses: the power law at work.'}
        </Text>
      </Card>
      <Slider
        min={1}
        max={40}
        value={n}
        step={1}
        onChange={(v) => {
          setN(v);
          setSeen((p) => ({ ...p, many: p.many || v >= 25 }));
        }}
        label="How many startups does your fund back?"
        accessibilityLabel="Startups backed"
        testID="startups-slider"
      />
      <HypotheticalLabel />
    </View>
  );
}
