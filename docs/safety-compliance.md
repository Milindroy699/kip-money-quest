# Safety, Compliance and Ethics

> This is a design checklist, not legal advice. Get a review from Indian counsel and a SEBI-registered professional before public launch.

## Data and privacy
- **India, Digital Personal Data Protection Act 2023:**
  - Anyone under 18 is a child. Get **verifiable parental consent** before processing their personal data.
  - **No tracking, behavioural monitoring or targeted advertising** directed at children.
  - Data minimisation: collect only what is needed (first name, age band, progress).
- **US, COPPA:** applies only if the app opens to under-13s in the US. Use the same parental-consent architecture.
- **Phase 1** stores everything on-device (MMKV). There is no network, no account and no analytics.

## Financial content
- **SEBI:** the app provides **education only**.
  - No investment advice, no stock or fund recommendations, no tips, no real trading or brokerage links for minors.
  - Real products are named generically (e.g. "a Nifty 50 index fund"), never as a specific AMC or scheme recommendation.
- **Returns:** every projection carries a persistent label: "Hypothetical returns for learning. Not a prediction or advice."
- **Facts to re-verify each release:** DICGC deposit cover, PPF rate and lock-in, ELSS lock-in, RBI inflation target, tax rules.

## Anti-gambling design
- No loot boxes. No real-money purchase of coins. No randomised paid rewards.
- Card rarity follows complexity, and cards unlock through mastery.
- Competitive scoring rewards goal-fit, risk-adjusted outcomes.
- Speculation and crypto appear as case studies with explicit risk discussion.

## Social safety
- No free-text chat. Players use only preset reactions.
- Friends are added by invite code or contacts, with parental controls.
- Usernames are moderated, and there is a report/block flow.

## Wellbeing
- At most 1 push notification per day. Quiet hours run from 22:00 to 07:00. Nudges back off when ignored.
- No guilt or shame copy. Streak loss is framed as a lesson ("withdrawal"), with a comeback bonus.
- Sessions are designed to be short. There is no infinite scroll.

## App stores
- Follow Apple's Kids and teen guidance and Google Play Families policy.
- Choose age ratings that match the social features.
