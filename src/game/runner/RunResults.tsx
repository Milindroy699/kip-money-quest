/** End-of-run compounding reveal plus a personal debrief of what happened in *this* run. */
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { playSfx } from '../../audio/sound';
import { Character } from '../../mascot/Character';
import { futureValue } from '../../sim';
import { Backdrop } from '../../ui/Backdrop';
import { Button, Card, Coin, ComebackNote, CountUp, HypotheticalLabel } from '../../ui/components';
import { colors, formatINR, space, type } from '../../ui/theme';
import type { Reward } from '../../state/game';
import { REWARDED_RUNS_PER_DAY } from '../../engagement/rewards';
import { TF_INFO, type RunResult } from './engine';

export function debrief(r: RunResult): string[] {
  const lines: string[] = [];
  if (r.timeframe) {
    const [scalp, intraday, swing, long] = r.timeframe.stages;
    lines.push(`Scalping: ${scalp.trades} trades and ${scalp.fees} coins of fees, for ${scalp.net >= 0 ? '+' : ''}${scalp.net} kept. Lots of action, little to show.`);
    lines.push(`Intraday: squared off ${intraday.trades}× at the bell, ${intraday.net >= 0 ? '+' : ''}${intraday.net} kept after fees.`);
    lines.push(r.timeframe.gapsHit ? `Swing: ${r.timeframe.gapsHit} overnight news gap${r.timeframe.gapsHit > 1 ? 's' : ''} hit your idle coins. Holding overnight carries news risk.` : `Swing: you dodged every news gap and kept ${swing.net >= 0 ? '+' : ''}${swing.net}.`);
    lines.push(`Long term: no fees, and ${long.net >= 0 ? '+' : ''}${long.net} kept, ${r.timeframe.growth} of it from compounding. The slowest track paid the most.`);
  }
  if (r.risk) {
    const k = r.risk;
    lines.push(`You ended with ${k.safe} in SAFE, ${k.balanced} in BALANCED and ${k.wild} in WILD.`);
    if (k.wildBest - k.wildWorst >= 20) lines.push(`WILD swung from ${k.wildWorst}% to +${k.wildBest}% in single moves. Higher return comes with bigger bumps.`);
    lines.push(
      k.emergencyShort > 0
        ? `A surprise expense found no idle coins, so you sold investments in a hurry and lost ${k.emergencyShort} extra. Keep some cash for emergencies.`
        : 'Your idle coins covered the surprise expenses. That’s what an emergency fund is for.',
    );
  }
  if (r.outcome === 'caught') lines.push(r.risk ? "The Melt caught you. Invested coins stayed invested, but idle cash melted." : "The Melt caught you, but every coin you'd banked was safe. That's why invested money beats idle cash.");
  if (r.gatesSeen > 0) lines.push(`You banked at ${r.gatesHit} of ${r.gatesSeen} gates: ${Math.round(r.consistency * 100)}% consistency.`);
  if (r.meltEaten > 0) lines.push(`The Melt ate ${r.meltEaten} idle coins. Bank sooner to protect them.`);
  if (r.cashOuts > 0) lines.push(`You cashed out ${r.cashOuts}×. Each one reset your snowball and cut your multiplier.`);
  if (r.hits > 0) lines.push(`Obstacles hit: ${r.hits}. Impulse buys, hot tips and fees all cost you.`);
  if (r.pocketLeft > 0) lines.push(`${r.pocketLeft} coins were still idle at the finish, so they only count half.`);
  const answered = r.answersRight + r.answersWrong;
  if (answered > 0) lines.push(`Answer Gates: ${r.answersRight} of ${answered} right. Knowing your stuff banks coins.`);
  const pct = Math.round((r.loadoutMultiplier - 1) * 100);
  const card: Record<string, string | null> = {
    indexFund: `Index fund: the market moved ${pct >= 0 ? '+' : ''}${pct}% at the finish. That's volatility.`,
    fd: r.shieldsUsed ? `FD: your shield saved you from a hit, plus a safe 5% at the finish.` : 'FD: a safe 5% at the finish.',
    ppf: 'PPF: +30% at the finish for staying locked in.',
    lumpSum: 'Lump sum: 20 coins were working from the very start.',
    sip: 'SIP: idle coins were banked automatically. Consistency on autopilot.',
    rd: 'Recurring Deposit: +5% every time you banked.',
    savings: 'Savings account: The Melt bit 40% slower. Still not enough to beat it.',
    cash: null,
  };
  const cardLine = r.loadoutId ? card[r.loadoutId] : null;
  if (cardLine) lines.push(cardLine);
  if (lines.length === 0) lines.push('Clean run! Consistent banking is how wealth compounds.');
  return lines;
}

