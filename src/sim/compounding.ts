/** Closed-form money maths shared by every game mode and lesson widget. */

/** Value of a one-time amount after `years` of compound growth. */
export function futureValue(principal: number, annualRate: number, years: number, compoundsPerYear = 1): number {
  return principal * Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear * years);
}

/** Value with simple interest (interest is never reinvested). */
export function simpleInterestValue(principal: number, annualRate: number, years: number): number {
  return principal * (1 + annualRate * years);
}

/**
 * Future value of a monthly SIP, using the convention most Indian SIP calculators use:
 * monthly rate = annual / 12, contributions at the start of each month (annuity due).
 */
export function sipFutureValue(monthly: number, annualRate: number, years: number): number {
  const n = Math.round(years * 12);
  const r = annualRate / 12;
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

/** Total put in by a monthly SIP. */
export function sipInvested(monthly: number, years: number): number {
  return monthly * Math.round(years * 12);
}

/** What `amount` in the future is worth in today's money. */
export function realValue(amount: number, inflation: number, years: number): number {
  return amount / Math.pow(1 + inflation, years);
}

/** What something costing `price` today will cost after `years` of inflation. */
export function inflatePrice(price: number, inflation: number, years: number): number {
  return price * Math.pow(1 + inflation, years);
}

/** Exact real return (Fisher equation). */
export function realReturn(nominal: number, inflation: number): number {
  return (1 + nominal) / (1 + inflation) - 1;
}

/** Rule of 72: approximate years to double at `ratePercent`% per year. */
export function ruleOf72(ratePercent: number): number {
  return 72 / ratePercent;
}

/** Exact years to double at `annualRate`. */
export function yearsToDouble(annualRate: number): number {
  return Math.log(2) / Math.log(1 + annualRate);
}

export interface SeriesPoint {
  year: number;
  value: number;
}

/** Year-by-year SIP value, for charts. */
export function sipSeries(monthly: number, annualRate: number, years: number): SeriesPoint[] {
  return Array.from({ length: years + 1 }, (_, year) => ({ year, value: sipFutureValue(monthly, annualRate, year) }));
}

/** Year-by-year value of cash saved monthly, in today's money (what The Melt leaves). */
export function cashRealSeries(monthly: number, inflation: number, years: number): SeriesPoint[] {
  return Array.from({ length: years + 1 }, (_, year) => {
    // Each month's saving loses value from the month it is saved.
    let total = 0;
    for (let m = 0; m < year * 12; m++) {
      const yearsHeld = (year * 12 - m) / 12;
      total += realValue(monthly, inflation, yearsHeld);
    }
    return { year, value: total };
  });
}

/** Year-by-year SIP value where the saver withdraws everything every `everyYears` and restarts. */
export function interruptedSipSeries(monthly: number, annualRate: number, years: number, everyYears: number): SeriesPoint[] {
  const points: SeriesPoint[] = [];
  let withdrawn = 0;
  for (let year = 0; year <= years; year++) {
    const sinceRestart = year % everyYears;
    if (year > 0 && sinceRestart === 0) {
      // Cash out at the end of each block, then keep the cash idle (no growth).
      withdrawn += sipFutureValue(monthly, annualRate, everyYears);
    }
    points.push({ year, value: withdrawn + sipFutureValue(monthly, annualRate, sinceRestart) });
  }
  return points;
}
