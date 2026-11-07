/** You tab: Future You, FinIQ and capabilities, Kip's shell rings, settings. Stats and trophies live in the Trophies tab. */
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { signInOffered } from '@/account/config';
import { deleteAccount, signOutAccount } from '@/account/session';
import { LESSONS, trackFor } from '@/content';
import { isAdult, TRACK_LABEL } from '@/content/ages';
import { FINIQ_BANDS, finIQBand, finIQBandProgress } from '@/engagement/rewards';
import { displayStreak, shellRings } from '@/engagement/streak';
import { Character } from '@/mascot/Character';
import { useGame } from '@/state/game';
import { useNudgePermission } from '@/engagement/useNudgePermission';
import { useAchievements } from '@/engagement/useAchievements';
import { planUnlocks } from '@/engagement/plan';
import { Avatar } from '@/ui/Avatar';
import { Backdrop } from '@/ui/Backdrop';
import { PlanCard } from '@/ui/PlanCard';
import { Segmented } from '@/ui/Slider';
import { Button, Card, ProgressBar, Screen, SectionTitle, StatBar } from '@/ui/components';
import { clarityFromFinIQ, FutureYouLabel, FutureYouPortrait, goalOf } from '@/ui/FutureYou';
import { colors, radius, space, type } from '@/ui/theme';

const appVersion = Constants.expoConfig?.version ?? '';

const REMINDER_STEPS = Array.from({ length: 30 }, (_, i) => ({ hour: 7 + Math.floor(i / 2), minute: (i % 2) * 30 })).filter((t) => t.hour * 60 + t.minute <= 21 * 60 + 30);

function fmtTime(t: { hour: number; minute: number }) {
  const h = t.hour % 12 || 12;
  return `${h}:${String(t.minute).padStart(2, '0')} ${t.hour < 12 ? 'AM' : 'PM'}`;
}

