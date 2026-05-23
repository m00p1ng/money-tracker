# Money Tracker — Phase 4 Design Spec
Date: 2026-05-23

## Scope

Phase 4 improve Home page visual polish with Framer Motion animations and redesign the transaction entry flow for better UX. No data model changes. No new routes beyond `/transaction/category`.

**In scope:**
- Framer Motion entry animations and interaction states on Home
- Page transitions between all routes
- Picker open/close animations for all bottom sheets and full-screen overlays
- Category-first Add Transaction flow via new full-screen category selection page
- Transaction page: first category row non-deletable
- Transaction page: tap category icon/name to change category
- Transaction page: Add button moves inside items list above total
- Transaction page: keyboard hides when no item is focused
- Transaction page: date picker via react-day-picker bottom sheet

**Deferred:**
- Budget/Report tabs
- Any Phase 3 data model work (covered in `2026-05-23-phase3-design.md`)

---

## Dependencies

Add to `package.json`:
- `framer-motion` — animations
- `react-day-picker` — calendar in date picker sheet

---

## Home Page Animations

### Architecture

`framer-motion` `motion` components replace plain `div`/`section` elements where animation is needed. All animation config lives in variant objects co-located with each component — no global animation config file.

### Page Entry Stagger

`HomePage` wraps its children in a `motion.div` with `staggerChildren: 0.08`. Each direct child section (`SummaryCards`, `UpcomingTransactions`, `TodayTransactions`) is a `motion.div` using shared variants:

```ts
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}
```

### Summary Cards

Each card animates with a slight scale overshoot:

```ts
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 20 } },
}
```

### Transaction Rows (Today + Upcoming)

List container uses `staggerChildren: 0.06`. Each row:

```ts
const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
}
```

Row hover state via `whileHover`:
```ts
whileHover={{ x: 4, backgroundColor: 'rgba(108,71,255,0.08)' }}
// plus CSS transition for box-shadow: '0 0 0 1px rgba(108,71,255,0.15)'
```

### Add (+) Button

```ts
whileHover={{ scale: 1.1, rotate: 90 }}
whileTap={{ scale: 0.92 }}
```

Idle glow pulse via `animate` loop:
```ts
animate={{ boxShadow: ['0 0 0 0 rgba(108,71,255,0)', '0 0 12px 4px rgba(108,71,255,0.35)', '0 0 0 0 rgba(108,71,255,0)'] }}
transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
```

---

## Page Transitions

### Setup

`AppShell` reads `location` from `useLocation()` and wraps `{children}` with `AnimatePresence mode="wait"`. The `key` is `location.pathname` so React unmounts the old page and mounts the new one, triggering enter/exit animations.

```tsx
// AppShell.tsx
const location = useLocation()
return (
  <div className="min-h-screen text-slate-50">
    <main className="mx-auto min-h-screen w-full max-w-[430px] px-4 pt-6 ...">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={location.pathname} ...>
          {children}
        </motion.div>
      </AnimatePresence>
    </main>
    {showBottomNav ? <BottomNav /> : null}
  </div>
)
```

### Transition Variants

Two variant sets based on navigation direction:

**Forward navigation** (Home → CategorySelection → Transaction, Home → Balance, Home → Settings):
```ts
const pageVariants = {
  initial:  { opacity: 0, x: 24, scale: 0.98 },
  animate:  { opacity: 1, x: 0,  scale: 1,   transition: { type: 'spring', stiffness: 350, damping: 30 } },
  exit:     { opacity: 0, x: -24, scale: 0.98, transition: { duration: 0.18, ease: 'easeIn' } },
}
```

**Tab switches** (Home ↔ Balance ↔ Settings — bottom nav):
```ts
const tabVariants = {
  initial:  { opacity: 0, y: 8 },
  animate:  { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.12 } },
}
```

### Direction Detection

`AppShell` (or a shared hook) tracks `previousPathname`. Tab routes (`/`, `/balance`, `/settings`) use `tabVariants`. All other routes use `pageVariants`. A `NavigationContext` or simple ref stores the previous path.

### Each Page

