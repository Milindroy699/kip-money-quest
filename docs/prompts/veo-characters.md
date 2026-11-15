# Character and game-art prompts (Google Veo + a Google image model)

Use these to make Kip, Dash, The Melt, the product mentors and the runner props. When you share the files back, they replace the placeholder art in the app (see "Hand-off spec" at the end).

## Recommended workflow

1. **Lock each character with a still first.** Generate a **character sheet** (front, three-quarter, side, back) with Google's image model (Gemini image / Imagen / "Nano Banana"), using the *Character sheet* prompts below. Pick the best one.
2. **Animate with Veo using that still as the reference image** ("ingredients to video" or first-frame mode). This keeps Kip looking like the same Kip in every clip.
3. **Make loops loop.** For idle and run cycles, use the **same image as first frame and last frame** (Veo 3.1 supports first and last frame), so the clip loops seamlessly.
4. **One action per clip,** 4–8 seconds, static camera, solid flat background. That way I can cut the character out and build sprite animations.

**Background colour per character.** The background must be a colour the character doesn't contain, or keying it out erases part of the character:

| Character or prop | Background | Why |
|---|---|---|
| Kip and runner props | Magenta `#FF00FF` | Kip is green, so a green screen would eat his skin |
| Dash | Green `#00FF00` | Dash is orange and cream |
| The Melt | Green `#00FF00` | Purple fog has almost no green, so it keys cleanly, soft edges included. Black loses the dark purple edges |

## Animation shopping list: Dash and The Melt (round 2, ✅ all six in the game, 1 Nov 2026)

The same pipeline as Kip's run: one action per clip, a solid key-colour background, and the same still as the first and last frame for loops. Make them in this order, because the first two show up in every run.

| # | File name | Where it appears in the game | Type |
|---|---|---|---|
| 1 | `melt_chase.mp4` | Kip Run: The Melt surging after Kip at the bottom of the screen, in every run | Loop |
| 2 | `dash_run_back.mp4` | Kip Run: **new Dash cameo**. He sprints past Kip in a side lane and drops HOT TIP traps | Loop |
| 3 | `dash_talk.mp4` | Lesson stories: whenever Dash speaks (most lessons start with him) | Loop |
| 4 | `melt_talk.mp4` | Lesson stories: "Hehehe, I'm The Melt", plus the inflation widgets | Loop |
| 5 | `melt_laugh.mp4` | "The Melt caught you!" results screen | One-shot |
| 6 | `dash_reactions.mp4` (or three clips) | Lesson moments: excited (hot tip), sheepish (oops), panicked (crash) | One-shots |

For each loop, first make a **still** in Nano Banana on the key colour. Then use it as **both the first and last frame** in Veo's Frames to Video.

### 1. The Melt: chase loop (green)
**Still (Nano Banana):**
```
[STYLE BLOCK] The Melt from the character sheet: a soft, glowing purple fog creature with sleepy half-closed eyes and a wobbly cheeky grin, front view, wispy fog tendrils reaching forward toward the viewer, full body centred, filling about 60% of the frame. Solid pure green (#00FF00) background, evenly lit, no shadow, no ground, no text.
```
**Veo:**
```
[STYLE BLOCK] Using the reference image of The Melt, a soft purple fog creature: it chases toward the camera on the spot in a looping surge, billowing and churning like rolling fog, wispy tendrils reaching out and curling back, eyes narrowing with a cheeky grin, a few tiny gold coins swirling at its edges. It stays centred in the frame with no forward movement. Static locked-off camera. Solid pure green (#00FF00) background, evenly lit, no shadows, no ground, no text. Seamless loop: the last frame matches the first. Audio: none.
```

### 2. Dash: run cycle from behind (green)
**Still (Nano Banana):**
```
[STYLE BLOCK] Dash the orange hare from the character sheet, seen from directly behind, mid-stride running pose, long ears up, sunglasses on his head, phone in one hand, teal hoodie, red sneakers, full body centred, filling about 60% of the frame. Solid pure green (#00FF00) background, no shadow, no ground, no text.
```
**Veo:**
```
[STYLE BLOCK] Using the reference image of Dash the orange hare seen from directly behind: Dash sprints on the spot like on a treadmill, a fast, bouncy, slightly reckless running cycle. His long ears stream back and flop with each stride, his arms pump with the phone in one hand, and his sneakers clearly alternate left and right. About 4 strides per second, faster than Kip. He stays in the same spot in the centre of the frame, with no forward movement. Static locked-off camera at hip height, directly behind him. Solid pure green (#00FF00) background, evenly lit, no ground, no shadow, no props, no text. Seamless loop: the last frame matches the first. Audio: none.
```

