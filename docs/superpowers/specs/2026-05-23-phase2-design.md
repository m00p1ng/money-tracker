# Money Tracker — Phase 2 Design Spec
Date: 2026-05-23

## Scope

Phase 2 delivers the deferred foundation screens from Phase 1. The goal is to make the app shell's Balance and Settings areas functional before adding deeper finance workflows.

**In scope:**
- Balance tab
- Payment account detail screen
- Credit card detail screen
- Settings tab
- Wallet management
- Category management
- Currency management
- Theme picker
- Bottom navigation updates for Home, Balance, and Setting

**Deferred to later phases:**
- Transfer transaction type
- Multi-currency transaction entry
- Exchange rate prompts inside transaction entry
- Repeat transactions
- Planned / overdue / paid status logic
- Upcoming Transactions section
- Reconciliation
- Budget tab
- Report tab
- Category reordering
- Language and date format editing

Phase 2 should not introduce a backend or account system. Data remains local-only in IndexedDB.

---

## Existing Foundation

Phase 1 already provides:
- React 19 + Vite + Tailwind CSS v4
- React Router v7
- Dexie IndexedDB tables for transactions, wallets, categories, currencies, and settings
- Zustand write-through stores for all core models
- Seed data for THB, one Cash wallet, settings, and default categories
- Theme token application through CSS custom properties
- Home tab and transaction add/edit flow for expense and income transactions

No Dexie schema migration is required for Phase 2. The existing version 1 schema already includes the tables and indexes needed for this scope:

```ts
db.version(1).stores({
  transactions: 'id, type, walletId, date, status',
  wallets: 'id',
  categories: 'id, parentId, type',
  currencies: 'code',
  settings: 'id',
})
```

The `Wallet` TypeScript type should add optional `creditLimit?: number`. This is compatible with the existing `wallets: 'id'` Dexie table because credit limit does not require a new index.

---

## Routing

Add these routes:

| Route | Component | Notes |
|---|---|---|
| `/balance` | Balance tab | Bottom nav visible |
| `/balance/wallet/:id` | Wallet detail | Bottom nav hidden |
| `/settings` | Settings tab | Bottom nav visible |
| `/settings/wallets` | Wallet list | Bottom nav hidden |
| `/settings/wallets/new` | Create wallet | Bottom nav hidden |
| `/settings/wallets/:id` | Edit wallet | Bottom nav hidden |
| `/settings/categories` | Category manager | Bottom nav hidden |
| `/settings/categories/new` | Create category | Bottom nav hidden |
| `/settings/categories/:id` | Edit category | Bottom nav hidden |
| `/settings/currencies` | Currency manager | Bottom nav hidden |
| `/settings/currencies/new` | Create currency | Bottom nav hidden |
| `/settings/currencies/:code` | Edit currency | Bottom nav hidden |
| `/settings/theme` | Theme picker | Bottom nav hidden |

Bottom navigation behavior:
- Home, Balance, and Setting are enabled.
- Budget and Report remain visible but disabled.
- Active state is based on the first path segment.

---

## Store And Data Behavior

Continue the Phase 1 pattern: Dexie is the persistence layer, Zustand is the UI read model, and mutations write through immediately.

### Wallet Balances

Wallet balances are calculated from each wallet's stored starting `balance` plus matching transactions.

For `payment` wallets:
- Income increases balance.
- Expense decreases balance.

For `credit_card` wallets:
- Expense increases debt.
- Income decreases debt.
- Display debt as a positive owed amount.
- Available credit is `creditLimit - debt`.

Phase 2 should add selector/helper functions rather than duplicating balance math inside UI components.

Recommended helper responsibilities:
- `walletCurrentAmount(walletId)` returns current payment balance or credit-card debt.
- `walletTransactions(walletId, range)` returns transactions filtered by wallet and date range.
- `walletRunningRows(walletId, range)` returns newest-first display rows with running balances computed chronologically oldest-to-newest.
- `assetsTotal()` sums payment wallet current balances.
- `debtTotal()` sums credit-card debts.

