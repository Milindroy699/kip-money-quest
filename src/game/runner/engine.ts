/**
 * Kip Run — pure, deterministic runner engine (no React, no rendering).
 * The mechanics model the lesson:
 * - Inflation Chase: coins in your pocket are idle money. When The Melt is close it shrinks
 *   them. Pass through INVEST gates to bank them.
 * - Snowball Run: consecutive coins grow the snowball (each coin is worth 4% more than the
 *   last, i.e. it compounds). SIP gates bank the pocket with a bonus. CASH OUT ramps pay
 *   instantly but reset the snowball.
 * - Risk Lanes: see below.
 * - Time Tracks (timeframe): one run through four trading speeds. Scalping is fast, with tiny
 *   coins and a fee on every trade; intraday must square off at the 3:30 bell; swing trades
 *   hold overnight, so news gaps must be jumped; long term is calm, fee-free, and banked coins
 *   compound. The debrief compares what each stage earned and cost.
 */
import { createRng, normal, type Rng } from '../../sim/rng';

export type RunMode = 'inflation' | 'snowball' | 'risk' | 'timeframe';
/** Risk Lanes: left = SAFE, middle = BALANCED, right = WILD. */
export type RiskTier = 'safe' | 'balanced' | 'wild';
export const RISK_TIER_OF_LANE: Record<Lane, RiskTier> = { [-1]: 'safe', 0: 'balanced', 1: 'wild' } as Record<Lane, RiskTier>;
export type Lane = -1 | 0 | 1;
export type EntityKind = 'coin' | 'billboard' | 'hotTip' | 'toll' | 'investGate' | 'sipGate' | 'cashOut' | 'answer' | 'riskGate' | 'tradeFee' | 'bell' | 'gap' | 'dividend';

export interface Entity {
  id: number;
  kind: EntityKind;
  lane: Lane;
  /** Metres ahead of the player. */
  z: number;
  done: boolean;
  /** Answer gates: the answer text, whether it's right, and which question it belongs to. */
  label?: string;
  correct?: boolean;
  questionId?: number;
  /** Hot Tip traps dropped by Dash as he sprints past (drawn as a cameo; same collision rules). */
  byDash?: boolean;
  /** Where Dash drops it (metres ahead); null = it's on the road from the horizon (Meet Dash tier). */
  dropZ?: number | null;
  /** Dash's trap has appeared (the player has been warned). */
  announced?: boolean;
  /** It landed in the player's lane when it appeared, so getting past it is a real dodge. */
  threatened?: boolean;
  /** Risk Lanes gates: the risk level this gate invests in, and which row of gates it belongs to. */
  tier?: RiskTier;
  row?: number;
}

/**
 * How Answer Gates are played:
 * - guide: as the gates come close the run eases to a stop, the question is asked on a card,
 *   Kip says if the answer was right and points at the gate to take, then the run goes on.
 * - slowmo: time slows down while a question is on its way, and you steer into your answer.
 * - off: full speed (read and steer at once).
 */
export type GateHelp = 'guide' | 'slowmo' | 'off';
/** Guided gates: the run starts easing to a stop when the gates are this close (big enough to see). */
export const ASK_Z = 21;
/** Guided gates: after the answer, the run goes on in slow-mo until you're through the gate. */
export const GUIDED_GO_SCALE = 0.55;
/** Slow-mo gates: time runs at this share of normal while a question is on its way... */
export const SLOWMO_SCALE = 0.45;
/** ...once its gates are this close. */
export const SLOWMO_Z = 64;
/** How quickly time eases toward a new pace (per second). */
const TIME_EASE = 6;

/** A guided question (gateHelp 'guide'): where the right gate is, and what the player picked on the card. */
export interface Ask {
  questionId: number;
  correctLane: Lane;
  /** coming: gates on their way; asking: paused for an answer; answered: paused on the result; go: running to the gate. */
  phase: 'coming' | 'asking' | 'answered' | 'go';
  picked: Lane | null;
}

/** A short question asked through three Answer Gates (one per lane). */
export interface GateQuestion {
  q: string;
  options: string[];
  correct: number;
}

/**
 * A product card equipped before a run. Its real-world trait becomes a power-up
 * (see CARD_LOADOUTS in src/game/runner/loadouts.ts).
 */
export interface Loadout {
  id: string;
  /** Obstacle hits absorbed (FD: safety). */
  shield?: number;
  /** Seconds between automatic banking of idle coins (SIP: autopilot consistency). */
  autoBankEvery?: number;
  /** Extra share banked at every gate (RD: steady deposits). */
  gateBonus?: number;
  /** Multiplier on the final score; a range means it's rolled per run (index fund: volatility). */
  endMultiplier?: number | { min: number; max: number };
  /** How strongly The Melt bites idle coins (savings: a little interest). */
  meltBiteFactor?: number;
  /** Banked coins at the start (lump sum: all at once). */
  headStart?: number;
  /** CASH OUT ramps don't pay (PPF: locked in). */
  blockCashOut?: boolean;
}

export type RunEventKind =
  | 'coin'
  | 'bank'
  | 'gateMissed'
  | 'impulse'
  | 'hotTip'
  | 'fee'
  | 'cashOut'
  | 'meltBite'
  | 'jump'
  | 'slide'
  | 'caught'
  | 'finished'
  | 'answerRight'
  | 'answerWrong'
  | 'shield'
  | 'autoBank'
  | 'dashDrop'
  | 'swingUp'
  | 'swingDown'
  | 'emergency'
  | 'emergencyShort'
  | 'tradeFee'
  | 'bell'
  | 'gapDown'
  | 'dividend'
  | 'stage'
  | 'growth'
  | 'dashOvertake'
  | 'ask'
  | 'askRight'
  | 'askWrong'
  | 'slowmo';

/** What Dash is overtaking Kip for: a slip that costs you, or a line of coins left on the road. */
export type OvertakeReason = 'missedCoins' | 'impulse' | 'hotTip' | 'fee' | 'cashOut' | 'gateMissed' | 'answerWrong' | 'emergencyShort';

export interface RunEvent {
  kind: RunEventKind;
  amount?: number;
  /** Time Tracks: the stage that just started (for 'stage' events). */
  stage?: TfStage;
  /** Why Dash overtook (for 'dashOvertake' events). */
  reason?: OvertakeReason;
}

export interface RunConfig {
  mode: RunMode;
  durationSec: number;
  seed: number;
  /** Easier spawns and longer gaps for the onboarding tutorial. */
  tutorial?: boolean;
  /** Questions to ask through Answer Gates, in order (none = no Answer Gates). */
  questions?: GateQuestion[];
  loadout?: Loadout;
  /** Dash cameo difficulty (see DASH_TIERS); 0 = Meet Dash. Comes from the player's dodges so far. */
  dashTier?: number;
  /** How Answer Gates are played (default 'off': full speed). */
  gateHelp?: GateHelp;
}

