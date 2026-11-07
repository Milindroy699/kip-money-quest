/** Shared UI building blocks: chunky pressable buttons, chips, bars, cards, labels. */
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { PROPS } from '../art';
import { HYPOTHETICAL_LABEL } from '../sim/assets';
import { GoalChip } from './GoalChip';
import { colors, radius, shadow, space, type } from './theme';

export function Screen({ children, edges = ['top'], style }: { children: ReactNode; edges?: Edge[]; style?: StyleProp<ViewStyle> }) {
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: colors.cream }, style]}>
      {children}
    </SafeAreaView>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'melt' | 'dash' | 'danger';

const buttonColors: Record<ButtonVariant, { bg: string; edge: string; text: string; border?: string }> = {
  primary: { bg: colors.kip, edge: colors.kipDark, text: '#fff' },
  secondary: { bg: colors.surface, edge: colors.line, text: colors.ink, border: colors.line },
  ghost: { bg: 'transparent', edge: 'transparent', text: colors.inkSoft },
  melt: { bg: colors.melt, edge: colors.meltDark, text: '#fff' },
  dash: { bg: colors.dash, edge: colors.dashDark, text: '#fff' },
  danger: { bg: colors.error, edge: '#B4282D', text: '#fff' },
};

/** Chunky 3D button: a darker bottom edge that the face presses into, plus a haptic tap. */
export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
  testID,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const c = buttonColors[variant];
  const edge = variant === 'ghost' ? 0 : 4;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={[{ opacity: disabled ? 0.45 : 1 }, style]}>
      {({ pressed }) => (
        <View style={{ borderRadius: radius.md, backgroundColor: c.edge, paddingBottom: pressed ? 0 : edge, marginTop: pressed ? edge : 0 }}>
          <View
            style={{
              borderRadius: radius.md,
              backgroundColor: c.bg,
              borderWidth: c.border ? 2 : 0,
              borderColor: c.border,
              paddingVertical: 15,
              paddingHorizontal: 20,
              alignItems: 'center',
            }}>
            <Text style={[type.bodyBold, { color: c.text, fontSize: 17, letterSpacing: 0.2 }]}>{title}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

/** The game's gold coin (the 3D art), used instead of the 🪙 emoji, which iOS draws silver. */
export function Coin({ size = 16 }: { size?: number }) {
  return <Image source={PROPS.coin} style={{ width: size, height: size }} contentFit="contain" accessible={false} />;
}

/**
 * Text that sits straight on an illustrated background (onboarding, world art). A frosted plate
 * keeps it readable whatever the art behind it is doing.
 */
export function ArtCaption({ children, tone = 'soft', style }: { children: ReactNode; tone?: 'soft' | 'brand'; style?: StyleProp<TextStyle> }) {
  return (
    <Text
      style={[
        type.small,
        {
          alignSelf: 'center',
          textAlign: 'center',
          color: tone === 'brand' ? colors.kipDark : colors.ink,
          fontWeight: tone === 'brand' ? '800' : '600',
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: radius.md,
          paddingHorizontal: 12,
          paddingVertical: 6,
          overflow: 'hidden',
        },
        style,
      ]}>
      {children}
    </Text>
  );
}

/** Shown on a reward screen when the first activity after 3+ days away paid the welcome-back bonus. */
export function ComebackNote({ coins }: { coins?: number }) {
  if (!coins) return null;
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5), borderColor: colors.kip, backgroundColor: colors.kipLight }}>
      <Text style={{ fontSize: 26 }}>🎁</Text>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={type.bodyBold}>Welcome back! +{coins} coins</Text>
        <Text style={type.small}>Kip saved your seat. Your knowledge stayed, and your streak starts again today.</Text>
      </View>
    </Card>
  );
}

export function Chip({ label, color = colors.ink, bg = colors.surface, style, icon }: { label: string; color?: string; bg?: string; style?: StyleProp<ViewStyle>; icon?: ReactNode }) {
  return (
    <View style={[{ backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: 5 }, style]}>
      {icon}
      <Text style={[type.small, { color, fontWeight: '800' }]}>{label}</Text>
    </View>
  );
}