### Categories

Category management uses the existing 5-level tree model.

Rules:
- Categories are filtered by type: `expense` or `income`.
- Root categories have no `parentId` and `level = 1`.
- Child category level is parent level + 1.
- New categories cannot exceed level 5.
- Deleting a category with children is blocked. The user must delete child categories first.
- Deleting a category referenced by existing transactions is blocked.

Phase 2 does not include drag reorder. Display order should be stable by current store order or name.

### Currencies

Currency management maintains the currency list and rates. It does not change transaction entry yet.

Rules:
- Exactly one currency is base.
- Base currency rate is `1`.
- Non-base currencies require a positive rate.
- Existing Phase 1 transactions remain THB unless later phases add transaction currency selection.
- Removing a currency referenced by a wallet is blocked.

The existing `Currency` type uses `rate`; this spec treats it as the local exchange rate field for Phase 2.

### Settings

Theme changes persist immediately and call the existing theme application function.

Language and date format rows are display-only in Phase 2. They remain visible in Settings to reserve the information architecture, but they do not open editors yet.

---

## Balance Tab

### Summary Bars

At the top of `/balance`, show two horizontal bars:
- Assets: total current amount across payment wallets.
- Debt: total current debt across credit-card wallets.

The assets bar uses a green gradient. The debt bar uses an amber/red gradient and is proportional to assets when assets are positive. If assets are zero and debt is positive, debt renders full width with a clear debt amount.

### Wallet Groups

Show two groups:

**Payment Accounts**
- Header with bank/wallet icon and label.
- Each row shows icon, name, currency/type hint, current balance, and chevron.
- Tap row navigates to `/balance/wallet/:id`.

**Credit Cards**
- Header with credit-card icon and label.
- Each row shows icon, name, credit limit hint when available, current debt, and chevron.
- Tap row navigates to `/balance/wallet/:id`.

Empty groups show a compact empty state and a shortcut to the wallet settings screen.

---

## Wallet Detail

Wallet detail is shared by payment accounts and credit cards, with type-specific summary blocks.

### Date Range Filter

Default range: start of current month through end of current month.

UI:
- Begin date cell
- End date cell
- Custom button for date input controls
- Horizontal preset chips: Last 7d, Last 30d, This Month, Last Month, This Year, Last Year

The filter applies only to the transaction list and range summary. Current wallet amount still represents all-time current balance/debt.

### Payment Account Detail

Show:
- Current balance bar
- Expense bar for the selected range
- Date-grouped transaction list

Rows show:
- Category icon
- Leaf category name
- Parent category hint
- Transaction amount
- Running balance after that transaction

Running balance is computed oldest-to-newest, then displayed newest-first.

### Credit Card Detail

Show:
- Debt
- Available credit
- Limit
- Usage bar: `debt / creditLimit`
- Date-grouped transaction list

Rows show:
- Category icon
- Leaf category name
- Parent category hint
- Transaction amount
- Running debt after that transaction

If a credit card has no credit limit, show debt and transaction history but omit available credit and usage percentage.

---

## Settings Tab

The Settings tab is a grouped menu screen.

### Wallets & Data

Rows:
- Wallets
- Categories
- Currencies

### Appearance

Rows:
- Theme

### General

Rows:
- Language: English, display-only
- Date Format: DD MMM YYYY, display-only

Rows use the existing glass card style, Font Awesome icons, right-side current value where useful, and chevrons for navigable rows.

---

## Wallet Management

`/settings/wallets` shows:
- Payment Accounts section
- Credit Cards section
- `+ Add Payment Account`
- `+ Add Credit Card`

Wallet form fields:
- Name
- Type: payment or credit card
- Currency
- Icon
- Color
- Starting balance
- Credit limit, shown only for credit cards

