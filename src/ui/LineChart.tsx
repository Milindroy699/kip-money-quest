/**
 * Small Skia line chart for lesson widgets.
 * - Thin 2.5px lines, recessive grid, one y-axis.
 * - Series are drawn up to the selected x (driven by a slider), so growth animates as you drag.
 * - A crosshair at the selected x with direct value labels in ink text (never colour alone),
 *   plus a legend for 2+ series.
 */
import { Canvas, Circle, Line, Path, Skia, vec } from '@shopify/react-native-skia';
import { useMemo, useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';

import { colors, type } from './theme';

export interface ChartSeries {
  id: string;
  label: string;
  color: string;
  points: { x: number; y: number }[];
  /** Fill the band between this series and `bandTo` (e.g. The Melt eating Dash's cash). */
  bandTo?: { x: number; y: number }[];
  bandColor?: string;
  hideMarker?: boolean;
}

const PAD = { left: 8, right: 8, top: 12, bottom: 22 };

export function LineChart({
  series,
  selectedX,
  xMax,
  height = 210,
  formatY,
  formatX,
  yRange,
}: {
  series: ChartSeries[];
  selectedX: number;
  xMax: number;
  height?: number;
  formatY: (v: number) => string;
  formatX: (v: number) => string;
  /** Fixed y-axis range; by default it runs from 0 (or the lowest negative value) to the highest. */
  yRange?: [number, number];
}) {
  const [width, setWidth] = useState(0);
  const [yMin, yMax] = useMemo(() => {
    if (yRange) return yRange;
    const ys = series.flatMap((s) => s.points.map((p) => p.y));
    return [Math.min(0, ...ys) * 1.08, Math.max(1, ...ys) * 1.08];
  }, [series, yRange]);
  const sx = (x: number) => PAD.left + (x / xMax) * (width - PAD.left - PAD.right);
  const sy = (y: number) => PAD.top + (1 - (y - yMin) / (yMax - yMin)) * (height - PAD.top - PAD.bottom);
  const floor = sy(Math.max(yMin, Math.min(0, yMax)));

  const visible = (pts: { x: number; y: number }[]) => pts.filter((p) => p.x <= selectedX + 1e-9);

  const paths = useMemo(() => {
    if (!width) return [];
    return series.map((s) => {
      const pts = visible(s.points);
      const line = Skia.PathBuilder.Make();
      pts.forEach((p, i) => (i === 0 ? line.moveTo(sx(p.x), sy(p.y)) : line.lineTo(sx(p.x), sy(p.y))));
      let band: ReturnType<typeof Skia.Path.Make> | null = null;
      if (s.bandTo && pts.length > 1) {
        const lower = visible(s.bandTo);
        const b = Skia.PathBuilder.Make();
        pts.forEach((p, i) => (i === 0 ? b.moveTo(sx(p.x), sy(p.y)) : b.lineTo(sx(p.x), sy(p.y))));
        [...lower].reverse().forEach((p) => b.lineTo(sx(p.x), sy(p.y)));
        b.close();
        band = b.detach();
      }
      return { id: s.id, line: line.detach(), band, color: s.color, bandColor: s.bandColor };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, width, selectedX, yMin, yMax]);

  const valueAt = (pts: { x: number; y: number }[]) => {
    const vis = visible(pts);
    return vis[vis.length - 1];
  };

  return (
    <View>
      {series.length > 1 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 }} accessibilityRole="text">
          {series.map((s) => (
            <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 14, height: 4, borderRadius: 2, backgroundColor: s.color }} />
              <Text style={type.tiny}>{s.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} style={{ height }}>
        {width > 0 ? (
          <Canvas style={{ width, height }}>
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <Line key={f} p1={vec(PAD.left, sy(yMin + (yMax - yMin) * f))} p2={vec(width - PAD.right, sy(yMin + (yMax - yMin) * f))} color={colors.line} strokeWidth={1} />
            ))}
            <Line p1={vec(PAD.left, floor)} p2={vec(width - PAD.right, floor)} color={colors.inkMuted} strokeWidth={1.5} />
            {paths.map((p) => (p.band ? <Path key={`${p.id}-band`} path={p.band} color={p.bandColor ?? p.color} opacity={0.28} /> : null))}
            {paths.map((p) => (
              <Path key={p.id} path={p.line} color={p.color} style="stroke" strokeWidth={2.5} strokeJoin="round" strokeCap="round" />
            ))}
            <Line p1={vec(sx(selectedX), PAD.top)} p2={vec(sx(selectedX), height - PAD.bottom)} color={colors.inkMuted} strokeWidth={1} opacity={0.6} />
            {series.map((s) => {
              const p = valueAt(s.points);
              if (!p || s.hideMarker) return null;
              return [
                <Circle key={`${s.id}-dot`} cx={sx(p.x)} cy={sy(p.y)} r={6} color={s.color} />,
                <Circle key={`${s.id}-ring`} cx={sx(p.x)} cy={sy(p.y)} r={6} color={colors.surface} style="stroke" strokeWidth={2} />,
              ];
            })}
          </Canvas>
        ) : null}
        {/* Direct labels in ink beside each marker. Labels that would overlap are pushed apart
            vertically, highest value on top, so two values never print over each other. */}
        {width > 0
          ? spreadLabels(
              series
                .map((s) => ({ s, p: valueAt(s.points) }))
                .filter((x): x is { s: ChartSeries; p: { x: number; y: number } } => !!x.p && !x.s.hideMarker)
                .map(({ s, p }) => ({ id: s.id, text: formatY(p.y), left: sx(p.x), top: Math.max(sy(p.y) - 22, 0), y: p.y })),
              18,
            ).map((l) => {
              const alignRight = l.left > width * 0.55;
              return (
                <Text
                  key={`${l.id}-label`}
                  style={[
                    type.tiny,
                    {
                      position: 'absolute',
                      top: l.top,
                      color: colors.ink,
                      fontWeight: '800',
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      paddingHorizontal: 4,
                      borderRadius: 4,
                      overflow: 'hidden',
                      ...(alignRight ? { right: width - l.left + 8 } : { left: l.left + 8 }),
                    },
                  ]}>
                  {l.text}
                </Text>
              );
            })
          : null}
        <Text style={[type.tiny, { position: 'absolute', bottom: 0, left: PAD.left }]}>{formatX(0)}</Text>
        <Text style={[type.tiny, { position: 'absolute', bottom: 0, right: PAD.right }]}>{formatX(xMax)}</Text>
      </View>
    </View>
  );
}

/** Pushes overlapping labels apart: sorted by value (highest on top), each at least `gap` below the one above. */
export function spreadLabels<T extends { top: number; y: number }>(labels: T[], gap: number): T[] {
  const sorted = [...labels].sort((a, b) => b.y - a.y);
  let floor = -Infinity;
  return sorted.map((l) => {
    const top = Math.max(l.top, floor);
    floor = top + gap;
    return { ...l, top };
  });
}

