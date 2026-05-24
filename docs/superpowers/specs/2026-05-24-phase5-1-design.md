# Money Tracker — Phase 5.1 Design Spec
Date: 2026-05-24

## Scope

Phase 5.1 adds a per-wallet reconciliation toggle. Reconciliation (cleared flag) introduced in Phase 5 is now opt-in per wallet. When disabled on a wallet, all reconciliation UI is hidden for that wallet.

**In scope:**
- `reconciliationEnabled?: boolean` field on `Wallet` type
- `isReconciliationEnabled(wallet)` pure helper
- Reconciliation toggle in wallet form (Settings → Wallets → Edit Wallet)
- Gate `WalletDetailPage` dual balance and swipe rows on the flag
- Gate `TransactionPage` cleared checkbox on the flag

**Not in scope:**
- Migrating existing cleared data when flag is toggled off
- Bulk-clearing or bulk-unclearing transactions
- Any other wallet settings changes

**Defaults:**
- New wallets: `reconciliationEnabled` omitted → disabled
- Existing wallets: `reconciliationEnabled` undefined → treated as disabled
- No Dexie schema version bump needed (optional field)

---

## Data Model

Add to `Wallet` in `src/types/domain.ts`:

```ts
export type Wallet = {
  id: string
  name: string
  type: WalletType
  currency: string
  balance: number
  creditLimit?: number
  color: string
  icon: string
  reconciliationEnabled?: boolean   // NEW
}
```

`undefined` equals `false`. No migration required.

---

## Helper

Add to `src/features/balance/balanceCalculations.ts`:

```ts
export function isReconciliationEnabled(wallet: Wallet): boolean {
  return wallet.reconciliationEnabled === true
}
```

Used as the single gate for all reconciliation UI. Pure function, easy to test.

---

## Wallet Form Toggle

`WalletFormPage` adds a reconciliation toggle after the Credit Limit field (credit card) or Starting Balance field (payment wallet). Uses existing form field patterns.

```tsx
<Field label="Reconciliation">
  <ToggleInput
    checked={form.reconciliationEnabled ?? false}
    onChange={(checked) => setForm({ ...form, reconciliationEnabled: checked })}
  />
</Field>
```

If no `ToggleInput` component exists in `src/components`, use a styled `<input type="checkbox">` following the existing `Field` + input pattern.

`WalletFormPage` already manages `form` as `Wallet` state. Adding `reconciliationEnabled` to the form state flows through the existing `onSubmit(form, setError)` call without changes to the container or hook.

---

## Gating Reconciliation UI

### WalletDetailPage

`WalletDetailPage` already receives `wallet` prop. Check `isReconciliationEnabled(wallet)` inline:

- **Enabled**: existing behavior — dual balance bars (Book + Cleared), `SwipeableTransactionRow`, uncleared label
- **Disabled**: single balance bar (Book only, green), plain `Link` rows (existing pre-Phase-5 row markup), no Cleared bar, no uncleared label

```tsx
const reconciliation = isReconciliationEnabled(wallet)

// Balance section:
{reconciliation && (
  <div>  {/* Cleared bar */} </div>
)}

// Rows:
{rows.map((row) => reconciliation
  ? <SwipeableTransactionRow key={row.transaction.id} ... />
  : <Link key={row.transaction.id} to={`/transaction/${row.transaction.id}`}><Card ...></Card></Link>
)}
```

No new props to `WalletDetailPage` — `wallet` is already there.

### TransactionPage

Cleared checkbox guard in `TransactionPage.tsx` currently:
```tsx
{!isPlanned && type !== 'transfer' && (
```

Add wallet reconciliation check. `useTransactionPage` already computes `wallet`:
```ts
const wallet = wallets.find((item) => item.id === walletId)
```

Add `walletReconciliationEnabled: boolean` to `TransactionPageProps` and pass it from the hook:
```ts
walletReconciliationEnabled: isReconciliationEnabled(wallet ?? {} as Wallet),
```

Guard in `TransactionPage.tsx`:
```tsx
{!isPlanned && type !== 'transfer' && walletReconciliationEnabled && (
```

---

## File Changes Summary

| File | Change |
|---|---|
| `src/types/domain.ts` | Add `reconciliationEnabled?: boolean` to `Wallet` |
| `src/features/balance/balanceCalculations.ts` | Add `isReconciliationEnabled(wallet)` |
| `src/features/balance/__tests__/balanceCalculations.test.ts` | Tests for `isReconciliationEnabled` |
| `src/features/settings/WalletFormPage/WalletFormPage.tsx` | Add reconciliation toggle field |
| `src/features/balance/WalletDetailPage/WalletDetailPage.tsx` | Gate dual balance + rows on flag |
| `src/features/transaction/TransactionPage/TransactionPage.tsx` | Add `walletReconciliationEnabled` to cleared checkbox guard |
| `src/features/transaction/TransactionPage/useTransactionPage.ts` | Compute + return `walletReconciliationEnabled` |

---

## Testing

- `isReconciliationEnabled(wallet)`:
  - `undefined` → `false`
  - `false` → `false`
  - `true` → `true`
- `WalletFormPage` renders reconciliation toggle; toggling updates form state
- `WalletDetailPage` shows single balance bar when `reconciliationEnabled` is false
- `WalletDetailPage` shows dual balance + swipeable rows when `reconciliationEnabled` is true
- Cleared checkbox hidden in `TransactionPage` when wallet has `reconciliationEnabled: false`
- Cleared checkbox visible when wallet has `reconciliationEnabled: true` and transaction is paid, non-transfer

---

## Acceptance Criteria

- New wallets default to reconciliation disabled
- Existing wallets without the field treated as disabled
- Wallet form shows reconciliation toggle; save persists the value
- Wallet detail with reconciliation disabled: single balance bar, plain tap-to-edit rows
- Wallet detail with reconciliation enabled: dual balance bars, swipe-to-clear rows
- Transaction form cleared checkbox hidden for wallets with reconciliation disabled
- No Dexie schema migration required
