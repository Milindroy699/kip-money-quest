# Stitch: final copy-paste prompts

Every prompt below is complete. Copy each grey box exactly as it is and paste it into Stitch, in order. This file combines [stitch-designs.md](stitch-designs.md) (what is on each screen) with [stitch-glass-theme.md](stitch-glass-theme.md) (how it looks), and it takes priority over both.

## Exact steps

**Part 1: make the backgrounds in Nano Banana (about 20 minutes)**

1. Open Nano Banana (in Google Flow or the Gemini app).
2. For each background in Part 1 below, paste its prompt and generate. Pick the best result.
3. Download it as PNG and rename it to the file name shown, for example `bg_the_melt.png`.
4. You need these 5 for the screens: `bg_card_vault`, `bg_celebration`, `bg_money_town`, `bg_onboarding_future`, `bg_the_melt`. The other two are for later.

**Part 2: set up Stitch (about 10 minutes)**

5. Open Stitch and create a new **mobile app** project. If it offers a higher-quality mode, choose it.
6. Paste **Prompt 1** (design system and style tile) and generate. If you have Kip's character sheet from Nano Banana, attach it to this prompt.
7. Optional: paste the **follow-ups** one at a time until you like the style tile.

**Part 3: generate the screens (one prompt per screen)**

8. For each screen below, in order: **attach the background image named in its heading**, paste the prompt, generate.
9. Check the result against the checklist at the end. If it drifts, use the fix prompts there instead of starting over.
10. Skip screens 21 and 22 for now. They are for later features.

**Part 4: share**

11. Select all screens, export to Figma, and send me the Figma link.

---

## Part 1: background prompts (Nano Banana)

### `bg_onboarding_future.png` (needed now)
Used for: Onboarding

```
Dawn horizon with a winding path leading to a softly glowing future city skyline far away (bank, tall tower, bridge silhouettes). Hopeful gold and peach light, a few floating blurred coins. Vertical 9:16 mobile app background, 1290 × 2796 px. No text, no characters, no UI, no logos. Soft-focus stylised 3D clay look matching a playful premium game. Gentle mesh gradient with subtle film grain. Keep the middle 60% calm and low-detail so UI stays readable; put the detail near the top and bottom edges.
```

### `bg_money_town.png` (needed now)
Used for: World 0 screens, Learn home

```
Warm sunrise sky over a stylised Indian market town silhouette at the bottom (chai stall awnings, rooftops, a few kites). Peach-honey-coral gradient, floating blurred gold coins. Vertical 9:16 mobile app background, 1290 × 2796 px. No text, no characters, no UI, no logos. Soft-focus stylised 3D clay look matching a playful premium game. Gentle mesh gradient with subtle film grain. Keep the middle 60% calm and low-detail so UI stays readable; put the detail near the top and bottom edges.
```

### `bg_the_melt.png` (needed now)
Used for: World 1 screens

```
Dusk sky from violet to deep indigo, purple fog wisps drifting low, a few gold coins half-dissolving into the fog, faint stars at the top. Mysterious but friendly, not scary. Vertical 9:16 mobile app background, 1290 × 2796 px. No text, no characters, no UI, no logos. Soft-focus stylised 3D clay look matching a playful premium game. Gentle mesh gradient with subtle film grain. Keep the middle 60% calm and low-detail so UI stays readable; put the detail near the top and bottom edges.
```

### `bg_snowball_valley.png` (later)
Used for: World 2 screens

```
Icy morning, rolling snowy hills in pastel blue and mint at the bottom, a big soft snowball on a distant hill, sparkling snow particles in the air. Vertical 9:16 mobile app background, 1290 × 2796 px. No text, no characters, no UI, no logos. Soft-focus stylised 3D clay look matching a playful premium game. Gentle mesh gradient with subtle film grain. Keep the middle 60% calm and low-detail so UI stays readable; put the detail near the top and bottom edges.
```

### `bg_card_vault.png` (needed now)
Used for: Cards tab and card detail

```
Deep navy vault with a soft spotlight from the top, a subtle hexagon (tortoise-shell) pattern fading into the dark, tiny gold dust particles. Makes holographic cards pop. Vertical 9:16 mobile app background, 1290 × 2796 px. No text, no characters, no UI, no logos. Soft-focus stylised 3D clay look matching a playful premium game. Gentle mesh gradient with subtle film grain. Keep the middle 60% calm and low-detail so UI stays readable; put the detail near the top and bottom edges.
```

### `bg_celebration.png` (needed now)
Used for: Lesson complete, Dividend Day, run results

