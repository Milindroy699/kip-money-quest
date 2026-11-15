# Accounts: sign in to save progress

Signing in is optional. Everything in the game works without an account. Signing in backs up progress to the cloud and brings it back on a new phone. It also gives us a real person (or parent) to personalise for.

## When it's offered

The app only asks once the player is **primed**: they've reached the activation milestone of 3 lessons and 1 Kip Run, so they have something worth keeping and have felt the value.

- **Where:** straight after a lesson's rewards, which is a high point. It never interrupts a lesson or a run.
- **Not now:** closes it. It's offered again only after 4 more lessons *and* 3 more days.
- **Limit:** it's offered at most 3 times. After that it's only in **You → Account**.
- **Rules:** these live in `src/account/prime.ts`, with tests.

## Who signs in

| Player's age | Who signs in | Consent |
|---|---|---|
| 18–19 | The player, with Apple or Google | Their own |
| 13–17 | A **parent or guardian**, with *their* Apple or Google account, on the teen's phone | The parent ticks two boxes first: they're the parent or legal guardian and 18 or older, and they agree to the teen using the app and saving progress |

The teen's screen explains why: "You're under 18, so a parent or guardian signs in and says yes." It then hands over to a short page for parents. That page says what the app is (education only: no real money, no ads, no tracking) and exactly what's kept.

**Why a parent:** India's Digital Personal Data Protection Act 2023 requires verifiable parental consent before processing a minor's personal data. A parent signing in with their own account, plus the two declarations, is our first version of that. **A lawyer should confirm it meets the DPDP Rules' "verifiable" bar before launch.** Stronger options include DigiLocker-based age verification or a consent manager.

## What's stored

- **On the phone:** which provider was used, the account ID, the holder's display name, who holds it (self or parent) and when consent was given. No email addresses are stored by the app.
- **In the cloud:** one Firestore document per account, `progress/{uid}`. It holds the same game progress the phone saves (first name, age, goal, lessons, streak, cards, coins, runs), plus XP and lesson count for choosing between copies.
- **Backup:** the cloud copy updates a few seconds after progress changes, and whenever the app goes to the background.
- **Signing in on a phone with less progress than the cloud copy:** the phone restores the cloud copy. Otherwise the phone uploads its own. Ties keep the phone's.

## Account management (You → Account)

- **Sign out:** progress stays on the phone.
- **Delete account:** deletes the cloud copy and the account. Apple requires in-app deletion for any app that creates accounts.

## Store rules this satisfies

- **Apple 4.8:** we offer Google, so we also offer Sign in with Apple, shown first, using Apple's own button.
- **Apple 5.1.1(v):** account deletion inside the app.
- **Google's branding rules:** the "Continue with Google" button needs Google's official "G" logo before release. It currently uses a coloured letter as a placeholder.

## Code

| File | What it does |
|---|---|
| `src/account/config.ts` | Reads the settings below; anything missing just turns that piece off |
| `src/account/firebase.ts` | Firebase Auth (session kept in MMKV) and Firestore |
| `src/account/signIn.ts` | Apple (with the nonce Firebase checks) and Google sign-in, sign-out, delete |
| `src/account/sync.ts` | Cloud backup and restore, and the rule for which copy wins |
| `src/account/session.ts` | What happens after sign-in, sign-out and delete; the background backup |
| `src/account/prime.ts` | When to offer it, and whether a parent is needed |
| `src/app/account.tsx` | The "Save your progress" sheet, including the parent page |
| `app.config.ts` | Adds Google's native plugin only once its iOS URL scheme is set |

**Without a Firebase project (now):** development builds still show the whole flow. Signing in creates a **test account on this phone only**, and the screens say so. Production builds don't offer sign-in until the cloud is configured.

## Status (1 Nov 2026)

| Piece | State |
|---|---|
| Firebase project `finquest-cf0e8` | Created; web config in `.env.local` |
| Google sign-in | On; web and iOS client IDs in `.env.local`; iOS URL scheme in the native build |
| Apple sign-in | On for iPhone (native). The web redirect flow is off, which the app doesn't use |
| Firestore | Created, and the rules in step 3 are published (2 Nov 2026): progress, consents, leagues and duels |
| EAS builds | Still to do: copy the `.env.local` values into EAS environment variables before `eas build` |

## What you need to set up

1. **Firebase project:**
   - Create a project in the Firebase console. A Mumbai region (`asia-south1`) keeps data in India.
   - Add a **Web app**. Its config gives `EXPO_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID` and `_APP_ID`.
   - Also add iOS (`com.finlit.kipmoneyquest`) and Android apps.
