/**
 * Bazaar Bargain (World 4): you run a stall in the money bazaar. Customers arrive with a goal;
 * you recommend a product. A good fit earns trust stars; a bad one sends them to Dash's stall.
 * The lesson is matching products to horizon, risk, liquidity and purpose.
 */
export type Fit = 'best' | 'ok' | 'bad';

export interface BazaarOption {
  cardId: string;
  fit: Fit;
  /** Why, shown after the choice. */
  why: string;
}

export interface Customer {
  id: string;
  name: string;
  emoji: string;
  /** What they want, in their own words. */
  ask: string;
  options: BazaarOption[];
}

export const STARS: Record<Fit, number> = { best: 3, ok: 1, bad: 0 };

export const CUSTOMERS: Customer[] = [
  {
    id: 'trip',
    name: 'Riya, 15',
    emoji: '🎒',
    ask: 'I need ₹3,000 for a school trip in 4 months. It can’t go down!',
    options: [
      { cardId: 'rd', fit: 'best', why: 'A short recurring deposit: steady, safe, and ready in time.' },
      { cardId: 'savings', fit: 'ok', why: 'Safe and instant, just a lower return.' },
      { cardId: 'stock', fit: 'bad', why: 'One company could be down 20% exactly when the trip comes.' },
      { cardId: 'crypto', fit: 'bad', why: 'Can halve in a month. Not for money needed soon.' },
    ],
  },
  {
    id: 'grandpa',
    name: 'Grandpa Joseph, 68',
    emoji: '👴',
    ask: 'I want a steady income and I can’t afford to lose my savings.',
    options: [
      { cardId: 'govBond', fit: 'best', why: 'Government bonds pay regular interest and are about as safe as it gets.' },
      { cardId: 'fd', fit: 'ok', why: 'Safe and predictable too, though income comes at the end unless he picks payouts.' },
      { cardId: 'reit', fit: 'ok', why: 'Pays rent-like income, but its price swings.' },
      { cardId: 'crypto', fit: 'bad', why: 'No income, wild swings. The opposite of what he asked for.' },
    ],
  },
  {
    id: 'retire',
    name: 'Aisha, 22',
    emoji: '👩‍💻',
    ask: 'I can put away ₹2,000 a month for retirement. That’s 35 years away.',
    options: [
      { cardId: 'indexFund', fit: 'best', why: 'A low-cost index fund SIP: decades to ride out the swings and compound.' },
      { cardId: 'ppf', fit: 'ok', why: 'Safe and tax-free, but slower growth over 35 years.' },
      { cardId: 'savings', fit: 'bad', why: 'Over 35 years, inflation would quietly eat it.' },
      { cardId: 'gold', fit: 'ok', why: 'A useful slice, but not the main engine for 35 years of growth.' },
    ],
  },
  {
    id: 'inflation',
    name: 'Mr Rao, 40',
    emoji: '👨‍🏫',
    ask: 'Prices are rising fast. I want a slice of my money to hold its value.',
    options: [
      { cardId: 'gold', fit: 'best', why: 'Gold has often held up when inflation and fear rise. A slice, not everything.' },
      { cardId: 'indexFund', fit: 'ok', why: 'Shares tend to beat inflation over the long run, with swings.' },
      { cardId: 'savings', fit: 'bad', why: 'Savings usually earn less than inflation: the opposite of protection.' },
      { cardId: 'fd', fit: 'ok', why: 'Beats savings, but barely keeps up after tax.' },
    ],
  },
  {
    id: 'tip',
    name: 'Kabir, 17',
    emoji: '📱',
    ask: 'A WhatsApp group says one stock will 10× by Friday. Should I go all in?',
    options: [
      { cardId: 'indexFund', fit: 'best', why: 'Talk him out of the tip. If he wants shares, own the whole market, slowly.' },
      { cardId: 'stock', fit: 'bad', why: 'All-in on a hot tip is a classic way to lose money. Often it’s a pump-and-dump.' },
      { cardId: 'crypto', fit: 'bad', why: 'Swapping one gamble for another.' },
      { cardId: 'savings', fit: 'ok', why: 'Safer than the tip, at least.' },
    ],
  },
  {
    id: 'tax',
    name: 'Priya, 30',
    emoji: '🧾',
    ask: 'I want to save tax, I can lock money for 3 years, and I’d like growth.',
    options: [
      { cardId: 'elss', fit: 'best', why: 'ELSS: share-market growth, a tax deduction, and the shortest lock among 80C options.' },
      { cardId: 'ppf', fit: 'ok', why: 'Saves tax too, but locks for 15 years and grows slower.' },
      { cardId: 'savings', fit: 'bad', why: 'No tax saving and little growth.' },
      { cardId: 'stock', fit: 'ok', why: 'Growth, but no tax deduction and lots of single-company risk.' },
    ],
  },
  {
    id: 'rent',
    name: 'Mrs Shah, 55',
    emoji: '🏢',
    ask: 'I’d love rental income, but I can’t afford to buy a whole flat.',
    options: [
      { cardId: 'reit', fit: 'best', why: 'A REIT owns rent-paying buildings and pays most of the rent out, in small slices.' },
      { cardId: 'govBond', fit: 'ok', why: 'Steady income, though not from property.' },
      { cardId: 'crypto', fit: 'bad', why: 'No rent, no income, big swings.' },
      { cardId: 'gold', fit: 'bad', why: 'Gold pays no income at all.' },
    ],
  },
  {
    id: 'emergency',
    name: 'Dev, 19',
    emoji: '🧯',
    ask: 'I’m building my emergency fund. Where should it sit?',
    options: [
      { cardId: 'savings', fit: 'best', why: 'Instant and free to take out: exactly what emergency money needs.' },
      { cardId: 'fd', fit: 'ok', why: 'Can be broken with a small penalty. Fine for part of it.' },
      { cardId: 'elss', fit: 'bad', why: 'Locked for 3 years. Useless in an emergency.' },
      { cardId: 'stock', fit: 'bad', why: 'Might be down right when the emergency hits.' },
    ],
  },
  {
    id: 'pick',
    name: 'Meera, 25',
    emoji: '🧑‍🎨',
    ask: 'My goal is 10 years away, and I’d rather a professional picked the shares.',
    options: [
      { cardId: 'mutualFund', fit: 'best', why: 'An actively managed fund: a professional picks, for a yearly fee.' },
      { cardId: 'indexFund', fit: 'best', why: 'Also great: no picking at all, and lower fees.' },
      { cardId: 'stock', fit: 'bad', why: 'She asked not to pick shares herself.' },
      { cardId: 'savings', fit: 'bad', why: 'Too slow for a 10-year goal.' },
    ],
  },
];

export function customersFor(ids: string[] | null, count: number): Customer[] {
  const list = ids ? CUSTOMERS.filter((c) => ids.includes(c.id)) : CUSTOMERS;
  return list.slice(0, count);
}
