/**
 * Practice Portfolio: invest coins in unlocked products and watch a shared market move them.
 * 1 real day = 1 market month. Teaches risk vs return, lock-ins and staying invested by doing.
 */
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCard } from '@/content';
import { SpeechBubble } from '@/mascot/SpeechBubble';
import { coachNote, exitQuote, investableCards, marketMonth, monthOfDay, PORTFOLIO_LIMITS, PRODUCTS, realValue, totalPrincipal, totalValue, type Lot } from '@/portfolio/engine';
import { useGame } from '@/state/game';
import { Backdrop } from '@/ui/Backdrop';
import { ArtCaption, Button, Card, Coin, SectionTitle } from '@/ui/components';
import { HYPOTHETICAL_LABEL } from '@/sim/assets';
import { LineChart } from '@/ui/LineChart';
import { colors, radius, space, type } from '@/ui/theme';

const pct = (x: number) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}%`;
const AMOUNTS = [10, 25, 50, 100];

export default function Portfolio() {
  const insets = useSafeAreaInsets();
  const portfolio = useGame((s) => s.portfolio);
  const coins = useGame((s) => s.coins);
  const cards = useGame((s) => s.cards);
  const today = useGame((s) => s.today());
  const settlePortfolio = useGame((s) => s.settlePortfolio);
  const investCoins = useGame((s) => s.investCoins);
  const withdrawLot = useGame((s) => s.withdrawLot);
  const month = monthOfDay(today);

  // Catch up on the market months (days) since the last visit.
  useEffect(() => {
    settlePortfolio();
  }, [settlePortfolio, month]);

  const products = investableCards(cards);
  const [picked, setPicked] = useState<string | null>(null);
  const [amount, setAmount] = useState(25);
  const choice = picked && products.includes(picked) ? picked : (products[0] ?? null);

  const value = totalValue(portfolio);
  const principal = totalPrincipal(portfolio);
  const gain = principal ? value / principal - 1 : 0;
  const market = marketMonth(month);
  const room = PORTFOLIO_LIMITS.maxTotal - principal;
  const maxAmount = Math.max(0, Math.min(coins, room));

  const doInvest = () => {
    if (!choice) return;
    const error = investCoins(choice, Math.min(amount, maxAmount));
    if (error) {
      const msg = { tooSmall: `Invest at least ${PORTFOLIO_LIMITS.minInvest} coins.`, notEnoughCoins: 'Not enough coins in your wallet.', overLimit: `The practice portfolio holds up to ${PORTFOLIO_LIMITS.maxTotal} coins.`, notUnlocked: 'Unlock this card in a lesson first.' }[error];
      Alert.alert('Can’t invest that', msg);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const doWithdraw = (lot: Lot) => {
    const quote = exitQuote(lot, month);
    const name = getCard(lot.cardId)?.name ?? lot.cardId;
    if (!quote.allowed) {
      Alert.alert('Locked', `${name} unlocks in ${quote.monthsLeft} day${quote.monthsLeft === 1 ? '' : 's'}. That’s the trade-off for its steady return.`);
      return;
    }
    const go = () => {
      const paid = withdrawLot(lot.id);
      if (paid !== 'locked') Haptics.selectionAsync().catch(() => {});
    };
    if (quote.penalty > 0) {
      Alert.alert('Break it early?', `Taking this ${name} out ${quote.monthsLeft} days early costs ${quote.penalty} coins. You’d get ${quote.payout}.`, [
        { text: 'Keep it', style: 'cancel' },
        { text: 'Take it out', style: 'destructive', onPress: go },
      ]);
    } else {
      go();
    }
  };

  // Group lots by product for the holdings list.
  const groups = new Map<string, Lot[]>();
  for (const l of portfolio.lots) groups.set(l.cardId, [...(groups.get(l.cardId) ?? []), l]);
  const history = portfolio.history.filter((h) => h.value > 0);
  const firstMonth = history[0]?.month ?? month;

  return (
    <Backdrop art="cardVault" scrim="dark">
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ padding: space(2.5), paddingTop: insets.top + space(1.5), paddingBottom: insets.bottom + space(4), gap: space(2) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[type.title, { color: '#fff' }]}>Practice Portfolio</Text>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}>
            <Text style={{ fontSize: 26, color: '#DCE3EE' }}>✕</Text>
          </Pressable>
        </View>
        <Text style={[type.small, { color: '#DCE3EE', marginTop: -8 }]}>Invest your coins in the products you’ve unlocked. 1 day here = 1 month in the market.</Text>

        <Card style={{ gap: space(1) }}>
          <Text style={type.small}>Portfolio value</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Coin size={28} />
            <Text style={[type.hero, { color: colors.ink }]}>{Math.round(value)}</Text>
            {principal ? <Text style={[type.h2, { color: gain >= 0 ? colors.kipDark : colors.error }]}>{pct(gain)}</Text> : null}
          </View>
          <Text style={type.small}>
            Put in {Math.round(principal)} coins · wallet {coins} coins
          </Text>
          {principal ? (
            <Text style={type.tiny}>
              After a year of inflation, {Math.round(value)} coins buy what {Math.round(realValue(value, 12))} buy today. Growth has to beat that.
            </Text>
          ) : null}
          {history.length >= 2 ? (
            <LineChart
              series={[{ id: 'value', label: 'Portfolio', color: colors.kip, points: history.map((h) => ({ x: h.month - firstMonth, y: h.value })) }]}
              selectedX={history[history.length - 1].month - firstMonth}
              xMax={Math.max(history[history.length - 1].month - firstMonth, 1)}
              height={150}
              formatY={(v) => `${Math.round(v)}`}
              formatX={(x) => `month ${x}`}
            />
          ) : null}
        </Card>

        <Card style={{ gap: 6, borderColor: market.event?.id === 'crash' ? colors.error : market.event ? colors.shell : colors.line }}>
          <Text style={type.tiny}>THIS MONTH IN THE MARKET</Text>
          <Text style={type.bodyBold}>{market.event ? `${market.event.id === 'crash' ? '📉' : market.event.id === 'boom' ? '📈' : '📰'} ${market.event.title}` : '🌤️ A normal month'}</Text>
          {market.event ? <Text style={type.small}>{market.event.description}</Text> : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {products.map((c) => {
              const r = market.returns[PRODUCTS[c].asset];
              return (
                <Text key={c} style={[type.tiny, { color: r >= 0 ? colors.kipDark : colors.error, fontWeight: '800', backgroundColor: colors.cream, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, overflow: 'hidden' }]}>
                  {getCard(c)?.emoji} {getCard(c)?.name} {pct(r)}
                </Text>
              );
            })}
          </View>
        </Card>

        <SpeechBubble text={coachNote(portfolio, month, cards)} speaker="Kip" />

        {groups.size ? (
          <View style={{ gap: space(1.5) }}>
            <SectionTitle>
              <Text style={{ color: '#fff' }}>Holdings</Text>
            </SectionTitle>
            {[...groups.entries()].map(([cardId, lots]) => {
              const card = getCard(cardId);
              const v = lots.reduce((s, l) => s + l.value, 0);
              const p = lots.reduce((s, l) => s + l.principal, 0);
              return (
                <Card key={cardId} style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 26 }}>{card?.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={type.bodyBold}>{card?.name}</Text>
                      <Text style={type.tiny}>{PRODUCTS[cardId].rule}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={type.bodyBold}>{Math.round(v)}</Text>
                      <Text style={[type.tiny, { color: v >= p ? colors.kipDark : colors.error, fontWeight: '800' }]}>{pct(v / p - 1)}</Text>
                    </View>
                  </View>
                  {lots.map((l) => {
                    const q = exitQuote(l, month);
                    return (
                      <View key={l.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 8 }}>
                        <Text style={[type.small, { flex: 1 }]}>
                          {l.principal} → {Math.round(l.value)} coins
                          {q.monthsLeft > 0 ? ` · ${q.allowed ? 'fixed' : 'locked'} for ${q.monthsLeft} more day${q.monthsLeft === 1 ? '' : 's'}` : ''}
                        </Text>
                        <Pressable
                          onPress={() => doWithdraw(l)}
                          accessibilityRole="button"
                          accessibilityLabel={q.allowed ? `Take out ${card?.name}` : `${card?.name} is locked`}
                          style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 2, borderColor: q.allowed ? colors.ink : colors.line }}>
                          <Text style={[type.tiny, { color: q.allowed ? colors.ink : colors.inkMuted, fontWeight: '800' }]}>{q.allowed ? (q.penalty ? 'Break early' : 'Take out') : '🔒 Locked'}</Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </Card>
              );
            })}
          </View>
        ) : null}

        <Card style={{ gap: space(1.5) }}>
          <SectionTitle>Invest coins</SectionTitle>
          {products.length ? (
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {products.map((c) => {
                  const active = c === choice;
                  return (
                    <Pressable
                      key={c}
                      testID={`invest-pick-${c}`}
                      onPress={() => setPicked(c)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 2, borderColor: active ? colors.ink : colors.line, backgroundColor: active ? colors.ink : colors.surface }}>
                      <Text style={[type.small, { color: active ? '#fff' : colors.ink, fontWeight: '800' }]}>
                        {getCard(c)?.emoji} {getCard(c)?.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {choice ? <Text style={type.small}>{PRODUCTS[choice].rule}</Text> : null}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[...AMOUNTS, maxAmount].map((a, i) => {
                  const active = amount === a;
                  const label = i === AMOUNTS.length ? 'All' : `${a}`;
                  return (
                    <Pressable
                      key={`${label}`}
                      testID={`invest-amount-${label}`}
                      onPress={() => setAmount(a)}
                      disabled={a > maxAmount || a < PORTFOLIO_LIMITS.minInvest}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.md, borderWidth: 2, borderColor: active ? colors.kip : colors.line, backgroundColor: active ? colors.kipLight : colors.surface, opacity: a > maxAmount || a < PORTFOLIO_LIMITS.minInvest ? 0.4 : 1 }}>
                      <Text style={[type.bodyBold, { fontSize: 15 }]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Button testID="invest-confirm" title={`Invest ${Math.min(amount, maxAmount)} coins`} disabled={!choice || Math.min(amount, maxAmount) < PORTFOLIO_LIMITS.minInvest} onPress={doInvest} />
              <Text style={type.tiny}>
                Coins you invest can’t buy a streak freeze until you take them out. Keeping some in your wallet is your emergency fund.
              </Text>
            </>
          ) : (
            <Text style={type.small}>Finish your first lessons to unlock products you can invest in.</Text>
          )}
        </Card>
        <ArtCaption>Practice coins only. The market here is simulated. {HYPOTHETICAL_LABEL}</ArtCaption>
      </ScrollView>
    </Backdrop>
  );
}
