# Design System Component Page

**Date:** 2026-05-23  
**Status:** Approved

## Goal

Add a hidden `/design` route to the app that displays all design tokens, shared UI components, and feature-level components in a single auditable view. The purpose is to visually identify inconsistencies and unify the app's appearance.

## Access / Trigger

The `/design` page is not linked from any app navigation. It is accessed via:

- **Desktop:** `Shift+D` keyboard shortcut (anywhere in the app)
- **Mobile:** Long-press (600ms) on the app logo/title in the header (`AppShell`)

Both triggers navigate programmatically using React Router's `useNavigate`. The trigger logic lives in a single hook mounted once in `AppShell`.

To exit, the user navigates back (browser back button or back gesture).

## Layout

Sidebar + content panel. The page fills the full viewport, replacing the normal app shell (no bottom nav, no top nav).

### Sidebar (left, fixed width ~160px)

- Scrollable independently
- Three labeled groups:
  - **Tokens** — Colors, Typography, Spacing
  - **UI Components** — Button, Card, Field, SegmentedControl, TypePickerDropdown
  - **Feature Components** — SummaryCards, AmountDisplay, CalculatorKeyboard, CategoryItemsCard, TodayTransactions, UpcomingTransactions
- Clicking a sidebar item scrolls the content panel to the matching section anchor
- Active item highlights based on scroll position (IntersectionObserver on each section heading)

### Content Panel (right, flex:1)

- Single scrollable column
- Each component/token group is a `<section id="...">` with a heading, description, and rendered examples
- Sections are separated visually with a divider

## File Structure

```
src/
  features/
    design/
      DesignPage.tsx           # Top-level layout: sidebar + content panel
      DesignSidebar.tsx        # Sidebar nav with 3 groups, active state
      sections/
        TokensSection.tsx      # Color swatches, typography scale, spacing scale
        UIComponentsSection.tsx # All ui/ components with all variants
        FeatureSection.tsx     # Feature components rendered with stub data
  hooks/
    useDesignSystemTrigger.ts  # Shift+D + long-press, calls useNavigate('/design')
```

## Sections Detail

### Tokens — Colors

Render one swatch per CSS variable defined in `index.css`. Each swatch shows:
- Colored rectangle
- Token name (e.g., `accent`)
- CSS variable name (e.g., `--accent`)
- Resolved hex value (read at runtime via `getComputedStyle`)

Variables to cover: `--accent`, `--accent-light`, `--bg`, `--income`, `--expense`, `--danger`, `--accent-btn-1`, `--accent-btn-2`, `--nav-border`, `--bg-glow-1`, `--bg-glow-2`, `--bg-glow-3`.

### Tokens — Typography

Show the font family, and a scale of text sizes used in the app (`text-xs` through `text-4xl`) as labeled specimens.

### Tokens — Spacing

Show a visual ruler of Tailwind spacing values used in the app (e.g., `p-2`, `p-3`, `p-4`, `gap-3`, etc.) as labeled colored bars.

### UI Components

Each component gets a subsection with:
- Component name as heading
- All variants rendered side-by-side with labels beneath
- No interactive props editor — static display only

Components and their variants:

| Component | Variants to show |
|---|---|
| Button | `accent`, `ghost`, `danger`; `fullWidth`; `disabled` state |
| Card | Default; with rich content inside |
| Field | With TextInput; with SelectInput; with error state |
| SegmentedControl | 2-segment, 3-segment |
| TypePickerDropdown | All three type values |

### Feature Components

Feature components are rendered with hardcoded stub data — they must not depend on live stores. Each component is wrapped in a labeled section.

Components that currently read from Zustand stores (`SummaryCards`, `TodayTransactions`, `UpcomingTransactions`) must be refactored to accept props instead of calling store hooks directly, OR a stub wrapper component is created in `src/features/design/sections/` that feeds hardcoded data. The preferred approach is a stub wrapper to avoid touching production component contracts.

Components to include:
- `SummaryCards` — stub income/expense values
- `AmountDisplay` — income and expense variants
- `CalculatorKeyboard` — static render, no-op callbacks
- `CategoryItemsCard` — stub category list
- `TodayTransactions` — stub transaction list
- `UpcomingTransactions` — stub transaction list

## Trigger Hook — `useDesignSystemTrigger`

```ts
// Pseudocode
useEffect(() => {
  // Keyboard: Shift+D
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [])

// Long-press: attach to logo element via ref passed from AppShell
// pointerdown starts a 600ms timer; pointerup/pointerleave cancels it
```

The hook is called once inside `AppShell`. The long-press ref is attached to the existing logo/title element in `AppShell`.

## Routing

Add to `App.tsx`:

```tsx
<Route path="/design" element={<DesignPage />} />
```

The `/design` route is excluded from the `bottomNavRoutes` list and the `showBottomNav` logic — no bottom nav is shown.

## No Tests Required

This is a developer audit tool, not production user-facing functionality. No unit or integration tests are needed.

## Out of Scope

- Interactive prop editors (no knobs/controls)
- Theme switching from within the design page
- Search/filter within the sidebar
- Any automated consistency checks or linting
