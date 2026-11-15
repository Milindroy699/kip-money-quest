/**
 * Bottom bar with a raised hero button in the middle for the learning path (Campus / Quest).
 * The hero pulses while today's learning goal isn't met yet.
 */
import { Image } from 'expo-image';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { skinFor, type SkinId } from '@/campus/skins';
import { HERO_BADGES } from '@/campus/sprites';
import { nextLesson, trackFor } from '@/content';
import { useGame } from '@/state/game';
import { colors, shadow, type } from '@/ui/theme';

const ICONS: Record<string, { off: SymbolViewProps['name']; on: SymbolViewProps['name'] }> = {
  index: { off: { ios: 'house', android: 'home' }, on: { ios: 'house.fill', android: 'home' } },
  // The Trophies tab (route "cards") holds the Trophy Room and the card deck.
  cards: { off: { ios: 'trophy', android: 'emoji_events' }, on: { ios: 'trophy.fill', android: 'emoji_events' } },
  league: { off: { ios: 'chart.bar', android: 'leaderboard' }, on: { ios: 'chart.bar.fill', android: 'leaderboard' } },
  you: { off: { ios: 'person.crop.circle', android: 'person' }, on: { ios: 'person.crop.circle.fill', android: 'person' } },
};

const BAR_HEIGHT = 60;
/** The raised centre button's diameter. */
const HERO = 56;

export function HeroTabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const ageBand = useGame((s) => s.profile.ageBand);
  const lessons = useGame((s) => s.lessons);
  const goal = useGame((s) => s.profile.dailyGoalMin);
  const minutes = useGame((s) => s.dailyToday().minutes);
  const track = trackFor(ageBand);
  const skin = skinFor(track);
  const due = !!nextLesson(lessons, track) && minutes < goal;

  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line, height: BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom, ...shadow, shadowOffset: { width: 0, height: -2 } }}>
      {state.routes.map((route, index) => {
        const focused = index === state.index;
        const { options } = descriptors[route.key];
        const label = typeof options.title === 'string' ? options.title : route.name;
        const onPress = () => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigateToTab(route.key);
        };
        if (route.name === 'campus') {
          return <HeroButton key={route.key} skin={skin.id} label={skin.tabLabel} title={skin.title} focused={focused} due={due} onPress={onPress} />;
        }
        const icon = ICONS[route.name];
        const tint = focused ? colors.kipDark : colors.inkMuted;
        return (
          <Pressable key={route.key} testID={`tab-${route.name}`} onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={label} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            {icon ? <SymbolView name={focused ? icon.on : icon.off} size={24} tintColor={tint} /> : null}
            <Text style={[type.tiny, { color: focused ? colors.kipDark : colors.inkSoft, fontWeight: focused ? '800' : '600' }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function HeroButton({ skin, label, title, focused, due, onPress }: { skin: SkinId; label: string; title: string; focused: boolean; due: boolean; onPress: () => void }) {
  const reduceMotion = useReducedMotion();
  const [pulse] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (!due || focused || reduceMotion) return;
    const loop = Animated.loop(Animated.sequence([Animated.timing(pulse, { toValue: 1.08, duration: 750, useNativeDriver: true }), Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true })]));
    loop.start();
    return () => {
      loop.stop();
      pulse.setValue(1);
    };
  }, [due, focused, reduceMotion, pulse]);

  return (
    <Pressable testID="tab-campus" onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={`${title}: your learning path${due ? '. A lesson is waiting.' : ''}`} style={{ flex: 1, alignItems: 'center' }}>
      <Animated.View style={{ marginTop: -16, transform: [{ scale: pulse }] }}>
        {/* Kip from the badge art (cap on campus, explorer hat on the island), cropped to a green
            disc with a white rim, so it sits with the other tabs instead of shouting over them. */}
        <View
          style={{
            width: HERO,
            height: HERO,
            borderRadius: HERO / 2,
            backgroundColor: focused ? colors.kipDark : colors.kip,
            borderWidth: 3,
            borderColor: '#fff',
            ...shadow,
            shadowOpacity: 0.22,
            elevation: 6,
          }}>
          {/* The crop lives on an inner view: overflow hidden on the outer one would clip its iOS shadow. */}
          <View style={{ flex: 1, borderRadius: HERO / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
            <Image source={HERO_BADGES[skin]} style={{ width: HERO * 1.55, height: HERO * 1.55, marginTop: HERO * 0.08 }} contentFit="contain" />
          </View>
        </View>
        {due && !focused ? <View style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.dash, borderWidth: 2.5, borderColor: '#fff', elevation: 10 }} /> : null}
      </Animated.View>
      <Text style={[type.tiny, { color: focused ? colors.kipDark : colors.inkSoft, fontWeight: focused ? '800' : '600', marginTop: 2 }]}>{label}</Text>
    </Pressable>
  );
}
