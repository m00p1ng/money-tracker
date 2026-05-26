# Wallet Balance Adjustment Transactions

**Date:** 2026-05-27  
**Status:** Approved

## Summary

When creating a wallet, auto-create an adjustment transaction representing the opening balance. When editing a wallet's balance, auto-create an adjustment transaction for the difference. This makes balance history traceable in the transaction log.

---

## 1. Domain & Data Model

### New TransactionType

Add `'adjustment'` to the `TransactionType` union in `src/types/domain.ts`:

```ts
export type TransactionType = 'expense' | 'income' | 'transfer' | 'adjustment'
```

### New Category

Add one seeded category:

| Field | Value |
|-------|-------|
| id | `adjustment-balance-adjustment` |
| name | `Balance Adjustment` |
| type | `adjustment` |
| icon | `fa-sliders` |
| level | 1 |
| isDefault | true |

### Signed Amounts for Adjustment Transactions

Adjustment transactions are the only type where `TransactionItem.amount` is **signed**:
- Positive = balance increase
- Negative = balance decrease

All other transaction types continue using positive amounts with sign derived from transaction type + wallet type.

### wallet.balance Rule

- **New wallets**: stored as `0`. Opening balance is captured in the adjustment transaction instead.
- **Existing wallets**: `wallet.balance` is never changed (backward compatible). Diffs for edits are computed against `walletCurrentAmount`.

---

## 2. Balance Calculations

### `signedWalletAmount` (`balanceCalculations.ts`)

Add a new branch before existing type checks:

```ts
if (transaction.type === 'adjustment') {
  return amountInWalletCurrency(transaction, wallet)
  // amount is signed; no flip for wallet type
}
```

`amountInWalletCurrency` already handles exchange rates, so multi-currency wallets work correctly.

### No changes needed

- `monthlyIncome` / `monthlyExpense` — filter by type, adjustment is excluded automatically
- `walletTransactions` — filters by `walletId`, adjustment transactions are included automatically

---

## 3. useWalletEditPage Logic

Replace `useFormCrud` with manual submit handling to coordinate wallet + transaction creation.

Also inject `useTransactionStore` to access `transactions` (for diff) and `add` (for transaction creation).

### Create wallet (`!existing`)

1. Validate form
2. Save wallet with `balance: 0`
3. If `form.balance !== 0`: create adjustment transaction:
   - `type: 'adjustment'`
   - `walletId: wallet.id`
   - `currency: wallet.currency`
   - `items: [{ categoryId: 'adjustment-balance-adjustment', amount: form.balance }]`
   - `note: 'Opening Balance'`
   - `date: today`
4. Navigate to `/balance`

### Edit wallet (`existing`)

1. Validate form
2. Compute `diff = form.balance - walletCurrentAmount(existing, transactions)`
3. Save wallet as-is (wallet.balance field unchanged)
4. If `diff !== 0`: create adjustment transaction:
   - `type: 'adjustment'`
   - `walletId: existing.id`
   - `currency: existing.currency`
   - `items: [{ categoryId: 'adjustment-balance-adjustment', amount: diff }]`
   - `note: 'Balance Adjustment'`
   - `date: today`
5. Navigate to `/balance`

### Form initialization (edit mode)

Initialize `form.balance` to `walletCurrentAmount(existing, transactions)` instead of `existing.balance`.

Pass a `balanceLabel` prop to `WalletEditPage`:
- Create: `'Starting Balance'`
- Edit: `'Current Balance'`

---

## 4. UI Changes

### `WalletEditPage.tsx`

Add `balanceLabel: string` prop. Replace the hardcoded `"Starting Balance"` label with this prop.

### Transaction rendering (adjustment type)

Wherever transactions are rendered in lists (e.g. `WalletDetailPage`):
- Color: green if `amount > 0`, red if `amount < 0`
- Sign prefix: `+` / `−`
- Label: use `transaction.note` (`'Opening Balance'` or `'Balance Adjustment'`)

### Seed & migration

`seedDatabase()` in `seed.ts` — add the new category to the seeded data (covers fresh installs).

For existing users: `seedDatabase()` returns early when `walletCount > 0`, so the category won't be inserted by seed alone. Add a `ensureSystemCategories()` function in `seed.ts` that upserts the `Balance Adjustment` category via `db.categories.put(...)`. Call it in `bootstrapStores()` before `useCategoryStore.getState().load()`. Using `put` (upsert) makes it safe to run every startup.

---

## 5. Files to Change

| File | Change |
|------|--------|
| `src/types/domain.ts` | Add `'adjustment'` to `TransactionType` |
| `src/db/seed.ts` | Add `Balance Adjustment` to seed + add `ensureSystemCategories()` |
| `src/stores/bootstrap.ts` | Call `ensureSystemCategories()` before store loads |
| `src/features/balance/balanceCalculations.ts` | Handle `adjustment` in `signedWalletAmount` |
| `src/features/balance/WalletEditPage/useWalletEditPage.ts` | Replace `useFormCrud`, inject transaction store, implement create/edit logic |
| `src/features/balance/WalletEditPage/WalletEditPage.tsx` | Add `balanceLabel` prop |
| Transaction list components | Handle `adjustment` type in rendering |