export interface RunState {
  config: RunConfig;
  time: number;
  distance: number;
  speed: number;
  lane: Lane;
  /** Smoothed horizontal position for rendering and collisions (−1..1). */
  laneX: number;
  jumpT: number;
  slideT: number;
  /** Idle coins carried (fractional while shrinking). */
  pocket: number;
  banked: number;
  /** Metres between The Melt and the player. 0 = caught. */
  meltGap: number;
  /** Consecutive coins collected without a hit or cash-out (Snowball mode). */
  snowball: number;
  gatesSeen: number;
  gatesHit: number;
  coinsCollected: number;
  meltEaten: number;
  hits: number;
  cashOuts: number;
  lastBiteEventAt: number;
  shields: number;
  shieldsUsed: number;
  autoBankTimer: number;
  /** The question currently on its way (shown in the HUD), if any. */
  question: { id: number; text: string; options: string[] } | null;
  questionIndex: number;
  nextQuestionAt: number;
  answersRight: number;
  answersWrong: number;
  /** Time runs this much slower than real time: 0 while paused on a guided question, 1 normally. */
  timeScale: number;
  /** The guided question on its way or being asked (gateHelp 'guide'). */
  ask: Ask | null;
  /** Final-score multiplier from the loadout (rolled once per run). */
  loadoutMultiplier: number;
  entities: Entity[];
  nextSpawnZ: number;
  nextGateAt: number;
  /** Distance after which the next Hot Tip gets a Dash cameo (one at a time on screen). */
  nextDashAt: number;
  dashCameos: number;
  /** Dash traps that landed in the player's lane and were dodged. */
  dashDodged: number;
  /** Coins that went past uncollected, and how many in a row since the last one collected. */
  coinsMissed: number;
  missStreak: number;
  /** Dash overtaking Kip after a slip: cosmetic, drawn from these (see OVERTAKE_SECONDS). */
  overtake: { start: number; lane: Lane; reason: OvertakeReason } | null;
  overtakes: number;
  lastOvertakeAt: number;
  /** Risk Lanes: invested coins at each risk level (banked = their total). */
  holdings: Record<RiskTier, number>;
  nextSwingAt: number;
  /** A separate random stream for market swings, so they never change the track layout. */
  swingRng: Rng;
  wildBest: number;
  wildWorst: number;
  /** Run times (seconds) of the surprise expenses still to come. */
  emergencyTimes: number[];
  /** Extra coins lost selling investments in a hurry because there was no idle cash. */
  emergencyShort: number;
  riskRow: number;
  lastRiskRowSeen: number;
  /** Time Tracks: the current stage and what each stage earned, cost and traded. */
  tf: TfState;
  nextId: number;
  over: boolean;
  outcome: 'finished' | 'caught' | null;
  events: RunEvent[];
  rng: Rng;
}

export const VIEW_DISTANCE = 70;
export const JUMP_TIME = 0.75;
export const SLIDE_TIME = 0.75;
export const MELT_MAX_GAP = 26;
export const MELT_DANGER_GAP = 9;
const COLLIDE_WINDOW = 0.9;

/*
 * Risk Lanes (World 3). Gate rows have one gate per lane: SAFE, BALANCED, WILD. Running through one
 * invests your idle coins at that level. Every few seconds the market moves each level: SAFE inches
 * up, BALANCED wobbles, WILD jumps or crashes. Twice a run a surprise expense must be paid from idle
 * coins; without them you sell investments in a hurry, at a loss. Higher return, bigger swings,
 * and why you keep some cash.
 */
export const RISK_SWING_EVERY = 6;
export const RISK_RETURNS: Record<RiskTier, { mean: number; spread: number }> = {
  safe: { mean: 0.01, spread: 0 },
  balanced: { mean: 0.025, spread: 0.06 },
  wild: { mean: 0.04, spread: 0.18 },
};
/** When the surprise expenses happen, as a share of the run. */
const RISK_EMERGENCIES = [0.4, 0.75];
export const RISK_EMERGENCY_COST = 8;
/** Selling in a hurry costs this much extra on whatever idle cash couldn't cover. */
const RISK_HURRY_COST = 0.25;
const TIERS: RiskTier[] = ['safe', 'balanced', 'wild'];

/*
 * Time Tracks (World 7). The run is split into four equal stages, slowest last.
 */
export type TfStage = 'scalp' | 'intraday' | 'swing' | 'long';
export const TF_STAGES: TfStage[] = ['scalp', 'intraday', 'swing', 'long'];
export const TF_INFO: Record<TfStage, { label: string; emoji: string; speed: number; fee: number; coin: number; color: string }> = {
  scalp: { label: 'SCALPING', emoji: '⚡', speed: 20, fee: 1, coin: 0.5, color: '#E5484D' },
  intraday: { label: 'INTRADAY', emoji: '☀️', speed: 16, fee: 1, coin: 1, color: '#F2B544' },
  swing: { label: 'SWING', emoji: '🌙', speed: 14, fee: 1, coin: 1, color: '#6366F1' },
  long: { label: 'LONG TERM', emoji: '🐢', speed: 11, fee: 0, coin: 1, color: '#2DBE7E' },
};
/** Long term: banked coins grow this much every TF_GROWTH_EVERY seconds (compounding). */
export const TF_GROWTH = 0.04;
export const TF_GROWTH_EVERY = 2;
/** Long term: idle coins are invested automatically this often (a SIP, no fees). */
const TF_AUTO_INVEST_EVERY = 3;
/** Swing: a news gap you didn't jump takes this share of your idle coins. */
export const TF_GAP_LOSS = 0.35;

export interface TfStageResult {
  stage: TfStage;
  /** Coins banked during the stage (after fees), including long-term growth. */
  net: number;
  fees: number;
  trades: number;
}

export interface TfState {
  stage: TfStage;
  stageStartBanked: number;
  results: Record<TfStage, TfStageResult>;
  nextGrowthAt: number;
  autoInvestTimer: number;
  growth: number;
  gapsHit: number;
  gapsJumped: number;
}

export const tfStageAt = (time: number, durationSec: number): TfStage => TF_STAGES[Math.min(TF_STAGES.length - 1, Math.max(0, Math.floor((time / durationSec) * TF_STAGES.length)))];

function initialTf(): TfState {
  const results = Object.fromEntries(TF_STAGES.map((stage) => [stage, { stage, net: 0, fees: 0, trades: 0 }])) as Record<TfStage, TfStageResult>;
  return { stage: 'scalp', stageStartBanked: 0, results, nextGrowthAt: Infinity, autoInvestTimer: 0, growth: 0, gapsHit: 0, gapsJumped: 0 };
}
/*
 * Dash's Hot Tip cameo, with progressive difficulty. A new player first meets Dash: he's rare,
 * and his trap sits on the road from the horizon. As they prove they can dodge his traps, he drops
 * them closer and more often. Warning times are at the starting speed (13 m/s).
 */
