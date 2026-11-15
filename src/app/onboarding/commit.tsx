/** Onboarding 6/6 — commit: daily goal + reminder time, then start the Knowledge SIP. */
import { Pressable, Text, View } from 'react-native';

import { isAdult } from '@/content/ages';
import { requestNudgePermission } from '@/engagement/scheduler';
import { respectQuietHours } from '@/engagement/nudges';
import { Character } from '@/mascot/Character';
import { OnboardingFrame } from '@/onboarding/OnboardingFrame';
import { useGame, type Profile } from '@/state/game';
import { ArtCaption, Button } from '@/ui/components';
import { colors, radius, space, type } from '@/ui/theme';

const GOAL_OPTIONS: { min: Profile['dailyGoalMin']; label: string }[] = [
  { min: 3, label: 'Casual' },
  { min: 5, label: 'Regular' },
  { min: 10, label: 'Serious' },
];

const TIMES = [
  { hour: 7, minute: 30, label: '7:30 AM' },
  { hour: 16, minute: 0, label: '4:00 PM' },
  { hour: 18, minute: 0, label: '6:00 PM' },
  { hour: 20, minute: 0, label: '8:00 PM' },
  { hour: 21, minute: 30, label: '9:30 PM' },
];

export default function Commit() {
  const profile = useGame((s) => s.profile);
  const setProfile = useGame((s) => s.setProfile);
  const completeOnboarding = useGame((s) => s.completeOnboarding);

  const start = async () => {
    await requestNudgePermission().catch(() => false);
    setProfile({ reminder: respectQuietHours(profile.reminder) });
    completeOnboarding(); // the protected route switches to the main app
  };

  return (
    <OnboardingFrame step={6} footer={<Button testID="start-sip" title="Start my Knowledge SIP 🐢" onPress={start} />}>
      <View style={{ alignItems: 'center' }}>
        <Character name="kip" pose="full" size={150} />
      </View>
      <Text style={[type.title, { textAlign: 'center' }]}>Start your Knowledge SIP</Text>
      <Text style={[type.body, { textAlign: 'center' }]}>A little every day beats a lot once in a while, just like a SIP.</Text>
      <View style={{ gap: space(1) }}>
        {GOAL_OPTIONS.map((g) => {
          const active = profile.dailyGoalMin === g.min;
          return (
            <Pressable key={g.min} onPress={() => setProfile({ dailyGoalMin: g.min })} accessibilityRole="radio" accessibilityState={{ selected: active }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: space(2), borderRadius: radius.md, borderWidth: 2.5, borderBottomWidth: 5, borderColor: active ? colors.kip : colors.line, backgroundColor: active ? colors.kipLight : colors.surface }}>
                <Text style={type.bodyBold}>{g.min} min a day</Text>
                <Text style={type.small}>{g.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Text style={type.h2}>Remind me at</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(1) }}>
        {TIMES.map((t) => {
          const active = profile.reminder.hour === t.hour && profile.reminder.minute === t.minute;
          return (
            <Pressable key={t.label} onPress={() => setProfile({ reminder: { hour: t.hour, minute: t.minute } })} accessibilityRole="radio" accessibilityState={{ selected: active }}>
              <View style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 2, borderColor: active ? colors.ink : colors.line, backgroundColor: active ? colors.ink : colors.surface }}>
                <Text style={[type.small, { color: active ? '#fff' : colors.ink, fontWeight: '800' }]}>{t.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <ArtCaption>At most one nudge a day. Never after 10 PM. {isAdult(profile.age) ? 'Quiet on weekday mornings.' : 'Muted during school hours.'}</ArtCaption>
    </OnboardingFrame>
  );
}
