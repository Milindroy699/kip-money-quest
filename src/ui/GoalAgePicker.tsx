/**
 * "By what age?" for the dream goal: a few quick choices that fit the player's age, plus "Other age"
 * to type any age (at least a year away). Used in onboarding and in the plan.
 */
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { goalAges, isValidTargetAge, MAX_AGE } from '../content/ages';
import { colors, radius, space, type } from './theme';

export function GoalAgePicker({ age, value, onChange, testID }: { age: number; value: number; onChange: (targetAge: number) => void; testID?: string }) {
  const options = goalAges(age);
  const isCustomValue = !options.includes(value);
  const [custom, setCustom] = useState(isCustomValue);
  const [text, setText] = useState(isCustomValue ? String(value) : '');
  const typed = Number(text);
  const typedOk = text !== '' && isValidTargetAge(age, typed);

  const commit = () => {
    if (typedOk) onChange(typed);
  };

  return (
    <View style={{ gap: space(1) }} testID={testID}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(1) }}>
        {options.map((a) => {
          const on = !custom && value === a;
          return (
            <Pressable
              key={a}
              onPress={() => {
                setCustom(false);
                onChange(a);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`By age ${a}`}>
              <View style={[chip, on && chipOn]}>
                <Text style={[type.bodyBold, { color: on ? '#fff' : colors.ink }]}>{a}</Text>
              </View>
            </Pressable>
          );
        })}
        <Pressable onPress={() => setCustom(true)} accessibilityRole="radio" accessibilityState={{ selected: custom }} accessibilityLabel="Other age: type your own">
          <View style={[chip, custom && chipOn]}>
            <Text style={[type.bodyBold, { color: custom ? '#fff' : colors.ink }]}>{custom && typedOk ? `${typed} ✓` : 'Other age'}</Text>
          </View>
        </Pressable>
      </View>
      {custom ? (
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(1), backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 2, borderColor: text === '' || typedOk ? colors.line : colors.dash, paddingHorizontal: space(1.5) }}>
            <Text style={[type.bodyBold, { color: colors.inkSoft }]}>By age</Text>
            <TextInput
              testID="goal-age-input"
              autoFocus
              value={text}
              onChangeText={(t) => {
                const clean = t.replace(/[^0-9]/g, '').slice(0, 2);
                setText(clean);
                const n = Number(clean);
                if (clean !== '' && isValidTargetAge(age, n)) onChange(n);
              }}
              onEndEditing={commit}
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={2}
              placeholder={String(age + 7)}
              placeholderTextColor={colors.inkMuted}
              accessibilityLabel="Goal age"
              style={[type.title, { flex: 1, paddingVertical: space(1) }]}
            />
          </View>
          <Text style={[type.tiny, { color: text === '' || typedOk ? colors.inkSoft : colors.dashDark }]}>
            {text === '' || typedOk ? `Any age from ${age + 1} to ${MAX_AGE}.` : `Pick an age from ${age + 1} to ${MAX_AGE}: your goal needs to be ahead of you.`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const chip = { paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.surface } as const;
const chipOn = { borderColor: colors.ink, backgroundColor: colors.ink } as const;
