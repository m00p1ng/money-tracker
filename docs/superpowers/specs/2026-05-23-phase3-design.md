# Money Tracker — Phase 3 Design Spec
Date: 2026-05-23

## Scope

Phase 3 upgrades the transaction foundation that was deferred from Phase 1 and Phase 2. The goal is to make transaction entry expressive enough for transfers, multiple currencies, planned payments, overdue payments, repeat schedules, and a useful Home upcoming view before adding Budget, Report, or reconciliation workflows.

**In scope:**
- Transfer transaction type
- Multi-currency transaction entry
- Manual exchange-rate prompts inside transaction entry, prefilled from currency settings
- Planned / overdue / paid status logic
- Repeat transaction rules
- 12-month virtual repeat schedule projection
- Upcoming Transactions section on Home
- Materializing one virtual repeat occurrence into a real transaction when the user acts on it

**Deferred to later phases:**
- Reconciliation and statement matching
- Budget tab
- Report tab
- Online exchange-rate fetching
- Backend sync or account system
- Bulk-generated recurring transaction rows

Data remains local-only in IndexedDB.

---

## Existing Foundation

Phase 1 and Phase 2 provide:
- React 19 + Vite + Tailwind CSS v4
- React Router v7
- Dexie IndexedDB tables for transactions, wallets, categories, currencies, and settings
- Zustand write-through stores for core models
- Home tab with income/expense summary and today's transactions
- Transaction add/edit flow for expense and income transactions
- Balance tab, wallet detail, and wallet balance helpers
- Settings screens for wallets, categories, currencies, and theme

No Dexie schema version bump is required for Phase 3. The existing `transactions` table already stores by `id, type, walletId, date, status`, and the new fields do not need indexes for this phase.

---

## Data Model

### Transaction Type

Expand transaction types:

```ts
export type TransactionType = 'expense' | 'income' | 'transfer'
```

### Repeat Config

Replace the current loose `repeat?: string` type with a structured config:

```ts
export type RepeatPreset = 'never' | 'daily' | '2weeks' | 'monthly' | 'yearly' | 'custom'

export type RepeatConfig = {
  preset: RepeatPreset
  customEvery?: number
  customUnit?: 'day' | 'month' | 'year'
}
```

Rules:
- Missing repeat config and `preset: 'never'` both mean no repeat schedule.
- Custom repeat requires `customEvery` between 1 and 31 and a `customUnit`.
- Repeat controls are available for planned and overdue transactions.

### Transaction Fields

Use these fields:
- `walletId`: source wallet for expense, income, and transfer.
- `toWalletId`: destination wallet for transfer transactions only.
- `currency`: transaction currency.
- `exchangeRate`: required when the transaction currency differs from the source wallet currency.
- `toExchangeRate`: required for transfers when the transaction currency differs from the destination wallet currency.
- `status`: `paid`, `planned`, or `overdue`.
- `repeat`: structured repeat config on source transactions.
- `repeatSourceId`: optional source transaction id for a materialized repeat occurrence.
- `repeatOccurrenceDate`: optional `YYYY-MM-DD` date for a materialized repeat occurrence.
- `cleared`: remains optional and unused until reconciliation.

Add optional fields to `Transaction`:

```ts
toExchangeRate?: number
repeatSourceId?: string
repeatOccurrenceDate?: string
```

These fields make repeat occurrence dedupe explicit. A virtual occurrence for `source.id` and `YYYY-MM-DD` is hidden when a real transaction exists with matching `repeatSourceId` and `repeatOccurrenceDate`.

---

## Status Logic

Status is derived at save time unless the user explicitly marks the transaction as paid.

| Condition | Saved status |
|---|---|
| User marks paid | `paid` |
| Not marked paid and date is in the future | `planned` |
| Not marked paid and date is now or earlier | `overdue` |

Use a pure helper for this logic so the transaction form, store tests, and future workflows share one rule.

Recommended helper:

```ts
deriveTransactionStatus(input: {
  date: string
  markedPaid: boolean
  now?: Date
}): TransactionStatus
```

