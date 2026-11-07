# Kip: Money Quest — Game Design Document

> Working title. A mobile game that teaches teenagers (13–19) to invest from first principles, then connects each principle to real financial products and to a long-term investing philosophy.

## 1. Vision

**Promise to the player:** *Every lesson makes Future You richer and wiser.*

Teens are about to start earning. Most first meet investing through tips, memes and FOMO. Kip: Money Quest teaches them **why** money must be invested (inflation, retirement), **how** it grows (compounding, consistency, SIPs), **what** they can invest in (FDs, bonds, stocks, mutual funds, REITs, gold, derivatives, PE/VC), and **how to think** about risk, liquidity, intent (arbitrage vs speculation vs hedging), time horizon and analysis (fundamentals vs technicals).

**Design pillars**

1. **Principle → Product → Philosophy.** Every lesson starts from a first principle, connects it to a real instrument, and ends with the habit of mind it supports.
2. **Play, don't lecture.** Every concept is *felt* through a runner, a card or a swipe before it is explained in words.
3. **The retention system is the lesson.** Streak = SIP. Streak multiplier = compounding. Breaking a streak = withdrawal. Streak freeze = emergency fund.
4. **One honest simulation.** A single deterministic market engine powers every mode, so the maths is always consistent. Scoring rewards goal-fit, risk-aware outcomes, never raw returns.
5. **Kind, never shaming.** Kip is patient. Mistakes are content, not punishment.

## 2. Audience

| Track | Ages | Depth | Worlds |
|---|---|---|---|
| Explorer | 13–15 | Concepts, stories, simple maths | 0–5 (light) |
| Builder | 16–19 | Adds real products, taxes, ratios, charts, options | 0–9 (full) |

India-first: ₹, SIP, FD, PPF, NPS, Nifty 50, SEBI context. The content layer is data-driven so another locale can be added later.

## 3. Core construct: Future You

- **Dream goal at onboarding:** laptop, bike, travel, college, own business, or "free at 40", with a target age.
- **Future You portrait:** starts foggy and sharpens as FinIQ grows. This is based on Hal Hershfield's future-self continuity research.
- **FinIQ score from 300 to 900:** this mirrors the CIBIL credit-score range. Bands unlock plain-language capability statements.
- **Future City meta-builder (Phase 3):** each world adds a building. These are the Bank, Bond Bridge, Stock Exchange Tower, REIT Mall, Gold Mine and VC Launchpad.
- **Launch Plan capstone:** the teen's first-paycheck money plan, shareable with a parent.

## 4. Loops

| Loop | Length | Contents |
|---|---|---|
| Micro | 3–5 min | One lesson: Hook → Concept → Play → Check → Connect → Reward |
| Daily | 5–10 min | Knowledge SIP (streak), a review of due concepts, one Kip Run |
| Weekly | — | League week, Dividend Day chest, Future You report, club quest |
| Long | Months | Worlds, Future City, Practice Portfolio compounding, FinIQ climb |

## 5. Game modes

See [curriculum.md](curriculum.md) for which world uses which mode.

### 5.1 Kip Run (runner)
- 3 lanes in a pseudo-3D perspective. Swipe left and right to change lanes, up to jump, down to slide.
- **The Melt (inflation)** chases from behind. Hitting obstacles lets it close in. If it catches you, the run ends.
- **Coins in your pocket are idle money.** The Melt shrinks them when it is close. Pass through **Invest Gates** to bank them.
- **Obstacles:** Impulse Buy billboards (slide), Hot Tip traps from Dash (switch lane), fee tollbooths (jump).
- **End-of-run compounding reveal:** banked coins × a consistency-driven multiplier, shown as a "10 years later" animation.

**Modes**

| Mode | World | Twist |
|---|---|---|
| Inflation Chase | 1 | Idle pocket coins shrink near The Melt. Bank them at Invest Gates |
| Snowball Run | 2 | Consecutive coins grow the snowball multiplier. SIP gates auto-invest. "Cash Out!" ramps give instant coins but reset the snowball |
| Risk Lanes | 3 | Safe, medium and wild lanes with different coin density and obstacle rates. Locked coins can't pay emergency tolls |
| Timeframe | 7 | Scalp mode is 4× speed with tiny coins and fee tolls. Long-term mode is calm, and carried coins grow |
| Chart Surfer | 8 | The track is a price chart. Moving averages are grind rails and support levels are platforms |

### 5.2 Asset Cards (collection)
- Every product and strategy is a card with stat bars: **Return potential, Risk, Liquidity, Lock-in, Complexity** (1–5).
- **Rarity = complexity:** Common (Cash, FD), Rare (Index Fund, Gold), Epic (Stocks, REITs), Legendary (Derivatives, PE/VC).
- **Cards unlock through mastery only.** There are no loot boxes and no purchases.
- Each card has an "In real life" panel: what it is in India, who regulates it, and typical lock-ins.

### 5.3 Market Duel (async PvP, Phase 2)
- Both players get the same goal brief and the same random seed.
- Each builds a 5-card portfolio. Then 5 Market Year event cards are revealed: crash, rate hike, inflation spike, sector boom, and others.
- **Score = goal reached + max drawdown + liquidity needs met.** A reckless all-in portfolio does not win.

### 5.4 Quick games
| Game | World | Teaches |
|---|---|---|
| Barter Swap | 0 | Why money exists |
| Intent Swipe | 6 | Arbitrage vs speculation vs hedging |
| Arbitrage Hunt | 6 | Real price gaps are small and fleeting, and fees and delays eat them |
| Ratio Detective | 8 | P/E, P/B, ROE, D/E |
| Payoff Puzzle | 8 | Option strategies as payoff shapes |

## 6. Economy

| Currency | Earned by | Spent on | Notes |
|---|---|---|---|
| XP | Lessons, runs, reviews | — (drives leagues and progress) | Multiplied by the streak multiplier |
| Coins | Runs, lessons, Dividend Day | Streak freezes ("emergency fund"), cosmetics | **Cannot be bought with real money** |
| FinIQ | Mastery of lessons | — | 300–900 |

**Streak multiplier:** `min(1.01^(streak−1), 1.5)`. It literally compounds at 1% per day.

**Dividend Day:** a weekly chest. The payout is deterministic: `base × (active days in last 7 / 7) + streak bonus`.

## 7. Monetisation (proposed, not built)
- **Free core curriculum.** Learning is never paywalled.
- **Family plan:** paid by the parent. Includes the parent dashboard, extra worlds or seasons, and cosmetics.
- **Schools (B2B):** classroom mode, teacher dashboards, inter-school Investing Olympiad.
- **Never:** ads to minors, loot boxes, or pay-to-win.

## 8. Related docs
- [curriculum.md](curriculum.md): worlds, lessons, principle → product → philosophy map
- [characters.md](characters.md): Kip, Dash, The Melt, product mentors
- [onboarding.md](onboarding.md): first-session flow and activation
- [engagement-and-nudges.md](engagement-and-nudges.md): streaks, nudges, notification rules
- [social.md](social.md): leagues, duels, clubs, events, classroom
- [competitors.md](competitors.md): what we borrow and avoid
- [safety-compliance.md](safety-compliance.md): DPDP, SEBI, anti-gambling
- [metrics.md](metrics.md): activation, retention, learning outcomes
- [../README.md](../README.md): how to run the app
