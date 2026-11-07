# Campus and Quest Island art prompts (Nano Banana for stills, Veo for motion)

The learning path (Worlds 1–9) becomes a map Kip walks around. It comes in two looks, which share one layout:

| Track | Map | Feel |
|---|---|---|
| Builder (16–19) | **Kip Campus** | An Indian university campus: red sandstone and brick, banyan trees, bicycles, a canteen, a clock tower |
| Explorer (13–15) | **Quest Island** | A treasure-map adventure island: a dock, cliffs, a harbour, a lighthouse |

The app places every building and draws the road itself, so the art comes in **pieces**:

- One sprite per building.
- Ground textures.
- Decorations.
- Kip's walk clips.

That way the art never needs to line up with exact coordinates. Use the whole-map prompts in Part A only to explore the look, then make the pieces in Part B.

**Workflow**
1. Run the **ideation** prompts in Part A. Pick a direction (time of day, materials, how busy it is).
2. Generate **one** building in Part B. When you like it, attach it as the **reference image** for every other building, and add "in exactly the same style, camera angle and lighting as the reference image". This keeps the set consistent.
3. Drop the files in `design/source-art/campus/` using the file names below. I'll cut them out, place them on the map, and swap out the stand-ins.

---

## Style block (paste at the start of every still)

> **[CAMPUS STYLE]** Playful stylised 3D toy diorama for a mobile learning game. Soft clay-like materials, rounded chunky shapes, slightly oversized friendly proportions, warm golden-hour light from the upper left, gentle bloom, soft ambient occlusion, tilt-shift miniature feel. Bright but soft colours: leafy greens, warm sandstone, terracotta, cream, teal and honey gold. Indian-inspired details. Matches the existing Money Town and Portfolio Fort art. No people, no readable text, no logos.

For Quest Island, swap the middle of the block for: *"…tropical adventure island, sandy paths, turquoise water, chunky palm trees, treasure-map charm…"*.

---

## Part A: Ideation (pick a direction)

### A1. Kip Campus: whole map (Builder)
**Nano Banana, 9:16** (also try 3:4):
```
[CAMPUS STYLE] A top-down three-quarter isometric map of a cheerful Indian university campus on a long vertical scroll, seen from above at about 35 degrees. A winding cream-brick footpath snakes from a grand sandstone MAIN GATE at the bottom up to a domed CONVOCATION HALL at the top. Along the path, alternating left and right, sit nine landmark buildings in order from bottom to top: a science lab with bubbling glass flasks on the roof and a melting purple goo sculpture (Melt Lab); a dome-shaped ice rink with a giant snowball on top (Snow Dome); a tall rock-climbing wall with three coloured routes, green, amber and red (Climbing Wall); a lively open-air bazaar with striped market stalls (Campus Bazaar); a small toy-like fort-style heritage building with five different towers (Fort Hall); a debate hall with three tall doors on its front (Debate Hall); a clock tower beside a running track (Clock Tower); a modern glass research block with chart screens in the windows (Analyst HQ); and the convocation hall at the top with a gold dome and flags. Side spots off the path: a sports ground with a running track, a library under a banyan tree, a small campus bank with a coin sign, a trading lab with a ticker screen, and a round duel arena. Lawns, neem and gulmohar trees, bicycles, benches, lamp posts, a chai canteen. No people, no readable text.
```
**Variants to try:** "at dusk with warm lamps glowing in the windows" · "monsoon morning, wet glistening paths, puddles, low clouds" · "festival day with marigold garlands and paper lanterns".

### A2. Quest Island: whole map (Explorer)
**Nano Banana, 9:16:**
```
[CAMPUS STYLE, tropical adventure island variant] A top-down three-quarter isometric treasure map of a playful adventure island on a long vertical scroll, seen from above at about 35 degrees, surrounded by turquoise sea. A sandy footpath with stepping stones winds from a wooden DOCK at the bottom up to a striped LIGHTHOUSE on a cliff at the top. Along the path, alternating left and right: a bubbling purple swamp with a mischievous fog cloud (Melt Marsh); a snowy peak with a giant snowball (Snowball Peak); three cliff trails, green, amber and red (Risk Ridge); a little harbour market with sailboats and stalls (Bazaar Harbour); a toy stone fort on a rock (Fort Rock); a cave with three carved doors (Three Doors Cave); a waterfall with a giant clock wheel (Clockwork Falls); a domed observatory with a telescope (Observatory). Side spots: a beach race track, a treehouse library, a treasure cove with a chest of coins, a tiny market stall with a chalkboard, and a sandy duel arena ring. Palm trees, rope bridges, rocks, seagulls. No people, no readable text.
```

