/** Ratio Detective (World 8): read three companies' files and spot the suspect. */
export interface Company {
  name: string;
  emoji: string;
  pe: number;
  de: number;
  roe: number;
  growth: number;
}

export interface Case {
  id: string;
  question: string;
  companies: Company[];
  answer: number;
  why: string;
}

export const CASES: Case[] = [
  {
    id: 'hype',
    question: 'Which share looks most overvalued?',
    companies: [
      { name: 'Sunrise Foods', emoji: '🍪', pe: 18, de: 0.3, roe: 18, growth: 12 },
      { name: 'HypeTech AI', emoji: '🤖', pe: 140, de: 0.2, roe: 6, growth: 8 },
      { name: 'Steady Cement', emoji: '🏗️', pe: 22, de: 0.6, roe: 15, growth: 10 },
    ],
    answer: 1,
    why: 'A P/E of 140 means paying ₹140 for every ₹1 of yearly profit, while profits grow only 8%. The price is running far ahead of the business.',
  },
  {
    id: 'debt',
    question: 'Which company is riskiest if interest rates rise?',
    companies: [
      { name: 'Coastal Power', emoji: '⚡', pe: 14, de: 3.2, roe: 12, growth: 6 },
      { name: 'Bright Pharma', emoji: '💊', pe: 28, de: 0.1, roe: 20, growth: 14 },
      { name: 'Metro Retail', emoji: '🛒', pe: 35, de: 0.4, roe: 16, growth: 18 },
    ],
    answer: 0,
    why: 'Debt-to-equity of 3.2 means it owes over three times what its owners put in. Higher rates make that debt far more expensive.',
  },
  {
    id: 'quality',
    question: 'Which looks like the best quality for a fair price?',
    companies: [
      { name: 'Old Mills', emoji: '🧵', pe: 9, de: 1.8, roe: 5, growth: -4 },
      { name: 'Clear Water', emoji: '💧', pe: 24, de: 0.2, roe: 24, growth: 16 },
      { name: 'Rocket Games', emoji: '🎮', pe: 90, de: 0.5, roe: 9, growth: 20 },
    ],
    answer: 1,
    why: 'High return on equity, little debt, solid growth and a reasonable P/E. Cheap isn’t always good: Old Mills is cheap because profits are shrinking.',
  },
  {
    id: 'trap',
    question: 'Which "bargain" is probably a value trap?',
    companies: [
      { name: 'Paper Press', emoji: '📰', pe: 6, de: 2.5, roe: 4, growth: -10 },
      { name: 'Green Fields', emoji: '🌾', pe: 16, de: 0.4, roe: 14, growth: 9 },
      { name: 'City Hospitals', emoji: '🏥', pe: 30, de: 0.7, roe: 17, growth: 15 },
    ],
    answer: 0,
    why: 'A P/E of 6 looks cheap, but profits are falling 10% a year and debt is high. A low price can mean the business is shrinking.',
  },
];
