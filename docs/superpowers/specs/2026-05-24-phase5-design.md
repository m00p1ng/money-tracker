# Money Tracker — Phase 5 Design Spec
Date: 2026-05-24

## Scope

Phase 5 implements the cleared flag reconciliation workflow deferred from Phase 3. No new routes, no data model schema changes, no statement import. Focus: marking individual transactions as cleared, displaying cleared vs book balance on wallet detail, and a swipe-to-clear gesture on wallet detail rows.

**In scope:**
- `toggleCleared(id)` action on transaction store
- `walletClearedAmount()` balance helper
- Dual balance display (Book / Cleared) on wallet detail card
- Swipe-left gesture on wallet detail transaction rows to toggle cleared
- Cleared badge on cleared rows in wallet detail
- Cleared checkbox in transaction form (paid transactions only)

**Deferred:**
- Statement import / CSV matching
- Budget tab
- Report tab
- Online exchange-rate fetching

---

## Dependencies

No new packages. `framer-motion` already installed (Phase 4).

---

## Data Model

`cleared: boolean` already exists on `Transaction`. No schema version bump needed.

---

## Store

### transactionStore — toggleCleared

```ts
toggleCleared: async (id: string) => {
  const tx = get().transactions.find((t) => t.id === id)
  if (!tx) return
  const updated = { ...tx, cleared: !tx.cleared }
  await db.transactions.update(id, { cleared: updated.cleared })
  set((s) => ({ transactions: s.transactions.map((t) => t.id === id ? updated : t) }))
}
```

---

## Balance Calculations

### walletClearedAmount

New helper in `src/features/balance/balanceCalculations.ts`:

```ts
export function walletClearedAmount(wallet: Wallet, transactions: Transaction[]): number {
  return walletTransactions(wallet.id, transactions)
    .filter((t) => t.cleared)
    .reduce((sum, t) => sum + signedWalletAmount(wallet, t), wallet.balance)
}
```

Book balance = existing `walletCurrentAmount` (all transactions).
Cleared balance = `walletClearedAmount` (cleared-only transactions).
Uncleared amount = book − cleared.

---

## Wallet Detail Card

`WalletDetailPageContainer` computes `clearedAmount` via `walletClearedAmount` and passes it as a prop alongside existing `currentAmount`.

### Payment wallet — replaces single balance section

```
Book     ฿9,500    [AnimatedBar — green, existing]
Cleared  ฿8,200    [AnimatedBar — accent/purple]
                   ฿1,300 uncleared  (text-white/40, small)
```

Two stacked label+bar rows. Uncleared amount shown as `฿X uncleared` below the cleared bar. If uncleared is zero, omit that label.

### Credit card — replaces single debt section

```
Total Debt   ฿3,200   (existing)
Cleared Debt ฿2,800   [AnimatedBar — accent/purple]
             ฿400 uncleared
```

Grid layout unchanged — Debt / Available / Limit cells remain. Cleared debt bar added below the grid.

---

## Swipeable Transaction Row

New component: `src/features/balance/WalletDetailPage/SwipeableTransactionRow.tsx`

### Props

```ts
type SwipeableTransactionRowProps = {
  row: RunningWalletRow
  wallet: Wallet
  categories: Category[]
  onToggleCleared: (id: string) => void
}
```

### Structure

```
[relative container, overflow-hidden]
  [action button — absolute right-0, w-[72px], full height, bg-accent/20]
    if cleared: fa-circle-check (text-income) + "Unclear"
    if not cleared: fa-circle (text-white/40) + "Clear"
  [motion.div — row content, drag="x"]
    [existing row content — icon, name, date, amount, running amount]
    [cleared badge — fa-circle-check accent, text-[12px] — only when cleared]
```

### Drag behavior

- `drag="x"`, `dragConstraints={{ left: -72, right: 0 }}`
- `dragElastic={0.1}`
- On `onDragEnd`: if `offset.x < -36` → `animate` to `x: -72`; else snap to `x: 0`
- Tap action button → `onToggleCleared(row.transaction.id)` → animate row back to `x: 0`
- Tapping row content with no drag → navigate to `/transaction/:id` (use `useNavigate`, call only when drag distance < 4px)

### Cleared badge

Small `fa-circle-check` icon in accent color, `text-[12px]`, shown on the right side of the row (before the amount column) when `transaction.cleared`. Hidden otherwise.

---

## Transaction Form

### Cleared Checkbox

Visible only when `status === 'paid'`. Hidden for `planned` and `overdue`.

**Placement:** After the paid status toggle row, before the repeat field.

**Initial value:** `transaction.cleared ?? false` when editing; `false` for new transactions.

**Behavior:**
- Toggling paid status off (`planned`/`overdue`) resets `cleared` to `false`
- On save: `cleared` included in the transaction payload

**UI:** Same row style as other form fields. Left: `fa-circle-check` icon + "Cleared" label. Right: toggle switch.

---

## Container / Hook Changes

### useWalletDetailPage.ts

Expose `toggleCleared` from `transactionStore`:

```ts
const toggleCleared = useTransactionStore((s) => s.toggleCleared)
return { wallet, transactions, categories, currentAmount, clearedAmount, toggleCleared }
```

Compute `clearedAmount`:

```ts
const clearedAmount = wallet ? walletClearedAmount(wallet, transactions) : 0
```

### WalletDetailPageContainer.tsx

Pass `clearedAmount` and `onToggleCleared` to `WalletDetailPage`.

---

## File Changes Summary

| File | Change |
|---|---|
| `src/stores/transactionStore.ts` | Add `toggleCleared(id)` |
| `src/features/balance/balanceCalculations.ts` | Add `walletClearedAmount()` |
| `src/features/balance/WalletDetailPage/WalletDetailPage.tsx` | Dual balance display, use `SwipeableTransactionRow` |
| `src/features/balance/WalletDetailPage/WalletDetailPageContainer.tsx` | Pass `clearedAmount`, `onToggleCleared` |
| `src/features/balance/WalletDetailPage/useWalletDetailPage.ts` | Compute `clearedAmount`, expose `toggleCleared` |
| `src/features/balance/WalletDetailPage/SwipeableTransactionRow.tsx` | New — swipe-to-clear row component |
| `src/features/transaction/TransactionPage.tsx` | Add cleared checkbox (paid only) |
| `src/features/balance/__tests__/balanceCalculations.test.ts` | Tests for `walletClearedAmount` |

---

## Testing

- `walletClearedAmount` counts only cleared transactions, starts from `wallet.balance`
- Uncleared amount = book − cleared
- `toggleCleared` flips flag, persists to Dexie, updates store
- Cleared checkbox hidden for planned/overdue, visible for paid
- Toggling status to non-paid resets cleared to false
- Swipe row: drag past threshold exposes action button; tap toggles cleared; row snaps back

---

## Acceptance Criteria

- `toggleCleared(id)` flips `cleared` flag and persists to IndexedDB
- Wallet detail shows Book balance and Cleared balance with separate bars
- Uncleared amount label visible when Book > Cleared; hidden when equal
- Swipe left on wallet detail row reveals Clear/Unclear button
- Tapping Clear/Unclear toggles `cleared` and snaps row back
- Cleared badge visible on cleared rows in wallet detail
- Cleared checkbox appears in transaction form for paid transactions
- Cleared checkbox hidden for planned/overdue transactions
- Toggling status to planned/overdue resets cleared to false
- No new routes added
