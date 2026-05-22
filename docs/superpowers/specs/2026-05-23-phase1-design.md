# Money Tracker — Phase 1 Design Spec
Date: 2026-05-23

## Scope

Phase 1 delivers a working transaction entry and overview experience. No backend, no accounts — local IndexedDB only.

**In scope:**
- Home tab (header, income/expense cards, today's transactions)
- Add Transaction page (expense + income only)
- Custom calculator keyboard with expression evaluation
- Seed data (single currency THB, default wallets + categories)
- Full Dexie schema for all models (prevents migration pain in later phases)
- All 5 Zustand stores (partially populated in Phase 1)

**Deferred to later phases:**
- Transfer transaction type
- Multi-currency + exchange rates
- Repeat transactions
- Status logic (planned / overdue / paid)
- Upcoming Transactions section
- Balance tab, Budget tab, Report tab
- Settings screens (wallets, categories, currencies, theme)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build | Vite (latest) |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Database | Dexie.js (IndexedDB) |
| Icons | Font Awesome 6 |
| Routing | React Router v7 |

---

## Project Structure

```
src/
  db/
    schema.ts          # Dexie DB class + all table definitions
    seed.ts            # default wallets, categories, currency seed
  stores/
    transactionStore.ts
    walletStore.ts
    categoryStore.ts
    currencyStore.ts
    settingsStore.ts
  features/
    home/              # Home tab components
    transaction/       # Add/Edit transaction page + calculator
  components/          # shared UI (BottomNav, Card, etc.)
  hooks/               # shared hooks
  lib/
    theme.ts           # CSS var injection for theme presets
    format.ts          # amount formatting (฿28.00)
  App.tsx
  main.tsx
```

---

## Routing

| Route | Component | Notes |
|---|---|---|
| `/` | Home tab | Bottom nav visible |
| `/transaction/new` | Add Transaction | Full-screen, no bottom nav |
| `/transaction/:id` | Edit Transaction | Full-screen, no bottom nav |

---

## Data Layer

### Dexie Schema

All tables defined at version 1. Phase 1 uses a subset — full schema prevents IndexedDB version bumps in later phases.

```ts
db.version(1).stores({
  transactions: 'id, type, walletId, date, status',
  wallets: 'id',
  categories: 'id, parentId, type',
  currencies: 'code',
  settings: 'id',
})
```

### Zustand Store Pattern

Each store: load from Dexie on boot, write-through on every mutation. UI reads only from Zustand.

```ts
// example shape (all stores follow this pattern)
transactionStore: {
  items: Transaction[]
  load: () => Promise<void>        // called once on app boot
  add: (t: Transaction) => Promise<void>
  update: (t: Transaction) => Promise<void>
  remove: (id: string) => Promise<void>
  // selectors
  monthlyIncome: () => number
  monthlyExpense: () => number
  todayTransactions: () => Transaction[]
}
```

All stores call `.load()` during app initialization before first render.

### Seed Data

Runs once on first boot (check: wallets table empty).

**Wallets:** 1 wallet — "Cash", type `payment`, currency THB, balance 0.

**Currency:** THB, `isBase: true`, rate = 1.

**Settings:** theme `forest`, language `en`, dateFormat `DD MMM YYYY`.

**Categories (expense roots + 2–3 children each):**
- Food & Drink → Restaurant, Groceries, Coffee
- Transport → Fuel, Public Transit, Taxi
- Shopping → Clothes, Electronics, Household
- Bills & Utilities → Electricity, Water, Internet
- Health → Medicine, Doctor, Gym
- Entertainment → Movies, Games, Streaming
- Education → Books, Courses, Supplies
- Personal Care → Haircut, Cosmetics, Spa
- Travel → Hotel, Flight, Activities
- Other → Miscellaneous

**Categories (income roots + 2–3 children each):**
- Salary → Base Pay, Bonus, Overtime
- Freelance → Project, Consulting, Design
- Investment → Dividends, Interest, Capital Gains
- Gift → Birthday, Holiday, Other Gift
- Other → Miscellaneous

All seed categories: `isDefault: true`, level 1 (roots) and level 2 (children).

Icons: each category gets a sensible Font Awesome 6 icon name (e.g. `fa-utensils` for Food & Drink, `fa-car` for Transport). Full mapping defined in `db/seed.ts` during implementation. Colors: each root category gets a distinct muted hex color; children inherit parent color.

---

## App Shell

- Mobile-first, 390px reference width
- Fixed bottom nav — Phase 1: Home tab active, Balance/Budget/Report/Setting greyed/disabled
- Dark base background + radial accent glows
- Glassmorphism cards: `bg-white/[0.04]` + `backdrop-blur` + subtle border

---

## Theme System

8 presets defined in `lib/theme.ts`. On boot and on change, inject CSS custom properties onto `:root`. Tailwind config extends colors to reference these vars (`text-accent`, `bg-accent`, etc.).

```ts
// lib/theme.ts
export const themes: Record<ThemePreset, ThemeTokens> = {
  forest: {
    accent: '#10b981',
    accentLight: '#34d399',
    bg: '#0a0f0d',
    bgGlow1: '#10b98120',
    bgGlow2: '#06372520',
    accentBtn1: '#059669',
    accentBtn2: '#10b981',
    navBorder: '#10b98130',
  },
  midnight: { accent: '#6c47ff', ... },
  ocean:    { accent: '#0369a1', ... },
  sunset:   { accent: '#be123c', ... },
  amber:    { accent: '#b45309', ... },
  arctic:   { accent: '#334155', ... },
  sakura:   { accent: '#9d174d', ... },
  void:     { accent: '#111827', ... },
}

export function applyTheme(preset: ThemePreset) {
  const t = themes[preset]
  const root = document.documentElement
  root.style.setProperty('--accent', t.accent)
  root.style.setProperty('--accent-light', t.accentLight)
  // ... all tokens
}
```

Default: `forest` preset applied on first load.

---

## Home Tab

### Header
- Left: current date formatted as `Thu, 22 May 2026` + "Overview" subtitle
- Right: `+` button → navigate to `/transaction/new`

### Income/Expense Cards
- Two-column grid, current month range
- Income card: green gradient border + arrow-up icon + `monthlyIncome` total
- Expense card: red gradient border + arrow-down icon + `monthlyExpense` total
- Amounts formatted as `฿28.00`

### Today's Transactions
- Section label: real date (e.g. `22 May`)
- Source: `transactionStore.todayTransactions()` — transactions where `date` is today, sorted newest first
- Each row: category icon + leaf category name + parent path hint (muted text) + amount (red = expense, green = income)
- Tap row → navigate to `/transaction/:id` (edit mode)
- Empty state: subtle "No transactions today" message

---

## Add Transaction Page

### Nav Bar
- Left: back chevron → navigate back to Home
- Center: segmented control — `Expense` | `Income` (active tab = accent gradient)
- Right: save checkmark (accent gradient) → validates and saves

### Amount Display Card
- Shows sum of all category item amounts
- Expression preview below total (e.g. `350 + 900`)
- Currency chip top-right: `THB ฿` (static in Phase 1)
- Amount color: red for expense, green for income

### Wallet Field
- Tappable row: wallet icon + name + balance
- Tap → inline picker (Phase 1: only one wallet, so effectively display-only)

### Categories Card
- Header: "Categories" label + `+ Add` button
- Each item row: `[icon] [leaf name + parent path hint] [spacer] [฿amount] [× remove]`
  - Focused item: accent left border + subtle background highlight
- Total row pinned at bottom of card
- `+ Add` → opens category picker (full-screen)
- At least one item required to save

### Category Picker
- Full-screen nested tree navigator (up to 5 levels, Phase 1 has 2)
- Breadcrumb at top showing current path (e.g. `Food & Drink`)
- Tap root → shows children; tap leaf → adds item to categories list + returns to form
- Back button navigates up one level or closes if at root
- Filtered to match current transaction type (expense or income)

### Date/Time Field
- Tappable row: calendar icon + formatted date/time value
- Tap → opens native `<input type="datetime-local">` picker
- Default: current date/time on new transaction

### Note Field
- Tappable row: pencil icon + note text (or muted placeholder)
- Tap → opens bottom sheet with textarea input

### Delete Button
- Edit mode only (`/transaction/:id`)
- Red destructive button at bottom
- Tap → confirm dialog → `transactionStore.remove(id)` → navigate back to Home

### Save Logic
1. Validate: at least 1 category item, each with amount > 0, wallet selected
2. Build `Transaction` object (generate UUID for id, set `createdAt = now`)
3. Call `transactionStore.add()` or `transactionStore.update()`
4. Navigate back to `/`

---

## Custom Calculator Keyboard

Replaces system keyboard when any amount field is focused. Fixed to bottom of viewport.

### Layout (5 columns × 4 rows)

```
+   1   2   3   THB
−   4   5   6   ±
×   7   8   9   =
÷   .   0   [  ⌫  ]
```

Delete (`⌫`) spans 2 columns.

### Key Styles
- Operator keys (`+`, `−`, `×`, `÷`): dim accent background
- `±`, `=`: light accent style
- `THB`: light accent style, **disabled/no-op in Phase 1** (multi-currency deferred)
- Delete: red background, spans 2 columns
- Digits + `.`: neutral dark background

### Behavior
- Each focused category item has its own independent amount value
- Digit keys append to current value string
- `.` appends decimal point (only once per operand)
- Operator keys (`+`, `−`, `×`, `÷`): store pending operation, display expression preview
- `=` evaluates expression using standard order of operations, result shown in amount display
- `±` toggles sign of current operand
- `⌫` deletes last character; if value empty, clears expression

### Expression State
```ts
type CalcState = {
  display: string        // current input string
  expression: string     // full expression preview (e.g. "350 + 900")
  result: number         // evaluated result
}
```

Expression is local component state, not persisted to store until save.

---

## Amount Formatting

All amounts display as `฿28.00` — currency symbol + value with 2 decimal places.

```ts
// lib/format.ts
export function formatAmount(amount: number, currency = 'THB'): string {
  const symbol = currencySymbols[currency] ?? currency
  return `${symbol}${amount.toFixed(2)}`
}
```

---

## Data Models (Phase 1 subset)

```ts
Transaction {
  id: string              // UUID
  type: 'expense' | 'income'
  walletId: string
  currency: string        // 'THB' in Phase 1
  items: TransactionItem[]
  date: string            // ISO datetime string
  note?: string
  createdAt: string       // ISO datetime string
}

TransactionItem {
  categoryId: string
  amount: number
}

Wallet {
  id: string
  name: string
  type: 'payment' | 'credit_card'
  currency: string
  balance: number
  color: string
  icon: string
}

Category {
  id: string
  name: string
  type: 'expense' | 'income'
  parentId?: string
  level: 1 | 2 | 3 | 4 | 5
  icon: string
  color: string
  isDefault: boolean
}
```

Fields present in full spec but unused in Phase 1 (toWalletId, exchangeRate, status, cleared, repeat) are omitted from Transaction writes but the Dexie schema indexes them for future use.
