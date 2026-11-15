import { DASH_TAUNTS, tauntFor } from '../taunts';

describe("Dash's taunts", () => {
  it('has lines for every kind of slip, and takes turns through them', () => {
    for (const [reason, lines] of Object.entries(DASH_TAUNTS)) {
      expect(lines.length).toBeGreaterThan(1);
      expect(tauntFor(reason as keyof typeof DASH_TAUNTS, 0)).not.toBe(tauntFor(reason as keyof typeof DASH_TAUNTS, 1));
      for (const l of lines) expect(l.length).toBeLessThan(60); // fits the bubble on a phone
    }
  });
});