export function RunResults({
  result,
  reward,
  autopilot,
  onContinue,
  onReplay,
  continueLabel = 'Continue',
}: {
  result: RunResult;
  /** What actually reached the wallet (from the store). */
  reward?: Reward;
  autopilot?: boolean;
  onContinue: () => void;
  onReplay?: () => void;
  continueLabel?: string;
}) {
  const [stage, setStage] = useState(0);
  const finished = result.outcome === 'finished';
  useEffect(() => {
    const timers = [setTimeout(() => setStage(1), 700), setTimeout(() => setStage(2), 1700)];
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const cheer = setTimeout(() => finished && playSfx('celebrate', 0.8), 1700);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(cheer);
    };
  }, [finished]);

  const rupees = result.coinsAwarded * 100;
  const tenYears = futureValue(rupees, 0.12, 10);
  const caught = result.outcome === 'caught';

  return (
    <Backdrop art={caught ? 'theMelt' : 'celebration'} scrim={caught ? 'dark' : 'soft'}>
    <ScrollView contentContainerStyle={{ padding: space(2.5), gap: space(2), paddingBottom: space(6) }}>
      <View style={{ alignItems: 'center' }}>
        <Character name={caught ? 'melt' : 'kip'} mood="cheer" size={140} />
        <Text style={[type.title, { textAlign: 'center', color: caught ? '#fff' : colors.ink }]}>{caught ? 'The Melt caught you!' : 'Run complete!'}</Text>
      </View>

      {result.timeframe && stage >= 1 ? <TimeTracksCard stages={result.timeframe.stages} /> : null}

      <Card style={{ alignItems: 'center', gap: 6 }}>
        <Text style={type.small}>Run score: compounding reveal</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Coin size={28} />
          <Text style={[type.title, { color: colors.kipDark }]}>{result.banked}</Text>
          {stage >= 1 ? <Text style={[type.title, { color: colors.shellDark }]}>× {result.multiplier.toFixed(2)}</Text> : null}
        </View>
        {stage >= 1 ? (
          <Text style={type.tiny}>
            banked × (1 + consistency) {result.cashOuts ? '− cash-out penalty' : ''}
            {result.loadoutMultiplier !== 1 ? ` × card ${result.loadoutMultiplier.toFixed(2)}` : ''}
          </Text>
        ) : null}
        {stage >= 2 ? (
          <View style={{ alignItems: 'center', marginTop: 6 }}>
            <CountUp to={result.coinsAwarded} prefix="= " suffix=" points" style={[type.hero, { color: colors.ink }]} />
            {result.pocketLeft > 0 ? <Text style={type.tiny}>includes {Math.round(result.pocketLeft * 0.5)} from half-value idle coins</Text> : null}
          </View>
        ) : null}
      </Card>

      {stage >= 2 && reward ? (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5), borderColor: reward.practice ? colors.line : colors.shell, backgroundColor: reward.practice ? colors.surface : '#FFF6DD' }}>
          {reward.newBest || reward.practice ? <Text style={{ fontSize: 28 }}>{reward.newBest ? '🏆' : '🐢'}</Text> : <Coin size={32} />}
          <View style={{ flex: 1, gap: 2 }}>
            {reward.newBest ? <Text style={[type.bodyBold, { color: colors.shellDark }]}>New personal best!</Text> : null}
            <Text style={type.bodyBold}>
              {reward.practice ? `Practice run · +${reward.xp} XP` : `+${reward.coins} coins · +${reward.xp} XP`}
            </Text>
            <Text style={type.tiny}>
              {autopilot
                ? 'Kip played this one for you, so it pays no coins. Your lesson still counts.'
                : reward.practice
                  ? `You've used today's ${REWARDED_RUNS_PER_DAY} rewarded runs. Coins come back tomorrow.`
                  : 'Coins go to your wallet for your emergency fund.'}
            </Text>
          </View>
        </Card>
      ) : null}
      {stage >= 2 ? <ComebackNote coins={reward?.comeback} /> : null}

      {stage >= 2 ? (
        <>
          <Card style={{ gap: 8 }}>
            <Text style={type.bodyBold}>Kip’s debrief</Text>
            {debrief(result).map((line) => (
              <Text key={line} style={type.body}>
                • {line}
              </Text>
            ))}
          </Card>
          <Card style={{ backgroundColor: colors.kipLight, borderColor: colors.kip }}>
            <Text style={type.body}>
              If each point were ₹100 invested for 10 years at a hypothetical 12%, your {formatINR(rupees)} could become{' '}
              <Text style={type.bodyBold}>{formatINR(tenYears)}</Text>.
            </Text>
            <HypotheticalLabel />
          </Card>
          <Button title={continueLabel} onPress={onContinue} />
          {onReplay ? <Button title="Run again" variant="secondary" onPress={onReplay} /> : null}
        </>
      ) : null}
    </ScrollView>
    </Backdrop>
  );
}

/** Time Tracks: what each speed kept, as bars, so the slow track's lead is visible at a glance. */
function TimeTracksCard({ stages }: { stages: NonNullable<RunResult['timeframe']>['stages'] }) {
  const most = Math.max(...stages.map((x) => Math.abs(x.net)), 1);
  return (
    <Card style={{ gap: 8 }}>
      <Text style={type.bodyBold}>What each speed kept</Text>
      {stages.map((x) => (
        <View key={x.stage} style={{ gap: 2 }} accessibilityLabel={`${TF_INFO[x.stage].label}: kept ${x.net}, fees ${x.fees}`}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>
              {TF_INFO[x.stage].emoji} {TF_INFO[x.stage].label}
            </Text>
            <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>
              {x.net >= 0 ? '+' : '−'}
              {Math.abs(x.net)} kept · {x.fees} in fees
            </Text>
          </View>
          <View style={{ height: 10, borderRadius: 5, backgroundColor: colors.line, overflow: 'hidden' }}>
            <View style={{ height: 10, borderRadius: 5, width: `${Math.max((Math.max(x.net, 0) / most) * 100, 2)}%`, backgroundColor: x.net > 0 ? TF_INFO[x.stage].color : colors.error }} />
          </View>
        </View>
      ))}
    </Card>
  );
}
