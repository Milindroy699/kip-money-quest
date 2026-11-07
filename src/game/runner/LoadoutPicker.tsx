/** Pick one owned product card to power up the next run. */
import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { getCard } from '../../content';
import { colors, radius, space, type } from '../../ui/theme';
import { availableLoadouts } from './loadouts';

export function LoadoutPicker({ owned, selected, onSelect }: { owned: string[]; selected: string; onSelect: (id: string) => void }) {
  const options = availableLoadouts(owned);
  const current = options.find((o) => o.id === selected) ?? options[0];
  return (
    <View style={{ gap: 8 }}>
      <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>Power up with a card</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: space(2) }}>
        {options.map((o) => {
          const card = getCard(o.id);
          const active = o.id === current.id;
          return (
            <Pressable
              key={o.id}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onSelect(o.id);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${card?.name ?? o.id}: ${o.power}`}>
              <View style={{ width: 112, padding: 10, borderRadius: radius.md, borderWidth: 2.5, borderBottomWidth: 5, borderColor: active ? colors.kip : colors.line, backgroundColor: active ? colors.kipLight : colors.surface, gap: 2 }}>
                <Text style={{ fontSize: 22 }}>{card?.emoji}</Text>
                <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]} numberOfLines={1}>
                  {card?.name}
                </Text>
                <Text style={[type.tiny, { color: colors.inkSoft }]} numberOfLines={3}>
                  {o.power}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text style={[type.tiny, { color: colors.inkSoft }]}>
        {getCard(current.id)?.name}: {current.trait}
      </Text>
    </View>
  );
}