export interface DashTier {
  /** Minimum metres between cameos (always longer than a cameo lasts: never two Dashes). */
  spacing: number;
  /** Where he drops the trap; null = it's there all along. */
  dropZ: number | null;
}
export const DASH_TIERS: DashTier[] = [
  { spacing: 160, dropZ: null }, // Meet Dash: ~5 s to react, Kip explains
  { spacing: 120, dropZ: 52 }, // ~4 s
  { spacing: 90, dropZ: 44 }, // ~3.4 s
  { spacing: 70, dropZ: 36 }, // ~2.7 s
];
/** Lifetime dodges of Dash traps (in the player's own lane) needed to reach each tier. */
export const DASH_TIER_DODGES = [0, 3, 8, 15];

export function dashTierFor(dodged: number): number {
  let tier = 0;
  DASH_TIER_DODGES.forEach((need, i) => {
    if (dodged >= need) tier = i;
  });
  return tier;
}

/** Metres ahead where Dash's path is cued (shared with the renderer). */
export const DASH_START_Z = -3;

/*
 * Dash overtakes: when the player slips (hits an Impulse Buy, a fee or a Hot Tip, cashes out, misses
 * a gate, gets an answer wrong, or lets a whole line of coins go by), Dash sprints past Kip in the next
 * lane and laughs. It's only a show: it changes no score. A cooldown keeps it from becoming noise.
 */
export const OVERTAKE_SECONDS = 1.9;
export const OVERTAKE_COOLDOWN = 5;
/** Coins missed in a row (since the last one collected) that count as leaving a line on the road. */
export const MISS_STREAK = 4;
/** Dash's speed past Kip during an overtake, in metres per second faster than Kip. */
export const OVERTAKE_SPEED = 16;

export function triggerOvertake(s: RunState, reason: OvertakeReason): void {
  if (s.over || s.time < 2) return;
  if (s.overtake || s.time - s.lastOvertakeAt < OVERTAKE_COOLDOWN) return;
  // He passes in the lane beside Kip: the middle from an edge, alternating sides from the middle.
  const lane: Lane = s.lane !== 0 ? 0 : s.overtakes % 2 === 0 ? 1 : -1;
  s.overtake = { start: s.time, lane, reason };
  s.overtakes += 1;
  s.lastOvertakeAt = s.time;
  s.events.push({ kind: 'dashOvertake', reason });
}

/** Where the overtaking Dash is now (metres ahead of Kip), or null when he isn't on screen. */
export function overtakeZ(s: RunState): number | null {
  if (!s.overtake) return null;
  const t = s.time - s.overtake.start;
  return t <= OVERTAKE_SECONDS ? DASH_START_Z + t * OVERTAKE_SPEED : null;
}
export const DASH_MEET_CUE_Z = 60;
export const DASH_DROP_CUE_Z = 68;
/** When the player first sees Dash's trap. */
export const dashRevealZ = (e: Entity) => e.dropZ ?? DASH_MEET_CUE_Z;

function rollMultiplier(config: RunConfig): number {
  const m = config.loadout?.endMultiplier;
  if (m === undefined) return 1;
  if (typeof m === 'number') return m;
  // A separate stream so the roll never changes the track layout.
  const r = createRng((config.seed ^ 0x5bd1e995) >>> 0)();
  return Math.round((m.min + r * (m.max - m.min)) * 100) / 100;
}

export function createRun(config: RunConfig): RunState {
  return {
    config,
    time: 0,
    distance: 0,
    speed: config.mode === 'timeframe' ? TF_INFO.scalp.speed : config.tutorial ? 11 : 13,
    lane: 0,
    laneX: 0,
    jumpT: 0,
    slideT: 0,
    pocket: 0,
    banked: config.loadout?.headStart ?? 0,
    meltGap: 18,
    snowball: 0,
    gatesSeen: 0,
    gatesHit: 0,
    coinsCollected: 0,
    meltEaten: 0,
    hits: 0,
    cashOuts: 0,
    lastBiteEventAt: -10,
    shields: config.loadout?.shield ?? 0,
    shieldsUsed: 0,
    autoBankTimer: 0,
    question: null,
    questionIndex: 0,
    nextQuestionAt: config.tutorial ? Infinity : 140,
    answersRight: 0,
    answersWrong: 0,
    timeScale: 1,
    ask: null,
    loadoutMultiplier: rollMultiplier(config),
    entities: [],
    nextSpawnZ: 18,
    nextGateAt: config.tutorial ? 70 : 90,
    // Cameo traps are always new rows at the horizon, never the ones already on the road at the start.
    nextDashAt: VIEW_DISTANCE + 20,
    dashCameos: 0,
    dashDodged: 0,
    coinsMissed: 0,
    missStreak: 0,
    overtake: null,
    overtakes: 0,
    lastOvertakeAt: -Infinity,
    holdings: { safe: 0, balanced: 0, wild: 0 },
    nextSwingAt: RISK_SWING_EVERY,
    swingRng: createRng((config.seed ^ 0x2545f491) >>> 0),
    wildBest: 0,
    wildWorst: 0,
    emergencyTimes: config.mode === 'risk' ? RISK_EMERGENCIES.map((f) => f * config.durationSec) : [],
    emergencyShort: 0,
    riskRow: 0,
    lastRiskRowSeen: 0,
    tf: { ...initialTf(), stageStartBanked: config.loadout?.headStart ?? 0 },
    nextId: 1,
    over: false,
    outcome: null,
    events: config.mode === 'timeframe' ? [{ kind: 'stage', stage: 'scalp' }] : [],
    rng: createRng(config.seed),
  };
}

export type Input = 'left' | 'right' | 'jump' | 'slide';

export function applyInput(s: RunState, input: Input): void {
  if (s.over) return;
  const grounded = s.jumpT <= 0;
  switch (input) {
    case 'left':
      s.lane = Math.max(-1, s.lane - 1) as Lane;
      break;
    case 'right':
      s.lane = Math.min(1, s.lane + 1) as Lane;
      break;
    case 'jump':
      if (grounded) {
        s.jumpT = JUMP_TIME;
        s.slideT = 0;
        s.events.push({ kind: 'jump' });
      }
      break;
    case 'slide':
      if (grounded) {
        s.slideT = SLIDE_TIME;
        s.events.push({ kind: 'slide' });
      }
      break;
  }
}

/** Coin value: flat in Inflation mode; compounds 4% per consecutive coin in Snowball mode (cap 3×). */
export function coinValue(s: Pick<RunState, 'config' | 'snowball'> & { tf?: TfState }): number {
  if (s.config.mode === 'timeframe') return TF_INFO[s.tf?.stage ?? 'intraday'].coin;
  return s.config.mode === 'snowball' ? Math.min(Math.pow(1.04, s.snowball), 3) : 1;
}

