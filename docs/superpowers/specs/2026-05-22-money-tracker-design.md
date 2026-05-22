# Money Tracker — Design Spec
Date: 2026-05-22

## Overview

Mobile-first personal finance web app. Local-only data (IndexedDB), no backend, no accounts. Full multi-currency support with exchange rate input. Fancy interactive UI with named theme presets.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React (latest) |
| Build | Vite (latest) |
| Styling | Tailwind CSS (latest) |
| State | Zustand |
| Database | Dexie.js (IndexedDB wrapper) |
| Icons | Font Awesome 6 |

## Phases

**Phase 1 (this spec):** Home tab + Balance tab + Settings tab fully functional.  
**Phase 2:** Reconciliation, Budget tab, Report tab.  
**Phase 3:** Budget tab deep, Report tab deep.

---

## Data Models

```ts
Transaction {
  id: string
  type: 'expense' | 'income' | 'transfer'
  walletId: string
  toWalletId?: string           // transfers only
  currency: string              // applies to all items
  exchangeRate?: number         // set when currency differs from wallet currency
  items: TransactionItem[]      // empty array for transfers
  date: DateTime
  status: 'paid' | 'planned' | 'overdue'
  cleared: boolean              // Phase 2
  repeat?: RepeatConfig
  note?: string
  createdAt: DateTime
}

TransactionItem {
  categoryId: string
  amount: number                // in Transaction.currency
}

RepeatConfig {
  preset: 'never' | 'daily' | '2weeks' | 'monthly' | 'yearly' | 'custom'
  customEvery?: number          // 1–31
  customUnit?: 'day' | 'month' | 'year'
}

Wallet {
  id: string
  name: string
  type: 'payment' | 'credit_card'
  currency: string
  balance: number
  creditLimit?: number          // credit cards only
  color: string
  icon: string
}

Category {
  id: string
  name: string
  type: 'expense' | 'income'
  parentId?: string             // null = root
  level: 1 | 2 | 3 | 4 | 5
  icon: string
  color: string
  isDefault: boolean
}

Currency {
  code: string                  // 'THB', 'USD', 'JPY'
  isBase: boolean
  exchangeRate: number          // rate to base currency
  updatedAt: DateTime
}

Settings {
  themePreset: ThemePreset
  language: string
  dateFormat: string
  reconciliationEnabled: boolean  // Phase 2
}
```

---

## Architecture

```
Dexie.js (IndexedDB)
  └─ source of truth: transactions, wallets, categories, currencies, settings

Zustand stores
  ├─ transactionStore   — CRUD + filters + derived totals
  ├─ walletStore        — wallet list + balance calculations
  ├─ categoryStore      — tree structure (5-level nested)
  ├─ currencyStore      — active currencies + exchange rates
  └─ settingsStore      — theme, language, date format
```

Pattern: Dexie as persistence layer. Zustand loads from Dexie on boot and writes through on every mutation. UI reads only from Zustand.

---

## App Shell

- Mobile-first, 390px reference width
- Fixed bottom navigation bar: Home · Balance · Budget · Report · Setting
- Active tab: accent-colored icon + label + dot indicator below
- Background: dark base with radial accent glows (theme-driven)
- Glassmorphism cards: `rgba(255,255,255,0.04)` bg + subtle border + `backdrop-filter: blur`

---

## Theme System

8 named presets. Each preset defines: `bg`, `bgGlow1`, `bgGlow2`, `accent`, `accentLight`, `accentBtn1`, `accentBtn2`, `navBorder`.

| Preset | Accent |
|---|---|
| Forest (default) | Emerald `#10b981` |
| Midnight | Purple `#6c47ff` |
| Ocean | Blue `#0369a1` |
| Sunset | Rose `#be123c` |
| Amber | Amber `#b45309` |
| Arctic | Slate `#334155` |
| Sakura | Pink `#9d174d` |
| Void | Near-black `#111827` |

