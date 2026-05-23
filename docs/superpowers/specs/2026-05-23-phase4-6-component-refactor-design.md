# Phase 4.6 — Component Refactor: Smart/Dumb/Hook Pattern

**Date:** 2026-05-23  
**Scope:** All React components in `src/`

---

## Goal

Refactor all React components into a consistent folder-based structure separating:
- **Dumb (presentational) components** — pure props-in, JSX-out, no store/hook/router access
- **Smart (container) components** — wire stores, hooks, and navigation to dumb components
- **Custom hooks** — encapsulate logic: store subscriptions, derived state, event handlers, side effects

---

## Folder Structure

Each component moves from a single file into a named folder at the same location:

```
# Before
src/components/ui/Button.tsx

# After
src/components/ui/Button/
  Button.tsx           # dumb component
  ButtonContainer.tsx  # smart component (omitted if not needed)
  useButton.ts         # custom hook (omitted if not needed)
  index.ts             # barrel export
```

---

## File Inclusion Rules

| File | Always? | Include when... |
|------|---------|-----------------|
| `Xxx.tsx` | Yes | Always — the dumb/presentational component |
| `index.ts` | Yes | Always — barrel export |
| `XxxContainer.tsx` | No | Component accesses stores, router, context, or manages complex local state that orchestrates the dumb component |
| `useXxx.ts` | No | There is meaningful logic: store subscriptions, derived state, event handlers, side effects |

---

## index.ts Export Shape

```ts
// When container exists:
export { Xxx } from './Xxx'                        // named: dumb component
export { XxxContainer as default } from './XxxContainer'  // default: smart component

// When no container (pure component):
export { Xxx } from './Xxx'
export { Xxx as default } from './Xxx'
```

---

## Import Conventions

**Within a component folder** — relative imports:
```ts
// XxxContainer.tsx
import { Xxx } from './Xxx'
import { useXxx } from './useXxx'
```

**Consumers** — import via `@/` alias (unchanged from before):
```ts
import Xxx from '@/components/ui/Xxx'          // default = Container or dumb
import { Xxx } from '@/components/ui/Xxx'      // named = dumb component
```

Existing consumer imports using named exports remain valid because `index.ts` re-exports the same named export.

---

## Hook Responsibilities

Hooks (`useXxx.ts`) contain:
- Store subscriptions (`useXxxStore`)
- Derived/computed state
- Event handlers and callbacks
- Side effects (`useEffect`)

Hooks do **not** return pre-shaped JSX props — they return raw data and handlers. The Container wires them to dumb component props.

---

## Component Classification

### 4-file components (have logic to extract)

**`src/features/home/`**
- `HomePage` — navigation handler → Container + hook
- `SummaryCards` — store subscriptions, derived income/expense → Container + hook
- `TodayTransactions` — store subscriptions → Container + hook
- `UpcomingTransactions` — store subscriptions → Container + hook

**`src/features/balance/`**
- `BalancePage` — store + routing → Container + hook
- `WalletDetailPage` — store + routing → Container + hook

**`src/features/transaction/`**
- `TransactionPage` — heavy: draft store, calc state, save/delete, navigation → Container + hook
- `CategoryItemsCard` — store/state → Container + hook
- `CalculatorKeyboard` — local state → Container + hook
- `CategorySelectionPage` — store + routing → Container + hook

**`src/features/settings/`**
- `CategoriesPage`, `CategoryFormPage` — store + form logic → Container + hook
- `CurrenciesPage`, `CurrencyFormPage` — store + form logic → Container + hook
- `SettingsPage`, `ThemePage` — store/navigation → Container + hook
- `WalletsPage`, `WalletFormPage` — store + form logic → Container + hook

**`src/components/shared/`**
- `BottomSheet` — local open/close state → Container + hook

**`src/components/ui/picker/`**
- `CurrencyPicker` — local state + data → Container + hook
- `DatePickerSheet` — local state → Container + hook
- `WalletPicker` — local state + data → Container + hook
- `RepeatPicker` — local state → Container + hook

**`src/components/` (top-level)**
- `AppShell` — context/layout logic → Container + hook
- `BottomNav` — navigation → Container + hook

---

### 2-file components (pure presentational)

**`src/components/shared/`**
- `AddRow`, `AnimatedBar`, `FormErrorMessage`, `ListGroup`, `ListRow`, `PageHeader`, `SectionDivider`, `SectionLabel`, `TransactionRow`

**`src/components/ui/`**
- `Button`, `Card`, `Field`, `SegmentedControl`

**`src/components/ui/picker/`**
- `PickerColumn`, `TypePickerDropdown`

**`src/components/` (top-level)**
- `Icon`

**`src/features/design/`**
- `DesignPage` — sidebar toggle local state → Container + hook
- `DesignSidebar`, `sections/FeatureSection`, `sections/TokensSection`, `sections/UIComponentsSection`

---

## Design Showcase Convention

Components rendered on the design showcase page (`src/features/design/sections/`) must import the **named (dumb) export**, not the default Container:

```ts
// sections/UIComponentsSection.tsx
import { Button } from '@/components/ui/Button'   // dumb component — correct
// NOT: import Button from '@/components/ui/Button'  // container — wrong
```

This ensures the showcase renders pure presentational components with explicit, controlled props — no store or side-effect wiring.

---

## What Does NOT Change

- Store files in `src/stores/` — untouched
- `src/context/` — untouched
- `src/lib/`, `src/hooks/shared/` — untouched
- `src/App.tsx`, `src/main.tsx` — untouched
- Consumer import paths — all existing `import { Xxx } from '@/components/...'` remain valid via `index.ts` re-exports

---

## Success Criteria

- All components live in named folders with at minimum `Xxx.tsx` + `index.ts`
- No component file directly accesses stores, router, or context outside a Container or hook
- All existing tests pass
- No consumer import paths need updating
- TypeScript compiles with no errors
