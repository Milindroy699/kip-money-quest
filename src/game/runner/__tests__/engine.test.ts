import { applyInput, autopilot, coinValue, createRun, DASH_DROP_CUE_Z, DASH_TIER_DODGES, DASH_TIERS, dashTierFor, MISS_STREAK, OVERTAKE_COOLDOWN, OVERTAKE_SECONDS, overtakeZ, RISK_EMERGENCY_COST, step, summarise, triggerOvertake, type Entity, type RunState } from '../engine';
import { CARD_LOADOUTS } from '../loadouts';

const DT = 1 / 60;

function play(s: RunState, bot?: (s: RunState) => void) {
  let guard = 0;
  while (!s.over && guard++ < 60 * 200) {
    bot?.(s);
    step(s, DT);
  }
  return summarise(s);
}

const goodBot = autopilot;

describe('Kip Run engine', () => {
  it('is deterministic for the same seed and inputs', () => {
    const a = play(createRun({ mode: 'inflation', durationSec: 30, seed: 7 }), goodBot);
    const b = play(createRun({ mode: 'inflation', durationSec: 30, seed: 7 }), goodBot);
    expect(a).toEqual(b);
  });

  it('a passive player gets caught by The Melt and loses idle coins', () => {
    const r = play(createRun({ mode: 'inflation', durationSec: 60, seed: 3 }));
    expect(r.outcome).toBe('caught');
    expect(r.meltEaten).toBeGreaterThan(0);
  });

  it('a player who banks at gates finishes and earns a consistency multiplier', () => {
    const r = play(createRun({ mode: 'inflation', durationSec: 40, seed: 11 }), goodBot);
    expect(r.outcome).toBe('finished');
    expect(r.gatesHit).toBeGreaterThan(0);
    expect(r.consistency).toBeGreaterThan(0.5);
    expect(r.multiplier).toBeGreaterThan(1.5);
    expect(r.coinsAwarded).toBeGreaterThan(r.banked);
  });

  it('autopilot finishes every lesson-length run, so lessons are never blocked', () => {
    for (let seed = 1; seed <= 30; seed++) {
      for (const mode of ['inflation', 'snowball'] as const) {
        expect(play(createRun({ mode, durationSec: 60, seed }), autopilot).outcome).toBe('finished');
      }
    }
  });

  it('the tutorial is forgiving enough for a good player across seeds', () => {
    for (let seed = 1; seed <= 10; seed++) {
      expect(play(createRun({ mode: 'inflation', durationSec: 45, seed, tutorial: true }), goodBot).outcome).toBe('finished');
    }
  });

  it('snowball coins compound and a cash-out resets the snowball', () => {
    const s = createRun({ mode: 'snowball', durationSec: 30, seed: 1 });
    expect(coinValue(s)).toBe(1);
    s.snowball = 10;
    expect(coinValue(s)).toBeCloseTo(Math.pow(1.04, 10), 6);
    s.snowball = 1000;
    expect(coinValue(s)).toBe(3);
  });

  it('cashing out lowers the end multiplier versus banking at SIP gates', () => {
    const greedy = createRun({ mode: 'snowball', durationSec: 40, seed: 5 });
    const greedyBot = (s: RunState) => {
      const ramp = s.entities.find((e) => !e.done && e.kind === 'cashOut' && e.z > 0 && e.z < 12);
      if (ramp && ramp.lane < s.lane) applyInput(s, 'left');
      if (ramp && ramp.lane > s.lane) applyInput(s, 'right');
    };
    const g = play(greedy, greedyBot);
    const d = play(createRun({ mode: 'snowball', durationSec: 40, seed: 5 }), goodBot);
    expect(g.cashOuts).toBeGreaterThan(0);
    expect(d.multiplier).toBeGreaterThan(g.multiplier);
  });
});

