/** The weekly report for a parent: what was learned, how consistent, and questions for dinner. */
import { router } from 'expo-router';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { trackFor } from '@/content';
import { Character } from '@/mascot/Character';
import { weeklyDigest } from '@/parents/digest';
import { totalPrincipal, totalValue } from '@/portfolio/engine';
import { useGame } from '@/state/game';
import { Backdrop } from '@/ui/Backdrop';
import { ArtCaption, Button, Card } from '@/ui/components';
import { colors, space, type } from '@/ui/theme';

export default function ParentReport() {
  const insets = useSafeAreaInsets();
  const name = useGame((s) => s.profile.name);
  const today = useGame((s) => s.today());
  const lessons = useGame((s) => s.lessons);
  const track = useGame((s) => trackFor(s.profile.ageBand));
  const streak = useGame((s) => s.streak);
  const finiq = useGame((s) => s.finIQ());
  const portfolio = useGame((s) => s.portfolio);
  const d = weeklyDigest({ name, today, lessons, streak, finiq, track, portfolio: portfolio.lots.length ? { value: totalValue(portfolio), principal: totalPrincipal(portfolio) } : null });

  return (
    <Backdrop art="celebration" scrim="soft">
      <ScrollView contentContainerStyle={{ padding: space(2.5), paddingTop: insets.top + space(1.5), paddingBottom: insets.bottom + space(4), gap: space(2) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={type.title}>Weekly report</Text>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}>
            <Text style={{ fontSize: 26, color: colors.inkMuted }}>✕</Text>
          </Pressable>
        </View>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5) }}>
          <Character name="kip" mood="cheer" size={80} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={type.bodyBold}>{d.name}’s week</Text>
            <Text style={type.small}>
              {d.activeDays} of 7 days active · {d.streak}-day streak
            </Text>
            <Text style={type.small}>
              FinIQ {d.finiq} · {d.band} band
            </Text>
          </View>
        </Card>
        <Card style={{ gap: 6 }}>
          <Text style={type.bodyBold}>Learned this week</Text>
          {d.learned.length ? (
            d.learned.map((l) => (
              <Text key={l.title} style={type.small}>
                ✅ {l.capability}
              </Text>
            ))
          ) : (
            <Text style={type.small}>No new lessons this week. One 3-minute lesson restarts the habit.</Text>
          )}
          {d.next ? <Text style={[type.small, { color: colors.kipDark, fontWeight: '800' }]}>Next up: {d.next}</Text> : null}
        </Card>
        {d.portfolio ? (
          <Card style={{ gap: 4 }}>
            <Text style={type.bodyBold}>Practice portfolio</Text>
            <Text style={type.small}>
              {Math.round(d.portfolio.value)} coins from {Math.round(d.portfolio.principal)} invested. Game coins in a simulated market, not real money.
            </Text>
          </Card>
        ) : null}
        <Card style={{ gap: 6, borderColor: colors.shell, backgroundColor: '#FFF6DD' }}>
          <Text style={type.bodyBold}>Ask at dinner</Text>
          {d.questions.map((q) => (
            <Text key={q} style={type.small}>
              💬 {q}
            </Text>
          ))}
        </Card>
        <Button
          testID="share-report"
          title="Share with a parent"
          onPress={() => Share.share({ message: d.text }).catch(() => {})}
        />
        <ArtCaption>Education only: no real money, no trading and no advice.</ArtCaption>
      </ScrollView>
    </Backdrop>
  );
}
