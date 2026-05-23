# Money Tracker — Phase 4.1 Design Spec
Date: 2026-05-23

## Scope

Phase 4.1 polishes the app interface with four focused changes: a shared TypePickerDropdown replacing segmented controls, a 3-column category grid, a proper picker close animation fix, and a better DatePickerSheet time input. No new routes. No data model changes.

**In scope:**
- New `TypePickerDropdown` shared component — floating dropdown triggered by "Expense ▼" title
- `CategorySelectionPage`: header uses `TypePickerDropdown`, grid becomes 3 columns
- `TransactionPage`: header replaces `SegmentedControl` with `TypePickerDropdown`
- All pickers: fix close (exit) animation via `isOpen` prop pattern
- All pickers: background uses `var(--bg)` CSS variable instead of hardcoded `#131320`
- `DatePickerSheet`: replace `<select>` time inputs with `react-mobile-picker` wheels
- `DatePickerSheet`: fix calendar day misalignment

**Out of scope:**
- Any Phase 4 items not listed above
- New routes or data model changes

---

## New Component: TypePickerDropdown

`src/components/ui/TypePickerDropdown.tsx`

### Props

```ts
{
  value: 'expense' | 'income' | 'transfer'
  onChange: (type: 'expense' | 'income' | 'transfer') => void
}
```

### Behavior

Renders a centered inline button showing the current type label + `fa-chevron-down` icon. On click, a floating dropdown appears absolutely positioned below the button. The dropdown contains three rows: Expense, Income, Transfer. The active row shows a `fa-circle-check` icon (accent color). Clicking a row calls `onChange` and closes the dropdown. Clicking outside closes the dropdown (document `mousedown` listener, cleaned up on unmount).

### Visual spec

Button: `text-base font-bold text-white` + `fa-chevron-down text-white/40 text-[11px]`, gap-2, no border, no background.

Dropdown: absolute, `top-full mt-1`, centered via `left-1/2 -translate-x-1/2`, width `160px`, `rounded-2xl border border-white/[0.1] bg-[var(--bg)] shadow-[0_8px_24px_rgba(0,0,0,0.5)]`, padding `p-1.5`.

Each row: `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium`. Active: `bg-[var(--accent)]/[0.12] text-[var(--accent-light)] font-bold`. Inactive: `text-white/70`.

The button wrapper needs `position: relative` so the dropdown positions correctly.

### Transfer special case

Calling `onChange('transfer')` works the same as any other type. The caller decides what to do:
- `CategorySelectionPage`: navigates to `/transaction/new?type=transfer`
- `TransactionPage`: updates draft type to `'transfer'`

---

## CategorySelectionPage Changes

### Header

Remove the tab bar (`div.flex.gap-1.rounded-xl...` with Expense/Income/Transfer buttons). Replace `<h1>New Transaction</h1>` with `<TypePickerDropdown value={type} onChange={handleTypeChange} />`. The header `div` wrapper needs `position: relative` for dropdown positioning.

### Grid

Change `grid-cols-2 gap-3` → `grid-cols-3 gap-2.5`.

Each cell: `px-4 py-5` → `px-2 py-3.5`. Icon: `h-12 w-12 rounded-2xl` → `h-11 w-11 rounded-xl`. Label: `text-sm` → `text-[12px]`.

### Transfer handling

`handleTypeChange` already navigates to `/transaction/new?type=transfer` when type is `'transfer'`. No change needed — `TypePickerDropdown.onChange` fires and `handleTypeChange` handles the routing.

---

## TransactionPage Changes

In the header, replace:

```tsx
<SegmentedControl
  value={type}
  onChange={(v) => updateDraft({ type: v as TransactionType })}
  segments={[...]}
/>
```

With:

```tsx
<TypePickerDropdown
  value={type}
  onChange={(v) => updateDraft({ type: v as TransactionType })}
/>
```

No other changes to `TransactionPage`.

---

## Picker Animation Fix

### Problem

All pickers (`RepeatPicker`, `WalletPicker`, `CurrencyPicker`, `DatePickerSheet`, `CategoryPicker`) are conditionally mounted from the parent. Their internal `AnimatePresence` unmounts along with the component, so exit animations never fire.

### Solution — `isOpen` prop pattern

Each picker receives a new `isOpen: boolean` prop. The parent always renders the picker (no conditional mount). The picker's internal `AnimatePresence` wraps `{isOpen && (<>backdrop + sheet</>)}` so it can observe the transition from `true` → `false` and play the exit animation.

### Changes per file

**`RepeatPicker`**, **`WalletPicker`**, **`CurrencyPicker`**, **`DatePickerSheet`**:
- Add `isOpen: boolean` to props
- Wrap existing backdrop + sheet in `<AnimatePresence>{isOpen && (<>...</>)}</AnimatePresence>`
- Parent: change `{isOpen && <Picker .../>}` → `<Picker isOpen={isOpen} .../>`

**`CategoryPicker`** (full-screen slide-up):
- Same `isOpen` prop pattern
- `AnimatePresence` already present — wrap the `motion.div` in `{isOpen && ...}`
- Parent (`TransactionPage`): always render `<CategoryPicker isOpen={...} />`

### Background color

In all pickers, change `bg-[#131320]` → `bg-[var(--bg)]`. This applies to the sheet `motion.div` in each picker.

---

## DatePickerSheet Changes

### Time picker — replace selects with wheels

Replace the two `<select>` elements with a single `react-mobile-picker` component (same library used in `RepeatPicker`).

**Picker value shape:**