/** One reward on a results screen: a big single-line value, a label and an optional note. */
export function RewardTile({
  value,
  from,
  prefix = '',
  label,
  note,
  icon,
  tint = colors.surface,
  border = colors.line,
  color = colors.ink,
}: {
  value: number;
  from?: number;
  prefix?: string;
  label: string;
  note?: string;
  icon?: ReactNode;
  tint?: string;
  border?: string;
  color?: string;
}) {
  return (
    <View
      style={{ flex: 1, backgroundColor: tint, borderColor: border, borderWidth: 1.5, borderRadius: radius.lg, paddingVertical: space(1.5), paddingHorizontal: space(1), alignItems: 'center', gap: 2, ...shadow }}
      accessible
      accessibilityLabel={`${prefix}${value} ${label}${note ? `, ${note}` : ''}`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '100%' }}>
        {icon}
        <CountUp to={value} from={from} prefix={prefix} style={[type.title, { color, fontSize: 26 }]} numberOfLines={1} adjustsFontSizeToFit />
      </View>
      <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]} numberOfLines={1}>
        {label}
      </Text>
      {note ? (
        <Text style={[type.tiny, { textAlign: 'center' }]} numberOfLines={2}>
          {note}
        </Text>
      ) : null}
    </View>
  );
}

/** Top bar: your goal on the left; streak, coins and FinIQ on the right. */
export function StatBar({ streak, coins, finiq, atRisk }: { streak: number; coins: number; finiq: number; atRisk?: boolean }) {
  return (
    <View style={styles.statBar} accessibilityRole="summary">
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <GoalChip />
      </View>
      {/* Each chip opens a sheet explaining it, with what to do next. */}
      <Pressable onPress={() => router.push({ pathname: '/stat/[kind]', params: { kind: 'streak' } })} accessibilityRole="button" accessibilityLabel={`Streak: ${streak} days${atRisk ? ', at risk today' : ''}`} hitSlop={6}>
        <Chip label={`🔥 ${streak}`} color={atRisk ? colors.dash : colors.ink} style={styles.statChip} />
      </Pressable>
      <Pressable onPress={() => router.push({ pathname: '/stat/[kind]', params: { kind: 'coins' } })} accessibilityRole="button" accessibilityLabel={`${coins} coins`} hitSlop={6}>
        <Chip label={`${coins}`} icon={<Coin size={16} />} style={styles.statChip} />
      </Pressable>
      <Pressable onPress={() => router.push({ pathname: '/stat/[kind]', params: { kind: 'finiq' } })} accessibilityRole="button" accessibilityLabel={`FinIQ ${finiq}`} hitSlop={6}>
        <Chip label={`FinIQ ${finiq}`} color={colors.kipDark} style={styles.statChip} />
      </Pressable>
    </View>
  );
}

export function ProgressBar({ value, color = colors.kip, height = 10, track = colors.line }: { value: number; color?: string; height?: number; track?: string }) {
  const [anim] = useState(() => new Animated.Value(value));
  useEffect(() => {
    Animated.spring(anim, { toValue: Math.min(Math.max(value, 0), 1), useNativeDriver: false, friction: 8 }).start();
  }, [anim, value]);
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}>
      <Animated.View style={{ height, borderRadius: height, backgroundColor: color, width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function HypotheticalLabel({ extra }: { extra?: string }) {
  return (
    <Text style={[type.tiny, { textAlign: 'center', marginTop: space(1) }]}>
      {extra ? `${extra} ` : ''}
      {HYPOTHETICAL_LABEL}
    </Text>
  );
}

/** Number that counts up from `from` to `to`. */
export function CountUp({
  to,
  from = 0,
  duration = 900,
  style,
  prefix = '',
  suffix = '',
  numberOfLines,
  adjustsFontSizeToFit,
}: {
  to: number;
  from?: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
  prefix?: string;
  suffix?: string;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
}) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    const anim = new Animated.Value(from);
    const id = anim.addListener(({ value: v }) => setValue(Math.round(v)));
    Animated.timing(anim, { toValue: to, duration, useNativeDriver: false }).start();
    return () => {
      anim.stopAnimation();
      anim.removeListener(id);
    };
  }, [from, to, duration]);
  return (
    <Text style={style} numberOfLines={numberOfLines} adjustsFontSizeToFit={adjustsFontSizeToFit} minimumFontScale={0.6}>
      {`${prefix}${value.toLocaleString('en-IN')}${suffix}`}
    </Text>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={[type.h2, { marginBottom: space(1.5) }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  statBar: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end', paddingHorizontal: space(2), paddingVertical: space(1) },
  statChip: { paddingHorizontal: 9 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space(2.5), borderWidth: 1.5, borderColor: colors.line, ...shadow },
});
