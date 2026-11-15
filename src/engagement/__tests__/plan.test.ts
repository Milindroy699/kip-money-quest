import { LESSONS } from '../../content';
import { planUnlocks, seasonComplete } from '../plan';

const upTo = (id: string) => Object.fromEntries(LESSONS.slice(0, LESSONS.findIndex((l) => l.id === id) + 1).map((l) => [l.id, true]));

describe('Future You plan unlocks', () => {
  it('starts with only the goal visible', () => {
    expect(planUnlocks({})).toEqual({ priceAtGoal: false, monthly: false, launchPlan: false, riskMix: false });
  });
  it('World 1 unlocks the inflation-adjusted price', () => {
    expect(planUnlocks(upTo('w1-l5')).priceAtGoal).toBe(true);
    expect(planUnlocks(upTo('w1-l4')).priceAtGoal).toBe(false);
  });
  it('the SIP lesson unlocks the monthly amount, World 2 the Launch Plan', () => {
    expect(planUnlocks(upTo('w2-l3')).monthly).toBe(true);
    expect(planUnlocks(upTo('w2-l5')).launchPlan).toBe(false);
    expect(planUnlocks(upTo('w2-l6')).launchPlan).toBe(true);
    expect(seasonComplete(upTo('w2-l6'))).toBe(true);
    expect(seasonComplete(upTo('w2-l5'))).toBe(false);
  });
  it('World 3 adds the risk mix, and Season 1 stays complete without it', () => {
    expect(planUnlocks(upTo('w3-l6')).riskMix).toBe(false);
    expect(planUnlocks(upTo('w3-l7')).riskMix).toBe(true);
    expect(seasonComplete(upTo('w3-l1'))).toBe(true);
  });
});
