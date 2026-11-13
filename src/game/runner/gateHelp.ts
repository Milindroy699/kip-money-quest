/**
 * How Answer Gates are played (see GateHelp in engine.ts), and how the help steps back as the
 * player shows they've got it: guided (paused, with the right gate pointed out) until they've
 * answered GUIDED_TO_GRADUATE questions right, then slow-mo. Full speed is a choice in Settings.
 */
import type { GateHelp } from './engine';

export type GateHelpSetting = 'auto' | GateHelp;

/** Right answers on the guided card before 'auto' moves on to slow-mo. */
export const GUIDED_TO_GRADUATE = 5;

export function gateHelpFor(setting: GateHelpSetting | undefined, guidedRight: number): GateHelp {
  const s = setting ?? 'auto';
  if (s !== 'auto') return s;
  return guidedRight >= GUIDED_TO_GRADUATE ? 'slowmo' : 'guide';
}

export const GATE_HELP_OPTIONS: { id: GateHelpSetting; label: string; text: string }[] = [
  { id: 'auto', label: 'Auto', text: 'Paused and guided while you learn, then slow-mo once you’ve got it.' },
  { id: 'guide', label: 'Pause', text: 'The run pauses for every question, and Kip points at the right gate.' },
  { id: 'slowmo', label: 'Slow-mo', text: 'Time slows down while a question is on its way. You steer into your answer.' },
  { id: 'off', label: 'Full speed', text: 'No slowing down. Read, think and steer at once.' },
];
