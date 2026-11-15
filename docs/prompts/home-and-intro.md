# Kip's "Hii!" intro clip and the Home redesign (Stitch)

Two asks from the 13 Nov 2026 feedback round. The app already ships a working version of both, built from the art we have:

- **Intro.** The native splash (still Kip) comes alive: he hops, waves, says "Hii {name}! 👋" in a bubble with one line that fits the player, coins burst out, and a loader fills. It takes about 3 s, and a tap skips it. It reuses `kip_wave.mp4`. A dedicated clip (below) would make it feel made-for-purpose.
- **Home.** There's a world hero card (Money Town with its stops), a swipeable "For you today" carousel, and a Quick Run card. The Stitch prompt below is for exploring further looks.

---

## 1. Veo: `kip_hi.mp4` (one-shot, magenta)

> ✅ Done 13 Nov 2026. The user made two takes. `kip_hi.mp4` (Kip on a bus-stop bench) has a full scene and can't be cut out. `kip_hi_1.mp4` is in the app: `ANIMS.kipHi`, 80 frames at 24 fps, cut by `scripts/process_anims.py` with the new **pink** keyer, because Veo's backdrop came out raspberry (≈ RGB 212/90/152) rather than magenta. Its voice and chime are `assets/sounds/kip_hi.wav`. Veo also burned in a "Hii!" caption, which the keyer drops, since it sits apart from Kip.

**Why a new clip:** the current wave is calm and side-on. For the opener we want a burst of joy: a hop, both arms up, and a big "Hii!" with his mouth open, ending exactly where it started, so it can hand back to the still pose.

**Step 1: the still (Nano Banana).** Attach `assets/images/splash-icon.png` (or `design/source-art/characters/kip/kip_full.jpg`) as the reference.
```
Kip the tortoise from the reference image, exactly the same character, proportions, round navy glasses, teal backpack and colours. Front view, standing relaxed with arms at his sides and a gentle smile, full body centred, feet at the bottom third, filling about 60% of the frame height. Solid pure magenta (#FF00FF) background, evenly lit, no shadow, no floor, no text. 16:9 landscape image.
```
The image must be **16:9**. A square start frame makes Veo add black bars and zoom.

**Step 2: the clip (Veo, Frames to Video).** Use the still as **both the first and last frame**.
```
Premium stylised 3D character for a mobile learning game, soft clay-like materials, Pixar-meets-Duolingo charm. Using the reference image of Kip the tortoise: he notices the viewer, his eyes light up behind his round glasses, he does one small happy hop on the spot, throws both arms up, then waves big with his right hand while his mouth opens wide saying "Hii!", gives a quick cheeky wink, and settles back into exactly the starting pose with a warm smile. He stays centred and lands on the same spot. Static locked-off camera, no zoom, no pan, no camera shake. Solid pure magenta (#FF00FF) background, evenly lit, no shadows, no floor, no props, no text. The last frame matches the first frame exactly. Duration about 4 seconds. Audio: Kip says "Hii!" once, a bright, friendly young voice, no music.
```

**Send back:**
- `design/source-art/characters/kip/kip_hi.mp4`.
- If the "Hii!" voice sounds good, say so and I'll cut it into a short sound for the intro (it would follow the sound setting).

**What I'll do with it:** key it with the magenta keyer, trim to the hop-to-settle stretch, line its first frame up on the splash pose (same height, same feet), and swap it into `src/ui/KipIntro.tsx` in place of the wave.

---

## 2. Google Stitch: Home screen

Open the Finlit project in Stitch (the Kip design system), choose **mobile**, and attach two images:

- a Home screenshot from the app;
- a screenshot of the Campus tab (the map behind the centre button), so the world card matches it.

Then paste:

