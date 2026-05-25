# WalletDetailPage Refactor — Design Spec

**Date:** 2026-05-25  
**Goal:** Extract visual sections of `WalletDetailPage` into smaller, focused presentational components for readability, reusability, and testability.

---

## Approach

Hybrid flat extraction: pure presentational components live as flat `.tsx` files in `./components/`. No container/hook split needed — all components are props-only. Folders can be added later if individual components grow state or logic.

---

## New Files

All new files live in:
`src/features/balance/WalletDetailPage/components/`

### `DateRangeHeader.tsx`

Renders the Begin/End date cards and the preset picker trigger button.

**Props:**
```ts
type DateRangeHeaderProps = {
  range: { start: string; end: string }
  onOpenPreset: () => void
}
```

`formatDateLabel` moves here from `WalletDetailPage.tsx` (it is only used in this component).

---

### `CreditCardStats.tsx`

Renders the credit card summary: Debt/Available/Limit grid, credit usage bar, and optionally the cleared debt section when reconciliation is enabled.

**Props:**
```ts
type CreditCardStatsProps = {
  wallet: Wallet
  currentAmount: number
  clearedAmount: number
  reconciliation: boolean
}
```

---

### `WalletStats.tsx`

Renders the regular wallet summary: Balance bar, optionally the Cleared bar (when reconciliation enabled), and the Expenses bar.

**Props:**
```ts
type WalletStatsProps = {
  wallet: Wallet
  currentAmount: number
  clearedAmount: number
  totalExpenses: number
  reconciliation: boolean
}
```

---

### `TransactionRow.tsx`

Renders a single non-swipeable transaction row as a `<Link>` navigating to `/transaction/:id`.

**Props:**
```ts
type TransactionRowProps = {
  row: RunningWalletRow
  wallet: Wallet
  categories: Category[]
}
```

---

## Modified Files

### `WalletDetailPage.tsx`

Becomes an orchestrator (~60–70 lines). Responsibilities retained:
- Local state (`preset`, `isPresetSheetOpen`)
- Derived values (`range`, `rows`, `isCredit`, `reconciliation`, `totalExpenses`, `creditUsedRatio` moves into `CreditCardStats`)
- Conditional rendering: not-found state, credit vs. regular wallet branch, swipeable vs. plain transaction row
- Imports all four new components from `./components/`

### `src/features/design/sections/FeatureSection.tsx`

Add demos for all 4 new components inside the existing `<PageGroup label="Balance">` block, after the `SwipeableTransactionRow` subsection.

Demo stubs to use:
- `STUB_WALLET_PAYMENT` and `STUB_WALLET_CREDIT` (already defined)
- `STUB_CATEGORY` (already defined)
- `STUB_TRANSACTION` (already defined)
- New inline stub for `RunningWalletRow` shape: `{ transaction: STUB_TRANSACTION, amount: -12.5, runningAmount: 487.5 }`
- Range stub: `{ start: '2026-05-01', end: '2026-05-31' }`

Demo variants:
- `DateRangeHeader` — single demo with stub range
- `CreditCardStats` — two variants: with reconciliation, without reconciliation
- `WalletStats` — two variants: with reconciliation, without reconciliation
- `TransactionRow` — single demo with stub row and category

---

## What Does NOT Change

- `WalletDetailPageContainer.tsx`
- `useWalletDetailPage.ts`
- `SwipeableTransactionRow.tsx`
- `index.ts`
- All existing tests

---

## Testing

No new test files required for this refactor. Components are pure presentational. Existing visual regression via the `/design` route covers them after the design page demos are added.

---

## Success Criteria

- `WalletDetailPage.tsx` is ≤ 80 lines
- Each extracted component has a single clear responsibility
- All four components appear in the design page under the Balance group
- `npm run build` and `npm run lint` pass with no errors