```
A soft radial burst of warm gold light from the centre, confetti bokeh in brand colours (green, honey, coral, purple), gentle sparkles. Vertical 9:16 mobile app background, 1290 × 2796 px. No text, no characters, no UI, no logos. Soft-focus stylised 3D clay look matching a playful premium game. Gentle mesh gradient with subtle film grain. Keep the middle 60% calm and low-detail so UI stays readable; put the detail near the top and bottom edges.
```

### `bg_night_market.png` (later)
Used for: Dark theme

```
Night version of the market town: deep navy sky, warm string lights and glowing lanterns along the rooftops, soft purple haze. Vertical 9:16 mobile app background, 1290 × 2796 px. No text, no characters, no UI, no logos. Soft-focus stylised 3D clay look matching a playful premium game. Gentle mesh gradient with subtle film grain. Keep the middle 60% calm and low-detail so UI stays readable; put the detail near the top and bottom edges.
```

---

## Prompt 1: design system and style tile (paste once, first)

```
Mobile app for iPhone (390 × 844): "Kip: Money Quest", a game that teaches teenagers in India (13–19) to invest. Mascot: Kip, a mint-green tortoise with oversized round dark-navy glasses and a honey-gold hexagon shell.

VISUAL DIRECTION: modern, premium, playful glassmorphism, like a 2026 iOS game app. Four depth layers, back to front: (1) vivid soft mesh-gradient background, (2) 2–4 large out-of-focus 3D clay objects (coins, hexagon shells, leaves) floating behind content, (3) frosted glass panels, (4) crisp solid content and buttons. Subtle film grain (2–3%) on backgrounds.

WORLD BACKGROUNDS (mesh gradients, never flat):
- Money Town: warm sunrise, peach #FFD9A8 → honey #F2B544 → coral #FF8A6B.
- The Melt: dusk, lavender #C4B5FD → violet #8B5CF6 → indigo #312E81, with drifting fog wisps.
- Snowball Valley: icy morning, sky #BFE0FF → mint #C9F2E3 → white.

GLASS SURFACES: white at 65–75% opacity, 24–32 px background blur, 1 px inner highlight border (white 50%), soft long shadow (navy 12%, 24 px blur, 8 px y-offset), corner radius 24. Use glass for the top stat bar, the tab bar, cards over backgrounds, bottom sheets and modals. Never stack glass on glass. Dense text, quiz answers and charts sit on near-solid panels (white 92%+).

COLOUR: text ink navy #1E2A3A, secondary #5B6474; primary Kip green #2DBE7E (pressed #1F9A63); reward honey #F2B544; coin gold #FFC83D; Melt purple #8B5CF6 (inflation); Dash orange #FF8A3D (risk); error #E5484D.

TYPE: rounded geometric sans (Nunito or SF Rounded). Display 34 extra-bold, title 26 bold, body 17 medium, caption 13 semibold. Numbers tabular and extra-bold.

COMPONENTS: chunky 3D buttons that are SOLID, not glass, with a 4 px darker bottom edge that presses in. Glass pill stat chips (🔥 streak, 🪙 coins, FinIQ). Thick rounded progress bars with a soft glow on the filled part. Collectible cards with holographic rarity borders (common silver, rare blue, epic purple, legendary animated gold shimmer).

CHARACTERS: Kip guides on most screens. He peeks from a card edge, sits on the progress bar, or stands beside the primary action, and he looks toward it. He never covers content and takes up at most 25% of the screen. His expression matches the moment: cheer on success, think on questions, worry near danger. Speech bubbles are solid white with a tail.

UX RULES (must follow):
- Text contrast ≥ 4.5:1 on every background; add a soft scrim behind text if needed.
- Tap targets ≥ 44 × 44 pt.
- One primary action per screen, in the bottom thumb zone.
- At most 3–4 choices visible at once.
- Status is never shown by colour alone (always icon + label).
- Familiar patterns: bottom tab bar, back top-left, close top-right.
- 8 pt spacing grid, 20 pt screen margins, respect safe areas.
- Motion is purposeful (≤ 300 ms, ease-out) with a reduced-motion fallback.
- Every chart or projection shows: "Hypothetical returns for learning. Not advice."

Using this design system, create a labelled style-tile board on the Money Town sunrise mesh-gradient background with floating blurred 3D coins behind. Show:
1. Colour swatches with names and hex codes.
2. Type scale.
3. A glass surface spec card (opacity, blur, border, shadow) beside a near-solid content card for comparison.
4. Chunky buttons: primary, secondary, ghost, danger, each in default, pressed and disabled.
5. A glass stat-chip row: 🔥 12, 🪙 340, FinIQ 412.
6. A progress bar with glow.
7. A quiz option card in default, selected, correct (✅ + "Correct") and wrong (❌ + "Not quite") states.
8. A collectible asset card in all four rarities with holographic borders.
9. A Kip speech bubble with Kip beside it.
10. A floating glass tab bar: Learn, Cards, League, You, with "Learn" active.
11. A glass bottom sheet with a grabber handle.
12. Small swatches of the three world backgrounds: Money Town, The Melt, Snowball Valley.
```