```
Design the HOME screen of "Kip: Money Quest", a playful investing-learning game for Indian teens (13–19). iPhone 390×844, light theme. Mood: warm, cosy, game-like and premium, like Duolingo meets a cosy town-builder, not a bank app.

Visual style:
- Background: warm cream #FFF8EC with a soft, blurred 3D clay illustration of an Indian market town (terracotta houses, kites, a temple dome) fading in at the top.
- Cards: big 24–28 px rounded corners, soft shadows, chunky 3D "pressable" buttons with a darker bottom edge.
- Font: SF Pro Rounded (bold, friendly headings).
- Colours: Kip green #2DBE7E (primary), shell gold #F2B544, coin gold #FFC83D, Melt purple #8B5CF6, Dash orange #FF8A3D, ink navy #1E2A3A for text.
- Illustrations: stylised 3D clay, like the attached art.

Screen content, top to bottom:

1. Status bar row: a dark navy goal pill "💻 Laptop by 25", then compact pills "🔥 5", "🪙 186", "FinIQ 415".

2. WORLD HERO CARD (the most important element, about 45% of the first screen). It must look like a slice of the game's Campus map, the screen behind the raised centre tab button, so Home and the map feel like one world:
   - Above the map: badge "👉 START HERE · WORLD 0", "1/4 done" on the right, title "🏛️ Money Town", subtitle "Why money exists, and what it really is".
   - The map (a rounded inset, about 200 px tall), top-down 3/4 view in 3D clay:
     - a bright green lawn with tiny white flowers;
     - a winding terracotta brick path with a darker edge, running from the bottom-left up to the right;
     - small clay trees (a round neem, a red-flowering gulmohar, a banyan), a street lamp and a chai cart.
   - The path ends at the Money Town gate: a terracotta Indian archway with two domed towers on a round grassy island.
   - 4 lesson stops sit on the path as round markers: ✓ done (gold), Kip standing at the current stop under a small dark pill "YOU ARE HERE", then locked stops (beige, with a padlock).
   - Below the map: Kip's face, "LESSON 2 OF 4 · 3–5 MIN", "What makes money, money", and a big green "Continue ▶" button.

3. Daily streak card: a circular progress ring "3/5 min", "🔥 5 days and rolling", a small shield chip "🛡️ 1/2", and one line of encouragement.

4. "FOR YOU TODAY": a horizontal carousel of illustrated cards, 85% width, with the next card peeking in and page dots below. Each card has a bold gradient, a 3D clay building on the right, a title, two lines of text and a pill CTA. Show 3:
   - Green: "📚 3 reviews due / Two quick minutes so yesterday's ideas stick" with CTA "Review now".
   - Purple: "🧠 New: Quiz Battle! / Quiz yourself or take on a friend 1v1" with CTA "Play Quiz Battle".
   - Gold: "💰 Dividend Day is here / Your weekly reward is ready" with CTA "Claim reward".

5. QUICK RUN banner:
   - A cinematic mini scene of an endless-runner road at sunset: Kip the tortoise jogging away from The Melt (a cute purple fog monster) with gold coins ahead.
   - Text on the left: badge "⚡ QUICK RUN · 2 MIN", title "Outrun The Melt", "One run counts as today's Knowledge SIP", "🏅 Your best: 142".
   - A green "Play ▶" button.

6. A compact "Your plan" card: goal emoji, "My own bike by 25", a progress bar, "Price today ₹90,000".

7. Bottom tab bar: Home, Trophies, a raised round centre button with Kip's face labelled "Campus", League, You.

Make it feel alive and rewarding: depth, light, and clear visual hierarchy. One obvious main action per card. No stock-photo people, no dense text, no dark mode.
```

**Follow-ups (one at a time):**
- `Make 2 more variations of the World hero card only: one where the lessons are stepping stones on a winding path through the town, one where the town is a small diorama and Kip stands at the current building.`
- `Make a variation of the For-you carousel where each card is a tall "story" card (60% width) with the illustration on top and the CTA at the bottom.`
- `Show the Home screen for a player in World 2 "Snow Dome": a snowy 3D dome building, a cool blue sky, 6 lesson stops (3 done).`

**Send back:** export the screens you like to Figma (or download the PNGs into `design/stitch/`) and tell me which one to build.
