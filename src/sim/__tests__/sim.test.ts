import {
  cashRealSeries,
  createRng,
  drawEvents,
  futureValue,
  inflatePrice,
  interruptedSipSeries,
  maxDrawdown,
  monthlyReturns,
  pricePath,
  realReturn,
  realValue,
  ruleOf72,
  runLumpSum,
  runSip,
  scoreGoal,
  simpleInterestValue,
  simulatePortfolio,
  sipFutureValue,
  sipInvested,
  teachingPath,
  yearsToDouble,
} from '..';

describe('compounding', () => {
  it('matches the closed-form compound interest formula', () => {
    expect(futureValue(1000, 0.1, 2)).toBeCloseTo(1210, 6);
    expect(futureValue(1000, 0.12, 1, 12)).toBeCloseTo(1000 * Math.pow(1.01, 12), 6);
  });

  it('compound beats simple interest after year one', () => {
    expect(futureValue(1000, 0.1, 1)).toBeCloseTo(simpleInterestValue(1000, 0.1, 1), 6);
    expect(futureValue(1000, 0.1, 10)).toBeGreaterThan(simpleInterestValue(1000, 0.1, 10));
  });

  it('computes SIP future value like Indian SIP calculators (annuity due)', () => {
    // ₹500/month, 12% p.a., 1 year: 500 * ((1.01^12 - 1) / 0.01) * 1.01
    expect(sipFutureValue(500, 0.12, 1)).toBeCloseTo(500 * ((Math.pow(1.01, 12) - 1) / 0.01) * 1.01, 6);
    expect(sipFutureValue(500, 0, 3)).toBe(18000);
    expect(sipInvested(500, 3)).toBe(18000);
  });

  it('handles inflation and real returns', () => {
    expect(inflatePrice(20, 0.06, 10)).toBeCloseTo(35.817, 2);
    expect(realValue(1000, 0.06, 1)).toBeCloseTo(943.396, 2);
    expect(realReturn(0.03, 0.06)).toBeLessThan(0);
    expect(realReturn(0.07, 0.06)).toBeCloseTo(0.00943, 4);
  });

  it('rule of 72 is close to the exact doubling time', () => {
    expect(ruleOf72(8)).toBe(9);
    expect(Math.abs(yearsToDouble(0.08) - 9)).toBeLessThan(0.1);
  });

  it('idle cash loses real value while a SIP grows', () => {
    const cash = cashRealSeries(500, 0.06, 20);
    expect(cash[20].value).toBeLessThan(500 * 12 * 20);
    expect(sipFutureValue(500, 0.12, 20)).toBeGreaterThan(500 * 12 * 20 * 2);
  });

  it('withdrawing and restarting ends lower than staying invested', () => {
    const interrupted = interruptedSipSeries(500, 0.12, 20, 4);
    expect(interrupted[20].value).toBeLessThan(sipFutureValue(500, 0.12, 20));
    expect(interrupted[0].value).toBe(0);
  });
});

describe('market', () => {
  it('is deterministic for a given seed', () => {
    const a = monthlyReturns({ expectedReturn: 0.12, volatility: 0.17 }, 24, createRng(42));
    const b = monthlyReturns({ expectedReturn: 0.12, volatility: 0.17 }, 24, createRng(42));
    expect(a).toEqual(b);
  });

  it('a zero-volatility asset grows at exactly its expected return', () => {
    const prices = pricePath(monthlyReturns({ expectedReturn: 0.07, volatility: 0 }, 12, createRng(1)));
    expect(prices[12]).toBeCloseTo(107, 6);
  });

  it('lump sum beats SIP in a steadily rising market', () => {
    const prices = teachingPath('rising');
    const sip = runSip(prices, 1000);
    const lump = runLumpSum(prices, sip.invested);
    expect(lump.finalValue).toBeGreaterThan(sip.finalValue);
  });

  it('SIP beats lump sum when prices fall first and then recover', () => {
    const prices = teachingPath('falling-then-recovering');
    const sip = runSip(prices, 1000);
    const lump = runLumpSum(prices, sip.invested);
    expect(sip.finalValue).toBeGreaterThan(lump.finalValue);
  });

  it('measures max drawdown', () => {
    expect(maxDrawdown([100, 120, 60, 130])).toBeCloseTo(0.5, 6);
    expect(maxDrawdown([100, 110, 120])).toBe(0);
  });
});

describe('goal scoring', () => {
  it('a diversified portfolio beats an all-in crypto bet on average', () => {
    let diversified = 0;
    let yolo = 0;
    const trials = 300;
    for (let seed = 1; seed <= trials; seed++) {
      const events = drawEvents(createRng(seed), 5);
      const div = simulatePortfolio({ indexFund: 0.5, govBond: 0.2, gold: 0.15, savings: 0.15 }, 10000, events, createRng(seed * 7));
      const all = simulatePortfolio({ crypto: 1 }, 10000, events, createRng(seed * 7));
      diversified += scoreGoal(div, 11000, 5).total;
      yolo += scoreGoal(all, 11000, 5).total;
    }
    expect(diversified / trials).toBeGreaterThan(yolo / trials);
  });

  it('fails the liquidity test when everything is locked up in an emergency year', () => {
    const emergency = drawEvents(createRng(1), 1).map((e) => ({ ...e, shocks: {}, cashNeed: true }));
    const locked = simulatePortfolio({ ppf: 1 }, 10000, emergency, createRng(2));
    const liquid = simulatePortfolio({ ppf: 0.7, savings: 0.3 }, 10000, emergency, createRng(2));
    expect(locked.liquidityMet).toBe(false);
    expect(liquid.liquidityMet).toBe(true);
  });
});