### A3. Alternative Explorer look: Kip's Theme Park
In case the island feels too young or too similar to other games:
```
[CAMPUS STYLE] A top-down three-quarter isometric map of a friendly money-themed theme park on a long vertical scroll. A path winds from a ticket gate at the bottom to a giant Ferris wheel at the top. Rides along the path: a purple fog ghost-train (The Melt), a snowball roller coaster (Snowball), a three-track climbing tower (Risk), a market midway with game stalls (Bazaar), a toy castle (Fort), a hall of three doors (Three Doors), a clock carousel (Time), a planetarium (Analyst), and the Ferris wheel (Future You). Bunting, popcorn stands, balloons. No people, no readable text.
```

### A4. Fly-through for pitching and mood (Veo, optional)
Use the A1 or A2 image you like as the **first frame**:
```
A slow drone fly-through over the campus in the reference image, starting at the main gate and gliding up along the winding path past each building to the domed hall at the top. Gentle parallax, birds crossing, leaves swaying, warm golden-hour light. Toy diorama tilt-shift look. 8 seconds. No people. Audio: soft ambient birdsong.
```

### A5. Home screen backdrop: Money Town hub
The landing page keeps Money Town (World 0). This backdrop links it to the campus: the road out of town leads up to the gate on a hill.
**Nano Banana, 9:16:**
```
[CAMPUS STYLE] A cosy Indian-inspired market-town square at morning: a chai stall, an auto-rickshaw, colourful shopfronts, a small bank with a coin sign, bunting and kites. A road leaves the square and climbs a green hill to a grand sandstone campus gate in the distance, with the domes and clock tower of a university peeking over the trees. Keep the bottom two-thirds simple and calm (soft sky and plain ground) so cards can sit on top. No people, no readable text.
```
Make an Explorer version with *"…climbs to a wooden dock and an island with a lighthouse across the water"*. Save the two as `bg_home_campus.png` and `bg_home_island.png`.

### A6. Hero button badge (the big centre button in the bottom bar)
**Nano Banana, 1:1:**
```
[CAMPUS STYLE] A round game badge icon: Kip the tortoise (green skin, round glasses, honey-gold shell, teal backpack) from the reference image, chest-up and smiling, wearing a tiny graduation cap, inside a chunky honey-gold ring with a soft inner glow. Centred, fills 90% of the frame. Solid pure magenta (#FF00FF) background. No text.
```
Make an Explorer version with *"wearing a little explorer hat with a feather"*. Save the two as `hero_badge_campus.png` and `hero_badge_island.png`.

---

## Part B: Production pieces (these go into the app)

