# Balance Adjustment Page Design

**Date:** 2026-05-28  
**Scope:** Modify `TransactionPage` to handle `type === 'adjustment'` with a locked title, simplified single-item layout, and target-balance UX.

---

## Overview

When a transaction's type is `adjustment`, the page shows a specialized layout:
- Title locked to "Balance Adjustment" (no type dropdown)
- Single wallet + target-balance amount row (no category list)
- Date/time + note fields only (no repeat, no reconciliation, no status toggle)
- Save button in header, Delete button at bottom (edit mode only)

User enters the **target balance** (what they want the wallet to show after save). The system computes the adjustment delta internally.

---

## Data Flow

### Draft Fields (additions to `TransactionDraft`)

| Field | Type | Purpose |
|---|---|---|
| `adjustmentTargetBalance` | `number` | What the user enters — the desired final wallet balance |
| `adjustmentBaseBalance` | `number` | Wallet balance WITHOUT this adjustment — computed once at init, used at save |

### Init

**New transaction:**
```
adjustmentBaseBalance = walletCurrentAmount(wallet, allTransactions)
adjustmentTargetBalance = walletCurrentAmount(wallet, allTransactions)  // start at current balance
```

**Edit existing adjustment:**
```
existingDelta = existing.items[0].amount
adjustmentBaseBalance = walletCurrentAmount(wallet, allTransactions) - existingDelta
adjustmentTargetBalance = walletCurrentAmount(wallet, allTransactions)  // current displayed balance
```

### Save

```
delta = adjustmentTargetBalance - adjustmentBaseBalance
items = [{ categoryId: 'adjustment-balance-adjustment', amount: delta }]
```

Delta can be positive (adding) or negative (subtracting). Stored in `items[0]`. `signedWalletAmount` in `balanceCalculations.ts` already returns adjustment amount directly — no changes needed there.

### Calculator

- Initialized with `adjustmentTargetBalance` (not items amount)
- `onPressCalcKey` updates `adjustmentTargetBalance` (not items)
- Keyboard auto-opens on page load (`focusedIndex: 0` in initial draft for adjustment type)

---

## Components

### `TransactionHeader` (modify)

When `type === 'adjustment'`: render static `<span>Balance Adjustment</span>` instead of `<TransactionTypeDropdown>`. Type is locked — no change allowed.

### `AdjustmentPrimaryCard` (new)

Location: `src/features/transaction/TransactionPage/components/AdjustmentPrimaryCard.tsx`

Single card, two rows:
1. **Wallet row** — wallet icon + name (tappable to switch wallet). No balance shown.
2. **Amount row** — label "Adjustment Amount" on left, target balance value on right (tappable to open calculator keyboard, highlighted when focused).

Props:
```ts
interface AdjustmentPrimaryCardProps {
  wallet: Wallet | undefined
  targetBalance: number
  currency: string
  isAmountFocused: boolean
  onWalletClick: () => void
  onAmountClick: () => void
}
```

Styled same as `TransactionPrimaryCard` (same card container, same row separator pattern).

### `TransactionPage` (modify)

When `type === 'adjustment'`:
- Render `AdjustmentPrimaryCard` instead of `TransactionPrimaryCard` / `TransferPrimaryCard`
- Pass `walletReconciliationEnabled={false}` to `TransactionDetailsCard` (hides reconciliation row)
- Details card gets only date + note (status always `'paid'` → repeat row hidden by existing condition; reconciliation disabled via prop)
- Delete button: full-width, existing danger variant, edit mode only (no change to existing delete pattern)

New props on `TransactionPageProps`:
```ts
adjustmentTargetBalance: number
onFocusAdjustmentAmount: () => void
```

`handleFocusItem` path for adjustment: call `onFocusAdjustmentAmount` which sets `focusedIndex: 0` and inits calc with `adjustmentTargetBalance`.

### `TransactionDetailsCard` (no change)

Existing conditional logic already handles adjustment correctly:
- `status === 'paid'` → repeat row hidden
- `walletReconciliationEnabled={false}` → reconciliation row hidden
- Date row + note field remain

---

## `transactionForm.ts` Changes

### `validateDraft`

Add `adjustment` case before the generic items check:

```ts
if (draft.type === 'adjustment') {
  // only walletId needed — items built at save time
  return errors  // walletId already checked above
}
```

### `buildTransaction`

No change needed. Items are fully built in the save handler before calling `buildTransaction`.

---

## `useTransactionPage.ts` Changes

### Init

- Import `walletCurrentAmount` from `@/features/balance`
- Import `useTransactionStore` to get all transactions for balance computation
- Compute `adjustmentBaseBalance` and `adjustmentTargetBalance` in `useTransactionPageDraft`
- Set `focusedIndex: 0` in initial draft when `seedType === 'adjustment'` or `existing?.type === 'adjustment'`

### Save handler

- Compute `delta = adjustmentTargetBalance - adjustmentBaseBalance`
- Build `items = [{ categoryId: 'adjustment-balance-adjustment', amount: delta }]`
- Pass built items into `buildTransaction`

### New handlers

```ts
onFocusAdjustmentAmount: () => {
  updateDraft({ focusedIndex: 0 })
  // calc reset handled in TransactionPage via handleFocusItem analog
}
onPressCalcKey: (_key, result) => {
  if (type === 'transfer') return updateDraft({ transferAmount: result })
  if (type === 'adjustment') return updateDraft({ adjustmentTargetBalance: result })
  return updateDraft({ items: items.map(...) })
}
```

---

## File Checklist

| File | Action |
|---|---|
| `src/stores/transactionDraftStore.ts` | Add `adjustmentTargetBalance`, `adjustmentBaseBalance` fields |
| `src/features/transaction/transactionForm.ts` | Add `adjustment` case to `validateDraft` |
| `src/features/transaction/TransactionPage/components/TransactionHeader.tsx` | Lock title for adjustment type |
| `src/features/transaction/TransactionPage/components/AdjustmentPrimaryCard.tsx` | New component |
| `src/features/transaction/TransactionPage/components/index.ts` | Export `AdjustmentPrimaryCard` |
| `src/features/transaction/TransactionPage/TransactionPage.tsx` | Render adjustment variant, new props |
| `src/features/transaction/TransactionPage/useTransactionPage.ts` | New draft fields, save logic, calc handler |

---

## Out of Scope

- No changes to routing — adjustment uses existing `/transaction` and `/transaction/:id` routes
- No changes to balance calculations (`balanceCalculations.ts`) — `signedWalletAmount` already handles adjustment
- No changes to transaction list display (`transactionDisplay.ts`) — already handles adjustment color
- No repeat support for adjustment transactions
- No exchange rate support for adjustment transactions (always wallet currency)
