/** Future You: the player's future, misty at first and sharpening as FinIQ grows (future-self research). */
import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { BACKGROUNDS } from '../art';

import type { GoalId } from '../state/game';
import { colors, shadow, type } from './theme';

/** Dream goals with editable default prices in today's rupees. */
export const GOALS: { id: GoalId; emoji: string; label: string; short: string; price: number }[] = [
  { id: 'laptop', emoji: '💻', label: 'New laptop', short: 'Laptop', price: 60000 },
  { id: 'bike', emoji: '🏍️', label: 'My own bike', short: 'Bike', price: 120000 },
  { id: 'travel', emoji: '✈️', label: 'Travel the world', short: 'World trip', price: 150000 },
  { id: 'college', emoji: '🎓', label: 'College fund', short: 'College', price: 1000000 },
  { id: 'business', emoji: '🚀', label: 'Start a business', short: 'My business', price: 500000 },
  { id: 'free40', emoji: '🏝️', label: 'Free at 40', short: 'Free', price: 10000000 },
];

/** The goal in a few words for tight spaces, e.g. "Laptop by 25". */
export function goalShort(id: GoalId | null, targetAge: number): string {
  return `${goalOf(id).short} by ${targetAge}`;
}

export function goalOf(id: GoalId | null) {
  return GOALS.find((g) => g.id === id) ?? GOALS[0];
}

/**
 * Future You: the player's future-city skyline, misty at first and coming into focus as
 * FinIQ grows. clarity 0 = foggy, 1 = crystal clear.
 */
export function FutureYouPortrait({ clarity, size = 96, goal }: { clarity: number; size?: number; goal: GoalId | null }) {
  const c = Math.min(Math.max(clarity, 0), 1);
  return (
    <View style={{ width: size, height: size }} accessible accessibilityRole="image" accessibilityLabel={`Future You, ${Math.round(c * 100)}% in focus`}>
      <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', borderWidth: 3, borderColor: '#fff', backgroundColor: colors.shell, ...shadow }}>
        <Image source={BACKGROUNDS.onboarding} style={{ width: size, height: size * 1.6 }} contentFit="cover" contentPosition="top" blurRadius={Math.round(10 * (1 - c))} accessible={false} />
        {/* Morning mist that lifts as the player learns */}
        <View style={{ position: 'absolute', inset: 0, backgroundColor: '#F3ECFF', opacity: 0.55 * (1 - c) }} pointerEvents="none" />
      </View>
      <View style={{ position: 'absolute', right: -4, bottom: -4, backgroundColor: colors.surface, borderRadius: 16, padding: 3, borderWidth: 2, borderColor: colors.line }}>
        <Text style={{ fontSize: size * 0.2 }}>{goalOf(goal).emoji}</Text>
      </View>
    </View>
  );
}

export function clarityFromFinIQ(finiq: number) {
  // Visibly sharper early on, so progress feels rewarding: square-root curve over 300–900.
  return Math.sqrt(Math.max(finiq - 300, 0) / 600);
}

export function FutureYouLabel({ age }: { age: number }) {
  return <Text style={[type.tiny, { textAlign: 'center' }]}>Future You · age {age}</Text>;
}