function laneOf(rng: Rng): Lane {
  return (Math.floor(rng() * 3) - 1) as Lane;
}

function spawn(s: RunState, kind: EntityKind, lane: Lane, z: number) {
  s.entities.push({ id: s.nextId++, kind, lane, z, done: false });
}

/** Adds the next row of the track at `s.nextSpawnZ` metres ahead. */
function spawnRow(s: RunState) {
  const { rng } = s;
  const z = s.nextSpawnZ;
  const tutorial = s.config.tutorial ?? false;

  const questions = s.config.questions ?? [];
  if (questions.length && !s.question && s.distance + z >= s.nextQuestionAt) {
    // Answer Gates: one answer per lane, shuffled so the right lane varies.
    const q = questions[s.questionIndex % questions.length];
    const order = [0, 1, 2];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const id = s.nextId;
    order.forEach((optionIndex, i) => {
      s.entities.push({ id: s.nextId++, kind: 'answer', lane: (i - 1) as Lane, z, done: false, label: q.options[optionIndex], correct: optionIndex === q.correct, questionId: id });
    });
    s.question = { id, text: q.q, options: order.map((o) => q.options[o]) };
    if (s.config.gateHelp === 'guide') s.ask = { questionId: id, correctLane: (order.indexOf(q.correct) - 1) as Lane, phase: 'coming', picked: null };
    else if (s.config.gateHelp === 'slowmo') s.events.push({ kind: 'slowmo' });
    s.questionIndex += 1;
    s.nextQuestionAt = s.distance + z + 170 + rng() * 40;
    s.nextGateAt = Math.max(s.nextGateAt, s.distance + z + 30);
    s.nextSpawnZ += 16;
    return;
  }

  if (s.distance + z >= s.nextGateAt && s.config.mode === 'risk') {
    // Risk Lanes: a gate in every lane, one per risk level.
    s.riskRow += 1;
    for (const lane of [-1, 0, 1] as Lane[]) {
      s.entities.push({ id: s.nextId++, kind: 'riskGate', lane, z, done: false, tier: RISK_TIER_OF_LANE[lane], row: s.riskRow });
    }
    s.nextGateAt += tutorial ? 75 : 80 + rng() * 25;
    s.nextSpawnZ += 14;
    return;
  }

  if (s.config.mode === 'timeframe') {
    spawnTimeframeRow(s, z);
    return;
  }

  if (s.distance + z >= s.nextGateAt) {
    // A gate row: the gate in one lane, a temptation or a clear lane elsewhere.
    const gateLane = laneOf(rng);
    spawn(s, s.config.mode === 'snowball' ? 'sipGate' : 'investGate', gateLane, z);
    if (s.config.mode === 'snowball') {
      const others = ([-1, 0, 1] as Lane[]).filter((l) => l !== gateLane);
      spawn(s, 'cashOut', others[Math.floor(rng() * 2)], z);
    }
    s.nextGateAt += tutorial ? 75 : 85 + rng() * 25;
    s.nextSpawnZ += 14;
    return;
  }

  const roll = rng();
  const obstacleRate = tutorial ? 0.3 : 0.42;
  if (roll < obstacleRate) {
    const kinds: EntityKind[] = ['billboard', 'hotTip', 'toll'];
    const kind = kinds[Math.floor(rng() * kinds.length)];
    const lane = laneOf(rng);
    spawn(s, kind, lane, z);
    if (kind === 'hotTip' && s.distance + z >= s.nextDashAt) {
      // Dash sprints past and drops this one (no extra RNG, so track layouts don't change).
      // Each run's first cameo is a tier gentler, as a warm-up.
      const tier = Math.min(Math.max(s.config.dashTier ?? 0, 0), DASH_TIERS.length - 1);
      const { spacing, dropZ } = DASH_TIERS[s.dashCameos === 0 ? Math.max(tier - 1, 0) : tier];
      const trap = s.entities[s.entities.length - 1];
      trap.byDash = true;
      trap.dropZ = dropZ;
      s.nextDashAt = s.distance + z + spacing;
      s.dashCameos += 1;
    }
    // Coins in a different lane give a reason to dodge.
    const coinLane = ((lane + 1 + Math.floor(rng() * 2) + 1) % 3) - 1;
    for (let i = 0; i < 3; i++) spawn(s, 'coin', coinLane as Lane, z + i * 2.2);
    s.nextSpawnZ += tutorial ? 16 : 12 + rng() * 4;
  } else {
    const lane = laneOf(rng);
    const count = 4 + Math.floor(rng() * 3);
    for (let i = 0; i < count; i++) spawn(s, 'coin', lane, z + i * 2.2);
    s.nextSpawnZ += count * 2.2 + 4 + rng() * 3;
  }
}

/** The stage a row at `z` metres ahead will be reached in (close enough at the current speed). */
function stageAhead(s: RunState, z: number): TfStage {
  return tfStageAt(s.time + z / Math.max(s.speed, 1), s.config.durationSec);
}

function spawnAcross(s: RunState, kind: EntityKind, z: number) {
  for (const lane of [-1, 0, 1] as Lane[]) spawn(s, kind, lane, z);
}

/** Time Tracks rows. Each stage has its own rhythm, so the same road feels different at each speed. */
function spawnTimeframeRow(s: RunState, z: number) {
  const { rng } = s;
  const stage = stageAhead(s, z);
  const lane = laneOf(rng);
  switch (stage) {
    case 'scalp': {
      // A quick dash for a few tiny coins, then a FEE arch across the road: every trade costs.
      for (let i = 0; i < 4; i++) spawn(s, 'coin', lane, z + i * 2.2);
      spawnAcross(s, 'tradeFee', z + 4 * 2.2 + 5);
      s.nextSpawnZ += 4 * 2.2 + 12 + rng() * 4;
      return;
    }
    case 'intraday': {
      if (s.distance + z >= s.nextGateAt) {
        // The 3:30 bell: every position is squared off (banked, minus a fee).
        spawnAcross(s, 'bell', z);
        s.nextGateAt = s.distance + z + 70 + rng() * 15;
        s.nextSpawnZ += 14;
        return;
      }
      if (rng() < 0.4) {
        const kinds: EntityKind[] = ['billboard', 'hotTip', 'toll'];
        spawn(s, kinds[Math.floor(rng() * kinds.length)], lane, z);
        const coinLane = ((lane + 1 + Math.floor(rng() * 2) + 1) % 3) - 1;
        for (let i = 0; i < 3; i++) spawn(s, 'coin', coinLane as Lane, z + i * 2.2);
        s.nextSpawnZ += 13 + rng() * 4;
      } else {
        const count = 4 + Math.floor(rng() * 3);
        for (let i = 0; i < count; i++) spawn(s, 'coin', lane, z + i * 2.2);
        s.nextSpawnZ += count * 2.2 + 4 + rng() * 3;
      }
      return;
    }
    case 'swing': {
      if (s.distance + z >= s.nextGateAt) {
        // Fewer trades: a single INVEST gate banks the position (one fee).
        spawn(s, 'investGate', lane, z);
        s.nextGateAt = s.distance + z + 85 + rng() * 20;
        s.nextSpawnZ += 14;
        return;
      }
      if (rng() < 0.45) {
        // Overnight news: a gap opens in one or two lanes. Jump it or lose part of your idle coins.
        spawn(s, 'gap', lane, z);
        if (rng() < 0.4) spawn(s, 'gap', (lane === 1 ? 0 : lane + 1) as Lane, z);
        const coinLane = ((lane + 2) % 3) - 1;
        for (let i = 0; i < 3; i++) spawn(s, 'coin', coinLane as Lane, z + 6 + i * 2.2);
        s.nextSpawnZ += 16 + rng() * 4;
      } else {
        const count = 4 + Math.floor(rng() * 3);
        for (let i = 0; i < count; i++) spawn(s, 'coin', lane, z + i * 2.2);
        s.nextSpawnZ += count * 2.2 + 5 + rng() * 3;
      }
      return;
    }
    case 'long': {
      // Calm: steady coins, and dividends dropping in now and then. Nothing to dodge.
      const count = 5 + Math.floor(rng() * 3);
      for (let i = 0; i < count; i++) spawn(s, i === 2 && rng() < 0.6 ? 'dividend' : 'coin', lane, z + i * 2.2);
      s.nextSpawnZ += count * 2.2 + 6 + rng() * 3;
      return;
    }
  }
}

