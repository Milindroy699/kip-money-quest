/** Today's minutes toward the daily goal picked in onboarding, as a ring. */
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { Text, View } from 'react-native';

import { colors, type } from './theme';

export function DailyGoalRing({ minutes, goal, size = 56 }: { minutes: number; goal: number; size?: number }) {
  const progress = Math.min(minutes / Math.max(goal, 1), 1);
  const stroke = 6;
  const r = (size - stroke) / 2;
  const track = Skia.PathBuilder.Make();
  track.addCircle(size / 2, size / 2, r);
  const arc = Skia.PathBuilder.Make();
  if (progress > 0) arc.addArc(Skia.XYWHRect(stroke / 2, stroke / 2, size - stroke, size - stroke), -90, Math.max(progress * 360, 4));
  const done = progress >= 1;
  return (
    <View style={{ width: size, height: size }} accessible accessibilityRole="progressbar" accessibilityLabel={`Daily goal: ${Math.min(minutes, goal)} of ${goal} minutes`}>
      <Canvas style={{ width: size, height: size }}>
        <Path path={track.detach()} color={colors.line} style="stroke" strokeWidth={stroke} />
        <Path path={arc.detach()} color={done ? colors.kip : colors.shell} style="stroke" strokeWidth={stroke} strokeCap="round" />
      </Canvas>
      <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[type.tiny, { color: colors.ink, fontWeight: '800' }]}>{done ? '✓' : `${Math.min(minutes, goal)}/${goal}`}</Text>
      </View>
    </View>
  );
}