### 3. Dash: talking loop (green)
```
[STYLE BLOCK] Using the reference image of Dash: chest-up close-up, facing the camera, Dash talks excitedly, mouth moving as if speaking quickly, eyebrows bouncing, ears twitching, waving his phone in one hand for emphasis. Static camera. Solid pure green (#00FF00) background, evenly lit, no text. Seamless loop: the last frame matches the first. Audio: none.
```

### 4. The Melt: talking / chuckling loop (green)
```
[STYLE BLOCK] Using the reference image of The Melt: it drifts gently in place, blinks slowly, and chuckles ("hehehe") with its wobbly mouth, fog edges curling. Friendly-mischievous, not scary. Static camera. Solid pure green (#00FF00) background, evenly lit, no text. Seamless loop: the last frame matches the first. Audio: none.
```

### 5. The Melt: laugh, one-shot (green)
```
[STYLE BLOCK] Using the reference image of The Melt: it puffs up and laughs with its eyes squeezed shut, fog billowing outward, while three small gold coins swirl into it and shrink. Then it settles back to its sleepy grin. Static camera. Solid pure green (#00FF00) background, evenly lit, no text. 4 seconds. Audio: none.
```

### 6. Dash: reactions, one-shots (green)
Make each as a separate 4-second clip, chest-up, facing the camera, starting and ending in a neutral pose:
- `dash_excited`: gasps at his phone, ears shoot straight up, points at the screen.
- `dash_sheepish`: realises the tip was bad, ears droop, rubs the back of his head with an awkward grin.
- `dash_panicked`: sees prices crash, ears flap, frantically taps the phone, then freezes.

**Delivery:** MP4 straight from Veo, 1280 × 720 or larger, 24–30 fps. Keep the whole character inside the frame with nothing cropped. Put the files in `design/source-art/characters/dash/` and `design/source-art/characters/the-melt/`.

## Global style block (paste at the start of every prompt)

> **Style A (recommended): stylised 3D.** Premium stylised 3D character for a mobile learning game, soft clay-like materials, rounded friendly shapes, big expressive eyes, gentle subsurface glow, Pixar-meets-Duolingo charm, clean silhouette, bright saturated colours, soft studio key light from upper left, subtle rim light, no harsh shadows.

