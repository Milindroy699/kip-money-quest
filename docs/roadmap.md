# Roadmap: what's pending, and what to build next (1 Nov 2026)

## Where the product stands

**Built:**
- **Season 1:** Worlds 0–2, 15 lessons.
- **Season 2:** Worlds 3–9, 38 lessons. That's all ten worlds, 53 lessons in total. Worlds 6–8 are Builder-only (ages 16–19); Explorers go from World 5 to World 9.
- **Three runner modes:** Inflation Chase, Snowball and Risk Lanes, with Answer Gates, card power-ups and Dash's progressive Hot Tip cameos.
- **Practice Portfolio:** a shared, simulated market.
- **Retention:** streak-as-SIP, freezes, Dividend Day, reviews, nudges, and a comeback bonus.
- **Goals:** a Goal Planner and a Future You plan that fills in.
- **Accounts:** Apple and Google sign-in with parental consent and cloud backup.
- **Production values:** real character animation and sound.

**Verification:** 144 unit tests, and an end-to-end Maestro smoke test.

## What's still pending

| Area | Pending | Needs |
|---|---|---|
| Content | Dash's Scam Hotline; Market Minute; Crash Weekend live event | Design and build |
| Social | Friends list, friend streaks, Investment Clubs; leagues split into groups of 30 and settled on a server | Cloud Functions on Firebase's pay-as-you-go plan |
| Parents | Weekly report emailed automatically (it's in the app and shareable today); a parent dashboard on the web | A scheduled Cloud Function and an email service |
| Accounts | Apple token revocation on delete; official Google logo; more than one child per parent account | A Cloud Function holding the Apple key |
| Insight | A privacy-safe analytics funnel (activation, D1/D7, lesson drop-off). Under-18 rules forbid behavioural tracking, so counts must be aggregate and first-party | Legal sign-off on the design |
| Meta | Future City builder, Real-World Missions with parent verification, live events, classroom mode | Later |
| Polish | A Rive version of Kip, Hindi | Your art; translation |
| Launch | SEBI-registered reviewer for all numbers and claims, especially the tax, F&O, NPS and insurance facts in Worlds 6–9; lawyer review of DPDP consent; privacy policy and terms; TestFlight and Play testing (EAS is set up, the first APK is building); Android device testing; a 50–100 teen beta with before-and-after literacy tests | People and accounts |

## New game concepts for the coming modules

Every concept follows the house rule: **the mechanic is the lesson.** Each one runs on the same honest simulation and rewards good decisions, never luck or risk-seeking.

### World 4, Product Bazaar: know what you own
- **Bazaar Bargain (shopkeeper game):** you run a stall at a busy money bazaar. Customers arrive with a goal ("₹20,000 for a cycle in 8 months", "my grandma wants steady monthly income"). You recommend a product card from your shelf. A good fit earns trust stars; a bad fit sends them to Dash's stall, where it goes wrong. *Teaches:* matching products to horizon, risk and liquidity.
- **Basket Builder (catch game):** fruit (company shares) falls; catch them in a basket. A rotten fruit ruins a basket of 2 but barely dents a basket of 50. *Teaches:* mutual funds, index funds, ETFs and diversification.
- **Rate Seesaw (physics toy):** drag interest rates up and watch bond prices tip down on the other side; catch bonds to lock yields. *Teaches:* why bond prices fall when rates rise.
- **Mall Tycoon Mini (REITs):** own slices of a mall, collect rent every turn, and handle vacancies and renovations. *Teaches:* REIT income and why REITs swing.
- **Boss: Who Am I?** Rapid-fire product clues, as a card battle against Dash.

### World 5, Portfolio Fort: diversify and hedge
- **Fort Defense (tower defense, the signature mode):** waves of market monsters attack: Crash Goblins, Inflation Fog (The Melt), Rate-Hike Golems, Surprise-Bill Bats. Your defences are asset towers: bonds slow enemies, equity deals big damage but stalls in crashes, gold counters inflation, and a cash wall stops surprise bills. One tower type loses; a balanced fort survives. A "hedge shield" (protective put) costs gold every wave but blocks one crash. *Teaches:* allocation, correlation, and hedging as insurance.
- **Rebalance Rush:** after each wave the mix drifts; drag it back to target before the timer runs out. *Teaches:* rebalancing, and "sell high, buy low" made mechanical.

### World 6, Three Doors: arbitrage, speculation and hedging
- **Intent Detective (swipe):** short scenario cards ("buys bitcoin on Exchange A at ₹X and sells on B at ₹Y"). Swipe each to the door it belongs behind: Arbitrage, Speculation or Hedging. *Teaches:* the intent behind a trade.
- **Arbitrage Rush (from your bitcoin-arbitrage principle):** two exchange tickers tick side by side, with fees and transfer delays. Tap only when the gap beats fees plus the delay risk. The gap often closes mid-transfer. *Teaches:* why "free money" rarely is, and what costs and timing do.

### World 7, Time Tracks: scalping, intraday, swing and long term
- **Timeframe Racer:** the same price chart, played at four speeds. *Teaches:* the same market feels completely different at each horizon, and costs and stress fall as it lengthens.
  - **Scalping:** frantic taps, and a fee toll on every trade.
  - **Intraday:** must close by 3:30 pm.
  - **Swing:** holds overnight, so news gaps hit.
  - **Long term:** a calm drive where dividends fall like coins.

### World 8, Analyst HQ: fundamentals and technicals
- **Ratio Detective (noir case files):** three company files land on your desk. Inspect P/E, debt-to-equity, ROE and earnings growth, then accuse the overvalued "suspect". Dash insists the hyped one is fine. *Teaches:* fundamental ratios.
- **Chart Surfer (runner variant):** the track *is* the price chart. Candles are platforms, moving averages are grind rails, and support and resistance are floors and ceilings. Patterns such as head-and-shoulders are level shapes you learn to spot before they finish. *Teaches:* reading charts, and their limits.
- **Payoff Puzzle:** drag option "legs" (buy or sell, call or put) onto a graph to match a target payoff shape: covered call, protective put, straddle. *Teaches:* option strategies as shapes, not jargon.

### World 9, Future You: your Launch Plan
- **First Paycheck (life sim):** you're 22 with your first salary. Allocate it across rent, an emergency fund, SIPs, insurance and fun. Then fast-forward through life events: job change, a wedding, a market crash, a sabbatical. See Future You at 40 and 60. The result is your real, shareable Launch Plan. *Teaches:* everything, applied.

### Cross-cutting ideas
- **Dash's Scam Hotline:** a chat-style mini-game with fake WhatsApp tips, "guaranteed returns" and fake apps. Spot the red flags before Dash falls for them. High real-world value for teens.
- **Market Minute (daily):** one simulated market headline a day. Say what you'd do, then see what calm investors do. No betting and no score for predicting prices; you're rewarded for reasoning.
- **Market Duel (async PvP, from the plan):** both players get the same goal brief and seeded market years. Build a 5-card portfolio; the score is goal reached, drawdown and liquidity, never raw return.
- **Club Fund (co-op):** 5 friends pool XP into a fund that compounds; weekly quests.
- **Crash Weekend (live event):** a shared simulated crash in the Practice Portfolio. Players who hold calmly or rebalance earn a badge. The market is already shared, so everyone lives the same crash.

## Built since this roadmap was written (1 Nov 2026)

- **World 4, Product Bazaar:** 7 lessons, 5 widgets (Rate Seesaw, Own a Slice, Basket Builder, Fee Drag, Bazaar Bargain) and 5 cards.
- **Market Duel:** against Dash offline, or friends by code; it unlocks after the risk–return ladder.
- **Real weekly leagues:** six tiers, with pseudonymous handles and weekly promotion and demotion.
- **Weekly parent report:** shareable, with dinner questions; the Sunday nudge opens it.
- **Server-side consent records.**

**Firestore rules:** published (2 Nov 2026), so cloud backup, consent records, real leagues and friend duels are live.

## Built on 2 Nov 2026: Worlds 5–9

- **World 5, Portfolio Fort:** the Mix Dial, Fort Defense (tower defense), rebalancing and crash insurance. 5 lessons.
- **World 6, Three Doors (Builder):** Intent Detective, leverage, Arbitrage Rush and Asha the farmer's hedge. 5 lessons.
- **World 7, Time Tracks (Builder):** the four speeds, trading costs and tax, and Timeframe Racer (scalp, then hold). 4 lessons.
- **World 8, Analyst HQ (Builder):** P/E and P/B, Ratio Detective, the candle chart, and the Payoff Puzzle. 5 lessons.
- **World 9, Future You:** First Paycheck (a life sim to age 40), insurance, retirement and the 4% rule, and backing startups. 5 lessons, ending in the Launch Plan.
- **Six new cards:** Asset Allocation, Hedge, Buy and Hold, Fundamental Analysis, Insurance and NPS. Futures & Options, Crypto and PE & VC now unlock too, so all 24 cards can be earned.
- **Quiz answers are now shuffled.** Before, the right answer was always listed first.
- **Parent report:** dinner questions for every world.

Full lesson tables are in `docs/curriculum.md`.

**Known issue to check on a real phone:** on the iOS simulator, AVFoundation sometimes stalls while starting a sound (`AudioQueueStart` waits for the simulator's audio device). expo-audio's status observer runs on the main thread and blocks behind it, so the screen can freeze for 30–70 seconds while the game keeps running underneath. It showed up in long Chart Surfer runs, and never with sound off. If it happens on a device, move the short sound effects to a lighter player, or play fewer of them.

**Also built (2 Nov 2026):** your Risk Ridge, Portfolio Fort, Three Doors, Analyst HQ and Future You backgrounds (Risk Ridge also paints the Risk Lanes sky); Chart Surfer; the Time Tracks run mode; Rebalance Rush; swipe gestures for Intent Detective.

## Built on 7 Nov 2026: the campus map, a hero button, and a new Home

- **Hero button.** The bottom bar is now Home · Cards · **Campus** · League · You. The centre is a raised Kip button that pulses while today's goal isn't met. It's a custom JS tab bar (`src/ui/HeroTabBar.tsx`), because the native tab bar can't raise a centre button.
- **Campus map (`src/app/(tabs)/campus.tsx`, `src/campus/`).** Worlds 1–9 are buildings along one winding road. Tap a building and Kip walks there (run cycle going up the map), then its sheet opens (`src/app/world/[id].tsx`): the lessons, the big idea, and the games that live there. When you finish a world, Kip walks on to the next building.
- **Two looks, one layout.** Builder players (16–19) get **Kip Campus** (Melt Lab, Snow Dome, Climbing Wall … Convocation Hall). Explorers (13–15) get **Quest Island** (Melt Marsh, Snowball Peak … Future Lighthouse). Explorers see the Builder-only worlds as Builder-track buildings they can switch to.
- **Games moved onto the map and open progressively.**

  | Spot | Game | Opens |
  |---|---|---|
  | Sports Ground | Kip Run | From day one |
  | Library | Reviews | After the first lesson |
  | Campus Bank | Dividend Day | After Money Town |
  | Trading Lab | Practice Portfolio | After the FD lesson (W1-L4) |
  | Duel Arena | Market Duel | At W3-L3 |

  Run modes, Chart Surfer and the Launch Plan also sit inside their buildings. A newly opened spot shows "NEW" on the map and on Home until you visit it. All unlock rules live in `src/content/unlocks.ts` and `src/campus/map.ts`, and are tested.
- **Home** is now:
  - Status: goal, streak, coins and FinIQ.
  - **Up next** (continue the lesson, or open the map).
  - The streak card.
  - **For you today**: up to three nudges, such as a new campus spot, Dividend Day, reviews due, a quick run, reminders, or the portfolio's move.
  - **Money Town** (World 0), which folds away once finished.
  - The Future You plan.
- **Your goal is always at the top.** A compact chip (for example "💻 Laptop by 25") sits in the top bar on every tab and in the map header. Tapping it opens the plan.
- **Map art is in (same day).** The art from `docs/prompts/campus-art.md` is wired in:
  - **Buildings.** All 30 buildings (both looks), each with an "under construction" version for locked places.
  - **Ground.** Seamless lawn, herringbone, sand, grass and sea tiles.
  - **Scenery.** Trees and props scattered with a fixed seed.
  - **Hero badges.** Kip in a graduation cap or an explorer hat.
  - **Home backdrops.** One per look.
  - **Kip.** Four Veo map clips: walking up, walking down, walking sideways, and idling at a door. Kip faces the way he walks.
  - **Building sheets.** Each sheet shows its building in the banner.
  - **Ambient loops.** Pennant flags, fountains and circling gulls.

  `scripts/process_campus.py` and `scripts/keying.py` cut the art; Kip's clips go through `scripts/process_anims.py`. Layout and scenery rules are unit-tested (nothing overlaps; scenery stays off the road).

## Review and polish on 7 Nov 2026 (version 1.1.0)

**Fixed:**
- **Map animations ran in the background.** Kip's idle loop and every flag, fountain and gull kept animating after you left the map tab, because tabs stay mounted. They now pause when the tab isn't showing, and ambient loops only animate near the part of the map on screen.
- **A walk could open a building over another tab.** If you tapped a building and switched tabs mid-walk, its sheet popped up on the new tab. It now opens only if the map is still showing.
- **Kip blinked out when he turned.** Changing walk direction remounted his image for a frame. The image now stays mounted and swaps source in place.
- **Kip's turns are timed, not listened for.** His facing is worked out from the walk's duration and easing (tested), instead of a JS listener on the native animation, which also removes a dev warning.
- **Map labels collided with the clock.** A soft fade now sits under the status bar and title card.
- **The "Tap a building" hint never went away.** It now disappears after your first walk.
- **Market Duel looked like it had two close buttons.** On the dark background, the ⚔️ in the title read as a second ✕, so it's gone from that title.

**Improvement areas, roughly in priority order:**
1. **Test on a real Android phone**, ideally a low-end one. Check the map's frame rate (five Skia canvases plus sprite loops), the tab bar's raised button and the sound stall seen on the simulator.
2. **Store launch prerequisites:**
   - A Google Play Console account and a service-account key for `eas submit`. The Apple Developer login for TestFlight.
   - Store listings: screenshots, a privacy policy, Play's Data safety form, and the teen and family policy declarations.
   - A lawyer's check of the parental-consent flow against the DPDP Rules.
   - The SEBI-registered reviewer for the tax, F&O and NPS facts in Worlds 6–9.
3. **Bring the 10 Expo packages expo-doctor flags up to date** (patch updates, plus a minor bump for safe-area-context). Then rebuild the native app and retest. They were left as they were for 1.1.0, so the release matches what was tested.
4. **Crash reporting and over-the-air updates.** There's no crash reporting yet. Adding `expo-updates` would let fixes ship without a new build.
5. **Accessibility pass on the map.** Check VoiceOver and TalkBack order across buildings, and how the small fixed-size map labels behave with large text.
6. **Art.**
   - The Fixed Deposit card's padlock art reads as "locked" in the deck, so a vault or shield would be clearer.
   - The down and side walk loops are short (under a second). A 16:9 re-generation, like the new up-walk, would make them smoother.
7. **Tests.** Re-run the Maestro smoke test, which was updated for the map but not run. Maestro can't scroll the You tab on the iOS 26.5 simulator, so the track switch needs another route.

## Device feedback round, 7 Nov 2026 (version 1.2.0)

From testing 1.1.0 on an Android phone:
- **Smooth slider.** The years slider on the dream and lesson charts now drags on the UI thread (Gesture Handler + Reanimated). Before, it only moved when the value changed and felt jumpy on Android. Chart value labels no longer print over each other.
- **The Melt is named as inflation** in onboarding (the Kip vs Dash result and the first-run intro).
- **The map has a clear start.** Money Town (World 0) is now the gate building on the map: open from day one, with a "Start here" label, and it opens the same lessons as Home. Before, every building looked locked to a new player. The first-visit hint says where to tap.
- **Smaller centre button.** It's a 56 px green disc with a white rim (was 70 px with a gold ring), and its label matches the other tabs.
- **Market Duel banner.** It's a night-market banner with Dash on League. While locked, it shows a progress bar, the lessons left and a button to keep learning.
- **Tappable stat chips.** Streak, coins and FinIQ in the top bar now open a sheet (`src/app/stat/[kind].tsx`) explaining each, with what to do next.
- **Trophies tab** (was Cards).
  - It opens with a **Trophy Room**: a wooden cabinet with four shelves of 26 bronze, silver and gold achievements, earned from real progress (`src/engagement/achievements.ts`, tested). Below that come your stats as tiles, then the card deck.
  - League's icon changed to a leaderboard, so the two tabs don't share a trophy icon.
- **Cards redesigned.** Each card has a thick rarity frame, a header band with rarity stars, and the art on a glowing stage, with the user's 24 card illustrations. The Trophy Room shows 24 trophy figurines (2 still to make) on a painted trophy-room backdrop. Prompts are in `docs/prompts/cards-and-trophies.md`.
- **Android build memory.** EAS's build server ran out of memory compiling Skia. The preview profile now builds arm64 and armv7 only, with fewer parallel Gradle workers (`eas.json`).
- **You tab tidied.**
  - The reminder stepper sits on its own row.
  - Stats moved to Trophies.
  - "Testing tools" (a fake-date skip for testing streaks) is hidden in store builds; tap the version line 7 times to show it. "Reset" became "Start over".

**Open question:** whether to widen Explorer from 13–15 to younger players (see the 7 Nov notes in the conversation). It affects content reading level, Google Play's Families policy and Google sign-in for under-13s.

## Built on 7 Nov 2026, evening (version 1.3.0)

- **Adults on the Builder track.** Builder is now 16 and up, adults included; Explorer stays 13–15.
  - Onboarding offers 13–18 as quick taps, plus "19 or older" with an age box.
  - Labels say "Builder 16+".
  - Adults sign in for themselves, don't see the parent report, and get "Quiet on weekday mornings" instead of "school hours".
  - The stored band value is still `'16-19'`, so saved progress needs no migration. Age rules live in `src/content/ages.ts` (tested).
- **Custom goal age.** "By what age?" offers age-appropriate choices plus "Other age" to type any age from a year away up to 99 (`src/ui/GoalAgePicker.tsx`, in onboarding and the plan).
- **Dash overtakes.** In Kip Run, Dash sprints past Kip in the next lane and taunts whenever the player slips:
  - an Impulse Buy, a fee or a hot tip,
  - a cash-out, a missed INVEST gate or a wrong answer,
  - selling in a hurry,
  - leaving a line of 4+ coins on the road.

  It's cosmetic (no score change), with a 5-second cooldown (`engine.ts`, `taunts.ts`, tested).
- **"How Kip Run works" guide.** Before the first run (and from "How to play" on the run screen), there's one card per road object: what to do, what it does to your money, and a goal meter that moves closer or further (`src/game/runner/RunGuide.tsx`).
- **Profile picture.** Pick one of 9 characters or a photo from your library (expo-image-picker). It's kept on the phone in its own store, never in the cloud backup or shown to other players. It shows in You and in your own league row.
- **Next world.** A finished world's sheet shows "On to {next building}" and "Back to the map". The lesson that finishes a world offers "Walk to {next building}", which goes to the map, where Kip walks there.
- **Quiz Battle.** Revision quizzes from your finished lessons' questions: 8 questions, with points for right answers plus a speed bonus.
  - **Modes:** Solo, or 1v1 pass-and-play on one phone (same questions for both; head-to-head result; misses reviewed with their explanations).
  - **Unlock:** opens when World 1 is done.
  - **Where it lives:** the map's Library is now a hub (Reviews + Quiz Battle); a Quiz Battle card on League; a one-time "New: Quiz Battle!" Home nudge, then "Quick quiz?" on quiet days; two trophies (Quiz Starter, Quiz Whiz).
  - **Rewards:** XP for right answers, coins only for the first quiz each day (`src/quiz/quiz.ts`, tested).
  - **Later:** online 1v1 against a friend could reuse Market Duel's friend codes.

## Recommended next three builds (as of the original roadmap)

1. **World 4: Product Bazaar, with Bazaar Bargain and Basket Builder.** Products are the core promise, and players who finish World 3 have nothing new.
2. **Market Duel plus real weekly leagues.** Firestore is set up, so this is the shortest path to competition and social play.
3. **Parent digest, with server-side consent records.** It closes the compliance loop and turns parents into a distribution channel.

**In parallel:** start the launch track (SEBI reviewer, legal review, privacy policy, TestFlight beta).