/** Time Tracks: bank the pocket as a trade, paying the stage's fee (from the pocket, then banked). */
function tfTrade(s: RunState, fee: number) {
  const stage = s.tf.stage;
  const amount = s.pocket;
  s.banked += amount - fee;
  s.pocket = 0;
  s.tf.results[stage].fees += fee;
  s.tf.results[stage].trades += 1;
  return amount - fee;
}

/** Time Tracks: a new stage starts. The old stage's position is closed (banked, no extra fee). */
function tfNextStage(s: RunState, next: TfStage) {
  const prev = s.tf.stage;
  s.banked += s.pocket;
  s.pocket = 0;
  s.tf.results[prev].net = s.banked - s.tf.stageStartBanked;
  s.tf.stageStartBanked = s.banked;
  s.tf.stage = next;
  s.nextGateAt = s.distance + 40;
  if (next === 'long') s.tf.nextGrowthAt = s.time + TF_GROWTH_EVERY;
  s.events.push({ kind: 'stage', stage: next });
}

/** Uses up a loadout shield if one is left (FD power-up). */
function absorbedByShield(s: RunState): boolean {
  if (s.shields <= 0) return false;
  s.shields -= 1;
  s.shieldsUsed += 1;
  s.events.push({ kind: 'shield' });
  return true;
}

function hit(s: RunState, kind: 'impulse' | 'hotTip', meltPenalty: number, pocketLossShare: number) {
  if (absorbedByShield(s)) return;
  const lost = s.pocket * pocketLossShare;
  s.pocket -= lost;
  s.meltGap = Math.max(s.meltGap - meltPenalty, 0);
  s.snowball = 0;
  s.hits += 1;
  s.events.push({ kind, amount: Math.round(lost) });
  triggerOvertake(s, kind);
}

function collide(s: RunState, e: Entity) {
  const airborne = s.jumpT > 0;
  const sliding = s.slideT > 0;
  switch (e.kind) {
    case 'dividend':
    case 'coin':
      if (airborne && s.jumpT > JUMP_TIME * 0.25 && s.jumpT < JUMP_TIME * 0.75) return; // flew over it
      if (e.kind === 'dividend') {
        s.pocket += 3;
        s.events.push({ kind: 'dividend', amount: 3 });
      }
      s.pocket += coinValue(s);
      s.snowball += 1;
      s.coinsCollected += 1;
      s.missStreak = 0;
      s.meltGap = Math.min(s.meltGap + 0.35, MELT_MAX_GAP);
      s.events.push({ kind: 'coin', amount: 1 });
      break;
    case 'billboard': // Impulse Buy sign: slide under it
      if (!sliding) hit(s, 'impulse', 5, 0.2);
      break;
    case 'toll': // Fee booth: jump over it
      if (!airborne && !absorbedByShield(s)) {
        const fee = Math.min(3, s.pocket);
        s.pocket -= fee;
        s.meltGap = Math.max(s.meltGap - 3, 0);
        s.hits += 1;
        s.snowball = 0;
        s.events.push({ kind: 'fee', amount: Math.round(fee) });
        triggerOvertake(s, 'fee');
      }
      break;
    case 'hotTip': // Dash's trap: can't jump or slide past, must change lane
      hit(s, 'hotTip', 7, 0.3);
      break;
    case 'tradeFee': {
      const fee = TF_INFO[s.tf.stage].fee;
      tfTrade(s, fee);
      s.events.push({ kind: 'tradeFee', amount: fee });
      break;
    }
    case 'bell': {
      const net = tfTrade(s, TF_INFO[s.tf.stage].fee);
      s.meltGap = Math.min(s.meltGap + 6, MELT_MAX_GAP);
      s.events.push({ kind: 'bell', amount: Math.round(net) });
      break;
    }
    case 'gap':
      if (airborne) {
        s.tf.gapsJumped += 1;
        return;
      }
      if (absorbedByShield(s)) return;
      {
        const lost = s.pocket * TF_GAP_LOSS;
        s.pocket -= lost;
        s.tf.gapsHit += 1;
        s.hits += 1;
        s.meltGap = Math.max(s.meltGap - 3, 0);
        s.events.push({ kind: 'gapDown', amount: Math.round(lost) });
      }
      break;
    case 'investGate':
    case 'sipGate': {
      if (s.config.mode === 'timeframe') {
        const net = tfTrade(s, TF_INFO[s.tf.stage].fee);
        s.gatesHit += 1;
        s.gatesSeen += 1;
        s.meltGap = Math.min(s.meltGap + 8, MELT_MAX_GAP);
        s.events.push({ kind: 'bank', amount: Math.round(net) });
        break;
      }
      const bonus = (e.kind === 'sipGate' ? 0.1 : 0) + (s.config.loadout?.gateBonus ?? 0);
      const amount = s.pocket * (1 + bonus);
      s.banked += amount;
      s.pocket = 0;
      s.gatesHit += 1;
      s.gatesSeen += 1;
      s.meltGap = Math.min(s.meltGap + 8, MELT_MAX_GAP);
      s.events.push({ kind: 'bank', amount: Math.round(amount) });
      break;
    }
    case 'riskGate': {
      const tier = e.tier ?? 'balanced';
      const amount = s.pocket * (1 + (s.config.loadout?.gateBonus ?? 0));
      s.holdings[tier] += amount;
      s.pocket = 0;
      s.banked = holdingsTotal(s);
      s.gatesHit += 1;
      if ((e.row ?? 0) > s.lastRiskRowSeen) {
        s.gatesSeen += 1;
        s.lastRiskRowSeen = e.row ?? 0;
      }
      s.meltGap = Math.min(s.meltGap + 8, MELT_MAX_GAP);
      s.events.push({ kind: 'bank', amount: Math.round(amount) });
      break;
    }
    case 'cashOut':
      if (s.config.loadout?.blockCashOut) return; // PPF: money is locked in
      s.pocket += 15;
      s.snowball = 0;
      s.cashOuts += 1;
      s.events.push({ kind: 'cashOut', amount: 15 });
      triggerOvertake(s, 'cashOut');
      break;
    case 'answer': {
      s.question = null;
      // Guided questions were already scored on the card; the gate only banks (or doesn't).
      const guided = s.ask?.questionId === e.questionId ? s.ask : null;
      if (guided) s.ask = null;
      if (e.correct) {
        // Right answer: bank the pocket plus a bonus, and push The Melt back.
        // Guided: the bonus is for knowing the answer, not for following Kip's arrow.
        const knew = !guided || guided.picked === guided.correctLane;
        const amount = s.pocket + (knew ? 5 : 0);
        s.banked += amount;
        s.pocket = 0;
        if (!guided) s.answersRight += 1;
        s.meltGap = Math.min(s.meltGap + 10, MELT_MAX_GAP);
        s.events.push({ kind: knew ? 'answerRight' : 'bank', amount: Math.round(amount) });
      } else {
        if (!guided) s.answersWrong += 1;
        const lost = s.pocket * 0.2;
        s.pocket -= lost;
        s.meltGap = Math.max(s.meltGap - 6, 0);
        s.snowball = 0;
        s.events.push({ kind: 'answerWrong', amount: Math.round(lost) });
        triggerOvertake(s, 'answerWrong');
      }
      break;
    }
  }
}

