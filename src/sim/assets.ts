/**
 * Illustrative asset profiles. These numbers are HYPOTHETICAL long-run ranges for
 * teaching only, not predictions or advice. They must be reviewed by a qualified
 * professional before public release (see docs/safety-compliance.md).
 */
export type AssetClass =
  | 'cash'
  | 'savings'
  | 'fd'
  | 'rd'
  | 'ppf'
  | 'indexFund'
  | 'govBond'
  | 'stock'
  | 'gold'
  | 'reit'
  | 'derivative'
  | 'peVc'
  | 'crypto';

export interface AssetProfile {
  id: AssetClass;
  /** Expected annual nominal return, e.g. 0.07 = 7%. */
  expectedReturn: number;
  /** Annualised volatility (standard deviation of returns). */
  volatility: number;
  /** 1 = locked away, 5 = instant access. */
  liquidity: 1 | 2 | 3 | 4 | 5;
  /** Typical lock-in in years (0 = none). */
  lockInYears: number;
}

export const ASSETS: Record<AssetClass, AssetProfile> = {
  cash: { id: 'cash', expectedReturn: 0, volatility: 0, liquidity: 5, lockInYears: 0 },
  savings: { id: 'savings', expectedReturn: 0.03, volatility: 0, liquidity: 5, lockInYears: 0 },
  fd: { id: 'fd', expectedReturn: 0.07, volatility: 0, liquidity: 3, lockInYears: 0 },
  rd: { id: 'rd', expectedReturn: 0.068, volatility: 0, liquidity: 3, lockInYears: 0 },
  ppf: { id: 'ppf', expectedReturn: 0.071, volatility: 0, liquidity: 1, lockInYears: 15 },
  govBond: { id: 'govBond', expectedReturn: 0.07, volatility: 0.04, liquidity: 3, lockInYears: 0 },
  indexFund: { id: 'indexFund', expectedReturn: 0.12, volatility: 0.17, liquidity: 4, lockInYears: 0 },
  stock: { id: 'stock', expectedReturn: 0.13, volatility: 0.32, liquidity: 4, lockInYears: 0 },
  gold: { id: 'gold', expectedReturn: 0.09, volatility: 0.15, liquidity: 4, lockInYears: 0 },
  reit: { id: 'reit', expectedReturn: 0.09, volatility: 0.18, liquidity: 3, lockInYears: 0 },
  derivative: { id: 'derivative', expectedReturn: 0, volatility: 0.8, liquidity: 4, lockInYears: 0 },
  peVc: { id: 'peVc', expectedReturn: 0.15, volatility: 0.45, liquidity: 1, lockInYears: 8 },
  crypto: { id: 'crypto', expectedReturn: 0.1, volatility: 0.75, liquidity: 4, lockInYears: 0 },
};

/** Illustrative long-run Indian CPI inflation used across the game. */
export const DEFAULT_INFLATION = 0.06;

/** The return used in the onboarding "Kip vs Dash" projection. Always labelled hypothetical. */
export const HYPOTHETICAL_SIP_RETURN = 0.12;

export const HYPOTHETICAL_LABEL = 'Hypothetical returns for learning. Not a prediction or advice.';