Each page root element becomes a `motion.div` using the appropriate variant set:
```tsx
<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
  {/* page content */}
</motion.div>
```

Pages: `HomePage`, `BalancePage`, `WalletDetailPage`, `SettingsPage`, `CategoriesPage`, `CategoryFormPage`, `WalletsPage`, `WalletFormPage`, `CurrenciesPage`, `CurrencyFormPage`, `ThemePage`, `TransactionPage`, `CategorySelectionPage`.

---

## Picker & Sheet Animations

All pickers and bottom sheets use the same `AnimatePresence` + backdrop + sheet pattern. The pattern replaces the current `fixed inset-0` render-or-null approach.

### Shared Bottom Sheet Pattern

```tsx
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      {/* Sheet */}
      <motion.div
        key="sheet"
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-[#131320] ..."
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 38 }}
      >
        <div className="mx-auto w-10 h-1 rounded-full bg-white/15 mt-2.5 mb-1" />
        {/* content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Pickers That Become Bottom Sheets

| Picker | Current style | After |
|---|---|---|
| `RepeatPicker` | Already sheet-like | Add `AnimatePresence` + backdrop + spring |
| `WalletPicker` | `fixed inset-0 bg-slate-950` full-screen | Convert to bottom sheet |
| `CurrencyPicker` | `fixed inset-0 bg-slate-950` full-screen | Convert to bottom sheet |
| `DatePickerSheet` | New component | Built with pattern from the start |

### CategoryPicker — Full-Screen Slide-Up

`CategoryPicker` (used inside `TransactionPage` for changing a category) keeps full-screen style but animates as a full-height sheet sliding up from the bottom:

```tsx
<motion.div
  className="fixed inset-0 z-40 bg-slate-950 ..."
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  transition={{ type: 'spring', stiffness: 380, damping: 36 }}
>
```

No backdrop needed — it covers the full screen.

### Drill-Down Inside CategorySelectionPage

When user taps a parent category and the grid replaces with sub-categories, animate the grid swap:

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={parentId ?? 'root'}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
  >
    {/* grid of current level */}
  </motion.div>
</AnimatePresence>
```

Back navigation (drill up) uses `x: -20` → `x: 0` enter and `x: 20` exit (reversed direction).

---

## Category-First Add Transaction Flow

### New Route

```
/transaction/category
```

Added to the router alongside existing transaction routes.

### Navigation Change

`HomePage` `+` button: `to="/transaction/category"` instead of `"/transaction/new"`.

### CategorySelectionPage

Full-screen page (`bg-slate-950`, same shell as existing pages).

**Header:**
- Back button → `navigate(-1)`
- Title: "New Transaction"

**Type selector:**
Segmented control: `Expense | Income | Transfer`.
- Transfer: navigates immediately to `/transaction/new?type=transfer` (no category needed).
- Expense/Income: shows category grid for that type.

**Category grid:**
- `grid-cols-2 gap-3`
- Each cell: icon (colored bg) + name label
- Top-level categories shown first
- Tap parent with children → drill into sub-grid (replaces current grid, back button returns)
- Tap leaf category → `navigate('/transaction/new?type=<type>&categoryId=<id>')`

**Animations:**
- Grid items stagger in on mount and on drill: `staggerChildren: 0.04`
- Each cell: `hidden: { opacity:0, scale:0.9 }` → `visible: { opacity:1, scale:1 }` spring
- `whileTap={{ scale: 0.96 }}`

### TransactionPage Reads Query Params

`useSearchParams` reads `categoryId` and `type` on mount:

```ts
const [searchParams] = useSearchParams()
const seedCategoryId = searchParams.get('categoryId')
const seedType = (searchParams.get('type') ?? 'expense') as TransactionType
```

Initial state:
- `type` → `seedType` (fallback to `initial?.type ?? 'expense'`)
- `items` → if `seedCategoryId` present and not in edit/repeat mode, seed `[{ categoryId: seedCategoryId, amount: 0 }]`
- `focusedIndex` → `0` if seeded, else `null`

---

## Transaction Page: CategoryItemsCard Changes

