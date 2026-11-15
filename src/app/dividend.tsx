/** Dividend Day: a weekly, deterministic reward for consistency (never a random loot box). */
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { playSfx } from '@/audio/sound';
import { canClaimDividend, daysUntilDividend, dividendAmount } from '@/engagement/rewards';
import { activeInLast7, displayStreak } from '@/engagement/streak';
import { useGame } from '@/state/game';
import { Character } from '@/mascot/Character';
import { Backdrop } from '@/ui/Backdrop';
import { Button, Card, Coin, CountUp } from '@/ui/components';
import { colors, space, type } from '@/ui/theme';

export default function Dividend() {
  const streakState = useGame((s) => s.streak);
  const last = useGame((s) => s.lastDividendDay);
  const today = useGame((s) => s.today());
  const claim = useGame((s) => s.claimDividend);
  const [claimed, setClaimed] = useState<number | null>(null);

  const active = activeInLast7(streakState, today);
  const streak = displayStreak(streakState, today);
  const ready = canClaimDividend(last, today);
  const consistencyPart = Math.round((20 * Math.min(active, 7)) / 7);
  const streakPart = 2 * Math.min(streak, 30);

  return (
    <Backdrop art="celebration" scrim="soft">
    <View style={{ flex: 1, padding: space(2.5), gap: space(2) }}>
      <View style={{ alignItems: 'center', marginTop: space(1) }}>
        <Character name="kip" mood={claimed !== null ? 'cheer' : 'happy'} size={130} />
      </View>
      <Text style={[type.title, { textAlign: 'center' }]}>Dividend Day</Text>
      <Text style={[type.body, { textAlign: 'center' }]}>
        You showed up {active} of the last 7 days. Consistency pays dividends, just like holding good investments.
      </Text>
      <Card style={{ gap: 6 }}>
        <Row label={`Consistency (${active}/7 days)`} value={consistencyPart} />
        <Row label={`Streak bonus (${streak} days × 2)`} value={streakPart} />
        <View style={{ height: 1.5, backgroundColor: colors.line, marginVertical: 4 }} />
        <Row label="Total" value={dividendAmount(active, streak)} bold />
      </Card>
      <Text style={[type.tiny, { textAlign: 'center' }]}>No luck involved. The more consistent you are, the bigger it gets.</Text>
      <View style={{ flex: 1 }} />
      {claimed !== null ? (
        <>
          <CountUp to={claimed} prefix="+" suffix=" coins collected" style={[type.h2, { textAlign: 'center', color: colors.kipDark }]} />
          <Button title="Nice!" onPress={() => router.back()} />
        </>
      ) : ready ? (
        <Button
          testID="claim-dividend"
          title="Collect"
          onPress={() => {
            const amount = claim();
            if (amount !== null) {
              playSfx('celebrate');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              setClaimed(amount);
            }
          }}
        />
      ) : (
        <>
          <Text style={[type.bodyBold, { textAlign: 'center' }]}>Next Dividend Day in {daysUntilDividend(last, today)} days</Text>
          <Button title="Close" variant="secondary" onPress={() => router.back()} />
        </>
      )}
    </View>
    </Backdrop>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={bold ? type.bodyBold : type.body}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={type.number}>{value}</Text>
        <Coin size={18} />
      </View>
    </View>
  );
}