export default function You() {
  const g = useGame();
  const today = g.today();
  const finiq = g.finIQ();
  const streak = displayStreak(g.streak, today);
  const band = finIQBand(finiq);
  const nextBand = FINIQ_BANDS[FINIQ_BANDS.indexOf(band) + 1];
  const capabilities = LESSONS.filter((l) => g.lessons[l.id]).map((l) => l.capability);
  const rings = shellRings(g.streak.longest);
  const [scheduled, setScheduled] = useState<number | null>(null);
  const [testerTaps, setTesterTaps] = useState(0);
  const adult = isAdult(g.profile.age);
  const trophies = useAchievements();
  const earnedTrophies = trophies.filter((t) => t.earned).length;
  const nudges = useNudgePermission();

  useEffect(() => {
    Notifications.getAllScheduledNotificationsAsync()
      .then((n) => setScheduled(n.length))
      .catch(() => setScheduled(null));
  }, [g.profile.reminder, g.streak.lastActiveDay, g.dayOffset]);

  const shiftReminder = (dir: 1 | -1) => {
    const i = REMINDER_STEPS.findIndex((t) => t.hour === g.profile.reminder.hour && t.minute === g.profile.reminder.minute);
    const next = REMINDER_STEPS[Math.min(Math.max((i < 0 ? 22 : i) + dir, 0), REMINDER_STEPS.length - 1)];
    g.setProfile({ reminder: next });
  };

  return (
    <Backdrop art="onboarding" scrim="soft">
    <Screen style={{ backgroundColor: 'transparent' }}>
      <StatBar streak={streak} coins={g.coins} finiq={finiq} />
      <ScrollView contentContainerStyle={{ padding: space(2.5), gap: space(2.5), paddingBottom: space(12) }}>
        {/* You: profile picture (tap to change), name and track. */}
        <Pressable testID="you-avatar" onPress={() => router.push('/avatar')} accessibilityRole="button" accessibilityLabel="Change your profile picture">
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
            <Avatar size={72} editBadge />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={type.h2}>{g.profile.name || 'You'}</Text>
              <Text style={type.small}>
                {trackFor(g.profile.ageBand) === 'builder' ? TRACK_LABEL.builder : TRACK_LABEL.explorer} track{g.profile.age ? ` · age ${g.profile.age}` : ''}
              </Text>
              <Text style={[type.small, { color: colors.kipDark, fontWeight: '800' }]}>Change profile picture ›</Text>
            </View>
          </Card>
        </Pressable>
        <Card style={{ alignItems: 'center', gap: space(1) }}>
          <FutureYouPortrait clarity={clarityFromFinIQ(finiq)} goal={g.profile.goal} size={140} />
          <FutureYouLabel age={g.profile.targetAge} />
          <Text style={type.title}>{g.profile.name || 'Future You'}</Text>
          <Text style={type.body}>
            Goal: {goalOf(g.profile.goal).label} {goalOf(g.profile.goal).emoji} by {g.profile.targetAge}
          </Text>
          <Text style={[type.small, { textAlign: 'center' }]}>Every lesson makes Future You richer and wiser. The clearer the view, the more you know.</Text>
        </Card>

        <PlanCard profile={g.profile} unlocks={planUnlocks(g.lessons)} finiq={finiq} />

        <Card style={{ gap: space(1) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text style={type.h2}>FinIQ {finiq}</Text>
            <Text style={[type.bodyBold, { color: colors.kipDark }]}>{band.name}</Text>
          </View>
          <ProgressBar value={finIQBandProgress(finiq)} />
          <Text style={type.small}>{nextBand ? `Next: ${nextBand.name} at ${nextBand.min}. ${nextBand.blurb}` : band.blurb}</Text>
          <SectionTitle>You can now…</SectionTitle>
          {capabilities.length ? (
            capabilities.map((c) => (
              <Text key={c} style={type.body}>
                ✅ {c}
              </Text>
            ))
          ) : (
            <Text style={type.small}>Finish your first lesson to unlock your first capability.</Text>
          )}
        </Card>

        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
          <Character name="kip" pose="full" size={120} rings={rings} />
          <View style={{ flex: 1 }}>
            <Text style={type.h2}>
              {rings} growth ring{rings === 1 ? '' : 's'}
            </Text>
            <Text style={type.small}>Kip’s shell grows a ring for every full week of your Knowledge SIP. Compounding, on a tortoise.</Text>
          </View>
        </Card>

        <Pressable testID="you-trophies" onPress={() => router.navigate('/cards')} accessibilityRole="button" accessibilityLabel={`Trophy Room: ${earnedTrophies} of ${trophies.length} trophies`}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space(1.5), backgroundColor: '#3A2212', borderColor: '#5B3418' }}>
            <Text style={{ fontSize: 34 }}>🏆</Text>
            <View style={{ flex: 1 }}>
              <Text style={[type.bodyBold, { color: '#FFF4E0' }]}>
                Trophy Room · {earnedTrophies} / {trophies.length}
              </Text>
              <Text style={[type.small, { color: '#E8C99A' }]}>Your stats and every trophy you’ve earned.</Text>
            </View>
            <Text style={[type.h2, { color: '#E8C99A' }]}>›</Text>
          </Card>
        </Pressable>

        {signInOffered || g.account ? <AccountCard /> : null}

        {/* The parent report is for under-18s; adults learn on their own. */}
        {!adult ? (
          <Card style={{ gap: space(1.5) }}>
            <SectionTitle>For parents</SectionTitle>
            <Text style={type.small}>A one-page weekly report: what you learned, how consistent you were, and questions to talk about at dinner.</Text>
            <Button testID="you-parent-report" title="Weekly report for a parent" variant="secondary" onPress={() => router.push('/parent')} />
          </Card>
        ) : null}

        <Card style={{ gap: space(2) }}>
          <SectionTitle>Nudges</SectionTitle>
          {/* Label above the stepper, so the stepper never squeezes past the card edge on small or Android screens. */}
          <View style={{ gap: space(1) }}>
            <Text style={type.bodyBold}>Remind me at</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space(2), backgroundColor: colors.cream, borderRadius: radius.md, paddingVertical: space(1) }}>
              <RoundBtn label="−" onPress={() => shiftReminder(-1)} />
              <Text style={[type.number, { minWidth: 104, textAlign: 'center' }]}>{fmtTime(g.profile.reminder)}</Text>
              <RoundBtn label="+" onPress={() => shiftReminder(1)} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={type.bodyBold}>{adult ? 'Quiet on weekday mornings' : 'Mute during school hours'}</Text>
              <Text style={type.tiny}>Mon–Fri, 8 AM–2 PM</Text>
            </View>
            <Switch value={g.profile.schoolHoursMute} onValueChange={(v) => g.setProfile({ schoolHoursMute: v })} trackColor={{ true: colors.kip }} />
          </View>
          {nudges.status === 'off' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.dashLight, padding: space(1.5), borderRadius: radius.md }}>
              <Text style={[type.small, { flex: 1, color: colors.ink }]}>🔕 Notifications are off, so none of these reminders will arrive.</Text>
              <Button title="Turn on" variant="secondary" onPress={nudges.turnOn} />
            </View>
          ) : null}
          <Text style={type.tiny}>
            At most one nudge a day, never after 10 PM, and Kip backs off if you’re busy.
            {nudges.status === 'granted' && scheduled !== null ? ` ${scheduled} nudges scheduled.` : ''}
          </Text>
        </Card>

        <Card style={{ gap: space(2) }}>
          <SectionTitle>Learning & play</SectionTitle>
          <View style={{ gap: 8 }}>
            <Text style={type.bodyBold}>Learning track</Text>
            <Segmented
              options={[
                { id: '13-15', label: TRACK_LABEL.explorer },
                { id: '16-19', label: TRACK_LABEL.builder },
              ]}
              value={g.profile.ageBand ?? '13-15'}
              onChange={(v) => g.setProfile({ ageBand: v })}
            />
            <Text style={type.tiny}>Builder adds three worlds (Three Doors, Time Tracks, Analyst HQ) and real-world deep-dives on tax, KYC and how products really work.</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={type.bodyBold}>On-screen run buttons</Text>
              <Text style={type.tiny}>Play Kip Run with ◀ ▲ ▼ ▶ buttons instead of swipes. Turns on automatically with VoiceOver or TalkBack.</Text>
            </View>
            <Switch value={g.profile.runnerButtons} onValueChange={(v) => g.setProfile({ runnerButtons: v })} trackColor={{ true: colors.kip }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={type.bodyBold}>Sound effects</Text>
              <Text style={type.tiny}>Coins, answers and celebrations. Follows your phone’s silent switch.</Text>
            </View>
            <Switch value={g.profile.soundOn} onValueChange={(v) => g.setProfile({ soundOn: v })} trackColor={{ true: colors.kip }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={type.bodyBold}>Music in Kip Run</Text>
              <Text style={type.tiny}>Plays alongside your own music, never over it.</Text>
            </View>
            <Switch value={g.profile.musicOn} onValueChange={(v) => g.setProfile({ musicOn: v })} trackColor={{ true: colors.kip }} />
          </View>
        </Card>

        <Card style={{ gap: space(1) }}>
          <SectionTitle>Your data</SectionTitle>
          <Text style={type.small}>Start over clears your progress on this phone and restarts from the beginning.</Text>
          <Button
            title="Start over"
            variant="ghost"
            onPress={() =>
              Alert.alert('Start over?', 'This clears your progress on this phone and restarts onboarding. A backed-up account keeps its copy.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Start over', style: 'destructive', onPress: g.resetAll },
              ])
            }
          />
        </Card>

        {/* Tester tools: always in development builds; in release builds, tap the version line 7 times. */}
        {__DEV__ || testerTaps >= 7 ? (
          <Card style={{ gap: space(1.5), borderStyle: 'dashed' }}>
            <SectionTitle>Tester tools</SectionTitle>
            <Text style={type.small}>For testing only. Today in game: {today}. Skip ahead a day to test streaks, freezes, reviews and Dividend Day.</Text>
            <Button title="Advance one day ⏭" variant="secondary" onPress={g.advanceDay} />
          </Card>
        ) : null}
        <Pressable onPress={() => setTesterTaps((n) => n + 1)} accessible={false}>
          <Text style={[type.tiny, { textAlign: 'center', color: colors.inkSoft }]}>
            Kip: Money Quest {appVersion}. Teaches money skills with hypothetical numbers. It is not investment advice.
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
    </Backdrop>
  );
}

function RoundBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label === '+' ? 'Later' : 'Earlier'} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
      <Text style={type.h2}>{label}</Text>
    </Pressable>
  );
}

const PROVIDER_NAME = { apple: 'Apple', google: 'Google' } as const;

/** Save progress (sign in), or manage the account: sign out, or delete it (required by Apple). */
function AccountCard() {
  const account = useGame((s) => s.account);
  const [busy, setBusy] = useState(false);
  if (!account) {
    return (
      <Card style={{ gap: space(1.5) }}>
        <SectionTitle>Account</SectionTitle>
        <Text style={type.small}>Back up your streak, cards and FinIQ, and carry on if you change phones. Optional: everything works without it.</Text>
        <Button testID="you-save-progress" title="Save my progress" variant="secondary" onPress={() => router.push('/account')} />
      </Card>
    );
  }
  const confirmDelete = () =>
    Alert.alert('Delete account?', 'This deletes the account and its cloud backup. Progress on this phone stays.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            const result = await deleteAccount();
            if (result === 'signInAgain') Alert.alert('Sign in again first', 'For safety, sign out, sign back in, then delete the account.');
          } catch (e) {
            Alert.alert('Couldn’t delete', (e as Error).message);
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  return (
    <Card style={{ gap: space(1.5) }}>
      <SectionTitle>Account</SectionTitle>
      <Text style={type.bodyBold}>
        Signed in with {PROVIDER_NAME[account.provider]}
        {account.name ? ` as ${account.name}` : ''}
      </Text>
      <Text style={type.small}>
        {account.holder === 'parent' ? 'A parent’s account, with their consent. ' : ''}
        {account.cloud ? 'Your progress is backed up.' : 'Test account on this phone only (the cloud isn’t set up yet).'}
      </Text>
      <View style={{ flexDirection: 'row', gap: space(1) }}>
        <Button title="Sign out" variant="secondary" disabled={busy} style={{ flex: 1 }} onPress={() => signOutAccount()} />
        <Button testID="delete-account" title="Delete account" variant="danger" disabled={busy} style={{ flex: 1 }} onPress={confirmDelete} />
      </View>
    </Card>
  );
}
