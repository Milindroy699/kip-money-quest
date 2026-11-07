# Google Stitch prompts — app screens

> **Start here instead:** [stitch-final-prompts.md](stitch-final-prompts.md) has every prompt ready to paste, with exact steps. This file is the source for the screen content.
>
> **Want the modern glass look?** Use [stitch-glass-theme.md](stitch-glass-theme.md). Its design system and style tile replace the block and screen 0 below. The screen prompts 1–22 below stay the same; restyle each one with that file's template.

## How to use
1. **Start a mobile project** in Stitch. Use *Experimental / Pro* mode for best quality.
2. **Generate screen 0 first.** Paste the **Design system block**, then the screen 0 prompt (the style tile). Iterate until you love it.
3. **Generate every other screen in the same project** with the short **"Use the established design system"** line plus the screen prompt. If the style drifts, paste the full block again.
4. **Upload a character still if you have one.** Once Kip's character sheet exists (from [veo-characters.md](veo-characters.md)), upload it as an image reference so Stitch puts the real Kip in the layouts. Until then, Stitch draws a placeholder tortoise.
5. **Export to Figma** and share the link. I can read the frames through the Figma connector and match the app's code to them: spacing, colours, type and components.

One screen per prompt works best. Keep each one under ~150 words beyond the shared block.

---

## Design system block (paste into the first prompt, and whenever the style drifts)

```
Mobile app for iPhone (390 × 844), a game that teaches teenagers (13–19) in India to invest from first principles. App name: "Kip: Money Quest". Mascot: Kip, a young mint-green tortoise with oversized round dark-navy glasses and a honey-gold hexagon shell.
Feel: playful, premium and confident, like Duolingo meets a modern fintech app. Never babyish; 16-year-olds must feel respected.
Colours: background cream #FFF8EC; surface white #FFFFFF; ink navy #1E2A3A for text; secondary text #5B6474; primary Kip green #2DBE7E (buttons, progress); shell honey #F2B544 (rewards, XP); coin gold #FFC83D; Melt purple #8B5CF6 (inflation, danger-lite); Dash orange #FF8A3D (risk, Dash the hare); error #E5484D.
Type: rounded geometric sans (e.g. Nunito or SF Rounded). Titles 28–32 bold, body 16–17 medium, numbers tabular and bold.
Shapes: 20px card radius, 16px button radius, chunky 3D buttons with a 4px darker bottom edge (pressable feel), soft shadows, generous 20px padding, 8px spacing grid.
Persistent top bar on main screens: streak flame chip "🔥 4", coin chip "🪙 120", FinIQ chip "FinIQ 342".
Every chart or projection shows a small grey label: "Hypothetical returns for learning. Not advice."
```

Short line for later prompts:
```
Use the established Kip: Money Quest design system (cream background, Kip green primary, chunky rounded buttons, rounded sans type).
```

---

## Screens

### 0. Style tile (generate first)
```
Create a style tile / mini design system board for this app: colour swatches with names, type scale, primary/secondary/ghost chunky buttons in default and pressed states, a stat chip row (streak, coins, FinIQ), a progress bar, a quiz option card in default/correct/wrong states, an asset collectible card, a speech bubble from Kip, and a tab bar with 4 tabs: Learn, Cards, League, You.
```

### 1. Onboarding — Hi, I'm Kip
```
Onboarding screen 1 of 6. Top: thin 6-step progress bar. Centre: large Kip waving, with a speech bubble: "Hi! I'm Kip. I'll help you make Future You richer and wiser." Below: text field "What should I call you?" and two big selectable pills for age band: "13–15" and "16–19". Bottom: full-width green chunky button "Let's go". Small grey link "I already have an account".
```

### 2. Onboarding — What's your dream?
```
Onboarding screen 2 of 6. Title "What's your dream?" Subtitle "Pick one. We'll build toward it together." A 2×3 grid of large tappable goal cards with an emoji and label: 💻 New laptop, 🏍️ My own bike, ✈️ Travel the world, 🎓 College fund, 🚀 Start a business, 🏝️ Free at 40. One card is selected (green border, checkmark). Below: "By what age?" with a horizontal age chip scroller (18, 21, 25, 30, 40), 25 selected. At the bottom, a soft, foggy circular portrait labelled "Future You, age 25", blurred and dreamy. Bottom button "Continue".
```

### 3. Onboarding — Kip vs Dash (the magic moment)
```
Onboarding screen 3 of 6. Title "Same ₹500 a month. Two choices." Two character badges at top: left Dash the orange hare "Keeps cash in a drawer", right Kip the tortoise "Invests in a monthly SIP". Main area: a clean line chart over years. Green line for Kip curving strongly upward. Orange line for Dash rising in a straight line, with a purple fog shading below it labelled "The Melt (inflation)" showing what Dash's pile really buys. End-point labels: Kip "₹5.0 lakh", Dash "₹1.2 lakh (buys only ₹37k of today's stuff)". A small toggle above the chart: "Show in today's money". Below the chart: a big, thick slider "Years: 20" from 5 to 40 with a tortoise-shell thumb. Caption "Drag to see time do the work." Small grey hypothetical-returns label: "Hypothetical 12% p.a. return, 6% inflation. Not advice." Button "Whoa. Show me how".
```

