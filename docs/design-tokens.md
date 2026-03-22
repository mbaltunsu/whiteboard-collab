# Design Tokens — The Infinite Curator

Extracted from Stitch project `5212631045652187184`. Source of truth for all UI components.

## Creative North Star

"The Infinite Curator" — the UI is a transparent layer between the mind and the canvas. Characterized by:
- **Intentional Asymmetry** — dynamic, high-end focal points over centered layouts
- **Bespoke Minimalism** — depth through sophisticated neutral tones, not empty space
- **Tactile Productivity** — tools and sticky notes feel like physical objects on a premium matte surface

## Color Palette

### Surfaces (Paper Hierarchy)

| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#f5f6f7` | Canvas background |
| `surface-container-lowest` | `#ffffff` | Floating elements (highest contrast) |
| `surface-container-low` | `#eff1f2` | Primary UI panels (toolbar, sidebars) |
| `surface-container` | `#e6e8ea` | Mid-level containers |
| `surface-container-high` | `#e0e3e4` | Avatar empty states |
| `surface-container-highest` | `#dadddf` | Active modals, popovers, input backgrounds |
| `surface-dim` | `#d1d5d7` | Increased contrast alternative |
| `surface-bright` | `#f5f6f7` | Bright variant |

### Brand / Primary (Electric Indigo)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#0c0bff` | Active tool icons, links, focus rings |
| `primary-dim` | `#0300e1` | Hover states |
| `primary-container` | `#9097ff` | Active tool background (20% opacity), gradient end |
| `primary-fixed` | `#9097ff` | Fixed primary surfaces |
| `primary-fixed-dim` | `#8088ff` | Hover glow on primary actions |
| `on-primary` | `#d8d8ff` | Text on primary backgrounds |
| `on-primary-container` | `#010083` | Text on primary containers |
| `inverse-primary` | `#7c84ff` | Primary on dark surfaces |

### Secondary (Cool Gray)

| Token | Hex | Usage |
|-------|-----|-------|
| `secondary` | `#555c69` | Secondary text, icons |
| `secondary-container` | `#dce2f3` | Secondary backgrounds |
| `on-secondary` | `#eef2ff` | Text on secondary |
| `on-secondary-container` | `#4b525f` | Text on secondary containers |

### Tertiary (Amber/Orange)

| Token | Hex | Usage |
|-------|-----|-------|
| `tertiary` | `#815100` | Tertiary accent |
| `tertiary-container` | `#f8a010` | Sticky note backgrounds, warnings |
| `on-tertiary` | `#fff0e3` | Text on tertiary |
| `on-tertiary-container` | `#4a2c00` | Text on tertiary containers |

### Text & Foreground

