/**
 * A thick, game-like slider. The drag runs on the UI thread (Gesture Handler + Reanimated), so the
 * thumb follows the finger smoothly on Android too, and a horizontal drag wins over the page's
 * vertical scroll. The thumb glides freely while you drag and settles on the nearest step when you
 * let go; the value (and the chart it drives) updates at each step. Tap anywhere on the track to jump.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, useExclusiveGestures, usePanGesture, useTapGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { colors, type } from './theme';

const THUMB = 34;

export function Slider({
  min,
  max,
  value,
  step = 1,
  onChange,
  label,
  color = colors.kip,
  accessibilityLabel,
  testID,
}: {
  min: number;
  max: number;
  value: number;
  step?: number;
  onChange: (v: number) => void;
  label?: string;
  color?: string;
  accessibilityLabel?: string;
  testID?: string;
}) {
  const [width, setWidth] = useState(0);
  const track = useSharedValue(0); // usable track width (minus the thumb)
  const x = useSharedValue(0); // thumb's left edge, in points
  const last = useSharedValue(value);
  const dragging = useSharedValue(false);
  const lastEmitted = useRef(value);

  // Follow the value when it changes from outside (or on first layout), unless a drag is in progress.
  useEffect(() => {
    last.set(value);
    if (!dragging.get()) x.set(withTiming(((value - min) / (max - min)) * Math.max(width - THUMB, 0), { duration: 120 }));
  }, [value, min, max, width, x, last, dragging]);

  const emit = (v: number) => {
    if (v === lastEmitted.current) return;
    lastEmitted.current = v;
    Haptics.selectionAsync().catch(() => {});
    onChange(v);
  };

  const moveTo = (px: number) => {
    'worklet';
    const w = Math.max(track.get(), 1);
    const pos = Math.min(Math.max(px - THUMB / 2, 0), w);
    x.set(pos);
    const v = Math.round((min + (pos / w) * (max - min)) / step) * step;
    if (v !== last.get()) {
      last.set(v);
      scheduleOnRN(emit, v);
    }
  };
  const settle = () => {
    'worklet';
    dragging.set(false);
    x.set(withTiming(((last.get() - min) / (max - min)) * track.get(), { duration: 140 }));
  };

  const pan = usePanGesture({
    activeOffsetX: [-4, 4],
    failOffsetY: [-14, 14],
    onActivate: (e) => {
      'worklet';
      dragging.set(true);
      moveTo(e.x);
    },
    onUpdate: (e) => {
      'worklet';
      moveTo(e.x);
    },
    onFinalize: () => {
      'worklet';
      settle();
    },
  });
  const tap = useTapGesture({
    onActivate: (e) => {
      'worklet';
      moveTo(e.x);
      settle();
    },
  });
  const gesture = useExclusiveGestures(pan, tap);

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: x.get() + THUMB / 2 }));

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityValue={{ min, max, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => onChange(Math.min(Math.max(value + (e.nativeEvent.actionName === 'increment' ? step : -step), min), max))}>
      {label ? <Text style={[type.bodyBold, { textAlign: 'center', marginBottom: 10 }]}>{label}</Text> : null}
      <GestureDetector gesture={gesture}>
        <View
          collapsable={false}
          onLayout={(e: LayoutChangeEvent) => {
            const w = e.nativeEvent.layout.width;
            track.set(Math.max(w - THUMB, 0));
            setWidth(w);
          }}
          style={{ height: THUMB + 12, justifyContent: 'center' }}>
          <View style={{ height: 14, borderRadius: 7, backgroundColor: colors.line }} />
          <Animated.View style={[{ position: 'absolute', left: 0, height: 14, borderRadius: 7, backgroundColor: color }, fillStyle]} />
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: 0,
                width: THUMB,
                height: THUMB,
                borderRadius: THUMB / 2,
                backgroundColor: colors.shell,
                borderWidth: 4,
                borderColor: colors.ink,
                alignItems: 'center',
                justifyContent: 'center',
              },
              thumbStyle,
            ]}>
            <View style={{ width: 10, height: 10, transform: [{ rotate: '30deg' }], borderWidth: 2, borderColor: colors.shellDark, borderRadius: 2 }} />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.line, borderRadius: 14, padding: 4, gap: 4 }}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Text
            key={o.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(o.id);
            }}
            style={[
              type.small,
              {
                flex: 1,
                textAlign: 'center',
                paddingVertical: 10,
                borderRadius: 10,
                overflow: 'hidden',
                backgroundColor: active ? colors.surface : 'transparent',
                color: active ? colors.ink : colors.inkSoft,
                fontWeight: '800',
              },
            ]}>
            {o.label}
          </Text>
        );
      })}
    </View>
  );
}
