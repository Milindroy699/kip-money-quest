/** Card detail: what it is, real-life facts, good for / watch out. */
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { getCard } from '@/content';
import { AssetCard } from '@/game/cards/AssetCard';
import { Button, Card, Chip } from '@/ui/components';
import { colors, space, type } from '@/ui/theme';

export default function CardDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = getCard(id);
  if (!card) return null;
  return (
    <ScrollView style={{ backgroundColor: colors.cream }} contentContainerStyle={{ padding: space(2.5), gap: space(2), paddingBottom: space(6) }}>
      <AssetCard card={card} />
      {card.mentor ? <Chip label={`Mentor: ${card.mentor}`} /> : null}
      <Card style={{ gap: 6 }}>
        <Text style={[type.tiny, { color: colors.kipDark }]}>IN REAL LIFE{card.regulator ? ` · ${card.regulator}` : ''}</Text>
        <Text style={type.body}>{card.realLife}</Text>
      </Card>
      {card.traits ? (
        <Card style={{ gap: 6 }}>
          <Text style={type.bodyBold}>How it works</Text>
          {card.traits.map((t) => (
            <Text key={t} style={type.body}>
              • {t}
            </Text>
          ))}
        </Card>
      ) : null}
      <View style={{ flexDirection: 'row', gap: space(1.5) }}>
        <Card style={{ flex: 1, gap: 6, backgroundColor: colors.kipLight, borderColor: colors.kip }}>
          <Text style={type.bodyBold}>Good for</Text>
          {card.goodFor.map((g) => (
            <Text key={g} style={type.small}>
              ✓ {g}
            </Text>
          ))}
        </Card>
        <Card style={{ flex: 1, gap: 6, backgroundColor: colors.dashLight, borderColor: colors.dash }}>
          <Text style={type.bodyBold}>Watch out</Text>
          {card.watchOut.map((w) => (
            <Text key={w} style={type.small}>
              ! {w}
            </Text>
          ))}
        </Card>
      </View>
      <Text style={[type.tiny, { textAlign: 'center' }]}>For learning only. Not a recommendation to buy any product.</Text>
      <Button title="Close" variant="secondary" onPress={() => router.back()} />
    </ScrollView>
  );
}