### Optional follow-ups (paste one at a time after Prompt 1)

**Follow-up 1**
```
Add depth: float 3 out-of-focus 3D clay coins and one honey hexagon shell behind the glass panels. Keep them blurred and behind content.
```

**Follow-up 2**
```
Improve readability: raise glass opacity to 75%, keep the 1 px white inner border, and make sure all body text meets 4.5:1 contrast.
```

**Follow-up 3**
```
Keep every button solid (not glass) so the primary action is always the most visible element on screen.
```

**Follow-up 4**
```
Make the tab bar a floating glass pill 16 pt above the bottom safe area. The active tab has a filled icon and a green label.
```

**Follow-up 5**
```
Add motion specs: legendary cards shimmer slowly, the current lesson node pulses with a soft glow, and rewards pop in with a short spring. List the reduced-motion fallback for each.
```

**Follow-up 6**
```
Reduce noise: besides Kip green, use one accent colour per screen. Remove any decoration that doesn't guide the eye to the primary action.
```

**Follow-up 7**
```
Make Kip a guide, not decoration: on each screen, place him so he looks toward the primary button, and match his expression to the moment.
```


---

## Part 3: screen prompts

### Screen 1: Onboarding — Hi, I'm Kip
Attach: `bg_onboarding_future.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_onboarding_future image attached to this prompt.
Kip: large and centred, waving at the player, cheer expression.
Screen:
Onboarding screen 1 of 6. Top: thin 6-step progress bar. Centre: large Kip waving, with a speech bubble: "Hi! I'm Kip. I'll help you make Future You richer and wiser." Below: text field "What should I call you?" and two big selectable pills for age band: "13–15" and "16–19". Bottom: full-width green chunky button "Let's go". Small grey link "I already have an account".
```

### Screen 2: Onboarding — What's your dream?
Attach: `bg_onboarding_future.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_onboarding_future image attached to this prompt.
Kip: small, bottom-left beside the Future You portrait, looking up at the Continue button, happy expression.
Screen:
Onboarding screen 2 of 6. Title "What's your dream?" Subtitle "Pick one. We'll build toward it together." A 2×3 grid of large tappable goal cards with an emoji and label: 💻 New laptop, 🏍️ My own bike, ✈️ Travel the world, 🎓 College fund, 🚀 Start a business, 🏝️ Free at 40. One card is selected (green border, checkmark). Below: "By what age?" with a horizontal age chip scroller (18, 21, 25, 30, 40), 25 selected. At the bottom, a soft, foggy circular portrait labelled "Future You, age 25", blurred and dreamy. Bottom button "Continue".
```

### Screen 3: Onboarding — Kip vs Dash (the magic moment)
Attach: `bg_onboarding_future.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_onboarding_future image attached to this prompt.
Kip: inside his badge at the top right (Dash in the left badge), looking toward the Continue button, happy expression.
Screen:
Onboarding screen 3 of 6. Title "Same ₹500 a month. Two choices." Two character badges at top: left Dash the orange hare "Keeps cash in a drawer", right Kip the tortoise "Invests in a monthly SIP". Main area: a clean line chart over years. Green line for Kip curving strongly upward. Orange line for Dash rising in a straight line, with a purple fog shading below it labelled "The Melt (inflation)" showing what Dash's pile really buys. End-point labels: Kip "₹5.0 lakh", Dash "₹1.2 lakh (buys only ₹37k of today's stuff)". A small toggle above the chart: "Show in today's money". Below the chart: a big, thick slider "Years: 20" from 5 to 40 with a tortoise-shell thumb. Caption "Drag to see time do the work." Small grey hypothetical-returns label: "Hypothetical 12% p.a. return, 6% inflation. Not advice." Button "Whoa. Show me how".
```

### Screen 4: Onboarding — First cards earned
Attach: `bg_celebration.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_celebration image attached to this prompt.
Kip: small, peeking over the FinIQ meter card, looking toward the Collect button, cheer expression.
Screen:
Onboarding screen 5 of 6. Celebration. Title "Your first cards!" Two collectible cards fanned out and glowing, flipping in: "Cash" (common, grey frame) and "Fixed Deposit" (common, grey frame). Each card has an illustration, a name, a rarity gem, and 5 mini stat bars: Return, Risk, Liquidity, Lock-in, Complexity. Below: a FinIQ meter animating from 300 to 320 on a 300–900 gauge, with the band label "Starter". Confetti. Button "Collect".
```

