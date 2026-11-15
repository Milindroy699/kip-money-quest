/** Onboarding 1/6 — Hi, I'm Kip. Name + age (13 and up; 16+ is the Builder track, adults included). */
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { KipWave } from '@/mascot/Character';
import { SpeechBubble } from '@/mascot/SpeechBubble';
import { OnboardingFrame } from '@/onboarding/OnboardingFrame';
import { bandForAge, defaultTargetAge, MAX_AGE } from '@/content/ages';
import { useGame, type AgeBand } from '@/state/game';
import { Button } from '@/ui/components';
import { colors, radius, space, type } from '@/ui/theme';

export default function Welcome() {
  const profile = useGame((s) => s.profile);
  const setProfile = useGame((s) => s.setProfile);
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState<number | null>(profile.age);
  // 13–18 are quick taps; "19 or older" opens a box to type your age.
  const [older, setOlder] = useState(profile.age !== null && profile.age > 18);
  const [olderText, setOlderText] = useState(profile.age !== null && profile.age > 18 ? String(profile.age) : '');
  const band: AgeBand | null = age === null ? null : bandForAge(age);

  return (
    <OnboardingFrame
      step={1}
      footer={
        <>
          {/* Next to the button it reassures about, and never cut off by the scroll edge. */}
          <Text style={[type.tiny, { textAlign: 'center', alignSelf: 'center', color: colors.inkSoft, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, overflow: 'hidden' }]}>
            🔒 Stays on this phone. No account needed to play.
          </Text>
          <Button
            testID="welcome-continue"
            title="Let's go"
            disabled={!name.trim() || age === null}
            onPress={() => {
              setProfile({ name: name.trim(), age, ageBand: band, targetAge: defaultTargetAge(age ?? 15, profile.targetAge) });
              router.push('/onboarding/dream');
            }}
          />
        </>
      }>
      <View style={{ alignItems: 'center', marginTop: space(2) }}>
        <SpeechBubble text="Hi! I'm Kip. I'll help you make Future You richer and wiser." speaker="Kip" />
        <View style={{ marginTop: space(1) }}>
          <KipWave size={170} />
        </View>
      </View>
      <Text style={type.h2}>What should I call you?</Text>
      <TextInput
        testID="name-input"
        value={name}
        onChangeText={setName}
        placeholder="Your first name"
        placeholderTextColor={colors.inkMuted}
        autoCapitalize="words"
        maxLength={20}
        returnKeyType="done"
        style={[type.bodyBold, { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 2, borderColor: colors.line, padding: space(2), fontSize: 18 }]}
      />
      <Text style={type.h2}>How old are you?</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {[13, 14, 15, 16, 17, 18].map((a) => {
          const on = !older && age === a;
          return (
            <Pressable
              key={a}
              style={{ flex: 1 }}
              onPress={() => {
                setOlder(false);
                setAge(a);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${a} years old`}>
              <View style={{ paddingVertical: space(1.5), borderRadius: radius.md, borderWidth: 2.5, borderBottomWidth: 5, borderColor: on ? colors.kip : colors.line, backgroundColor: on ? colors.kipLight : colors.surface, alignItems: 'center' }}>
                <Text style={type.h2}>{a}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        testID="age-older"
        onPress={() => {
          setOlder(true);
          const n = Number(olderText);
          setAge(olderText !== '' && n >= 19 && n <= MAX_AGE ? n : null);
        }}
        accessibilityRole="radio"
        accessibilityState={{ selected: older }}
        accessibilityLabel="19 or older">
        <View style={{ paddingVertical: space(1.25), borderRadius: radius.md, borderWidth: 2.5, borderBottomWidth: 5, borderColor: older ? colors.kip : colors.line, backgroundColor: older ? colors.kipLight : colors.surface, alignItems: 'center' }}>
          <Text style={type.bodyBold}>19 or older</Text>
        </View>
      </Pressable>
      {older ? (
        <View style={{ gap: 4 }}>
          <TextInput
            testID="age-input"
            autoFocus
            value={olderText}
            onChangeText={(t) => {
              const clean = t.replace(/[^0-9]/g, '').slice(0, 2);
              setOlderText(clean);
              const n = Number(clean);
              setAge(clean !== '' && n >= 19 && n <= MAX_AGE ? n : null);
            }}
            keyboardType="number-pad"
            returnKeyType="done"
            maxLength={2}
            placeholder="Your age"
            placeholderTextColor={colors.inkMuted}
            accessibilityLabel="Your age"
            style={[type.bodyBold, { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 2, borderColor: olderText === '' || age !== null ? colors.line : colors.dash, padding: space(2), fontSize: 18 }]}
          />
          {olderText !== '' && age === null ? <Text style={[type.tiny, { color: colors.dashDark }]}>Type an age from 19 to {MAX_AGE}.</Text> : null}
        </View>
      ) : null}
      {band ? (
        // A solid pill, so the line never melts into the illustrated background.
        <View style={{ alignSelf: 'center', maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.kip, paddingHorizontal: 14, paddingVertical: 8 }}>
          <Text style={{ fontSize: 16 }} importantForAccessibility="no" accessibilityElementsHidden>
            {band === '16-19' ? '🛠️' : '🧭'}
          </Text>
          <Text style={[type.small, { color: colors.kipDark, fontWeight: '800', flexShrink: 1, textAlign: 'center' }]}>
            {band === '16-19' ? 'Builder track: real-world deep-dives on tax, KYC and products' : 'Explorer track: the big ideas, one step at a time'}
          </Text>
        </View>
      ) : null}
    </OnboardingFrame>
  );
}