### 4. Onboarding — First cards earned
```
Onboarding screen 5 of 6. Celebration. Title "Your first cards!" Two collectible cards fanned out and glowing, flipping in: "Cash" (common, grey frame) and "Fixed Deposit" (common, grey frame). Each card has an illustration, a name, a rarity gem, and 5 mini stat bars: Return, Risk, Liquidity, Lock-in, Complexity. Below: a FinIQ meter animating from 300 to 320 on a 300–900 gauge, with the band label "Starter". Confetti. Button "Collect".
```

### 5. Onboarding — Commit to your Knowledge SIP
```
Onboarding screen 6 of 6. Kip holding a calendar. Title "Start your Knowledge SIP". Subtitle "A little every day beats a lot once in a while, just like a SIP." Three large selectable rows for the daily goal: "3 min · Casual", "5 min · Regular" (selected), "10 min · Serious". Then "Remind me at" with a time picker chip "6:00 PM" and a note "We never nudge after 10 PM". Bottom: big green button "Start my Knowledge SIP 🐢".
```

### 6. Learn — world path map (home)
```
Home "Learn" tab. Top stat bar (streak 🔥 4, coins 🪙 120, FinIQ 342). A "Future You" banner card: small foggy portrait, "Goal: New laptop by 25", and a progress line. Below: a vertical, winding path map (Duolingo-style) for "World 1 · The Melt", with a purple themed header "Why invest? Inflation never sleeps." Path nodes: 2 completed (gold, with stars), 1 current (pulsing green, Kip standing beside it, tooltip "Start"), the rest locked (grey). A boss node with a crown at the end. A floating card at the side: "📚 2 reviews due". A bottom-right floating button "Kip Run ▶" with a runner icon. Tab bar: Learn (active), Cards, League, You.
```

### 7. Lesson — story step
```
Lesson player, story step. Top: close X, segmented progress bar (step 1 of 6), streak multiplier chip "×1.03". Middle: Dash the orange hare on the left looking at a phone, with a speech bubble: "Bro, I kept ₹1,000 in my drawer for 5 years. Why does it buy less now??" Kip on the right, thinking. Bottom: large "Continue" button. Warm, comic-strip feel.
```

### 8. Lesson — interactive concept
```
Lesson player, concept step. Title "Meet The Melt". A big card showing a cup of chai with a price tag that grows as a slider moves: "Today ₹20 → in 20 years ₹64". A slider "Years from now: 20" (0–40). Below: a row of three money-bag icons shrinking, labelled "What ₹1,000 buys", with a purple fog overlay. Caption: "At 6% inflation, prices roughly double every 12 years." Small hypothetical label. Button "Got it".
```

### 9. Lesson — quiz with feedback
```
Lesson player, quiz step. Question: "Your savings account pays 3%. Inflation is 6%. What happens to your money's buying power?" Four large option cards. The selected wrong answer "It grows by 3%" is highlighted red with a shake. The correct answer "It shrinks by about 3% a year" is highlighted green. A bottom sheet slides up in light red: "Not quite! 3% is the nominal return. Subtract inflation for the real return: 3% − 6% ≈ −3%." Button "Continue". Kip small in the corner, encouraging.
```

### 10. Lesson — connect to real life
```
Lesson player, connect step. Header "In real life". A large collectible card "Fixed Deposit" with illustration, rarity "Common", and stat bars (Return 2/5, Risk 1/5, Liquidity 3/5, Lock-in 2/5, Complexity 1/5). Below: an info panel: "A bank FD locks a fixed rate for a fixed time. Breaking it early costs a penalty. Deposits are insured by DICGC up to ₹5 lakh per bank." Then a "Real-World Mission" chip: "Ask a parent what FD rate their bank offers today." Button "Add to my deck".
```

### 11. Lesson complete — rewards
```
Lesson complete screen. Kip celebrating with a glowing shell. Title "Lesson complete!" Three reward tiles animating in: "+52 XP" (with "×1.04 compounding boost" sub-label), "+10 🪙", "FinIQ 342 → 351". A streak card: "🔥 5-day Knowledge SIP. Your boost compounds 1% a day." Button "Continue". Confetti in brand colours.
```

### 12. Kip Run — runner HUD
```
In-game screen of an endless runner, portrait. A 3-lane road in perspective receding to a horizon through a cheerful market town. Kip runs away from the camera in the middle lane. Gold coins in a line ahead; a green "INVEST" archway in the right lane; a red "SALE! BUY NOW!" billboard to slide under. At the bottom of the screen, a purple fog creature, "The Melt", is creeping up from behind. HUD overlay: top-left "Pocket 🪙 23 (idle)" in purple, top-right "Banked 🪙 41" in green, a thin timer bar at the top, and a warning pill "The Melt is eating idle coins!" Minimal, readable, game-like.
```