/** Advances the simulation by `dt` seconds. */
export function step(s: RunState, dt: number): void {
  if (s.over) return;
  const real = Math.min(dt, 0.05);
  updateAsk(s);
  const target = targetTimeScale(s);
  s.timeScale += (target - s.timeScale) * Math.min(1, real * TIME_EASE);
  if (Math.abs(target - s.timeScale) < 0.02) s.timeScale = target;
  const d = real * s.timeScale;
  if (d <= 0) return;
  s.time += d;
  if (s.overtake && s.time - s.overtake.start > OVERTAKE_SECONDS) s.overtake = null;

  // Speed ramps up over the run (Time Tracks: each stage has its own speed, eased in).
  const progress = s.time / s.config.durationSec;
  if (s.config.mode === 'timeframe') {
    const stage = tfStageAt(s.time, s.config.durationSec);
    if (stage !== s.tf.stage) tfNextStage(s, stage);
    s.speed += (TF_INFO[stage].speed - s.speed) * Math.min(1, d * 1.5);
    timeframeTick(s, d);
  } else s.speed = (s.config.tutorial ? 11 : 13) + progress * (s.config.tutorial ? 4 : 8);
  const move = s.speed * d;
  s.distance += move;

  s.jumpT = Math.max(s.jumpT - d, 0);
  s.slideT = Math.max(s.slideT - d, 0);
  s.laneX += Math.sign(s.lane - s.laneX) * Math.min(Math.abs(s.lane - s.laneX), 10 * d);

  // The Melt creeps closer every second; banking and coins push it back.
  const creep = s.config.tutorial ? 0.35 : s.config.mode === 'inflation' ? 0.75 : s.config.mode === 'timeframe' && s.tf.stage === 'long' ? 0.3 : 0.45;

  if (s.config.mode === 'risk') {
    if (s.time >= s.nextSwingAt) marketSwing(s);
    if (s.emergencyTimes.length && s.time >= s.emergencyTimes[0]) {
      s.emergencyTimes.shift();
      surpriseExpense(s);
    }
  }
  s.meltGap = Math.max(s.meltGap - creep * d, 0);

  if (s.meltGap < MELT_DANGER_GAP && s.pocket > 0) {
    const biteRate = 0.12 * (s.config.loadout?.meltBiteFactor ?? 1); // ~12% per second when close
    const bite = s.pocket * (1 - Math.pow(1 - biteRate, d));
    s.pocket -= bite;
    s.meltEaten += bite;
    if (s.time - s.lastBiteEventAt > 0.6) {
      s.lastBiteEventAt = s.time;
      s.events.push({ kind: 'meltBite', amount: Math.max(1, Math.round(bite)) });
    }
  }

  // SIP power-up: idle coins are banked automatically every few seconds.
  const every = s.config.loadout?.autoBankEvery;
  if (every) {
    s.autoBankTimer += d;
    if (s.autoBankTimer >= every) {
      s.autoBankTimer = 0;
      if (s.pocket >= 1) {
        const amount = s.pocket;
        s.banked += amount;
        s.pocket = 0;
        s.meltGap = Math.min(s.meltGap + 3, MELT_MAX_GAP);
        s.events.push({ kind: 'autoBank', amount: Math.round(amount) });
      }
    }
  }

  // Move the world toward the player.
  for (const e of s.entities) e.z -= move;
  s.nextSpawnZ -= move;
  while (s.nextSpawnZ < VIEW_DISTANCE) spawnRow(s);

  const playerLane = Math.round(s.laneX);
  for (const e of s.entities) {
    if (e.done) continue;
    if (e.byDash && !e.announced && e.z <= dashRevealZ(e)) {
      e.announced = true;
      e.threatened = e.lane === s.lane;
      s.events.push({ kind: 'dashDrop' });
    }
    if (e.z <= COLLIDE_WINDOW / 2 && e.z >= -COLLIDE_WINDOW / 2) {
      if (e.lane === playerLane) {
        e.done = true;
        collide(s, e);
      }
    } else if (e.z < -COLLIDE_WINDOW / 2) {
      e.done = true;
      if (e.byDash && e.threatened) s.dashDodged += 1;
      if (e.kind === 'riskGate' && (e.row ?? 0) > s.lastRiskRowSeen) {
        s.gatesSeen += 1;
        s.lastRiskRowSeen = e.row ?? 0;
        s.events.push({ kind: 'gateMissed' });
      }
      if (e.kind === 'investGate' || e.kind === 'sipGate') {
        s.gatesSeen += 1;
        s.events.push({ kind: 'gateMissed' });
        triggerOvertake(s, 'gateMissed');
      }
      if (e.kind === 'coin' || e.kind === 'dividend') {
        s.coinsMissed += 1;
        s.missStreak += 1;
        if (s.missStreak >= MISS_STREAK) {
          s.missStreak = 0;
          triggerOvertake(s, 'missedCoins');
        }
      }
      if (e.kind === 'answer' && s.question?.id === e.questionId) s.question = null;
      if (e.kind === 'answer' && s.ask?.questionId === e.questionId) s.ask = null;
    }
  }
  s.entities = s.entities.filter((e) => e.z > -6);

  if (s.meltGap <= 0) {
    s.over = true;
    s.outcome = 'caught';
    s.meltEaten += s.pocket;
    s.pocket = 0;
    s.events.push({ kind: 'caught' });
  } else if (s.time >= s.config.durationSec) {
    s.over = true;
    s.outcome = 'finished';
    if (s.config.mode === 'timeframe') {
      // The last stage closes like the others.
      s.banked += s.pocket;
      s.pocket = 0;
      s.tf.results[s.tf.stage].net = s.banked - s.tf.stageStartBanked;
    }
    s.events.push({ kind: 'finished' });
  }
  if (s.outcome === 'caught' && s.config.mode === 'timeframe') s.tf.results[s.tf.stage].net = s.banked - s.tf.stageStartBanked;
}

