# Modern glass theme: Stitch and Nano Banana prompts

> **Ready-to-paste version with exact steps:** [stitch-final-prompts.md](stitch-final-prompts.md). This file explains the theme; that one is what you paste.

This upgrades the look of [stitch-designs.md](stitch-designs.md) to a modern, glassmorphic, layered style. It keeps strong UX rules so the glass never hurts readability. **Prompt A replaces the earlier design system block**, and **Prompt B replaces style tile prompt 0**.

## Order of use

1. In your Stitch project, paste **A + B** together. Refine with the **C** follow-ups, one at a time.
2. Make the **D** backgrounds as images in Nano Banana, then upload them to Stitch.
3. Generate each screen with the **E1** template, using the background map. Use **E2** only for screens you already made in the old style.
4. Optional: generate the dark theme with **F**.

The app can render this natively, because the project already includes `expo-glass-effect` (iOS liquid glass), and `expo-blur` can be added for frosted panels on Android.

---

## A. Design system v2 (paste first, and again whenever the style drifts)

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
```

## B. Style tile v2 (paste together with A)

```
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

## C. Refinement follow-ups (one at a time, after the style tile)

1. `Add depth: float 3 out-of-focus 3D clay coins and one honey hexagon shell behind the glass panels. Keep them blurred and behind content.`
2. `Improve readability: raise glass opacity to 75%, keep the 1 px white inner border, and make sure all body text meets 4.5:1 contrast.`
3. `Keep every button solid (not glass) so the primary action is always the most visible element on screen.`
4. `Make the tab bar a floating glass pill 16 pt above the bottom safe area. The active tab has a filled icon and a green label.`
5. `Add motion specs: legendary cards shimmer slowly, the current lesson node pulses with a soft glow, and rewards pop in with a short spring. List the reduced-motion fallback for each.`
6. `Reduce noise: besides Kip green, use one accent colour per screen. Remove any decoration that doesn't guide the eye to the primary action.`
7. `Make Kip a guide, not decoration: on each screen, place him so he looks toward the primary button, and match his expression to the moment.`

---

## D. Background images (make in Nano Banana, then upload to Stitch)

Add this **suffix to every background prompt**:

```
Vertical 9:16 mobile app background, 1290 × 2796 px. No text, no characters, no UI, no logos. Soft-focus stylised 3D clay look matching a playful premium game. Gentle mesh gradient with subtle film grain. Keep the middle 60% calm and low-detail so UI stays readable; put the detail near the top and bottom edges.
```

| File name | Use it for | Prompt (then add the suffix) |
|---|---|---|
| `bg_onboarding_future` | Onboarding | Dawn horizon with a winding path leading to a softly glowing future city skyline far away (bank, tall tower, bridge silhouettes). Hopeful gold and peach light, a few floating blurred coins. |
| `bg_money_town` | World 0 screens, Learn home | Warm sunrise sky over a stylised Indian market town silhouette at the bottom (chai stall awnings, rooftops, a few kites). Peach-honey-coral gradient, floating blurred gold coins. |
| `bg_the_melt` | World 1 screens | Dusk sky from violet to deep indigo, purple fog wisps drifting low, a few gold coins half-dissolving into the fog, faint stars at the top. Mysterious but friendly, not scary. |
| `bg_snowball_valley` | World 2 screens | Icy morning, rolling snowy hills in pastel blue and mint at the bottom, a big soft snowball on a distant hill, sparkling snow particles in the air. |
| `bg_card_vault` | Cards tab and card detail | Deep navy vault with a soft spotlight from the top, a subtle hexagon (tortoise-shell) pattern fading into the dark, tiny gold dust particles. Makes holographic cards pop. |
| `bg_celebration` | Lesson complete, Dividend Day, run results | A soft radial burst of warm gold light from the centre, confetti bokeh in brand colours (green, honey, coral, purple), gentle sparkles. |
| `bg_night_market` | Dark theme | Night version of the market town: deep navy sky, warm string lights and glowing lanterns along the rooftops, soft purple haze. |

## E. Generate each screen

**Use the old screen prompts for the content and this file for the look.** The screen prompts in [stitch-designs.md](stitch-designs.md) (1–22) say what is on each screen. The map below says which background and Kip pose it gets. Don't paste the old short line that says "cream background"; it conflicts with the glass look.

### E1. New screens (recommended): one prompt per screen

Fill the brackets from the map below, then paste the screen's prompt from stitch-designs.md at the end:

```
Use the established glass design system: mesh-gradient background, frosted glass panels, solid chunky buttons, all UX rules.
Background: the [BACKGROUND] image I uploaded.
Kip: [KIP PLACEMENT], looking toward the primary action, [EXPRESSION] expression.
Screen:
[PASTE THE SCREEN PROMPT FROM stitch-designs.md]
```

### E2. Screens you already made in the old style: restyle them

```
Use the established glass design system. Restyle the [SCREEN NAME] screen on the [BACKGROUND] background image I uploaded. Top stat bar and tab bar are glass. Main content sits on near-solid glass cards. Keep the primary button solid green in the bottom thumb zone. Place Kip [KIP PLACEMENT], looking toward the primary action, with a [EXPRESSION] expression. Keep all existing copy and layout. Check that all text meets 4.5:1 contrast.
```

**Background and Kip placement map**

| Screen (from stitch-designs.md) | Background | Kip placement and expression |
|---|---|---|
| 1–5 Onboarding | `bg_onboarding_future` | Large and centred on screen 1 (waving), then beside the main content (happy) |
| 6 Learn home | `bg_money_town`, swapped for the current world's background as the player progresses | Standing next to the current lesson node, happy |
| 7–11 Lesson steps | The lesson's world background with a light scrim | Small, at the left of the speech bubble or feedback sheet; think on quiz, cheer on correct |
| 12 Kip Run HUD | No glass over gameplay; HUD chips only | In the game itself |
| 13 Run results | `bg_celebration` | Cheering above the reveal |
| 14–15 Cards, card detail | `bg_card_vault` | Peeking from behind the deck header, happy |
| 16 League | `bg_money_town` | Holding a tiny trophy beside the user's own row, cheer |
| 17 You | `bg_onboarding_future` | Next to the shell-rings card, happy |
| 18–20 Pop-ups | Blurred current screen behind a glass modal | Centred on top of the modal, matching the moment |

## F. Dark theme (optional)

```
Create a dark variant of the glass design system and show the style tile again in dark. Background: the night-market image (deep navy #0F1724 base). Glass: navy #1E2A3A at 55% opacity, 28 px blur, white 12% inner border. Text: white at 92%, secondary #B6C0CF. Keep all accent colours but raise their brightness about 10% so they glow. Buttons stay solid. Keep every UX rule, including 4.5:1 text contrast.
```
