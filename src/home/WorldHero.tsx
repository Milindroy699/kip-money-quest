/**
 * Home's hero: the world you're in, drawn as a slice of the campus map behind the hero button
 * (same ground, road, trees and buildings, and Kip waiting at your lesson), with one big button
 * for the next lesson. In Money Town this is the whole world (so Home doesn't repeat it lower
 * down); later worlds also offer the full map.
 */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { KIP } from '../art';
import { skinFor } from '../campus/skins';
import { getWorldOfLesson, type Track } from '../content';
import type { LessonT } from '../content/schema';
import { Button } from '../ui/components';
import { colors, radius, shadow, space, type } from '../ui/theme';
import { TownMap } from './TownMap';

export function WorldHero({ lesson, lessons, track }: { lesson: LessonT; lessons: Record<string, { accuracy: number }>; track: Track }) {
  const world = getWorldOfLesson(lesson.id)!;
  const skin = skinFor(track);
  const place = skin.places[world.id];
  const inTown = world.id === 'w0';
  const index = world.lessons.findIndex((l) => l.id === lesson.id);
  const done = world.lessons.filter((l) => lessons[l.id]).length;
  const open = () => router.push(`/lesson/${lesson.id}`);

  return (
    <View style={styles.card} testID="world-hero">
      <View style={{ padding: space(2), paddingBottom: space(1.5), gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space(1) }}>
          <View style={[styles.tag, { backgroundColor: inTown ? colors.kip : world.color }]}>
            <Text style={styles.tagText}>{inTown ? '👉 START HERE' : 'UP NEXT'} · WORLD {world.index}</Text>
          </View>
          <Text style={[type.tiny, { color: colors.inkSoft, fontWeight: '800' }]}>
            {done}/{world.lessons.length} done
          </Text>
        </View>
        <Text style={[type.title, { marginTop: 4 }]} numberOfLines={1} adjustsFontSizeToFit>
          {place?.emoji} {place?.name ?? world.title}
        </Text>
        <Text style={type.small} numberOfLines={2}>
          {world.tagline}
        </Text>
      </View>

      <View style={{ paddingHorizontal: space(1.5) }}>
        <TownMap worldId={world.id} lessons={world.lessons} done={lessons} currentId={lesson.id} track={track} skin={skin} />
      </View>

      <View style={{ padding: space(2), paddingTop: space(1.5), gap: space(1.5) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5) }}>
          <Image source={KIP.happy} style={{ width: 48, height: 48 }} contentFit="contain" accessible={false} />
          <View style={{ flex: 1 }}>
            <Text style={[type.tiny, { color: colors.kipDark }]}>LESSON {index + 1} OF {world.lessons.length} · 3–5 MIN</Text>
            <Text style={type.bodyBold} numberOfLines={2}>
              {lesson.boss ? '👑 ' : ''}
              {lesson.title}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: space(1) }}>
          <View style={{ flex: 2 }}>
            <Button testID="home-continue" title={done || index > 0 ? 'Continue ▶' : 'Start ▶'} onPress={open} />
          </View>
          {inTown ? null : (
            <View style={{ flex: 1 }}>
              <Button title="Map" variant="secondary" onPress={() => router.navigate('/campus')} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.96)', borderWidth: 2, borderColor: '#fff', ...shadow },
  tag: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { ...type.tiny, color: '#fff', fontWeight: '900', letterSpacing: 0.8 },
});
