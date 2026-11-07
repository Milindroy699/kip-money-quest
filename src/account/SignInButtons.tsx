/** Sign in with Apple (Apple's own button, shown first as Apple's rules ask) and Google. */
import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { colors, radius, type } from '../ui/theme';
import { appleSignInAvailable, googleConfigured, signInWithApple, signInWithGoogle, SignInError, type Identity, type Provider } from './signIn';

export function SignInButtons({ disabled = false, onIdentity, onError }: { disabled?: boolean; onIdentity: (id: Identity) => void; onError: (message: string | null) => void }) {
  const [apple, setApple] = useState(false);
  const [busy, setBusy] = useState<Provider | null>(null);
  useEffect(() => {
    appleSignInAvailable().then(setApple);
  }, []);

  const run = async (provider: Provider) => {
    if (busy || disabled) return;
    setBusy(provider);
    onError(null);
    try {
      const id = provider === 'apple' ? await signInWithApple() : await signInWithGoogle();
      if (id) onIdentity(id); // null = they cancelled: say nothing
    } catch (e) {
      onError(e instanceof SignInError ? e.message : 'Sign-in didn’t work. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  if (!apple && !googleConfigured) {
    return <Text style={[type.small, { textAlign: 'center' }]}>Sign-in isn’t available on this phone yet.</Text>;
  }
  return (
    <View style={{ gap: 10, opacity: disabled ? 0.4 : 1, pointerEvents: disabled || busy ? 'none' : 'auto' }} accessibilityState={{ disabled }}>
      {apple ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={radius.md}
          style={{ width: '100%', height: 52 }}
          onPress={() => run('apple')}
        />
      ) : null}
      {googleConfigured ? (
        <Pressable
          onPress={() => run('google')}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
          style={({ pressed }) => ({
            height: 52,
            borderRadius: radius.md,
            borderWidth: 1.5,
            borderColor: '#747775',
            backgroundColor: pressed ? '#F2F2F2' : '#FFFFFF',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          })}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#4285F4' }} importantForAccessibility="no">
            G
          </Text>
          <Text style={{ fontSize: 17, fontWeight: '600', color: '#1F1F1F' }}>Continue with Google</Text>
        </Pressable>
      ) : null}
      {busy ? <ActivityIndicator color={colors.ink} /> : null}
    </View>
  );
}