Stored in `Settings.themePreset`. Applied via CSS custom properties on `:root`.

---

## Home Tab

### Header
- Left: current date (e.g. `Thu, 22 May 2026`) + page title "Overview"
- Right: `+` button → navigate to Add Transaction page

### Income/Expense Cards
- Two-column grid, current month range
- Income card: green gradient border + arrow-up icon + total income
- Expense card: red gradient border + arrow-down icon + total expense

### Upcoming Transactions
- Section label "Upcoming"
- Shows transactions where: `status = 'planned'` AND date is within 1 day ahead, OR `status = 'overdue'`
- Each item: icon + name + amber `Tomorrow`/`Overdue` badge + amount

### Today's Transactions
- Section label with real date (e.g. `22 May`)
- All transactions for today, chronological descending
- Each item: category icon + leaf name + parent hint + amount (red=expense, green=income)
- Tap → opens Add Transaction page in edit mode

---

## Add Transaction Page

### Navigation Bar
- Back chevron (left)
- Type selector dropdown: `Expense | Income | Transfer` (segmented control, active = accent gradient)
- Save checkmark (right, accent gradient)

### Amount Display (top card)
- Shows total of all category items
- Expression preview (e.g. `350 + 900`) below total
- Currency chip top-right (e.g. `THB ฿`)
- Amount color: red for expense, green for income

### Wallet Field
- Tappable row: wallet icon + name + balance
- Transfer mode: shows From wallet + To wallet rows

### Categories Section (card)
- Section header: "Categories" label + `+ Add` button
- Each item row: `[category icon] [leaf name + parent path hint] [spacer] [฿amount.00] [× remove]`
  - Active/focused item: accent left border + subtle background
  - Leaf name: bold, parent path: small muted text below
- Total row pinned at bottom of card: sum of all items
- `+ Add` → opens category picker

### Category Picker
- Nested tree navigator (up to 5 levels)
- Shows current level items; tap to drill down or select leaf
- Breadcrumb at top showing current path
- Only available for expense/income (not transfer)

### Date & Time Field
- Tappable row: calendar icon + date/time value
- Right side: auto status badge
  - Date ≤ now → red `Overdue` badge
  - Date > now → amber `Planned` badge
  - Manually set to Paid → green `Paid` badge (overrides auto)

### Repeat Field
- Only shown when status is `Planned` or `Overdue`
- Tappable row: rotate icon + current value (e.g. `Every 13 Month`)
- Tap → opens Repeat bottom sheet modal

#### Repeat Modal (bottom sheet)
- Preset list: Never / Daily / Every 2 Weeks / Monthly / Yearly / Custom
- Custom selected: two-column scroll picker appears below
  - Left column: number (1–31)
  - Right column: unit (Day / Month / Year)
- Confirm button (accent gradient)

### Note Field
- Tappable row, free text input

### Delete Button
- Edit mode only, red destructive button at bottom

### Custom Calculator Keyboard
- Appears when any amount field is focused (replaces system keyboard)
- 5-column × 4-row grid layout:

```
+   1   2   3   THB
−   4   5   6   ±
×   7   8   9   =
÷   .   0   [delete ×2]
```

- Operator keys (`+`, `−`, `×`, `÷`): accent dim style
- `THB`, `±`, `=`: violet/light-accent style (same color)
- Delete: spans 2 columns, red style
- `THB` key: tap to switch transaction currency (opens currency picker)
- Expression evaluation: `=` evaluates pending expression, result shown in amount display

### Money Transfer Mode
- Wallet becomes From/To pair
- Exchange rate field appears if currencies differ
- No category section (transfers have no category)

---

## Balance Tab

### Balance List (main)

#### Bar Graph (top)
- Two horizontal bars, proportional to values:
  - **Assets** bar: full width, green gradient (`#10b981 → #34d399`), amount text inside bar
  - **Debt** bar: proportional width (debt/assets ratio), amber gradient (`#f59e0b → #fbbf24`), amount inside
