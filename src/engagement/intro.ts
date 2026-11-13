/**
 * What Kip says on the opening screen: "Hii!" plus one line that fits the moment (new player,
 * streak, goal, time of day). Pure, so the choice is tested; the day number rotates the
 * candidates so the greeting isn't the same every launch.
 */
export interface IntroContext {
  name: string;
  onboarded: boolean;
  /** Current streak (days), and whether today's deposit is already in. */
  streak: number;
  doneToday: boolean;
  /** e.g. "💻 Laptop by 25", or null with no goal yet. */
  goal: string | null;
  /** Local hour, 0–23. */
  hour: number;
  /** Any number that changes once a day (e.g. days since 1970). */
  day: number;
}

export interface IntroLines {
  hi: string;
  line: string;
}

/** Loading-bar captions, in Kip's voice. The last one shows as the bar fills. */
export const INTRO_LOADING = ['Polishing my specs…', 'Counting your coins…', 'Shooing away The Melt…', 'Ready!'];

export function introLines(c: IntroContext): IntroLines {
  const first = c.name.trim().split(/\s+/)[0] ?? '';
  const hi = first ? `Hii ${first}! 👋` : 'Hii! 👋';
  if (!c.onboarded) return { hi, line: 'I’m Kip. Let’s turn pocket money into a plan!' };
  const lines: string[] = [];
  if (c.doneToday) lines.push('Back again? Your money brain is on fire! 🔥');
  else if (c.streak >= 2) lines.push(`Day ${c.streak + 1} of your Knowledge SIP? Let’s keep it rolling!`);
  if (c.goal) lines.push(`${c.goal}. Let’s get you a step closer today.`);
  lines.push(c.hour < 12 ? 'Morning! Ready for a quick money quest?' : c.hour < 17 ? 'Five minutes now, compounding forever. Let’s go!' : 'Evening quest time! Small steps, big gains.');
  return { hi, line: lines[Math.abs(c.day) % lines.length] };
}
