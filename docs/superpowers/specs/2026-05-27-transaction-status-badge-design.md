# Transaction Status Badge on Date Row

**Date:** 2026-05-27

## Summary

Add a clickable status badge (`Paid` / `Overdue` / `Planned`) to the date row in the TransactionPage. Status is stored as an explicit `TransactionStatus` field in the draft (Option A). Also redesign the TransactionPage rows to remove all labels and follow `TransactionRow` visual style.

---

## Part 1: Row Redesign (no labels)

Remove all small gray label text from every row component:
- `WalletSelectorRow` — remove `<p>Wallet</p>` label
- `DateTimeRow` — remove `<p>Date & Time</p>` label
- `ReconciliationRow` — remove `<p>Reconciliation</p>` label
- `RepeatRow` — remove `<p>Repeat</p>` label
- `ExchangeRateRow` — remove label (check component)
- `TransactionDetailsCard` — remove `<p>Details</p>` section header
- `TransactionPrimaryCard` — remove `<span>Total</span>` label, keep total amount

Icon sizing: `h-8 w-8` → `h-10 w-10` on all rows to match `TransactionRow`.

---

## Part 2: Status Badge on Date Row

### Domain

`Transaction.status: TransactionStatus` (`'paid' | 'overdue' | 'planned'`) already exists in `domain.ts`.

### Draft changes

Add `status: TransactionStatus` to `TransactionDraft` in `transactionDraftStore.ts`.

**Initialization defaults:**
- New transaction: auto-derive from date — future date → `'planned'`, today/past → `'paid'`
- Edit existing: `existing.status ?? 'paid'`
- Repeat materialization: `'paid'`

### Toggle behavior

Badge is a clickable button on the date row:

| Current status | Click result |
|---------------|--------------|
| `paid` | `date < now` → `overdue`; `date ≥ now` → `planned` |
| `overdue` | `paid` |
| `planned` | `paid` |

Status does **not** auto-update when the user changes the date — the user controls it explicitly after initial auto-set.

### Visual design

Text-only badges — no icons.

| Status | Color | Label |
|--------|-------|-------|
| `paid` | green (`#4ade80`) | Paid |
| `overdue` | red (`text-danger`) | Overdue |
| `planned` | amber (`#fbbf24`) | Planned |

Badge replaces the existing "Planned" badge in `DateTimeRow`.

### RepeatRow / ReconciliationRow visibility

| Row | Show when |
|-----|-----------|
| `RepeatRow` | `status !== 'paid'` (was: `isPlanned`) |
| `ReconciliationRow` | `status === 'paid' && walletReconciliationEnabled` (was: `!isPlanned && walletReconciliationEnabled`) |

### Save / buildTransaction

- Pass `status` from draft directly to `buildTransaction`
- Remove `markedPaid` param — `buildTransaction` accepts `status: TransactionStatus` directly, no re-derivation
- `cleared`: only set when `status === 'paid'` (unchanged behaviour)
- `repeat`: only stored when `status !== 'paid'` (unchanged behaviour)
- Remove `isPlanned` from `useTransactionSaveHandler` options

---

## Files to Change

| File | Change |
|------|--------|
| `src/stores/transactionDraftStore.ts` | Add `status: TransactionStatus` to `TransactionDraft` |
| `src/features/transaction/transactionForm.ts` | Replace `markedPaid` with `status` param in `buildTransaction`; remove `deriveTransactionStatus` call inside it |
| `src/features/transaction/TransactionPage/useTransactionPage.ts` | Remove `isPlanned` derivation; read `status` from draft; add `onToggleStatus`; pass `status` to save handler |
| `src/features/transaction/TransactionPage/TransactionPage.tsx` | Replace `isPlanned` prop with `status`; add `onToggleStatus` prop |
| `src/features/transaction/TransactionPage/components/TransactionDetailsCard.tsx` | Pass `status`/`onToggleStatus` to `DateTimeRow`; fix RepeatRow/ReconciliationRow conditions |
| `src/features/transaction/TransactionPage/components/DateTimeRow.tsx` | Replace `isPlanned` with `status`/`onToggleStatus`; render clickable badge |
| `src/features/transaction/TransactionPage/components/WalletSelectorRow.tsx` | Remove label, increase icon size |
| `src/features/transaction/TransactionPage/components/ReconciliationRow.tsx` | Remove label, increase icon size |
| `src/features/transaction/TransactionPage/components/RepeatRow.tsx` | Remove label, increase icon size |
| `src/features/transaction/TransactionPage/components/TransactionPrimaryCard.tsx` | Remove "Total" label, increase icon sizes |

---

## Tests to Update

- `src/features/transaction/__tests__/transactionForm.test.ts` — update `buildTransaction` call sites to pass `status` instead of `markedPaid`
- `src/features/transaction/__tests__/transactionStatus.test.ts` — verify `deriveTransactionStatus` still works (it's used externally too, keep it)