### Screen 5: Onboarding — Commit to your Knowledge SIP
Attach: `bg_onboarding_future.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_onboarding_future image attached to this prompt.
Kip: top centre holding the calendar, looking down toward the Start button, happy expression.
Screen:
Onboarding screen 6 of 6. Kip holding a calendar. Title "Start your Knowledge SIP". Subtitle "A little every day beats a lot once in a while, just like a SIP." Three large selectable rows for the daily goal: "3 min · Casual", "5 min · Regular" (selected), "10 min · Serious". Then "Remind me at" with a time picker chip "6:00 PM" and a note "We never nudge after 10 PM". Bottom: big green button "Start my Knowledge SIP 🐢".
```

### Screen 6: Learn — world path map (home)
Attach: `bg_the_melt.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_the_melt image attached to this prompt.
Kip: standing next to the current (pulsing green) lesson node, happy expression.
Screen:
Home "Learn" tab. Top stat bar (streak 🔥 4, coins 🪙 120, FinIQ 342). A "Future You" banner card: small foggy portrait, "Goal: New laptop by 25", and a progress line. Below: a vertical, winding path map (Duolingo-style) for "World 1 · The Melt", with a purple themed header "Why invest? Inflation never sleeps." Path nodes: 2 completed (gold, with stars), 1 current (pulsing green, Kip standing beside it, tooltip "Start"), the rest locked (grey). A boss node with a crown at the end. A floating card at the side: "📚 2 reviews due". A bottom-right floating button "Kip Run ▶" with a runner icon. Tab bar: Learn (active), Cards, League, You.
```

### Screen 7: Lesson — story step
Attach: `bg_the_melt.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_the_melt image attached to this prompt (add a light white scrim so text stays readable).
Kip: on the right, thinking, facing Dash.
Screen:
Lesson player, story step. Top: close X, segmented progress bar (step 1 of 6), streak multiplier chip "×1.03". Middle: Dash the orange hare on the left looking at a phone, with a speech bubble: "Bro, I kept ₹1,000 in my drawer for 5 years. Why does it buy less now??" Kip on the right, thinking. Bottom: large "Continue" button. Warm, comic-strip feel.
```

### Screen 8: Lesson — interactive concept
Attach: `bg_the_melt.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_the_melt image attached to this prompt (add a light white scrim so text stays readable).
Kip: small, peeking from the bottom-left edge of the chai card, looking at the slider, think expression.
Screen:
Lesson player, concept step. Title "Meet The Melt". A big card showing a cup of chai with a price tag that grows as a slider moves: "Today ₹20 → in 20 years ₹64". A slider "Years from now: 20" (0–40). Below: a row of three money-bag icons shrinking, labelled "What ₹1,000 buys", with a purple fog overlay. Caption: "At 6% inflation, prices roughly double every 12 years." Small hypothetical label. Button "Got it".
```

### Screen 9: Lesson — quiz with feedback
Attach: `bg_the_melt.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_the_melt image attached to this prompt (add a light white scrim so text stays readable).
Kip: small, in the corner of the feedback sheet, encouraging, think expression.
Screen:
Lesson player, quiz step. Question: "Your savings account pays 3%. Inflation is 6%. What happens to your money's buying power?" Four large option cards. The selected wrong answer "It grows by 3%" is highlighted red with a shake. The correct answer "It shrinks by about 3% a year" is highlighted green. A bottom sheet slides up in light red: "Not quite! 3% is the nominal return. Subtract inflation for the real return: 3% − 6% ≈ −3%." Button "Continue". Kip small in the corner, encouraging.
```

### Screen 10: Lesson — connect to real life
Attach: `bg_the_melt.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_the_melt image attached to this prompt (add a light white scrim so text stays readable).
Kip: small, beside the Real-World Mission chip, looking toward the button, happy expression.
Screen:
Lesson player, connect step. Header "In real life". A large collectible card "Fixed Deposit" with illustration, rarity "Common", and stat bars (Return 2/5, Risk 1/5, Liquidity 3/5, Lock-in 2/5, Complexity 1/5). Below: an info panel: "A bank FD locks a fixed rate for a fixed time. Breaking it early costs a penalty. Deposits are insured by DICGC up to ₹5 lakh per bank." Then a "Real-World Mission" chip: "Ask a parent what FD rate their bank offers today." Button "Add to my deck".
```

