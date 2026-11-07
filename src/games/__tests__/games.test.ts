import { ARB, arbProfit, arbTicks, gapOf } from '../arbitrage';
import { DOORS, SCENARIOS } from '../intent';
import { simulatePaycheck } from '../paycheck';
import { payoff, PRICES, PUZZLES, sameShape } from '../payoff';
import { CASES } from '../ratios';
import { startupOdds } from '../startups';
import { holdPath, scalpResult, scalpTicks } from '../timeframe';

describe('Intent Detective', () => {
  it('has every door several times, each with a reason', () => {
    for (const door of Object.keys(DOORS)) expect(SCENARIOS.filter((s) => s.door === door).length).toBeGreaterThanOrEqual(3);
    for (const s of SCENARIOS) expect(s.why.length).toBeGreaterThan(20);
  });
});

describe('Arbitrage Rush', () => {
  it('trading every gap loses after fees; only big gaps pay', () => {
    let always = 0;
    let picky = 0;
    for (let seed = 1; seed <= 200; seed++) {
      const t = arbTicks(seed);
      for (let i = 0; i < ARB.ticks; i++) {
        const p = arbProfit(t, i);
        always += p;
        if (gapOf(t[i]) > 0.012) picky += p;
      }
    }
    expect(always).toBeLessThan(0);
    expect(picky).toBeGreaterThan(0);
  });
});

describe('Timeframe Racer', () => {
  it('rapid round trips usually lose to costs, while holding usually grows', () => {
    let scalpLosses = 0;
    let holdGains = 0;
    for (let seed = 1; seed <= 200; seed++) {
      const p = scalpTicks(seed);
      const trips: [number, number][] = [];
      for (let i = 0; i + 2 < p.length; i += 3) trips.push([i, i + 2]);
      if (scalpResult(p, trips).net < 0) scalpLosses++;
      const h = holdPath(seed);
      if (h[h.length - 1] > h[0]) holdGains++;
    }
    expect(scalpLosses / 200).toBeGreaterThan(0.6);
    expect(holdGains / 200).toBeGreaterThan(0.75);
  });
});

describe('Ratio Detective', () => {
  it('every case has three companies and a valid answer', () => {
    for (const c of CASES) {
      expect(c.companies).toHaveLength(3);
      expect(c.answer).toBeLessThan(3);
    }
  });
});

describe('Payoff Puzzle', () => {
  it('a protective put has a floor, a covered call a cap, a straddle a V', () => {
    const floor = Math.min(...PRICES.map((p) => payoff(['stock', 'buyPut'], p)));
    expect(floor).toBe(-8);
    const cap = Math.max(...PRICES.map((p) => payoff(['stock', 'sellCall'], p)));
    expect(cap).toBe(13);
    expect(payoff(['buyCall', 'buyPutAtm'], 100)).toBe(-10);
    expect(payoff(['buyCall', 'buyPutAtm'], 140)).toBeGreaterThan(0);
    for (const z of PUZZLES) expect(sameShape(z.target, [...z.target].reverse())).toBe(true);
    expect(sameShape(['stock'], ['stock', 'buyPut'])).toBe(false);
  });
});

describe('First Paycheck', () => {
  it('emergency fund + insurance + SIP beats spending it all, and avoids debt', () => {
    const plan = simulatePaycheck({ wants: 0.2, sip: 0.15, emergency: 0.1, insured: true });
    const spend = simulatePaycheck({ wants: 0.45, sip: 0, emergency: 0, insured: false });
    expect(plan.netWorth).toBeGreaterThan(spend.netWorth);
    expect(plan.peakDebt).toBe(0);
    expect(spend.peakDebt).toBeGreaterThan(100000);
    expect(spend.interestPaid).toBeGreaterThan(50000);
    expect(plan.verdict).toBe('thriving');
    expect(spend.verdict).toBe('struggling');
  });

  it('never spirals into absurd debt, and the insurance premium is budgeted', () => {
    for (const wants of [0.2, 0.3, 0.45])
      for (const sip of [0, 0.1, 0.25])
        for (const insured of [true, false]) {
          const r = simulatePaycheck({ wants, sip, emergency: 0.05, insured });
          expect(r.debt).toBeLessThan(100000);
          expect(r.peakDebt).toBeLessThan(400000);
        }
  });
});

describe('Backing startups', () => {
  it('a few bets usually lose; many bets lose far less often (the power law)', () => {
    expect(startupOdds(2).lossChance).toBeGreaterThan(0.6);
    expect(startupOdds(30).lossChance).toBeLessThan(0.35);
    expect(startupOdds(30).lossChance).toBeLessThan(startupOdds(5).lossChance);
  });
});
