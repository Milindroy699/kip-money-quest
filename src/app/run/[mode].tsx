/** Free-play Kip Run (the campus Sports Ground). Pick a mode, play, see the compounding reveal. */
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { questionsForRun } from '@/content';
import { RUN_MODE_UNLOCK_TEXT, runModeUnlocked } from '@/content/unlocks';
import { LoadoutPicker } from '@/game/runner/LoadoutPicker';
import { gateHelpFor } from '@/game/runner/gateHelp';
import { CARD_LOADOUTS } from '@/game/runner/loadouts';
import { dashTierFor, type RunMode, type RunResult } from '@/game/runner/engine';
import { RunnerScene } from '@/game/runner/RunnerScene';
import { RunResults } from '@/game/runner/RunResults';
import { RunGuide } from '@/game/runner/RunGuide';
import { ChartResults } from '@/game/surfer/ChartResults';
import { ChartSurferScene } from '@/game/surfer/ChartSurferScene';
import type { RunModeT } from '@/content/schema';
import type { SurfResult } from '@/games/chartSurfer';
import { Character } from '@/mascot/Character';
import { REWARDED_RUNS_PER_DAY } from '@/engagement/rewards';
import { useGame, type Reward } from '@/state/game';
import { Backdrop } from '@/ui/Backdrop';
import { Button, Card } from '@/ui/components';
import { colors, space, type } from '@/ui/theme';

const clock = () => Date.now();

