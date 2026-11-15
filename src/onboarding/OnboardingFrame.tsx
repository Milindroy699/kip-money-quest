import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Backdrop } from '../ui/Backdrop';
import { ProgressBar } from '../ui/components';
import { space } from '../ui/theme';

/** Shared frame: 6-step progress bar, scrollable body, pinned footer. */
export function OnboardingFrame({ step, children, footer, scroll = true }: { step: number; children: ReactNode; footer: ReactNode; scroll?: boolean }) {
  const insets = useSafeAreaInsets();
  const Body = scroll ? ScrollView : View;
  return (
    <Backdrop art="onboarding" scrim="soft">
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: insets.top + space(1), paddingHorizontal: space(2.5) }}>
        <ProgressBar value={step / 6} />
      </View>
      <Body style={{ flex: 1 }} contentContainerStyle={scroll ? { padding: space(2.5), gap: space(2) } : undefined} keyboardShouldPersistTaps="handled">
        {children}
      </Body>
      <View style={{ padding: space(2.5), paddingBottom: Math.max(insets.bottom, space(2.5)), gap: space(1) }}>{footer}</View>
    </KeyboardAvoidingView>
    </Backdrop>
  );
}