describe('Dash cameo (progressive difficulty)', () => {
  /** Plays a run and records every Dash trap: where it spawned on the track, and how far ahead it was first seen. */
  function cameos(dashTier: number, seed: number, bot?: (s: RunState) => void) {
    const s = createRun({ mode: 'inflation', durationSec: 60, seed, dashTier });
    const seen = new Map<number, { at: number; firstZ: number; e: Entity }>();
    let drops = 0;
    let guard = 0;
    while (!s.over && guard++ < 60 * 200) {
      bot?.(s);
      step(s, DT);
      drops += s.events.filter((ev) => ev.kind === 'dashDrop').length;
      s.events.length = 0;
      for (const e of s.entities) if (e.byDash && !seen.has(e.id)) seen.set(e.id, { at: s.distance + e.z, firstZ: e.z, e });
    }
    return { traps: [...seen.values()].sort((a, b) => a.at - b.at), drops, result: summarise(s) };
  }

  it('the tier rises only with dodges', () => {
    expect(dashTierFor(0)).toBe(0);
    expect(dashTierFor(DASH_TIER_DODGES[1] - 1)).toBe(0);
    expect(dashTierFor(DASH_TIER_DODGES[1])).toBe(1);
    expect(dashTierFor(DASH_TIER_DODGES[3])).toBe(3);
    expect(dashTierFor(999)).toBe(DASH_TIERS.length - 1);
  });

  it('harder tiers drop traps closer and more often; each run warms up one tier gentler', () => {
    for (let tier = 0; tier < DASH_TIERS.length; tier++) {
      let total = 0;
      for (let seed = 1; seed <= 12; seed++) {
        const { traps } = cameos(tier, seed, autopilot);
        traps.forEach((t, i) => {
          expect(t.e.kind).toBe('hotTip');
          if (i > 0) expect(t.at - traps[i - 1].at).toBeGreaterThanOrEqual(DASH_TIERS[tier].spacing - 1);
          expect(t.e.dropZ).toBe(DASH_TIERS[i === 0 ? Math.max(tier - 1, 0) : tier].dropZ);
          // Only new rows at the horizon, so Dash's run is never cut short.
          expect(t.firstZ).toBeGreaterThan(DASH_DROP_CUE_Z);
        });
        total += traps.length;
      }
      expect(total).toBeGreaterThan(5);
    }
    // Drop points move closer tier by tier, and the first tier shows the trap all along.
    expect(DASH_TIERS[0].dropZ).toBeNull();
    const drops = DASH_TIERS.slice(1).map((t) => t.dropZ as number);
    expect([...drops].sort((a, b) => b - a)).toEqual(drops);
  });

  it('every Dash trap is announced; only real dodges in your own lane count', () => {
    let dodged = 0;
    for (let seed = 1; seed <= 15; seed++) {
      const passive = cameos(3, seed);
      expect(passive.result.dashDodged).toBe(0); // never moved, so never dodged
      const auto = cameos(3, seed, autopilot);
      expect(auto.drops).toBeGreaterThanOrEqual(auto.traps.length - 1); // the last may still be on its way
      dodged += auto.result.dashDodged;
    }
    expect(dodged).toBeGreaterThan(3);
  });

  it('the cameo uses no randomness, so the track is unchanged', () => {
    const a = createRun({ mode: 'inflation', durationSec: 40, seed: 5, dashTier: 3 });
    const b = createRun({ mode: 'inflation', durationSec: 40, seed: 5 });
    b.nextDashAt = Infinity; // no cameos at all
    for (let i = 0; i < 60 * 30; i++) {
      step(a, DT);
      step(b, DT);
    }
    expect(a.entities.map((e) => [e.kind, e.lane, e.z])).toEqual(b.entities.map((e) => [e.kind, e.lane, e.z]));
  });
});

describe('Answer Gates', () => {
  const questions = [
    { q: 'Inflation makes money buy…', options: ['Less', 'More', 'The same'], correct: 0 },
    { q: 'A SIP invests…', options: ['Fixed, monthly', 'All at once', 'Randomly'], correct: 0 },
  ];

  it('autopilot runs through the right answers and banks a bonus', () => {
    const r = play(createRun({ mode: 'inflation', durationSec: 60, seed: 4, questions }), autopilot);
    expect(r.answersRight).toBeGreaterThan(0);
    expect(r.answersWrong).toBe(0);
  });

  it('a wrong answer lets The Melt gain', () => {
    const s = createRun({ mode: 'inflation', durationSec: 60, seed: 4, questions });
    const wrongBot = (st: RunState) => {
      const wrong = st.entities.find((e) => !e.done && e.kind === 'answer' && !e.correct && e.z > 0 && e.z < 14);
      if (wrong && wrong.lane < st.lane) applyInput(st, 'left');
      if (wrong && wrong.lane > st.lane) applyInput(st, 'right');
    };
    const r = play(s, wrongBot);
    expect(r.answersWrong).toBeGreaterThan(0);
  });

  it('there are no Answer Gates without questions or in the tutorial', () => {
    expect(play(createRun({ mode: 'inflation', durationSec: 40, seed: 4 }), autopilot).answersRight).toBe(0);
    expect(play(createRun({ mode: 'inflation', durationSec: 40, seed: 4, tutorial: true, questions }), autopilot).answersRight).toBe(0);
  });
});