> **Style B: flat 2D.** Flat 2D vector cartoon character for a mobile learning game, thick rounded dark-navy outlines (#1E2A3A), flat fills with one soft shade tone, big expressive eyes, bright saturated colours, clean silhouette, no gradients, no texture.

Add this to **every animation clip**:

> Solid pure [BACKGROUND] background, evenly lit, no shadows or reflections on the background, no props, no text, no logos. Static locked-off camera, full body centred, character fills about 70% of the frame height, feet visible. 1:1 framing safe zone inside a 9:16 frame. Audio: no music, no dialogue, soft subtle foley only.

Replace `[BACKGROUND]` using the table above: `magenta (#FF00FF)` for Kip and props, `chroma-green (#00FF00)` for Dash, `black (#000000)` for The Melt.

**Colour palette (keep consistent):**

| Use | Name | Hex |
|---|---|---|
| Kip skin | Kip green | `#2DBE7E` |
| Kip shell | Shell honey | `#F2B544` |
| Outlines and text | Ink navy | `#1E2A3A` |
| Background | Cream | `#FFF8EC` |
| The Melt | Melt purple | `#8B5CF6` |
| Dash | Dash orange | `#FF8A3D` |
| Coins | Coin gold | `#FFC83D` |

---

## 1. Kip the Tortoise (mascot and teacher)

### Character sheet (image model)
```
[STYLE BLOCK]
Character turnaround sheet of "Kip", a young, friendly tortoise who is a patient, witty teacher of money and investing for teenagers. Kip is about 2.5 heads tall, chibi proportions, standing upright on two stubby legs.
Skin: soft mint-green (#2DBE7E). Shell: rounded dome in warm honey-gold (#F2B544) with hexagon scutes outlined in a darker amber, and three thin, faintly glowing concentric growth rings on the shell.
Face: big warm brown eyes behind OVERSIZED ROUND GLASSES with thick dark-navy frames, slightly smug-kind smile, small rosy cheeks.
Accessories: a small teal backpack with a gold coin keyring.
Show four views in a row: front, three-quarter, side profile, back. Plus a row of 6 facial expressions: happy, talking, thinking (finger on chin), worried, cheering, sleepy.
Plain cream background (#FFF8EC), even lighting, labels under each view.
```

### Animation clips (Veo, with the chosen sheet as reference)
Prefix each with `[STYLE BLOCK] Using the reference image of Kip the tortoise with round glasses and honey-gold shell,` and suffix with the animation suffix above.

| File name | Prompt (action) | Loop? |
|---|---|---|
| `kip_idle` | Kip stands relaxed, breathes gently, blinks twice, pushes glasses up the nose with one finger, small happy sway. | Yes (same first and last frame) |
| `kip_wave_hello` | Kip waves enthusiastically at the camera with one hand, big smile, little hop on the spot, then settles back to a friendly pose. | No |
| `kip_talk` | Kip talks to the camera as a friendly teacher, mouth moving naturally, gesturing with one open hand, eyebrows expressive, occasional nod. | Yes |
| `kip_think` | Kip taps chin thoughtfully, eyes look up and to the side, glasses glint once, then a small "aha" smile. | No |
| `kip_cheer` | Kip throws both arms up and jumps with joy, shell bouncing, eyes squeezed happily shut, then lands. | No |
| `kip_celebrate` | Kip does a happy little dance, spins once, the growth rings on the shell glow brighter gold, small sparkles pop around the shell. | No |
| `kip_worry` | Kip looks concerned, hands together, eyebrows tilted up, glances to the side as if seeing something bad coming, slight lean back. | No |
| `kip_facepalm` | Kip gently facepalms with one hand, shakes head with a small amused smile (kind, not mocking). | No |
| `kip_sleepy` | Kip yawns, glasses slide down the nose, eyes droop, starts to nod off, then a little startled wake-up. | No |
| `kip_shell_ring_grow` | Close-up of Kip's shell from behind. A new thin golden ring glows into existence and pulses gently. | No |
| `kip_run_back` | View from directly behind Kip as Kip runs away from camera on the spot (treadmill-style run cycle), arms pumping, backpack bouncing. | Yes |
| `kip_jump_back` | View from behind. Kip leaps upward with arms raised and lands back into the run. | No |
| `kip_slide_back` | View from behind. Kip tucks into the shell and slides forward like a puck, then pops back out running. | No |

### Kip Run: the run cycle (✅ done, 1 Nov 2026: in the game from `kip_run_back.mp4`)
The runner currently fakes running by moving the whole still image. A real run cycle, with legs moving, makes the biggest difference.

**Option A: Veo (recommended).** Use Frames to Video, with Kip's back-view still on magenta as both the **first and last frame**:
```
[STYLE BLOCK] Using the reference image of Kip the tortoise seen from directly behind: Kip jogs on the spot like on a treadmill, a steady, happy running cycle seen from behind. His stubby legs clearly alternate left and right with knees lifting, his arms pump, his teal backpack bounces slightly, and his shell sways gently side to side with each stride. He does NOT hop or jump: his feet stay close to the ground. An even rhythm of about 3 strides per second. He stays in the same spot in the centre of the frame, with no forward movement and no camera movement. Static locked-off camera at hip height, directly behind him. Solid pure magenta (#FF00FF) background, evenly lit, no ground, no shadow, no props, no text. Seamless loop: the last frame matches the first. Audio: none.
```

**Option B: Nano Banana sprite sheet.** This is a quicker fallback:
```
[STYLE BLOCK] A run-cycle sprite sheet: 8 frames in one row, evenly spaced, of Kip the tortoise seen from directly behind, jogging in place. His legs alternate left and right through a full stride (contact, down, passing, up for each leg). Same size and same position in every frame, with no hopping. Solid pure magenta (#FF00FF) background, no shadow, no text.
```

**What I'll do with it:**
1. Cut out one clean stride: about 8–12 frames from the video, or the 8 sheet frames.
2. Remove the magenta background.
3. Play the frames in time with Kip's running speed, so he runs faster as the run speeds up.

Name the file `kip_run_back.mp4` or `kip_run_sheet.png` and put it in `design/source-art/characters/kip/`.

---

## 2. Dash the Hare (the lovable foil)

### Character sheet (image model)
```
[STYLE BLOCK]
Character turnaround sheet of "Dash", a fast, funny, impatient young hare who chases hot tips and quick money. Lovable, never villainous. Slim, energetic, about 3 heads tall, long expressive ears.
Fur: warm orange (#FF8A3D) with a cream belly and muzzle. Sunglasses pushed up on the forehead, bright sneakers, a hoodie with a lightning-bolt patch, always holding a smartphone.
Show front, three-quarter, side, back. Plus 6 expressions: excited, smug, shocked, sheepish, panicked, thoughtful.
Plain cream background (#FFF8EC), even lighting, labels under each view.
```

### Animation clips (Veo)
| File name | Prompt (action) | Loop? |
|---|---|---|
| `dash_idle` | Dash taps their foot impatiently, scrolls the phone, ears twitch. | Yes |
| `dash_hot_tip` | Dash gasps at the phone screen, eyes go wide, ears shoot straight up, then points at the phone excitedly at the camera. | No |
| `dash_oops` | Dash looks at the phone, the excitement drains, ears droop, sheepish grin, rubs the back of the head. | No |
| `dash_panic` | Dash panics, ears flapping, frantically tapping the phone, then freezes, shocked. | No |
| `dash_learns` | Dash puts the phone away, nods slowly, gives a thumbs-up and a genuine smile (redemption-arc moment). | No |
| `dash_run_side` | Side view of Dash sprinting in place, super fast run cycle, ears streaming back. | Yes |

---

## 3. The Melt (inflation)

### Concept still (image model)
```
[STYLE BLOCK]
"The Melt", a living cloud of drifting purple fog (#8B5CF6) that represents inflation in a kids' money game. Soft, swirly, semi-transparent edges, two sleepy oval eyes and a wobbly, mischievous smile. Not scary: relentless and a bit cheeky. Tiny gold coins near its edges are shrinking and fading as they touch the fog.
Show 3 poses: drifting, reaching forward, laughing. Plain dark-navy background (#1E2A3A) so the fog edges are visible.
```

### Animation clips (Veo)
| File name | Prompt (action) | Loop? |
|---|---|---|
| `melt_idle` | The purple fog creature swirls and drifts gently in place, eyes blinking slowly, edges curling like smoke. | Yes |
| `melt_chase` | The fog surges forward toward the camera like a rolling wave, eyes narrowed playfully, edges streaming. | Yes |
| `melt_shrink_coin` | A shiny gold coin floats in front of the fog. The fog wraps around it and the coin shrinks to half its size and dulls. | No |

For The Melt, use a **solid black background**, because the fog is semi-transparent. I'll key it with a luminance matte.

---

## 4. Product mentors (still card art, image model)
Use the Style block, then one prompt per mentor. Format: **portrait card art, 3:4, character from the waist up, cream background with a soft radial glow in the accent colour.**

| File name | Prompt |
|---|---|
| `mentor_bondi` | Bondi, a calm, reliable elephant wearing a small bow tie and holding a rolled-up certificate with a ribbon (a bond). Accent colour steel blue. |
| `mentor_goldie` | Goldie, a clever magpie with a tiny gold monocle, perched on a stack of gold bars, proud but wise. Accent colour gold. |
| `mentor_rita` | Rita, a builder beaver in a hard hat, holding blueprints, standing in front of a tiny apartment building. Accent colour terracotta. |
| `mentor_vee` | Vee, a bold, patient fox in a startup hoodie, holding a small rocket model, looking at the horizon. Accent colour magenta. |
| `mentor_fizz` | Fizz, a brilliant octopus wearing safety goggles, each tentacle holding a different contract card with arrows and charts, slightly chaotic. Accent colour teal. |

---

## Risk Ridge background (done 2 Nov 2026)
**Nano Banana, 16:9 and 9:16:**
```
[STYLE BLOCK] A wide mountain ridge at golden hour, seen from a winding path. Three trails split ahead: on the left a gentle green trail with a railing and small flags, in the middle an amber trail with a few switchbacks, on the right a steep red rocky trail along a cliff edge with dramatic drops. Soft clouds, warm light, playful 3D toy style matching Money Town and Snowball Valley. No characters, no text. Leave the lower third calm and uncluttered for UI.
```
Save as `design/source-art/backgrounds/bg_risk_ridge.png`. I'll wire it in as World 3's backdrop and the Risk Lanes sky.

## Worlds 5–9 backgrounds (done 2 Nov 2026)
Same style block as Risk Ridge. **Nano Banana, 9:16** (16:9 optional). No characters, no readable text, and keep the lower third calm for UI.

| File name | Stand-in now | Prompt |
|---|---|---|
| `bg_portfolio_fort` | Card Vault (dark) | `[STYLE BLOCK] A friendly toy-like stone fort on a hill at dusk, five different towers on its walls: a tall green glass tower, a sturdy blue stone wall, a small gold keep, a red brick gate and a glowing shield dome. Purple fog curls at the foot of the hill. Warm lantern light, dramatic but cosy.` |
| `bg_three_doors` | Night Market 2 (dark) | `[STYLE BLOCK] A grand hallway at night with three tall doors side by side: the left door has a balance-scale emblem, the middle a dice emblem, the right a shield emblem. Soft spotlights on each door, polished floor reflections, mysterious and inviting.` |
| `bg_time_tracks` (done) | Money Town 2 (light) | `[STYLE BLOCK] Four parallel train tracks stretching to the horizon at sunset, each with a different train: a tiny fast sparking cart, a commuter tram, a night train, and a slow scenic steam train among trees. A big friendly clock tower in the distance.` |
| `bg_analyst_hq` | Card Vault (dark) | `[STYLE BLOCK] A cosy detective-style analyst office at night: a desk with case files and a magnifying glass, a corkboard with charts and candlestick graphs pinned up, a green desk lamp, city lights through a big window.` |
| `bg_future_you` | Future City (light) | `[STYLE BLOCK] A bright future city skyline at sunrise seen from a hill path, with a launch pad and a small rocket in the distance, parks, solar roofs and a winding road leading towards it. Hopeful and warm.` |

Save them in `design/source-art/backgrounds/`. I'll swap them into `WORLD_BACKGROUND` in `src/art/index.ts`, and set `dark` for each.

## 5. Runner world and props (image model; Veo for loops)
Props should be **single objects, centred, front view, on solid magenta (#FF00FF)**, so each can be a sprite.

| File name | Prompt |
|---|---|
| `prop_coin` | A chunky, shiny gold coin (#FFC83D) with a small embossed tortoise-shell hexagon in the centre, slight bevel. Also a 6-frame spin. |
| `prop_invest_gate` | A glowing green archway gate with a rising arrow icon on top and the word "INVEST", friendly and inviting. |
| `prop_sip_gate` | A teal archway with a calendar-and-coin icon and the word "SIP". |
| `prop_impulse_billboard` | A flashy red billboard on two poles, raised high enough to slide under, with "SALE! BUY NOW!" in bold, blinking lights. |
| `prop_hot_tip_trap` | A cheeky orange banana-peel-like trap with a sign reading "HOT TIP 🔥", left by Dash. |
| `prop_fee_toll` | A small striped toll barrier, waist-high, with a sign reading "FEE", to be jumped over. |
| `prop_cash_out_ramp` | A tempting golden ramp with a sign reading "CASH OUT +15", sparkly. |
| `bg_snowball_valley` (Veo, loop) | Endless-runner view looking down a 3-lane road that recedes to the horizon through snowy rolling hills, a giant snowball silhouette on a distant hill, soft morning light, camera moving steadily forward. Seamless loop, no characters. |
| `bg_money_town` (Veo, loop) | Endless-runner view down a 3-lane road through a cheerful Indian-inspired market town (chai stall, auto-rickshaw, colourful shopfronts), camera moving steadily forward, warm afternoon light. Seamless loop, no characters, no readable text. |

---

## Hand-off spec (what to send back)

| Item | Format | Size | Notes |
|---|---|---|---|
| Character sheets | PNG | ≥ 2048 px wide | The chosen version of each |
| Animation clips | MP4 (H.264) straight from Veo | 1080 × 1920 or 1080 × 1080 | Solid magenta (Kip), green (Dash) or black (The Melt) background, 24–30 fps |
| Props and mentors | PNG, transparent if possible, otherwise magenta | ≥ 1024 px | One object per file |
| Naming | Use the file names in the tables above | — | e.g. `kip_idle.mp4`, `prop_coin.png` |

Put everything in `assets/characters/` and `assets/props/` in the project folder, or share a Drive folder. I'll:
1. Key out the background colour with ffmpeg and export trimmed sprite frames (transparent WebP/PNG).
2. Wire them into the `Character` component, which already switches by name and mood. Phase 1 uses vector placeholders.
3. Optionally rebuild Kip in Rive using your frames as reference, for smaller files and interactive eye tracking.
