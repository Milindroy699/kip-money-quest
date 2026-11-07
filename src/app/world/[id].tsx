/** A campus building: its lessons, the big idea it teaches, and the games that live there. */
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BACKGROUNDS, WORLD_BACKGROUND } from '@/art';
import { WORLD_ACTIVITIES } from '@/campus/activities';
import { spriteFor } from '@/campus/art';
import { worldStatus } from '@/campus/map';
import { skinFor } from '@/campus/skins';
import { isLessonUnlocked, nextWorldAfter, trackFor, WORLDS } from '@/content';
import { starsFor } from '@/lessons/WorldPath';
import { useGame } from '@/state/game';
import { Button, Card, ProgressBar } from '@/ui/components';
import { colors, radius, shadow, space, type } from '@/ui/theme';

export default function WorldSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const lessons = useGame((s) => s.lessons);
  const ageBand = useGame((s) => s.profile.ageBand);
  const portfolioStarted = useGame((s) => s.portfolio.lots.length > 0);
  const world = WORLDS.find((w) => w.id === id);
  if (!world) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space(3) }}>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }
  const track = trackFor(ageBand);
  const skin = skinFor(track);
  const place = skin.places[world.id];
  const status = worldStatus(world.id, lessons, track);
  const done = world.lessons.filter((l) => lessons[l.id]).length;
  const next = status === 'current' || status === 'open' ? world.lessons.find((l) => !lessons[l.id] && isLessonUnlocked(l.id, lessons, track)) : undefined;
  const prev = WORLDS.filter((w) => w.index < world.index && (track === 'builder' || w.track !== 'builder')).at(-1);
  const activities = WORLD_ACTIVITIES[world.id] ?? [];
  const nextW = nextWorldAfter(world.id, track);
  const building = spriteFor(skin.id, world.id === 'w0' ? 'gate' : world.id, status === 'locked' || status === 'builderOnly');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.cream }} contentContainerStyle={{ paddingBottom: insets.bottom + space(4) }}>
      <View style={{ height: 210, backgroundColor: world.color }}>
        <Image source={BACKGROUNDS[WORLD_BACKGROUND[world.id].key]} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(20,24,40,0.35)' }]} />
        {/* The building itself, as it stands on the map (under construction while closed). */}
        {building ? <Image source={building.src} style={{ position: 'absolute', right: space(1), bottom: space(1), width: 150, height: 150 / building.aspect, maxHeight: 165 }} contentFit="contain" accessible={false} /> : null}
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} style={{ position: 'absolute', top: space(2), right: space(2), width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: colors.ink }}>✕</Text>
        </Pressable>
        <View style={{ position: 'absolute', left: space(2.5), right: building ? 160 : space(2.5), bottom: space(2) }}>
          <Text style={[type.tiny, { color: 'rgba(255,255,255,0.9)' }]}>
            {place.emoji} {place.name.toUpperCase()} · WORLD {world.index}
          </Text>
          <Text style={[type.title, { color: '#fff' }]}>{world.title}</Text>
          <Text style={[type.small, { color: '#fff' }]}>{world.tagline}</Text>
        </View>
      </View>

      <View style={{ padding: space(2.5), gap: space(2) }}>
        {status === 'builderOnly' ? (
          <Card style={{ gap: 8, borderColor: colors.melt }}>
            <Text style={type.bodyBold}>Builder track (16+)</Text>
            <Text style={type.small}>Deeper lessons on {world.principle.toLowerCase()}. You can switch tracks in You any time.</Text>
            <Button title="Switch track in You" variant="secondary" onPress={() => router.dismissTo('/you')} />
          </Card>
        ) : status === 'locked' ? (
          <Card style={{ gap: 6 }}>
            <Text style={type.bodyBold}>🔒 Opens after {prev ? `${skin.places[prev.id]?.name ?? prev.title} (${prev.title})` : 'the previous world'}</Text>
            <Text style={type.small}>Kip’s path goes one building at a time. Here’s what you’ll learn.</Text>
          </Card>
        ) : null}

        <View style={{ gap: 6 }}>
          <Idea label="Principle" text={world.principle} />
          <Idea label="Real products" text={world.product} />
          <Idea label="Philosophy" text={world.philosophy} />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={type.small}>
            {done} of {world.lessons.length} lessons
          </Text>
          <ProgressBar value={done / world.lessons.length} color={world.color} />
        </View>
        {next ? <Button testID="world-continue" title={`${done ? 'Continue' : 'Start'}: ${next.title}`} onPress={() => router.push(`/lesson/${next.id}`)} /> : null}

        <View style={{ gap: space(1) }}>
          {world.lessons.map((l, i) => {
            const isDone = !!lessons[l.id];
            const open = isLessonUnlocked(l.id, lessons, track) && status !== 'builderOnly';
            const isNext = next?.id === l.id;
            return (
              <Pressable
                key={l.id}
                testID={`lesson-${l.id}`}
                onPress={() => (open ? router.push(`/lesson/${l.id}`) : Alert.alert('Locked', 'Finish the lessons before it first. Slow and steady!'))}
                accessibilityRole="button"
                accessibilityLabel={`Lesson ${i + 1}: ${l.title}. ${isDone ? 'Completed' : open ? 'Start' : 'Locked'}`}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5), backgroundColor: colors.surface, borderRadius: radius.md, padding: space(1.5), borderWidth: isNext ? 2.5 : 1.5, borderColor: isNext ? colors.kip : colors.line, opacity: open ? 1 : 0.6 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDone ? colors.shell : isNext ? colors.kip : colors.line, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: isNext ? '#fff' : colors.ink }}>{l.boss ? '👑' : isDone ? '✓' : open ? '★' : '🔒'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={type.tiny}>{l.boss ? 'BOSS' : `LESSON ${i + 1}`}</Text>
                    <Text style={type.bodyBold} numberOfLines={2}>
                      {l.title}
                    </Text>
                  </View>
                  {isDone ? <Text style={[type.small, { color: colors.shellDark }]}>{'★'.repeat(starsFor(lessons[l.id].accuracy))}</Text> : isNext ? <Text style={[type.small, { color: colors.kipDark, fontWeight: '800' }]}>START</Text> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {status === 'done' ? (
          // A finished world: move on to the next building, or back to the map.
          <View style={{ backgroundColor: colors.kipLight, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.kip, padding: space(2), gap: space(1) }}>
            <Text style={[type.bodyBold, { color: colors.kipDark }]}>★ {place?.name ?? world.title} complete!</Text>
            {nextW ? (
              <>
                <Text style={type.small}>
                  Next up: {skin.places[nextW.id]?.name ?? nextW.title} ({nextW.title}).
                </Text>
                <Button testID="world-next" title={`On to ${skin.places[nextW.id]?.name ?? nextW.title} ›`} onPress={() => router.replace(`/world/${nextW.id}`)} />
              </>
            ) : (
              <Text style={type.small}>That was the last world. Your Launch Plan is ready.</Text>
            )}
            <Button title="Back to the map" variant="secondary" onPress={() => router.dismissTo('/campus')} />
          </View>
        ) : null}

        {activities.length ? (
          <View style={{ gap: space(1) }}>
            <Text style={type.h2}>Also in {place.name}</Text>
            {activities.map((a) => {
              const open = status !== 'builderOnly' && a.unlocked(lessons, { portfolioStarted });
              return (
                <Pressable key={a.key} testID={`activity-${a.key}`} onPress={() => (open ? router.push(a.href) : Alert.alert(a.title, a.lockedText))} accessibilityRole="button" accessibilityLabel={`${a.title}. ${open ? a.text : a.lockedText}`}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5), backgroundColor: open ? colors.ink : colors.surface, borderRadius: radius.md, padding: space(1.5), borderWidth: open ? 0 : 1.5, borderColor: colors.line, ...(open ? shadow : {}) }}>
                    <Text style={{ fontSize: 26, opacity: open ? 1 : 0.5 }}>{a.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[type.bodyBold, { color: open ? '#fff' : colors.inkSoft }]}>{a.title}</Text>
                      <Text style={[type.small, { color: open ? '#C9D1DE' : colors.inkMuted }]}>{open ? a.text : `🔒 ${a.lockedText}`}</Text>
                    </View>
                    {open ? <Text style={[type.h2, { color: colors.coin }]}>▶</Text> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Idea({ label, text }: { label: string; text: string }) {
  return (
    <Text style={type.small}>
      <Text style={{ fontWeight: '800', color: colors.ink }}>{label}: </Text>
      {text}
    </Text>
  );
}