2. **Authentication → Sign-in method:** turn on **Apple** and **Google**.
3. **Firestore:** publish these rules (Firestore Database › Rules › paste › Publish). They cover progress backup, consent records, leagues and friend duels:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function signedIn() { return request.auth != null; }

       // Progress backup: only your own copy.
       match /progress/{uid} {
         allow read, delete: if signedIn() && request.auth.uid == uid;
         allow write: if signedIn() && request.auth.uid == uid
                      && request.resource.data.data.size() < 500000;
       }

       // Consent record: who consented, to which notice, and the player's age. No names or emails.
       match /consents/{uid} {
         allow read: if signedIn() && request.auth.uid == uid;
         allow create, update: if signedIn() && request.auth.uid == uid
                               && request.resource.data.keys().hasOnly(['holder', 'notice', 'teenAge', 'at']);
       }

       // Weekly leagues: anyone signed in can read; you can only write your own row, under a handle.
       match /leagues/{league}/members/{uid} {
         allow read: if signedIn();
         allow write: if signedIn() && request.auth.uid == uid
                      && request.resource.data.keys().hasOnly(['handle', 'xp', 'tier', 'updatedAt'])
                      && request.resource.data.xp is int
                      && request.resource.data.xp >= 0 && request.resource.data.xp <= 20000
                      && request.resource.data.handle is string && request.resource.data.handle.size() <= 32;
       }

       // Friend duels: the creator owns side a; one friend can claim side b. Scores are never stored.
       match /duels/{code} {
         allow read: if signedIn();
         allow create: if signedIn() && request.resource.data.a.uid == request.auth.uid
                       && request.resource.data.b == null;
         allow update: if signedIn() && (
           (resource.data.a.uid == request.auth.uid
              && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['a'])
              && request.resource.data.a.uid == request.auth.uid)
           || ((resource.data.b == null || resource.data.b.uid == request.auth.uid)
              && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['b'])
              && request.resource.data.b.uid == request.auth.uid));
       }
     }
   }
   ```

   Leagues also need one index the first time: if the League tab shows the practice league while you're signed in, Firestore's error log links straight to "create index" for `members` ordered by `xp`.

4. **Google client IDs:**
   - **Web client:** Firebase creates it when you turn on Google sign-in. Open **Authentication → Sign-in method → Google → Web SDK configuration**. The **Web client ID** goes in `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. The app doesn't need the client secret, so keep it private.
   - **iOS client:** add the iOS app (`com.finlit.kipmoneyquest`) *after* turning on Google sign-in, then download `GoogleService-Info.plist`. Its `CLIENT_ID` goes in `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, and its `REVERSED_CLIENT_ID` goes in `GOOGLE_IOS_URL_SCHEME`. If those keys are missing, Google sign-in was off when the file was made, so download it again.
   - **Android client:** needs the app's SHA-1 signing fingerprint (EAS shows it). Only needed when Android ships.
5. **Apple Developer account:** the App ID needs the Sign in with Apple capability. EAS Build switches it on from `ios.usesAppleSignIn`.
6. **Values:** put them in `.env.local` (see `.env.example`) and in EAS environment variables. Then make a new build: `npx expo run:ios` locally, or `eas build`.

## Leagues, duels and the parent report (built 1 Nov 2026)

- **Handles:** every signed-in player appears as a pseudonym like "Calm Tortoise 48", derived from their account and never their real name.
- **Weekly leagues:** one league per week and tier, from Piggy Bank to Compounder. Your phone publishes your weekly XP. When a new week starts, it settles last week's result: the top 7 move up, and the bottom 5 move down when 10 or more played.
- **Market Duel:** offline against Dash, or online with a friend by a 6-letter code. Only each side's chips are stored, and both phones recompute the scores from the shared seed.
- **Weekly report for parents:** in You, with questions for dinner. The Sunday nudge opens it. It's shared from the phone; automatic emails need a server function.
- **Consent record:** written to `consents/{uid}` when someone signs in. It holds the consent holder, the notice version and the player's age.

**Known limits until there's a server:** leagues aren't split into groups of 30, so everyone in a tier for a week shares one league. Weekly XP is written by each phone, and the rules cap it but can't fully verify it. Both need Cloud Functions on Firebase's pay-as-you-go plan.

## Still to build on the server side

- **Revoke Apple tokens on delete:** Apple asks apps to call its revoke endpoint when an account is deleted. That needs a Cloud Function holding the Sign in with Apple key.
- **Families with more than one child:** one parent account holds one child's progress for now. Two children need child profiles under one account.
- **Automatic parent emails:** the weekly report exists in the app and can be shared from the phone. Emailing it every Sunday needs a scheduled function and an email service.
- **League groups and anti-cheat:** split each tier into groups of 30, and compute weekly XP on the server.

## Personalisation this unlocks

- Progress that survives a new phone.
- A parent who can get the weekly digest.
- A stable ID for friends, leagues and duels in Phase 2.
- Content tuned by age, track and goal across devices.