Validation:
- Name is required.
- Currency must exist.
- Balance defaults to 0.
- Credit limit is optional but must be greater than 0 if provided.

Deleting a wallet is blocked when transactions reference it.

---

## Category Management

`/settings/categories` shows:
- Expense / Income segmented control
- Tree navigation with breadcrumb
- Current level category rows
- `+ Add` row when current level is below level 5

Category form fields:
- Name
- Type
- Parent
- Icon
- Color

Validation:
- Name is required.
- Type is required.
- Parent must match type when provided.
- Level cannot exceed 5.

Delete behavior:
- Block delete when category has children.
- Block delete when category is referenced by transactions.
- Allow delete for unused leaf categories.

Default categories can be edited and deleted if they pass the same safety rules. The `isDefault` flag remains as metadata only.

---

## Currency Management

`/settings/currencies` shows:
- Base currency row with a `Base` badge
- Non-base currency rows with rate
- `+ Add Currency`

Currency form fields:
- Code
- Symbol
- Name
- Rate
- Base flag

Validation:
- Code is required and stored uppercase.
- Symbol is required.
- Name is required.
- Rate must be positive.
- Base currency rate is always 1.
- Setting a currency as base clears base status from the previous base currency.

Delete behavior:
- Block delete for base currency.
- Block delete when any wallet references the currency.

---

## Theme Picker

`/settings/theme` shows the existing 8 theme presets:
- Forest
- Midnight
- Ocean
- Sunset
- Amber
- Arctic
- Sakura
- Void

UI:
- 4-column grid of theme swatches
- Selected theme has a checkmark and accent border
- Live preview card showing a sample wallet row

Selecting a theme:
1. Updates `settings.theme`
2. Persists through `settingsStore`
3. Applies CSS variables immediately

---

## Components And Helpers

Recommended additions:

```txt
src/features/balance/
  BalancePage.tsx
  WalletDetailPage.tsx
  balanceCalculations.ts

src/features/settings/
  SettingsPage.tsx
  WalletsPage.tsx
  WalletFormPage.tsx
  CategoriesPage.tsx
  CategoryFormPage.tsx
  CurrenciesPage.tsx
  ThemePage.tsx

src/lib/
  dateRange.ts
```

Shared UI components may be added only when reused across multiple screens:
- Settings row
- Date range filter
- Wallet row
- Empty state

Avoid broad refactors outside the screens and stores touched by this phase.

---

## Error Handling

Use inline validation for form errors. Do not allow invalid writes into Dexie.

Use confirmation dialogs for destructive actions:
- Delete wallet
- Delete category
- Delete currency

Blocked delete actions should explain the reason in user-facing copy:
- Existing transactions reference this item.
- This category still has child categories.
- Base currency cannot be deleted.
- Wallet currency is still in use.

If a route references a missing wallet/category/currency, show a compact not-found state with a back button.

---

## Testing

Add focused tests for:
- Payment wallet balance calculation
- Credit-card debt and available credit calculation
- Running balance ordering
- Date range helper presets
- Category tree children and level validation
- Blocked category deletion when children or transactions exist
- Blocked wallet deletion when transactions exist
- Blocked currency deletion when base or wallet-referenced
- Theme setting persistence and application
- Bottom navigation enabled/disabled states
- Routes for Balance and Settings surfaces

Store tests should verify Dexie write-through behavior where mutations are added.

---

## Acceptance Criteria

Phase 2 is complete when:
- Home, Balance, and Setting bottom-nav tabs are enabled and route correctly.
- Budget and Report remain visible but disabled.
- Balance tab shows correct asset/debt totals from local data.
- Wallet detail pages show filtered transactions and correct running balances.
- Users can create, edit, and safely delete wallets.
- Users can create, edit, and safely delete categories.
- Users can create, edit, and safely delete currencies.
- Users can switch among all 8 theme presets and the choice persists.
- No Phase 2 screen requires backend data.
- Existing Phase 1 transaction entry and Home behavior continue to work.
