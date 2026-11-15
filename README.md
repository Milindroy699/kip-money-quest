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

The core game saves progress on the device with MMKV. Cloud sign-in and backup are optional and use Firebase when configured.

## Run it

Use Node.js 24.13 or a newer Node 24 release. From the repository root, install dependencies with `npm ci`. For local development, use Xcode and CocoaPods on macOS for iOS, or the Android SDK and an emulator or connected phone for Android. The app needs a native development build to load modules such as Skia and MMKV.

```bash
npm ci
npx expo run:ios                 # iOS simulator on macOS
npx expo run:android             # Android emulator or connected phone
```

## Build an Android APK

Both options produce a standalone APK you can open on a phone without Expo Go or a Metro server. The app uses the Expo SDK for routing and native features. Expo Build (EAS) is the optional cloud service that compiles, signs, and hosts the APK.

Start from the repository root with Node.js 24 and run `npm ci` as above. For a build with Firebase sign-in and backup, follow the [account setup guide](docs/accounts.md#what-you-need-to-set-up). Use the EAS `preview` environment for cloud builds or `.env.local` for a local build. The core game works with local saves either way.

### Cloud build with an Expo account

Sign in with an Expo account that has build access to `@milindroy/kip-money-quest`. The [preview profile](eas.json) sets internal distribution and generates an APK. The build tools run on Expo's servers, so Android Studio is optional on your computer.

```sh
npx eas-cli@latest login
npx eas-cli@latest whoami
npx eas-cli@latest build --platform android --profile preview
```

When the build finishes, open its build link on your phone, download the APK, and tap it to install. In Windows PowerShell, use `npx.cmd` if script execution blocks `npx`. [Expo APK build guide](https://docs.expo.dev/build-reference/apk/)

### Local build without an Expo account

Install Android Studio and use its SDK Manager to install Android SDK Platform 37.0 (`platforms;android-37.0`), Build-Tools 37.0.0, and NDK 27.1.12297006. Set `ANDROID_HOME` to your Android SDK and `JAVA_HOME` to a standard OpenJDK 17 distribution, such as Amazon Corretto or Eclipse Temurin. [Expo SDK 58 Android requirements](https://docs.expo.dev/versions/v58.0.0/#support-for-android-and-ios-versions)

On Windows, also install CMake 3.31.6 from SDK Manager. The Gradle flags select its newer Ninja, shorten C++ object paths, and choose the JDK set in `JAVA_HOME`. Run these PowerShell commands from the repository root and adjust the SDK and JDK paths for your machine.

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = 'C:\path\to\jdk-17'

npx.cmd expo prebuild --platform android --no-install
Set-Location android
.\gradlew.bat :app:assembleRelease `
  '-PreactNativeArchitectures=arm64-v8a,armeabi-v7a' `
  '-Pandroid.cmakeVersion=3.31.6' '-Pexpo.android.cmakeObjectPathMax=220' `
  '-Dorg.gradle.java.installations.auto-detect=false' "-Dorg.gradle.java.installations.paths=$env:JAVA_HOME" `
  '-Dorg.gradle.jvmargs=-Xmx3g -XX:MaxMetaspaceSize=1g -Dfile.encoding=UTF-8' --no-parallel --max-workers=2
```

On macOS or Linux, after configuring the SDK and JDK paths, run:

```sh
npx expo prebuild --platform android --no-install
cd android
./gradlew :app:assembleRelease '-PreactNativeArchitectures=arm64-v8a,armeabi-v7a' --max-workers=2
```

Prebuild generates `android/` from the app configuration. Make native configuration changes in `app.json` or config plugins and regenerate the project as needed. [Expo Prebuild guide](https://docs.expo.dev/workflow/continuous-native-generation/)

If the first Gradle download times out, check `distributionUrl` in `android/gradle/wrapper/gradle-wrapper.properties` for the pinned version. Download the matching binary ZIP from the [Gradle releases page](https://gradle.org/releases/), verify the [SHA-256 checksum](https://gradle.org/release-checksums/), and extract it. From the `android` directory, run the extracted `bin/gradle.bat` on Windows or `bin/gradle` on macOS/Linux with the same build arguments.

Copy `android/app/build/outputs/apk/release/app-release.apk` to your phone and open it. The SDK 58 template signs this build with a debug key for device testing. Updating an existing installation requires the same signing key. If you switch between a cloud-signed APK and a locally signed APK, back up any progress you want to keep before uninstalling the existing copy. [Android command-line build guide](https://developer.android.com/build/building-cmdline)

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
