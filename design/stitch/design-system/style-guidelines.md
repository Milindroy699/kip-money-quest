# Midnight Arcade Fintech

Imported from Stitch project "Finlit project".

## Brand & Style

This design system manifests an electric, gamified midnight bazaar where personal finance meets immersive role-playing. It is crafted for digital natives, young investors, and casual gamers seeking financial empowerment without dry institutional austerity. 

The aesthetic is a hybrid of **Deep Glassmorphism** and **Tactile Arcade Skeuomorphism**:
- **Atmosphere:** Deep midnight environments illuminated by ambient cyan/indigo bioluminescent undercurrents.
- **Glass Infrastructure:** Analytical HUDs, cards, inventory bays, and navigational trays emerge as ultra-refined, frosted crystalline slabs suspended over dark celestial fields.
- **Tactile Game Pieces:** Critical interactables, currency tokens, and primary triggers break out of the glass plane entirely. They exist as physical, chunky, 3D clay-molded objects that demand physical touch and provide visceral mechanical feedback.
- **Character Integration:** The companion character—a resolute, forward-facing tortoise—is purposefully placed throughout layouts. The character's eyeline, posture, and shell orientation systematically point toward the ergonomic thumb zone and critical action buttons, directing user intent seamlessly.

## Layout & Spacing

The viewport architecture is mobile-first, designed for the native mobile profile (390px × 844px) and thumb-reach zones.

### Grid & Canvas Structure
- **Columns:** 4-column layout on mobile, expanding to 8 columns on tablet viewports and 12 columns on desktop dashboards.
- **Gutters:** `1rem` (16px) static gutter between internal layout cards.
- **Canvas Margins:** `1.25rem` (20px) horizontal margin on mobile, ensuring glass surfaces do not collide with native bezel borders.

### Thumb-Zone Ergonomics & The Companion Anchor
- **Lower Canvas Zone (Bottom 240px):** Dedicated primary operational space. Contains the main tactile button array, persistent navigation island, and quest triggers.
- **Tortoise Directional Anchor:** Positioned at `bottom: 110px; right: 16px` or dynamically anchored to active cards. The tortoise avatar’s gaze vector and arm gestures point downward-left directly toward the primary action button to direct motor focus.
- **Upper Canvas Zone:** Reserved for static balance readouts, ambient level metrics, and status HUD glass tiles.

## Elevation & Depth

Depth is established by contrasting passive frosted glass planes with chunky tactile objects that sit high above the interface plane.

### Elevation Hierarchy

1. **Layer 0 (Canvas Base):** Solid `#0F1724` with continuous animated radial color pockets (`#14B8A6` at 12% opacity, `#4338CA` at 18% opacity) hovering in deep perspective.
2. **Layer 1 (Passive Glass Panels):**
   - Background: `rgba(30, 42, 58, 0.55)`.
   - Backdrop Filter: `blur(28px) saturate(140%)`.
   - Stroke / Border: `1px solid rgba(255, 255, 255, 0.12)`.
   - Shadow: `0 12px 32px -4px rgba(7, 11, 18, 0.65)`.
3. **Layer 2 (Floating Glass Modals & HUD Trays):**
   - Background: `rgba(37, 52, 72, 0.70)`.
   - Backdrop Filter: `blur(36px) saturate(160%)`.
   - Stroke / Border: `1px solid rgba(255, 255, 255, 0.18)`.
   - Shadow: `0 20px 48px -8px rgba(4, 7, 12, 0.85), 0 0 1px 1px rgba(255, 255, 255, 0.08) inset`.
4. **Layer 3 (Tactile Arcade Elements - Buttons & Collectibles):**
   - Strictly 100% opaque solid fills. Never apply glassmorphism or backdrop blurs to interactive CTAs or currency tokens.
   - Cast a multi-tier physical shadow: an integrated 4px structural extrusion shelf, paired with an ambient drop glow tinted in the element's primary color (e.g., `0 8px 24px -2px rgba(56, 227, 153, 0.35)`).