### Props Added

```ts
onChangeCategory: (index: number) => void
```

### First Row Non-Deletable

Remove button not rendered when `index === 0`:

```tsx
{index > 0 && (
  <button aria-label="Remove category" onClick={...}>
    <Icon name="fa-xmark" />
  </button>
)}
```

### Tap to Change Category

Row splits into two tap zones:

```tsx
<div className="flex items-center gap-3 ...">
  {/* Left zone: icon + name → change category */}
  <button onClick={() => onChangeCategory(index)} className="flex items-center gap-3 flex-1 min-w-0">
    <div className="cat-icon ..."><Icon name={...} /></div>
    <div className="min-w-0">
      <p>{category?.name}</p>
      <p>{parent?.name}</p>
    </div>
  </button>
  {/* Right zone: amount → focus for keyboard */}
  <button onClick={() => onFocus(index)} className="...">
    <span>{formatAmount(item.amount)}</span>
  </button>
  {index > 0 && <RemoveButton />}
</div>
```

### Add Button Moves Inside List

Card header loses the Add button — becomes label-only:

```tsx
<div className="flex items-center px-4 py-2.5 border-b border-white/[0.05]">
  <span className="text-[11px] uppercase tracking-[1px] text-white/35">Categories</span>
</div>
```

After all item rows, above the total row, insert an Add row:

```tsx
<button
  onClick={onAdd}
  className="flex items-center justify-center gap-2 w-full py-3 border-t border-dashed border-white/[0.08] text-[12px] font-semibold text-accent-light"
>
  <Icon name="fa-plus" className="text-[10px]" /> Add Category
</button>
```

This row only renders for expense/income types (not transfer — `CategoryItemsCard` is not shown for transfer).

---

## Transaction Page: Keyboard Focus Gate

### focusedIndex Type Change

```ts
const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
```

Default `null`. Set to `0` when items are seeded from query params.

### When Keyboard Shows/Hides

- `focusedIndex !== null` → `CalculatorKeyboard` renders
- `focusedIndex === null` → keyboard hidden

Tapping wallet row, date row, note textarea, or any non-category area: call `setFocusedIndex(null)` to dismiss keyboard.

### AnimatePresence Wrap

```tsx
<AnimatePresence>
  {focusedIndex !== null && (
    <motion.div
      key="keyboard"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="fixed inset-x-0 bottom-0 z-30"
    >
      <CalculatorKeyboard onPress={press} />
    </motion.div>
  )}
</AnimatePresence>
```

`CalculatorKeyboard` loses its own `fixed` positioning — the wrapper handles it.

### Scroll Padding

`TransactionPage` outer div changes from `pb-64` to dynamic: `focusedIndex !== null ? 'pb-64' : 'pb-6'`.

### Note Textarea Dismisses Keyboard

Note `<textarea>` gets `onFocus={() => setFocusedIndex(null)}` so tapping it hides the calculator keyboard.

Wallet picker button and date field button each get `onClick` that includes `setFocusedIndex(null)` before their own handler.

### press() Guard