### B1. Buildings: one sprite each
**Nano Banana, 1:1. These rules apply to every building:**
- Isometric three-quarter view from the front-left, looking down about 35 degrees. Use the same camera for every building.
- The building sits on its own small round island of grass (sand for Quest Island), about 20% wider than the building, so it looks right on any ground.
- It is centred and fills about 75% of the frame.
- Solid pure magenta (#FF00FF) background, evenly lit, with no shadow on the background.
- No pink or magenta anywhere in the building, because magenta is the key colour.
- No people, no readable text, no logos.

Prompt template:
```
[CAMPUS STYLE] A single [BUILDING], isometric three-quarter view from the front-left looking down at 35 degrees, standing on its own small round grassy base, centred, filling 75% of the frame. Solid pure magenta (#FF00FF) background, evenly lit, no background shadow, no pink or magenta in the building, no people, no readable text.
```

**Kip Campus (Builder)**

| File name | World / spot | [BUILDING] |
|---|---|---|
| `campus_gate` | Entrance | a grand red-sandstone university gateway arch with two small chhatri domes and an open iron gate |
| `campus_w1_melt_lab` | W1 The Melt | a cheerful science-lab block with bubbling glass flasks on the roof and a lilac fog curling out of one window |
| `campus_w2_snow_dome` | W2 Snowball Valley | a round ice-rink dome with a giant rolling snowball sculpture on top and frosty edges |
| `campus_w3_climbing_wall` | W3 Risk Ridge | a tall outdoor climbing wall with three routes (gentle green, medium amber, steep red) and a safety mat |
| `campus_w4_bazaar` | W4 Product Bazaar | an open-air campus bazaar with four striped stalls under one canopy: bonds, shares, gold and a mini building |
| `campus_w5_fort_hall` | W5 Portfolio Fort | a toy heritage fort-style hall with five different towers: green glass, blue stone, gold, red brick, and a glowing shield dome |
| `campus_w6_debate_hall` | W6 Three Doors | a grand debate hall with three tall arched doors on its front, with scale, dice and shield emblems |
| `campus_w7_clock_tower` | W7 Time Tracks | a tall sandstone clock tower beside a short curved running track |
| `campus_w8_analyst_hq` | W8 Analyst HQ | a modern glass research block with glowing candlestick-chart screens in the windows and a rooftop telescope |
| `campus_w9_convocation` | W9 Future You | a grand convocation hall with a gold dome, flags and wide steps, with a small rocket statue in front |
| `campus_spot_track` | Kip Run | a small sports ground: an oval running track with three lanes and a tiny stand |
| `campus_spot_library` | Reviews | a cosy library pavilion under a big banyan tree, with stacked books on the steps |
| `campus_spot_bank` | Dividend Day | a small campus bank kiosk with a big gold coin emblem and a treasure-chest-shaped deposit box |
| `campus_spot_lab` | Practice Portfolio | a compact trading lab cabin with a ticker screen showing green and red arrows |
| `campus_spot_arena` | Market Duel | a small round arena with two facing podiums and card-shaped banners |

**Quest Island (Explorer)**: use the same template with "sandy base" instead of "grassy base".

| File name | [BUILDING] |
|---|---|
| `island_gate` | a wooden dock with a little boat and a welcome lantern post |
| `island_w1_melt_marsh` | a bubbling purple swamp pool with a mischievous fog cloud and reeds |
| `island_w2_snowball_peak` | a small snowy peak with a giant snowball perched on top |
| `island_w3_risk_ridge` | a rocky cliff with three trails (green gentle, amber medium, red steep) |
| `island_w4_harbour` | a tiny harbour market with two sailboats and striped stalls |
| `island_w5_fort_rock` | a toy stone fort on a rock with five different towers |
| `island_w6_doors_cave` | a cave in a boulder with three carved doors |
| `island_w7_clock_falls` | a little waterfall turning a giant wooden clock wheel |
| `island_w8_observatory` | a domed observatory with a brass telescope |
| `island_w9_lighthouse` | a striped red-and-white lighthouse on a cliff with a glowing lamp |
| `island_spot_track` | a beach race track marked with flags and buoys |
| `island_spot_library` | a treehouse library with a rope ladder |
| `island_spot_bank` | a treasure cove with an open chest of gold coins |
| `island_spot_lab` | a tiny market stall with a chalkboard and an up-arrow flag |
| `island_spot_arena` | a sandy duel ring with two tiki podiums |

**Locked state (optional, but nice).** For each building, also make a "construction" version:
```
…the same building in the reference image, but under construction: wooden scaffolding, a tarp, traffic cones and a small crane, same camera and lighting…
```
Name it with `_locked` (for example `campus_w5_fort_hall_locked`). Without it, I'll grey the building out and add a padlock.

### B2. Ground textures (seamless tiles)
**Nano Banana, 1:1.** The app tiles these and draws the road with them.
```
[CAMPUS STYLE] A seamless tileable top-down texture of [GROUND], evenly lit, no shadows from objects, no objects, no text. Edges must wrap seamlessly.
```
| File name | [GROUND] |
|---|---|
| `tile_campus_lawn` | a soft, neat green lawn with tiny clover and a few daisies |
| `tile_campus_path` | cream and terracotta brick paving in a herringbone pattern |
| `tile_island_grass` | tropical grass with scattered sand patches |
| `tile_island_sand` | warm golden sand with tiny shells |
| `tile_island_water` | shallow turquoise water with soft ripples |

### B3. Decorations (sprite sheets)
**Nano Banana, 16:9.** Each sheet has two rows of three separate objects, evenly spaced and not touching, on solid magenta (#FF00FF). Each object stands on a tiny grass disc.
- `deco_campus_sheet`: neem tree, gulmohar tree with orange flowers, banyan tree, lamp post, bench with a bicycle, chai cart.
- `deco_island_sheet`: palm tree, palm pair, mossy rock, wooden signpost (blank), rope-bridge segment, small campfire.

### B4. Kip walking around the map (Veo)
The runner cycle is filmed at hip height from behind. The map looks down from above, so Kip needs walks from that angle. Use the **Frames to Video** mode with a Nano Banana still of Kip from that angle as **both the first and last frame**, so the clip loops.

Suffix for every clip:
```
Kip walks on the spot like on a treadmill, with no forward movement. Static locked-off camera looking down at him from above at 35 degrees. Solid pure magenta (#FF00FF) background, evenly lit, no ground, no shadow, no props, no text. Seamless loop: the last frame matches the first. 4 seconds. Audio: none.
```
| File name | Prompt (put before the suffix) |
|---|---|
| `kip_walk_up` | Using the reference image of Kip the tortoise (round glasses, honey-gold shell, teal backpack), seen from behind and above: a cheerful, steady walking cycle, stubby legs alternating, arms swinging, backpack bouncing gently. |
| `kip_walk_down` | Using the reference image of Kip, seen from the front and above: a cheerful walking cycle towards the camera, smiling, legs alternating, arms swinging. |
| `kip_walk_side` | Using the reference image of Kip, seen from the side and above, facing right: a cheerful walking cycle, legs alternating, shell swaying gently. (I'll mirror it for walking left.) |
| `kip_map_idle` | Using the reference image of Kip, seen from the front and above: Kip stands, looks around curiously, adjusts his glasses and gives a small wave. |

### B5. Ambient touches (Veo, optional)
Loops on magenta, 4 seconds, static camera: `fx_flag_flutter` (a campus pennant flag waving), `fx_fountain` (a small round fountain), `fx_seagulls` (two gulls circling, for the island).

---

## Hand-off
- Put everything in `design/source-art/campus/` (videos too), using the file names above. PNG, 1024 px or larger. MP4 straight from Veo.
- **Start with these, in order:**
  1. A1 and A2 to pick the look.
  2. `campus_w1_melt_lab`, which becomes the style reference for the rest.
  3. The other campus buildings.
  4. The island set.
  5. The Kip walks.
- I'll then:
  - Cut out the sprites with `scripts/process_art.py`.
  - Make the tiles truly seamless.
  - Cut the walk loops with `scripts/process_anims.py`.
  - Swap the stand-ins in the campus map, so no layout work is needed on your side.

---

## Status (7 Nov 2026)

Everything from Part B is in the app, plus A5 and A6. Of the files in `design/source-art/Campus/`:

| File | Used as |
|---|---|
| All `campus_*` and `island_*` buildings and their `_locked` versions | Map sprites and building-sheet banners |
| `campus_w3_climbing_wall.jpg` | Climbing Wall. `campus_w3_climbing_wall2.jpg` isn't used, because the first matches its locked version |
| `Market_style.jpg` | The campus Home backdrop. `bg_home_campus.jpg` came out as an island scene, so it isn't used |
| `bg_home_island.jpg` | The island Home backdrop |
| `hero_badge_campus.jpg`, `Kip_badge1.jpg` | Hero buttons (graduation cap, explorer hat). `Kip_badge2.jpg` isn't used |
| `tile_*`, `deco_*_sheet`, `kip_walk_*`, `kip_map_idle` | Ground, scenery and Kip's map walks |
| The whole-map ideation images and `Drone_campus_flythrough.mp4` | Not in the app (Part A is for choosing a direction) |

**Added later the same day:**
- `island_w2_snowball_peak_locked` and `island_w3_risk_ridge_locked` replace the greyed stand-ins.
- A new `kip_walk_up` (straight back view, a one-second stride).
- The B5 loops:
  - **Pennant flags:** by the Main Gate or the Dock, and near the hall at the top.
  - **Fountains:** on the campus lawns.
  - **Gulls:** circling over the island's sea.

  Their spots are set in `src/campus/scenery.ts` (`AMBIENT`), and the tests keep them clear of buildings, the road and the trees.

Nothing from this list is missing now. Veo still opens every clip as a square with black side bars that widen over a few seconds. The cut-out script uses only the steady part and holds the fountain's slow zoom steady, so this needs no action.
