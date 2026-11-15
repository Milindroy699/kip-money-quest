# Stitch import: "Finlit project"

Imported from Google Stitch on 31 Oct 2026 through the Stitch MCP server. Each screen has a PNG or JPG screenshot and the HTML code that Stitch generated.

## What's here

| Folder | Contents |
|---|---|
| `design-system/` | The design system saved in Stitch, **Midnight Arcade Fintech** (dark). `DESIGN.md` holds the tokens (colours, type, radius, spacing), `style-guidelines.md` the written rules, `theme.json` the raw theme |
| `boards/` | Five style-tile boards: the first light board, v2, the light glass "Money Town" board, "Modern Teen Fintech" and the dark glass board |
| `screens/` | All 33 app screens from [stitch-final-prompts.md](../../docs/prompts/stitch-final-prompts.md), plus a second version of the Cards screen |
| `assets/characters/` | Kip character sheet, Kip, Dash and The Melt |
| `assets/backgrounds/` | One or two variants of each background: onboarding, Money Town, The Melt, card vault, celebration |

## Screen map

| Stitch screen | File | App screen |
|---|---|---|
| 1 Hi, I'm Kip | `onboarding-1-welcome-to-kip` | `src/app/onboarding/index.tsx` |
| 2 Dream | `onboarding-2-what-s-your-dream` | `src/app/onboarding/dream.tsx` |
| 3 Kip vs Dash | `onboarding-3-kip-vs-dash` | `src/app/onboarding/magic.tsx` |
| 4 First cards | `onboarding-5-your-first-cards` | `src/app/onboarding/cards.tsx` |
| 5 Commit | `onboarding-6-start-your-knowledge-sip` | `src/app/onboarding/commit.tsx` |
| 6 Learn home | `home-learn-world-1-the-melt` | `src/app/(tabs)/index.tsx` |
| 7–10 Lesson steps | `lesson-1-story…` to `lesson-4-connect…` | `src/lessons/LessonPlayer.tsx` |
| 11 Lesson complete | `lesson-complete-celebration-rewards` | `src/app/lesson/[id].tsx` |
| 12 Kip Run HUD | `kip-run-endless-runner-hud` | `src/game/runner/RunnerScene.tsx` |
| 13 Run results | `run-complete-results-compounding-multiplier` | `src/game/runner/RunResults.tsx` |
| 14 Cards | `cards-my-deck-collection` (and `-v2`) | `src/app/(tabs)/cards.tsx` |
| 15 Card detail | `card-detail-index-fund-rare` | `src/app/card/[id].tsx` |
| 16 League | `league-bond-league-leaderboard` | `src/app/(tabs)/league.tsx` |
| 17 You | `you-profile-finiq-progression` | `src/app/(tabs)/you.tsx` |
| 18 Dividend Day | `modal-dividend-day` | `src/app/dividend.tsx` |
| 19 Emergency fund | `modal-emergency-fund-streak-freeze` | `src/app/freeze.tsx` |
| 20 Comeback | `comeback-welcome-back` | Streak card on Learn home |
| 21 Parent consent | `let-s-loop-in-a-parent-guardian-consent` | Phase 2 |
| 22 Market Duel | `card-battle-market-clash-world-1` | Phase 2 |
| 23 Onboarding first run | `onboarding-4-first-run` | `src/app/onboarding/run.tsx` |
| 24 Predict first | `lesson-predict-first` | Concept step in `src/lessons/LessonPlayer.tsx` |
| 25 Run brief | `lesson-run-brief-snowball` | Play step in `src/lessons/LessonPlayer.tsx` |
| 26 Snowball Run HUD | `kip-run-snowball-run-hud` | `src/game/runner/RunnerScene.tsx` (snowball mode) |
| 27 Run mode picker | `kip-run-mode-picker` | `src/app/run/[mode].tsx` |
| 28 Review quiz | `review-spaced-review-quiz` | `src/app/review.tsx` |
| 29 Review complete | `review-complete` | `src/app/review.tsx` |
| 30 Real vs nominal | `lesson-concept-real-vs-nominal` | `RealReturnWidget` in `src/lessons/widgets.tsx` |
| 31 Lump sum vs SIP | `lesson-concept-lump-sum-vs-sip` | `SipVsLumpWidget` in `src/lessons/widgets.tsx` |
| 32 Barter puzzle | `lesson-concept-barter-puzzle` | `BarterWidget` in `src/lessons/widgets.tsx` |
| 33 Learn home, World 2 | `home-learn-world-2-snowball-valley` | `src/app/(tabs)/index.tsx` |

Screens 23–33 were generated through the Stitch connection with the Midnight Arcade design system, then six were corrected with targeted edits (wrong world labels, a lives chip, answer hints, tap buttons on a swipe game, the streak boost value, ₹ shown for coins).

## Review notes (fix in Stitch, or while building)

- **Theme decision needed.** The screens and the saved design system are **dark** (Midnight Arcade: navy #0B1420, neon green #38E399, Space Grotesk + Outfit). The "Money Town" board is **light glass**. The app currently uses the light cream theme.
- **Learn home** shows "$48 auto-stashed" and "34% funded". The app is India-first (₹) and uses simulated money only. Show FinIQ progress toward Future You instead of a funded amount.
- **Onboarding 1** repeats the step bar at the bottom and uses a "+100 KP" currency the game doesn't have (it uses XP and coins). Kip sits on a light square instead of a cut-out.
- **Glass board** calls the villain "Melt Sloth" (it's The Melt, a fog). Its Sovereign Gold Bond card says "zero default risk", which overstates it: SGB prices still move with gold.
- **Snowball Run HUD** still shows faint "Snowball Valley" title text behind the top chips.
- Character images are full sheets on solid backgrounds. Each pose needs cutting out before it can replace the vector placeholders in `src/mascot/Character.tsx`.
