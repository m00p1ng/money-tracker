# TransactionPage Redesign

**Date:** 2026-05-25  
**Goal:** Improve visual hierarchy — all rows currently share equal visual weight, making the primary content (wallet + items + total) indistinguishable from metadata (date, note).

---

## Design Decisions

| Question | Decision |
|---|---|
| Layout approach | Grouped sections: primary card + quieter details section |
| Transfer layout | Side-by-side From/To wallets with arrow |
| Amount color | Type-aware: expense=red, income=green, transfer=accent |
| Header | Unchanged — `PageHeader` with `TypePickerDropdown` as centered title |

---

## Expense / Income Layout

### Primary Card (`bg-white/8 border-white/[0.085] rounded-2xl overflow-hidden`)

Sections separated by internal dividers, no outer gap between them:

1. **Wallet row** (tappable) — wallet icon + name + balance, chevron right
2. **Category item rows** — one per item:
   - Left zone (tappable → change category): icon + name
   - Right zone (tappable → focus calculator keyboard): amount in type color
   - Remove button (`×`) only when item count > 1
3. **Add Item row** — dashed top border, centered "+ Add Item" in accent
4. **Total footer** — `bg-[color]/10 border-t border-[color]/20`, label left, `font-size-xl font-bold` amount right
   - Expense: red (`text-danger`, `bg-danger/10`, `border-danger/20`)
   - Income: green (`text-green-500`, `bg-green-500/10`, `border-green-500/20`)

Exchange rate row appears **inside** the primary card between items and total footer, only when `currency !== wallet.currency`.

### Details Section

Section label: `text-[9px] uppercase tracking-[1.5px] text-white/20` — "Details"

Single grouped card (`bg-white/5 border-white/8 rounded-2xl overflow-hidden`) with internal dividers:

- **Date & Time** — always shown
- **Reconciliation** — only when `walletReconciliationEnabled && !isPlanned`; accent color when cleared
- **Repeat** — only when `isPlanned`; accent color when not "never"
- **Note** — always shown (last row, no bottom divider)

### Delete Button

Edit mode only. Below details section. `bg-danger/[0.07] border border-danger/20 rounded-2xl py-3 text-sm font-semibold text-danger`.

---

## Transfer Layout

### Primary Card

1. **Side-by-side wallets** — two equal columns with `→` arrow centered between:
   - Each column: label ("From"/"To"), wallet icon (36×36), name bold, balance small
   - Full row tappable to open wallet picker
2. **Exchange rate row(s)** — inline row inside card, only when currencies differ:
   - Label left, editable value right (same pattern as current `ExchangeRateRow`)
   - Two rows possible: one for source currency, one for destination currency
3. **Amount footer** — accent purple (`text-accent-light`, `bg-accent/10`, `border-accent/20`)

### Details Section

Same structure as expense/income but without Reconciliation row (transfer has no reconciliation):

- Date & Time
- Repeat (when `isPlanned`)
- Note

---

## Component Changes

| Component | Change |
|---|---|
| `TransactionPage.tsx` | Replace `space-y-2` layout with primary card + details section grouping |
| `CategoryItemsCard.tsx` | Remove outer card wrapper (parent card owns border/bg); remove internal total row (moved to parent footer) |
| `WalletSelectorRow.tsx` | Add `variant?: 'standalone' \| 'flat'` prop; `flat` removes own border/bg so it sits cleanly inside the primary card |
| `DateTimeRow`, `ReconciliationRow`, `RepeatRow`, `NoteField` | Inside-card style (no own border/bg, use internal dividers) |
| `ExchangeRateRow.tsx` | Inside-card style |
| New: `TransactionPrimaryCard.tsx` | Composes wallet + items + exchange rate + total footer for expense/income |
| New: `TransferPrimaryCard.tsx` | Composes side-by-side wallets + exchange rates + amount footer |
| New: `TransactionDetailsCard.tsx` | Composes date + reconciliation + repeat + note into grouped section |

`TransactionHeader.tsx` — **unchanged**.

---

## Data Flow

No changes to `useTransactionPage.ts`, `TransactionPageContainer.tsx`, or any store/hook logic. Pure presentational restructuring.

---

## Testing

- Existing `CategoryItemsCard` tests verify item rendering — update snapshots/assertions for removed wrapper and total row.
- Visual: verify all conditional rows (exchange rate, reconciliation, repeat, delete) appear/disappear correctly per mode and state.
- Transfer mode: verify exchange rate rows appear for source and destination when currencies differ independently.
