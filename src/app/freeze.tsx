/** Emergency fund: buy a streak freeze with earned coins. */
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';

import { FREEZE_COST, MAX_FREEZES } from '@/engagement/streak';
import { Character } from '@/mascot/Character';
import { useGame } from '@/state/game';
import { Button, Card, Coin } from '@/ui/components';
import { colors, space, type } from '@/ui/theme';

export default function Freeze() {
  const freezes = useGame((s) => s.streak.freezes);
  const coins = useGame((s) => s.coins);
  const buy = useGame((s) => s.buyStreakFreeze);
  const full = freezes >= MAX_FREEZES;

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream, padding: space(2.5), gap: space(2), alignItems: 'center' }}>
      <Character name="kip" mood="happy" size={140} />
      <Text style={type.title}>Build your emergency fund</Text>
      <Text style={[type.body, { textAlign: 'center' }]}>
        Life happens. A freeze covers one missed day so your Knowledge SIP keeps compounding, just like an emergency fund protects your investments from being sold in a hurry.
      </Text>
      <Card style={{ alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-around' }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={type.h2}>
            🛡️ {freezes} / {MAX_FREEZES}
          </Text>
          <Text style={type.tiny}>Held</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Coin size={22} />
            <Text style={type.h2}>{FREEZE_COST}</Text>
          </View>
          <Text style={type.tiny}>Price</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Coin size={22} />
            <Text style={type.h2}>{coins}</Text>
          </View>
          <Text style={type.tiny}>Your coins</Text>
        </View>
      </Card>
      <View style={{ flex: 1 }} />
      <Button
        style={{ alignSelf: 'stretch' }}
        title={full ? 'Emergency fund is full' : 'Buy freeze'}
        disabled={full}
        onPress={() => {
          if (buy()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            router.back();
          } else Alert.alert('Not enough coins', `You need ${FREEZE_COST} coins. Earn them in lessons, Kip Runs and Dividend Day.`);
        }}
      />
      <Button style={{ alignSelf: 'stretch' }} title="Not now" variant="ghost" onPress={() => router.back()} />
    </View>
  );
}
