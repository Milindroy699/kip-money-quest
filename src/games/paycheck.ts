/**
 * First Paycheck (World 9): split your first salary, then live 18 years of life events.
 * Shows why the order matters: emergency fund and insurance first, then steady investing.
 * All returns hypothetical.
 */
export interface Split {
  /** Shares of take-home pay (0–1); needs is whatever is left. */
  wants: number;
  sip: number;
  emergency: number;
  insured: boolean;
}

export interface LifeEvent {
  age: number;
  emoji: string;
  title: string;
}

export const LIFE_EVENTS: LifeEvent[] = [
  { age: 24, emoji: '📦', title: 'Your company shuts down: 3 months without pay' },
  { age: 27, emoji: '🏥', title: 'A hospital stay: ₹2,00,000' },
  { age: 30, emoji: '💍', title: 'A family wedding you’re paying towards: ₹1,50,000' },
  { age: 33, emoji: '📉', title: 'Market crash: investments fall 30%' },
  { age: 37, emoji: '🛵', title: 'Your bike is stolen: ₹60,000' },
];

export const PAY = { start: 30000, raise: 0.07, sipReturn: 0.11, savingsRate: 0.035, debtRate: 0.36, insurance: 1500, fromAge: 22, toAge: 40, efMonths: 6 };

export interface PaycheckYear {
  age: number;
  invested: number;
  emergency: number;
  debt: number;
  note?: string;
}

export interface PaycheckResult {
  years: PaycheckYear[];
  netWorth: number;
  debt: number;
  /** The most owed at any point, and the card interest paid along the way. */
  peakDebt: number;
  interestPaid: number;
  invested: number;
  soldInCrash: boolean;
  /** What happened at each life event, keyed by age. */
  outcomes: Record<number, string>;
  verdict: 'thriving' | 'okay' | 'struggling';
}

export function simulatePaycheck(s: Split): PaycheckResult {
  let salary = PAY.start;
  let invested = 0;
  let emergency = 0;
  let debt = 0;
  let peakDebt = 0;
  let interestPaid = 0;
  let soldInCrash = false;
  const outcomes: Record<number, string> = {};
  const years: PaycheckYear[] = [];
  const needs = Math.max(1 - s.wants - s.sip - s.emergency, 0);
  const borrow = (amount: number) => {
    debt += amount;
    peakDebt = Math.max(peakDebt, debt);
  };
  for (let age = PAY.fromAge; age < PAY.toAge; age++) {
    let note: string | undefined;
    const owedBefore = peakDebt;
    for (let m = 0; m < 12; m++) {
      const jobless = age === 24 && m < 3;
      const pay = jobless ? 0 : salary;
      const premium = s.insured ? PAY.insurance : 0;
      // Out of work, only needs (and the premium) still have to be paid.
      let spare = pay - (jobless ? salary * needs : salary * (needs + s.wants)) - premium;
      if (debt > 0 && !jobless) {
        // A 36% card comes first: halve the fun money and send everything spare to it.
        spare += salary * s.wants * 0.5;
        const paid = Math.min(debt, Math.max(spare, 0));
        debt -= paid;
        spare -= paid;
      }
      if (spare > 0) {
        const efTarget = salary * PAY.efMonths;
        const toEf = emergency < efTarget ? Math.min(spare, pay * s.emergency) : 0;
        const toSip = Math.min(spare - toEf, pay * (s.sip + (emergency >= efTarget ? s.emergency : 0)));
        emergency += toEf;
        invested += toSip;
      } else if (spare < 0) {
        // Not enough this month: emergency fund first, then a card.
        const fromEf = Math.min(emergency, -spare);
        emergency -= fromEf;
        if (-spare - fromEf > 0) borrow(-spare - fromEf);
      }
      invested *= 1 + PAY.sipReturn / 12;
      emergency *= 1 + PAY.savingsRate / 12;
      interestPaid += debt * (PAY.debtRate / 12);
      debt *= 1 + PAY.debtRate / 12;
      // Clear debt from a well-stocked emergency fund (keep one month's pay).
      if (debt > 0 && emergency > salary) {
        const fromEf = Math.min(debt, emergency - salary);
        debt -= fromEf;
        emergency -= fromEf;
      }
    }
    if (age === 24) outcomes[24] = peakDebt > owedBefore ? 'Not enough saved: rent and food went on a credit card.' : 'Your emergency fund paid the rent and food.';
    const event = LIFE_EVENTS.find((e) => e.age === age);
    if (event) {
      let cost = 0;
      if (age === 27) cost = s.insured ? 0 : 200000;
      if (age === 30) cost = 150000;
      if (age === 37) cost = 60000;
      if (age === 33) invested *= 0.7;
      if (cost > 0) {
        const fromEf = Math.min(emergency, cost);
        emergency -= fromEf;
        let rest = cost - fromEf;
        if (rest > 0 && invested > 0) {
          // Selling investments after a crash locks in losses; before it, it's just selling.
          const fromInv = Math.min(invested, rest);
          invested -= fromInv;
          rest -= fromInv;
          if (age >= 33) soldInCrash = true;
        }
        if (rest > 0) borrow(rest);
        const fromInvested = cost - fromEf - rest;
        outcomes[age] = [fromEf > 0 ? 'your emergency fund' : '', fromInvested > 0 ? (age >= 33 ? 'selling investments after the crash' : 'selling investments') : '', rest > 0 ? 'a credit card at 36%' : ''].filter(Boolean).join(', then ');
        outcomes[age] = `Paid by ${outcomes[age]}.`;
      }
      if (age === 27 && s.insured) outcomes[27] = 'Health insurance paid the whole bill.';
      if (age === 33) outcomes[33] = 'Your investments fell 30%. You held on, and they grew back over the following years.';
      note = age === 27 && s.insured ? 'Insurance paid the hospital bill.' : undefined;
    }
    years.push({ age: age + 1, invested: Math.round(invested), emergency: Math.round(emergency), debt: Math.round(debt), note });
    salary *= 1 + PAY.raise;
  }
  const netWorth = Math.round(invested + emergency - debt);
  const verdict = debt > 50000 || netWorth < 500000 ? 'struggling' : netWorth > 2500000 ? 'thriving' : 'okay';
  return { years, outcomes, netWorth, debt: Math.round(debt), peakDebt: Math.round(peakDebt), interestPaid: Math.round(interestPaid), invested: Math.round(invested), soldInCrash, verdict };
}