export default function FreeRun() {
  // quick=1: Home's Quick Run card goes straight into the run (no picker).
  const params = useLocalSearchParams<{ mode: string; autostart?: string; quick?: string }>();
  const quick = params.quick === '1';
  const lessons = useGame((s) => s.lessons);
  const completeRun = useGame((s) => s.completeRun);
  const runnerButtons = useGame((s) => s.profile.runnerButtons);
  const runs = useGame((s) => s.runs);
  const runsToday = useGame((s) => s.dailyToday().runs);
  const ownedCards = useGame((s) => s.cards);
  const loadoutId = useGame((s) => s.profile.loadout);
  const setProfile = useGame((s) => s.setProfile);
  const gateHelp = useGame((s) => gateHelpFor(s.profile.gateHelp, s.runs.guidedRight ?? 0));
  const loadout = CARD_LOADOUTS[ownedCards.includes(loadoutId) ? loadoutId : 'cash'];
  const questions = questionsForRun(null, lessons);
  const [reward, setReward] = useState<Reward | null>(null);
  const unlocked: Record<RunModeT, boolean> = {
    inflation: true,
    snowball: runModeUnlocked('snowball', lessons),
    risk: runModeUnlocked('risk', lessons),
    timeframe: runModeUnlocked('timeframe', lessons),
    chart: runModeUnlocked('chart', lessons),
  };
  const asked = params.mode as RunModeT;
  // Dev-only: ?autostart=1 may open any mode (demo mode and testing).
  const [mode, setMode] = useState<RunModeT>(asked in unlocked && (unlocked[asked] || (__DEV__ && params.autostart === '1')) ? asked : 'inflation');
  const [surf, setSurf] = useState<SurfResult | null>(null);
  // Dev-only: ?autostart=1 skips the picker (used by demo mode).
  const [phase, setPhase] = useState<'pick' | 'run' | 'done'>((__DEV__ && params.autostart === '1') || quick ? 'run' : 'pick');
  const [showGuide, setShowGuide] = useState(false);
  const [seed, setSeed] = useState(() => (quick ? clock() % 1_000_000 : 7));
  const [result, setResult] = useState<RunResult | null>(null);
  const insets = useSafeAreaInsets();

  if (phase === 'run' && mode === 'chart') {
    return (
      <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#141B33' }}>
        <ChartSurferScene
          key={seed}
          seed={seed}
          showButtons={runnerButtons}
          onFinish={(r) => {
            setReward(completeRun({ mode: 'chart', coinsAwarded: r.score, dashDodged: 0 }));
            setSurf(r);
            setPhase('done');
          }}
        />
      </View>
    );
  }
  if (phase === 'done' && mode === 'chart' && surf) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#141B33' }}>
        <ChartResults
          result={surf}
          reward={reward ?? undefined}
          continueLabel="Done"
          onContinue={() => router.back()}
          onReplay={() => {
            setSeed(Date.now() % 1_000_000);
            setPhase('run');
          }}
        />
      </View>
    );
  }
  if (phase === 'run') {
    return (
      <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.cream }}>
        <RunnerScene
          key={seed}
          mode={mode as RunMode}
          durationSec={50}
          seed={seed}
          showButtons={runnerButtons}
          questions={questions}
          loadout={loadout}
          dashTier={dashTierFor(runs.dashDodged)}
          gateHelp={gateHelp}
          onFinish={(r) => {
            setReward(completeRun(r));
            setResult(r);
            setPhase('done');
          }}
        />
      </View>
    );
  }
  if (phase === 'done' && result) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.cream }}>
        <RunResults
          result={result}
          reward={reward ?? undefined}
          continueLabel="Done"
          onContinue={() => router.back()}
          onReplay={() => {
            setSeed(Date.now() % 1_000_000);
            setPhase('run');
          }}
        />
      </View>
    );
  }

  if (showGuide) {
    return (
      <Backdrop art="moneyTown" scrim="soft">
        <ScrollView contentContainerStyle={{ padding: space(2.5), paddingTop: insets.top + space(2), paddingBottom: insets.bottom + space(3) }}>
          <RunGuide onDone={() => setShowGuide(false)} />
        </ScrollView>
      </Backdrop>
    );
  }

  return (
    <Backdrop art="moneyTown" scrim="soft">
    <View style={{ flex: 1, paddingTop: insets.top + space(2), paddingBottom: insets.bottom + space(2) }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: space(2.5), gap: space(2), paddingBottom: space(2) }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={type.title}>Kip Run</Text>
        <Pressable testID="run-how-to" onPress={() => setShowGuide(true)} accessibilityRole="button" hitSlop={8} style={{ marginLeft: 'auto', marginRight: space(2), backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5, borderColor: colors.line }}>
          <Text style={[type.small, { color: colors.ink, fontWeight: '800' }]}>❓ How to play</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}>
          <Text style={{ fontSize: 26, color: colors.inkMuted }}>✕</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Character name="kip" pose="full" size={160} />
        <Character name="melt" mood="worry" size={120} />
      </View>
      <ModeCard selected={mode} onSelect={setMode} id="inflation" title="Inflation Chase" text="Bank idle coins at INVEST gates before The Melt eats them." />
      <ModeCard selected={mode} onSelect={setMode} id="snowball" title="Snowball Run" text="Grow the snowball with coins in a row. SIP gates bank (+10%). CASH OUT resets it." locked={!unlocked.snowball} unlockText={RUN_MODE_UNLOCK_TEXT.snowball} />
      <ModeCard selected={mode} onSelect={setMode} id="risk" title="Risk Lanes" text="Invest at SAFE, BALANCED or WILD gates, then ride the market swings. Keep some coins for surprise expenses." locked={!unlocked.risk} unlockText={RUN_MODE_UNLOCK_TEXT.risk} />
      <ModeCard selected={mode} onSelect={setMode} id="timeframe" title="⏱️ Time Tracks" text="Scalp, trade intraday, swing, then go long term, in one run. See which speed keeps the most after fees." locked={!unlocked.timeframe} unlockText={RUN_MODE_UNLOCK_TEXT.timeframe} />
      <ModeCard selected={mode} onSelect={setMode} id="chart" title="🏄 Chart Surfer" text="Surf the edge of a live chart. Jump coins and news gaps, and read support, resistance and patterns." locked={!unlocked.chart} unlockText={RUN_MODE_UNLOCK_TEXT.chart} />
      <Card style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={type.number}>{runs.bestScore || '–'}</Text>
          <Text style={type.tiny}>Personal best</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={type.number}>{runs.count}</Text>
          <Text style={type.tiny}>Runs</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={type.number}>{Math.max(REWARDED_RUNS_PER_DAY - runsToday, 0)}</Text>
          <Text style={type.tiny}>Coin runs left today</Text>
        </View>
      </Card>
      <LoadoutPicker owned={ownedCards} selected={loadout.id} onSelect={(id) => setProfile({ loadout: id })} />
      </ScrollView>
      <View style={{ paddingHorizontal: space(2.5) }}>
      <Button
        testID="free-run-start"
        title="Start run ▶"
        onPress={() => {
          setSeed(Date.now() % 1_000_000);
          setPhase('run');
        }}
      />
      </View>
    </View>
    </Backdrop>
  );
}

function ModeCard({ id, title, text, locked, unlockText, selected, onSelect }: { id: RunModeT; title: string; text: string; locked?: boolean; unlockText?: string; selected: RunModeT; onSelect: (m: RunModeT) => void }) {
  return (
    <Pressable testID={`mode-${id}`} disabled={locked} onPress={() => onSelect(id)} accessibilityRole="radio" accessibilityState={{ selected: selected === id, disabled: locked }}>
      <Card style={{ borderColor: selected === id ? colors.kip : colors.line, borderWidth: selected === id ? 3 : 1.5, opacity: locked ? 0.5 : 1 }}>
        <Text style={type.bodyBold}>
          {locked ? '🔒 ' : ''}
          {title}
        </Text>
        <Text style={type.small}>{locked ? unlockText : text}</Text>
      </Card>
    </Pressable>
  );
}
