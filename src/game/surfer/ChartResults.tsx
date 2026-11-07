/** Chart Surfer debrief: your reads against the textbook, and how often the textbook was right. */
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { playSfx } from '../../audio/sound';
import { REWARDED_RUNS_PER_DAY } from '../../engagement/rewards';
import { SETUP_COPY, type SurfResult } from '../../games/chartSurfer';
import { Character } from '../../mascot/Character';
import type { Reward } from '../../state/game';
import { Backdrop } from '../../ui/Backdrop';
import { Button, Card, Coin, ComebackNote, HypotheticalLabel } from '../../ui/components';
import { colors, space, type } from '../../ui/theme';

export function chartDebrief(r: SurfResult): string[] {
  const lines: string[] = [];
  const n = r.reads.length;
  const right = r.readsRight;
  lines.push(
    right >= n - 1
      ? `You made the textbook read ${right} of ${n} times. That's reading the chart well.`
      : right >= n / 2
        ? `You made the textbook read ${right} of ${n} times. Good reasoning on most of them.`
        : `You made the textbook read ${right} of ${n} times. Support and double bottoms usually lean up; resistance and head-and-shoulders lean down.`,
  );
  lines.push(`The market followed the textbook ${r.heldUp} of ${n} times. Patterns tilt the odds a little; they don't promise what's next.`);
  if (r.heldUp < n) lines.push('That’s why chart traders cap their losses with stop-losses, and why long-term investors don’t rely on charts alone.');
  if (r.tipsHit) lines.push(`You surfed into ${r.tipsHit} hot tip${r.tipsHit > 1 ? 's' : ''}. Tips are noise; the chart and the business are the evidence.`);
  if (r.gapsHit) lines.push(`${r.gapsHit} overnight news gap${r.gapsHit > 1 ? 's' : ''} caught you. Prices can jump while the market is closed.`);
  else if (r.gapsCleared) lines.push(`You jumped all ${r.gapsCleared} overnight news gaps.`);
  return lines;
}

export function ChartResults({ result, reward, autopilot, onContinue, onReplay, continueLabel = 'Continue' }: { result: SurfResult; reward?: Reward; autopilot?: boolean; onContinue: () => void; onReplay?: () => void; continueLabel?: string }) {
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    playSfx('celebrate', 0.8);
  }, []);
  return (
    <Backdrop art="analystHq" scrim="dark">
      <ScrollView contentContainerStyle={{ padding: space(2.5), gap: space(2), paddingBottom: space(6) }}>
        <View style={{ alignItems: 'center' }}>
          <Character name="kip" mood="cheer" size={130} />
          <Text style={[type.title, { color: '#fff', textAlign: 'center' }]}>Surf’s up!</Text>
        </View>
        <Card style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <Stat value={`${result.coins}`} label="Coins" coin />
          <Stat value={`${result.readsRight}/${result.reads.length}`} label="Textbook reads" />
          <Stat value={`${result.heldUp}/${result.reads.length}`} label="Patterns held" />
        </Card>
        {reward ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5), borderColor: reward.practice ? colors.line : colors.shell, backgroundColor: reward.practice ? colors.surface : '#FFF6DD' }}>
            {reward.newBest || reward.practice ? <Text style={{ fontSize: 28 }}>{reward.newBest ? '🏆' : '🐢'}</Text> : <Coin size={32} />}
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={type.bodyBold}>{reward.practice ? `Practice · +${reward.xp} XP` : `+${reward.coins} coins · +${reward.xp} XP`}</Text>
              <Text style={type.tiny}>
                {autopilot ? 'Kip surfed this one for you, so it pays no coins.' : reward.practice ? `You've used today's ${REWARDED_RUNS_PER_DAY} rewarded runs. Coins come back tomorrow.` : 'Coins go to your wallet.'}
              </Text>
            </View>
          </Card>
        ) : null}
        <ComebackNote coins={reward?.comeback} />
        <Card style={{ gap: 8 }}>
          <Text style={type.bodyBold}>Your reads</Text>
          {result.reads.map((r, i) => {
            const held = r.actual === r.textbook;
            return (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ width: 24, fontSize: 16 }}>{r.answer === r.textbook ? '✅' : r.answer ? '❌' : '⏱️'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>{SETUP_COPY[r.kind].name}</Text>
                  <Text style={type.tiny}>
                    You: {r.answer ?? 'no call'} · textbook: {r.textbook} · market: {r.actual} {held ? '(held)' : '(failed)'}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>
        <Card style={{ gap: 8 }}>
          <Text style={type.bodyBold}>Kip’s debrief</Text>
          {chartDebrief(result).map((line) => (
            <Text key={line} style={type.body}>
              • {line}
            </Text>
          ))}
          <HypotheticalLabel extra="A simulated chart. Patterns in real markets are less reliable than they look in hindsight." />
        </Card>
        <Button title={continueLabel} onPress={onContinue} />
        {onReplay ? <Button title="Surf again" variant="secondary" onPress={onReplay} /> : null}
      </ScrollView>
    </Backdrop>
  );
}

function Stat({ value, label, coin }: { value: string; label: string; coin?: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {coin ? <Coin size={18} /> : null}
        <Text style={type.number}>{value}</Text>
      </View>
      <Text style={type.tiny}>{label}</Text>
    </View>
  );
}
