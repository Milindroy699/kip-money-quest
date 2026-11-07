/**
 * "Save your progress": sign-in, offered once the player is primed (see src/account/prime.ts).
 * 18+: they sign in themselves. Under 18: a parent or guardian reads what's kept, consents and
 * signs in with their own account (India's DPDP Act needs a parent's consent for minors).
 */
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cloudConfigured } from '@/account/config';
import { needsParent } from '@/account/prime';
import { afterSignIn } from '@/account/session';
import { SignInButtons } from '@/account/SignInButtons';
import type { Identity } from '@/account/signIn';
import { displayStreak } from '@/engagement/streak';
import { Character } from '@/mascot/Character';
import { useGame, type LinkedAccount } from '@/state/game';
import { Backdrop } from '@/ui/Backdrop';
import { ArtCaption, Button, Card } from '@/ui/components';
import { colors, radius, space, type } from '@/ui/theme';

type Step = 'pitch' | 'parent' | 'done';

const PROVIDER_NAME = { apple: 'Apple', google: 'Google' } as const;

export default function SaveProgress() {
  const insets = useSafeAreaInsets();
  const profile = useGame((s) => s.profile);
  const streak = useGame((s) => displayStreak(s.streak, s.today()));
  const cards = useGame((s) => s.cards.length);
  const finiq = useGame((s) => s.finIQ());
  const account = useGame((s) => s.account);
  const minor = needsParent(profile.age);
  const name = profile.name || 'your teen';

  const [step, setStep] = useState<Step>(account ? 'done' : 'pitch');
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<'restored' | 'saved' | 'local' | null>(null);
  const [guardian, setGuardian] = useState(false);
  const [consent, setConsent] = useState(false);

  const signedIn = async (id: Identity, holder: LinkedAccount['holder']) => {
    setOutcome(await afterSignIn(id, holder));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setStep('done');
  };

  return (
    <Backdrop art="celebration" scrim="soft">
      <ScrollView contentContainerStyle={{ padding: space(2.5), paddingTop: insets.top + space(1.5), paddingBottom: insets.bottom + space(3), gap: space(2) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}>
            <Text style={{ fontSize: 26, color: colors.inkMuted }}>✕</Text>
          </Pressable>
        </View>

        {step === 'pitch' ? (
          <>
            <View style={{ alignItems: 'center', gap: space(1) }}>
              <Character name="kip" mood="cheer" size={120} />
              <Text style={[type.title, { textAlign: 'center' }]}>Save your progress{profile.name ? `, ${profile.name}` : ''}</Text>
              <Text style={[type.body, { textAlign: 'center' }]}>You’ve built something worth keeping.</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: space(1) }}>
              <Stat value={`${streak}`} label="day streak" emoji="🔥" />
              <Stat value={`${cards}`} label="cards" emoji="🃏" />
              <Stat value={`${finiq}`} label="FinIQ" emoji="🧠" />
            </View>
            <Card style={{ gap: 8 }}>
              <Text style={type.bodyBold}>✓ Back up your streak, cards and FinIQ</Text>
              <Text style={type.bodyBold}>✓ Carry on if you change or lose your phone</Text>
              <Text style={type.small}>We keep your first name, age and game progress. No ads, no tracking, no real money.</Text>
            </Card>
            {minor ? (
              <>
                <Card style={{ backgroundColor: colors.kipLight, borderColor: colors.kip, gap: 6 }}>
                  <Text style={type.bodyBold}>Ask a parent or guardian</Text>
                  <Text style={type.small}>You’re under 18, so a parent or guardian signs in with their account and says yes. It takes a minute.</Text>
                </Card>
                <Button testID="hand-to-parent" title="Hand the phone to a parent" onPress={() => setStep('parent')} />
              </>
            ) : (
              <SignInButtons onIdentity={(id) => signedIn(id, 'self')} onError={setError} />
            )}
            {error ? <ErrorNote text={error} /> : null}
            <Button testID="save-not-now" title="Not now" variant="ghost" onPress={() => router.back()} />
          </>
        ) : null}

        {step === 'parent' ? (
          <>
            <Text style={type.title}>For parents and guardians</Text>
            <Card style={{ gap: 8 }}>
              <Text style={type.body}>
                {name} is learning how money and investing work with Kip: Money Quest. It’s education only: no real money, no trading, no ads and no tracking.
              </Text>
              <Text style={type.bodyBold}>What we keep</Text>
              <Text style={type.small}>• {name}’s first name, age and game progress</Text>
              <Text style={type.small}>• Your name from Apple or Google, to run the account</Text>
              <Text style={type.small}>We never sell data. You can delete the account any time in You › Account.</Text>
            </Card>
            <Check checked={guardian} onToggle={() => setGuardian((v) => !v)} testID="consent-guardian">
              I’m {name}’s parent or legal guardian, and I’m 18 or older.
            </Check>
            <Check checked={consent} onToggle={() => setConsent((v) => !v)} testID="consent-agree">
              I agree to {name} using Kip: Money Quest and saving their progress.
            </Check>
            <SignInButtons disabled={!guardian || !consent} onIdentity={(id) => signedIn(id, 'parent')} onError={setError} />
            {!guardian || !consent ? <ArtCaption>Tick both boxes to continue.</ArtCaption> : null}
            {error ? <ErrorNote text={error} /> : null}
            <Button title="Back" variant="ghost" onPress={() => setStep('pitch')} />
          </>
        ) : null}

        {step === 'done' ? <Done account={account} outcome={outcome} minor={minor} /> : null}
      </ScrollView>
    </Backdrop>
  );
}