### Screen 11: Lesson complete — rewards
Attach: `bg_celebration.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_celebration image attached to this prompt.
Kip: large at the top, celebrating with a glowing shell, cheer expression.
Screen:
Lesson complete screen. Kip celebrating with a glowing shell. Title "Lesson complete!" Three reward tiles animating in: "+52 XP" (with "×1.04 compounding boost" sub-label), "+10 🪙", "FinIQ 342 → 351". A streak card: "🔥 5-day Knowledge SIP. Your boost compounds 1% a day." Button "Continue". Confetti in brand colours.
```

### Screen 12: Kip Run — runner HUD
Attach: nothing

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the game scene itself (no uploaded image). Use glass only for the small HUD chips and tip bubble; nothing covers the lanes.
Kip: running in the game itself; no other Kip.
Screen:
In-game screen of an endless runner, portrait. A 3-lane road in perspective receding to a horizon through a cheerful market town. Kip runs away from the camera in the middle lane. Gold coins in a line ahead; a green "INVEST" archway in the right lane; a red "SALE! BUY NOW!" billboard to slide under. At the bottom of the screen, a purple fog creature, "The Melt", is creeping up from behind. HUD overlay: top-left "Pocket 🪙 23 (idle)" in purple, top-right "Banked 🪙 41" in green, a thin timer bar at the top, and a warning pill "The Melt is eating idle coins!" Minimal, readable, game-like.
```

### Screen 13: Kip Run — results (compounding reveal)
Attach: `bg_celebration.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_celebration image attached to this prompt.
Kip: cheering above the multiplier reveal, cheer expression.
Screen:
Run results screen. Title "Run complete". A big animated multiplier reveal like a slot of numbers: "Banked 41 🪙 × 1.8 consistency = 74 🪙". Stats row: "Gates hit 4/5", "Coins lost to The Melt 12", "Obstacles hit 1". A mini chart card: "If those were ₹4,100 invested for 10 years at a hypothetical 12%… ₹12,734". Buttons: "Run again" (secondary) and "Collect" (primary).
```

### Screen 14: Cards — collection
Attach: `bg_card_vault.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_card_vault image attached to this prompt.
Kip: peeking from behind the 'My Deck' header, happy expression.
Screen:
"Cards" tab. Title "My Deck · 4 / 16". Filter chips: All, Assets, Strategies, Locked. A 2-column grid of collectible cards: unlocked ones in full colour (Cash, Savings Account, Fixed Deposit, SIP) with rarity frames (common grey, rare blue, epic purple, legendary gold). Locked ones are dark silhouettes with a lock and the hint "Unlocks in World 4" (Stocks, REITs, Derivatives, PE/VC). Top stat bar and tab bar visible.
```

### Screen 15: Card detail
Attach: `bg_card_vault.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_card_vault image attached to this prompt.
Kip: small, peeking over the top edge of the 'In real life' panel, happy expression.
Screen:
Card detail modal for "Index Fund" (rare, blue frame). A large card illustration with a basket of many tiny company logos (generic, no real brands). Stat bars: Return 4/5, Risk 3/5, Liquidity 4/5, Lock-in 1/5, Complexity 2/5. Sections: "What it is" (one sentence), "In real life" (e.g. a Nifty 50 index fund tracks India's 50 largest listed companies; regulated by SEBI), "Good for" chips (Long-term goals, SIPs) and "Watch out" chips (Short-term swings). Close button.
```

### Screen 16: League
Attach: `bg_money_town.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_money_town image attached to this prompt.
Kip: holding a tiny trophy beside the player's own highlighted row, cheer expression.
Screen:
"League" tab. Header: "Bond League · Week 12 · 3 days left" with a shield badge. Info line: "Top 7 move up to Index League". A ranked list of 15 players with an avatar, a username and weekly XP. The current user's row is highlighted green at rank 5. A promotion zone (rows 1–7, green tint) and a demotion zone (last 5 rows, red tint) with divider labels. A card at the top: "XP includes your streak's compounding boost ×1.04".
```

### Screen 17: You — Future You and FinIQ
Attach: `bg_onboarding_future.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_onboarding_future image attached to this prompt.
Kip: shown in the shell-rings card, happy expression.
Screen:
"You" tab. A large Future You card: portrait of the player at age 25 (becoming clearer), goal "New laptop", a target-age chip. A FinIQ gauge from 300 to 900 showing 351, with band "Starter → Saver", and a list "You can now…" with 3 checkmarked capability statements (e.g. "Explain why idle cash loses value"). Kip's shell close-up with "2 growth rings" (one per streak week). Stats grid: Longest streak, Lessons, Cards, Runs. Settings rows: Reminder time, School-hours mute, Parent link.
```

### Screen 18: Dividend Day (weekly chest)
Attach: `bg_money_town.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the Learn screen on bg_money_town, blurred behind a glass modal.
Kip: centred on top of the modal, cheer expression.
Screen:
Modal: "Dividend Day!" A treasure chest shaped like a piggy-bank shell opening with coins. Text: "You showed up 6 of the last 7 days. Consistency pays dividends." Breakdown: "Consistency 17 🪙 + Streak bonus 12 🪙 = 29 🪙". Note: "No luck involved. The more consistent you are, the bigger it gets." Button "Collect".
```

### Screen 19: Emergency fund (streak freeze)
Attach: `bg_money_town.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the Learn screen on bg_money_town, blurred behind a glass modal.
Kip: on top of the modal holding the shield piggy bank, happy expression.
Screen:
Modal: "Build your emergency fund". Kip holding a small shield-shaped piggy bank. Text: "Life happens. A freeze covers one missed day so your Knowledge SIP keeps compounding, just like an emergency fund protects your investments." Shows "Held: 1 / 2", price "50 🪙", balance "120 🪙". Buttons "Buy freeze" and "Not now".
```

### Screen 20: Comeback (streak reset)
Attach: `bg_onboarding_future.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_onboarding_future image attached to this prompt.
Kip: holding a fresh sapling, warm smile, happy expression.
Screen:
Gentle comeback screen. Kip with a warm smile holding a fresh sapling. Title "Welcome back! 🐢" Text: "Your streak reset, like a withdrawal from a SIP. But your knowledge didn't go anywhere. Let's restart the snowball." Card: "Longest streak 12 days. Beat it!" Bonus tile "+20 🪙 welcome-back bonus". Button "Restart my Knowledge SIP". No guilt, no sad faces.
```

### Screen 21: Parent consent (Phase 2) (optional, later)
Attach: `bg_onboarding_future.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_onboarding_future image attached to this prompt.
Kip: beside the teen-and-parent illustration, happy expression.
Screen:
Screen: "Let's loop in a parent". Kip beside a simple illustration of a teen and a parent. Text: "Because you're under 18, a parent or guardian needs to say yes before we save your progress online." Input: "Parent's phone or email". Bullet list of what parents get: weekly progress digest, notification controls, no ads ever. Button "Send consent link". Secondary: "Keep playing offline for now".
```

### Screen 22: Market Duel (Phase 2) (optional, later)
Attach: `bg_card_vault.png`

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the bg_card_vault image attached to this prompt.
Kip: small, beside the score preview chips, think expression.
Screen:
Card battle screen, portrait. Top: opponent avatar "Riya · Elo 1180" and the goal brief card: "Goal: ₹50,000 laptop in 2 years. You may need cash in year 1." Middle: a timeline of 5 face-down "Market Year" cards, the first flipped: "Rate Hike". Bottom: the player's hand of 5 asset cards (Index Fund, Fixed Deposit, Gold, Savings, Stocks) with allocation percentages and a draggable allocation bar. Score preview chips: Goal 48/60, Stability 20/25, Liquidity 15/15. Button "Lock portfolio".
```

---

## Extra screens 23–33 (dark Midnight Arcade theme)

These cover parts of the game the first 22 prompts missed. They use the dark **Midnight Arcade Fintech** design system saved in your Stitch project, and were generated through the Stitch connection. To regenerate one by hand, paste the style line plus the screen text.

**Style line (put at the start of each):**

```
Mobile screen (390 x 844) for the game 'Kip: Money Quest'. Match the existing screens in this project exactly: dark Midnight Arcade Fintech style, frosted navy glass panels, solid chunky neon-green 3D buttons with a darker bottom edge, honey-gold accents, Space Grotesk headings and Outfit body text. India-first: all money in rupees (₹), simulated money only. Mascot Kip is the 3D mint-green tortoise with oversized round navy glasses, a honey-gold hexagon shell and a teal backpack, exactly as in the KIP Character Sheet in this project, cut out cleanly with no box behind him. UX rules: one primary action in the bottom thumb zone, text contrast at least 4.5:1, status shown with icon plus label, tap targets at least 44 pt. Screen:
```

### Screen 23: Onboarding 4: First Run
```
Onboarding step 4 of 6, same layout as the other onboarding screens: glass step pill 'STEP 4 OF 6' with a progress bar four-sixths filled. Background: warm sunrise future-city skyline, like onboarding steps 1 to 3. Label 'KIP RUN · INFLATION CHASE'. Kip speech bubble: 'Coins in your pocket are idle money. The Melt shrinks them when it gets close. Steer into green INVEST gates to bank them!' Below: Kip in a running pose on the left and The Melt (soft purple fog cloud with sleepy eyes and a wobbly smile) creeping in from the right. A glass card with three control hints, each with an icon: '← → switch lanes', '↑ jump FEE booths', '↓ slide under SALE signs'. Primary solid green button: 'Start my first run ▶'.
```

### Screen 24: Lesson: Predict First
```
Lesson player, concept step with a predict-first question. Header: close X, segmented progress bar (step 3 of 6), chip '×1.03 STREAK'. Background: The Melt dusk scene (violet to indigo with purple fog) under a dark scrim. Small row: Kip thinking avatar plus label 'PREDICT FIRST'. Big question: 'A chai costs ₹20 today. With 6% inflation every year, what will it cost in 20 years?' Three large answer cards: '₹26', '₹44', '₹64', none selected. Helper text: 'Guess first. Then drag the slider to find out.' Disabled primary button 'Pick an answer'.
```

### Screen 25: Lesson: Run Brief (Snowball)
```
Lesson player, play-step brief shown before a Kip Run level. Header: close X, progress bar step 2 of 5. Background: icy Snowball Valley (pastel blue and mint snowy hills) under a dark scrim. Label 'KIP RUN · SNOWBALL RUN'. Kip speech bubble: 'Coins in a row grow your snowball. SIP gates bank your coins. Avoid CASH OUT ramps: they reset the snowball.' Kip cheering on the left with a big snowball beside him. Glass legend card with four rows, each icon plus label: teal 'SIP gate: banks your coins +10%', gold 'CASH OUT +15: resets your snowball', red 'FEE booth: jump', 'SALE sign: slide under'. Primary solid green button 'Start run ▶'.
```

### Screen 26: Kip Run: Snowball Run HUD
```
In-game endless runner, portrait, Snowball Valley level: a three-lane snowy road in perspective with pine trees on both sides receding to pastel blue hills. Kip runs away from the camera in the middle lane with a big snowball rolling beside him. Ahead: a line of gold coins, a teal archway gate labelled 'SIP ↑' in the left lane, a golden ramp labelled 'CASH OUT +15' with sparkles in the right lane. The Melt purple fog creeps in along the bottom edge. HUD uses only small glass chips and never covers the lanes: thin timer bar at the top; left chip 'Idle 🪙 18' in purple; centre chip '⛄ ×1.48'; right chip 'Banked 🪙 64' in green. A small non-blocking Kip tip bubble near the top: 'Cash out = withdrawal. Your snowball reset!'
```

### Screen 27: Kip Run: Mode Picker
```
Kip Run launcher screen. Title 'Kip Run' with a close X top right. Background: Money Town sunrise market under a dark scrim. Hero row: Kip in a running pose on the left, The Melt fog on the right. Two large selectable glass mode cards: 'Inflation Chase' (selected, green border, check icon) with text 'Bank idle coins at INVEST gates before The Melt eats them.' and 'Snowball Run' with text 'Grow the snowball with coins in a row. SIP gates bank +10%. CASH OUT resets it.' A glass stats row: 'Best run 🪙 112', 'Runs 7', '🔥 4 day streak'. Note: 'Every run counts toward today's Knowledge SIP.' Primary solid green button 'Start run ▶'.
```

### Screen 28: Review: Spaced Review Quiz
```
Spaced review quiz screen. Header: close X and a honey-gold progress bar (question 2 of 3). Label 'REVIEW · Real vs nominal'. Chip: '📚 Day-3 review: memories compound too'. Question: 'An FD pays 7%. Inflation is 6%. What is the real return, roughly?' Three answer cards: 'About 1%' (selected, white border), 'About 7%', 'About 13%'. Primary solid green button 'Check'. Kip small at the bottom left, thinking, looking at the button. Background: plain dark navy with soft green and indigo glow pockets.
```

### Screen 29: Review: Complete
```
Review complete screen. Background: celebration burst of warm gold light with confetti bokeh. Kip cheering at the top. Title 'Review complete!' Glass card: '3/3 correct · +19 XP · +5 🪙'. Text: 'Remembering is compounding for your brain. These come back on day 7 and day 21 so they stick.' A timeline of four chips: 'Day 1 ✓', 'Day 3 ✓', 'Day 7 · next', 'Day 21'. Streak card: '🔥 5-day Knowledge SIP'. Primary solid green button 'Done'.
```

### Screen 30: Lesson Concept: Real vs Nominal
```
Lesson concept step. Header: close X, progress bar step 2 of 5, chip '×1.04 STREAK'. Background: The Melt dusk scene under a dark scrim. Title 'Real value after 10 years'. Caption 'Tap a product. Compare its rate with The Melt.' Segmented control: 'Cash' | 'Savings 3%' (selected) | 'FD 7%'. Near-solid glass card with three vertical bars, each with its value label above: grey 'You put in today' ₹10,000; green 'Balance in 10 yrs' ₹13,439; purple 'What it buys in today's money' ₹7,504. Result strip with purple tint: 'Real return ≈ −2.8% a year · The Melt wins' with icon, sub-label '3% interest − 6% inflation'. Small grey line: 'Hypothetical returns for learning. Not advice.' Primary solid green button 'Got it'.
```

### Screen 31: Lesson Concept: Lump Sum vs SIP
```
Lesson concept step. Header: close X, progress bar step 3 of 5. Background: icy Snowball Valley under a dark scrim. Title 'Same money, three markets'. Caption 'Pick a market. The same ₹12,000 is invested either way.' Segmented control: 'Steady rise' | 'Choppy' | 'Dip, then recover' (selected). Card 1: small line chart 'Price over 12 months' falling from ₹100 to about ₹60, then recovering to ₹115. Card 2: three vertical bars with value labels: grey 'Put in' ₹12,000; orange 'Lump sum' ₹13,800; green 'SIP ₹1,000/mo' ₹16,907 with a trophy icon. Text: 'SIP wins: it bought more units while prices were low.' Small grey line: 'Illustrative price paths. Hypothetical returns for learning. Not advice.' Primary solid green button 'Got it'.
```

### Screen 32: Lesson Concept: Barter Puzzle
```
Lesson concept step in World 0, Money Town. Header: close X, progress bar step 2 of 6. Background: Money Town sunrise market under a dark scrim. Title 'Get the cricket bat'. Caption 'You have mangoes. You want a cricket bat. Tap a villager to trade.' Glass card: 'You're holding' with a large 🥭, message 'Meena wants 🥭. Trade with her!'. A 2 x 2 grid of villager cards, each with a simple avatar, name and 'Has / Wants': Ravi 'Has 🏏 · Wants 🐔'; Meena 'Has 🐔 · Wants 🥭' (highlighted green as a match); Asha 'Has 📚 · Wants 🏏'; Imran 'Has 🥛 · Wants 📚'. Kip small at the bottom left, thinking. Disabled primary button 'Get the bat to continue'.
```

### Screen 33: Home: Learn (World 2 · Snowball Valley)
```
Learn home tab, same layout as the existing 'Home: Learn (World 1 · The Melt)' screen but for World 2. Background: icy Snowball Valley (pastel blue and mint snowy hills). Top stat chips: '🔥 9', '🪙 340', 'FinIQ 431'. Future You card: small portrait, 'Goal: New laptop by 25', 'FinIQ 431 · Starter → Saver' with a progress bar (no money amounts, no 'funded' percentage). World header card: 'CHAPTER 2 · Snowball Valley', subtitle 'Compounding, consistency and SIPs', '2 / 6'. Winding path: 'Interest on interest' and 'Time is the secret ingredient' completed (gold with stars); 'SIP: investing on autopilot' current (pulsing green, Kip beside it with 'Start here!'); locked 'Lump sum vs SIP' and 'Don't break the snowball'; boss node 'The long game' with a crown. Floating chip '📚 1 review due' and button 'Kip Run ▶'. Glass tab bar: Learn (active), Cards, League, You.
```

---

## Check every screen

- Text is easy to read everywhere, including over the background.
- Exactly one main button, solid (not glass), near the bottom.
- Kip looks toward the main button and doesn't cover any content.
- Right and wrong states show an icon and a word, not just a colour.
- Every chart or projection has the line: "Hypothetical returns for learning. Not advice."

## Fix prompts (if a screen drifts)

```
The style drifted. Re-apply the established glass design system exactly as in the style tile: same glass opacity, blur, borders, button style, type and colours. Keep this screen's content.
```

```
Text is hard to read here. Raise the glass panel opacity to 85% and add a soft white scrim behind the text. Keep the background image.
```

```
Kip is covering content. Make him smaller and move him to the edge of the nearest card, still looking toward the main button.
```

```
Too busy. Remove decoration that doesn't guide the eye to the main button. Keep one accent colour besides Kip green.
```

## Optional: dark theme (after all screens are done)

Attach `bg_night_market.png`, then paste:

```
Create a dark variant of the glass design system and show the style tile again in dark. Background: the night-market image (deep navy #0F1724 base). Glass: navy #1E2A3A at 55% opacity, 28 px blur, white 12% inner border. Text: white at 92%, secondary #B6C0CF. Keep all accent colours but raise their brightness about 10% so they glow. Buttons stay solid. Keep every UX rule, including 4.5:1 text contrast.
```