### 13. Kip Run — results (compounding reveal)
```
Run results screen. Title "Run complete". A big animated multiplier reveal like a slot of numbers: "Banked 41 🪙 × 1.8 consistency = 74 🪙". Stats row: "Gates hit 4/5", "Coins lost to The Melt 12", "Obstacles hit 1". A mini chart card: "If those were ₹4,100 invested for 10 years at a hypothetical 12%… ₹12,734". Buttons: "Run again" (secondary) and "Collect" (primary).
```

### 14. Cards — collection
```
"Cards" tab. Title "My Deck · 4 / 16". Filter chips: All, Assets, Strategies, Locked. A 2-column grid of collectible cards: unlocked ones in full colour (Cash, Savings Account, Fixed Deposit, SIP) with rarity frames (common grey, rare blue, epic purple, legendary gold). Locked ones are dark silhouettes with a lock and the hint "Unlocks in World 4" (Stocks, REITs, Derivatives, PE/VC). Top stat bar and tab bar visible.
```

### 15. Card detail
```
Card detail modal for "Index Fund" (rare, blue frame). A large card illustration with a basket of many tiny company logos (generic, no real brands). Stat bars: Return 4/5, Risk 3/5, Liquidity 4/5, Lock-in 1/5, Complexity 2/5. Sections: "What it is" (one sentence), "In real life" (e.g. a Nifty 50 index fund tracks India's 50 largest listed companies; regulated by SEBI), "Good for" chips (Long-term goals, SIPs) and "Watch out" chips (Short-term swings). Close button.
```

### 16. League
```
"League" tab. Header: "Bond League · Week 12 · 3 days left" with a shield badge. Info line: "Top 7 move up to Index League". A ranked list of 15 players with an avatar, a username and weekly XP. The current user's row is highlighted green at rank 5. A promotion zone (rows 1–7, green tint) and a demotion zone (last 5 rows, red tint) with divider labels. A card at the top: "XP includes your streak's compounding boost ×1.04".
```

### 17. You — Future You and FinIQ
```
"You" tab. A large Future You card: portrait of the player at age 25 (becoming clearer), goal "New laptop", a target-age chip. A FinIQ gauge from 300 to 900 showing 351, with band "Starter → Saver", and a list "You can now…" with 3 checkmarked capability statements (e.g. "Explain why idle cash loses value"). Kip's shell close-up with "2 growth rings" (one per streak week). Stats grid: Longest streak, Lessons, Cards, Runs. Settings rows: Reminder time, School-hours mute, Parent link.
```

### 18. Dividend Day (weekly chest)
```
Modal: "Dividend Day!" A treasure chest shaped like a piggy-bank shell opening with coins. Text: "You showed up 6 of the last 7 days. Consistency pays dividends." Breakdown: "Consistency 17 🪙 + Streak bonus 12 🪙 = 29 🪙". Note: "No luck involved. The more consistent you are, the bigger it gets." Button "Collect".
```

### 19. Emergency fund (streak freeze)
```
Modal: "Build your emergency fund". Kip holding a small shield-shaped piggy bank. Text: "Life happens. A freeze covers one missed day so your Knowledge SIP keeps compounding, just like an emergency fund protects your investments." Shows "Held: 1 / 2", price "50 🪙", balance "120 🪙". Buttons "Buy freeze" and "Not now".
```

### 20. Comeback (streak reset)
```
Gentle comeback screen. Kip with a warm smile holding a fresh sapling. Title "Welcome back! 🐢" Text: "Your streak reset, like a withdrawal from a SIP. But your knowledge didn't go anywhere. Let's restart the snowball." Card: "Longest streak 12 days. Beat it!" Bonus tile "+20 🪙 welcome-back bonus". Button "Restart my Knowledge SIP". No guilt, no sad faces.
```

### 21. Parent consent (Phase 2)
```
Screen: "Let's loop in a parent". Kip beside a simple illustration of a teen and a parent. Text: "Because you're under 18, a parent or guardian needs to say yes before we save your progress online." Input: "Parent's phone or email". Bullet list of what parents get: weekly progress digest, notification controls, no ads ever. Button "Send consent link". Secondary: "Keep playing offline for now".
```

### 22. Market Duel (Phase 2)
```
Card battle screen, portrait. Top: opponent avatar "Riya · Elo 1180" and the goal brief card: "Goal: ₹50,000 laptop in 2 years. You may need cash in year 1." Middle: a timeline of 5 face-down "Market Year" cards, the first flipped: "Rate Hike". Bottom: the player's hand of 5 asset cards (Index Fund, Fixed Deposit, Gold, Savings, Stocks) with allocation percentages and a draggable allocation bar. Score preview chips: Goal 48/60, Stability 20/25, Liquidity 15/15. Button "Lock portfolio".
```
