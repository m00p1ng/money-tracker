# Phase 4.2 Design

Date: 2026-05-23

## Scope

Six targeted changes across CategorySelectionPage, TransactionPage, DatePickerSheet, BalancePage, and WalletDetailPage.

---

## 1. CategorySelectionPage — Lock type picker when editing existing item

### Problem
When the user navigates to CategorySelectionPage to change or add a category on an existing draft (via `changingIndex` or `addCategory=true` query params), the TypePickerDropdown still opens and allows switching type. This is incorrect — the type is already fixed by the parent draft.

### Change
Add a `locked?: boolean` prop to `TypePickerDropdown` in `src/components/ui/TypePickerDropdown.tsx`.

- When `locked={true}`: button click is a no-op, chevron-down icon is hidden or visually dimmed (opacity ~30%), no dropdown renders.
- When `locked={false}` (default): existing behavior unchanged.

In `CategorySelectionPage`, compute:
```ts
const isLocked = isAddCategory || changingIndex !== null
```
Pass `locked={isLocked}` to `<TypePickerDropdown>`.

### Files
- `src/components/ui/TypePickerDropdown.tsx` — add `locked` prop
- `src/features/transaction/CategorySelectionPage.tsx` — pass `locked`

---

## 2. TransactionPage — Clear items on type change

### Problem
Switching transaction type (e.g. expense → income) preserves the existing category items, which belong to the previous type and are semantically invalid for the new type.

### Change
In `TransactionPage`, update the `TypePickerDropdown` onChange handler:

```ts
onChange={(v) => updateDraft({ type: v as TransactionType, items: [], focusedIndex: null })}
```

This clears all items and resets calculator focus whenever the type changes.

### Files
- `src/features/transaction/TransactionPage.tsx` — update onChange handler

---

## 3. DatePickerSheet — Full 00–59 minute range

### Problem
Minute picker only shows `['00', '15', '30', '45']`, preventing precise time entry.

### Change
Replace `MINUTE_OPTIONS` constant:

```ts
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
```

Remove `roundMinuteTo15`. Initial picker value uses exact minute:

```ts
minute: String(value.getMinutes()).padStart(2, '0'),
```

### Files
- `src/features/transaction/DatePickerSheet.tsx`

---

## 4. BalancePage — Bar graph without card wrapper, hide empty sections

### Changes

**Remove Card wrapper from bar graph:**  
The Assets/Debt bars currently sit inside a `<Card>`. Remove the `<Card>` wrapper; render the bar rows directly in the page's `space-y-5` flow.

**Animate bar fills:**  
Wrap bar fill `<div>` elements with `motion.div` from Framer Motion:
- `initial={{ width: 0 }}`
- `animate={{ width: '<computed-percentage>' }}`
- `transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.1 }}`

Assets bar always animates to `100%`. Debt bar animates to `${Math.min((debt / assets) * 100, 100)}%` (or `100%` when assets = 0).

**Hide empty sections:**  
Remove the empty-state `<Card>` renders. Conditionally render entire sections:

```tsx
{paymentWallets.length > 0 && (
  <section>...</section>
)}
{creditCards.length > 0 && (
  <section>...</section>
)}
```

### Files
- `src/features/balance/BalancePage.tsx`

---

## 5. WalletDetailPage — Date format, preset sheet, bar animation, edit transaction

### 5a. Date label format

Add a local helper:

```ts
function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const monthName = new Date(Date.UTC(year, month - 1, 1))
    .toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })
  return `${day} ${monthName} ${year}`
}
```

Replace `{range.start}` → `{formatDateLabel(range.start)}` and `{range.end}` → `{formatDateLabel(range.end)}`.

### 5b. Ellipsis button → preset bottom sheet

**Add `last-90d` preset:**

In `src/lib/dateRange.ts`:
- Add `'last-90d'` to `DateRangePreset` union type
- Add case in `getPresetRange`: `{ start: toDateOnly(addDays(now, -89)), end: toDateOnly(now) }`

**Preset sheet:**  
Add a `isPresetSheetOpen` state boolean. Add ellipsis button (`fa-ellipsis`) next to the Begin/End date cells (right side of the row). Clicking opens the sheet.

The sheet is a bottom sheet (Framer Motion slide-up, same pattern as `DatePickerSheet`):
- Backdrop + slide-up panel
- Title: "Date Range"
- List of preset buttons (full-width, one per row):
  - Last 7 Days (`last-7d`)
  - Last 30 Days (`last-30d`)
  - Last 90 Days (`last-90d`)
  - This Month (`this-month`)
  - Last Month (`last-month`)
  - This Year (`this-year`)
  - Last Year (`last-year`)
- Active preset highlighted (same emerald style as chip)
- Clicking a preset sets `setPreset(value)` and closes sheet

Update `PRESETS` array in `WalletDetailPage` to include `{ label: 'Last 90d', value: 'last-90d' }` for the chip row as well.

### 5c. Bar graph without card wrapper + animation

Same as BalancePage §4:
- Remove `<Card>` wrapper from payment-account bar block
- Animate bar fills with `motion.div`, `initial={{ width: 0 }}`, spring transition

Credit card stats cards (`grid-cols-3`) and usage bar remain as-is (they are not the "bar graph" being changed).

### 5d. Click transaction → edit

Wrap each transaction row `<Card>` in a `<Link to={/transaction/${row.transaction.id}}>`:

```tsx
<Link key={row.transaction.id} to={`/transaction/${row.transaction.id}`}>
  <Card className="mb-2 flex items-center gap-2.5 cursor-pointer">
    ...
  </Card>
</Link>
```

Remove `key` from `<Card>` (it moves to `<Link>`).

### Files
- `src/lib/dateRange.ts` — add `last-90d`
- `src/features/balance/WalletDetailPage.tsx` — all four sub-changes

---

## Implementation Order

1. `dateRange.ts` — add `last-90d` (no dependencies)
2. `TypePickerDropdown.tsx` — add `locked` prop
3. `DatePickerSheet.tsx` — full minute range
4. `CategorySelectionPage.tsx` — pass `locked`
5. `TransactionPage.tsx` — clear items on type change
6. `BalancePage.tsx` — remove card, animate, hide empty
7. `WalletDetailPage.tsx` — all changes (depends on dateRange update)
