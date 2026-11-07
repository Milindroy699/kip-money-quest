/** Loads and validates all content once. Invalid content throws at startup (and in tests). */
import { z } from 'zod';

import cardsJson from './cards.json';
import gatesJson from './gates.json';
import { Card, World, type CardT, type LessonT, type WorldT } from './schema';
import w0 from './worlds/w0.json';
import w1 from './worlds/w1.json';
import w2 from './worlds/w2.json';
import w3 from './worlds/w3.json';
import w4 from './worlds/w4.json';
import w5 from './worlds/w5.json';
import w6 from './worlds/w6.json';
import w7 from './worlds/w7.json';
import w8 from './worlds/w8.json';
import w9 from './worlds/w9.json';

export const WORLDS: WorldT[] = [w0, w1, w2, w3, w4, w5, w6, w7, w8, w9].map((w) => World.parse(w));
export const CARDS: CardT[] = z.array(Card).parse(cardsJson);

export const LESSONS: LessonT[] = WORLDS.flatMap((w) => w.lessons);

/** Lesson id → world. */
const lessonWorld = new Map<string, WorldT>(WORLDS.flatMap((w) => w.lessons.map((l) => [l.id, w] as const)));

export function getLesson(id: string): LessonT | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getWorldOfLesson(id: string): WorldT | undefined {
  return lessonWorld.get(id);
}

export function getCard(id: string): CardT | undefined {
  return CARDS.find((c) => c.id === id);
}

/**
 * Explorer (13–15) and Builder (16 and up, adults included) tracks. Explorers skip the Builder-only worlds (6–8:
 * arbitrage, trading timeframes, analysis) and go from World 5 straight to World 9.
 */
export type Track = 'explorer' | 'builder';

export const trackFor = (ageBand: string | null | undefined): Track => (ageBand === '16-19' ? 'builder' : 'explorer');

export function worldsFor(track: Track = 'builder'): WorldT[] {
  return WORLDS.filter((w) => track === 'builder' || w.track !== 'builder');
}

/** Every lesson on a track's path, in order. */
/** The world after this one on the player's track (Explorers skip the Builder-only worlds), if any. */
export function nextWorldAfter(worldId: string, track: Track = 'builder'): WorldT | undefined {
  const list = worldsFor(track);
  const i = list.findIndex((w) => w.id === worldId);
  return i >= 0 ? list[i + 1] : undefined;
}

export function pathFor(track: Track = 'builder'): LessonT[] {
  return worldsFor(track).flatMap((w) => w.lessons);
}

/** The first lesson that is not yet completed, in path order. */
export function nextLesson(completed: Record<string, unknown>, track: Track = 'builder'): LessonT | undefined {
  return pathFor(track).find((l) => !completed[l.id]);
}

/** A lesson is unlocked when it's done, or every earlier lesson on the path is complete. */
export function isLessonUnlocked(id: string, completed: Record<string, unknown>, track: Track = 'builder'): boolean {
  if (completed[id]) return true;
  const path = pathFor(track);
  const index = path.findIndex((l) => l.id === id);
  return index >= 0 && path.slice(0, index).every((l) => completed[l.id]);
}

/** Cards granted during onboarding. */
export const STARTER_CARDS = ['cash', 'fd'];

/** Cards that can be unlocked in this build (onboarding + lessons). */
export const UNLOCKABLE_CARDS = Array.from(new Set([...STARTER_CARDS, ...LESSONS.flatMap((l) => l.unlockCards ?? [])]));

// ---- Answer Gate questions (Kip Run) -------------------------------------------------

const GateQuestionSchema = z.object({
  q: z.string().min(1).max(60),
  /** Short enough to read on a gate banner. */
  options: z.array(z.string().min(1).max(16)).length(3),
  correct: z.number().int().min(0).max(2),
});
export type GateQuestionT = z.infer<typeof GateQuestionSchema>;

export const GATE_QUESTIONS: Record<string, GateQuestionT[]> = z.record(z.string(), z.array(GateQuestionSchema)).parse(gatesJson);

/**
 * Questions for a run: the current lesson's first, then earlier finished lessons, newest first,
 * so fresh learning is tested first and older ideas keep coming back.
 */
export function questionsForRun(currentLessonId: string | null, completed: Record<string, unknown>): GateQuestionT[] {
  const current = currentLessonId ? (GATE_QUESTIONS[currentLessonId] ?? []) : [];
  const earlier = LESSONS.map((l) => l.id)
    .filter((id) => id !== currentLessonId && completed[id])
    .reverse()
    .flatMap((id) => GATE_QUESTIONS[id] ?? []);
  return [...current, ...earlier];
}
