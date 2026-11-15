/** Intent Detective (World 6): which door is this trade behind? Arbitrage, speculation or hedging. */
export type Door = 'arbitrage' | 'speculation' | 'hedging';

export const DOORS: Record<Door, { emoji: string; name: string; short: string }> = {
  arbitrage: { emoji: '⚖️', name: 'Arbitrage', short: 'Same thing, two prices: buy cheap and sell dear at the same time' },
  speculation: { emoji: '🎲', name: 'Speculation', short: 'Betting on which way a price will move' },
  hedging: { emoji: '🛡️', name: 'Hedging', short: 'Reducing a risk you already have' },
};

export interface Scenario {
  id: string;
  text: string;
  door: Door;
  why: string;
}

export const SCENARIOS: Scenario[] = [
  { id: 'btc', text: 'Bitcoin costs ₹50,00,000 on Exchange A and ₹50,40,000 on Exchange B. Riya buys on A and sells on B at the same moment.', door: 'arbitrage', why: 'Same asset, two prices, both trades at once. That’s arbitrage, if the gap beats the fees.' },
  { id: 'results', text: 'Kabir buys a company’s shares because he thinks the price will jump after its results.', door: 'speculation', why: 'He’s betting on a price move. That’s speculation.' },
  { id: 'farmer', text: 'A wheat farmer agrees today to sell her harvest at a fixed price in three months.', door: 'hedging', why: 'She already has price risk on her crop; fixing the price reduces it.' },
  { id: 'importer', text: 'An importer who must pay in dollars next month locks in today’s exchange rate.', door: 'hedging', why: 'The bill already exists; locking the rate removes the currency risk.' },
  { id: 'moon', text: 'Dash buys a coin a YouTuber says will "go to the moon".', door: 'speculation', why: 'Pure bet on direction, on a tip. Speculation, and a risky one.' },
  { id: 'gold', text: 'A trader sees gold priced lower on one exchange than another and trades on both at once.', door: 'arbitrage', why: 'Simultaneous buy-low, sell-high of the same thing: arbitrage.' },
  { id: 'put', text: 'An investor with lots of shares buys a put option before a big event, in case prices fall.', door: 'hedging', why: 'Insurance on shares she already owns: hedging.' },
  { id: 'futures', text: 'Someone borrows money to buy Nifty futures, expecting the market to rise this week.', door: 'speculation', why: 'A leveraged bet on direction: speculation.' },
  { id: 'phones', text: 'A reseller buys phones in a city where they’re ₹500 cheaper and sells them in another, after transport costs.', door: 'arbitrage', why: 'Price gap between two places, after costs: arbitrage.' },
  { id: 'airline', text: 'An airline fixes next year’s fuel price with a contract.', door: 'hedging', why: 'It must buy fuel anyway; fixing the price reduces the risk.' },
];
