# Journey review: product, QA and game production

> **Status (1 Nov 2026):** the whole **Now** batch is done. Bugs fixed, economy rebalanced, daily-goal ring and Builder deep-dives added, run buttons and "Watch Kip play" added, reminders-off notice added, personal best shown, and a saved-progress migration added. Details are at the end. The tables below describe the build *before* those fixes.

Review of the Phase 1 build (1 Nov 2026) through three lenses:
- **Product** asks whether the proposition is clear, personal and worth coming back for.
- **QA** asks what is broken, inconsistent or untested. Bugs below were verified in the code or on the simulator.
- **Game production** asks whether the loop is fun, balanced and paced for months, not days.

## The verdict

The foundation is strong. The retention system teaches the principle it rewards (the streak is a SIP, the freeze is an emergency fund). The maths is honest and tested, and the art now gives the game real charm.

The proposition is **not yet personal or consequential enough**:
- **The promise is abstract.** "Make Future You richer and wiser" is the promise, but Future You is a blurred circle and the dream goal is never turned into a plan.
- **The rewards don't mean anything.** Coins have almost nothing to buy, and cards are only for display.
- **The game and the learning sit side by side instead of feeding each other.** You learn in the quiz and you play in the runner. Nothing in the runner uses what you learned.

Fix those three and the proposition becomes: **"Learn money by playing, and leave with your own first money plan."**

---

## Proposition: what to sharpen

| Today | Stronger version | Why it matters |
|---|---|---|
| Pick a dream goal (laptop) and an age, shown as a label | **Goal Planner:** price the dream, apply inflation, and show the monthly SIP that gets you there. Example for a 16-year-old: a ₹60,000 laptop today costs about ₹1 lakh at 25 (6% inflation), which is about ₹520 a month from now at a hypothetical 12% | Turns "literacy" into a personal outcome. This is the win teens and parents both understand |
| Kip vs Dash uses a generic ₹500 | Rerun the magic moment with the player's own goal and age | Personal "aha" in onboarding, not a textbook one |
| Future You is a blurred circle | Future You becomes a **plan card that fills in as you learn**. Each world unlocks a piece: inflation-adjusted price (World 1), monthly SIP (World 2), risk mix (World 3), product choice (World 4) | Progress you can see that is also useful in real life |
| Launch Plan arrives in World 9 (Phase 3) | A **mini Launch Plan after World 2**, shareable with a parent | Delivers the promise in the first 2 weeks, not months |
| FinIQ 300–900 | Keep it, and show what each point unlocked on the plan card | Ties the score to capability, not vanity |

---

## Journey 1: first-time onboarding

| Lens | Finding | Severity |
|---|---|---|
| Product | Age band ("Explorer / Builder") and daily goal (3/5/10 min) are asked but **never used**. Every question in onboarding should visibly change something | High |
| Product | The magic moment is generic (₹500 a month) instead of the player's own dream | High |
| Product | No parent touchpoint yet. For teen finance, parents are the trust and distribution channel | Medium (Phase 2) |
| QA | If the app is closed before the last step, onboarding restarts at step 1. The first run can then be replayed for a second set of rewards | Low |
| QA | Notification permission denial is silent. The player is never told nudges are off or how to turn them on | Medium |
| Producer | The first run arrives at step 4, about 2 minutes in. Good pacing; keep it under 3 minutes end to end | OK |

## Journey 2: the daily loop (open → streak → play → reward → nudge)

| Lens | Finding | Severity |
|---|---|---|
| Product | No **daily goal progress** ("2 of 3 minutes today"). Duolingo's ring is the single strongest daily pull | High |
| Product | The "streak = SIP" idea is the differentiator, but it is never *explained* to the player. Add a one-time explainer when the streak first grows or breaks | Medium |
| Producer | Players can binge all 15 lessons in one evening, then nothing is left. Encourage spacing (bonus for daily, not for bulk) | High |
| QA | Dividend Day is claimable on day 1, which works against the lesson of waiting for dividends | Low (design call) |
| QA | Nudge copy and schedule are unit-tested, but on-device delivery hasn't been verified (permission needed on the simulator) | Medium |

## Journey 3: a lesson (story → concept → play → check → connect → reward)