/** Guided gates: pause for the question once its gates are close enough to read. */
function updateAsk(s: RunState) {
  const a = s.ask;
  if (!a || a.phase !== 'coming') return;
  const gate = s.entities.find((e) => e.kind === 'answer' && e.questionId === a.questionId && !e.done);
  if (gate && gate.z <= ASK_Z) {
    a.phase = 'asking';
    s.events.push({ kind: 'ask' });
  }
}

/** How fast time should run right now (see GateHelp). */
function targetTimeScale(s: RunState): number {
  if (s.ask && (s.ask.phase === 'asking' || s.ask.phase === 'answered')) return 0;
  if (s.ask?.phase === 'go') return GUIDED_GO_SCALE;
  if (s.config.gateHelp === 'slowmo' && s.question) {
    const id = s.question.id;
    const gate = s.entities.find((e) => e.kind === 'answer' && e.questionId === id && !e.done);
    if (gate && gate.z <= SLOWMO_Z) return SLOWMO_SCALE;
  }
  return 1;
}

/**
 * Guided gates: the player's answer on the card. Scores the question (right or wrong) and holds
 * the pause on the result until resumeAsk. Returns whether it was right (null if nothing was asked).
 */
export function answerAsk(s: RunState, lane: Lane): boolean | null {
  const a = s.ask;
  if (!a || a.phase !== 'asking') return null;
  a.picked = lane;
  a.phase = 'answered';
  const right = lane === a.correctLane;
  if (right) s.answersRight += 1;
  else s.answersWrong += 1;
  s.events.push({ kind: right ? 'askRight' : 'askWrong' });
  return right;
}

/** Guided gates: back to running, with Kip pointing at the right gate. */
export function resumeAsk(s: RunState): void {
  if (s.ask?.phase === 'answered') s.ask.phase = 'go';
}

/** Time Tracks, long-term stage: idle coins are invested automatically, and banked coins compound. */
function timeframeTick(s: RunState, d: number) {
  if (s.tf.stage !== 'long') return;
  s.tf.autoInvestTimer += d;
  if (s.tf.autoInvestTimer >= TF_AUTO_INVEST_EVERY) {
    s.tf.autoInvestTimer = 0;
    if (s.pocket >= 1) {
      const amount = s.pocket;
      s.banked += amount;
      s.pocket = 0;
      s.meltGap = Math.min(s.meltGap + 3, MELT_MAX_GAP);
      s.events.push({ kind: 'autoBank', amount: Math.round(amount) });
    }
  }
  if (s.time >= s.tf.nextGrowthAt) {
    s.tf.nextGrowthAt += TF_GROWTH_EVERY;
    const grown = Math.max(s.banked, 0) * TF_GROWTH;
    s.banked += grown;
    s.tf.growth += grown;
    if (grown >= 1) s.events.push({ kind: 'growth', amount: Math.round(grown) });
  }
}

export interface RunResult {
  mode: RunMode;
  outcome: 'finished' | 'caught';
  banked: number;
  /** Coins still in the pocket at the finish (idle money; worth half). */
  pocketLeft: number;
  meltEaten: number;
  gatesHit: number;
  gatesSeen: number;
  consistency: number;
  multiplier: number;
  coinsAwarded: number;
  coinsCollected: number;
  hits: number;
  cashOuts: number;
  distance: number;
  answersRight: number;
  answersWrong: number;
  /** How Answer Gates were played this run (guided answers count toward graduating to slow-mo). */
  gateHelp?: GateHelp;
  shieldsUsed: number;
  /** The equipped card's final multiplier (1 when none). */
  loadoutMultiplier: number;
  loadoutId?: string;
  /** Dash traps dodged in the player's own lane (raises his difficulty tier). */
  dashDodged: number;
  /** Risk Lanes only: where the coins ended up, the WILD lane's best and worst swing (%), and the hurry-sale loss. */
  risk?: { safe: number; balanced: number; wild: number; wildBest: number; wildWorst: number; emergencyShort: number };
  /** Time Tracks only: what each stage earned (after fees), cost and traded; long-term growth; news gaps. */
  timeframe?: { stages: TfStageResult[]; growth: number; gapsHit: number; gapsJumped: number };
}

/**
 * End-of-run compounding reveal. Banked coins are multiplied by consistency
 * (share of gates hit); idle pocket coins only count half. Cash-outs cut the multiplier.
 */
const holdingsTotal = (s: RunState) => s.holdings.safe + s.holdings.balanced + s.holdings.wild;

/** The market moves each risk level. Only big WILD moves are announced. */
function marketSwing(s: RunState) {
  s.nextSwingAt += RISK_SWING_EVERY;
  for (const tier of TIERS) {
    const { mean, spread } = RISK_RETURNS[tier];
    const r = Math.max(mean + spread * normal(s.swingRng), -0.6);
    s.holdings[tier] *= 1 + r;
    if (tier === 'wild') {
      s.wildBest = Math.max(s.wildBest, r);
      s.wildWorst = Math.min(s.wildWorst, r);
      if (s.holdings.wild >= 1 && Math.abs(r) >= 0.12) s.events.push({ kind: r > 0 ? 'swingUp' : 'swingDown', amount: Math.round(Math.abs(r) * 100) });
    }
  }
  s.banked = holdingsTotal(s);
}

/** A surprise expense: idle coins pay it; any shortfall is sold from investments, safest first, at a loss. */
function surpriseExpense(s: RunState) {
  const cost = RISK_EMERGENCY_COST;
  const fromPocket = Math.min(s.pocket, cost);
  s.pocket -= fromPocket;
  const short = cost - fromPocket;
  if (short <= 0) {
    s.events.push({ kind: 'emergency', amount: cost });
    return;
  }
  let need = short * (1 + RISK_HURRY_COST);
  const total = need;
  for (const tier of TIERS) {
    const take = Math.min(s.holdings[tier], need);
    s.holdings[tier] -= take;
    need -= take;
  }
  s.emergencyShort += short * RISK_HURRY_COST;
  s.banked = holdingsTotal(s);
  s.events.push({ kind: 'emergencyShort', amount: Math.round(total - need) });
  triggerOvertake(s, 'emergencyShort');
}