---

## Multi-Currency Transactions

Transaction currency is selected from configured currencies.

Rules:
- Expense and income default to the selected wallet's currency.
- Transfer defaults to the source wallet's currency.
- If transaction currency differs from the source wallet currency, show an exchange-rate field.
- The field is prefilled from the stored currency rate.
- The user can override the exchange rate per transaction.
- Required exchange rates must be positive numbers with up to 4 decimal places.
- No online exchange-rate fetching is included.

Balance math must centralize conversion rules in shared helpers before UI code consumes them.

Recommended conversion responsibilities:
- `transactionTotal(transaction)` returns total in transaction currency.
- `amountInWalletCurrency(transaction, wallet)` converts the transaction amount into a wallet's currency.
- `signedWalletAmount(wallet, transaction)` handles payment wallets, credit-card debt, and transfers consistently.

For transfers, the source wallet side uses `exchangeRate` when the transaction currency differs from the source wallet currency. The destination wallet side uses `toExchangeRate` when the transaction currency differs from the destination wallet currency. If a side's wallet currency matches the transaction currency, that side uses a rate of `1`.

---

## Transfer Transactions

Transfer mode is selected from the transaction type control.

UI behavior:
- Type selector becomes Expense, Income, Transfer.
- Category section is hidden.
- Calculator amount represents the transfer amount.
- Show From Wallet and To Wallet rows.
- Currency defaults to the From Wallet currency.
- Show exchange-rate controls when the transaction currency differs from the source or destination wallet currency.

Validation:
- From Wallet is required.
- To Wallet is required.
- From Wallet and To Wallet must be different.
- Amount must be positive.
- Currency must exist.
- Required exchange rates must be positive and accept up to 4 decimal places.

Persistence:
- `type: 'transfer'`
- `walletId`: source wallet id
- `toWalletId`: destination wallet id
- `items`: empty array
- `currency`: selected transaction currency
- `exchangeRate`: source-side rate, set when needed
- `toExchangeRate`: destination-side rate, set when needed

Transfer rows in lists use a transfer icon and show `From Wallet -> To Wallet`.

---

## Transaction Form

Expense and income behavior stays close to the current form:
- Category items remain the amount model.
- Category picker remains expense/income only.
- Note and date fields remain available.
- Save validation still requires at least one category item with a positive amount.

New form fields:
- Transaction currency selector.
- Exchange-rate field when needed.
- Paid checkbox.
- Repeat field for planned and overdue transactions.

Repeat field:
- Hidden for paid transactions.
- Presets: Never, Daily, Every 2 Weeks, Monthly, Yearly, Custom.
- Custom shows every number 1-31 and unit Day, Month, Year.

Editing:
- Real transactions open at `/transaction/:id`.
- Virtual repeat occurrences open the transaction form with source data copied and the occurrence date prefilled.
- Saving a virtual occurrence creates a new real transaction with `status: 'paid'`, no repeat config, and repeat source metadata.

---

## Repeat Schedule Projection

Virtual repeat occurrences are computed in memory. They are not persisted until the user acts on one.

Projection rules:
- Project 12 months from today, inclusive.
- Skip transactions with no repeat config or `preset: 'never'`.
- Start from the source transaction date and advance by the configured interval.
- Include occurrences that fall within the 12-month window.
- Exclude occurrences already materialized as real transactions.
- Use stable virtual ids: `repeat:<sourceTransactionId>:<yyyy-mm-dd>`.

Supported intervals:
- Daily: +1 day
- Every 2 Weeks: +14 days
- Monthly: same day-of-month where possible, clamped for shorter months
- Yearly: same month/day where possible, clamped for leap-year edge cases
- Custom: +N day/month/year

Recommended helper responsibilities:
- `nextRepeatDate(date, repeat)` returns the next occurrence date.
- `projectRepeatOccurrences(transactions, now)` returns virtual occurrences for the 12-month window.
- `materializeRepeatOccurrence(source, occurrenceDate)` builds a real transaction draft.
- `hasMaterializedOccurrence(transactions, sourceId, occurrenceDate)` handles dedupe.

