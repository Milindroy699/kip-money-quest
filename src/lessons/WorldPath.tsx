/** A world's lessons as a winding path of nodes (Money Town on Home uses it). */
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { isLessonUnlocked, type Track } from '@/content';
import type { LessonT, WorldT } from '@/content/schema';
import { Character } from '@/mascot/Character';
import { colors, radius, shadow, space, type } from '@/ui/theme';

export function WorldPath({ world, lessons, currentId, track }: { world: WorldT; lessons: Record<string, { accuracy: number }>; currentId?: string; track: Track }) {
  const done = world.lessons.filter((l) => lessons[l.id]).length;
  return (
    <View style={{ gap: space(1.5) }}>
      <View style={{ backgroundColor: world.color, borderRadius: radius.lg, padding: space(2), ...shadow }}>
        <Text style={[type.tiny, { color: 'rgba(255,255,255,0.85)' }]}>
          WORLD {world.index} · {done}/{world.lessons.length}
        </Text>
        <Text style={[type.title, { color: '#fff' }]}>{world.title}</Text>
        <Text style={[type.small, { color: '#fff' }]}>{world.tagline}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: space(1) }}>
          <Tag text={`Principle: ${world.principle}`} />
          <Tag text={`Products: ${world.product}`} />
          <Tag text={`Philosophy: ${world.philosophy}`} />
        </View>
      </View>
      {world.lessons.map((l, i) => (
        <LessonNode key={l.id} lesson={l} offset={Math.sin(i * 1.1) * 70} done={!!lessons[l.id]} accuracy={lessons[l.id]?.accuracy ?? 0} current={l.id === currentId} unlocked={isLessonUnlocked(l.id, lessons, track)} color={world.color} />
      ))}
    </View>
  );
}

export function Tag({ text }: { text: string }) {
  return (
    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 }}>
      <Text style={[type.tiny, { color: '#fff' }]}>{text}</Text>
    </View>
  );
}

/** Stars for a finished lesson: 3 for a perfect quiz, 2 for half or better, otherwise 1. */
export const starsFor = (accuracy: number) => (accuracy >= 1 ? 3 : accuracy >= 0.5 ? 2 : 1);

function LessonNode({ lesson, offset, done, accuracy, current, unlocked }: { lesson: LessonT; offset: number; done: boolean; accuracy: number; current: boolean; unlocked: boolean; color: string }) {
  const [pulse] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (!current) return;
    const loop = Animated.loop(Animated.sequence([Animated.timing(pulse, { toValue: 1.08, duration: 700, useNativeDriver: true }), Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true })]));
    loop.start();
    return () => loop.stop();
  }, [current, pulse]);

  const bg = done ? colors.shell : current ? colors.kip : colors.line;
  const edge = done ? colors.shellDark : current ? colors.kipDark : '#D8CBB3';
  const stars = done ? starsFor(accuracy) : 0;

  return (
    <View style={{ alignItems: 'center', transform: [{ translateX: offset }] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {current ? (
          <View style={{ position: 'absolute', left: -96 }}>
            <Character name="kip" mood="happy" size={80} />
          </View>
        ) : null}
        <Pressable
          testID={`lesson-${lesson.id}`}
          accessibilityRole="button"
          accessibilityLabel={`${lesson.title}. ${done ? 'Completed' : unlocked ? 'Start' : 'Locked'}`}
          onPress={() => (unlocked ? router.push(`/lesson/${lesson.id}`) : Alert.alert('Locked', 'Finish the previous lesson first. Slow and steady!'))}>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: edge, paddingBottom: 6 }}>
              <View style={{ flex: 1, borderRadius: 38, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 28 }}>{lesson.boss ? '👑' : done ? '✓' : unlocked ? '★' : '🔒'}</Text>
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </View>
      <Text style={[type.small, pathStyles.pill, { color: unlocked ? colors.ink : colors.inkSoft, marginTop: 6, maxWidth: 220, textAlign: 'center', fontWeight: '800' }]} numberOfLines={2}>
        {lesson.title}
      </Text>
      {done ? <Text style={[type.tiny, pathStyles.pill, { color: colors.shellDark, marginTop: 2 }]}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</Text> : null}
      {current ? <Text style={[type.tiny, pathStyles.pill, { color: colors.kipDark, marginTop: 2 }]}>START</Text> : null}
    </View>
  );
}

export const pathStyles = StyleSheet.create({
  // Text that sits directly on the painted backdrop gets a solid pill for contrast.
  pill: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, overflow: 'hidden' },
});
