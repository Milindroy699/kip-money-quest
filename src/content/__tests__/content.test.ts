import { futureValue, inflatePrice, interruptedSipSeries, realValue, simpleInterestValue, sipFutureValue } from '../../sim';
import { CUSTOMERS } from '../../lessons/bazaar';
import { PUZZLES } from '../../games/payoff';
import { CASES } from '../../games/ratios';
import { CARDS, GATE_QUESTIONS, getCard, isLessonUnlocked, LESSONS, nextLesson, pathFor, questionsForRun, STARTER_CARDS, trackFor, UNLOCKABLE_CARDS, WORLDS, worldsFor, nextWorldAfter } from '..';
import { allContentComplete } from '../../engagement/plan';

describe('content', () => {
  it('loads ten worlds and fifty-three lessons', () => {
    expect(WORLDS.map((w) => w.id)).toEqual(['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9']);
    expect(LESSONS).toHaveLength(53);
    WORLDS.forEach((w, i) => expect(w.index).toBe(i));
  });

  it('every world ends with a boss lesson, from World 3 on', () => {
    for (const w of WORLDS.filter((x) => x.index >= 3)) expect(w.lessons.at(-1)?.boss).toBe(true);
  });

  it('every lesson has Answer Gate questions that fit on a gate', () => {
    for (const lesson of LESSONS) {
      expect(GATE_QUESTIONS[lesson.id]?.length).toBeGreaterThan(0);
    }
  });

  it('has unique lesson and card ids', () => {
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length);
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(CARDS.length);
    expect(CARDS).toHaveLength(24);
  });

  it('only references cards that exist', () => {
    for (const lesson of LESSONS) {
      for (const id of lesson.unlockCards ?? []) expect(getCard(id)).toBeDefined();
      for (const step of lesson.steps) if (step.type === 'connect' && step.cardId) expect(getCard(step.cardId)).toBeDefined();
    }
    for (const id of STARTER_CARDS) expect(getCard(id)).toBeDefined();
    // Every card can now be earned.
    expect(UNLOCKABLE_CARDS).toHaveLength(CARDS.length);
  });

  it('every prediction points at a real option', () => {
    for (const lesson of LESSONS) {
      for (const step of lesson.steps) {
        if (step.type === 'concept' && step.predict) expect(step.predict.correct).toBeLessThan(step.predict.options.length);
      }
    }
  });

  it('asset cards have stats and strategy cards have traits', () => {
    for (const card of CARDS) {
      if (card.kind === 'asset') expect(card.stats).toBeDefined();
      else expect(card.traits?.length).toBeGreaterThan(0);
    }
  });

  it('unlocks lessons in path order', () => {
    expect(isLessonUnlocked('w0-l1', {})).toBe(true);
    expect(isLessonUnlocked('w0-l2', {})).toBe(false);
    expect(isLessonUnlocked('w0-l2', { 'w0-l1': true })).toBe(true);
    expect(nextLesson({ 'w0-l1': true })?.id).toBe('w0-l2');
  });
});

describe('Explorer and Builder tracks', () => {
  const doneThrough = (track: 'explorer' | 'builder', lastId: string) => {
    const path = pathFor(track);
    return Object.fromEntries(path.slice(0, path.findIndex((l) => l.id === lastId) + 1).map((l) => [l.id, true]));
  };

  it('maps age bands to tracks', () => {
    expect(trackFor('16-19')).toBe('builder');
    expect(trackFor('13-15')).toBe('explorer');
    expect(trackFor(null)).toBe('explorer');
  });

  it('Explorers skip Worlds 6–8 and go from World 5 to World 9', () => {
    expect(worldsFor('explorer').map((w) => w.index)).toEqual([0, 1, 2, 3, 4, 5, 9]);
    expect(worldsFor('builder')).toHaveLength(10);
    const done = doneThrough('explorer', 'w5-l5');
    expect(nextLesson(done, 'explorer')?.id).toBe('w9-l1');
    expect(nextLesson(done, 'builder')?.id).toBe('w6-l1');
    expect(isLessonUnlocked('w9-l1', done, 'explorer')).toBe(true);
    expect(isLessonUnlocked('w9-l1', done, 'builder')).toBe(false);
    expect(isLessonUnlocked('w6-l1', done, 'explorer')).toBe(false);
  });

  it('switching to Builder keeps finished lessons open', () => {
    const done = doneThrough('explorer', 'w9-l2');
    expect(isLessonUnlocked('w9-l2', done, 'builder')).toBe(true);
    expect(nextLesson(done, 'builder')?.id).toBe('w6-l1');
  });

  it('finishing a track completes it, not the other one', () => {
    const explorer = Object.fromEntries(pathFor('explorer').map((l) => [l.id, true]));
    expect(allContentComplete(explorer, 'explorer')).toBe(true);
    expect(allContentComplete(explorer, 'builder')).toBe(false);
  });
});

