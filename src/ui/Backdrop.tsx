/** Full-screen art background with a scrim so text on top stays readable (4.5:1). */
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { BACKGROUNDS, type BackgroundKey } from '../art';
import { colors } from './theme';

export type Scrim = 'light' | 'soft' | 'dark' | 'none';

const SCRIMS: Record<Scrim, string> = {
  light: 'rgba(255,248,236,0.82)', // reading screens: lessons, onboarding forms
  soft: 'rgba(255,248,236,0.45)', // hubs: Learn, League, You (text sits on cards)
  dark: 'rgba(11,20,32,0.45)', // dark art (card vault, The Melt) behind light cards
  none: 'transparent',
};

export function Backdrop({ art, scrim = 'soft', children }: { art: BackgroundKey; scrim?: Scrim; children: ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Image source={BACKGROUNDS[art]} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} accessible={false} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: SCRIMS[scrim] }]} pointerEvents="none" />
      {children}
    </View>
  );
}
