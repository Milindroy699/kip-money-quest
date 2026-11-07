---
name: Midnight Arcade Fintech
colors:
  surface: '#0b1420'
  surface-dim: '#0b1420'
  surface-bright: '#323948'
  surface-container-lowest: '#060e1b'
  surface-container-low: '#141c29'
  surface-container: '#18202d'
  surface-container-high: '#222a38'
  surface-container-highest: '#2d3543'
  on-surface: '#dbe2f5'
  on-surface-variant: '#bbcabe'
  inverse-surface: '#dbe2f5'
  inverse-on-surface: '#29313f'
  outline: '#859489'
  outline-variant: '#3c4a40'
  surface-tint: '#34e197'
  primary: '#6bffb6'
  on-primary: '#003821'
  primary-container: '#38e399'
  on-primary-container: '#00613c'
  inverse-primary: '#006c44'
  secondary: '#f3be53'
  on-secondary: '#412d00'
  secondary-container: '#b78920'
  on-secondary-container: '#382700'
  tertiary: '#eae0ff'
  on-tertiary: '#381385'
  tertiary-container: '#d0bfff'
  on-tertiary-container: '#5c3faa'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#5cfeb1'
  primary-fixed-dim: '#34e197'
  on-primary-fixed: '#002112'
  on-primary-fixed-variant: '#005232'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#f3be53'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4200'
  tertiary-fixed: '#e8ddff'
  tertiary-fixed-dim: '#cebdff'
  on-tertiary-fixed: '#21005e'
  on-tertiary-fixed-variant: '#4f319c'
  background: '#0b1420'
  on-background: '#dbe2f5'
  surface-variant: '#2d3543'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-currency-lg:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 28px
  label-currency-sm:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
  label-btn:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
  label-badge:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.25rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system manifests an electric, gamified midnight bazaar where personal finance meets immersive role-playing. It is crafted for digital natives, young investors, and casual gamers seeking financial empowerment without dry institutional austerity. 

The aesthetic is a hybrid of **Deep Glassmorphism** and **Tactile Arcade Skeuomorphism**:
- **Atmosphere:** Deep midnight environments illuminated by ambient cyan/indigo bioluminescent undercurrents.
- **Glass Infrastructure:** Analytical HUDs, cards, inventory bays, and navigational trays emerge as ultra-refined, frosted crystalline slabs suspended over dark celestial fields.
- **Tactile Game Pieces:** Critical interactables, currency tokens, and primary triggers break out of the glass plane entirely. They exist as physical, chunky, 3D clay-molded objects that demand physical touch and provide visceral mechanical feedback.
- **Character Integration:** The companion character—a resolute, forward-facing tortoise—is purposefully placed throughout layouts. The character's eyeline, posture, and shell orientation systematically point toward the ergonomic thumb zone and critical action buttons, directing user intent seamlessly.

## Colors

The palette establishes an ultra-deep canvas to allow chromatic accents to achieve optical bioluminescence while maintaining WCAG AA (4.5:1 minimum) compliance against dark surfaces.

### Base Canvases & Atmospheric Substrates
- **Canvas Base:** `#0F1724` (Deep void navy serving as the foundational background layer).
- **Surface Elevation 1 (Translucent Glass):** `#1E2A3A` rendered strictly at `55%` opacity (`rgba(30, 42, 58, 0.55)`).
- **Surface Elevation 2 (Elevated HUD Glass):** `#253448` rendered at `65%` opacity.
- **Atmospheric Underglow Gradients:** Conic and radial blends of Midnight Cyan (`#14B8A6` at 15%) and Deep Luminous Indigo (`#4338CA` at 25%) placed behind glass planes to generate radiant diffusion.

### Luminous Gamified Accents (Active & Rewarding)
All accent tokens are calibrated at elevated brightness to provide vibrant neon readouts against dark backgrounds:
- **Kip Neon Green (Primary CTA / Success):** Face: `#38E399`, Tactile Base/Extrusion: `#1EAC70`. Text pairing: `#08291A` (11.8:1 contrast) or `#0F1724`.
- **Luminous Honey (Rewards / Milestones):** Face: `#FFC95C`, Tactile Base/Extrusion: `#DDA22E`.
- **Coin Gold (Liquid Wealth / Shards):** `#FFD55C`.
- **Radiant Melt Purple (Mystery / Quests / Boosters):** Face: `#A78BFA`, Tactile Base/Extrusion: `#7C5CE5`.
- **Dash Risk Orange (Stakes / Warnings):** Face: `#FFA05C`, Tactile Base/Extrusion: `#CC6E2A`.
- **Danger Coral (Critical Alerts / Depletion):** Face: `#FF6368`, Tactile Base/Extrusion: `#D1363B`.

### Typography Tokens
- **Text High-Emphasis:** `#EBEFF5` (92% pure white luminescence on midnight grounds; guarantees >11:1 contrast on `#0F1724` and `#1E2A3A`).
- **Text Medium-Emphasis:** `#B6C0CF` (Muted slate for meta-labels, sub-stats, and timestamps; guarantees 6.4:1 contrast).
- **Text Ghost/Disabled:** `#64748B`.
- **Glass Specular Border:** `rgba(255, 255, 255, 0.12)` (Inner specular highlight).

## Typography

The type scale marries the technical, geometric punch of **Space Grotesk** for numerical tallies, game stats, and headers with the geometric, approachable clarity of **Outfit** for financial instructions, quest prompts, and notifications.

### Application Rules
- **Space Grotesk:** Set for all headers, interactive labels, badges, and numeric data. Use tabular lining figures (`font-variant-numeric: tabular-nums`) across all currency tokens and coin counts to prevent layout jittering during real-time balance increments.
- **Outfit:** Dedicated exclusively to body copy, tutorial explanations, and auxiliary descriptions. The rounded aperture ensures legibility even when rendered over translucent glass panels with noisy mesh backgrounds.
- **Tracking & Case:** Small badges and button labels (`label-badge`, `label-btn`) use uppercase casing accompanied by `+0.04em` letter-spacing for heightened arcade legibility under low ambient lighting.

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

## Shapes

The design uses balanced, rounded geometry (level `2`) with select organic treatments for game elements.

- **Base Radii:** Standard component surfaces, inputs, and chips leverage `0.75rem` (12px) to `1rem` (16px) radius.
- **Glass Cards & Sheets:** Fixed at `1.25rem` (20px) to `1.5rem` (24px) for a modern, tactile shield profile.
- **Tactile 3D Buttons:** Radii locked at `1rem` (16px), harmonizing with the 4px vertical base extrusion.
- **Hexagonal Quest Nodes:** Interactive map nodes and level badges leverage regular convex hexagons with rounded vertices (4px radius per apex), providing an arcade aesthetic distinct from ordinary rectangular UI elements.
- **Clay Coin Primitives:** Pure circular geometry (`rounded-full`) with an internal concentric inset lip simulating physical minted currency.

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