| Lens | Finding | Severity |
|---|---|---|
| Producer | **Learning and play are separate.** The run in a lesson never asks you to use what the lesson taught | High |
| Product | Real-World Missions are shown but can't be completed or rewarded, so the bridge to real life is one-way | Medium |
| QA | Lesson complete always shows a "◎ 1" growth-ring badge, whatever the streak (`src/app/lesson/[id].tsx` line 48) | Low (bug) |
| QA | Replaying a finished lesson grants full XP every time (`src/state/game.ts` line 186). This lets players farm XP for leagues | Medium (bug) |
| QA | Leaving a lesson mid-way discards lesson progress but keeps the run's rewards | Low |
| QA | **Accessibility blocker:** runs are swipe-only and can't be skipped, so a player who can't swipe can't finish lessons that contain a run | High |
| Product | Boss lessons are just longer runs. They don't feel like a boss | Medium |

## Journey 4: Kip Run (free play)

| Lens | Finding | Severity |
|---|---|---|
| Producer | **Economy is broken by runs** (measured over 40 seeds with a competent bot). See the table below | High |
| Producer | No reason to replay beyond coins: personal best is tracked but never shown, there are no daily challenges and no unlocks | High |
| Producer | No sound. Coin, bank, hit and The Melt's rumble are the cheapest big jump in game feel | Medium |
| Producer | Snowball mode pays about 3× Inflation mode for the same time | Medium |
| QA | Asking for Snowball before it's unlocked silently starts Inflation instead | Low |
| Product | Being caught shows The Melt laughing. It's playful, but check it against the "never shame" principle | Low |

**Coins per run vs everything else** (median over 40 runs, competent play):

| Source | Coins |
|---|---|
| Inflation run, 45 s | 113 |
| Inflation run, 60 s | 157 |
| Snowball run, 45 s | 332 |
| Snowball run, 60 s | 491 |
| Lesson complete | 10 (25 for a boss) |
| Dividend Day | about 20–80 a week |
| Streak freeze (the only thing to buy) | costs 50 |

One run buys two "emergency funds", so the freeze stops teaching anything. Lessons and Dividend Day become irrelevant to the economy.

## Journey 5: collection (cards)

| Lens | Finding | Severity |
|---|---|---|
| Producer | Cards **do nothing** after unlock, so collecting has no pull beyond completion | High |
| Product | This is the best place to make "principle → product" playable (see "Card loadouts" below) | High |
| QA | 8 of 16 cards are obtainable in this build; the rest show "Unlocks in World N" with mentor silhouettes. That's fine, as long as the store listing doesn't promise all 16 | Info |

## Journey 6: progress and identity (FinIQ, Future You, You tab)

| Lens | Finding | Severity |
|---|---|---|
| Product | FinIQ moves about +8 per lesson. After all 15 lessons it reaches about 450, the very start of "Saver". Progress feels slow; show progress inside the band | Medium |
| Product | Future You's clarity curve works, but a blurred circle isn't aspirational. Replace it with the plan card or the goal object coming into focus | High |
| QA | Capability statements are good, and they come straight from the completed lessons | OK |

## Journey 7: lapsed player (comeback)

| Lens | Finding | Severity |
|---|---|---|
| Product | Comeback copy is kind ("your knowledge stayed"). The comeback bonus mentioned in the nudge doc isn't actually granted | Medium |
| Producer | No "welcome back" quick win, such as a 1-minute review that restores some of the multiplier | Medium |

## Journey 8: competition and social

| Lens | Finding | Severity |
|---|---|---|
| Product | The league uses practice rivals and is labelled as a preview. Promotion and demotion aren't simulated, so "Top 7 move up" isn't true yet | Medium |
| QA | "1 days left" grammar on the last day (`src/app/(tabs)/league.tsx` line 57) | Low (bug) |
| Producer | Replay XP farming (Journey 3) would break real leagues. Fix it before Phase 2 | Medium |

## Journey 9: end of content

| Lens | Finding | Severity |
|---|---|---|
| Product | After lesson 15 there's no "Season 1 complete" moment, no mini Launch Plan and no clear "what next". The Learn tab just shows locked "coming soon" worlds | High |
| Producer | Plan the content cadence: a new world every 2–3 weeks keeps retention after launch | Medium |

## Cross-cutting QA