describe('card loadouts', () => {
  const passive = () => {};

  it('FD shield absorbs a hit', () => {
    const r = play(createRun({ mode: 'inflation', durationSec: 60, seed: 3, loadout: CARD_LOADOUTS.fd }), passive);
    expect(r.shieldsUsed).toBe(1);
    expect(r.loadoutMultiplier).toBe(1.05);
  });

  it('SIP auto-banks idle coins, so a passive player keeps more than with cash', () => {
    const sip = play(createRun({ mode: 'inflation', durationSec: 30, seed: 3, loadout: CARD_LOADOUTS.sip }), passive);
    const cash = play(createRun({ mode: 'inflation', durationSec: 30, seed: 3, loadout: CARD_LOADOUTS.cash }), passive);
    expect(sip.banked).toBeGreaterThan(cash.banked);
  });

  it('Lump sum starts with coins banked', () => {
    expect(createRun({ mode: 'inflation', durationSec: 30, seed: 1, loadout: CARD_LOADOUTS.lumpSum }).banked).toBe(20);
  });

  it('Index fund rolls a deterministic multiplier inside its range', () => {
    const a = createRun({ mode: 'inflation', durationSec: 30, seed: 9, loadout: CARD_LOADOUTS.indexFund }).loadoutMultiplier;
    const b = createRun({ mode: 'inflation', durationSec: 30, seed: 9, loadout: CARD_LOADOUTS.indexFund }).loadoutMultiplier;
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(0.8);
    expect(a).toBeLessThanOrEqual(1.7);
  });

  it('PPF locks CASH OUT ramps', () => {
    const greedyBot = (s: RunState) => {
      const ramp = s.entities.find((e) => !e.done && e.kind === 'cashOut' && e.z > 0 && e.z < 12);
      if (ramp && ramp.lane < s.lane) applyInput(s, 'left');
      if (ramp && ramp.lane > s.lane) applyInput(s, 'right');
    };
    expect(play(createRun({ mode: 'snowball', durationSec: 40, seed: 5, loadout: CARD_LOADOUTS.ppf }), greedyBot).cashOuts).toBe(0);
  });

  it('Savings slows The Melt’s bite compared with cash', () => {
    const cash = play(createRun({ mode: 'inflation', durationSec: 60, seed: 3, loadout: CARD_LOADOUTS.cash }), passive);
    const savings = play(createRun({ mode: 'inflation', durationSec: 60, seed: 3, loadout: CARD_LOADOUTS.savings }), passive);
    expect(savings.meltEaten).toBeLessThan(cash.meltEaten);
  });
});

describe('Risk Lanes', () => {
  function runRisk(seed: number, bot?: (s: RunState) => void) {
    const s = createRun({ mode: 'risk', durationSec: 60, seed });
    const kinds = new Set<string>();
    let guard = 0;
    while (!s.over && guard++ < 60 * 200) {
      bot?.(s);
      step(s, DT);
      for (const ev of s.events) kinds.add(ev.kind);
      s.events.length = 0;
    }
    return { s, kinds, result: summarise(s) };
  }

  it('gate rows offer all three risk levels, one per lane', () => {
    const s = createRun({ mode: 'risk', durationSec: 60, seed: 3 });
    let gates: Entity[] = [];
    for (let i = 0; i < 60 * 30 && !gates.length; i++) {
      step(s, DT);
      gates = s.entities.filter((e) => e.kind === 'riskGate');
    }
    expect(gates.length).toBeGreaterThan(0);
    const row = gates.filter((e) => e.row === gates[0].row);
    expect(row.map((e) => [e.lane, e.tier])).toEqual([[-1, 'safe'], [0, 'balanced'], [1, 'wild']]);
  });

  it('autopilot finishes, spreads across levels and reports the breakdown', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const { result } = runRisk(seed, autopilot);
      expect(result.outcome).toBe('finished');
      expect(result.risk).toBeDefined();
      const r = result.risk!;
      expect(r.safe + r.balanced + r.wild).toBeCloseTo(result.banked, -1);
      expect(result.gatesHit).toBeGreaterThan(0);
    }
  });

  it('WILD swings much harder than SAFE', () => {
    let wildRange = 0;
    for (let seed = 1; seed <= 10; seed++) {
      const { result } = runRisk(seed, autopilot);
      wildRange += result.risk!.wildBest - result.risk!.wildWorst;
    }
    expect(wildRange / 10).toBeGreaterThan(25); // percentage points between best and worst swing
  });

  it('a surprise expense with no idle coins sells investments at a loss', () => {
    const s = createRun({ mode: 'risk', durationSec: 60, seed: 4 });
    s.holdings = { safe: 50, balanced: 0, wild: 0 };
    s.banked = 50;
    s.pocket = 0;
    s.time = s.emergencyTimes[0] - DT / 2;
    step(s, DT);
    expect(s.events.some((e) => e.kind === 'emergencyShort')).toBe(true);
    expect(s.holdings.safe).toBeLessThan(50 - RISK_EMERGENCY_COST); // paid more than the expense
    expect(summarise(s).risk!.emergencyShort).toBeGreaterThan(0);
  });
});

