# Curriculum: Principle → Product → Philosophy

Each world takes principles from the founding brief, connects them to **real instruments**, and ends with a **philosophy** the player should carry into real life. Each world has 6–10 lessons of 3–5 minutes, a boss lesson, and a certificate.

**Status:** Worlds 0–2 are written and playable in the Phase 1 build (`src/content/worlds/*.json`). Worlds 3–9 are outlined below for Phases 2 and 3.

> All rates and returns in the game are **illustrative and hypothetical**. A SEBI-registered educator or investment adviser must review the content before public launch. Product facts (e.g. DICGC cover, PPF lock-in) must be re-checked each release.

## Lesson anatomy

| Step | Length | Purpose |
|---|---|---|
| Hook | ~20 s | A Kip or Dash story moment that creates a question |
| Concept | ~60 s | One interactive explainer widget (slider, comparison, swap) |
| Play | 45–90 s | Runner, card or swipe mini-game that makes the concept felt |
| Check | 2–3 questions | Each wrong option targets a named misconception and gets its own explanation |
| Connect | ~20 s | "In real life" product card, plus an optional Real-World Mission |
| Reward | — | XP × streak multiplier, coins, card unlocks, FinIQ |

**Spaced review:** each completed lesson's questions come back on day 1, 3, 7 and 21 after completion.

## World map

| # | World | Principles (from brief) | Real products | Philosophy | Signature mechanic |
|---|---|---|---|---|---|
| 0 | Money Town | Money as a concept or instrument | Cash, bank account, UPI | Money is a tool, not the goal | Barter Swap |
| 1 | The Melt | Why invest: inflation catch-up; save for retirement | Savings account, FD, real vs nominal return | Idle money shrinks | Runner: Inflation Chase |
| 2 | Snowball Valley | Compounding; consistency brings wins; SIPs and discipline (no money in and out); lump sum vs periodic | SIP, index fund, RD, PPF | Time in the market beats timing the market | Runner: Snowball Run |
| 3 | Risk Ridge | Risk as a concept (growth comes with risk); liquidity | Risk–return ladder; FD penalty, ELSS 3-year lock, PPF 15-year lock | Take only risk you understand and can wait out | Runner: Risk Lanes |
| 4 | Product Bazaar | Product classes and what they mean | FD, bonds, stocks, MFs/baskets/ETFs, commodities/gold, REITs, derivatives, PE/VC | Know what you own | Asset Card collection + "Who am I?" |
| 5 | Portfolio Fort | Hedging and risk management; allocation across sectors and product classes | Diversified MF, asset allocation, protective put | Don't put all eggs in one basket | Fort Defense + Hedge Shield |
| 6 | Three Doors (Builder) | Arbitrage vs speculation vs hedging; bitcoin price gaps across exchanges | Exchanges (crypto as case study only), futures, options | Know your intent before you act | Intent Detective + Arbitrage Rush |
| 7 | Time Tracks (Builder) | Scalping, intraday, swing, long term | Brokerage, STT, fees, short- vs long-term capital gains | Costs and stress rise as horizon shrinks | Timeframe Racer |
| 8 | Analyst HQ (Builder) | How to trade: fundamentals vs technicals; fundamental ratios; chart patterns, ratios, option strategies | P/E, P/B, ROE, D/E, EPS growth, dividend yield; candles, S/R, MA, RSI; covered call, protective put, straddle | Analysis beats tips | Ratio Detective, candle chart, Payoff Puzzle |
| 9 | Future You | Retirement and goal planning; PE/VC as the long, illiquid end | NPS, goal-based SIPs, emergency fund, VC funds | Build slowly, build surely | First Paycheck + Launch Plan |

## Worlds 0–2 (built)