| Area | Finding | Severity |
|---|---|---|
| Test coverage | 53 unit tests cover the maths, streaks, nudges, runner and content. There are **no end-to-end tests**. Add Maestro flows (onboarding → lesson → run → reward) using the test IDs already in the screens | High |
| Data safety | Saved progress has a version number but no migration. The next change to its shape could wipe or crash existing progress | Medium |
| Analytics | No funnel events yet, so activation and retention can't be measured in a beta | Medium (Phase 2) |
| Compliance | "Hypothetical" labels appear on every projection. Content still needs review by a SEBI-registered professional before public launch | Info |

---

## Game ideas that connect learning to play

1. **Answer Gates (runner).** Three gates appear, labelled with answers to a question from the current lesson ("Real return of a 7% FD with 6% inflation?"). Running through the right one banks a bonus. The wrong one lets The Melt gain. It turns quizzes into play and reuses spaced review.
2. **Card loadouts (cards become power-ups with real product traits).** Equip one product card before a run:

   | Card | In-run effect | Teaches |
   |---|---|---|
   | Fixed Deposit | One shield against a hit, small bank bonus | Safety, low return |
   | Index Fund | Coin multiplier that swings up and down during the run | Growth with volatility |
   | PPF | Big bonus, but only paid at the end, with no early banking | Lock-in for long goals |
   | SIP | Auto-banks a little every 10 seconds | Consistency on autopilot |
   | Savings Account | Bank anywhere, tiny bonus | Liquidity |

3. **Practice Portfolio (the coin sink).** Coins can be invested into unlocked cards. They compound weekly through the existing market simulation, with the occasional event card such as a crash or rate hike. Withdrawing early costs a penalty. Coins finally mean money, cards become functional, and allocation is learned by doing.
4. **Boss fights with phases.** The Melt boss speeds up in waves and must be outrun by hitting gates in a row. Dash's boss tempts with three hot tips at once.
5. **Daily run challenge.** One rotating goal a day, such as "Bank at 5 gates in a row" or "Finish with 0 idle coins", for a bonus.

---

## Prioritised plan

**Now (fixes and quick wins, 1–2 days): ✅ done**
1. Fix the ring badge, the "days" grammar, and replay XP (halve it on replays and cap it per day).
2. Rebalance the economy:
   - Cap run payouts.
   - Make the modes pay the same per minute.
   - Raise the lesson reward.
   - Price freezes so one costs about a week of play.
3. Use the onboarding answers: a daily goal ring on Learn, and Builder-track copy for 16–19.
4. Add an accessibility option: tap controls in the runner, plus an "auto-run" fallback so lessons are never blocked.
5. Tell the player when nudges are off, with a button to settings.
6. Show personal best on the Kip Run screen.

