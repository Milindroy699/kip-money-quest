/**
 * The player's dream goal, always in the top bar: a daily reminder of why the habit matters.
 * Tapping it opens the Future You plan.
 */
import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { useGame } from '../state/game';
import { goalOf, goalShort } from './FutureYou';
import { colors, type } from './theme';

export function GoalChip() {
  const goal = useGame((s) => s.profile.goal);
  const targetAge = useGame((s) => s.profile.targetAge);
  const g = goalOf(goal);
  return (
    <Pressable
      testID="goal-chip"
      onPress={() => router.push('/plan')}
      accessibilityRole="button"
      accessibilityLabel={`Your goal: ${g.label} by age ${targetAge}. Open your plan.`}
      hitSlop={6}
      style={{ flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.ink, borderRadius: 999, paddingLeft: 8, paddingRight: 10, paddingVertical: 6 }}>
      <Text style={{ fontSize: 14 }}>{g.emoji}</Text>
      <Text style={[type.tiny, { color: '#fff', fontWeight: '800', flexShrink: 1 }]} numberOfLines={1}>
        {goalShort(goal, targetAge)}
      </Text>
    </Pressable>
  );
}