### World 0 — Money Town
| ID | Lesson | Key idea | Unlocks |
|---|---|---|---|
| w0-l1 | Before money: the barter mess | Double coincidence of wants | — |
| w0-l2 | What makes money, money | Medium of exchange, unit of account, store of value | — |
| w0-l3 | From coins to UPI | Forms of money; fiat money is trust in the RBI and government | — |
| w0-l4 | Money is a tool | Earn, spend, save, invest; needs vs wants | Cash (if not owned) |

### World 1 — The Melt
| ID | Lesson | Key idea | Unlocks |
|---|---|---|---|
| w1-l1 | Meet The Melt | Inflation: the same money buys less over time | — |
| w1-l2 | Why prices rise | Demand, costs, money supply; RBI's 4% CPI target (2–6% band) | — |
| w1-l3 | Real vs nominal | Real return ≈ nominal return − inflation | Savings Account |
| w1-l4 | Fixed Deposits: the first shield | Fixed rate and tenure, early-withdrawal penalty, DICGC cover up to ₹5 lakh per bank | Fixed Deposit |
| w1-l5 | Boss: Future You needs a pension | Retirement can last 25+ years, and inflation over decades is huge | — |

### World 2 — Snowball Valley
| ID | Lesson | Key idea | Unlocks |
|---|---|---|---|
| w2-l1 | Interest on interest | Simple vs compound interest | — |
| w2-l2 | Time is the secret ingredient | Starting at 15 vs 25; Rule of 72 | — |
| w2-l3 | SIP: investing on autopilot | Fixed amount, fixed interval, discipline | SIP, Index Fund |
| w2-l4 | Lump sum vs SIP | Lump sum wins in steadily rising markets, SIP smooths entry in choppy ones (rupee-cost averaging), and both beat waiting | Lump Sum |
| w2-l5 | Don't break the snowball | Pulling money in and out kills compounding | Recurring Deposit |
| w2-l6 | Boss: the long game | PPF's 15-year lock, and patience as a superpower | PPF |

### World 3 — Risk Ridge (built 1 Nov 2026, opens Season 2)
| ID | Lesson | Key idea | Unlocks |
|---|---|---|---|
| w3-l1 | What risk really means | Volatility (a wobble that usually recovers) vs permanent loss (a bust company or a scam); red flags | — |
| w3-l2 | The risk–return ladder | Savings → FD → bonds → index fund → single shares → crypto: return rises with the size of the swings (Risk Ladder widget, first Risk Lanes run) | Risk Lanes mode |
| w3-l3 | Can you wait it out? | Risk appetite vs risk capacity; the chance of a loss falls with time (simulated: 28% at 1 year, about 2% at 15) | — |
| w3-l4 | Liquidity | How fast, and at what cost, you can get your money; a ₹4,000 surprise bill (Liquidity widget) | — |
| w3-l5 | Lock-ins | FD (break with a penalty), ELSS (3 years), PPF (15 years); when a lock helps | ELSS Fund |
| w3-l6 | Emergency fund first | The order: cushion first, then invest; refill after use | Emergency Fund |
| w3-l7 | Boss: Risk Lanes marathon | 75 seconds of swings and surprise expenses, then mixed questions | Risk mix on the Future You plan |

