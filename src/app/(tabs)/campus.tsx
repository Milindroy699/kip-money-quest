/**
 * The hero tab: Worlds 1–9 as a campus (Builder) or an island (Explorer) that Kip walks around.
 * Games and rewards live on the map as spots that open as the player learns.
 */
import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import { router, useFocusEffect, useIsFocused, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Pressable, Text, useWindowDimensions, View, type ScrollViewInstance } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CampusMap, walkDuration } from '@/campus/CampusMap';
import { doorOf, kipHome, newSpots, placeById, SPOT_HREF, SPOT_IDS, spotState, walkPath, WORLD_IDS, worldStatus, type Place, type Pt, type SpotContext, type SpotId } from '@/campus/map';
import { useCampusSeen } from '@/campus/seen';
import { skinFor } from '@/campus/skins';
import { pathFor, trackFor, WORLDS } from '@/content';
import { dueReviews } from '@/engagement/review';
import { canClaimDividend } from '@/engagement/rewards';
import { useGame } from '@/state/game';
import { GoalChip } from '@/ui/GoalChip';
import { colors, shadow, space, type } from '@/ui/theme';

export default function Campus() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const params = useLocalSearchParams<{ focus?: string }>();
  const lessons = useGame((s) => s.lessons);
  const ageBand = useGame((s) => s.profile.ageBand);
  const today = useGame((s) => s.today());
  const lastDividendDay = useGame((s) => s.lastDividendDay);
  const portfolioStarted = useGame((s) => s.portfolio.lots.length > 0);
  const seen = useCampusSeen((s) => s.seen);
  const markSeen = useCampusSeen((s) => s.markSeen);
  const walked = useCampusSeen((s) => s.walked);
  const markWalked = useCampusSeen((s) => s.markWalked);
  // The tab stays mounted when you leave it: animations pause, and a walk that finishes while
  // you're elsewhere doesn't open its building on top of another tab.
  const focused = useIsFocused();
  const focusedRef = useRef(focused);
  useEffect(() => {
    focusedRef.current = focused;
  }, [focused]);

  const track = trackFor(ageBand);
  const skin = skinFor(track);
  const home = kipHome(lessons, track);
  const reviewsDue = dueReviews(lessons, today).length;
  const ctx: SpotContext = { completed: lessons, reviewsDue, dividendReady: canClaimDividend(lastDividendDay, today), dividendClaimedBefore: lastDividendDay !== null, portfolioStarted };
  const fresh = newSpots(ctx, seen);
  const spots = Object.fromEntries(SPOT_IDS.map((id) => [id, { ...spotState(id, ctx), isNew: fresh.includes(id) }])) as Record<SpotId, ReturnType<typeof spotState> & { isNew: boolean }>;
  // World 0 (Money Town) lives at the gate, so the map and Home agree on where you start.
  const mapWorlds = ['w0', ...WORLD_IDS];
  const statuses = Object.fromEntries(mapWorlds.map((id) => [id, worldStatus(id, lessons, track)]));
  const progress = Object.fromEntries(
    mapWorlds.map((id) => {
      const w = WORLDS.find((x) => x.id === id)!;
      return [id, { done: w.lessons.filter((l) => lessons[l.id]).length, total: w.lessons.length, next: w.lessons.find((l) => !lessons[l.id])?.title }];
    }),
  );
  const path = pathFor(track);
  const doneCount = path.filter((l) => lessons[l.id]).length;

  // Kip: where he stands, and the walk in progress (if any).
  const [kip, setKip] = useState<{ at: string; walk: { pts: Pt[]; durationMs: number } | null }>({ at: home, walk: null });
  const [arrivedHome, setArrivedHome] = useState(home);
  const [walkProgress] = useState(() => new Animated.Value(0));
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [viewport, setViewport] = useState(640);
  const centred = useRef(false);

  const centreOn = useCallback(
    (y: number, animated = true) => scrollRef.current?.scrollTo({ y: Math.max(0, y * width - viewport * 0.55), animated }),
    [width, viewport],
  );

  const walkTo = useCallback(
    (to: string, then?: () => void) => {
      if (kip.walk) return;
      const pts = walkPath(kip.at, to);
      if (to === kip.at || reduceMotion || pts.length < 2) {
        setKip({ at: to, walk: null });
        then?.();
        return;
      }
      walkProgress.setValue(0);
      const durationMs = walkDuration(pts);
      setKip({ at: kip.at, walk: { pts, durationMs } });
      centreOn(doorOf(placeById(to)!).y);
      // walkEase in @/campus/walk mirrors this easing, so Kip's turns can be timed from it.
      Animated.timing(walkProgress, { toValue: 1, duration: durationMs, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start(() => {
        setKip({ at: to, walk: null });
        if (focusedRef.current) then?.();
      });
    },
    [kip, reduceMotion, walkProgress, centreOn],
  );

  // After a lesson finishes a world, Kip walks on to the next building when you come back.
  useFocusEffect(
    useCallback(() => {
      if (home === arrivedHome) return;
      const id = setTimeout(() => {
        setArrivedHome(home);
        walkTo(home);
      }, 450);
      return () => clearTimeout(id);
    }, [home, arrivedHome, walkTo]),
  );

  // "New on campus" from Home: scroll to that spot.
  useEffect(() => {
    const p = params.focus ? placeById(params.focus) : undefined;
    if (p) centreOn(p.y);
  }, [params.focus, centreOn]);

  function onPressPlace(p: Place) {
    if (kip.walk) return;
    if (p.kind === 'spot') {
      const id = p.id as SpotId;
      const st = spots[id];
      const copy = skin.spots[id];
      if (!st.unlocked) {
        Alert.alert(`${copy.emoji} ${copy.name}`, st.lockedText);
        return;
      }
      markSeen(id);
      if (params.focus === id) router.setParams({ focus: undefined });
      if (id === 'arena') {
        Alert.alert(`${copy.emoji} ${copy.name}`, copy.blurb, [
          { text: 'Duel Dash', onPress: () => router.push(SPOT_HREF.arena) },
          { text: 'Duel a friend', onPress: () => router.navigate('/league') },
          { text: 'Not now', style: 'cancel' },
        ]);
        return;
      }
      router.push(SPOT_HREF[id]);
      return;
    }
    const worldId = p.kind === 'gate' ? 'w0' : p.id;
    const status = statuses[worldId];
    if (status === 'locked' || status === 'builderOnly') {
      router.push(`/world/${worldId}`);
      return;
    }
    markWalked();
    walkTo(p.id, () => router.push(`/world/${worldId}`));
  }

  const nextWorld = WORLDS.find((w) => w.id === (home === 'gate' ? 'w0' : home));
  return (
    <View style={{ flex: 1, backgroundColor: skin.ground.edge ?? skin.ground.bottom }}>
      <CampusMap
        width={width}
        skin={skin}
        track={track}
        worldStatus={statuses}
        worldProgress={progress}
        spots={spots}
        kipAt={kip.at}
        walk={kip.walk}
        walkProgress={walkProgress}
        active={focused}
        highlight={params.focus}
        onPressPlace={onPressPlace}
        scrollRef={scrollRef}
        onViewport={setViewport}
        onReady={() => {
          if (centred.current) return;
          centred.current = true;
          centreOn(doorOf(placeById(kip.at)!).y, false);
        }}
      />
      {/* A soft fade under the status bar and title card, so map labels don't collide with the clock. */}
      <Canvas pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 96 }}>
        <Rect x={0} y={0} width={width} height={insets.top + 96}>
          <LinearGradient start={vec(0, 0)} end={vec(0, insets.top + 96)} positions={[0, 0.45, 1]} colors={['rgba(255,248,236,0.96)', 'rgba(255,248,236,0.7)', 'rgba(255,248,236,0)']} />
        </Rect>
      </Canvas>
      {/* Title card over the map. */}
      <View pointerEvents="box-none" style={{ position: 'absolute', top: insets.top + space(1), left: space(2), right: space(2), flexDirection: 'row', alignItems: 'center', gap: space(1) }}>
        <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: space(2), paddingVertical: space(1), ...shadow }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(1) }}>
            <Text style={[type.h2, { fontSize: 18, flexShrink: 0 }]}>{skin.title}</Text>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <GoalChip />
            </View>
          </View>
          <Text style={type.tiny} numberOfLines={1}>
            {nextWorld && doneCount === 0
              ? `Start at ${skin.places[nextWorld.id]?.name ?? nextWorld.title}`
              : nextWorld
                ? `${doneCount}/${path.length} lessons · next: ${skin.places[nextWorld.id]?.name ?? nextWorld.title}`
                : `${doneCount}/${path.length} lessons`}
          </Text>
        </View>
        <Pressable
          testID="find-kip"
          onPress={() => centreOn(doorOf(placeById(kip.at)!).y)}
          accessibilityRole="button"
          accessibilityLabel="Find Kip on the map"
          style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow }}>
          <Text style={{ fontSize: 22 }}>📍</Text>
        </Pressable>
      </View>
      {/* First-visit hint under the title card; gone once you've walked Kip somewhere. */}
      {!walked ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 84, alignSelf: 'center' }}>
          <Text style={[type.small, { color: colors.ink, fontWeight: '800', backgroundColor: colors.kipLight, borderColor: colors.kip, borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, overflow: 'hidden' }]}>
            {home === 'gate' ? `👇 Start here: tap ${skin.gate.name}` : 'Tap a building and Kip walks there'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