---

## Upcoming Transactions

Home adds an Upcoming section above Today's Transactions.

It shows:
- Existing overdue transactions.
- Existing planned transactions due within the next day.
- Virtual repeat occurrences projected over the 12-month schedule.

Ordering:
- Overdue first, oldest due date first.
- Planned and repeat occurrences next, nearest due date first.

Rows show:
- Category icon for expense/income, transfer icon for transfers.
- Category label for expense/income, `From Wallet -> To Wallet` for transfers.
- Due badge: Overdue, Today, Tomorrow, or formatted date.
- Amount in the transaction currency.
- Repeat indicator for virtual occurrences.

Interactions:
- Tap a real transaction to edit it.
- Tap a virtual repeat occurrence to open the transaction form prefilled for that occurrence.
- Saving the prefilled form creates a materialized transaction and returns to Home.

Empty state:
- If no overdue, planned, or projected repeat rows exist, omit the section.

---

## Routing

No new top-level tab is required.

Route behavior:

| Route | Component | Notes |
|---|---|---|
| `/transaction/new` | Transaction form | Expense/income/transfer capable |
| `/transaction/:id` | Transaction form | Edit real transaction |
| `/transaction/repeat/:sourceId/:date` | Transaction form | Materialize virtual repeat occurrence |

The repeat route date uses `YYYY-MM-DD`.

Bottom navigation remains:
- Home, Balance, and Setting enabled.
- Budget and Report visible but disabled.

---

## Error Handling

Use the current transaction form's alert-based validation style.

Blocked save reasons:
- Missing wallet.
- Missing destination wallet for transfer.
- Same source and destination wallet for transfer.
- Missing category item for expense/income.
- Non-positive transaction amount.
- Unknown currency.
- Missing, zero, negative, non-numeric, or more-than-4-decimal required exchange rate.
- Invalid repeat custom interval.

Missing data states:
- Missing wallet/category/currency shows compact blocked copy rather than crashing.
- Missing repeat source shows a compact not-found state with a back action.
- Attempting to materialize a duplicate repeat occurrence navigates to the existing materialized transaction.

---

## Testing

Add focused tests for:
- Status derivation for paid, planned, and overdue.
- Transaction form validation for expense, income, and transfer.
- Multi-currency exchange-rate validation, 4-decimal precision, and defaulting from currency settings.
- Balance calculations with converted currency values.
- Transfer balance effects for source and destination wallets.
- Repeat date advancement for daily, every 2 weeks, monthly, yearly, and custom intervals.
- Month-end and leap-year repeat clamping.
- 12-month repeat projection window.
- Virtual occurrence dedupe using `repeatSourceId` and `repeatOccurrenceDate`.
- Materializing a virtual occurrence into a real paid transaction.
- Upcoming section ordering and row rendering.
- Navigation from a virtual repeat row into the prefilled transaction form.
- Existing Phase 1/2 expense, income, Balance, and Settings behavior remains intact.

---

## Acceptance Criteria

Phase 3 is complete when:
- Users can save expense, income, and transfer transactions.
- Transfers update source and destination wallet balances correctly.
- Users can choose transaction currency and provide manual exchange rates when needed.
- Manual exchange rates accept up to 4 decimal places.
- Stored currency rates prefill transaction exchange-rate prompts.
- Transactions save with correct `paid`, `planned`, or `overdue` status.
- Users can configure repeat rules on planned and overdue transactions.
- Repeat schedules project visible occurrences up to 12 months ahead without bulk-writing rows.
- Home shows overdue, near-future planned, and virtual repeat rows in the Upcoming section.
- Tapping a virtual repeat row creates a real paid transaction for that occurrence.
- Materialized repeat occurrences are deduped from the virtual schedule.
- Reconciliation, Budget, and Report remain deferred.
- All data remains local-only in IndexedDB.