**Risk Lanes (World 3's runner mode):** the lanes are a risk ladder (SAFE, BALANCED, WILD). Gate rows have one gate per lane; running through one invests your idle coins at that level. Every 6 seconds the market moves each level (SAFE +1%; BALANCED about +2.5% ± 6%; WILD about +4% ± 18%). Twice a run a surprise expense must be paid from idle coins; any shortfall is sold from investments with a 25% hurry cost. The Melt still chases, so holding cash has a cost too.

### World 4 — Product Bazaar (built 1 Nov 2026)
| ID | Lesson | Key idea | Unlocks |
|---|---|---|---|
| w4-l1 | Bonds: lending for interest | A bond is a loan; coupon; why prices fall when rates rise (Rate Seesaw widget) | Government Bond |
| w4-l2 | Shares: owning a slice | A share is part of a business; a great year, a bad year and a bust (Own a Slice widget) | Shares |
| w4-l3 | Mutual funds: pooling | Pooling, NAV, and why 50 companies beat 1 (Basket Builder widget) | Mutual Fund |
| w4-l4 | Index funds and ETFs | Copying an index cheaply; fees compound against you (Fee Drag widget) | — |
| w4-l5 | Gold and commodities | A steadying slice with no income; ways to own gold; first Bazaar Bargain shift | Gold |
| w4-l6 | REITs | Rent from big buildings, paid out; why prices swing | REIT |
| w4-l7 | Boss: Bazaar Bargain | Six customers to match to products, then a market-day run | Market Duel is already open from w3-l2 |

**Bazaar Bargain:** you run a stall; customers arrive with goals (a trip in 4 months, retirement in 35 years, rent-like income, a hot tip). Recommend the best product for 3 stars, an OK one for 1, a bad one and they leave for Dash's stall. Customers and answers live in `src/lessons/bazaar.ts`.

Derivatives move to World 6 (Three Doors, with hedging) and PE/VC to World 9 (Future You), where their cards already belong.

## Worlds 5–9 (built 2 Nov 2026)

**Tracks:** Worlds 6–8 are Builder-only (ages 16–19). Explorers (13–15) go from World 5 straight to World 9, and see the three Builder worlds as one locked card on Home. Switching track in You opens them at any time, and finished lessons stay finished. Path logic: `trackFor`, `pathFor`, `nextLesson` and `isLessonUnlocked` in `src/content/index.ts`.

**Game logic** lives in `src/games/` (pure TypeScript, unit-tested). **Widgets** live in `src/lessons/widgets/world5.tsx` … `world9.tsx`.

### World 5 — Portfolio Fort (both tracks)
| ID | Lesson | Key idea | Unlocks |
|---|---|---|---|
| w5-l1 | Your mix: asset allocation | Split between shares and safety; typical vs bad year (Mix Dial) | Asset Allocation |
| w5-l2 | Fort Defense | Every asset has a weakness; a mixed fort survives every monster (Fort Defense, 5 waves) | — |
| w5-l3 | Rebalancing | A boom then a crash; then **Rebalance Rush**: six market years, 10 seconds each to get back to 60/30/10, against a twin who never rebalances | — |
| w5-l4 | Hedging | A protective put as crash insurance: a small cost, a floor on losses | Hedge, Futures & Options |
| w5-l5 | Boss: Fortress Siege | Fort Defense with 8 waves, then a Risk Lanes run | — |

**Fort Defense:** place 5 towers (shares, bonds, gold, cash, hedge shield), then survive waves of Crash Goblins, Inflation Fog, Rate-Hike Golems and Surprise-Bill Bats. After each wave you may move one tower (rebalancing). In simulation, a balanced fort survives 97% of the time; all-shares survives 34%; all-cash survives but barely grows.

### World 6 — Three Doors (Builder)
| ID | Lesson | Key idea | Unlocks |
|---|---|---|---|
| w6-l1 | Three doors | Hedging vs speculation vs arbitrage, by intent (Intent Detective: swipe each case ← ↑ → to its door) | — |
| w6-l2 | Speculation and leverage | 10× leverage and a 10% fall wipes you out; SEBI's F&O loss study | — |
| w6-l3 | Arbitrage Rush | Two exchange tickers; trade only when the gap beats fees and transfer delay | Crypto |
| w6-l4 | Hedging with futures | Asha the farmer fixes her wheat price | — |
| w6-l5 | Boss: The Detective's Desk | Eight intent cases, then a run | — |

### World 7 — Time Tracks (Builder)
| ID | Lesson | Key idea | Unlocks |
|---|---|---|---|
| w7-l1 | Four speeds | Scalping, intraday, swing and long term | — |
| w7-l2 | The toll on every trade | Costs per round trip compound against frequent traders; short- vs long-term capital gains | — |
| w7-l3 | Timeframe Racer | Scalp 36 ticks with Buy/Sell taps, then hold the same money for 5 years | Buy and Hold |
| w7-l4 | Boss: The Long Track | A **Time Tracks** run (scalp → intraday → swing → long term), then a Timeframe rematch | — |

### World 8 — Analyst HQ (Builder)
| ID | Lesson | Key idea | Unlocks |
|---|---|---|---|
| w8-l1 | Price vs profit: P/E | A price slider drives P/E and P/B | — |
| w8-l2 | Ratio Detective | Hype and debt case files: P/E, debt-to-equity, ROE, growth | Fundamental Analysis |
| w8-l3 | Reading charts | Candles, support and a moving average, then a **Chart Surfer** run, and their limits | — |
| w8-l4 | Options as shapes | Payoff Puzzle: protective put, covered call | — |
| w8-l5 | Boss: The Analyst's Exam | Quality vs value-trap files, then the straddle puzzle | — |

### World 9 — Future You (both tracks)
| ID | Lesson | Key idea | Unlocks |
|---|---|---|---|
| w9-l1 | Your first paycheck | Split ₹30,000 a month, then live 18 years of life events (First Paycheck) | — |
| w9-l2 | Protect before you grow | Emergency fund, health and term insurance; don't mix insurance with investing | Insurance |
| w9-l3 | Retirement | Start age vs a ₹5,000 SIP to 60; step-up SIPs; the 4% rule | NPS |
| w9-l4 | Backing startups | The power law: one bet vs many; 7–10 year lock-ins | PE & VC |
| w9-l5 | Boss: Launch Day | A final First Paycheck, then a Risk Lanes run; every world complete → Launch Plan | — |

**First Paycheck:** one honest model in `src/games/paycheck.ts`. The insurance premium comes out of saving; any card debt (36%) is paid down before investing resumes; each life event reports what actually paid for it. A buffers-first split (20% wants, 15% SIP, 10% emergency fund, insured) ends around ₹43 lakh at 40 with no card interest; spending it all ends near zero after about ₹1.3 lakh of card interest.

**Game modes built for these worlds (2 Nov 2026):**
- **Time Tracks** (Kip Run mode `timeframe`, `src/game/runner/engine.ts`): one run through four equal stages. Scalping is fast, with half-value coins and a FEE arch on every trade; intraday squares off at the 3:30 bell, minus a fee; swing holds overnight, so NEWS GAPS must be jumped (an un-jumped gap takes 35% of idle coins); long term is slow, fee-free, invests idle coins automatically, pays dividends, and compounds banked coins 4% every 2 seconds. The results show what each speed kept. In tests with Kip's autopilot, long term out-earns scalping in over 80% of runs.
- **Chart Surfer** (`src/games/chartSurfer.ts`, `src/game/surfer/`): Kip surfs the newest edge of a candle chart; the future is fog. Tap to jump high coins, hot tips and news gaps. Six planted setups (support, resistance, double bottom, head and shoulders, trend pulling back to its moving average) pause the chart for a read: swipe ↑ or ↓. The textbook read earns coins; the market follows the textbook about 6 times in 10, and the debrief says so.
- **Rebalance Rush** (`src/games/rebalance.ts`): see w5-l3.
- **Intent Detective swipes:** ← Arbitrage, ↑ Speculation, → Hedging; doors stay tappable for accessibility.

Both new run modes also appear in the Kip Run picker once their lesson is done (w7-l3 and w8-l3, Builder track).

## Real-World Missions (Phase 3)
- Ask a parent what FD rate their bank offers today.
- Find the expense ratio of any Nifty 50 index fund on an AMC website.
- Work out what a ₹20 chai costs in 10 years at 6% inflation.
- Look up the P/E of a listed company whose product you use every day.

Each mission is verified by an answer range or a parent confirmation tap.