export function summarise(s: RunState): RunResult {
  const gatesSeen = s.gatesSeen;
  const consistency = gatesSeen === 0 ? 0 : s.gatesHit / gatesSeen;
  const multiplier = Math.max(1 + consistency - 0.15 * s.cashOuts, 1);
  const pocketLeft = s.outcome === 'finished' ? s.pocket : 0;
  const coinsAwarded = Math.round((s.banked * multiplier + pocketLeft * 0.5) * s.loadoutMultiplier);
  return {
    mode: s.config.mode,
    outcome: s.outcome ?? 'finished',
    banked: Math.round(s.banked),
    pocketLeft: Math.round(pocketLeft),
    meltEaten: Math.round(s.meltEaten),
    gatesHit: s.gatesHit,
    gatesSeen,
    consistency,
    multiplier: Math.round(multiplier * 100) / 100,
    coinsAwarded,
    coinsCollected: s.coinsCollected,
    hits: s.hits,
    cashOuts: s.cashOuts,
    distance: Math.round(s.distance),
    answersRight: s.answersRight,
    answersWrong: s.answersWrong,
    gateHelp: s.config.gateHelp,
    shieldsUsed: s.shieldsUsed,
    loadoutMultiplier: s.loadoutMultiplier,
    loadoutId: s.config.loadout?.id,
    dashDodged: s.dashDodged,
    risk:
      s.config.mode === 'risk'
        ? {
            safe: Math.round(s.holdings.safe),
            balanced: Math.round(s.holdings.balanced),
            wild: Math.round(s.holdings.wild),
            wildBest: Math.round(s.wildBest * 100),
            wildWorst: Math.round(s.wildWorst * 100),
            emergencyShort: Math.round(s.emergencyShort),
          }
        : undefined,
    timeframe:
      s.config.mode === 'timeframe'
        ? {
            stages: TF_STAGES.map((stage) => ({ ...s.tf.results[stage], net: Math.round(s.tf.results[stage].net * 10) / 10 })),
            growth: Math.round(s.tf.growth),
            gapsHit: s.tf.gapsHit,
            gapsJumped: s.tf.gapsJumped,
          }
        : undefined,
  };
}

/** Risk Lanes: invested coins aren't safe from swings, so banking reads differently there. */
export const KIP_TIPS_RISK: Partial<Record<RunEventKind, string>> = {
  bank: 'Invested! Now the market moves it. SAFE inches up, WILD swings.',
  gateMissed: 'Missed a row. Pick a lane: SAFE, BALANCED or WILD.',
};

/** Time Tracks: Kip explains each stage as it starts. */
export const TF_STAGE_TIPS: Record<TfStage, string> = {
  scalp: '⚡ Scalping: tiny coins, and a FEE on every trade. Fast and frantic!',
  intraday: '☀️ Intraday: everything is squared off at the 3:30 bell, minus a fee.',
  swing: '🌙 Swing: holding overnight. Jump ↑ the NEWS GAPS or lose idle coins.',
  long: '🐢 Long term: no fees, coins invest themselves, and what you bank compounds.',
};

/** Kip's non-blocking tip for the first time each event happens in a run. */
export const KIP_TIPS: Partial<Record<RunEventKind, string>> = {
  bank: 'Banked! Invested coins are safe from The Melt.',
  answerRight: 'Right answer! Knowledge banks your coins.',
  answerWrong: 'Not quite. The Melt gains when you guess wrong.',
  shield: 'Your FD shield took that hit. Safety first!',
  autoBank: 'Your SIP banked idle coins automatically.',
  gateMissed: 'Missed a gate. Idle coins are still exposed!',
  impulse: 'Impulse buy! Slide ↓ under SALE signs.',
  hotTip: "Dash's hot tip! Switch lanes to dodge those.",
  dashDrop: "Dash dropped a HOT TIP! Don't follow tips: dodge it.",
  swingUp: 'WILD jumped! Big swings go both ways.',
  swingDown: 'WILD dropped hard. That’s the price of its higher return.',
  emergency: 'Surprise expense, paid from idle coins. That’s what cash is for.',
  emergencyShort: 'No idle coins! You sold investments in a hurry, at a loss.',
  fee: 'Fees add up. Jump ↑ over the FEE booth.',
  tradeFee: 'Every trade pays a fee. Tiny gains, certain costs.',
  bell: '3:30 bell: positions closed and banked, minus a fee.',
  gapDown: 'Overnight news gap! Prices opened lower. Jump ↑ them next time.',
  dividend: 'A dividend! Long-term owners get paid just for holding.',
  growth: 'Your banked coins compounded. Time in the market at work.',
  dashOvertake: 'Dash zooms past whenever you slip or leave coins behind. Stay steady and keep him behind you!',
  cashOut: 'Cash out = withdrawal. Your snowball reset!',
  meltBite: 'The Melt is eating your idle coins. Bank them!',
  slowmo: 'Slow-mo question! Read it, then steer into your answer’s gate.',
};

/**
 * Autopilot: steers toward gates, dodges hot tips and cash-out ramps, jumps fees and slides
 * under signs. Used for the accessible "watch Kip play" option (and in tests).
 */
export function autopilot(s: RunState): void {
  const ahead = s.entities.filter((e) => !e.done && e.z > 0 && e.z < 14).sort((a, b) => a.z - b.z);
  // Risk Lanes: Kip spreads across the levels, row by row (diversifying).
  const gate = ahead.find(
    (e) => (e.kind === 'answer' && e.correct) || e.kind === 'investGate' || e.kind === 'sipGate' || (e.kind === 'riskGate' && e.tier === (['balanced', 'wild', 'safe'] as RiskTier[])[(e.row ?? 0) % 3]),
  );
  const danger = (lane: number) => ahead.some((e) => e.lane === lane && e.z < 8 && (e.kind === 'hotTip' || e.kind === 'cashOut' || e.kind === 'gap'));
  let target: Lane = s.lane;
  if (gate) target = gate.lane;
  else if (danger(s.lane)) target = ([-1, 0, 1] as Lane[]).find((l) => !danger(l)) ?? s.lane;
  if (target < s.lane) applyInput(s, 'left');
  if (target > s.lane) applyInput(s, 'right');
  const next = ahead.find((e) => e.lane === Math.round(s.laneX) && e.z < 2.5);
  if (next?.kind === 'toll' || next?.kind === 'gap') applyInput(s, 'jump');
  if (next?.kind === 'billboard') applyInput(s, 'slide');
}
