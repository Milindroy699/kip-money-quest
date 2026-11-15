import { emptyPortfolio, exitQuote, invest, marketMonth, monthOfDay, PORTFOLIO_LIMITS, PRODUCTS, settle, totalValue, withdraw, type PortfolioState } from '../engine';

const OWNED = ['cash', 'savings', 'fd', 'ppf', 'indexFund', 'elss'];

function grow(asset: keyof typeof PRODUCTS, from: number, months: number) {
  let v = 1;
  for (let m = from; m < from + months; m++) v *= 1 + marketMonth(m).returns[PRODUCTS[asset].asset];
  return v;
}

function bought(cardId: string, amount: number, month: number): PortfolioState {
  const r = invest(emptyPortfolio, cardId, amount, month, 1000, OWNED);
  if ('error' in r) throw new Error(r.error);
  return r.portfolio;
}

describe('the shared market', () => {
  it('is the same for everyone on the same day', () => {
    expect(marketMonth(321)).toEqual(marketMonth(321));
    expect(monthOfDay('2026-01-01')).toBe(0);
    expect(monthOfDay('2026-11-01')).toBe(304);
  });

  it('fixed products never lose and grow at their rate', () => {
    for (let m = 0; m < 300; m++) {
      expect(marketMonth(m).returns.savings).toBeGreaterThan(0);
      expect(marketMonth(m).returns.fd).toBeCloseTo(Math.pow(1.07, 1 / 12) - 1, 10);
    }
  });

  it('over separate 10-year stretches, the index fund usually beats an FD, which beats savings', () => {
    let indexWins = 0;
    let indexTotal = 0;
    let fdTotal = 0;
    const windows = 200;
    for (let w = 0; w < windows; w++) {
      const start = w * 120;
      const index = grow('indexFund', start, 120);
      const fd = grow('fd', start, 120);
      if (index > fd) indexWins++;
      indexTotal += index;
      fdTotal += fd;
      expect(fd).toBeGreaterThan(grow('savings', start, 120));
    }
    expect(indexWins / windows).toBeGreaterThan(0.65);
    expect(indexTotal / windows).toBeGreaterThan((fdTotal / windows) * 1.3); // on average, clearly more
  });

  it('a crash hits shares much harder than FDs, and gold holds up better', () => {
    const crashes = Array.from({ length: 3000 }, (_, m) => marketMonth(m)).filter((x) => x.event?.id === 'crash');
    expect(crashes.length).toBeGreaterThan(30);
    const avg = (k: 'indexFund' | 'fd' | 'gold') => crashes.reduce((s, x) => s + x.returns[k], 0) / crashes.length;
    expect(avg('indexFund')).toBeLessThan(-0.1);
    expect(avg('fd')).toBeGreaterThan(0);
    expect(avg('gold')).toBeGreaterThan(avg('indexFund'));
  });
});

describe('holdings', () => {
  it('a new investment starts moving the next month, and settling twice changes nothing', () => {
    const p = bought('indexFund', 100, 50);
    expect(settle(p, 50).lots[0].value).toBe(100);
    const later = settle(p, 60);
    expect(later.lots[0].value).not.toBe(100);
    expect(settle(later, 60)).toBe(later);
    expect(later.history.length).toBeGreaterThan(0);
  });

  it('breaking an FD early costs 1%; after 12 months it’s free', () => {
    const p = settle(bought('fd', 200, 10), 15);
    const early = exitQuote(p.lots[0], 15);
    expect(early).toMatchObject({ allowed: true, monthsLeft: 7 });
    expect(early.penalty).toBeGreaterThan(0);
    const late = exitQuote(settle(p, 22).lots[0], 22);
    expect(late).toMatchObject({ allowed: true, penalty: 0, monthsLeft: 0 });
    const out = withdraw(p, p.lots[0].id, 22);
    expect('payout' in out && out.payout).toBeGreaterThan(200);
  });

  it('PPF and ELSS can’t be touched until their lock ends', () => {
    const ppf = bought('ppf', 100, 0);
    expect(withdraw(ppf, ppf.lots[0].id, 83)).toEqual({ error: 'locked' });
    expect('payout' in withdraw(ppf, ppf.lots[0].id, 84)).toBe(true);
    const elss = bought('elss', 100, 0);
    expect(exitQuote(settle(elss, 10).lots[0], 10)).toMatchObject({ allowed: false, monthsLeft: 26 });
  });

  it('checks the limits', () => {
    expect(invest(emptyPortfolio, 'fd', 5, 0, 100, OWNED)).toEqual({ error: 'tooSmall' });
    expect(invest(emptyPortfolio, 'fd', 50, 0, 20, OWNED)).toEqual({ error: 'notEnoughCoins' });
    expect(invest(emptyPortfolio, 'stock', 50, 0, 100, OWNED)).toEqual({ error: 'notUnlocked' });
    expect(invest(emptyPortfolio, 'fd', PORTFOLIO_LIMITS.maxTotal + 1, 0, 99999, OWNED)).toEqual({ error: 'overLimit' });
    const p = bought('savings', 100, 0);
    expect(totalValue(p)).toBe(100);
  });
});
