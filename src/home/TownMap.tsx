/**
 * A slice of the campus map for Home's world card, drawn exactly like the map behind the hero
 * button (same lawn and path tiles, road edge, trees and 3D buildings, and Kip's idle clip):
 * the world's lessons are stops on a road that leads to the world's building, with Kip standing
 * at the lesson you're on.
 */
import { BlurMask, Canvas, Oval, Path, Rect, rect, Skia, ImageShader, useImage, type SkImage } from '@shopify/react-native-skia';
import { Image } from 'expo-image';
import { router, useIsFocused } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { ANIMS, type SpriteAnimation } from '../art/anims';
import { decoList, spriteFor } from '../campus/art';
import type { Skin } from '../campus/skins';
import { GROUND_TILES } from '../campus/sprites';
import { isLessonUnlocked, type Track } from '../content';
import type { LessonT } from '../content/schema';
import { starsFor } from '../lessons/WorldPath';
import { AnimatedSprite } from '../mascot/Character';
import { colors, shadow, type } from '../ui/theme';

export const TOWN_MAP_H = 196;
const KIP_H = 64;
const KIP_STILL: SpriteAnimation = { ...ANIMS.kipMapIdle, loop: false, frames: [ANIMS.kipMapIdle.frames[0]] };

type Pt = { x: number; y: number };
/** The road: one curve from the bottom-left edge up to the world's building on the right. */
const ROAD: [Pt, Pt, Pt, Pt] = [
  { x: 0.0, y: 0.9 },
  { x: 0.34, y: 0.98 },
  { x: 0.4, y: 0.34 },
  { x: 0.7, y: 0.56 },
];
/** Where the first and last lesson stops sit on the road (curve parameter). */
const FIRST_STOP = 0.26;
const LAST_STOP = 0.93;
const bez = (t: number): Pt => {
  const u = 1 - t;
  const [a, b, c, d] = ROAD;
  return { x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x, y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y };
};
/** Scenery, as fractions of the map: [deco index (0–2 trees, 3–5 props), x, bottom y, width]. */
const SCENERY: [number, number, number, number][] = [
  [0, 0.08, 0.36, 0.17],
  [1, 0.5, 0.26, 0.15],
  [2, 0.98, 1.06, 0.24],
  [3, 0.27, 0.48, 0.05],
  [5, 0.52, 0.98, 0.12],
];

