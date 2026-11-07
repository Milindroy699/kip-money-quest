/**
 * Registry of every processed art asset (see design/source-art/README.md for the pipeline).
 * Originals live in design/source-art; app-ready cut-outs live in assets/.
 */
import type { MoodT, SpeakerT } from '../content/schema';

export const KIP = {
  happy: require('../../assets/characters/kip_happy.webp'),
  talk: require('../../assets/characters/kip_talk.webp'),
  think: require('../../assets/characters/kip_think.webp'),
  worry: require('../../assets/characters/kip_worry.webp'),
  cheer: require('../../assets/characters/kip_cheer.webp'),
  sleepy: require('../../assets/characters/kip_sleepy.webp'),
  full: require('../../assets/characters/kip_full.webp'),
  front: require('../../assets/characters/kip_front.webp'),
  threeQuarter: require('../../assets/characters/kip_three_quarter.webp'),
  side: require('../../assets/characters/kip_side.webp'),
  back: require('../../assets/characters/kip_back.webp'),
};

export const DASH = {
  excited: require('../../assets/characters/dash_excited.webp'),
  smug: require('../../assets/characters/dash_smug.webp'),
  shocked: require('../../assets/characters/dash_shocked.webp'),
  sheepish: require('../../assets/characters/dash_sheepish.webp'),
  panicked: require('../../assets/characters/dash_panicked.webp'),
  thoughtful: require('../../assets/characters/dash_thoughtful.webp'),
  front: require('../../assets/characters/dash_front.webp'),
  threeQuarter: require('../../assets/characters/dash_three_quarter.webp'),
};

export const MELT = {
  drifting: require('../../assets/characters/melt_drifting.webp'),
  reaching: require('../../assets/characters/melt_reaching.webp'),
  laughing: require('../../assets/characters/melt_laughing.webp'),
};

/** Close-up (bust) image for a speaker in a given mood. */
export function bustFor(name: SpeakerT, mood: MoodT): number {
  if (name === 'kip') return KIP[mood];
  if (name === 'dash') return { happy: DASH.smug, talk: DASH.excited, think: DASH.thoughtful, worry: DASH.shocked, cheer: DASH.excited }[mood];
  return { happy: MELT.drifting, talk: MELT.drifting, think: MELT.drifting, worry: MELT.reaching, cheer: MELT.laughing }[mood];
}

/** Full-body image for a speaker. */
export function fullBodyFor(name: SpeakerT): number {
  return name === 'kip' ? KIP.full : name === 'dash' ? DASH.front : MELT.drifting;
}

export const PROPS = {
  coin: require('../../assets/props/prop_coin_1.webp'),
  investGate: require('../../assets/props/prop_invest_gate_2.webp'),
  sipGate: require('../../assets/props/prop_sip_gate_1.webp'),
  billboard: require('../../assets/props/prop_impulse_billboard_1.webp'),
  hotTip: require('../../assets/props/prop_hot_tip_trap_1.webp'),
  feeToll: require('../../assets/props/prop_fee_toll_1.webp'),
  cashOut: require('../../assets/props/prop_cash_out_ramp_2.webp'),
};

/** Mentor art for the product cards that have a mentor. */
export const MENTORS: Record<string, number> = {
  govBond: require('../../assets/mentors/mentor_bondi_2.webp'),
  gold: require('../../assets/mentors/mentor_goldie_2.webp'),
  reit: require('../../assets/mentors/mentor_rita_1.webp'),
  peVc: require('../../assets/mentors/mentor_vee_1.webp'),
  derivative: require('../../assets/mentors/mentor_fizz_1.webp'),
};

export const BACKGROUNDS = {
  moneyTown: require('../../assets/backgrounds/bg_money_town_1.jpg'),
  theMelt: require('../../assets/backgrounds/bg_the_melt_1.jpg'),
  snowballValley: require('../../assets/backgrounds/bg_snowball_valley_1.jpg'),
  onboarding: require('../../assets/backgrounds/bg_onboarding_future_1.jpg'),
  celebration: require('../../assets/backgrounds/bg_celebration_1.jpg'),
  cardVault: require('../../assets/backgrounds/bg_card_vault_1.jpg'),
  nightMarket: require('../../assets/backgrounds/bg_night_market_1.jpg'),
  riskRidge: require('../../assets/backgrounds/bg_risk_ridge_2.jpg'),
  portfolioFort: require('../../assets/backgrounds/bg_portfolio_fort_1.jpg'),
  threeDoors: require('../../assets/backgrounds/bg_three_doors_2.jpg'),
  analystHq: require('../../assets/backgrounds/bg_analyst_hq_2.jpg'),
  futureYou: require('../../assets/backgrounds/bg_future_you_2.jpg'),
  timeTracks: require('../../assets/backgrounds/bg_time_tracks.jpg'),
  /** Home: Money Town, with the road out to the campus gate (Builder) or the island (Explorer). Cut by scripts/process_campus.py. */
  homeCampus: require('../../assets/backgrounds/bg_home_campus.jpg'),
  homeIsland: require('../../assets/backgrounds/bg_home_island.jpg'),
  /** Trophies tab. Cut by scripts/process_collectibles.py. */
  trophyRoom: require('../../assets/backgrounds/bg_trophy_room.jpg'),
};

export type BackgroundKey = keyof typeof BACKGROUNDS;

/** Each world's backdrop, and whether it is dark (so text and scrims can adapt). */
export const WORLD_BACKGROUND: Record<string, { key: BackgroundKey; dark: boolean }> = {
  w0: { key: 'moneyTown', dark: false },
  w1: { key: 'theMelt', dark: true },
  w2: { key: 'snowballValley', dark: false },
  w3: { key: 'riskRidge', dark: false },
  w4: { key: 'nightMarket', dark: true },
  w5: { key: 'portfolioFort', dark: true },
  w6: { key: 'threeDoors', dark: true },
  w7: { key: 'timeTracks', dark: false },
  w8: { key: 'analystHq', dark: true },
  w9: { key: 'futureYou', dark: false },
};