`press()` function early-returns if `focusedIndex === null` (safety, shouldn't be reachable but defensive).

---

## Transaction Page: Date Picker Sheet

### New Component: DatePickerSheet

`src/features/transaction/DatePickerSheet.tsx`

**Props:**
```ts
{
  value: Date
  onChange: (date: Date) => void
  onClose: () => void
}
```

**Structure:**
- `AnimatePresence` bottom sheet (same pattern as `RepeatPicker`)
- `react-day-picker` `<DayPicker mode="single">` for date selection
- Hour select (0–23) + minute select (0, 15, 30, 45) below calendar
- Confirm button → calls `onChange` with combined date+time, calls `onClose`

**Styling:**
`react-day-picker` CSS variables overridden to match dark theme:
```css
--rdp-accent-color: var(--accent);
--rdp-background-color: rgba(108,71,255,0.15);
```

### Date Field Row Change

Replace `<label htmlFor="tx-date">` + hidden `<input type="datetime-local">` with:

```tsx
<button
  onClick={() => setDatePickerOpen(true)}
  className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-left"
  type="button"
>
  {/* icon, label, formatted value, status badge */}
</button>

{isDatePickerOpen && (
  <DatePickerSheet
    value={new Date(date)}
    onChange={(d) => { setDate(toDatetimeLocalValue(d)); setDatePickerOpen(false) }}
    onClose={() => setDatePickerOpen(false)}
  />
)}
```

---

## File Changes Summary

| File | Change |
|---|---|
| `src/components/AppShell.tsx` | `AnimatePresence` page transition wrapper, direction detection |
| `src/features/home/HomePage.tsx` | Framer Motion stagger wrapper, `+` btn to `/transaction/category`, btn animation |
| `src/features/home/SummaryCards.tsx` | Card entry animations |
| `src/features/home/TodayTransactions.tsx` | Row stagger + hover animation |
| `src/features/home/UpcomingTransactions.tsx` | Row stagger + hover animation |
| `src/features/balance/BalancePage.tsx` | Page transition motion wrapper |
| `src/features/balance/WalletDetailPage.tsx` | Page transition motion wrapper |
| `src/features/settings/SettingsPage.tsx` | Page transition motion wrapper |
| `src/features/settings/*.tsx` | Page transition motion wrapper (all settings pages) |
| `src/features/transaction/CategorySelectionPage.tsx` | New — full-screen grid category picker with drill-down animation |
| `src/features/transaction/CategoryPicker.tsx` | Slide-up full-screen animation via `AnimatePresence` |
| `src/features/transaction/CategoryItemsCard.tsx` | No delete on first row, tap-to-change, add button moves inside |
| `src/features/transaction/TransactionPage.tsx` | `focusedIndex` nullable, keyboard gate, date picker, `onChangeCategory`, seed from query params, page transition wrapper |
| `src/features/transaction/WalletPicker.tsx` | Convert to animated bottom sheet |
| `src/features/transaction/CurrencyPicker.tsx` | Convert to animated bottom sheet |
| `src/features/transaction/RepeatPicker.tsx` | Add `AnimatePresence` + backdrop + spring |
| `src/features/transaction/DatePickerSheet.tsx` | New — react-day-picker bottom sheet with animation |
| `src/App.tsx` | Add `/transaction/category` route |
| `package.json` | Add `framer-motion`, `react-day-picker` |

---

## Testing

- Home animations: visual only, no unit tests needed
- Page transitions: visual only, no unit tests needed
- Picker animations: visual only; existing picker logic tests unchanged
- CategorySelectionPage: renders categories for selected type; drill-down works; Transfer skips to form
- TransactionPage seeding: query params seed correct initial state
- First item no delete: `index === 0` renders without remove button
- Category change: tapping name zone opens picker; selecting updates `categoryId`, preserves `amount`
- Keyboard gate: hidden on mount with no items; appears on focus; hides on `null`; AnimatePresence exit fires
- Date picker: opens on date row tap; confirm updates date state; cancel closes without change

---

## Acceptance Criteria

- Home page animates on mount with staggered spring entries
- Transaction rows have hover glow + shift interaction
- Add (+) button pulses on idle, spins on hover
- Navigating between tabs (Home/Balance/Settings) fades + slides vertically
- Navigating into a page (transaction, wallet detail, settings sub-page) slides in from right; back slides out to right
- All bottom sheet pickers (WalletPicker, CurrencyPicker, RepeatPicker, DatePickerSheet) slide up with spring + dimmed backdrop
- CategoryPicker (change category) slides up full-screen
- Drill-down inside CategorySelectionPage slides grid left/right based on direction
- Tapping `+` on Home navigates to full-screen category grid, not directly to transaction form
- Transfer type on category selection page skips straight to transaction form
- Selected category is pre-filled as first item when transaction form opens
- First category item has no delete button
- Tapping category name/icon opens picker to change that item's category
- Add Category button appears at bottom of items list, above total
- Calculator keyboard hidden on page open; slides up when category item is tapped
- Keyboard slides down when tapping outside category items
- Date field opens react-day-picker sheet; confirm updates date and status badge