```ts
type TimeValue = { hour: string; minute: string }
```

Initialize from `value.getHours()` and `value.getMinutes()`, rounding minute to nearest 15.

**Options:**
- `hour`: `Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))` — `"00"` to `"23"`
- `minute`: `["00", "15", "30", "45"]`

**Layout:** Two-column grid, same styling as RepeatPicker custom picker — `rounded-xl border border-white/[0.07] bg-white/[0.04]`, label above each column (`text-[10px] uppercase tracking-[1px] text-white/30`), `Picker` with `height={120} itemHeight={40} wheelMode="natural"`.

**On confirm:** `result.setHours(Number(pickerValue.hour), Number(pickerValue.minute), 0, 0)`.

### Calendar misalignment fix

Add `w-8` to the `day` classname in `DayPicker` classNames config:

```ts
day: 'text-center w-8',
```

This gives each date cell the same fixed width as the weekday header cells (`weekday: '... w-8 ...'`), aligning columns correctly.

---

## Standardized Page Headers

All pages adopt the 3-column grid header pattern already used by `CategorySelectionPage` and `TransactionPage`. `CategorySelectionPage` and `TransactionPage` require no changes.

### Header structure

```tsx
<header className="grid grid-cols-[36px_1fr_36px] items-center gap-3">
  <button
    aria-label="Back"
    onClick={() => backNavigate(...)}
    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300"
    type="button"
  >
    <Icon name="fa-chevron-left" />
  </button>
  <h1 className="text-center text-base font-bold">{title}</h1>
  <div />
</header>
```

Pages with no right-side action use `<div />` as the third column placeholder.

### Pages to update

| Page | Old pattern | New centered title |
|---|---|---|
| `WalletsPage` | text-link back + large left h1 | "Wallets" |
| `WalletFormPage` | text-link back + large left h1 | "New Wallet" / "Edit Wallet" |
| `CategoriesPage` | text-link back + large left h1 | "Categories" |
| `CategoryFormPage` | text-link back + large left h1 | "New Category" / "Edit Category" |
| `CurrenciesPage` | text-link back + large left h1 | "Currencies" |
| `CurrencyFormPage` | text-link back + large left h1 | "New Currency" / "Edit Currency" |
| `ThemePage` | text-link back + large left h1 | "Theme" |
| `WalletDetailPage` | flex layout, `text-lg` title | wallet name |

`WalletFormPage` and `CategoryFormPage` derive the title from existing logic (new vs edit mode).

---

## File Changes Summary

| File | Change |
|---|---|
| `src/components/ui/TypePickerDropdown.tsx` | New — floating dropdown type picker |
| `src/features/transaction/CategorySelectionPage.tsx` | Replace tab bar with `TypePickerDropdown`, grid 3-col, smaller cells |
| `src/features/transaction/TransactionPage.tsx` | Replace `SegmentedControl` with `TypePickerDropdown` |
| `src/features/transaction/RepeatPicker.tsx` | Add `isOpen` prop, fix exit animation, bg `var(--bg)` |
| `src/features/transaction/WalletPicker.tsx` | Add `isOpen` prop, fix exit animation, bg `var(--bg)` |
| `src/features/transaction/CurrencyPicker.tsx` | Add `isOpen` prop, fix exit animation, bg `var(--bg)` |
| `src/features/transaction/DatePickerSheet.tsx` | Add `isOpen` prop, fix exit animation, bg `var(--bg)`, wheel time picker, calendar day width fix |
| `src/features/transaction/CategoryPicker.tsx` | Add `isOpen` prop, fix exit animation, bg `var(--bg)` |
| `src/features/settings/WalletsPage.tsx` | Standardized 3-col grid header |
| `src/features/settings/WalletFormPage.tsx` | Standardized 3-col grid header |
| `src/features/settings/CategoriesPage.tsx` | Standardized 3-col grid header |
| `src/features/settings/CategoryFormPage.tsx` | Standardized 3-col grid header |
| `src/features/settings/CurrenciesPage.tsx` | Standardized 3-col grid header |
| `src/features/settings/CurrencyFormPage.tsx` | Standardized 3-col grid header |
| `src/features/settings/ThemePage.tsx` | Standardized 3-col grid header |
| `src/features/balance/WalletDetailPage.tsx` | Standardized 3-col grid header |

---

## Testing

- `TypePickerDropdown`: renders current type label; opens dropdown on click; closes on outside click; calls `onChange` with correct type
- `CategorySelectionPage`: grid renders 3 columns; `TypePickerDropdown` replaces tab bar; Transfer triggers navigation
- `TransactionPage`: `TypePickerDropdown` in header, selecting type updates draft
- Picker exit animation: visual only — no unit tests needed
- `DatePickerSheet` time wheels: initial values match input date; confirm builds correct date with selected hour/minute
- Calendar alignment: visual only
- Header standardization: visual only — all pages show centered title and icon back button

---

## Acceptance Criteria

- Tapping "Expense ▼" in `CategorySelectionPage` opens floating dropdown with 3 type options
- Tapping "Expense ▼" in `TransactionPage` opens same dropdown; selecting updates type
- Transfer selection in dropdown navigates correctly from `CategorySelectionPage`; updates type in `TransactionPage`
- Category grid shows 3 columns
- All bottom sheet pickers slide down (reverse spring) when closed
- Picker backgrounds match app background theme color
- `DatePickerSheet` shows two scroll wheels for hour and minute instead of dropdowns
- Calendar day columns align with weekday headers
- All pages show icon-only square back button and centered title in 3-column header