function Done({ account, outcome, minor }: { account: LinkedAccount | null; outcome: 'restored' | 'saved' | 'local' | null; minor: boolean }) {
  const by = account ? `${PROVIDER_NAME[account.provider]}${account.name ? ` as ${account.name}` : ''}` : '';
  return (
    <>
      <View style={{ alignItems: 'center', gap: space(1) }}>
        <Character name="kip" mood="cheer" size={130} />
        <Text style={[type.title, { textAlign: 'center' }]}>{outcome === 'restored' ? 'Welcome back!' : 'Progress saved!'}</Text>
        <Text style={[type.body, { textAlign: 'center' }]}>
          {outcome === 'restored' ? 'Your streak, cards and lessons are back.' : 'Your streak, cards and FinIQ are backed up.'}
        </Text>
      </View>
      {account ? (
        <Card style={{ gap: 4 }}>
          <Text style={type.bodyBold}>Signed in with {by}</Text>
          {account.holder === 'parent' ? <Text style={type.small}>A parent’s account, with their consent.</Text> : null}
          {minor && account.holder === 'parent' ? <Text style={type.small}>Hand the phone back. Happy learning!</Text> : null}
        </Card>
      ) : null}
      {!cloudConfigured ? <ArtCaption>Developer build: the cloud isn’t set up yet, so this is a test account on this phone only.</ArtCaption> : null}
      <Button testID="save-done" title="Back to learning" onPress={() => router.back()} />
    </>
  );
}

function Stat({ value, label, emoji }: { value: string; label: string; emoji: string }) {
  return (
    <Card style={{ flex: 1, alignItems: 'center', paddingVertical: space(1.5), gap: 2 }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={[type.title, { color: colors.ink }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={type.tiny}>{label}</Text>
    </Card>
  );
}

function Check({ checked, onToggle, children, testID }: { checked: boolean; onToggle: () => void; children: string | string[]; testID?: string }) {
  return (
    <Pressable testID={testID} onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked }} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: radius.sm,
          borderWidth: 2.5,
          borderColor: checked ? colors.kip : colors.inkMuted,
          backgroundColor: checked ? colors.kip : colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {checked ? <Text style={{ color: '#fff', fontWeight: '900' }}>✓</Text> : null}
      </View>
      <Text style={[type.body, { flex: 1, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: radius.sm, paddingHorizontal: 6, overflow: 'hidden' }]}>{children}</Text>
    </Pressable>
  );
}

function ErrorNote({ text }: { text: string }) {
  return (
    <View accessibilityLiveRegion="polite">
      <Card style={{ borderColor: colors.error }}>
        <Text style={[type.small, { color: colors.ink }]}>{text}</Text>
      </Card>
    </View>
  );
}
