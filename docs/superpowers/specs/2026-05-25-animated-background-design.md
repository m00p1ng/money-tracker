# Animated Background Design

**Date:** 2026-05-25
**Status:** Approved

## Goal

Replace the static 3-gradient body background with a rich, animated aurora-glow background. 5 orbs drift with a "breathe" motion (6–9s cycles) — clearly alive but non-distracting.

## Architecture

### New component: `Background`

Location: `src/components/Background.tsx`

A single presentational component — no props, no store access. Renders a fixed full-screen container (`position: fixed`, `inset: 0`, `z-index: -1`, `pointer-events: none`) containing 5 absolutely-positioned orb divs. Each orb is a `div` styled with:

- `border-radius: 50%`
- `background: radial-gradient(circle, var(--bg-glow-N), transparent 70%)`
- `filter: blur(60px)`
- unique `animation` keyframe + duration

Component is added once inside `AppShell`, before `<main>`.

### Theme token changes

Add `bgGlow4` and `bgGlow5` to `ThemeTokens` in `src/lib/theme.ts`. Each theme gets two additional glow colors — typically lighter/softer variants of existing accent colors.

Add corresponding CSS vars in `applyTheme()`:
- `--bg-glow-4`
- `--bg-glow-5`

Update `src/index.css` `:root` defaults with `--bg-glow-4` and `--bg-glow-5`.

### CSS changes (`src/index.css`)

- Remove multi-gradient `body { background: ... }` — replace with `background: var(--bg)` (flat color only)
- Add 5 `@keyframes` definitions for orb animations:
  - `orbFloat1`: translate X/Y + scale, 8s
  - `orbFloat2`: translate X/Y + scale, 9s
  - `orbFloat3`: translate X/Y + scale (3-stop), 7s
  - `orbFloat4`: translate X/Y + scale, 6s
  - `orbFloat5`: translate X/Y + scale, 8.5s

### Orb layout

| Orb | Size | Position | Token | Duration |
|-----|------|----------|-------|----------|
| 1 | 340×340px | top:-100px, left:-80px | `--bg-glow-1` | 8s |
| 2 | 280×280px | top:60px, right:-60px | `--bg-glow-2` | 9s |
| 3 | 240×240px | bottom:-80px, left:20% | `--bg-glow-3` | 7s |
| 4 | 200×200px | top:30%, left:40% | `--bg-glow-4` | 6s |
| 5 | 180×180px | bottom:10%, right:25% | `--bg-glow-5` | 8.5s |

All orbs use `filter: blur(60px)` and `will-change: transform` for GPU compositing.

## Data flow

No store changes. Token pipeline unchanged:
`themes[preset]` → `applyTheme()` → CSS vars → `Background` orb inline styles (via Tailwind classes referencing vars)

## Files to create

- `src/components/Background.tsx`

## Files to modify

- `src/lib/theme.ts` — add `bgGlow4`, `bgGlow5` to `ThemeTokens` + all 9 presets
- `src/types/domain.ts` — no change (ThemePreset list unchanged)
- `src/index.css` — simplify body background, add 5 keyframes, add CSS var defaults
- `src/components/AppShell.tsx` — import and render `<Background />`

## Design sandbox

Add a demo entry in `src/features/design/sections/SharedComponentsSection` showing `<Background />` in isolation per the codebase convention. Background is a global layout primitive — it belongs in the Shared section.

## Performance

- `will-change: transform` on each orb limits repaints to compositor layer
- `pointer-events: none` + `z-index: -1` — zero interaction cost
- `filter: blur()` is GPU-accelerated on all modern mobile browsers
- No JS animation — pure CSS keyframes

## Out of scope

- Per-page background variations
- Parallax on scroll
- Reduced-motion media query (can be added later as enhancement)