| Token | Hex | Usage |
|-------|-----|-------|
| `on-surface` | `#2c2f30` | Primary text (NEVER use #000000) |
| `on-surface-variant` | `#595c5d` | Secondary text, cursor name labels |
| `on-background` | `#2c2f30` | Text on background |
| `outline` | `#757778` | Prominent borders (use sparingly) |
| `outline-variant` | `#abadae` | Ghost borders (use at 15% opacity) |

### Error

| Token | Hex | Usage |
|-------|-----|-------|
| `error` | `#b41340` | Error states |
| `error-container` | `#f74b6d` | Error backgrounds |

### Dark Mode Inverses

| Token | Hex |
|-------|-----|
| `inverse-surface` | `#0c0f10` |
| `inverse-on-surface` | `#9b9d9e` |

## Typography

### Font Families

| Scale | Font | Usage |
|-------|------|-------|
| Display / Headline | **Manrope** (Bold) | Branding, headings, empty states, hero text |
| Body / Label | **Inter** (Regular/Medium) | Canvas labels, sticky notes, tooltips, all functional text |

### Scale

| Token | Font | Weight | Usage |
|-------|------|--------|-------|
| `display-lg` | Manrope | Bold | Welcome screens, empty states |
| `display-md` | Manrope | Bold | Page titles |
| `headline-sm` | Manrope | Bold | Section headers |
| `title-sm` | Inter | Medium | Sticky note text (center-aligned) |
| `body-md` | Inter | Regular | Workhorse — general content |
| `body-sm` | Inter | Regular | Descriptions, paired below headlines |
| `label-sm` | Inter | Medium | Cursor name labels, small annotations |

### Editorial Contrast Rule
Pair `headline-sm` (Manrope, Bold) directly above `body-sm` (Inter, Regular) for premium magazine-like feel.

## Spacing

Scale factor: **2** (doubling scale)

| Token | Value |
|-------|-------|
| `spacing-1` | 0.25rem |
| `spacing-2` | 0.5rem |
| `spacing-4` | 1rem |
| `spacing-6` | 1.5rem |
| `spacing-8` | 2rem |
| `spacing-10` | 2.5rem |

## Corner Radius

Roundness level: **ROUND_FOUR** (generous rounding)

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 0.125rem | Input field bottom corners |
| `md` | 0.375rem | Buttons, internal elements |
| `lg` | 0.5rem | Containers |
| `xl` | 0.75rem | Tool dock, floating panels |
| `full` | 9999px | Avatars, pills |

**Nested Rounding Rule:** If container has `lg` corners, internal elements use `md` or `sm`.

## Elevation & Shadows

### The "No-Line" Rule
**Never use 1px solid borders** for sectioning. Define boundaries through background color shifts only.

### Ambient Shadow (Floating Toolbars)
```css
box-shadow: 0 12px 32px -4px rgba(12, 15, 16, 0.08);
```
Shadow color is tinted from `inverse-surface` (#0c0f10), not pure black.

### Contact Shadow (Sticky Notes)
Tight 2px blur shadow at bottom to feel "stuck" to canvas.

### Ghost Border (Fallback)
```css
border: 1px solid rgba(171, 173, 174, 0.15); /* outline-variant at 15% */
```

## Glassmorphism (Floating Toolbars + Cursor Labels)

```css
background: rgba(255, 255, 255, 0.8); /* surface-container-lowest at 80% */
backdrop-filter: blur(12px);
```

## Signature Gradients

### Primary CTA Gradient
```css
background: linear-gradient(135deg, #0c0bff, #9097ff); /* primary → primary-container */
```

## Component Recipes

### Tool Dock
- Background: `surface-container-low` with 20px backdrop blur
- Corners: `xl` (0.75rem)
- Active tool: `primary` icon + `primary-container` background at 20% opacity

### Sticky Notes
- Colors: tertiary-container (Orange), custom soft pastels
- Shadow: Contact shadow (2px blur bottom)
- Typography: `title-sm` (Inter), center-aligned

### Cursor Labels
- Background: `surface-container-lowest` with 1px ghost border
- Text: `label-sm` (Inter), `on-surface-variant` color
- Cursor stroke: 2px `primary` (or user accent color)

### Avatars
- Shape: Circular (`full` roundedness)
- Empty state: `surface-container-high` background

### Buttons
- **Primary:** Gradient fill (primary → primary-container), white text, `md` radius
- **Secondary:** `surface-container-low` background, `on-surface` text

### Input Fields
- No borders — use `surface-container-highest` background
- Bottom-corner radius `sm` (0.125rem)

### Lists
- No divider lines — separate items with `spacing-2` (0.5rem) vertical white space

## Don'ts

- Never use `#000000` for text — use `on-surface` (#2c2f30)
- Never use standard Material shadows — increase background contrast instead
- Never use border on canvas grid — use `outline-variant` dots at 10% opacity
- Never use 100% opaque strokes for containers — use ghost borders at 15% opacity

## Screen Reference

| Screen | File | Dimensions |
|--------|------|------------|
| Whiteboard Canvas | `docs/designs/whiteboard-canvas.png` | 2560x2048 |
| Presence Details | `docs/designs/presence-details.png` | 2560x2048 |
| Architecture Dashboard | `docs/designs/architecture-dashboard.png` | 2560x2270 |
| Room Dashboard | `docs/designs/room-dashboard.png` | 2560x2816 |

HTML source code for each screen is in `docs/designs/*.html`.
