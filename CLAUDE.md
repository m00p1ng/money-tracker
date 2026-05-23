# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # start dev server
bun build        # tsc + vite build
bun lint         # eslint
bun test         # vitest run (single pass)
bun test:watch   # vitest watch
```

Run a single test file:
```bash
bun test src/lib/__tests__/calculator.test.ts
```

## Architecture

Mobile-first personal finance PWA. Data lives in IndexedDB (Dexie). State syncs into Zustand stores. React components consume stores directly.

**Data flow**: Dexie (IndexedDB) → `bootstrapStores()` on app load → Zustand stores → Container components → Dumb components

### Directory map

| Path | Purpose |
|------|---------|
| `src/types/domain.ts` | All domain types (`Transaction`, `Wallet`, `Category`, `Currency`, `Settings`) |
| `src/db/schema.ts` | Dexie DB class + singleton `db` |
| `src/db/seed.ts` | First-run seed data |
| `src/stores/` | Zustand stores — one per domain entity + `transactionDraftStore` for in-progress form state |
| `src/features/` | Feature modules: `home`, `balance`, `transaction`, `settings`, `design` |
| `src/components/` | Global layout (`AppShell`, `BottomNav`), `shared/` UI primitives, `ui/` form controls |
| `src/lib/` | Pure utility functions (date, format, calculator, color, theme) |
| `src/hooks/` | Shared hooks (`useFormCrud`) |
| `src/context/` | `navigationDirection` context — tracks forward/back for page transition direction |

### Component folder pattern

Every non-trivial component lives in its own folder:

```
ComponentName/
  ComponentName.tsx          # dumb/presentational — props only, no store access
  ComponentNameContainer.tsx # smart — reads stores, calls hooks, passes props down
  useComponentName.ts        # business logic hook
  index.ts                   # barrel: export default from Container
```

### Routing

Three tab routes (`/`, `/balance`, `/settings`) use fade+slide tab transitions. All deeper routes use directional slide transitions based on `NavigationDirectionProvider`. The `/design` route is outside `AppShell` — it's a component design sandbox. When adding any visually renderable component under `src/components/`, add a demo in the appropriate `src/features/design/sections/` file. Use existing `SubSection` + `VariantLabel` helpers.

### Repeat transactions

`src/features/transaction/repeatSchedule.ts` handles virtual repeat occurrence projection. Repeat transactions have a `repeatSourceId` + `repeatOccurrenceDate`. They are "virtual" until materialized via `transactionStore.materializeRepeatOccurrence()`.

## Code conventions

- Path alias `@/` → `src/`
- Import order enforced by eslint-plugin-import-x: builtin → external → `@/**` → parent → sibling → index, with blank lines between groups, alphabetized
- No semicolons, 2-space indent, single quotes
- `framer-motion` is mocked in tests (passthrough elements + no-op `AnimatePresence`)
- `fake-indexeddb/auto` is auto-loaded in test setup — no real IndexedDB needed
