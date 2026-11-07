import { friendlyRupees, makeGoalPlan, monthlyForTarget, planReturnFor, sipFutureValue } from '..';

describe('goal planner', () => {
  it('monthlyForTarget is the inverse of the SIP future value', () => {
    const m = monthlyForTarget(100000, 0.12, 9);
    expect(sipFutureValue(m, 0.12, 9)).toBeCloseTo(100000, 3);
    expect(monthlyForTarget(12000, 0, 1)).toBeCloseTo(1000, 6);
  });

  it('plans the review example: ₹60k laptop, age 16 → 25', () => {
    const p = makeGoalPlan(60000, 16, 25);
    expect(p.years).toBe(9);
    expect(Math.round(p.priceAtGoal / 1000)).toBe(101);
    expect(Math.round(p.monthlyInvested)).toBe(520);
    expect(p.monthlyCash).toBeGreaterThan(p.monthlyInvested); // compounding does part of the work
    expect(p.costOfWaiting).toBeGreaterThan(0);
  });

  it('uses safer hypothetical returns for shorter horizons', () => {
    expect(planReturnFor(2).rate).toBeLessThan(planReturnFor(5).rate);
    expect(planReturnFor(5).rate).toBeLessThan(planReturnFor(10).rate);
  });

  it('never divides by zero for goals this year', () => {
    const p = makeGoalPlan(20000, 18, 18);
    expect(p.years).toBe(1);
    expect(Number.isFinite(p.monthlyInvested)).toBe(true);
    expect(p.costOfWaiting).toBe(0);
  });

  it('rounds to friendly amounts', () => {
    expect(friendlyRupees(523)).toBe(520);
    expect(friendlyRupees(1237)).toBe(1250);
    expect(friendlyRupees(12740)).toBe(12500);
  });
});
