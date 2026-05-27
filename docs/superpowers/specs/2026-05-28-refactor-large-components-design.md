# Refactor: Large Components & Functions
**Date:** 2026-05-28  
**Approach:** Parallel agents, grouped by concern cluster. Run tests after each cluster.

---

## Scope

10 refactoring candidates across 4 independent clusters. No shared file dependencies between clusters — safe to execute in parallel. All changes are pure refactors: no behavior changes, no new features.

---

## Cluster 1: UI Components

### `BalancePage`
**File:** `src/features/balance/BalancePage/BalancePage.tsx`

- Extract `WalletGroup` sub-component (new file: `WalletGroup.tsx` in same folder)
  - Props: `wallets`, `title`, `isEditMode`, `onDragEnd`, `total`, `currency`
  - Encapsulates: `ListGroup` + `SortableContext` (edit mode) / plain list (view mode) + trailing sum
- `paymentWallets` and `creditCards` render blocks replaced with `<WalletGroup ... />`
- `handleDragEnd` extracted to `useCallback` or small inline named function

### `WalletDetailPage`
**File:** `src/features/balance/WalletDetailPage/WalletDetailPage.tsx`

- Extract `WalletDetailActions` component (inline or new file)
  - Contains the `rightSlot` button group (~20 lines)
- Extract `WalletTransactionRow` component
  - Props: `transaction`, `reconciliation`, `walletId`
  - Renders `SwipeableTransactionRow` or `TransactionRow` based on `reconciliation`
  - Replaces conditional inside `Array.map`

### `TransactionPage`
**File:** `src/features/transaction/TransactionPage/TransactionPage.tsx`

- `renderPrimaryCard()` becomes `PrimaryCard` sub-component in same folder
  - Receives the props it needs; eliminates imperative render function pattern
- Extract `useTransactionPageModals` hook (same folder)
  - Manages: `calcOpen`, `walletPickerTarget`, `isRepeatPickerOpen`, `isCurrencyPickerOpen`, `isDatePickerOpen`, `isDeleteConfirmOpen`
  - Returns state + setters
  - `TransactionPage` calls this hook instead of 6 individual `useState` calls

---

## Cluster 2: Design Sandbox

### `ComponentsSection`
**File:** `src/features/design/DesignPage/components/ComponentsSection.tsx`

Split 493-line monolith into focused demo section files in `src/features/design/DesignPage/components/sections/`:

| New file | Demo content |
|----------|-------------|
| `ButtonSection.tsx` | Button variants |
| `CardSection.tsx` | Card variants |
| `FieldSection.tsx` | Input/field controls |
| `PickerSection.tsx` | CurrencyPicker, DateTimePicker, RepeatPicker, WalletPicker, DateRangePresetPicker |
| `ControlsSection.tsx` | Switch, SegmentedControl |
| `TypographySection.tsx` | Typography tokens |
| `OtherSection.tsx` | Remaining misc demos |

- Each section component owns its own `useState` pairs (state becomes local, not global)
- `ComponentsSection` becomes a thin compositor: imports and renders each section
- `useState` count in `ComponentsSection` drops from 20+ to 0

---

## Cluster 3: Hooks

### `useTransactionPage` / `useTransactionSaveHandler`
**File:** `src/features/transaction/TransactionPage/useTransactionPage.ts`

- Extract pure function `validateTransactionDraft(draft): ValidationError[]`
- Extract pure function `buildTransaction(draft, exchangeRate): Transaction`
- `useTransactionSaveHandler` shrinks to: validate → build → store.save → navigate
- Both pure functions are unit-testable without hook setup

### `useTransactionPageDraft`
**File:** `src/features/transaction/TransactionPage/useTransactionPage.ts`

- Extract pure function `buildInitialDraft(params): TransactionDraft`
  - Moves the 34-line ternary-chain memo computation out of the hook
- Hook becomes: `useMemo(() => buildInitialDraft(params), [deps])`

### `useCalendarPage`
**File:** `src/features/calendar/CalendarPage/useCalendarPage.ts`

- Extract `buildIndicatorMap(transactions, upcoming): IndicatorMap` — pure helper
- Extract `makeUpcomingRow(row): ListRow` — named standalone function (not inline closure)
- Extract `buildListRows(rows, showAll): ListRow[]` — replaces the IIFE pattern
- All three are pure functions, unit-testable

---

## Cluster 4: Core Logic

### `calculator.ts`
**File:** `src/lib/calculator.ts`

- Extract per-key handlers as pure functions in same file:
  - `handleDigitKey(state, key): CalcState`
  - `handleDecimalKey(state): CalcState`
  - `handleOperatorKey(state, op): CalcState`
  - `handleEqualsKey(state): CalcState`
  - `handleSignKey(state): CalcState`
  - `handleBackspaceKey(state): CalcState`
- `pressCalcKey` becomes a dispatcher (switch or lookup) calling the right handler
- Existing tests cover correctness; no behavior change

### `repeatSchedule.ts`
**File:** `src/features/transaction/repeatSchedule.ts`

- Replace 7-branch if-else in `nextRepeatDate` with a dispatch table:
  ```ts
  const NEXT_DATE_HANDLERS: Partial<Record<RepeatPreset, (date: Date) => Date>> = {
    daily: (d) => addDays(d, 1),
    weekly: (d) => addWeeks(d, 1),
    '2weeks': (d) => addWeeks(d, 2),
    monthly: (d) => addMonths(d, 1),
    yearly: (d) => addYears(d, 1),
  }
  ```
- Custom unit cases (`custom/day`, `custom/week`, etc.) handled via a small helper
- `nextRepeatDate` becomes: lookup handler → call → return

### `transactionStore.ts`
**File:** `src/stores/transactionStore.ts`

- Extract `buildRealRows(transactions, dateRange): TransactionRow[]` — shared pure helper
- Extract `buildRepeatRows(repeatTransactions, dateRange): TransactionRow[]` — shared pure helper
- Both `upcomingTransactions` and `upcomingByMonth` call these helpers, eliminating duplication
- `materializeRepeatOccurrence`: extract `findRepeatSource(id)` for DB lookup step
- Move `localDateString` and `todayString` to `src/lib/date.ts` (currently duplicated in store and `repeatSchedule.ts`)

### `CategorySelectionPage`
**File:** `src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx`

- Extract `useCategoryDragEnd` hook (same folder)
  - Owns `handleDragStart`, `handleDragOver`, `handleDragEnd` logic
  - Returns drag handlers + active drag state
- Split `SortableCategoryCell` into:
  - `EditableCategoryCell` — edit-mode cell with drag handle, delete button
  - `CategoryCell` — view-mode cell, simple tap target
- Extract `CategoryGrid` sub-component
  - Receives categories + mode; renders the grid layout
  - Replaces the large `grid` JSX variable
- Main `CategorySelectionPage` JSX unifies the `isEditMode` duplicate branches via props to `CategoryGrid`

---

## Constraints

- **No behavior changes.** Every refactor is purely structural.
- **Tests must pass** after each cluster: `npm run test`
- **Lint must pass** after each cluster: `npm run lint`
- **Build must pass** after full sweep: `npm run build`
- Follow existing component folder pattern: `ComponentName/ComponentName.tsx` + `index.ts` barrel
- Follow import order convention (eslint-plugin-import-x enforced)
- No new external dependencies

---

## Execution Order (within each cluster)

Start with the most mechanical changes (extraction of pure functions) before touching component structure. This minimizes risk of JSX refactors breaking tests.
