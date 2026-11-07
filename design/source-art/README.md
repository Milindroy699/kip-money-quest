# Source art: drop your original files here

Put the **original, full-quality** files from Veo and Nano Banana in these folders. They are not bundled into the app. I'll convert them into small, optimised versions under `assets/`, which the app loads.

| Folder | What goes here | Example file names |
|---|---|---|
| `characters/kip/` | Kip's character sheet, neutral stills and every Veo clip | `kip_sheet.png`, `kip_front.png`, `kip_back.png`, `kip_idle.mp4`, `kip_cheer.mp4`, `kip_run_back.mp4` |
| `characters/dash/` | Dash's sheet, stills and clips | `dash_sheet.png`, `dash_idle.mp4`, `dash_hot_tip.mp4` |
| `characters/the-melt/` | The Melt's stills and clips | `melt_sheet.png`, `melt_idle.mp4`, `melt_chase.mp4` |
| `mentors/` | Product mentor card art | `mentor_bondi.png`, `mentor_goldie.png` |
| `backgrounds/` | App backgrounds from Nano Banana | `bg_money_town.png`, `bg_the_melt.png`, `bg_snowball_valley.png` |
| `props/` | Runner props and coin | `prop_coin.png`, `prop_invest_gate.png`, `prop_fee_toll.png` |
| `Campus/` | Campus and Quest Island map art (buildings, tiles, decorations, badges, Kip's map walks) | See [docs/prompts/campus-art.md](../../docs/prompts/campus-art.md) |

**Rules that make processing easy:**
- Use the file names from [docs/prompts/veo-characters.md](../../docs/prompts/veo-characters.md) and [docs/prompts/stitch-final-prompts.md](../../docs/prompts/stitch-final-prompts.md).
- Keep the solid backgrounds you generated on: magenta for Kip and props, pure green for Dash and The Melt. Don't remove them yourself.
- Videos: MP4 straight from Veo. Images: PNG or JPG at full size.
- If the files are very large, a shared Google Drive folder works too. Your disk filled up once already.

**What I do with them:** cut out the backgrounds, trim the clips into sprite frames, compress everything, and wire them into `src/mascot/Character.tsx`, the runner and the screens.

## Processing pipeline (already run on the files you added)

`scripts/process_art.py` turns these originals into the app's art in `assets/`:

| Output | What it is |
|---|---|
| `assets/characters/kip_*.webp` | Kip: 4 body views (front, three-quarter, side, back), 6 expressions, full body |
| `assets/characters/kip_wave/` | 37-frame waving animation cut from `kip_wave.mp4` |
| `assets/characters/kip_run/` | 18-frame run cycle (one full stride) cut from `kip_run_back.mp4`, keyed off magenta, sparkles removed |
| `assets/characters/dash_*.webp` | Dash: 4 views, 6 expressions |
| `assets/characters/dash_run/` | 15-frame run cycle seen from behind (`Dash_run_loop.mp4`), for his Hot Tip cameo in Kip Run |
| `assets/characters/dash_talk/` | Talking loop for lesson stories (`Dash_talking.mp4`) |
| `assets/characters/dash_excited/`, `dash_sheepish/`, `dash_panicked/` | One-shot reactions for his cheer, think and worry moods |
| `assets/characters/melt_chase/` | The Melt chasing, calm to tendrils out; the runner picks frames by how close it is (`Melt_chase_loop.mp4`) |
| `assets/characters/melt_talk/` | Chuckling loop for lesson stories, cropped from `Melt_chuckling.mp4` |
| `assets/characters/melt_laugh/` | One-shot laugh for the "caught" screen (`Melt_laugh_one_shot.mp4`) |
| `assets/characters/melt_*.webp` | The Melt: drifting, reaching, laughing |
| `assets/props/*.webp` | Every runner prop, both variants |
| `assets/mentors/*.webp` | Every mentor, both variants |
| `assets/backgrounds/*.jpg` | Compressed backgrounds |

Background removal uses the open-source ISNet model through `rembg`. Re-run it after adding or replacing art:

```bash
python3 -m venv .venv-art && .venv-art/bin/pip install "rembg[cpu]" scipy
.venv-art/bin/python scripts/process_art.py "$PWD"
WAVE_DIR=/path/to/extracted/frames .venv-art/bin/python scripts/process_art.py "$PWD"   # wave animation
```

Which variant the app uses for each prop, mentor and background is set in `src/art/index.ts`.

The green-screen clips for Dash and The Melt go through `scripts/process_anims.py`, which needs only ffmpeg, numpy, scipy and Pillow. Its `CLIPS` table sets each clip's frame range, crop, size and loop. It writes the frame folders above and the registry `src/art/anims.ts`:

```bash
python3 scripts/process_anims.py /tmp/anim-frames              # all clips
ONLY=melt_talk python3 scripts/process_anims.py /tmp/anim-frames   # just one
```

### Campus map art (`Campus/`)

The pieces from [docs/prompts/campus-art.md](../../docs/prompts/campus-art.md) live in `Campus/`, all on a magenta background. `scripts/process_campus.py` cuts them into `assets/campus/` and writes the registry `src/campus/sprites.ts`:

| Output | From |
|---|---|
| `assets/campus/<campus or island>/<place>.webp` and `<place>_locked.webp` | The building sprites (B1). A missing `_locked` file is made by greying the open one |
| `assets/campus/<look>/deco_*.webp` | The two decoration sheets (B3), six objects each |
| `assets/campus/<look>/hero_badge.webp` | `hero_badge_campus.jpg` and `Kip_badge1.jpg` (A6) |
| `assets/campus/tile_*.jpg` | The ground tiles (B2), made seamless |
| `assets/backgrounds/bg_home_*.jpg` | `Market_style.jpg` (campus) and `bg_home_island.jpg` (A5) |

Kip's map walks (`kip_walk_up/down/side.mp4`, `kip_map_idle.mp4`) and the ambient loops (`fx_flag_flutter`, `fx_fountain`, `fx_seagulls`) are cut by `scripts/process_anims.py` into `assets/characters/kip_map_*` and `assets/characters/fx_*`. Veo framed the first ~3 seconds of each clip as a square with black bars and then zoomed in, so only that steady stretch is used. Both scripts share the magenta keyer in `scripts/keying.py`. It judges pixels by how magenta they are, so purple art (the Melt pool, the fog) survives, and it removes the Gemini/Veo sparkle.

```bash
python3 -m venv .venv-art && .venv-art/bin/pip install numpy scipy pillow   # plus ffmpeg for the clips
.venv-art/bin/python scripts/process_campus.py                               # everything (about 5 minutes)
ONLY=buildings PLACES=w1,w9 .venv-art/bin/python scripts/process_campus.py   # just some buildings
ONLY=kip_map_up,kip_map_down,kip_map_side,kip_map_idle,fx_flag,fx_fountain,fx_seagulls .venv-art/bin/python scripts/process_anims.py /tmp/anim-frames
```

### Card and trophy art (`cards/`, `trophies/`)

`scripts/process_collectibles.py` cuts these into `assets/cards/` and `assets/trophies/`, plus the Trophies-tab backdrop `assets/backgrounds/bg_trophy_room.jpg`, and writes `src/art/cards.ts` and `src/art/trophies.ts`. Prompts: [docs/prompts/cards-and-trophies.md](../../docs/prompts/cards-and-trophies.md). Several trophy files show a different trophy than their name, so `TROPHY_FILES` in the script maps each trophy to the right file. Melt Fighter and Risk Ranger have no picture yet and show their emoji.

```bash
.venv-art/bin/python scripts/process_collectibles.py
```

`_not-game-art/` holds a screen recording that was dropped in here by mistake. It isn't used.
