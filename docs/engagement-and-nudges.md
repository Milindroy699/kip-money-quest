# Engagement, Retention and Nudges

## The retention system is the lesson

| Mechanic | In-game name | Rule | Teaches |
|---|---|---|---|
| Daily streak | **Knowledge SIP** | One completed lesson, review or run per calendar day (player's local time) | Consistency |
| Streak multiplier | **Compounding boost** | `min(1.01^(streak − 1), 1.5)` applied to XP | Compounding |
| Missed day | **Withdrawal** | Streak and multiplier reset to 1 unless a freeze covers the gap | Don't take money in and out |
| Streak freeze | **Emergency fund** | Costs 200 coins (about five days of steady play), max 2 held. Each freeze covers one missed day automatically | Liquidity buffer: it has to be built up |
| Weekly chest | **Dividend Day** | Claimable once every 7 days. `20 coins × (active days in last 7 / 7) + 2 × min(streak, 30)`. Deterministic | Dividends reward holding |
| Shell rings | **Growth rings** | +1 ring on Kip's shell per full 7-day streak week | Visible long-term growth |
| FinIQ | **Literacy score** | 300–900, driven by lessons mastered | The real win |

## Economy (balanced 1 Nov 2026)

| Source | Coins | XP |
|---|---|---|
| New lesson | 20 (boss 40) | 20–45 × streak boost |
| Replayed lesson | 0 | Half, up to 60 a day |
| Kip Run (first 3 a day) | Run score ÷ 8 (Inflation) or ÷ 24 (Snowball), max 20 | 10 + coins, × streak boost |
| Kip Run (after 3 a day, or "Watch Kip play") | 0 | 2 (practice) |
| Review | 5 | 5 + 3 per correct answer |
| Dividend Day | about 20–80 a week | — |

A steady day (one lesson, one run, one review) earns about 40 coins. The rules are in `src/engagement/rewards.ts` and covered by `src/engagement/__tests__/economy.test.ts`.

## Daily goal

The 3, 5 or 10 minutes picked in onboarding fill a ring on Learn:
- a lesson counts as 3 minutes (4 for a boss);
- a run counts as 1 minute;
- a review counts as 1 minute.

## Review (spaced repetition)
- Completed lessons come back for review on day 1, 3, 7 and 21 after completion.
- A review counts toward the Knowledge SIP.

## Nudges

**Voice:** Kip, kind and witty, never guilt. Closer to Finch than to Duo's passive-aggressive memes.

| Trigger | Example copy |
|---|---|
| Daily reminder, streak alive | "Your Knowledge SIP is due. 3 minutes keeps the compounding going 🐢" |
| Streak at risk (evening, not yet active) | "Your {n}-day snowball is still rolling. One quick lesson keeps it growing." |
| Idle coins | "The Melt crept in overnight. Put your idle coins to work?" |
| Curiosity (Dash) | "Dash just bought something on a hot tip. Want to see what happens?" |
| Rival (Phase 2) | "{friend} passed you in the Bond League. 40 XP to take it back." |
| Weekly report (Sunday) | "Your Future You report is ready. FinIQ is up {x}!" |
| Comeback (3+ days away) | "Kip saved your seat. Welcome back bonus waiting, no judgement." |

## Notification rules
1. **At most 1 push per day,** sent at the player's chosen habit time.
2. **Quiet hours** run from 22:00 to 07:00 local. Reminders that fall inside them move to 07:30 or 21:30, whichever is nearer.
3. **School-hours mute** (Mon–Fri, 08:00–14:00) is optional.
4. **Back-off:** after 3 ignored nudges in a row, stop daily nudges. Send a "letter from Kip" on day 3 and day 7, then weekly.
5. **No behavioural profiling or ad tracking** for minors (DPDP Act). Nudges use only first-party in-app state.
6. Parents can see and turn off nudges from the parent dashboard (Phase 2).

## Implementation (Phase 1)
- Pure logic: [`src/engagement`](../src/engagement), unit-tested.
  - `days.ts`: time-zone-aware day keys.
  - `streak.ts`: streak update, freezes, multiplier, shell rings.
  - `rewards.ts`: XP, coins, Dividend Day, FinIQ score and bands.
  - `review.ts`: spaced review.
  - `nudges.ts`: copy selection, quiet hours, back-off.
- Scheduling: `scheduler.ts` uses `expo-notifications` local notifications. Remote push via FCM arrives in Phase 2.