**Next (proposition, 1–2 weeks): ✅ done**
1. Goal Planner and a personal magic moment (the player's goal, age and monthly SIP).
2. The Future You plan card that fills in by world, plus a mini Launch Plan after World 2.
3. Answer Gates in the runner.
4. Card loadouts.
5. Sound effects and music.
6. A "Season 1 complete" end state.
7. Maestro end-to-end tests and a saved-data migration.

**Later (Phase 2–3)**
1. Practice Portfolio. ✅ 1 Nov 2026
2. Real leagues and friends, with the economy and XP fixes in place.
3. Parent link and digest.
4. Analytics funnel.
5. Worlds 3–5 and Market Duel. World 3 ✅ 1 Nov 2026; Worlds 4–5 and Market Duel still to do.
6. Comeback bonus (Journey 7). ✅ 1 Nov 2026

---

## What the Later batch has changed so far (1 Nov 2026)

| Item | Change |
|---|---|
| Practice Portfolio | `/portfolio` (from Learn and Cards). Invest coins in unlocked products; 1 real day = 1 market month. The market is shared and seeded by date, with occasional crashes, booms, rate hikes and inflation spikes that roughly cancel out over time. FD and RD lock 12 months (1% to break early), ELSS 36, PPF 84; funds, gold, shares and REITs are liquid but swing. Up to 2,000 coins; Kip coaches on crashes and concentration. Tests: index funds beat FDs in most 10-year stretches; crashes hit shares hardest; locks and limits hold |
| World 3: Risk Ridge | 7 lessons (risk, the ladder, capacity, liquidity, lock-ins, emergency fund, boss), 3 new widgets (Risk Ladder, How Long Can You Wait, Liquidity), 2 new cards (ELSS, Emergency Fund), Answer Gate questions, and the risk mix on the plan card. Season 1 stays Worlds 0–2 |
| Risk Lanes | A new runner mode: SAFE / BALANCED / WILD gates, market swings, surprise expenses. Pays the same per minute as the other modes (tested) |
| Comeback bonus | After 3+ days away, the first lesson, review or run back pays +30 coins. Learn tells you it's waiting; reward screens show it. The streak still resets |
| Saved progress | Version 6 (accounts, save prompt and portfolio), each with a tested migration |

## What the Now batch changed (1 Nov 2026)

| Item | Change |
|---|---|
| Growth-ring badge | Lesson complete shows the player's real rings |
| League grammar | "1 day left" |
| Replay farming | Replays earn half XP, capped at 60 a day, and no coins. The screen explains why |
| Economy | Run coins are now score ÷ 8 (Inflation) or ÷ 24 (Snowball), capped at 20. Only the first 3 runs a day pay. Lessons pay 20 (boss 40), and a freeze costs 200. Tests confirm the modes pay within 30% of each other per minute, and that a freeze costs 4–7 steady days |
| Onboarding answers used | The daily goal fills a ring on Learn. The age band sets the Explorer or Builder track, shown on Learn and switchable in You. Builder players see a "Builder deep-dive" on 10 lessons (tax, KYC, STP, PPF extension and more) |
| Accessibility | On-screen ◀ ▲ ▼ ▶ run buttons: a setting in You, and on automatically with VoiceOver or TalkBack. "Watch Kip play" lets an autopilot finish any run (tested on 60 runs), so lessons and onboarding are never blocked. It pays no coins |
| Reminders off | A banner on Learn and a notice in You, with a one-tap "Turn on" (asks again, or opens Settings) |
| Personal best | Shown on the Kip Run screen with "coin runs left today". "New personal best!" appears on results |
| Saved progress | Store is now version 2, with a tested migration from version 1 |

## What the Next batch changed (1 Nov 2026)

| Item | Change |
|---|---|
| Goal Planner | Onboarding asks for exact age (13–19) and the dream's price, with editable Indian defaults. `src/sim/goals.ts` turns this into the price at the target age (6% inflation), a monthly SIP at a horizon-appropriate hypothetical return (7% / 9% / 12%), the cash-only alternative, and the cost of waiting 3 years. Tested: a ₹60k laptop at 16 → 25 needs about ₹520 a month |
| Personal magic moment | Kip vs Dash now uses the player's own goal: "Dash saves ₹940 a month in a drawer, Kip invests ₹520" |
| Future You | A misty view of the future city that comes into focus with FinIQ, replacing the blurred blob. The plan card on Learn and You reveals the price at the goal after World 1, the monthly amount after the SIP lesson, and where to put it after World 2 |
| Mini Launch Plan | The `/plan` screen has the numbers, habits and parent talking points, a share button and goal editing. It fully unlocks at the end of Season 1 |
| Season 1 complete | A banner on Learn and on the final lesson's reward screen, linking to the plan |
| Answer Gates | Three violet gates carry answers to a question from the current or finished lessons (30 questions in `src/content/gates.json`). Right answer: bank plus bonus, and The Melt is pushed back. Wrong answer: The Melt gains. The question shows on screen with each lane's answer |
| Card loadouts | Equip an owned card before a run. Cash: none. Savings: melts slower. FD: shield + 5%. RD: +5% per bank. PPF: +30%, cash-out locked. Index fund: −20% to +70% at the finish. SIP: auto-banks every 8 s. Lump sum: 20-coin head start. The debrief explains what the card did |
| Sound | Original synthesised effects (coin, bank, hit, The Melt, right, wrong, shield, celebrate) and a run music loop. They follow the silent switch, mix with the player's own music, and can be toggled in You |
| End-to-end tests | `.maestro/smoke.yaml` covers a fresh install → onboarding (with "Watch Kip play") → first lesson → reward → free Kip Run. It passed twice in a row on the iOS simulator |
| Kip's run | The hop is replaced by a jog: stride sway, footfall bob, landing squash and dust. A Veo / Nano Banana prompt for a true run cycle is in `docs/prompts/veo-characters.md` |
