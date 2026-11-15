# Kip: Money Quest

A mobile game that teaches teenagers (13–19, India-first) to invest from first principles. Each principle is connected to real products and to a long-term philosophy. Kip, a tortoise in round specs, is the teacher.

- **Design:** [docs/GDD.md](docs/GDD.md) is the starting point. It links to the curriculum, characters, onboarding, engagement, social, competitors, safety and metrics docs.
- **Art prompts:** [docs/prompts/veo-characters.md](docs/prompts/veo-characters.md) covers characters and props with Veo and an image model. [docs/prompts/stitch-designs.md](docs/prompts/stitch-designs.md) covers screen designs with Google Stitch.

## What's in this build (Phase 1 vertical slice)

| Area | What works |
|---|---|
| Onboarding | Name and age band, dream goal with a foggy Future You, the Kip vs Dash compounding slider, a first Inflation Chase run, first cards with FinIQ 300 → 320, and a daily goal and reminder commitment |
| Learn | World path map for Money Town, The Melt and Snowball Valley: 15 lessons with story, predict-then-reveal widgets, runner levels, misconception-targeted quizzes and real-life connects |
| Kip Run | 3-lane pseudo-3D runner drawn in Skia. Inflation Chase and Snowball modes, The Melt chaser, non-blocking Kip tips, and a compounding reveal with a personal debrief |
| Cards | 16 collectible asset and strategy cards with stat bars. 8 are unlockable in this build |
| Habit loop | Knowledge SIP streak with a 1%-a-day compounding XP boost, emergency-fund freezes, Dividend Day, spaced review, FinIQ bands and Kip's shell rings |
| Nudges | Local notifications with quiet hours, a school-hours mute, at most one per day and back-off |
| League | Local preview league against seeded practice rivals |

Everything is stored on the device with MMKV. There are no accounts, network calls or analytics in this phase.

## Run it

You need Node 20 or later, Xcode with an iOS simulator, and CocoaPods. The Android SDK is optional. The app uses native modules (Skia, MMKV), so it runs as a **development build**, not in Expo Go.

```bash
npm install
npx expo run:ios                 # builds, installs and opens on the simulator
npx expo run:android             # needs an emulator or a connected device
```

## Check it

```bash
npm test                         # sim engine, engagement rules, runner engine, content + every quoted number
npx tsc --noEmit                 # typecheck
npx expo lint                    # lint (React Compiler rules)
~/.maestro/maestro/bin/maestro test .maestro/smoke.yaml   # end-to-end on the iOS simulator (dev server running)
```

Regenerate sounds with `python3 scripts/make_sounds.py` (needs numpy).

**Testing tools:** in the app, open **You**, then **Testing tools**. "Advance one day" moves the game's calendar forward, so you can test streaks, freezes, reviews and Dividend Day.

## Art

Your Veo and Nano Banana originals live in `design/source-art/`. `scripts/process_art.py` cuts them out and compresses them into `assets/`. `src/art/index.ts` is the one place that decides which image the app uses where.

| Where | What |
|---|---|
| Characters | Kip (6 expressions, 4 views, full body, a 37-frame wave), Dash (6 expressions, 4 views), The Melt (3 poses) |
| Runner | 3D coin, INVEST and SIP gates, SALE billboard, HOT TIP trap, FEE booth, CASH OUT ramp, Kip from behind, The Melt, painted world skyline |
| Screens | World backdrops on Learn and lessons, card vault on Cards, celebration art on rewards, mentor art on product cards |
| App | Kip app icon (iOS and Android adaptive) and splash screen |

## Demo mode (development only)

```bash
EXPO_PUBLIC_DEMO=1 npx expo start --clear      # seeds sample progress (player "Nova", 5-day streak)
EXPO_PUBLIC_DEMO=tour npx expo start --clear   # also auto-visits the main screens every 7 s, for screenshots
```

Demo mode never runs in production builds. Use **You → Testing tools → Reset all progress** afterwards.

## Code map

| Path | What lives there |
|---|---|
| `src/sim/` | Pure TypeScript money engine: compounding, SIP vs lump sum, inflation, seeded markets, event cards, goal-based scoring |
| `src/engagement/` | Streak, rewards, FinIQ, Dividend Day, spaced review, nudge planning and scheduling |
| `src/game/runner/` | Kip Run: pure engine (`engine.ts`), Skia renderer (`render.ts`), screen and results |
| `src/game/cards/` | Asset card component |
| `src/content/` | Worlds, lessons and cards as JSON, validated with Zod (`schema.ts`) |
| `src/lessons/` | Lesson player and the interactive concept widgets |
| `src/mascot/` | Kip, Dash and The Melt from the processed art, Kip's wave animation, and the speech bubble |
| `src/state/` | Zustand store persisted with MMKV |
| `src/app/` | Expo Router screens: onboarding, tabs, lesson, run, review, card, dividend, freeze |

**Changing character art:** drop new originals into `design/source-art/`, re-run the art script, and adjust `src/art/index.ts` if file names change. Every screen renders characters through `src/mascot/Character.tsx`.

**Adding lessons:** add them to `src/content/worlds/*.json`. The tests fail if a lesson references a missing card, a quiz lacks exactly one correct answer, or a quoted number drifts from the maths.

## Next phases
- **Phase 2:** Firebase auth with parental consent (DPDP Act), real leagues and friends, friend streaks, push via FCM and Remote Config, Worlds 3–5, Market Duel, Practice Portfolio, and an "Ask Kip" guard-railed AI chat.
- **Phase 3:** Worlds 6–9, Investment Clubs, live events, classroom mode, Future City, Real-World Missions, Hindi, and final Rive or sprite art with sound.
- **Phase 4:** closed beta with teens, pre/post literacy tests, then store launch.

All returns in the game are hypothetical and for learning only. This is not investment advice. Content needs review by a SEBI-registered professional before public release.