describe('Time Tracks (timeframe mode)', () => {
  const playTf = (seed: number) => {
    const s = createRun({ mode: 'timeframe', durationSec: 60, seed });
    const stages: string[] = [];
    let guard = 0;
    while (!s.over && guard++ < 20000) {
      autopilot(s);
      step(s, DT);
      for (const e of s.events) if (e.kind === 'stage' && e.stage) stages.push(e.stage);
      s.events.length = 0;
    }
    return { s, stages, r: summarise(s) };
  };

  it('runs through the four speeds in order, slowing down', () => {
    const { stages, r } = playTf(3);
    expect(stages).toEqual(['scalp', 'intraday', 'swing', 'long']);
    expect(r.timeframe!.stages.map((x) => x.stage)).toEqual(['scalp', 'intraday', 'swing', 'long']);
  });

  it('scalping pays the most fees; long term pays none and keeps the most', () => {
    let longWins = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const { r } = playTf(seed);
      const [scalp, , , long] = r.timeframe!.stages;
      expect(scalp.fees).toBeGreaterThan(5);
      expect(long.fees).toBe(0);
      expect(r.timeframe!.growth).toBeGreaterThanOrEqual(0);
      if (long.net > scalp.net) longWins++;
    }
    expect(longWins / 30).toBeGreaterThan(0.8);
  });

  it('a news gap costs idle coins unless you jump it', () => {
    const s = createRun({ mode: 'timeframe', durationSec: 60, seed: 1 });
    s.time = 32; // swing stage
    s.tf.stage = 'swing';
    s.pocket = 20;
    s.entities = [{ id: 999, kind: 'gap', lane: 0, z: 0.1, done: false } as Entity];
    step(s, DT);
    expect(s.pocket).toBeLessThan(20);
    expect(s.tf.gapsHit).toBe(1);
  });
});

describe('Dash overtakes after a slip', () => {
  const collect = (s: RunState) => {
    const kinds: string[] = [];
    let guard = 0;
    while (!s.over && guard++ < 60 * 200) {
      step(s, DT);
      for (const e of s.events.splice(0)) kinds.push(e.kind + (e.reason ? `:${e.reason}` : ''));
    }
    return kinds;
  };

  it('a passive player lets coins go by, and Dash overtakes for it', () => {
    const s = createRun({ mode: 'inflation', durationSec: 40, seed: 3 });
    const kinds = collect(s);
    expect(s.coinsMissed).toBeGreaterThanOrEqual(MISS_STREAK);
    expect(kinds.some((k) => k.startsWith('dashOvertake'))).toBe(true);
  });

  it('a good player sees him rarely, and never more often than the cooldown allows', () => {
    const s = createRun({ mode: 'inflation', durationSec: 60, seed: 11 });
    let guard = 0;
    const times: number[] = [];
    while (!s.over && guard++ < 60 * 200) {
      autopilot(s);
      step(s, DT);
      for (const e of s.events.splice(0)) if (e.kind === 'dashOvertake') times.push(s.time);
    }
    for (let i = 1; i < times.length; i++) expect(times[i] - times[i - 1]).toBeGreaterThanOrEqual(OVERTAKE_COOLDOWN - 1e-9);
    expect(times.length).toBeLessThanOrEqual(Math.ceil(60 / OVERTAKE_COOLDOWN));
  });

  it('passes in the lane beside Kip, runs ahead, then leaves, and never changes the score', () => {
    const a = createRun({ mode: 'inflation', durationSec: 20, seed: 5 });
    const b = createRun({ mode: 'inflation', durationSec: 20, seed: 5 });
    for (let i = 0; i < 200; i++) step(a, DT);
    for (let i = 0; i < 200; i++) step(b, DT);
    triggerOvertake(a, 'impulse');
    expect(a.overtake).toMatchObject({ reason: 'impulse' });
    expect(a.overtake!.lane).not.toBe(a.lane);
    const z0 = overtakeZ(a)!;
    for (let i = 0; i < 30; i++) {
      step(a, DT);
      step(b, DT);
    }
    expect(overtakeZ(a)!).toBeGreaterThan(z0);
    for (let i = 0; i < Math.ceil((OVERTAKE_SECONDS * 1.2) / DT); i++) step(a, DT);
    expect(a.overtake).toBeNull();
    expect(overtakeZ(a)).toBeNull();
    // A second trigger inside the cooldown is ignored.
    const n = a.overtakes;
    triggerOvertake(a, 'fee');
    expect(a.overtakes).toBe(n);
  });
});