export function TownMap({ worldId, lessons: worldLessons, done, currentId, track, skin }: { worldId: string; lessons: LessonT[]; done: Record<string, { accuracy: number }>; currentId: string; track: Track; skin: Skin }) {
  const [W, setW] = useState(0);
  const H = TOWN_MAP_H;
  const focused = useIsFocused();
  const reduce = useReducedMotion();
  const island = skin.id === 'island';
  const ground = useImage(island ? GROUND_TILES.islandGrass : GROUND_TILES.campusLawn);
  const paving = useImage(island ? GROUND_TILES.islandSand : GROUND_TILES.campusPath);
  const deco = decoList(skin.id);
  const building = spriteFor(skin.id, worldId === 'w0' ? 'gate' : worldId);

  const road = useMemo(() => {
    const [a, b, c, d] = ROAD;
    return Skia.PathBuilder.Make().moveTo(a.x * W, a.y * H).cubicTo(b.x * W, b.y * H, c.x * W, c.y * H, d.x * W, d.y * H).build();
  }, [W, H]);

  const n = worldLessons.length;
  const stops = worldLessons.map((l, i) => ({ lesson: l, at: bez(FIRST_STOP + ((LAST_STOP - FIRST_STOP) * i) / Math.max(n - 1, 1)) }));
  const current = stops.find((s) => s.lesson.id === currentId);
  const stopSize = n <= 6 ? 30 : 24;
  const bw = 0.34 * W;
  const bh = building ? bw / building.aspect : 0;

  return (
    <View style={{ height: H, borderRadius: 20, overflow: 'hidden', backgroundColor: skin.ground.bottom }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {W > 0 ? (
        <>
          {/* Remounted once the tiles are in: a shader added to a mounted canvas doesn't draw (same as CampusMap). */}
          <Canvas key={ground && paving ? 'art' : 'plain'} style={{ position: 'absolute', width: W, height: H }} pointerEvents="none">
            <Rect x={0} y={0} width={W} height={H} color={skin.ground.top} />
            {ground ? <TiledRect image={ground} W={W} H={H} size={island ? 0.62 * W : 0.42 * W} /> : null}
            {/* A soft shadow under the building, then the road: an edge, then the paving. */}
            <Oval x={0.83 * W - bw * 0.46} y={0.8 * H - bw * 0.2} width={bw * 0.92} height={bw * 0.28} color="rgba(30,42,58,0.22)">
              <BlurMask blur={8} style="normal" />
            </Oval>
            <Path path={road} style="stroke" strokeWidth={36} strokeCap="round" color={skin.road.edge} />
            <Path path={road} style="stroke" strokeWidth={29} strokeCap="round" color={skin.road.fill}>
              {paving ? <ImageShader image={paving} tx="repeat" ty="repeat" fit="fill" rect={rect(0, 0, 0.16 * W, 0.16 * W)} /> : null}
            </Path>
            {SCENERY.map(([, x, y, w], i) => (
              <Oval key={i} x={x * W - w * W * 0.42} y={y * H - w * W * 0.12} width={w * W * 0.84} height={w * W * 0.22} color="rgba(30,42,58,0.16)">
                <BlurMask blur={4} style="normal" />
              </Oval>
            ))}
          </Canvas>

          {SCENERY.map(([k, x, y, w], i) => {
            const d = deco[k];
            if (!d) return null;
            const dw = w * W;
            const dh = dw / d.sprite.aspect;
            return <Image key={i} source={d.sprite.src} style={{ position: 'absolute', left: x * W - dw / 2, top: y * H - dh, width: dw, height: dh }} contentFit="contain" accessible={false} />;
          })}
          {building ? <Image source={building.src} style={{ position: 'absolute', left: 0.83 * W - bw / 2, top: 0.82 * H - bh, width: bw, height: bh }} contentFit="contain" accessible={false} /> : null}

          {stops.map(({ lesson: l, at }, i) => {
            const isDone = !!done[l.id];
            const isCurrent = l.id === currentId;
            const open = isDone || isCurrent || isLessonUnlocked(l.id, done, track);
            return (
              <Pressable
                key={l.id}
                testID={`stop-${l.id}`}
                disabled={!open}
                onPress={() => router.push(`/lesson/${l.id}`)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Lesson ${i + 1}: ${l.title}${isDone ? ', done' : isCurrent ? ', you are here' : open ? '' : ', locked'}`}
                style={{ position: 'absolute', left: at.x * W - stopSize / 2, top: at.y * H - stopSize / 2, width: stopSize, height: stopSize }}>
                <Stop size={stopSize} done={isDone} current={isCurrent} locked={!open} index={i} stars={isDone ? starsFor(done[l.id].accuracy) : 0} />
              </Pressable>
            );
          })}

          {/* Kip waits at the lesson you're on. */}
          {current ? (
            <View pointerEvents="none" style={{ position: 'absolute', left: current.at.x * W - (KIP_H * ANIMS.kipMapIdle.aspect) / 2, top: current.at.y * H - KIP_H + 4 }}>
              <AnimatedSprite anim={focused && !reduce ? ANIMS.kipMapIdle : KIP_STILL} width={KIP_H * ANIMS.kipMapIdle.aspect} height={KIP_H} label="Kip, at your next lesson" />
            </View>
          ) : null}
          {current ? (
            <View pointerEvents="none" style={{ position: 'absolute', left: Math.max(current.at.x * W - 60, 4), top: current.at.y * H - KIP_H - 18, width: 120, alignItems: current.at.x * W - 60 < 4 ? 'flex-start' : 'center' }}>
              <View style={{ backgroundColor: colors.ink, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={[type.tiny, { color: '#fff', fontWeight: '800', fontSize: 10, letterSpacing: 0.5 }]} numberOfLines={1}>
                  YOU ARE HERE
                </Text>
              </View>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

function TiledRect({ image, W, H, size }: { image: SkImage; W: number; H: number; size: number }) {
  return (
    <Rect x={0} y={0} width={W} height={H}>
      <ImageShader image={image} tx="repeat" ty="repeat" fit="fill" rect={rect(0, 0, size, size)} />
    </Rect>
  );
}

/** A lesson stop on the road: done (gold, with stars), here (green ring under Kip), open (numbered) or locked. */
function Stop({ size, done, current, locked, index, stars }: { size: number; done: boolean; current: boolean; locked: boolean; index: number; stars: number }) {
  const bg = done ? colors.shell : current ? colors.kip : locked ? '#E7DDCB' : '#fff';
  const edge = done ? colors.shellDark : current ? '#fff' : locked ? '#C9BBA2' : colors.kip;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, borderWidth: 3, borderColor: edge, alignItems: 'center', justifyContent: 'center', ...shadow }}>
      {current ? null : <Text style={{ fontSize: size * 0.42, color: done ? '#fff' : locked ? colors.inkMuted : colors.kipDark, fontWeight: '900' }}>{done ? '✓' : locked ? '🔒' : index + 1}</Text>}
      {stars > 0 ? <Text style={{ position: 'absolute', bottom: -11, fontSize: 9, color: colors.shellDark, textShadowColor: '#fff', textShadowRadius: 2 }}>{'★'.repeat(stars)}</Text> : null}
    </View>
  );
}