describe('Worlds 5–9 widgets', () => {
  it('ratio and payoff params name real cases and puzzles', () => {
    for (const l of LESSONS)
      for (const s of l.steps) {
        if (s.type !== 'concept') continue;
        if (s.widget === 'ratioDetective' && typeof s.params?.cases === 'string') for (const id of s.params.cases.split(',')) expect(CASES.some((c) => c.id === id)).toBe(true);
        if (s.widget === 'payoff' && typeof s.params?.puzzles === 'string') for (const id of s.params.puzzles.split(',')) expect(PUZZLES.some((p) => p.id === id)).toBe(true);
      }
  });
});

describe('Answer Gate questions', () => {
  it('every lesson has at least two gate questions', () => {
    for (const l of LESSONS) expect((GATE_QUESTIONS[l.id] ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it('asks the current lesson first, then finished lessons newest first', () => {
    const qs = questionsForRun('w1-l1', { 'w0-l1': true, 'w0-l2': true });
    expect(qs[0]).toBe(GATE_QUESTIONS['w1-l1'][0]);
    expect(qs[2]).toBe(GATE_QUESTIONS['w0-l2'][0]);
    expect(questionsForRun(null, {})).toEqual([]);
  });
});

/** Every number quoted in lesson copy is recomputed here, so content and maths can't drift apart. */
describe('numbers quoted in lessons', () => {
  it('chai prices (W1)', () => {
    expect(Math.round(inflatePrice(20, 0.06, 20))).toBe(64);
    expect(Math.round(inflatePrice(20, 0.06, 45))).toBe(275);
  });

  it('real value of savings vs inflation (W1-L3): about ₹7,500', () => {
    const real = realValue(futureValue(10000, 0.03, 10), 0.06, 10);
    expect(real).toBeGreaterThan(7400);
    expect(real).toBeLessThan(7600);
  });

  it('₹1 lakh cash after 24 years at 6% is about ₹25,000 (W1-L5)', () => {
    expect(Math.round(realValue(100000, 0.06, 24) / 1000)).toBe(25);
  });

  it('simple vs compound (W2-L1)', () => {
    expect(simpleInterestValue(10000, 0.1, 20)).toBeCloseTo(30000, 6);
    expect(Math.round(futureValue(10000, 0.1, 20) / 1000)).toBe(67);
  });

  it('start at 15 vs 25 is about 3× (W2-L2)', () => {
    const ratio = sipFutureValue(1000, 0.12, 45) / sipFutureValue(1000, 0.12, 35);
    expect(ratio).toBeGreaterThan(3);
    expect(ratio).toBeLessThan(3.5);
  });

  it('Aarav (15–25, then holds) beats Dash (25–60) (W2-L2)', () => {
    const aarav = sipFutureValue(1000, 0.12, 10) * Math.pow(1.01, 35 * 12);
    const dash = sipFutureValue(1000, 0.12, 35);
    expect(aarav / 1e7).toBeCloseTo(1.5, 1); // ≈ ₹1.5 crore
    expect(Math.round(dash / 1e5)).toBe(65); // ≈ ₹65 lakh
    expect(aarav).toBeGreaterThan(dash);
  });

  it('cashing out every 4 years ends near 30% of steady (W2-L5)', () => {
    const steady = sipFutureValue(500, 0.12, 20);
    const interrupted = interruptedSipSeries(500, 0.12, 20, 4)[20].value;
    expect(interrupted / steady).toBeGreaterThan(0.25);
    expect(interrupted / steady).toBeLessThan(0.35);
  });

  it('onboarding Kip vs Dash figures (₹500/month, 20 years)', () => {
    expect(Math.round(sipFutureValue(500, 0.12, 20) / 1e5 * 10) / 10).toBe(5);
  });
});

describe('Bazaar Bargain customers', () => {
  it('every customer has a best answer, explanations and real cards', () => {
    for (const c of CUSTOMERS) {
      expect(c.options.some((o) => o.fit === 'best')).toBe(true);
      for (const o of c.options) {
        expect(getCard(o.cardId)).toBeDefined();
        expect(o.why.length).toBeGreaterThan(10);
      }
    }
  });

  it('knows the next world on each track', () => {
    expect(nextWorldAfter('w0', 'builder')?.id).toBe('w1');
    expect(nextWorldAfter('w5', 'builder')?.id).toBe('w6');
    expect(nextWorldAfter('w5', 'explorer')?.id).toBe('w9');
    expect(nextWorldAfter('w9', 'builder')).toBeUndefined();
  });
});