## Components

### Chunky 3D Arcade Buttons
- **Rule of Solidity:** Buttons are strictly solid, high-saturation surfaces. Never use glass fills for primary or secondary actions.
- **Structure:** Constructed with a main top cap and a 4px darker bottom bevel edge simulating physical plastic depth.
  - *Primary (Kip Neon Green):* Top surface `#38E399`; bottom bevel edge `0 4px 0 0 #1EAC70`; drop shadow `0 8px 20px rgba(56, 227, 153, 0.28)`. Text: `#08291A` (Heavy Space Grotesk).
  - *Secondary (Luminous Honey):* Top surface `#FFC95C`; bottom bevel edge `0 4px 0 0 #DDA22E`; drop shadow `0 8px 20px rgba(255, 201, 92, 0.25)`. Text: `#261A00`.
- **Interaction (Active/Pressed):** On click or touch down, remove the 4px bevel (`box-shadow: 0 0 0 0`) and translate the element down 4px (`transform: translateY(4px)`). This creates instantaneous mechanical tactility.

### Glassmorphic Metric Cards
- **Construction:** Midnight navy `#1E2A3A` at `55%` opacity, `28px` backdrop blur, with a 1px border of `rgba(255, 255, 255, 0.12)`.
- **Content Distribution:** Display metric label in `body-sm` (`#B6C0CF`) at top left; numeric value in `label-currency-lg` (`#EBEFF5`) below it.
- **Micro-Decorations:** Faint, low-opacity glowing polygon watermarks anchored to the bottom-right corner behind the text.

### Interactive Quest Chips & Category Pills
- **Unselected:** Glass background `rgba(30, 42, 58, 0.40)`, border `1px solid rgba(255, 255, 255, 0.08)`, text `#B6C0CF`.
- **Selected:** Solid background `#A78BFA`, 2px physical bottom lip `#7C5CE5`, text `#0F1724`. Accompanied by a subtle exterior glow (`box-shadow: 0 0 14px rgba(167, 139, 250, 0.40)`).

### Input Fields (Deposit, Stake & Search)
- **Container:** Dark recessed trough using `#0B111B` at `70%` opacity, `1px solid rgba(255, 255, 255, 0.10)`.
- **Inner Shadow:** `inset 0 2px 4px rgba(0, 0, 0, 0.5)` to simulate an indented, protected slot inside the glass console.
- **Focus State:** Border shifts to `#38E399` with an ambient glow (`box-shadow: 0 0 12px rgba(56, 227, 153, 0.25)`). Text renders in `#EBEFF5`.

### Checkboxes & Toggle Controls
- **Toggle Switches:** Track constructed with recessed glass slot (`#0A101A`, 28px height, 52px width). Thumb is a chunky tactile circle (`#EBEFF5` with 2px bottom lip `#94A3B8`). When toggled on, track lights up with `#38E399`, and thumb shifts to pure white with `#1EAC70` base edge.
- **Checkboxes:** 22px × 22px rounded square (`rounded: 6px`). Unchecked: Glass trough with `1px solid rgba(255, 255, 255, 0.15)`. Checked: Solid `#38E399` with a 2px `#1EAC70` bottom bevel and dark navy checkmark icon.

### Currency Badges & Hexagonal Nodes
- **Currency Counters:** Floating pill composed of `rgba(15, 23, 36, 0.85)` framed with a 1px border of `rgba(255, 213, 92, 0.3)`. Left-aligned with an overlapping 3D Gold Coin graphic (`#FFD55C` face with `#DDA22E` rim).
- **Map Progression Hexagons:** 56px hexagonal nodes. Locked nodes: Translucent slate glass with 1px white border. Cleared nodes: Vibrant `#38E399` glass fill with radiant center point. Active/Current node: Pulsing `#FFC95C` hexagon with the Tortoise guide positioned alongside it.