- Amount text: dark color inside bar for contrast

#### Payment Accounts Group
- Group header: bank icon + "Payment Accounts" label
- Each wallet: icon (accent colored) + name + currency type + balance (green) + chevron

#### Credit Cards Group
- Group header: credit card icon + "Credit Cards" label
- Each card: icon (red) + name + credit limit sub + debt amount (red) + chevron

---

### Payment Account Detail

#### Date Range Filter
- Row: `[Begin cell] [End cell] [⋯ custom button]`
  - Each cell shows label + formatted date
  - Default: start of current month → end of current month
- Preset chips (scrollable): Last 7d · Last 30d · This Month · Last Month · This Year · Last Year

#### Bar Graph
- Balance bar: green, full width
- Expenses bar: amber, proportional (expenses/balance ratio)

#### Transaction List
- Date group labels: `22 May` (same year) or `22 May 2025` (different year)
- Each item: category icon + leaf name + parent hint + amount + running balance
- Running balance: wallet balance after each transaction, calculated chronologically oldest→newest, displayed newest-first

---

### Credit Card Detail

#### Date Range Filter
- Same Begin/End row + preset chips as Payment Account Detail

#### Stats Row (3-col)
- Debt (red) · Available (green) · Limit (muted)

#### Usage Bar
- Thin progress bar: debt/limit percentage, red gradient
- Label: `Used X%` left + `฿debt / ฿limit` right

#### Transaction List
- Same date label format (same/different year)
- Each item: category icon + name + amount + running debt balance (red)
- Running debt: total debt after each transaction, calculated chronologically oldest→newest, displayed newest-first

---

## Settings Tab

### Main Settings Screen

**Wallets & Data group**
- Wallets → sub-screen (wallet management)
- Categories → sub-screen (category tree management)
- Currencies → sub-screen (currency + exchange rate management)

**Appearance group**
- Theme → theme picker sub-screen (active preset shown)

**General group**
- Language (English default)
- Date Format (DD MMM YYYY default)
- Reconciliation toggle — off by default, Phase 2 feature

---

### Theme Picker Sub-screen
- 4-column grid of 8 swatches: gradient circle + preset name
- Selected preset: green checkmark border
- Live preview card below showing a wallet row in chosen theme colors

---

### Wallets Sub-screen
- Payment Accounts section: list + `+ Add Payment Account` row
- Credit Cards section: list + `+ Add Credit Card` row
- Each wallet: icon + name + type + currency + chevron → edit form

**Wallet edit form fields:**
- Name, Type (payment/credit card), Currency, Icon, Color
- Credit card only: Credit Limit field
- Delete button (destructive, bottom)

---

### Categories Sub-screen
- Tree view navigable by level
- Tap category → drill into children or edit leaf
- Long-press → reorder / delete
- `+ Add` at each level (max depth: level 5)
- Type toggle: Expense / Income

---

### Currencies Sub-screen
- List: flag + code + exchange rate to base + chevron
- Base currency marked with `Base` badge (no rate shown)
- Tap rate → inline edit exchange rate
- `+ Add Currency` row

---

## Amount Formatting

All amounts display as `฿28.00` format — currency symbol + value with 2 decimal places. Symbol determined by wallet/transaction currency.

---

## Status Logic

| Condition | Status |
|---|---|
| User manually marks paid | `paid` |
| Date > now AND not paid | `planned` (auto) |
| Date ≤ now AND not paid | `overdue` (auto) |

Repeat section only visible when status is `planned` or `overdue`.

---

## Preset Categories (defaults)

Shipped with app, `isDefault: true`, user can edit/add/delete.

**Expense roots:** Food & Drink · Transport · Shopping · Bills & Utilities · Health · Entertainment · Education · Personal Care · Travel · Other

**Income roots:** Salary · Freelance · Investment · Gift · Other

Each root has 2–3 default children (level 2). Levels 3–5 are user-created.
